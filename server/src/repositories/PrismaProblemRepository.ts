import { PrismaClient } from '@prisma/client';
import { IProblemRepository } from './IProblemRepository.js';
import { Problem, Difficulty } from '../domain/Problem.js';

export class PrismaProblemRepository implements IProblemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(row: any): Problem {
    return new Problem({
      id: row.id,
      slug: row.slug,
      title: row.title,
      difficulty: row.difficulty as Difficulty,
      timeEstimate: row.timeEstimate,
      shortDescription: row.shortDescription,
      requirements: JSON.parse(row.requirements),
      functionalRequirements: JSON.parse(row.functionalRequirements),
      expectedEntities: JSON.parse(row.expectedEntities),
      expectedBehaviours: JSON.parse(row.expectedBehaviours),
      constraints: JSON.parse(row.constraints),
      concepts: JSON.parse(row.concepts),
      createdAt: row.createdAt,
    });
  }

  async findAll(): Promise<Problem[]> {
    const rows = await this.prisma.problem.findMany({
      orderBy: { title: 'asc' },
    });
    return rows.map((r) => this.mapToDomain(r));
  }

  async findById(id: string): Promise<Problem | null> {
    const row = await this.prisma.problem.findUnique({
      where: { id },
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const row = await this.prisma.problem.findUnique({
      where: { slug },
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }
}
