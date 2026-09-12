# Research Note: Evaluating Low-Level Design (LLD)

## 1. The Core Problem: Why LLD Practice is Difficult to Evaluate

In modern software engineering education and interview preparation, Data Structures and Algorithms (DSA) benefit from standardized online judges (LeetCode, Codeforces, HackerRank). A DSA solution is evaluated deterministically against I/O test fixtures with clear time and space complexity boundaries. 

In contrast, **Low-Level Design (LLD)**—also referred to as Object-Oriented Design (OOD) or System Component Modeling—evaluates how effectively a developer translates ambiguous requirements into cohesive, decoupled, and extensible abstractions. Evaluating LLD poses unique structural challenges:

1. **No Single "Correct" Implementation**: Different design choices balance trade-offs differently (e.g., using a Strategy pattern vs. a State machine, or Composition over Inheritance).
2. **Execution Does Not Equal Quality**: Code that compiles and outputs correct numbers can still suffer from critical design flaws: God Classes (violating Single Responsibility), tight coupling, hidden dependencies, and fragile inheritance hierarchies.
3. **High Evaluation Latency & Subjectivity**: Traditionally, LLD feedback requires 30–45 minutes of a senior engineer's time to conduct an interactive architecture review.
4. **Lack of Structured Iteration**: Without concrete feedback on specific design dimensions (cohesion, abstraction, coupling, patterns), learners cannot systematically measure progress across attempts.

---

## 2. Landscape of Existing Approaches

| Approach | Typical Platforms | Strengths | Critical Limitations in LLD Evaluation |
| :--- | :--- | :--- | :--- |
| **I/O Execution Judges** | LeetCode, HackerRank | Objective, instantaneous, automated pass/fail | Only verifies black-box behavioral correctness. Ignores class responsibilities, interfaces, SOLID principles, and maintainability. |
| **UML / Diagramming Tools** | Lucidchart, PlantUML, Draw.io | Visual representation of entities and relationships | Purely expressive/drawing tools. No semantic evaluation, automated critique, or score generation. |
| **Raw AI Assistants / Chatbots** | ChatGPT, Claude, Copilot | Natural language interaction, broad conceptual knowledge | Suffers from hallucinations; provides unstructured, generic feedback ("Looks good! 8/10"); cannot deterministically verify relational integrity (e.g., dangling references). |
| **Static Analysis / Linters** | SonarQube, ESLint, ArchUnit | Fast deterministic rules for cyclomatic complexity and syntax errors | Lacks domain awareness. Cannot judge whether a `ParkingLot` class should delegate fee calculation to a `PricingStrategy` based on user requirements. |
| **Mock Interview Platforms** | Pramp, Interviewing.io | Human nuance, deep interactive dialogue | Expensive, unscalable, non-standardized evaluation rubrics, slow iteration cycle. |

---

## 3. Identifying the Architectural Gap

Analyzing the existing landscape reveals four clear gaps:

1. **Missing Intermediate Representation**: Asking learners to write 500 lines of boilerplate production code obscures their architectural intent behind language syntax. Conversely, free-form text lacks structural metadata.
2. **The "All-or-Nothing" AI Trap**: Relying solely on an LLM to judge a design results in flaky evaluations where basic structural checks (e.g., duplicate classes, orphan methods, unknown relationship targets) are missed or inconsistently penalized.
3. **Superficial Feedback**: Generic remarks ("Consider using design patterns") fail to teach. Learners need explainable feedback: **Problem $\rightarrow$ Why it matters $\rightarrow$ Suggested improvement $\rightarrow$ Concrete code/interface alternative**.
4. **Absence of Historical Improvement Loops**: In real-world engineering, design is iterative. Platforms must track historical attempts to visualize how a learner refactored a coupled design into an extensible, decoupled architecture.

---

## 4. Our Direction: Hybrid Structured Architecture

To address this gap, this platform implements a balanced, four-pillar approach:

```
[ Learner Solution ]
   ├── Entities & Responsibilities
   ├── Interfaces & Contracts
   ├── Relational Graph (Inheritance, Composition, etc.)
   ├── Behavioural Methods
   └── Patterns & Design Rationale
                │
                ▼
  [ Layer 1: Deterministic Engine ] ──► Validates structure, references, missing core entities
                │
                ▼
  [ Layer 2: Explainable Reasoning ] ──► Decoupled EvaluationProvider (Mock / LLM) evaluates SOLID & trade-offs
                │
                ▼
  [ Multi-Dimensional Scoring ] ──► Transparent weighted dimensions (Cohesion, Abstraction, Extensibility)
                │
                ▼
  [ Iterative Attempt History ] ──► Preserves submission snapshots for comparative mastery
```

By decoupling deterministic structural integrity from AI-assisted architectural reasoning, the platform ensures reliable, reproducible, and deeply actionable feedback that empowers learners to master low-level design.
