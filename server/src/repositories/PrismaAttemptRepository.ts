import { PrismaClient } from '@prisma/client';
import { IAttemptRepository } from './IAttemptRepository.js';
import { Attempt, AttemptStatus } from '../domain/Attempt.js';
import { Solution } from '../domain/Submission.js';
import { Evaluation, EvaluationDimension } from '../domain/Evaluation.js';
import { FeedbackItem, FeedbackType, FeedbackCategory } from '../domain/Feedback.js';

export class PrismaAttemptRepository implements IAttemptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapAttemptToDomain(row: any): Attempt {
    let solution: Solution | null = null;
    if (row.solution) {
      solution = new Solution({
        id: row.solution.id,
        attemptId: row.solution.attemptId,
        patterns: JSON.parse(row.solution.patterns || '[]'),
        explanation: row.solution.explanation || '',
        optionalCode: row.solution.optionalCode || null,
        classes: (row.solution.classes || []).map((c: any) => ({
          name: c.name,
          responsibility: c.responsibility,
          attributes: JSON.parse(c.attributes || '[]'),
        })),
        interfaces: (row.solution.interfaces || []).map((i: any) => ({
          name: i.name,
          responsibility: i.responsibility,
          methods: JSON.parse(i.methods || '[]'),
        })),
        relationships: (row.solution.relationships || []).map((r: any) => ({
          fromEntity: r.fromEntity,
          type: r.type,
          toEntity: r.toEntity,
        })),
        methods: (row.solution.methods || []).map((m: any) => ({
          name: m.name,
          ownerClass: m.ownerClass,
          purpose: m.purpose,
          inputs: JSON.parse(m.inputs || '[]'),
          output: m.output,
        })),
      });
    }

    let evaluation: Evaluation | null = null;
    if (row.evaluation) {
      evaluation = new Evaluation({
        id: row.evaluation.id,
        attemptId: row.evaluation.attemptId,
        overallScore: row.evaluation.overallScore,
        providerUsed: row.evaluation.providerUsed,
        createdAt: row.evaluation.createdAt,
        dimensions: (row.evaluation.dimensions || []).map(
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
        feedbackItems: (row.evaluation.feedbackItems || []).map(
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

    return new Attempt({
      id: row.id,
      problemId: row.problemId,
      userId: row.userId,
      status: row.status as AttemptStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      solution,
      evaluation,
    });
  }

  async create(props: { id?: string; problemId: string; userId: string; status?: AttemptStatus }): Promise<Attempt> {
    const row = await this.prisma.attempt.create({
      data: {
        id: props.id,
        problemId: props.problemId,
        userId: props.userId,
        status: props.status || 'DRAFT',
      },
      include: {
        solution: {
          include: {
            classes: true,
            interfaces: true,
            relationships: true,
            methods: true,
          },
        },
        evaluation: {
          include: {
            dimensions: true,
            feedbackItems: true,
          },
        },
      },
    });
    return this.mapAttemptToDomain(row);
  }

  async findById(id: string): Promise<Attempt | null> {
    const row = await this.prisma.attempt.findUnique({
      where: { id },
      include: {
        solution: {
          include: {
            classes: true,
            interfaces: true,
            relationships: true,
            methods: true,
          },
        },
        evaluation: {
          include: {
            dimensions: true,
            feedbackItems: true,
          },
        },
      },
    });
    if (!row) return null;
    return this.mapAttemptToDomain(row);
  }

  async findByProblemId(problemId: string, userId?: string): Promise<Attempt[]> {
    const rows = await this.prisma.attempt.findMany({
      where: {
        problemId,
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        solution: {
          include: {
            classes: true,
            interfaces: true,
            relationships: true,
            methods: true,
          },
        },
        evaluation: {
          include: {
            dimensions: true,
            feedbackItems: true,
          },
        },
      },
    });
    return rows.map((r) => this.mapAttemptToDomain(r));
  }

  async findAll(userId?: string): Promise<Attempt[]> {
    const rows = await this.prisma.attempt.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        solution: {
          include: {
            classes: true,
            interfaces: true,
            relationships: true,
            methods: true,
          },
        },
        evaluation: {
          include: {
            dimensions: true,
            feedbackItems: true,
          },
        },
      },
    });
    return rows.map((r) => this.mapAttemptToDomain(r));
  }

  async updateStatus(id: string, status: AttemptStatus): Promise<Attempt> {
    const row = await this.prisma.attempt.update({
      where: { id },
      data: { status },
      include: {
        solution: {
          include: {
            classes: true,
            interfaces: true,
            relationships: true,
            methods: true,
          },
        },
        evaluation: {
          include: {
            dimensions: true,
            feedbackItems: true,
          },
        },
      },
    });
    return this.mapAttemptToDomain(row);
  }

  async saveSolution(attemptId: string, solution: Solution): Promise<Solution> {
    // Transaction to update solution and related entities atomically
    await this.prisma.$transaction(async (tx) => {
      // Find or create solution
      let solRecord = await tx.solution.findUnique({
        where: { attemptId },
      });

      if (!solRecord) {
        solRecord = await tx.solution.create({
          data: {
            attemptId,
            patterns: JSON.stringify(solution.patterns),
            explanation: solution.explanation,
            optionalCode: solution.optionalCode,
          },
        });
      } else {
        await tx.solution.update({
          where: { id: solRecord.id },
          data: {
            patterns: JSON.stringify(solution.patterns),
            explanation: solution.explanation,
            optionalCode: solution.optionalCode,
          },
        });

        // Delete old relational children to replace cleanly
        await tx.classDefinition.deleteMany({ where: { solutionId: solRecord.id } });
        await tx.interfaceDefinition.deleteMany({ where: { solutionId: solRecord.id } });
        await tx.relationship.deleteMany({ where: { solutionId: solRecord.id } });
        await tx.methodDefinition.deleteMany({ where: { solutionId: solRecord.id } });
      }

      // Recreate classes
      if (solution.classes.length > 0) {
        await tx.classDefinition.createMany({
          data: solution.classes.map((c) => ({
            solutionId: solRecord!.id,
            name: c.name,
            responsibility: c.responsibility,
            attributes: JSON.stringify(c.attributes),
          })),
        });
      }

      // Recreate interfaces
      if (solution.interfaces.length > 0) {
        await tx.interfaceDefinition.createMany({
          data: solution.interfaces.map((i) => ({
            solutionId: solRecord!.id,
            name: i.name,
            responsibility: i.responsibility,
            methods: JSON.stringify(i.methods),
          })),
        });
      }

      // Recreate relationships
      if (solution.relationships.length > 0) {
        await tx.relationship.createMany({
          data: solution.relationships.map((r) => ({
            solutionId: solRecord!.id,
            fromEntity: r.fromEntity,
            type: r.type,
            toEntity: r.toEntity,
          })),
        });
      }

      // Recreate methods
      if (solution.methods.length > 0) {
        await tx.methodDefinition.createMany({
          data: solution.methods.map((m) => ({
            solutionId: solRecord!.id,
            name: m.name,
            ownerClass: m.ownerClass,
            purpose: m.purpose,
            inputs: JSON.stringify(m.inputs),
            output: m.output,
          })),
        });
      }
    });

    return solution;
  }
}
