# AI Usage & Architectural Decision Record

This document records key design and architecture decisions made during the development of the LLD Practice Platform, specifically highlighting instances where AI proposals were evaluated, accepted, modified, or rejected using sound engineering judgement.

---

## Decision 1: Separation of Deterministic Rules from LLM Reasoning

- **Context**: Deciding how to evaluate learner solution submissions against requirements and structural correctness.
- **What AI Suggested**: 
  Pass the complete raw submission directly to an LLM with a comprehensive prompt and ask it to output validation status, syntax errors, and architectural critiques in a single step.
- **Decision**: **Rejected** full delegation to LLM; adopted a **two-phase hybrid pipeline**.
  - Phase 1: In-process deterministic rules engine (`StructuralValidationRule`, `DanglingRelationshipRule`, `MissingCoreEntityRule`, `DuplicateEntityRule`).
  - Phase 2: Reasoning provider (`EvaluationProvider` via Mock or LLM) assessing abstractions, SOLID principles, and extensibility.
- **Rationale & Engineering Judgement**:
  LLMs are probabilistic and notoriously inconsistent at rigorous referential integrity checks (e.g., verifying that 15 relationships all map to valid class names, or detecting subtle circular inheritance). Furthermore, relying on an external API for basic validation increases latency and cost. By handling structural checks deterministically in code:
  1. We guarantee 100% precision on structural integrity.
  2. The LLM prompt can be enriched with deterministic findings (`deterministicFindings: [...]`), focusing the model's reasoning on architectural trade-offs rather than basic linting.

---

## Decision 2: Strategy Pattern for Evaluation Providers (`EvaluationProvider`)

- **Context**: Integrating AI evaluation capabilities into the backend service layer.
- **What AI Suggested**: 
  Directly integrate the OpenAI / Claude SDK inside `EvaluationService` with a boolean flag or conditional `if (process.env.OPENAI_API_KEY) { callOpenAI(); } else { return fallback; }`.
- **Decision**: **Rejected** direct coupling; implemented the **Strategy and Adapter Pattern** via an `EvaluationProvider` interface.
  ```typescript
  export interface EvaluationProvider {
    readonly providerId: string;
    evaluate(input: EvaluationInput): Promise<EvaluationResult>;
  }
  ```
- **Rationale & Engineering Judgement**:
  Directly embedding vendor SDK calls into the application service violates the Dependency Inversion Principle (DIP) and Open/Closed Principle (OCP). By establishing an explicit provider contract:
  1. The platform works out-of-the-box in zero-dependency environments using `MockEvaluationProvider`, ensuring reliable demos, local dev, and CI test suites without flaky network calls or billing requirements.
  2. Adding new providers (`LLMEvaluationProvider`, `AnthropicProvider`, `CustomFineTunedProvider`) requires zero changes to domain models (`Attempt`, `Problem`, `Evaluation`) or route handlers.

---

## Decision 3: Structured Solution Representation vs. Freeform Code / Text

- **Context**: Defining how learners represent and submit their object-oriented designs.
- **What AI Suggested**: 
  Provide a Monaco editor or a single large Markdown textarea where learners write pseudo-code or complete TypeScript/Java class files, which would then be parsed or compiled.
- **Decision**: **Rejected** raw compilation/freeform textarea; adopted a **Structured Entity Model** (Classes, Interfaces, Typed Relationships, Methods, Pattern Declarations, Explanation, Optional Snippet).
- **Rationale & Engineering Judgement**:
  1. **Focus on Design, Not Syntax**: LLD interviews evaluate component responsibilities, abstractions, and coupling. Requiring learners to write 400 lines of boilerplates (getters, setters, constructors) obscures design thinking and introduces syntax debugging friction.
  2. **Machine-Processable Object Model**: By capturing structured metadata (`fromEntity`, `relationshipType: COMPOSITION`, `toEntity`), the backend can construct a formal directed graph of the architecture, run topological sorts for cycles, and evaluate coupling metrics with mathematical precision.
  3. **Cognitive Ergonomics**: The structured interface mirrors how senior engineers whiteboard: identifying domain entities, drafting public contracts (interfaces), and drawing relationship vectors.

---

## Decision 4: Synchronous MVP Evaluation Flow with Async-Ready State Machine

- **Context**: Handling submission lifecycle and evaluation latency.
- **What AI Suggested**: 
  Deploy Redis and BullMQ (or Celery / Kafka) to create a distributed asynchronous worker queue with WebSockets or Server-Sent Events (SSE) to notify the frontend when evaluation finishes.
- **Decision**: **Rejected** distributed message queues for the MVP; retained an **asynchronous-ready state machine** on the `Attempt` domain model (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `EVALUATED` / `FAILED`), executed synchronously within the request pipeline.
- **Rationale & Engineering Judgement**:
  Adding Redis and background worker queues adds operational complexity (Docker containers, worker supervision, queue failures) without adding pedagogical value to a 2-day MVP. However, by modeling the attempt states explicitly:
  1. The API contract (`GET /api/attempts/:id/evaluation`) and domain model are already decoupled from execution timing.
  2. If evaluation takes longer or when transitioning to a high-scale asynchronous queue in the future, neither the database schema nor the frontend client contracts need to be redesigned.

---

## Decision 5: Transparent Weighted Dimension Scoring Model

- **Context**: Computing the overall design score from multiple assessment criteria.
- **What AI Suggested**: 
  Have the LLM output a single arbitrary floating-point number between 1.0 and 10.0 for the overall grade.
- **Decision**: **Rejected** black-box grading; implemented a **Configurable Weighted Dimension Scorer**.
- **Rationale & Engineering Judgement**:
  An arbitrary score without explainable breakdowns breeds frustration. The scoring system assigns explicit, configurable weights across six distinct engineering dimensions:
  - **Structural Correctness & Entity Coverage** (20%)
  - **Responsibility & Single Responsibility Cohesion** (20%)
  - **Abstraction & Interface Segregation** (15%)
  - **Relationships & Decoupling** (15%)
  - **Extensibility & Open/Closed Principle** (15%)
  - **Design Patterns & Justification** (15%)

  If a design has a massive God Class, the Responsibility dimension score drops predictably, and the learner can see exactly which dimension dragged down their composite score.
