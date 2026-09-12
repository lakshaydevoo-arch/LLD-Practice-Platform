import { describe, it, expect } from 'vitest';
import {
  EmptySubmissionRule,
  DuplicateEntityRule,
  DanglingRelationshipRule,
  OrphanMethodRule,
  EmptyResponsibilityRule,
  MissingCoreEntityRule,
  SelfInheritanceRule,
} from '../src/evaluation/RuleBasedEvaluator.js';
import { Problem } from '../src/domain/Problem.js';
import { Solution } from '../src/domain/Submission.js';

const mockParkingLotProblem = new Problem({
  id: 'prob-parking-lot',
  slug: 'parking-lot',
  title: 'Parking Lot Management System',
  difficulty: 'MEDIUM',
  timeEstimate: '20-25 min',
  shortDescription: 'Parking lot system',
  requirements: ['Manage spots and tickets'],
  functionalRequirements: ['Issue ticket', 'Calculate fee'],
  expectedEntities: ['ParkingLot', 'ParkingSpot', 'Vehicle', 'ParkingTicket'],
  expectedBehaviours: ['assignSpot', 'calculateFee'],
  constraints: ['Single responsibility'],
  concepts: ['Strategy Pattern'],
});

describe('Deterministic Rules Engine', () => {
  it('1. Empty submission is rejected', () => {
    const emptySolution = new Solution({
      classes: [],
      interfaces: [],
      relationships: [],
      methods: [],
      patterns: [],
      explanation: '',
    });

    const rule = new EmptySubmissionRule();
    const result = rule.evaluate(emptySolution, mockParkingLotProblem);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('CRITICAL');
  });

  it('2. Duplicate class names are detected', () => {
    const solution = new Solution({
      classes: [
        { name: 'ParkingSpot', responsibility: 'Represents parking spot', attributes: ['id'] },
        { name: 'ParkingSpot', responsibility: 'Duplicate spot', attributes: ['type'] },
      ],
      interfaces: [],
      relationships: [],
      methods: [],
      patterns: [],
      explanation: 'Test explanation',
    });

    const rule = new DuplicateEntityRule();
    const result = rule.evaluate(solution, mockParkingLotProblem);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('CRITICAL');
    expect(result.message).toContain('Duplicate entity names detected: "parkingspot"');
  });

  it('3. Relationship referencing missing/dangling class is detected', () => {
    const solution = new Solution({
      classes: [
        { name: 'ParkingLot', responsibility: 'Manages floors', attributes: ['id'] },
      ],
      interfaces: [],
      relationships: [
        { fromEntity: 'ParkingLot', type: 'COMPOSITION', toEntity: 'NonExistentFloor' },
      ],
      methods: [],
      patterns: [],
      explanation: 'Test',
    });

    const rule = new DanglingRelationshipRule();
    const result = rule.evaluate(solution, mockParkingLotProblem);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('CRITICAL');
    expect(result.message).toContain('references undefined entities: "NonExistentFloor"');
  });

  it('4. Orphan method referencing unknown owner class is detected', () => {
    const solution = new Solution({
      classes: [
        { name: 'ParkingLot', responsibility: 'Manages floors and tickets', attributes: ['floors'] },
      ],
      interfaces: [],
      relationships: [],
      methods: [
        {
          name: 'calculateFee',
          ownerClass: 'PricingEngine',
          purpose: 'Calculates fee',
          inputs: ['ticket'],
          output: 'Money',
        },
      ],
      patterns: [],
      explanation: 'Testing orphan method',
    });

    const rule = new OrphanMethodRule();
    const result = rule.evaluate(solution, mockParkingLotProblem);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('WARNING');
    expect(result.message).toContain('PricingEngine');
  });

  it('5. Empty or trivial responsibility statements are flagged', () => {
    const solution = new Solution({
      classes: [
        { name: 'ParkingLot', responsibility: 'lot', attributes: [] },
      ],
      interfaces: [],
      relationships: [],
      methods: [],
      patterns: [],
      explanation: 'Test',
    });

    const rule = new EmptyResponsibilityRule();
    const result = rule.evaluate(solution, mockParkingLotProblem);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('WARNING');
  });

  it('6. Missing core entities are detected', () => {
    const solution = new Solution({
      classes: [
        { name: 'ParkingLot', responsibility: 'High level facade', attributes: ['id'] },
      ],
      interfaces: [],
      relationships: [],
      methods: [],
      patterns: [],
      explanation: 'Only lot defined',
    });

    const rule = new MissingCoreEntityRule();
    const result = rule.evaluate(solution, mockParkingLotProblem);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Missing key domain entities expected for');
    expect(result.message).toContain('ParkingSpot');
  });

  it('7. Self-inheritance is flagged as critical', () => {
    const solution = new Solution({
      classes: [
        { name: 'Vehicle', responsibility: 'Abstract vehicle', attributes: ['plate'] },
      ],
      interfaces: [],
      relationships: [
        { fromEntity: 'Vehicle', type: 'INHERITANCE', toEntity: 'Vehicle' },
      ],
      methods: [],
      patterns: [],
      explanation: 'Self-inheriting vehicle',
    });

    const rule = new SelfInheritanceRule();
    const result = rule.evaluate(solution, mockParkingLotProblem);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('CRITICAL');
  });

  it('8. Valid well-structured solution passes all structural rules', () => {
    const validSolution = new Solution({
      classes: [
        { name: 'ParkingLot', responsibility: 'Coordinates entrances, exits, and multi-floor queries.', attributes: ['floors', 'entranceGates'] },
        { name: 'ParkingFloor', responsibility: 'Tracks individual spot occupancy per level.', attributes: ['floorNumber', 'spots'] },
        { name: 'ParkingSpot', responsibility: 'Represents physical parking slot with size and state.', attributes: ['spotId', 'isOccupied'] },
        { name: 'Vehicle', responsibility: 'Base vehicle representation with license plate and type.', attributes: ['licensePlate', 'type'] },
        { name: 'ParkingTicket', responsibility: 'Immutable session record with entry timestamp and spot.', attributes: ['ticketId', 'entryTime'] },
      ],
      interfaces: [
        { name: 'PricingStrategy', responsibility: 'Pluggable algorithm contract for duration fee calculation.', methods: ['calculateFee(ticket): Money'] },
      ],
      relationships: [
        { fromEntity: 'ParkingLot', type: 'COMPOSITION', toEntity: 'ParkingFloor' },
        { fromEntity: 'ParkingFloor', type: 'COMPOSITION', toEntity: 'ParkingSpot' },
        { fromEntity: 'ParkingTicket', type: 'ASSOCIATION', toEntity: 'ParkingSpot' },
      ],
      methods: [
        { name: 'assignSpot', ownerClass: 'ParkingLot', purpose: 'Finds vacant spot', inputs: ['Vehicle'], output: 'ParkingSpot' },
      ],
      patterns: ['Strategy', 'Factory'],
      explanation: 'Decoupled pricing strategy and composition of floors and spots.',
    });

    const emptyRule = new EmptySubmissionRule().evaluate(validSolution, mockParkingLotProblem);
    const duplicateRule = new DuplicateEntityRule().evaluate(validSolution, mockParkingLotProblem);
    const danglingRule = new DanglingRelationshipRule().evaluate(validSolution, mockParkingLotProblem);
    const orphanRule = new OrphanMethodRule().evaluate(validSolution, mockParkingLotProblem);
    const selfInheritRule = new SelfInheritanceRule().evaluate(validSolution, mockParkingLotProblem);

    expect(emptyRule.passed).toBe(true);
    expect(duplicateRule.passed).toBe(true);
    expect(danglingRule.passed).toBe(true);
    expect(orphanRule.passed).toBe(true);
    expect(selfInheritRule.passed).toBe(true);
  });
});
