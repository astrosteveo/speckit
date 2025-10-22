/**
 * Quality Validation for SpecKit
 *
 * Validates specifications, plans, and implementations against quality thresholds
 * Principle: Quality is built-in, not bolted-on
 */

import {
  parseDependencyGraph,
  validateDependencies,
  calculateParallelizationScore,
  calculateTimeSavings,
  generateExecutionPlan
} from './dependency-graph.js';

const DEFAULT_SPEC_THRESHOLD = 85;
const DEFAULT_PLAN_THRESHOLD = 85;
const DEFAULT_IMPL_THRESHOLD = 80;

// Vague words that indicate unclear requirements
const VAGUE_WORDS = [
  'easy', 'simple', 'user-friendly', 'intuitive', 'fast', 'good', 'better',
  'robust', 'maintainable', 'scalable', 'flexible', 'efficient', 'nice',
  'clean', 'elegant', 'something', 'stuff', 'things', 'etc'
];

/**
 * Validate a specification
 *
 * @param {object} spec - Specification object
 * @param {object} options - Validation options
 * @returns {object} Quality report
 */
export function validateSpecification(spec, options = {}) {
  const threshold = options.threshold || DEFAULT_SPEC_THRESHOLD;
  const issues = [];
  const recommendations = [];

  // Completeness metrics
  let completeness = 100;

  const frCount = spec.functionalRequirements?.length || 0;
  const nfrCount = spec.nonFunctionalRequirements?.length || 0;
  const storyCount = spec.userStories?.length || 0;

  if (frCount < 5) {
    completeness -= 30;
    issues.push('Too few functional requirements (minimum 5)');
    recommendations.push('Add more functional requirements to fully capture system behavior');
  }

  if (frCount === 1) {
    if (!recommendations.includes('Add more functional requirements to fully capture system behavior')) {
      recommendations.push('Add more functional requirements to fully capture system behavior');
    }
  }

  if (nfrCount === 0) {
    completeness -= 20;
    issues.push('No non-functional requirements defined');
    recommendations.push('Add non-functional requirements (performance, security, scalability)');
  }

  if (storyCount === 0) {
    completeness -= 30;
    issues.push('No user stories defined');
    recommendations.push('Add user stories with clear acceptance criteria');
  }

  if (storyCount > 0 && storyCount < 2) {
    completeness -= 10;
    recommendations.push('Add more user stories to cover different personas');
  }

  // Clarity metrics
  let clarity = 100;
  let vagueCount = 0;

  // Check functional requirements for vagueness
  spec.functionalRequirements?.forEach(fr => {
    const desc = fr.description?.toLowerCase() || '';
    const hasVague = VAGUE_WORDS.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(desc);
    });
    if (hasVague || desc.length < 15) {
      vagueCount++;
    }
  });

  if (vagueCount > 0) {
    const ratio = vagueCount / Math.max(frCount, 1);
    clarity -= Math.min(40, ratio * 100);
    if (ratio > 0.3) {
      issues.push(`requirements are too vague (${vagueCount} found)`);
      recommendations.push('Use specific, measurable language in requirements');
    }
  }

  // Check user stories for proper format
  let badStoryCount = 0;
  spec.userStories?.forEach(story => {
    const hasProperFormat = story.story && story.story.includes('As a') && story.story.includes('I want');
    const hasCriteria = story.acceptanceCriteria && story.acceptanceCriteria.length >= 2;

    if (!hasProperFormat || !hasCriteria) {
      badStoryCount++;
    }
  });

  if (badStoryCount > 0 && storyCount > 0) {
    const ratio = badStoryCount / storyCount;
    clarity -= Math.min(30, ratio * 100);
    if (ratio > 0.3) {
      recommendations.push('Use "As a [role], I want [feature] so that [benefit]" format');
    }
  }

  // Testability metrics
  let testability = 100;
  let unmeasurableCount = 0;

  // Check for measurable acceptance criteria
  const testabilityWords = ['should', 'must', 'will', 'can', 'ensure', 'verify', 'validate'];
  const unmeasurableWords = ['easy', 'simple', 'good', 'better', 'nice', 'clean'];

  spec.userStories?.forEach(story => {
    story.acceptanceCriteria?.forEach(criterion => {
      const lower = criterion.toLowerCase();
      const hasUnmeasurable = unmeasurableWords.some(word => lower.includes(word));
      const hasTestable = testabilityWords.some(word => lower.includes(word)) ||
                         /\d+/.test(criterion) || // Has numbers
                         lower.includes('<') || lower.includes('>'); // Has comparisons

      if (hasUnmeasurable || (!hasTestable && criterion.length < 20)) {
        unmeasurableCount++;
      }
    });
  });

  // Check functional requirements for testability
  spec.functionalRequirements?.forEach(fr => {
    const desc = fr.description?.toLowerCase() || '';
    const hasUnmeasurable = unmeasurableWords.some(word => desc.includes(word));
    if (hasUnmeasurable) {
      unmeasurableCount++;
    }
  });

  if (unmeasurableCount > 0) {
    const totalCriteria = spec.userStories?.reduce((sum, s) =>
      sum + (s.acceptanceCriteria?.length || 0), 0) || 1;
    const ratio = unmeasurableCount / Math.max(totalCriteria + frCount, 1);
    testability -= Math.min(75, ratio * 150); // More aggressive penalty

    if (ratio > 0.3) {
      issues.push('Many acceptance criteria are vague or unmeasurable');
      recommendations.push('Make acceptance criteria specific and testable with clear pass/fail conditions');
    }
  }

  // NFRs should have metrics
  let nfrsWithoutMetrics = 0;
  spec.nonFunctionalRequirements?.forEach(nfr => {
    if (!nfr.metric) {
      nfrsWithoutMetrics++;
    }
  });

  if (nfrsWithoutMetrics > 0 && nfrCount > 0) {
    testability -= Math.min(20, (nfrsWithoutMetrics / nfrCount) * 50);
    recommendations.push('Add measurable metrics to all non-functional requirements');
  }

  // Calculate overall score
  completeness = Math.max(0, Math.min(100, completeness));
  clarity = Math.max(0, Math.min(100, clarity));
  testability = Math.max(0, Math.min(100, testability));

  const overall = Math.round((completeness + clarity + testability) / 3);
  const passed = overall >= threshold;

  return {
    overall,
    completeness: Math.round(completeness),
    clarity: Math.round(clarity),
    testability: Math.round(testability),
    threshold,
    passed,
    issues,
    recommendations
  };
}

