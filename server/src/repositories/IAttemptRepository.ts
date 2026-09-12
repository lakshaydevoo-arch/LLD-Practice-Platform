import { Attempt, AttemptStatus } from '../domain/Attempt.js';
import { Solution } from '../domain/Submission.js';

export interface IAttemptRepository {
  create(props: { id?: string; problemId: string; userId: string; status?: AttemptStatus }): Promise<Attempt>;
  findById(id: string): Promise<Attempt | null>;
  findByProblemId(problemId: string, userId?: string): Promise<Attempt[]>;
  findAll(userId?: string): Promise<Attempt[]>;
  updateStatus(id: string, status: AttemptStatus): Promise<Attempt>;
  saveSolution(attemptId: string, solution: Solution): Promise<Solution>;
}
