export type RelationshipType = 
  | 'ASSOCIATION'
  | 'AGGREGATION'
  | 'COMPOSITION'
  | 'INHERITANCE'
  | 'DEPENDENCY';

export interface ClassDefinition {
  name: string;
  responsibility: string;
  attributes: string[];
}

export interface InterfaceDefinition {
  name: string;
  responsibility: string;
  methods: string[];
}

export interface Relationship {
  fromEntity: string;
  type: RelationshipType;
  toEntity: string;
}

export interface MethodDefinition {
  name: string;
  ownerClass: string;
  purpose: string;
  inputs: string[];
  output: string;
}

export interface SolutionProps {
  id?: string;
  attemptId?: string;
  classes: ClassDefinition[];
  interfaces: InterfaceDefinition[];
  relationships: Relationship[];
  methods: MethodDefinition[];
  patterns: string[];
  explanation: string;
  optionalCode?: string | null;
}

export class Solution {
  readonly id?: string;
  readonly attemptId?: string;
  readonly classes: ClassDefinition[];
  readonly interfaces: InterfaceDefinition[];
  readonly relationships: Relationship[];
  readonly methods: MethodDefinition[];
  readonly patterns: string[];
  readonly explanation: string;
  readonly optionalCode: string | null;

  constructor(props: SolutionProps) {
    this.id = props.id;
    this.attemptId = props.attemptId;
    this.classes = props.classes || [];
    this.interfaces = props.interfaces || [];
    this.relationships = props.relationships || [];
    this.methods = props.methods || [];
    this.patterns = props.patterns || [];
    this.explanation = props.explanation || '';
    this.optionalCode = props.optionalCode ?? null;
  }

  getAllEntityNames(): string[] {
    const classNames = this.classes.map((c) => c.name.trim());
    const interfaceNames = this.interfaces.map((i) => i.name.trim());
    return [...classNames, ...interfaceNames];
  }

  hasEntity(name: string): boolean {
    const normalized = name.toLowerCase().trim();
    return this.getAllEntityNames().some((n) => n.toLowerCase() === normalized);
  }

  getClass(name: string): ClassDefinition | undefined {
    const normalized = name.toLowerCase().trim();
    return this.classes.find((c) => c.name.toLowerCase().trim() === normalized);
  }

  getInterface(name: string): InterfaceDefinition | undefined {
    const normalized = name.toLowerCase().trim();
    return this.interfaces.find((i) => i.name.toLowerCase().trim() === normalized);
  }

  getRelationshipsFor(entityName: string): Relationship[] {
    const normalized = entityName.toLowerCase().trim();
    return this.relationships.filter(
      (r) =>
        r.fromEntity.toLowerCase().trim() === normalized ||
        r.toEntity.toLowerCase().trim() === normalized
    );
  }

  getMethodsForClass(className: string): MethodDefinition[] {
    const normalized = className.toLowerCase().trim();
    return this.methods.filter((m) => m.ownerClass.toLowerCase().trim() === normalized);
  }

  isEmpty(): boolean {
    return (
      this.classes.length === 0 &&
      this.interfaces.length === 0 &&
      this.relationships.length === 0 &&
      this.methods.length === 0 &&
      this.explanation.trim().length === 0
    );
  }
}
