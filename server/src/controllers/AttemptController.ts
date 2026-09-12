import { Request, Response, NextFunction } from 'express';
import { AttemptService } from '../services/AttemptService.js';
import { EvaluationService } from '../services/EvaluationService.js';

export class AttemptController {
  constructor(
    private readonly attemptService: AttemptService,
    private readonly evaluationService: EvaluationService
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { problemId, userId } = req.body;
      if (!problemId) {
        res.status(400).json({ error: { message: 'problemId is required' } });
        return;
      }
      const attempt = await this.attemptService.createAttempt(problemId, userId || 'demo-learner-001');
      res.status(201).json({ data: attempt });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const attempt = await this.attemptService.getAttemptById(id);
      if (!attempt) {
        res.status(404).json({ error: { message: `Attempt "${id}" not found` } });
        return;
      }
      res.json({ data: attempt });
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { problemId, userId } = req.query;
      let attempts;
      if (problemId) {
        attempts = await this.attemptService.getAttemptsByProblem(
          problemId as string,
          userId as string | undefined
        );
      } else {
        attempts = await this.attemptService.getAllAttempts(userId as string | undefined);
      }
      res.json({ data: attempts });
    } catch (err) {
      next(err);
    }
  };

  saveDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const solutionData = req.body;
      const savedSolution = await this.attemptService.saveDraft(id, solutionData);
      res.json({ data: savedSolution });
    } catch (err) {
      next(err);
    }
  };

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const solutionData = req.body;
      const evaluation = await this.evaluationService.submitAndEvaluate(id, solutionData);
      res.json({
        data: {
          attemptId: id,
          status: 'EVALUATED',
          evaluation,
        },
      });
    } catch (err: any) {
      res.status(422).json({
        error: {
          message: err.message || 'Submission evaluation failed',
          attemptId: req.params.id,
          status: 'FAILED',
        },
      });
    }
  };
}
