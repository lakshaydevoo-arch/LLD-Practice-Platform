import { EvaluationProvider, EvaluationInput, EvaluationResult, DimensionScore, FeedbackItemInput } from './Evaluator.js';
import { z } from 'zod';

export class MockEvaluationProvider implements EvaluationProvider {
  readonly providerId = 'MOCK';

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const { problem, solution, deterministicFindings } = input;

    const strengths: string[] = [];
    const issues: FeedbackItemInput[] = [];

    // Analyze God Class / Single Responsibility
    const godClasses = solution.classes.filter((c) => {
      const resp = c.responsibility.toLowerCase();
      const methods = solution.getMethodsForClass(c.name);
      return (
        (resp.includes('and') && (resp.includes('fee') || resp.includes('pay') || resp.includes('ticket') || resp.includes('spot'))) ||
        methods.length >= 6
      );
    });

    // Check for Strategy / Abstraction
    const hasStrategyPattern =
      solution.patterns.some((p) => p.toLowerCase().includes('strategy')) ||
      solution.interfaces.some((i) => i.name.toLowerCase().includes('strategy') || i.name.toLowerCase().includes('policy'));

    const hasFactoryPattern =
      solution.patterns.some((p) => p.toLowerCase().includes('factory')) ||
      solution.classes.some((c) => c.name.toLowerCase().includes('factory'));

    const hasStatePattern =
      solution.patterns.some((p) => p.toLowerCase().includes('state')) ||
      solution.interfaces.some((i) => i.name.toLowerCase().includes('state'));

    // Check Problem-Specific Patterns & Critiques
    const slug = problem.slug;

    if (slug === 'parking-lot') {
      const parkingLotClass = solution.getClass('ParkingLot') || solution.getClass('ParkingSystem');
      const spotHierarchy = solution.classes.filter((c) => c.name.toLowerCase().includes('spot') || c.name.toLowerCase().includes('space'));
      const vehicleHierarchy = solution.classes.filter((c) => c.name.toLowerCase().includes('vehicle') || c.name.toLowerCase().includes('car') || c.name.toLowerCase().includes('bike'));

      if (spotHierarchy.length > 1 || solution.interfaces.some((i) => i.name.toLowerCase().includes('spot'))) {
        strengths.push('Clean spot classification hierarchy cleanly isolates physical parking spot characteristics.');
      }

      if (vehicleHierarchy.length > 1) {
        strengths.push('Vehicle polymorphism is leveraged to handle multiple vehicle dimensions without conditional branching.');
      }

      // Check if ParkingLot directly handles pricing
      const feeMethodInLot = parkingLotClass && solution.getMethodsForClass(parkingLotClass.name).some((m) => m.name.toLowerCase().includes('fee') || m.name.toLowerCase().includes('price') || m.name.toLowerCase().includes('pay'));
      const lotRespFee = parkingLotClass && (parkingLotClass.responsibility.toLowerCase().includes('fee') || parkingLotClass.responsibility.toLowerCase().includes('calculat'));

      if (feeMethodInLot || lotRespFee || !hasStrategyPattern) {
        issues.push({
          type: 'CRITICAL',
          category: 'COUPLING',
          problem: 'Fee calculation is directly coupled to ParkingLot or lacks dynamic Strategy abstraction.',
          whyItMatters: 'Introducing hourly, peak surge, weekend discounts, or VIP subscription rates requires directly modifying ParkingLot, violating the Open/Closed Principle.',
          suggestion: 'Extract fee computation into a pluggable PricingStrategy interface that takes ticket duration and vehicle type as inputs.',
          example: `interface PricingStrategy {
  calculateFee(ticket: ParkingTicket, vehicleType: VehicleType): Money;
}

class HourlyPricingStrategy implements PricingStrategy {
  calculateFee(ticket: ParkingTicket, vehicleType: VehicleType): Money {
    const hours = ticket.getDurationInHours();
    return new Money(hours * 20);
  }
}`,
        });
      } else {
        strengths.push('Fee calculation is decoupled via a dedicated pricing abstraction, preserving Open/Closed Principle.');
      }

      // Check for Ticket isolation
      const hasTicket = solution.hasEntity('ParkingTicket') || solution.hasEntity('Ticket');
      if (hasTicket) {
        strengths.push('ParkingTicket encapsulates session state (entry time, assigned spot, vehicle registration) effectively.');
      } else {
        issues.push({
          type: 'WARNING',
          category: 'COHESION',
          problem: 'Missing ParkingTicket abstraction.',
          whyItMatters: 'Without a ticket entity, session duration and allocated spot references must be tracked ad-hoc inside the lot or floor, bloating state.',
          suggestion: 'Introduce a ParkingTicket entity generated at entry and settled at exit.',
          example: `class ParkingTicket {
  private ticketId: string;
  private issuedAt: Date;
  private assignedSpot: ParkingSpot;
  private vehicleNumber: string;
}`,
        });
      }
    } else if (slug === 'vending-machine') {
      if (hasStatePattern) {
        strengths.push('State Pattern is effectively utilized to isolate state-dependent transitions (Idle, HasMoney, Dispensing, SoldOut).');
      } else {
        issues.push({
          type: 'CRITICAL',
          category: 'PATTERN',
          problem: 'Vending Machine does not utilize the State Pattern for state transitions.',
          whyItMatters: 'Handling money insertion, product selection, and refunds without explicit state objects results in fragile, nested if-else ladders inside the central machine.',
          suggestion: 'Introduce a VendingState interface with concrete states: IdleState, HasMoneyState, DispensingState, SoldOutState.',
          example: `interface VendingState {
  insertMoney(machine: VendingMachine, amount: number): void;
  selectProduct(machine: VendingMachine, code: string): void;
  dispense(machine: VendingMachine): void;
  refund(machine: VendingMachine): void;
}`,
        });
      }
    } else if (slug === 'elevator-system') {
      if (hasStrategyPattern) {
        strengths.push('Elevator dispatch algorithm is decoupled from car mechanics via a pluggable DispatchStrategy.');
      } else {
        issues.push({
          type: 'CRITICAL',
          category: 'EXTENSIBILITY',
          problem: 'Elevator dispatch logic is embedded directly in ElevatorController without a strategy abstraction.',
          whyItMatters: 'Switching scheduling algorithms (e.g. from FCFS to SCAN, LOOK, or shortest seek time) requires modifying controller source code.',
          suggestion: 'Extract dispatch logic into an ElevatorDispatchStrategy interface.',
          example: `interface DispatchStrategy {
  selectCar(cars: ElevatorCar[], request: HallRequest): ElevatorCar;
}`,
        });
      }
    } else if (slug === 'splitwise') {
      if (hasStrategyPattern) {
        strengths.push('Split calculation algorithms (Equal, Exact, Percentage) are abstracted via Strategy.');
      } else {
        issues.push({
          type: 'WARNING',
          category: 'EXTENSIBILITY',
          problem: 'Expense split logic lacks a Strategy interface.',
          whyItMatters: 'Supporting custom split mechanisms (e.g., shares, adjustments, unequal splits) requires mutating the core Expense class.',
          suggestion: 'Introduce a SplitStrategy interface with concrete implementations: EqualSplitStrategy, ExactSplitStrategy, PercentageSplitStrategy.',
          example: `interface SplitStrategy {
  validate(splits: Split[], totalAmount: number): boolean;
  calculateOwed(splits: Split[], totalAmount: number): Map<User, number>;
}`,
        });
      }
    }

