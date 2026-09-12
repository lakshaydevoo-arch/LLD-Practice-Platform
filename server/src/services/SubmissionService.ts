import { Solution, SolutionProps } from '../domain/Submission.js';
import { IAttemptRepository } from '../repositories/IAttemptRepository.js';

export class SubmissionService {
  constructor(private readonly attemptRepo: IAttemptRepository) {}

  buildSolution(props: SolutionProps): Solution {
    return new Solution(props);
  }

  async saveSolution(attemptId: string, solutionProps: SolutionProps): Promise<Solution> {
    const solution = new Solution({
      ...solutionProps,
      attemptId,
    });
    return this.attemptRepo.saveSolution(attemptId, solution);
  }
}