/**
 * Validate a technical plan
 *
 * @param {object} plan - Plan object
 * @param {object} options - Validation options
 * @returns {object} Quality report
 */
export function validatePlan(plan, options = {}) {
  const threshold = options.threshold || DEFAULT_PLAN_THRESHOLD;
  const issues = [];
  const recommendations = [];

  // Completeness metrics
  let completeness = 100;

  const hasArchitecture = plan.architecture && plan.architecture.overview;
  const componentCount = plan.architecture?.components?.length || 0;
  const taskCount = plan.tasks?.length || 0;
  const hasTimeline = plan.timeline && plan.timeline.totalEffort;

  if (!hasArchitecture || !plan.architecture.overview) {
    completeness -= 30;
    issues.push('No architecture overview provided');
  }

  if (componentCount === 0) {
    completeness -= 40; // More severe penalty
    issues.push('No architecture components defined');
    recommendations.push('Break down architecture into logical components');
  }

  if (taskCount === 0) {
    completeness -= 30;
    issues.push('No tasks defined');
    recommendations.push('Break work into concrete, actionable tasks');
  }

  if (!hasTimeline) {
    completeness -= 20; // More severe penalty
    recommendations.push('Add timeline with effort estimates');
  }

  // Actionability metrics
  let actionability = 100;

  // Check task granularity (should be 2-8 hours)
  let badGranularityCount = 0;
  plan.tasks?.forEach(task => {
    const effort = task.effort || '';
    const hours = parseInt(effort) || 0;

    if (hours > 16 || hours < 1) {
      badGranularityCount++;
    }

    if (!task.title || task.title.length < 10) {
      badGranularityCount++;
    }
  });

  if (badGranularityCount > 0 && taskCount > 0) {
    const ratio = badGranularityCount / taskCount;
    actionability -= Math.min(40, ratio * 100);

    if (ratio >= 1.0) { // All tasks are bad
      issues.push('Tasks are too large');
      recommendations.push('Break large tasks into 2-8 hour chunks with clear titles');
    }
  }

  // Enhanced dependency validation using dependency graph
  let dependencyScore = 0;
  let parallelizationBonus = 0;

  try {
    // Parse dependency graph from plan content
    const graph = parseDependencyGraph(content);

    if (Object.keys(graph).length > 0) {
      // Validate dependencies (check for cycles, invalid references)
      const validation = validateDependencies(graph);

      if (!validation.valid) {
        actionability -= 40; // Severe penalty for invalid dependencies
        validation.errors.forEach(error => issues.push(error));
        recommendations.push('Fix dependency errors before proceeding');
      } else {
        // Valid dependencies - award points
        dependencyScore = 20;

        // Calculate parallelization score and award bonus
        const parallelScore = calculateParallelizationScore(graph);

        if (parallelScore >= 70) {
          parallelizationBonus = 15; // Excellent parallelization
          recommendations.push('Excellent task parallelization - estimated time savings significant');
        } else if (parallelScore >= 40) {
          parallelizationBonus = 10; // Good parallelization
        } else {
          parallelizationBonus = 5; // Some parallelization
          recommendations.push('Consider identifying more independent tasks for parallel execution');
        }

        // Calculate time savings and add to report
        const timeSavings = calculateTimeSavings(graph);
        if (timeSavings.saved > 0) {
          const hours = Math.round(timeSavings.saved / 60 * 10) / 10;
          recommendations.push(`Parallel execution could save ~${hours} hours (${Math.round(timeSavings.percentage)}%)`);
        }
      }
    } else {
      // No dependencies found
      if (taskCount > 3) {
        actionability -= 20;
        recommendations.push('Define task dependencies to enable parallel execution and show order');
      }
    }
  } catch (error) {
    // Dependency parsing failed - not critical but worth noting
    if (taskCount > 3) {
      recommendations.push('Add Dependencies field to tasks for parallel execution planning');
    }
  }

  // Add dependency and parallelization bonuses
  actionability += dependencyScore + parallelizationBonus;

  // Feasibility metrics
  let feasibility = 100;

  // Check for technology choices
  const hasTechChoices = plan.architecture?.components?.every(c => c.tech);
  if (!hasTechChoices && componentCount > 0) {
    feasibility -= 20;
    recommendations.push('Specify technology choices for each component');
  }

  // Check for unrealistic effort
  const totalEffort = plan.timeline?.totalEffort || '';
  const totalHours = parseInt(totalEffort) || 0;
  if (totalHours > 200) {
    feasibility -= 15;
    recommendations.push('Consider breaking into smaller milestones (plan is >200 hours)');
  }

  // Calculate overall score
  completeness = Math.max(0, Math.min(100, completeness));
  actionability = Math.max(0, Math.min(100, actionability));
  feasibility = Math.max(0, Math.min(100, feasibility));

  const overall = Math.round((completeness + actionability + feasibility) / 3);
  const passed = overall >= threshold;

  return {
    overall,
    completeness: Math.round(completeness),
    actionability: Math.round(actionability),
    feasibility: Math.round(feasibility),
    threshold,
    passed,
    issues,
    recommendations
  };
}

