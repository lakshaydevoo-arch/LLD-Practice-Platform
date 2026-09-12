import { FeedbackItem } from './Feedback.js';

export interface EvaluationDimensionProps {
  id?: string;
  name: string;
  score: number;
  weight: number;
  reasoning: string;
  suggestions: string[];
}

export class EvaluationDimension {
  readonly id?: string;
  readonly name: string;
  readonly score: number;
  readonly weight: number;
  readonly reasoning: string;
  readonly suggestions: string[];

  constructor(props: EvaluationDimensionProps) {
    this.id = props.id;
    this.name = props.name;
    this.score = props.score;
    this.weight = props.weight;
    this.reasoning = props.reasoning;
    this.suggestions = props.suggestions || [];
  }
}

export interface EvaluationProps {
  id?: string;
  attemptId: string;
  overallScore: number;
  providerUsed: string;
  createdAt?: Date;
  dimensions: EvaluationDimension[];
  feedbackItems: FeedbackItem[];
}

export class Evaluation {
  readonly id?: string;
  readonly attemptId: string;
  readonly overallScore: number;
  readonly providerUsed: string;
  readonly createdAt: Date;
  readonly dimensions: EvaluationDimension[];
  readonly feedbackItems: FeedbackItem[];

  constructor(props: EvaluationProps) {
    this.id = props.id;
    this.attemptId = props.attemptId;
    this.overallScore = props.overallScore;
    this.providerUsed = props.providerUsed;
    this.createdAt = props.createdAt ?? new Date();
    this.dimensions = props.dimensions;
    this.feedbackItems = props.feedbackItems;
  }

  getStrengths(): FeedbackItem[] {
    return this.feedbackItems.filter((item) => item.type === 'STRENGTH');
  }

  getCriticalIssues(): FeedbackItem[] {
    return this.feedbackItems.filter((item) => item.type === 'CRITICAL');
  }

  getWarnings(): FeedbackItem[] {
    return this.feedbackItems.filter((item) => item.type === 'WARNING');
  }

  getSuggestions(): FeedbackItem[] {
    return this.feedbackItems.filter((item) => item.type === 'SUGGESTION');
  }
}