    // Check general God Class warnings
    if (godClasses.length > 0) {
      for (const gc of godClasses) {
        issues.push({
          type: 'CRITICAL',
          category: 'COHESION',
          problem: `Entity "${gc.name}" acts as a God Class with overloaded responsibilities.`,
          whyItMatters: 'Accumulating multiple distinct concerns into one class creates tight coupling, makes unit testing difficult, and violates Single Responsibility.',
          suggestion: `Decompose "${gc.name}" into specialized collaborating entities (e.g., separate coordinators from calculators and state trackers).`,
          example: `// Split "${gc.name}" into:
// 1. Coordinator: Manages overall workflow
// 2. Storage/Registry: Tracks entities
// 3. Calculation Service: Computes business numbers`,
        });
      }
    }

    // Check Inheritance misuse
    const inheritanceRels = solution.relationships.filter((r) => r.type === 'INHERITANCE');
    if (inheritanceRels.length > 4) {
      issues.push({
        type: 'WARNING',
        category: 'COUPLING',
        problem: 'Potential over-reliance on deep inheritance hierarchies.',
        whyItMatters: 'Deep class inheritance introduces fragile base class problems. Favor Composition over Inheritance where behaviors can vary independently.',
        suggestion: 'Replace IS-A relationships with HAS-A composition where entities only need capability delegation.',
        example: `// Instead of class ElectricCar extends Car extends Vehicle extends MotorizedAsset
// Prefer: class Vehicle { private engine: Engine; private spotRequirement: SpotRequirement; }`,
      });
    }

