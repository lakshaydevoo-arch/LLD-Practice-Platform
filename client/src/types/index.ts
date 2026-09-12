export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'FAILED';
export type RelationshipType = 'ASSOCIATION' | 'AGGREGATION' | 'COMPOSITION' | 'INHERITANCE' | 'DEPENDENCY';
export type FeedbackType = 'STRENGTH' | 'WARNING' | 'CRITICAL' | 'SUGGESTION';
export type FeedbackCategory = 'STRUCTURAL' | 'COUPLING' | 'COHESION' | 'ABSTRACTION' | 'EXTENSIBILITY' | 'SOLID' | 'PATTERN' | 'BEHAVIOUR';

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  timeEstimate: string;
  shortDescription: string;
  requirements: string[];
  functionalRequirements: string[];
  expectedEntities: string[];
  expectedBehaviours: string[];
  constraints: string[];
  concepts: string[];
  createdAt: string;
}

export interface ClassDefinition {
  name: string;
  responsibility: string;
  attributes: string[];
}

export interface InterfaceDefinition {
  name: string;
  responsibility: string;
  methods: string[];
}

export interface Relationship {
  fromEntity: string;
  type: RelationshipType;
  toEntity: string;
}

export interface MethodDefinition {
  name: string;
  ownerClass: string;
  purpose: string;
  inputs: string[];
  output: string;
}

export interface SolutionData {
  classes: ClassDefinition[];
  interfaces: InterfaceDefinition[];
  relationships: Relationship[];
  methods: MethodDefinition[];
  patterns: string[];
  explanation: string;
  optionalCode?: string | null;
}

export interface EvaluationDimension {
  id?: string;
  name: string;
  score: number;
  weight: number;
  reasoning: string;
  suggestions: string[];
}

export interface FeedbackItem {
  id?: string;
  type: FeedbackType;
  category: FeedbackCategory;
  problem: string;
  whyItMatters: string;
  suggestion: string;
  example?: string | null;
}

export interface Evaluation {
  id: string;
  attemptId: string;
  overallScore: number;
  providerUsed: string;
  createdAt: string;
  dimensions: EvaluationDimension[];
  feedbackItems: FeedbackItem[];
}

export interface Attempt {
  id: string;
  problemId: string;
  userId: string;
  status: AttemptStatus;
  createdAt: string;
  updatedAt: string;
  solution?: SolutionData | null;
  evaluation?: Evaluation | null;
  problem?: Problem;
}
