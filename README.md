# LLD Arena — Low-Level Design Practice & Evaluation Platform

> An interactive, domain-driven platform where software engineers practice Object-Oriented Low-Level Design (LLD), model structured architectures, and receive explainable, multi-dimensional feedback combining deterministic structural rules with AI reasoning.

---

## 1. Why This Exists (The Problem & The Gap)

Traditional platforms (e.g. LeetCode, HackerRank) evaluate algorithmic correctness via standard input/output test fixtures. However, **Low-Level Design (LLD)** evaluates how well an engineer organizes code into decoupled, cohesive, and extensible components.

1. **Execution $\neq$ Design Quality**: Monolithic "God Classes" often pass execution tests while violating Single Responsibility and Open/Closed principles.
2. **The "All-or-Nothing" AI Trap**: Relying purely on an LLM to evaluate designs results in flaky, hallucinated reviews where basic structural errors (e.g. dangling relationship references, missing core entities) are missed or inconsistently penalized.
3. **Lack of Explainability**: Generic feedback ("Looks okay, 7/10") fails to teach. Learners need structured, explainable critique: **Problem $\rightarrow$ Why it matters $\rightarrow$ Actionable suggestion $\rightarrow$ Refactored code/interface alternative**.
4. **No Historical Iteration Loop**: Learners need to see how their design evolved from a tightly coupled draft to a clean, decoupled architecture.

**LLD Arena** bridges this gap using a **hybrid evaluation architecture**: deterministic graph/entity rules for structural integrity combined with decoupled evaluation providers for architectural reasoning.

---

## 2. Core Learner Loop

```
  ┌─────────────────┐       ┌──────────────────────┐       ┌───────────────────────┐
  │ 1. Pick Problem │ ────► │ 2. Read Requirements │ ────► │ 3. Practice Workspace │
  └─────────────────┘       └──────────────────────┘       └───────────┬───────────┘
                                                                       │
                                                                       ▼
  ┌─────────────────┐       ┌──────────────────────┐       ┌───────────────────────┐
  │ 6. Try Again /  │ ◄──── │ 5. Explainable       │ ◄──── │ 4. Hybrid Evaluation  │
  │    Refactor     │       │    Multi-Dim Feedback│       │    (Deterministic+AI) │
  └─────────────────┘       └──────────────────────┘       └───────────────────────┘
```

---

## 3. Architecture & Tech Stack

```
[ Frontend: React + TypeScript + Vite + Tailwind CSS ]
                         │
                    REST API (JSON)
                         │
                         ▼
[ Backend: Node.js + Express + TypeScript Modular Monolith ]
   ├── Presentation: Routes & Thin Controllers (Problem, Attempt, Evaluation)
   ├── Application Layer: ProblemService, AttemptService, EvaluationService
   ├── Evaluation Engine:
   │     ├── Phase 1: DeterministicRuleEngine (Referential graph, duplicate names, missing entities)
   │     ├── Phase 2: EvaluationProvider Strategy (MockEvaluationProvider | LLMEvaluationProvider)
   │     └── Phase 3: Weighted Dimension Aggregator & Feedback Item Generator
   └── Domain & Persistence: Clean Domain Models & Prisma Repositories (SQLite/PostgreSQL)
```

### Technology Matrix
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6.
- **Backend**: Node.js, Express, TypeScript (ESM), Zod schema validation.
- **Database & ORM**: Prisma ORM with SQLite (`dev.db`) for zero-external-daemon setup, fully compatible with PostgreSQL.
- **Evaluation Engine**: Strategy Pattern (`EvaluationProvider`), Chain of Rules (`EvaluationRule`), Heuristic Mock Evaluator & OpenAI-compatible LLM Provider.
- **Testing**: Vitest, Supertest.

---

## 4. Evaluation Architecture: Deterministic + AI

The evaluation pipeline guarantees determinism before reasoning:

```
[ Learner Submission ]
         │
         ├──► [ Deterministic Rules Engine ] (100% precision in-process)
         │       ├── EmptySubmissionRule
         │       ├── DuplicateEntityRule
         │       ├── DanglingRelationshipRule
         │       ├── OrphanMethodRule
         │       ├── EmptyResponsibilityRule
         │       ├── MissingCoreEntityRule
         │       └── SelfInheritanceRule
         │
         └──► [ EvaluationProvider Strategy ]
                 ├── MockEvaluationProvider (Intelligent heuristic LLD engine)
                 └── LLMEvaluationProvider (OpenAI / Claude / Gemini API with fallback)
```

