export type FeedbackType = 'STRENGTH' | 'WARNING' | 'CRITICAL' | 'SUGGESTION';

export type FeedbackCategory =
  | 'STRUCTURAL'
  | 'COUPLING'
  | 'COHESION'
  | 'ABSTRACTION'
  | 'EXTENSIBILITY'
  | 'SOLID'
  | 'PATTERN'
  | 'BEHAVIOUR';

export interface FeedbackItemProps {
  id?: string;
  evaluationId?: string;
  type: FeedbackType;
  category: FeedbackCategory;
  problem: string;
  whyItMatters: string;
  suggestion: string;
  example?: string | null;
}

export class FeedbackItem {
  readonly id?: string;
  readonly evaluationId?: string;
  readonly type: FeedbackType;
  readonly category: FeedbackCategory;
  readonly problem: string;
  readonly whyItMatters: string;
  readonly suggestion: string;
  readonly example: string | null;

  constructor(props: FeedbackItemProps) {
    this.id = props.id;
    this.evaluationId = props.evaluationId;
    this.type = props.type;
    this.category = props.category;
    this.problem = props.problem;
    this.whyItMatters = props.whyItMatters;
    this.suggestion = props.suggestion;
    this.example = props.example ?? null;
  }
}