    // Check Interface Segregation
    if (solution.interfaces.length === 0) {
      issues.push({
        type: 'WARNING',
        category: 'ABSTRACTION',
        problem: 'No interfaces defined in solution.',
        whyItMatters: 'Without interfaces, high-level policy modules depend directly on low-level concrete classes, violating the Dependency Inversion Principle.',
        suggestion: 'Define clear interface contracts for pluggable policies, payment gateways, or display observers.',
      });
    } else {
      strengths.push(`${solution.interfaces.length} interface contract(s) defined, establishing explicit abstraction boundaries.`);
    }

    // Calculate Dimensional Scores based on heuristics
    const failedCriticalCount = deterministicFindings.filter((d) => !d.passed && d.severity === 'CRITICAL').length;
    const failedWarningCount = deterministicFindings.filter((d) => !d.passed && d.severity === 'WARNING').length;

    // Structural score (0 - 10)
    let structuralScore = 10 - (failedCriticalCount * 3 + failedWarningCount * 1);
    if (structuralScore < 1) structuralScore = 1;

    // Responsibility & Cohesion score (0 - 10)
    let responsibilityScore = 8.5;
    if (godClasses.length > 0) responsibilityScore -= godClasses.length * 2.0;
    if (solution.classes.length < 3) responsibilityScore -= 1.5;
    responsibilityScore = Math.max(1, Math.min(10, responsibilityScore));

    // Abstraction score (0 - 10)
    let abstractionScore = 6.0;
    if (solution.interfaces.length >= 1) abstractionScore += 2.0;
    if (solution.interfaces.length >= 2) abstractionScore += 1.0;
    if (hasStrategyPattern || hasStatePattern) abstractionScore += 1.0;
    abstractionScore = Math.max(1, Math.min(10, abstractionScore));

    // Relationships score (0 - 10)
    let relationshipsScore = 8.0;
    const compositionCount = solution.relationships.filter((r) => r.type === 'COMPOSITION' || r.type === 'AGGREGATION').length;
    if (compositionCount > 0) relationshipsScore += 1.0;
    if (inheritanceRels.length > 3) relationshipsScore -= 1.5;
    relationshipsScore = Math.max(1, Math.min(10, relationshipsScore));

    // Extensibility score (0 - 10)
    let extensibilityScore = 7.0;
    if (hasStrategyPattern || hasStatePattern || hasFactoryPattern) extensibilityScore += 2.0;
    if (issues.some((i) => i.category === 'EXTENSIBILITY' || i.category === 'COUPLING')) extensibilityScore -= 1.5;
    extensibilityScore = Math.max(1, Math.min(10, extensibilityScore));

    // Patterns score (0 - 10)
    let patternsScore = 6.5;
    if (solution.patterns.length > 0) patternsScore += 1.5;
    if (solution.explanation.length > 50) patternsScore += 1.5;
    patternsScore = Math.max(1, Math.min(10, patternsScore));

    const dimensions: DimensionScore[] = [
      {
        name: 'Structural Correctness',
        score: Number(structuralScore.toFixed(1)),
        weight: 0.20,
        reasoning: failedCriticalCount === 0
          ? 'Solution satisfies referential integrity and defines core problem entities.'
          : `Deterministic checks flagged ${failedCriticalCount} critical structural issue(s).`,
        suggestions: deterministicFindings.filter((f) => !f.passed).map((f) => f.message),
      },
      {
        name: 'Responsibility & Cohesion',
        score: Number(responsibilityScore.toFixed(1)),
        weight: 0.20,
        reasoning: godClasses.length === 0
          ? 'Entities demonstrate focused single responsibilities with good cohesion.'
          : `Identified ${godClasses.length} class(es) with broad, mixed responsibilities.`,
        suggestions: godClasses.map((g) => `Decompose ${g.name} into smaller cohesive classes.`),
      },
      {
        name: 'Abstraction & Interfaces',
        score: Number(abstractionScore.toFixed(1)),
        weight: 0.15,
        reasoning: solution.interfaces.length > 0
          ? 'Explicit interface boundaries separate public contracts from concrete implementations.'
          : 'Low abstraction density; concrete classes are directly coupled.',
        suggestions: ['Introduce interface contracts for pluggable policies and strategies.'],
      },
      {
        name: 'Relationships & Decoupling',
        score: Number(relationshipsScore.toFixed(1)),
        weight: 0.15,
        reasoning: 'Relational graph evaluates composition vs inheritance distribution.',
        suggestions: ['Favor composition over inheritance to reduce class hierarchy coupling.'],
      },
      {
        name: 'Extensibility & SOLID',
        score: Number(extensibilityScore.toFixed(1)),
        weight: 0.15,
        reasoning: hasStrategyPattern
          ? 'Design accommodates future behavioral changes without mutating core classes (Open/Closed Principle).'
          : 'Extensibility is limited; adding new requirements requires altering existing classes.',
        suggestions: ['Utilize Strategy or Factory patterns to enable open-for-extension design.'],
      },
      {
        name: 'Patterns & Design Rationale',
        score: Number(patternsScore.toFixed(1)),
        weight: 0.15,
        reasoning: solution.explanation.length > 30
          ? 'Learner provided rationale explaining architectural trade-offs and pattern choices.'
          : 'Brief or missing design explanation; rationale should articulate key decisions.',
        suggestions: ['Explain trade-offs between memory, complexity, and extensibility.'],
      },
    ];

