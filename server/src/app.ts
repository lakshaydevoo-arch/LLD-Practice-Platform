import express, { Express } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import { PrismaProblemRepository } from './repositories/PrismaProblemRepository.js';
import { PrismaAttemptRepository } from './repositories/PrismaAttemptRepository.js';
import { PrismaEvaluationRepository } from './repositories/PrismaEvaluationRepository.js';

import { DeterministicRuleEngine } from './evaluation/RuleBasedEvaluator.js';
import { MockEvaluationProvider, LLMEvaluationProvider, GeminiEvaluationProvider } from './evaluation/AIEvaluator.js';
import { EvaluationEngine } from './evaluation/EvaluationEngine.js';
import { EvaluationProvider } from './evaluation/Evaluator.js';

import { ProblemService } from './services/ProblemService.js';
import { AttemptService } from './services/AttemptService.js';
import { SubmissionService } from './services/SubmissionService.js';
import { EvaluationService } from './services/EvaluationService.js';

import { ProblemController } from './controllers/ProblemController.js';
import { AttemptController } from './controllers/AttemptController.js';
import { EvaluationController } from './controllers/EvaluationController.js';

import { createProblemRoutes } from './routes/problemRoutes.js';
import { createAttemptRoutes } from './routes/attemptRoutes.js';
import { createEvaluationRoutes } from './routes/evaluationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(prismaClient?: PrismaClient): Express {
  const app = express();
  const prisma = prismaClient || new PrismaClient();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  // Dependency Injection & Inversion of Control
  const problemRepo = new PrismaProblemRepository(prisma);
  const attemptRepo = new PrismaAttemptRepository(prisma);
  const evaluationRepo = new PrismaEvaluationRepository(prisma);

  const ruleEngine = new DeterministicRuleEngine();

  // Select provider based on environment (Defaults to Mock for 100% reliable zero-key operation)
  const providerType = (process.env.EVALUATION_PROVIDER || 'MOCK').toUpperCase();
  let evaluationProvider: EvaluationProvider;

  if (providerType === 'GEMINI' && process.env.GEMINI_API_KEY) {
    evaluationProvider = new GeminiEvaluationProvider(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL);
  } else if ((providerType === 'OPENAI' || providerType === 'LLM') && process.env.OPENAI_API_KEY) {
    evaluationProvider = new LLMEvaluationProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL);
  } else {
    evaluationProvider = new MockEvaluationProvider();
  }

  const evaluationEngine = new EvaluationEngine(ruleEngine, evaluationProvider);

  const problemService = new ProblemService(problemRepo);
  const attemptService = new AttemptService(attemptRepo, problemRepo);
  const submissionService = new SubmissionService(attemptRepo);
  const evaluationService = new EvaluationService(attemptRepo, problemRepo, evaluationRepo, evaluationEngine);

  const problemController = new ProblemController(problemService);
  const attemptController = new AttemptController(attemptService, evaluationService);
  const evaluationController = new EvaluationController(evaluationService);

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'lld-practice-platform',
      version: '1.0.0',
      provider: evaluationProvider.providerId,
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/problems', createProblemRoutes(problemController));
  app.use('/api/attempts', createAttemptRoutes(attemptController));
  app.use('/api/evaluations', createEvaluationRoutes(evaluationController));

  // Direct evaluation endpoints on attempts for convenience
  app.get('/api/attempts/:id/evaluation', evaluationController.getByAttemptId);
  app.post('/api/attempts/:id/retry-evaluation', evaluationController.retry);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
