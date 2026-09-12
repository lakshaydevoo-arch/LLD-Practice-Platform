export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ProblemProps {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  timeEstimate: string;
  shortDescription: string;
  requirements: string[];
  functionalRequirements: string[];
  expectedEntities: string[];
  expectedBehaviours: string[];
  constraints: string[];
  concepts: string[];
  createdAt?: Date;
}

export class Problem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly timeEstimate: string;
  readonly shortDescription: string;
  readonly requirements: string[];
  readonly functionalRequirements: string[];
  readonly expectedEntities: string[];
  readonly expectedBehaviours: string[];
  readonly constraints: string[];
  readonly concepts: string[];
  readonly createdAt: Date;

  constructor(props: ProblemProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.difficulty = props.difficulty;
    this.timeEstimate = props.timeEstimate;
    this.shortDescription = props.shortDescription;
    this.requirements = props.requirements;
    this.functionalRequirements = props.functionalRequirements;
    this.expectedEntities = props.expectedEntities;
    this.expectedBehaviours = props.expectedBehaviours;
    this.constraints = props.constraints;
    this.concepts = props.concepts;
    this.createdAt = props.createdAt ?? new Date();
  }

  hasExpectedEntity(name: string): boolean {
    const normalized = name.toLowerCase().trim();
    return this.expectedEntities.some((e) => e.toLowerCase().trim() === normalized);
  }
}
