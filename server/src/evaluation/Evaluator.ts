import { Problem } from '../domain/Problem.js';
import { Solution } from '../domain/Submission.js';
import { FeedbackType, FeedbackCategory } from '../domain/Feedback.js';

export interface RuleResult {
  passed: boolean;
  ruleName: string;
  category: 'STRUCTURAL' | 'COHESION' | 'RELATIONSHIPS' | 'ENTITIES';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  details?: Record<string, unknown>;
}

export interface EvaluationRule {
  readonly name: string;
  evaluate(solution: Solution, problem: Problem): RuleResult;
}

export interface EvaluationInput {
  problem: Problem;
  solution: Solution;
  deterministicFindings: RuleResult[];
}

export interface DimensionScore {
  name: string;
  score: number;
  weight: number;
  reasoning: string;
  suggestions: string[];
}

export interface FeedbackItemInput {
  type: FeedbackType;
  category: FeedbackCategory;
  problem: string;
  whyItMatters: string;
  suggestion: string;
  example?: string | null;
}

export interface EvaluationResult {
  providerId: string;
  overallScore: number;
  dimensions: DimensionScore[];
  strengths: string[];
  issues: FeedbackItemInput[];
}

export interface EvaluationProvider {
  readonly providerId: string;
  evaluate(input: EvaluationInput): Promise<EvaluationResult>;
}
