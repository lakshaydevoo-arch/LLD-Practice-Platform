import { Router } from 'express';
import { AttemptController } from '../controllers/AttemptController.js';

export function createAttemptRoutes(controller: AttemptController): Router {
  const router = Router();
  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.saveDraft);
  router.post('/:id/submit', controller.submit);
  return router;
}
