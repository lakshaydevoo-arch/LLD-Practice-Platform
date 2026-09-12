import { Router } from 'express';
import { ProblemController } from '../controllers/ProblemController.js';

export function createProblemRoutes(controller: ProblemController): Router {
  const router = Router();
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  return router;
}
