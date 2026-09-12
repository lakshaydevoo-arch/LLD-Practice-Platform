import { Solution } from './Submission.js';
import { Evaluation } from './Evaluation.js';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'FAILED';

export interface AttemptProps {
  id: string;
  problemId: string;
  userId: string;
  status: AttemptStatus;
  createdAt?: Date;
  updatedAt?: Date;
  solution?: Solution | null;
  evaluation?: Evaluation | null;
}

export class Attempt {
  readonly id: string;
  readonly problemId: string;
  readonly userId: string;
  private _status: AttemptStatus;
  readonly createdAt: Date;
  private _updatedAt: Date;
  solution?: Solution | null;
  evaluation?: Evaluation | null;

  constructor(props: AttemptProps) {
    this.id = props.id;
    this.problemId = props.problemId;
    this.userId = props.userId;
    this._status = props.status;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
    this.solution = props.solution ?? null;
    this.evaluation = props.evaluation ?? null;
  }

  get status(): AttemptStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  transitionTo(newStatus: AttemptStatus): void {
    const validTransitions: Record<AttemptStatus, AttemptStatus[]> = {
      DRAFT: ['SUBMITTED'],
      SUBMITTED: ['EVALUATING', 'FAILED'],
      EVALUATING: ['EVALUATED', 'FAILED'],
      EVALUATED: [],
      FAILED: ['EVALUATING'], // Allow retry evaluation
    };

    const allowed = validTransitions[this._status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(`Invalid attempt transition from ${this._status} to ${newStatus}`);
    }

    this._status = newStatus;
    this._updatedAt = new Date();
  }

  attachSolution(solution: Solution): void {
    this.solution = solution;
    this._updatedAt = new Date();
  }

  attachEvaluation(evaluation: Evaluation): void {
    this.evaluation = evaluation;
    this._status = 'EVALUATED';
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      userId: this.userId,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
      solution: this.solution,
      evaluation: this.evaluation,
    };
  }
}
