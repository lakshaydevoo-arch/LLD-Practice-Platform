import { EvaluationRule, RuleResult } from './Evaluator.js';
import { Problem } from '../domain/Problem.js';
import { Solution } from '../domain/Submission.js';

export class EmptySubmissionRule implements EvaluationRule {
  readonly name = 'EmptySubmissionRule';

  evaluate(solution: Solution, _problem: Problem): RuleResult {
    if (solution.isEmpty() || (solution.classes.length === 0 && solution.interfaces.length === 0)) {
      return {
        passed: false,
        ruleName: this.name,
        category: 'STRUCTURAL',
        severity: 'CRITICAL',
        message: 'Solution cannot be empty. Define at least one core domain class or interface.',
      };
    }
    return {
      passed: true,
      ruleName: this.name,
      category: 'STRUCTURAL',
      severity: 'INFO',
      message: 'Solution contains defined entities.',
    };
  }
}

export class DuplicateEntityRule implements EvaluationRule {
  readonly name = 'DuplicateEntityRule';

  evaluate(solution: Solution, _problem: Problem): RuleResult {
    const classNames = solution.classes.map((c) => c.name.trim().toLowerCase());
    const interfaceNames = solution.interfaces.map((i) => i.name.trim().toLowerCase());
    const allNames = [...classNames, ...interfaceNames];

    const duplicates = allNames.filter((name, idx) => allNames.indexOf(name) !== idx && name.length > 0);
    const uniqueDuplicates = [...new Set(duplicates)];

    if (uniqueDuplicates.length > 0) {
      return {
        passed: false,
        ruleName: this.name,
        category: 'STRUCTURAL',
        severity: 'CRITICAL',
        message: `Duplicate entity names detected: "${uniqueDuplicates.join('", "')}". Every class and interface must have a distinct identifier.`,
        details: { duplicates: uniqueDuplicates },
      };
    }

    return {
      passed: true,
      ruleName: this.name,
      category: 'STRUCTURAL',
      severity: 'INFO',
      message: 'All entity identifiers are unique.',
    };
  }
}

export class DanglingRelationshipRule implements EvaluationRule {
  readonly name = 'DanglingRelationshipRule';

  evaluate(solution: Solution, _problem: Problem): RuleResult {
    const entityNames = new Set(solution.getAllEntityNames().map((n) => n.toLowerCase().trim()));
    const dangling: { from: string; to: string; missing: string }[] = [];

    for (const rel of solution.relationships) {
      const fromNormalized = rel.fromEntity.toLowerCase().trim();
      const toNormalized = rel.toEntity.toLowerCase().trim();

      if (!entityNames.has(fromNormalized)) {
        dangling.push({ from: rel.fromEntity, to: rel.toEntity, missing: rel.fromEntity });
      }
      if (!entityNames.has(toNormalized)) {
        dangling.push({ from: rel.fromEntity, to: rel.toEntity, missing: rel.toEntity });
      }
    }

    if (dangling.length > 0) {
      const missingList = [...new Set(dangling.map((d) => d.missing))];
      return {
        passed: false,
        ruleName: this.name,
        category: 'RELATIONSHIPS',
        severity: 'CRITICAL',
        message: `Relationship references undefined entities: "${missingList.join('", "')}". Ensure all participating classes or interfaces are defined.`,
        details: { dangling },
      };
    }

    return {
      passed: true,
      ruleName: this.name,
      category: 'RELATIONSHIPS',
      severity: 'INFO',
      message: 'All relationships reference valid, declared entities.',
    };
  }
}

export class OrphanMethodRule implements EvaluationRule {
  readonly name = 'OrphanMethodRule';

  evaluate(solution: Solution, _problem: Problem): RuleResult {
    const classNames = new Set(solution.classes.map((c) => c.name.toLowerCase().trim()));
    const orphanMethods: string[] = [];

    for (const method of solution.methods) {
      const owner = method.ownerClass.toLowerCase().trim();
      if (!classNames.has(owner)) {
        orphanMethods.push(`${method.name}() -> owner "${method.ownerClass}"`);
      }
    }

    if (orphanMethods.length > 0) {
      return {
        passed: false,
        ruleName: this.name,
        category: 'COHESION',
        severity: 'WARNING',
        message: `Methods declared with unknown owner classes: ${orphanMethods.join(', ')}. Methods must belong to an existing class.`,
        details: { orphanMethods },
      };
    }

    return {
      passed: true,
      ruleName: this.name,
      category: 'COHESION',
      severity: 'INFO',
      message: 'All methods are owned by defined classes.',
    };
  }
}

