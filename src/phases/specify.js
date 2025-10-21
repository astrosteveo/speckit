/**
 * Specify Phase Orchestrator
 *
 * Launches Requirements Analyst agent to create specification
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { validateSpecification } from '../core/quality.js';

/**
 * Execute the specify phase
 *
 * This launches the Requirements Analyst agent
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {string} projectName - Project name
 * @param {string} projectDescription - User's project description
 * @param {object} constitution - Constitution data
 * @returns {Promise<object>} Specification data and quality report
 */
export async function executeSpecifyPhase(baseDir, projectName, projectDescription, constitution) {
  // This would be called by the /speckit command, which uses the Task tool
  // to invoke the Requirements Analyst agent.
  //
  // The agent prompt is in .claude/agents/analyst.md
  //
  // The command should pass:
  // - Project name
  // - Constitution content (from CONSTITUTION.md)
  // - Project description
  //
  // The agent will:
  // 1. Create the specification following the template
  // 2. Validate it using validateSpecification()
  // 3. Save to .speckit/SPECIFICATION.md
  // 4. Save quality report to .speckit/quality/spec-quality.json
  //
  // This function is a placeholder that shows the expected structure
  // The actual work is done by the agent

  throw new Error('This function should be called by the /speckit command using the Task tool to invoke the Requirements Analyst agent');
}

/**
 * Validate and save specification
 *
 * Called by the agent to validate and save the spec
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {object} spec - Specification object
 * @returns {object} Quality report
 */
export function validateAndSaveSpecification(baseDir, spec) {
  // Validate specification
  const qualityReport = validateSpecification(spec);

  // Ensure quality directory exists
  const qualityDir = join(baseDir, 'quality');
  if (!existsSync(qualityDir)) {
    mkdirSync(qualityDir, { recursive: true });
  }

  // Save quality report
  const qualityPath = join(qualityDir, 'spec-quality.json');
  writeFileSync(qualityPath, JSON.stringify(qualityReport, null, 2), 'utf-8');

  // Add quality info to spec
  spec.qualityScore = qualityReport.overall;
  spec.completeness = qualityReport.completeness;
  spec.clarity = qualityReport.clarity;
  spec.testability = qualityReport.testability;
  spec.qualityPassed = qualityReport.passed;
  spec.qualityIssues = qualityReport.issues.length > 0 ? { issues: qualityReport.issues } : null;
  spec.qualityRecommendations = qualityReport.recommendations.length > 0 ? { recommendations: qualityReport.recommendations } : null;

  return qualityReport;
}

/**
 * Create a specification object from structured data
 *
 * Helper for agents to structure their output
 *
 * @param {object} data - Structured specification data
 * @returns {object} Specification object
 */
export function createSpecification(data) {
  return {
    projectName: data.projectName,
    version: data.version || '1.0',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    status: data.status || 'draft',
    overview: data.overview,
    functionalRequirements: data.functionalRequirements || [],
    nonFunctionalRequirements: data.nonFunctionalRequirements || [],
    userStories: data.userStories || [],
    constraints: data.constraints || [],
    successMetrics: data.successMetrics || [],
    assumptions: data.assumptions || [],
    openQuestions: data.openQuestions || [],
    outOfScope: data.outOfScope || []
  };
}