/**
 * Validate implementation quality
 *
 * @param {object} implementation - Implementation metrics
 * @param {object} options - Validation options
 * @returns {object} Quality report
 */
export function validateImplementation(implementation, options = {}) {
  const threshold = options.threshold || DEFAULT_IMPL_THRESHOLD;
  const issues = [];
  const recommendations = [];

  let overall = 100;

  // Tests must be written
  if (!implementation.testsWritten) {
    issues.push('No tests written');
    overall = 0; // Automatic fail
  } else {
    // Tests must be passing
    if (!implementation.testsPassing) {
      issues.push('Tests are failing');
      overall -= 50;
    }

    // Coverage must be >= 80%
    const coverage = implementation.coverage || 0;
    if (coverage < 80) {
      issues.push(`Test coverage below 80%`);
      overall -= (80 - coverage);
    }
  }

  // No lint errors allowed
  if (implementation.lintErrors > 0) {
    issues.push(`${implementation.lintErrors} lint errors`);
    overall -= Math.min(30, implementation.lintErrors * 2);
  }

  // Acceptance criteria should be documented
  const criteriaCount = implementation.acceptanceCriteriaMet?.length || 0;
  if (criteriaCount === 0) {
    issues.push('No acceptance criteria documented as met');
    recommendations.push('Explicitly verify each acceptance criterion');
    overall -= 10;
  }

  // Calculate scores
  overall = Math.max(0, Math.min(100, overall));
  const passed = overall >= threshold &&
                 implementation.testsWritten &&
                 implementation.testsPassing &&
                 (implementation.coverage || 0) >= 80 &&
                 implementation.lintErrors === 0;

  return {
    overall: Math.round(overall),
    testCoverage: implementation.coverage || 0,
    threshold,
    passed,
    issues,
    recommendations
  };
}
