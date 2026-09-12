import { Request, Response, NextFunction } from 'express';
import { EvaluationService } from '../services/EvaluationService.js';

export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  getByAttemptId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const evaluation = await this.evaluationService.getEvaluation(id);
      if (!evaluation) {
        res.status(404).json({ error: { message: `No evaluation found for attempt "${id}"` } });
        return;
      }
      res.json({ data: evaluation });
    } catch (err) {
      next(err);
    }
  };

  retry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const evaluation = await this.evaluationService.retryEvaluation(id);
      res.json({ data: evaluation });
    } catch (err: any) {
      res.status(422).json({
        error: {
          message: err.message || 'Retry evaluation failed',
          attemptId: req.params.id,
          status: 'FAILED',
        },
      });
    }
  };
}
