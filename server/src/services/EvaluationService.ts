import { IAttemptRepository } from '../repositories/IAttemptRepository.js';
import { IProblemRepository } from '../repositories/IProblemRepository.js';
import { IEvaluationRepository } from '../repositories/IEvaluationRepository.js';
import { EvaluationEngine } from '../evaluation/EvaluationEngine.js';
import { Solution, SolutionProps } from '../domain/Submission.js';
import { Evaluation } from '../domain/Evaluation.js';

export class EvaluationService {
  constructor(
    private readonly attemptRepo: IAttemptRepository,
    private readonly problemRepo: IProblemRepository,
    private readonly evaluationRepo: IEvaluationRepository,
    private readonly evaluationEngine: EvaluationEngine
  ) {}

  async submitAndEvaluate(attemptId: string, solutionProps: SolutionProps): Promise<Evaluation> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID "${attemptId}" not found.`);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new Error(`Problem with ID "${attempt.problemId}" not found.`);
    }

    // 1. Build and save the solution first to guarantee persistence
    const solution = new Solution({
      ...solutionProps,
      attemptId,
    });
    await this.attemptRepo.saveSolution(attemptId, solution);

    // 2. Transition attempt to SUBMITTED and then EVALUATING
    await this.attemptRepo.updateStatus(attemptId, 'SUBMITTED');
    await this.attemptRepo.updateStatus(attemptId, 'EVALUATING');

    try {
      // 3. Run evaluation through engine (deterministic + provider)
      const evaluation = await this.evaluationEngine.runEvaluation(attemptId, problem, solution);

      // 4. Save evaluation
      const savedEvaluation = await this.evaluationRepo.save(evaluation);

      // 5. Transition attempt to EVALUATED
      await this.attemptRepo.updateStatus(attemptId, 'EVALUATED');

      return savedEvaluation;
    } catch (err: any) {
      console.error(`Evaluation failed for attempt ${attemptId}:`, err);
      // Mark as FAILED so solution is retained and user can retry
      await this.attemptRepo.updateStatus(attemptId, 'FAILED');
      throw new Error(`Evaluation could not be completed: ${err?.message || 'Internal evaluation error'}`);
    }
  }

  async retryEvaluation(attemptId: string): Promise<Evaluation> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID "${attemptId}" not found.`);
    }

    if (!attempt.solution) {
      throw new Error(`Attempt "${attemptId}" does not have a saved solution to evaluate.`);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new Error(`Problem with ID "${attempt.problemId}" not found.`);
    }

    await this.attemptRepo.updateStatus(attemptId, 'EVALUATING');

    try {
      const evaluation = await this.evaluationEngine.runEvaluation(attemptId, problem, attempt.solution);
      const savedEvaluation = await this.evaluationRepo.save(evaluation);
      await this.attemptRepo.updateStatus(attemptId, 'EVALUATED');
      return savedEvaluation;
    } catch (err: any) {
      console.error(`Retry evaluation failed for attempt ${attemptId}:`, err);
      await this.attemptRepo.updateStatus(attemptId, 'FAILED');
      throw new Error(`Retry evaluation failed: ${err?.message || 'Internal evaluation error'}`);
    }
  }

  async getEvaluation(attemptId: string): Promise<Evaluation | null> {
    return this.evaluationRepo.findByAttemptId(attemptId);
  }
}