    // Calculate composite weighted overall score
    const totalWeighted = dimensions.reduce((acc, d) => acc + d.score * d.weight, 0);
    const overallScore = Number(totalWeighted.toFixed(1));

    return {
      providerId: this.providerId,
      overallScore,
      dimensions,
      strengths: strengths.length > 0 ? strengths : ['Core entities defined and associated.'],
      issues,
    };
  }
}

// Zod validation schema for LLM structured output
const LLMOutputSchema = z.object({
  overallScore: z.number().min(0).max(10),
  dimensions: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(10),
      weight: z.number().default(0.15),
      reasoning: z.string(),
      suggestions: z.array(z.string()).default([]),
    })
  ),
  strengths: z.array(z.string()),
  issues: z.array(
    z.object({
      type: z.enum(['STRENGTH', 'WARNING', 'CRITICAL', 'SUGGESTION']),
      category: z.enum(['STRUCTURAL', 'COUPLING', 'COHESION', 'ABSTRACTION', 'EXTENSIBILITY', 'SOLID', 'PATTERN', 'BEHAVIOUR']),
      problem: z.string(),
      whyItMatters: z.string(),
      suggestion: z.string(),
      example: z.string().nullable().optional(),
    })
  ),
});

export class LLMEvaluationProvider implements EvaluationProvider {
  readonly providerId = 'LLM_OPENAI';
  private fallbackMock = new MockEvaluationProvider();

