import { IProblemRepository } from '../repositories/IProblemRepository.js';
import { Problem } from '../domain/Problem.js';

export class ProblemService {
  constructor(private readonly problemRepo: IProblemRepository) {}

  async getAllProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  async getProblemById(id: string): Promise<Problem | null> {
    return this.problemRepo.findById(id);
  }

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    return this.problemRepo.findBySlug(slug);
  }
}
