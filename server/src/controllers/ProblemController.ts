import { Request, Response, NextFunction } from 'express';
import { ProblemService } from '../services/ProblemService.js';

export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const problems = await this.problemService.getAllProblems();
      res.json({ data: problems });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      let problem = await this.problemService.getProblemById(id);
      if (!problem) {
        problem = await this.problemService.getProblemBySlug(id);
      }
      if (!problem) {
        res.status(404).json({ error: { message: `Problem not found with id or slug "${id}"` } });
        return;
      }
      res.json({ data: problem });
    } catch (err) {
      next(err);
    }
  };
}