export class EmptyResponsibilityRule implements EvaluationRule {
  readonly name = 'EmptyResponsibilityRule';

  evaluate(solution: Solution, _problem: Problem): RuleResult {
    const vagueEntities: string[] = [];

    for (const cls of solution.classes) {
      if (!cls.responsibility || cls.responsibility.trim().length < 8) {
        vagueEntities.push(`Class "${cls.name}"`);
      }
    }

    for (const iface of solution.interfaces) {
      if (!iface.responsibility || iface.responsibility.trim().length < 8) {
        vagueEntities.push(`Interface "${iface.name}"`);
      }
    }

    if (vagueEntities.length > 0) {
      return {
        passed: false,
        ruleName: this.name,
        category: 'COHESION',
        severity: 'WARNING',
        message: `Entities with vague or missing Single Responsibility statements: ${vagueEntities.join(', ')}. Clearly articulate what each component does.`,
        details: { vagueEntities },
      };
    }

    return {
      passed: true,
      ruleName: this.name,
      category: 'COHESION',
      severity: 'INFO',
      message: 'All entities have articulated responsibilities.',
    };
  }
}

export class MissingCoreEntityRule implements EvaluationRule {
  readonly name = 'MissingCoreEntityRule';

  evaluate(solution: Solution, problem: Problem): RuleResult {
    if (!problem.expectedEntities || problem.expectedEntities.length === 0) {
      return {
        passed: true,
        ruleName: this.name,
        category: 'ENTITIES',
        severity: 'INFO',
        message: 'No expected entities specified for problem.',
      };
    }

    const declared = new Set(solution.getAllEntityNames().map((n) => n.toLowerCase().trim()));
    const missing: string[] = [];

    for (const expected of problem.expectedEntities) {
      const expNorm = expected.toLowerCase().trim();
      // Check exact match or plural/singular variation
      const found = Array.from(declared).some((decl) => {
        return decl === expNorm || decl.includes(expNorm) || expNorm.includes(decl);
      });
      if (!found) {
        missing.push(expected);
      }
    }

    // If more than 50% of expected core entities are missing, trigger warning
    if (missing.length > 0) {
      const isCritical = missing.length > Math.ceil(problem.expectedEntities.length / 2);
      return {
        passed: !isCritical,
        ruleName: this.name,
        category: 'ENTITIES',
        severity: isCritical ? 'CRITICAL' : 'WARNING',
        message: `Missing key domain entities expected for ${problem.title}: ${missing.join(', ')}. Consider whether these entities are required to fulfill all functional requirements.`,
        details: { missingEntities: missing },
      };
    }

    return {
      passed: true,
      ruleName: this.name,
      category: 'ENTITIES',
      severity: 'INFO',
      message: 'Core domain entities for the problem statement are represented.',
    };
  }
}

export class SelfInheritanceRule implements EvaluationRule {
  readonly name = 'SelfInheritanceRule';

  evaluate(solution: Solution, _problem: Problem): RuleResult {
    const invalidRelationships: string[] = [];

    for (const rel of solution.relationships) {
      const from = rel.fromEntity.toLowerCase().trim();
      const to = rel.toEntity.toLowerCase().trim();

      if (rel.type === 'INHERITANCE' && from === to) {
        invalidRelationships.push(`Class "${rel.fromEntity}" cannot inherit from itself.`);
      }
      if (from === to && (rel.type === 'COMPOSITION' || rel.type === 'AGGREGATION')) {
        invalidRelationships.push(`Entity "${rel.fromEntity}" cannot compose itself directly without recursive container abstraction.`);
      }
    }

    if (invalidRelationships.length > 0) {
      return {
        passed: false,
        ruleName: this.name,
        category: 'RELATIONSHIPS',
        severity: 'CRITICAL',
        message: invalidRelationships.join(' '),
        details: { invalidRelationships },
      };
    }

    return {
      passed: true,
      ruleName: this.name,
      category: 'RELATIONSHIPS',
      severity: 'INFO',
      message: 'No circular or self-referential inheritance detected.',
    };
  }
}

export class DeterministicRuleEngine {
  private rules: EvaluationRule[] = [
    new EmptySubmissionRule(),
    new DuplicateEntityRule(),
    new DanglingRelationshipRule(),
    new OrphanMethodRule(),
    new EmptyResponsibilityRule(),
    new MissingCoreEntityRule(),
    new SelfInheritanceRule(),
  ];

  registerRule(rule: EvaluationRule): void {
    this.rules.push(rule);
  }

  evaluateAll(solution: Solution, problem: Problem): RuleResult[] {
    return this.rules.map((rule) => rule.evaluate(solution, problem));
  }
}
