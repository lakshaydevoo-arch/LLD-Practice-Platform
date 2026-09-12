import { IAttemptRepository } from '../repositories/IAttemptRepository.js';
import { IProblemRepository } from '../repositories/IProblemRepository.js';
import { Attempt } from '../domain/Attempt.js';
import { Solution, SolutionProps } from '../domain/Submission.js';

export class AttemptService {
  constructor(
    private readonly attemptRepo: IAttemptRepository,
    private readonly problemRepo: IProblemRepository
  ) {}

  async createAttempt(problemId: string, userId: string = 'demo-learner-001'): Promise<Attempt> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new Error(`Problem with ID "${problemId}" not found.`);
    }

    return this.attemptRepo.create({
      problemId,
      userId,
      status: 'DRAFT',
    });
  }

  async getAttemptById(id: string): Promise<Attempt | null> {
    return this.attemptRepo.findById(id);
  }

  async getAttemptsByProblem(problemId: string, userId?: string): Promise<Attempt[]> {
    return this.attemptRepo.findByProblemId(problemId, userId);
  }

  async getAllAttempts(userId?: string): Promise<Attempt[]> {
    return this.attemptRepo.findAll(userId);
  }

  async saveDraft(attemptId: string, solutionProps: SolutionProps): Promise<Solution> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID "${attemptId}" not found.`);
    }

    const solution = new Solution({
      ...solutionProps,
      attemptId,
    });

    return this.attemptRepo.saveSolution(attemptId, solution);
  }
}