### Multi-Dimensional Scoring Rubric
Scoring is transparent and weighted across 6 explicit dimensions:
1. **Structural Correctness & Referential Graph** (20%)
2. **Responsibility & Single Responsibility Cohesion** (20%)
3. **Abstraction & Interface Segregation** (15%)
4. **Relationships & Decoupling (Composition over Inheritance)** (15%)
5. **Extensibility & Open/Closed Principle** (15%)
6. **Design Patterns & Justification** (15%)

---

## 5. Getting Started & Setup

### Prerequisites
- Node.js $\ge$ 18 (Tested on v20 and v26)
- npm $\ge$ 9

### Step 1: Install Dependencies
```bash
# In backend
cd server && npm install

# In frontend
cd ../client && npm install
```

### Step 2: Database Initialization & Seeding
The backend is configured with SQLite by default (`server/dev.db`), ensuring **zero external daemons** or configuration steps are required.
```bash
cd server
npx prisma db push
npm run db:seed
```
*Seeding populates 5 rich LLD problems: Parking Lot System, State-Driven Vending Machine, Elevator Dispatch System, Splitwise Expense Sharing, and Customizable Coffee Maker.*

### Step 3: Start the Backend Server
```bash
cd server
npm run dev
```
*Server starts on `http://localhost:3001` (Health check: `http://localhost:3001/api/health`).*

### Step 4: Start the Frontend Application
```bash
cd client
npm run dev
```
*Frontend opens on `http://localhost:5173` with automatic API proxying to port 3001.*

---

## 6. Running the Automated Test Suite

The test suite validates deterministic rules, heuristic domain evaluation, resilience/failure handling, and REST endpoints:
```bash
cd server
npm test
```

### Test Suite Coverage (20 / 20 Tests Passing):
1. **`rules.test.ts`**:
   - Rejects empty submissions.
   - Detects duplicate class/interface names.
   - Catches dangling relationships referencing undefined entities.
   - Identifies orphan methods with undeclared owner classes.
   - Flags vague/empty single-responsibility statements.
   - Detects missing core problem entities.
   - Flags self-referential or circular inheritance.
   - Validates well-structured object models.
2. **`evaluation_engine.test.ts`**:
   - Heuristic evaluator produces realistic multi-dimensional feedback.
   - Correctly flags God Classes (violating SRP) in coupled designs.
   - Combines deterministic rule violations and provider findings into unified feedback items.
   - Resilience: Provider failures do not delete or corrupt the attempt.
3. **`api.test.ts`**:
   - `GET /api/health` returns ok status and provider details.
   - `GET /api/problems` lists all seeded problems.
   - `GET /api/problems/:id` retrieves problem specs and expected entities.
   - `POST /api/attempts` creates new attempt in `DRAFT` state.
   - `PUT /api/attempts/:id` saves draft solutions.
   - `POST /api/attempts/:id/submit` triggers evaluation and sets status to `EVALUATED`.
   - `GET /api/attempts/:id/evaluation` retrieves persisted score and feedback.
   - Retrying creates a new attempt record without overwriting historical attempts.

---

## 7. Environment Variables (`server/.env`)

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# Evaluation Provider Configuration
# Set to 'MOCK' for reliable, zero-API-key local execution
# Set to 'LLM' to enable OpenAI evaluation
EVALUATION_PROVIDER=MOCK
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

> **Switching to PostgreSQL**: To run against PostgreSQL, update `server/prisma/schema.prisma` datasource provider to `postgresql` and set `DATABASE_URL="postgresql://user:password@localhost:5432/lld_arena?schema=public"`.

---

## 8. 3–5 Minute Demo Walkthrough

1. **Browse Library**: Open `http://localhost:5173`. Notice the problem library cards displaying difficulty, estimated time, and key design concepts.
2. **Read Requirements**: Click **"Parking Lot Management System"**. Review requirements (multi-floor, vehicle categories, dynamic pricing, ticket tracking) and expected entities.
3. **Start Practice**: Click **"Start Practice Workspace"**.
4. **Test Suboptimal / God-Class Design**:
   - In the workspace header, click the demo preset **"+ Load Suboptimal God-Class"**.
   - Notice a monolithic `ParkingLot` class handling check-in, fee calculation, payment processing, and gates all in one.
   - Click **"Submit Solution"**.
   - **Observe Feedback**: The evaluation flags a Critical issue (`COUPLING` / `COHESION`), notes that fee calculation is directly coupled to `ParkingLot`, explains the architectural violation of OCP, and provides a refactored `PricingStrategy` interface alternative!
