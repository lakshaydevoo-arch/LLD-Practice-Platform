import { describe, it, expect } from 'vitest';
import { DeterministicRuleEngine } from '../src/evaluation/RuleBasedEvaluator.js';
import { MockEvaluationProvider } from '../src/evaluation/AIEvaluator.js';
import { EvaluationEngine } from '../src/evaluation/EvaluationEngine.js';
import { Problem } from '../src/domain/Problem.js';
import { Solution } from '../src/domain/Submission.js';
import { EvaluationProvider, EvaluationInput, EvaluationResult } from '../src/evaluation/Evaluator.js';

const mockParkingLot = new Problem({
  id: 'prob-parking-lot',
  slug: 'parking-lot',
  title: 'Parking Lot Management System',
  difficulty: 'MEDIUM',
  timeEstimate: '20-25 min',
  shortDescription: 'Parking lot system',
  requirements: ['Manage spots and tickets', 'Dynamic pricing'],
  functionalRequirements: ['Issue ticket', 'Calculate fee'],
  expectedEntities: ['ParkingLot', 'ParkingFloor', 'ParkingSpot', 'Vehicle', 'ParkingTicket', 'PricingStrategy'],
  expectedBehaviours: ['assignSpot', 'calculateFee'],
  constraints: ['Single responsibility', 'Decoupled pricing'],
  concepts: ['Strategy Pattern'],
});

describe('Evaluation Engine & Mock Evaluator', () => {
  it('1. Mock evaluator produces realistic multi-dimensional feedback', async () => {
    const provider = new MockEvaluationProvider();
    const solution = new Solution({
      classes: [
        { name: 'ParkingLot', responsibility: 'Coordinates entrances, exits, and multi-floor queries.', attributes: ['floors'] },
        { name: 'ParkingFloor', responsibility: 'Tracks spots.', attributes: ['floorNumber'] },
        { name: 'ParkingSpot', responsibility: 'Physical slot.', attributes: ['id'] },
        { name: 'Vehicle', responsibility: 'Vehicle abstraction.', attributes: ['plate'] },
        { name: 'ParkingTicket', responsibility: 'Session record.', attributes: ['id'] },
      ],
      interfaces: [
        { name: 'PricingStrategy', responsibility: 'Computes fee dynamically.', methods: ['calculateFee()'] },
      ],
      relationships: [
        { fromEntity: 'ParkingLot', type: 'COMPOSITION', toEntity: 'ParkingFloor' },
        { fromEntity: 'ParkingFloor', type: 'COMPOSITION', toEntity: 'ParkingSpot' },
      ],
      methods: [],
      patterns: ['Strategy'],
      explanation: 'Decoupled pricing strategy using Strategy Pattern to adhere to OCP.',
    });

    const result = await provider.evaluate({
      problem: mockParkingLot,
      solution,
      deterministicFindings: [],
    });

    expect(result.overallScore).toBeGreaterThan(7.0);
    expect(result.dimensions.length).toBe(6);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.dimensions.some((d) => d.name === 'Responsibility & Cohesion')).toBe(true);
  });

  it('2. Detects coupled fee calculation (God Class pattern) in weak solution', async () => {
    const provider = new MockEvaluationProvider();
    const weakSolution = new Solution({
      classes: [
        {
          name: 'ParkingLot',
          responsibility: 'Handles vehicle entry, spot allocation, fee calculation, payment processing, and ticket printing all in one.',
          attributes: ['spots', 'revenue'],
        },
      ],
      interfaces: [],
      relationships: [],
      methods: [
        { name: 'calculateFee', ownerClass: 'ParkingLot', purpose: 'Calculate cost', inputs: ['ticket'], output: 'number' },
      ],
      patterns: [],
      explanation: 'Simple parking lot handling everything.',
    });

    const result = await provider.evaluate({
      problem: mockParkingLot,
      solution: weakSolution,
      deterministicFindings: [],
    });

    expect(result.overallScore).toBeLessThan(7.0);
    const hasCoupledIssue = result.issues.some(
      (i) => i.category === 'COUPLING' || i.problem.toLowerCase().includes('fee') || i.category === 'COHESION'
    );
    expect(hasCoupledIssue).toBe(true);
  });

  it('3. EvaluationEngine combines deterministic rule violations and AI findings into feedback', async () => {
    const ruleEngine = new DeterministicRuleEngine();
    const provider = new MockEvaluationProvider();
    const engine = new EvaluationEngine(ruleEngine, provider);

    // Solution with a dangling relationship
    const solutionWithDanglingRel = new Solution({
      classes: [
        { name: 'ParkingLot', responsibility: 'Manages lots', attributes: [] },
      ],
      interfaces: [],
      relationships: [
        { fromEntity: 'ParkingLot', type: 'COMPOSITION', toEntity: 'MissingFloorClass' },
      ],
      methods: [],
      patterns: [],
      explanation: '',
    });

    const evaluation = await engine.runEvaluation('attempt-123', mockParkingLot, solutionWithDanglingRel);

    expect(evaluation.attemptId).toBe('attempt-123');
    // Check that the dangling relationship deterministic issue was included in feedbackItems
    const criticalIssues = evaluation.getCriticalIssues();
    const foundDanglingFeedback = criticalIssues.some((c) =>
      c.problem.includes('MissingFloorClass') || c.category === 'COUPLING' || c.category === 'STRUCTURAL'
    );
    expect(foundDanglingFeedback).toBe(true);
  });

  it('4. Provider failure is handled gracefully without crashing engine caller', async () => {
    class FailingProvider implements EvaluationProvider {
      readonly providerId = 'FAILING';
      async evaluate(_input: EvaluationInput): Promise<EvaluationResult> {
        throw new Error('LLM Service Unavailable (503)');
      }
    }

    const ruleEngine = new DeterministicRuleEngine();
    const engine = new EvaluationEngine(ruleEngine, new FailingProvider());

    const validSolution = new Solution({
      classes: [{ name: 'ParkingLot', responsibility: 'Test lot', attributes: [] }],
      interfaces: [],
      relationships: [],
      methods: [],
      patterns: [],
      explanation: 'test',
    });

    await expect(engine.runEvaluation('att-1', mockParkingLot, validSolution)).rejects.toThrow(
      'LLM Service Unavailable'
    );
  });
});