  constructor(
    private readonly apiKey: string = process.env.OPENAI_API_KEY || '',
    private readonly model: string = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  ) {}

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    // If no API key provided, fall back transparently to Mock provider
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      console.log('[LLMEvaluationProvider] No API key detected. Falling back to MockEvaluationProvider.');
      return this.fallbackMock.evaluate(input);
    }

    try {
      const promptPayload = {
        role: 'system',
        content: `You are an expert Principal Low-Level Design (LLD) and Object-Oriented Architect evaluating a candidate solution.
Evaluate the solution across:
1. Structural Correctness & Entity Coverage
2. Responsibility & Single Responsibility Principle (Cohesion)
3. Abstraction & Interfaces (Loose Coupling)
4. Relationships (Composition over Inheritance)
5. Extensibility & Open/Closed Principle
6. Design Patterns & Justification

Output ONLY valid JSON matching this exact schema:
{
  "overallScore": 8.2,
  "dimensions": [
    { "name": "Structural Correctness", "score": 9.0, "weight": 0.20, "reasoning": "...", "suggestions": [] },
    { "name": "Responsibility & Cohesion", "score": 8.0, "weight": 0.20, "reasoning": "...", "suggestions": [] },
    { "name": "Abstraction & Interfaces", "score": 8.0, "weight": 0.15, "reasoning": "...", "suggestions": [] },
    { "name": "Relationships & Decoupling", "score": 8.5, "weight": 0.15, "reasoning": "...", "suggestions": [] },
    { "name": "Extensibility & SOLID", "score": 8.0, "weight": 0.15, "reasoning": "...", "suggestions": [] },
    { "name": "Patterns & Design Rationale", "score": 8.0, "weight": 0.15, "reasoning": "...", "suggestions": [] }
  ],
  "strengths": ["string"],
  "issues": [
    {
      "type": "CRITICAL" | "WARNING" | "SUGGESTION",
      "category": "COUPLING" | "COHESION" | "ABSTRACTION" | "EXTENSIBILITY" | "SOLID" | "PATTERN",
      "problem": "...",
      "whyItMatters": "...",
      "suggestion": "...",
      "example": "code snippet"
    }
  ]
}`,
      };

      const userMessage = {
        role: 'user',
        content: JSON.stringify({
          problem: {
            title: input.problem.title,
            requirements: input.problem.requirements,
            expectedEntities: input.problem.expectedEntities,
            constraints: input.problem.constraints,
          },
          solution: {
            classes: input.solution.classes,
            interfaces: input.solution.interfaces,
            relationships: input.solution.relationships,
            methods: input.solution.methods,
            patterns: input.solution.patterns,
            explanation: input.solution.explanation,
            optionalCode: input.solution.optionalCode,
          },
          deterministicFindings: input.deterministicFindings,
        }),
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          messages: [promptPayload, userMessage],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status ${response.status}`);
      }

      const json = (await response.json()) as any;
      const content = json?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI API');
      }

      const parsed = JSON.parse(content);
      const validated = LLMOutputSchema.parse(parsed);

      return {
        providerId: this.providerId,
        overallScore: validated.overallScore,
        dimensions: validated.dimensions,
        strengths: validated.strengths,
        issues: validated.issues.map((i) => ({
          ...i,
          example: i.example ?? null,
        })),
      };
    } catch (err) {
      console.error('[LLMEvaluationProvider] LLM call failed or schema validation failed:', err);
      console.log('[LLMEvaluationProvider] Falling back safely to MockEvaluationProvider.');
      return this.fallbackMock.evaluate(input);
    }
  }
}

export class GeminiEvaluationProvider implements EvaluationProvider {
  readonly providerId = 'LLM_GEMINI';
  private fallbackMock = new MockEvaluationProvider();

  constructor(
    private readonly apiKey: string = process.env.GEMINI_API_KEY || '',
    private readonly model: string = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  ) {}

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      console.log('[GeminiEvaluationProvider] No API key detected. Falling back to MockEvaluationProvider.');
      return this.fallbackMock.evaluate(input);
    }

    try {
      const systemInstructionText = `You are an expert Principal Low-Level Design (LLD) and Object-Oriented Architect evaluating a candidate solution.
Evaluate the solution across:
1. Structural Correctness & Entity Coverage
2. Responsibility & Single Responsibility Principle (Cohesion)
3. Abstraction & Interfaces (Loose Coupling)
4. Relationships (Composition over Inheritance)
5. Extensibility & Open/Closed Principle
6. Design Patterns & Justification

Output ONLY valid JSON matching this exact schema:
{
  "overallScore": 8.2,
  "dimensions": [
    { "name": "Structural Correctness", "score": 9.0, "weight": 0.20, "reasoning": "...", "suggestions": [] },
    { "name": "Responsibility & Cohesion", "score": 8.0, "weight": 0.20, "reasoning": "...", "suggestions": [] },
    { "name": "Abstraction & Interfaces", "score": 8.0, "weight": 0.15, "reasoning": "...", "suggestions": [] },
    { "name": "Relationships & Decoupling", "score": 8.5, "weight": 0.15, "reasoning": "...", "suggestions": [] },
    { "name": "Extensibility & SOLID", "score": 8.0, "weight": 0.15, "reasoning": "...", "suggestions": [] },
    { "name": "Patterns & Design Rationale", "score": 8.0, "weight": 0.15, "reasoning": "...", "suggestions": [] }
  ],
  "strengths": ["string"],
  "issues": [
    {
      "type": "CRITICAL" | "WARNING" | "SUGGESTION",
      "category": "COUPLING" | "COHESION" | "ABSTRACTION" | "EXTENSIBILITY" | "SOLID" | "PATTERN",
      "problem": "...",
      "whyItMatters": "...",
      "suggestion": "...",
      "example": "code snippet"
    }
  ]
}`;

      const userPayload = JSON.stringify({
        problem: {
          title: input.problem.title,
          requirements: input.problem.requirements,
          expectedEntities: input.problem.expectedEntities,
          constraints: input.problem.constraints,
        },
        solution: {
          classes: input.solution.classes,
          interfaces: input.solution.interfaces,
          relationships: input.solution.relationships,
          methods: input.solution.methods,
          patterns: input.solution.patterns,
          explanation: input.solution.explanation,
          optionalCode: input.solution.optionalCode,
        },
        deterministicFindings: input.deterministicFindings,
      });

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        this.model
      )}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstructionText }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPayload }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`);
      }

      const json = (await response.json()) as any;
      const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(content);
      const validated = LLMOutputSchema.parse(parsed);

      return {
        providerId: this.providerId,
        overallScore: validated.overallScore,
        dimensions: validated.dimensions,
        strengths: validated.strengths,
        issues: validated.issues.map((i) => ({
          ...i,
          example: i.example ?? null,
        })),
      };
    } catch (err) {
      console.error('[GeminiEvaluationProvider] Gemini call failed or schema validation failed:', err);
      console.log('[GeminiEvaluationProvider] Falling back safely to MockEvaluationProvider.');
      return this.fallbackMock.evaluate(input);
    }
  }
}