5. **View History & Retry**:
   - Click **"View All Attempts"** or navigate to `/history`.
   - Notice the first attempt preserved with its score (e.g. 5.8/10) and identified issues.
   - Click the **Retry** icon on Parking Lot. A fresh attempt is initialized.
6. **Test Strong Decoupled Design**:
   - In the workspace, click **"+ Load Strong Decoupled Design"**.
   - Notice the clean separation: `ParkingLot` $\rightarrow$ `ParkingFloor` $\rightarrow$ `ParkingSpot`, `PricingStrategy` interface, `ParkingAssignmentStrategy` interface, and clear relationships.
   - Click **"Submit Solution"**.
   - **Observe Verdict**: Overall score increases to **8.5+/10**, with architectural strengths recognized, no critical coupling issues, and high cohesion marks!
   - Return to **History** to confirm both attempts are preserved side-by-side, showcasing iterative improvement.

---

## 9. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and active evaluation provider |
| `GET` | `/api/problems` | List all available LLD challenges |
| `GET` | `/api/problems/:id` | Get problem specs by ID or slug |
| `POST` | `/api/attempts` | Initialize a new attempt for a problem |
| `GET` | `/api/attempts` | List all attempts (optional `?problemId=...`) |
| `GET` | `/api/attempts/:id` | Get attempt details including saved solution |
| `PUT` | `/api/attempts/:id` | Save draft solution |
| `POST` | `/api/attempts/:id/submit` | Submit solution and execute evaluation |
| `GET` | `/api/attempts/:id/evaluation` | Fetch evaluated score and feedback report |
| `POST` | `/api/attempts/:id/retry-evaluation` | Re-run evaluation on failed attempt |

---

## 10. Key LLD & Engineering Design Decisions

1. **Strategy Pattern for Evaluation (`EvaluationProvider`)**: Decoupled `MockEvaluationProvider` and `LLMEvaluationProvider` from `EvaluationService`. The application operates seamlessly with or without external AI credentials.
2. **Repository Pattern**: Abstracted database operations behind `IProblemRepository`, `IAttemptRepository`, and `IEvaluationRepository`, decoupling Prisma ORM from business domain rules.
3. **Structured Entity Representation**: Solves the "syntax over design" friction of raw code by capturing entities, interfaces, relationships, and methods as machine-verifiable relational graphs.
4. **State Machine Lifecycle**: Modeled `AttemptStatus` explicitly (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `EVALUATED` / `FAILED`), enabling synchronous MVP execution while remaining 100% prepared for asynchronous job queues.

---

## 11. Known Limitations & Future Roadmap

- **Visual UML Canvas**: Currently, relationships are selected via dropdowns; future iterations can integrate a drag-and-drop ReactFlow canvas synchronized with the entity list.
- **Side-by-Side Attempt Diffing**: Visualizing diffs between Attempt 1 and Attempt 2 to highlight refactored classes.
- **Asynchronous Worker Queue**: When traffic scales, transition evaluation calls to BullMQ / Redis workers with WebSocket progress streaming.

---

## 12. Likely Interviewer Questions & Architectural Reasoning

#### Q1: Why did you use a structured form instead of a standard code editor?
> **Answer**: LLD is about component responsibilities, abstractions, and relationships, not syntax debugging. In an interview whiteboard, candidates define entities, methods, and relationships. Capturing structured metadata enables our deterministic engine to run graph checks (e.g. cycle detection, dangling links) which would be brittle to extract from freeform text.

#### Q2: How is the evaluation provider decoupled from the domain?
> **Answer**: `EvaluationService` interacts only with the `EvaluationProvider` interface. It does not know whether the evaluation was computed by `MockEvaluationProvider` or `LLMEvaluationProvider`. If OpenAI goes down, the system gracefully falls back to the mock provider, ensuring the learner is never blocked.

#### Q3: Why did you choose SQLite over PostgreSQL for local execution?
> **Answer**: Pragmatism and reliability. Requiring PostgreSQL forces reviewers to manage local database daemons, ports, and credentials. SQLite runs embedded with zero setup. Because we used Prisma ORM and the Repository pattern, switching to PostgreSQL in staging/production requires changing only one line in `schema.prisma`.

#### Q4: How does the system prevent overwriting previous attempts?
> **Answer**: Every practice attempt creates an independent `Attempt` record linked to the `Problem` and `User`. When a learner clicks "Retry", a new `Attempt` is inserted, preserving all historical submissions and evaluations for progress tracking.
# LLD-Practice-Platform
