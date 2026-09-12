import { Router } from 'express';
import { EvaluationController } from '../controllers/EvaluationController.js';

export function createEvaluationRoutes(controller: EvaluationController): Router {
  const router = Router();
  router.get('/:id', controller.getByAttemptId);
  router.post('/:id/retry', controller.retry);
  return router;
}
