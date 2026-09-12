import { PrismaClient } from '@prisma/client';
import { IEvaluationRepository } from './IEvaluationRepository.js';
import { Evaluation, EvaluationDimension } from '../domain/Evaluation.js';
import { FeedbackItem, FeedbackType, FeedbackCategory } from '../domain/Feedback.js';

export class PrismaEvaluationRepository implements IEvaluationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(row: any): Evaluation {
    return new Evaluation({
      id: row.id,
      attemptId: row.attemptId,
      overallScore: row.overallScore,
      providerUsed: row.providerUsed,
      createdAt: row.createdAt,
      dimensions: (row.dimensions || []).map(
        (d: any) =>
          new EvaluationDimension({
            id: d.id,
            name: d.name,
            score: d.score,
            weight: d.weight,
            reasoning: d.reasoning,
            suggestions: JSON.parse(d.suggestions || '[]'),
          })
      ),
      feedbackItems: (row.feedbackItems || []).map(
        (f: any) =>
          new FeedbackItem({
            id: f.id,
            evaluationId: f.evaluationId,
            type: f.type as FeedbackType,
            category: f.category as FeedbackCategory,
            problem: f.problem,
            whyItMatters: f.whyItMatters,
            suggestion: f.suggestion,
            example: f.example,
          })
      ),
    });
  }

  async save(evaluation: Evaluation): Promise<Evaluation> {
    await this.prisma.$transaction(async (tx) => {
      // Upsert evaluation record
      const existing = await tx.evaluation.findUnique({
        where: { attemptId: evaluation.attemptId },
      });

      let evalId: string;
      if (existing) {
        evalId = existing.id;
        await tx.evaluation.update({
          where: { id: evalId },
          data: {
            overallScore: evaluation.overallScore,
            providerUsed: evaluation.providerUsed,
          },
        });
        await tx.evaluationDimension.deleteMany({ where: { evaluationId: evalId } });
        await tx.feedbackItem.deleteMany({ where: { evaluationId: evalId } });
      } else {
        const created = await tx.evaluation.create({
          data: {
            attemptId: evaluation.attemptId,
            overallScore: evaluation.overallScore,
            providerUsed: evaluation.providerUsed,
          },
        });
        evalId = created.id;
      }

      // Save dimensions
      if (evaluation.dimensions.length > 0) {
        await tx.evaluationDimension.createMany({
          data: evaluation.dimensions.map((d) => ({
            evaluationId: evalId,
            name: d.name,
            score: d.score,
            weight: d.weight,
            reasoning: d.reasoning,
            suggestions: JSON.stringify(d.suggestions),
          })),
        });
      }

      // Save feedback items
      if (evaluation.feedbackItems.length > 0) {
        await tx.feedbackItem.createMany({
          data: evaluation.feedbackItems.map((f) => ({
            evaluationId: evalId,
            type: f.type,
            category: f.category,
            problem: f.problem,
            whyItMatters: f.whyItMatters,
            suggestion: f.suggestion,
            example: f.example,
          })),
        });
      }
    });

    const saved = await this.findByAttemptId(evaluation.attemptId);
    return saved!;
  }

  async findByAttemptId(attemptId: string): Promise<Evaluation | null> {
    const row = await this.prisma.evaluation.findUnique({
      where: { attemptId },
      include: {
        dimensions: true,
        feedbackItems: true,
      },
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }
}
