/**
 * Plan Phase Orchestrator
 *
 * Launches Technical Architect agent to create implementation plan
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { validatePlan } from '../core/quality.js';

/**
 * Execute the plan phase
 *
 * This launches the Technical Architect agent
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {object} specification - Approved specification
 * @returns {Promise<object>} Plan data and quality report
 */
export async function executePlanPhase(baseDir, specification) {
  // This would be called by the /speckit command, which uses the Task tool
  // to invoke the Technical Architect agent.
  //
  // The agent prompt is in .claude/agents/architect.md
  //
  // The command should pass:
  // - Specification content (from SPECIFICATION.md)
  //
  // The agent will:
  // 1. Create the technical plan following the template
  // 2. Validate it using validatePlan()
  // 3. Save to .speckit/PLAN.md
  // 4. Save quality report to .speckit/quality/plan-quality.json
  //
  // This function is a placeholder that shows the expected structure
  // The actual work is done by the agent

  throw new Error('This function should be called by the /speckit command using the Task tool to invoke the Technical Architect agent');
}

/**
 * Validate and save plan
 *
 * Called by the agent to validate and save the plan
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {object} plan - Plan object
 * @returns {object} Quality report
 */
export function validateAndSavePlan(baseDir, plan) {
  // Validate plan
  const qualityReport = validatePlan(plan);

  // Ensure quality directory exists
  const qualityDir = join(baseDir, 'quality');
  if (!existsSync(qualityDir)) {
    mkdirSync(qualityDir, { recursive: true });
  }

  // Save quality report
  const qualityPath = join(qualityDir, 'plan-quality.json');
  writeFileSync(qualityPath, JSON.stringify(qualityReport, null, 2), 'utf-8');

  // Add quality info to plan
  plan.qualityScore = qualityReport.overall;
  plan.completeness = qualityReport.completeness;
  plan.actionability = qualityReport.actionability;
  plan.feasibility = qualityReport.feasibility;
  plan.qualityPassed = qualityReport.passed;
  plan.qualityIssues = qualityReport.issues.length > 0 ? { issues: qualityReport.issues } : null;
  plan.qualityRecommendations = qualityReport.recommendations.length > 0 ? { recommendations: qualityReport.recommendations } : null;

  return qualityReport;
}

/**
 * Create a plan object from structured data
 *
 * Helper for agents to structure their output
 *
 * @param {object} data - Structured plan data
 * @returns {object} Plan object
 */
export function createPlan(data) {
  return {
    projectName: data.projectName,
    version: data.version || '1.0',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    specVersion: data.specVersion || '1.0',
    architectureOverview: data.architectureOverview,
    architecture: {
      overview: data.architectureOverview,
      components: data.components || []
    },
    components: data.components || [],
    techChoices: data.techChoices || [],
    phases: data.phases || [],
    tasks: extractAllTasks(data.phases || []),
    timeline: data.timeline || {},
    totalEffort: data.totalEffort || calculateTotalEffort(data.phases || []),
    totalDays: data.totalDays,
    hoursPerDay: data.hoursPerDay || 6,
    criticalPath: data.criticalPath,
    phaseSummary: data.phaseSummary,
    milestones: data.milestones || [],
    prerequisites: data.prerequisites || [],
    externalServices: data.externalServices || [],
    envSetup: data.envSetup || [],
    risks: data.risks || [],
    testStrategy: data.testStrategy,
    testingBreakdown: data.testingBreakdown || [],
    futureEnhancements: data.futureEnhancements || []
  };
}

/**
 * Extract all tasks from phases
 *
 * @param {Array} phases - Array of phase objects
 * @returns {Array} Flat array of all tasks
 */
function extractAllTasks(phases) {
  const tasks = [];
  phases.forEach(phase => {
    if (phase.tasks) {
      phase.tasks.forEach(task => {
        tasks.push(task);
      });
    }
  });
  return tasks;
}

/**
 * Calculate total effort from phases
 *
 * @param {Array} phases - Array of phase objects
 * @returns {string} Total effort string (e.g., "48 hours")
 */
function calculateTotalEffort(phases) {
  let total = 0;
  phases.forEach(phase => {
    const effort = parseInt(phase.totalEffort) || 0;
    total += effort;
  });
  return `${total} hours`;
}
