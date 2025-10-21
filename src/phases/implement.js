/**
 * Implement Phase Orchestrator
 *
 * Launches Implementation Engineer agent for each task
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { validateImplementation } from '../core/quality.js';

/**
 * Execute the implement phase
 *
 * This launches the Implementation Engineer agent for each task
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {object} plan - Approved technical plan
 * @param {string} currentTaskId - Task ID to implement (null for next task)
 * @returns {Promise<object>} Implementation result
 */
export async function executeImplementPhase(baseDir, plan, currentTaskId = null) {
  // This would be called by the /speckit command, which uses the Task tool
  // to invoke the Implementation Engineer agent.
  //
  // The agent prompt is in .claude/agents/engineer.md
  //
  // The command should:
  // 1. Load the plan from PLAN.md
  // 2. Find the next task to implement (or resume current task)
  // 3. Launch the Implementation Engineer agent with task details
  //
  // The agent will:
  // 1. Follow RED → GREEN → REFACTOR cycle
  // 2. Write tests first
  // 3. Implement code to pass tests
  // 4. Refactor and validate
  // 5. Validate using validateImplementation()
  // 6. Save quality report to .speckit/quality/T{id}-quality.json
  // 7. Commit changes
  //
  // This function is a placeholder that shows the expected structure
  // The actual work is done by the agent

  throw new Error('This function should be called by the /speckit command using the Task tool to invoke the Implementation Engineer agent');
}

/**
 * Get next task to implement
 *
 * @param {object} plan - Technical plan
 * @param {object} state - Workflow state
 * @returns {object|null} Next task or null if all complete
 */
export function getNextTask(plan, state) {
  // Find first task that isn't completed
  const implementPhase = state.phases.implement;

  if (!implementPhase.taskProgress) {
    implementPhase.taskProgress = {};
  }

  // Find task that is pending or in_progress
  for (const task of plan.tasks) {
    const taskStatus = implementPhase.taskProgress[task.taskId];

    if (!taskStatus || taskStatus !== 'completed') {
      return task;
    }
  }

  return null; // All tasks complete
}

/**
 * Validate and save implementation
 *
 * Called by the agent to validate and save implementation results
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {string} taskId - Task ID
 * @param {object} implementation - Implementation metrics
 * @returns {object} Quality report
 */
export function validateAndSaveImplementation(baseDir, taskId, implementation) {
  // Validate implementation
  const qualityReport = validateImplementation(implementation);

  // Ensure quality directory exists
  const qualityDir = join(baseDir, 'quality');
  if (!existsSync(qualityDir)) {
    mkdirSync(qualityDir, { recursive: true });
  }

  // Save quality report
  const qualityPath = join(qualityDir, `${taskId}-quality.json`);
  writeFileSync(qualityPath, JSON.stringify(qualityReport, null, 2), 'utf-8');

  return qualityReport;
}

/**
 * Calculate implementation progress
 *
 * @param {object} plan - Technical plan
 * @param {object} state - Workflow state
 * @returns {object} Progress data
 */
export function calculateImplementProgress(plan, state) {
  const implementPhase = state.phases.implement;
  const taskProgress = implementPhase.taskProgress || {};

  const totalTasks = plan.tasks.length;
  const completedTasks = Object.values(taskProgress).filter(status => status === 'completed').length;
  const percentage = Math.round((completedTasks / totalTasks) * 100);

  return {
    totalTasks,
    completedTasks,
    percentage,
    currentTask: getNextTask(plan, state)
  };
}

/**
 * Update task status in state
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {object} state - Workflow state
 * @param {string} taskId - Task ID
 * @param {string} status - Status (pending/in_progress/completed)
 */
export function updateTaskStatus(baseDir, state, taskId, status) {
  const implementPhase = state.phases.implement;

  if (!implementPhase.taskProgress) {
    implementPhase.taskProgress = {};
  }

  implementPhase.taskProgress[taskId] = status;

  // Save state
  const statePath = join(baseDir, 'state.json');
  state.updatedAt = new Date().toISOString();
  writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}
