import { DeterministicRuleEngine } from './RuleBasedEvaluator.js';
import { EvaluationProvider } from './Evaluator.js';
import { Problem } from '../domain/Problem.js';
import { Solution } from '../domain/Submission.js';
import { Evaluation, EvaluationDimension } from '../domain/Evaluation.js';
import { FeedbackItem, FeedbackType, FeedbackCategory } from '../domain/Feedback.js';

export class EvaluationEngine {
  constructor(
    private readonly ruleEngine: DeterministicRuleEngine,
    private readonly provider: EvaluationProvider
  ) {}

  async runEvaluation(attemptId: string, problem: Problem, solution: Solution): Promise<Evaluation> {
    // 1. Run deterministic structural rules
    const deterministicFindings = this.ruleEngine.evaluateAll(solution, problem);

    // 2. Run Provider Evaluation (Mock or LLM)
    const providerResult = await this.provider.evaluate({
      problem,
      solution,
      deterministicFindings,
    });

    // 3. Transform failed deterministic findings into FeedbackItems
    const deterministicIssues: FeedbackItem[] = [];
    for (const finding of deterministicFindings) {
      if (!finding.passed) {
        deterministicIssues.push(
          new FeedbackItem({
            type: (finding.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING') as FeedbackType,
            category: (finding.category === 'STRUCTURAL' ? 'STRUCTURAL' : finding.category === 'RELATIONSHIPS' ? 'COUPLING' : 'COHESION') as FeedbackCategory,
            problem: finding.message,
            whyItMatters:
              finding.category === 'STRUCTURAL'
                ? 'Referential integrity and non-empty entity structures are prerequisites for valid low-level designs.'
                : finding.category === 'RELATIONSHIPS'
                ? 'Relationships pointing to non-existent classes indicate broken coupling or undeclared dependencies.'
                : 'Incomplete domain modeling leaves key functional requirements unsupported.',
            suggestion: 'Fix the structural entity declarations to ensure all referenced classes and relationships are defined.',
            example: null,
          })
        );
      }
    }

    // 4. Map provider issues to domain FeedbackItems
    const providerIssues = providerResult.issues.map(
      (issue) =>
        new FeedbackItem({
          type: issue.type,
          category: issue.category,
          problem: issue.problem,
          whyItMatters: issue.whyItMatters,
          suggestion: issue.suggestion,
          example: issue.example ?? null,
        })
    );

    // Map strengths into STRENGTH FeedbackItems
    const strengthItems = providerResult.strengths.map(
      (strength) =>
        new FeedbackItem({
          type: 'STRENGTH',
          category: 'COHESION',
          problem: strength,
          whyItMatters: 'Demonstrates sound object-oriented design practice.',
          suggestion: 'Continue applying this pattern in similar architectural contexts.',
          example: null,
        })
    );

    // Combine all feedback items
    const allFeedbackItems = [...deterministicIssues, ...providerIssues, ...strengthItems];

    // Map dimensions
    const dimensions = providerResult.dimensions.map(
      (dim) =>
        new EvaluationDimension({
          name: dim.name,
          score: dim.score,
          weight: dim.weight,
          reasoning: dim.reasoning,
          suggestions: dim.suggestions,
        })
    );

    // Build final evaluation
    return new Evaluation({
      attemptId,
      overallScore: providerResult.overallScore,
      providerUsed: providerResult.providerId,
      dimensions,
      feedbackItems: allFeedbackItems,
    });
  }
}
