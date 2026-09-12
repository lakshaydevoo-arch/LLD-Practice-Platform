import { Evaluation } from '../domain/Evaluation.js';

export interface IEvaluationRepository {
  save(evaluation: Evaluation): Promise<Evaluation>;
  findByAttemptId(attemptId: string): Promise<Evaluation | null>;
}
