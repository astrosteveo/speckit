/**
 * State Management for SpecKit
 *
 * Manages workflow state in .speckit/state.json
 * Principle: Simple, inspectable, human-editable JSON
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';

const STATE_FILE = 'state.json';
const PHASES = ['constitute', 'specify', 'plan', 'implement'];
const VALID_STATUSES = ['pending', 'in_progress', 'completed'];

/**
 * Initialize a new workflow
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {string} workflowId - Unique workflow identifier (YYYY-MM-DD-slug)
 * @param {string} projectName - Human-readable project name
 * @returns {object} Initial state object
 */
export function initWorkflow(baseDir, workflowId, projectName) {
  const statePath = join(baseDir, STATE_FILE);

  // Check if workflow already exists
  if (existsSync(statePath)) {
    throw new Error('Workflow already exists. Use loadState() to load existing workflow.');
  }

  // Ensure directory exists
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  const now = new Date().toISOString();

  const initialState = {
    workflowId,
    projectName,
    version: '1.0',
    createdAt: now,
    updatedAt: now,
    currentPhase: 'constitute',
    phases: {
      constitute: {
        status: 'pending',
        quality: null,
        startedAt: null,
        completedAt: null
      },
      specify: {
        status: 'pending',
        quality: null,
        startedAt: null,
        completedAt: null
      },
      plan: {
        status: 'pending',
        quality: null,
        startedAt: null,
        completedAt: null
      },
      implement: {
        status: 'pending',
        quality: null,
        startedAt: null,
        completedAt: null
      }
    }
  };

  // Write to file
  writeFileSync(statePath, JSON.stringify(initialState, null, 2), 'utf-8');

  return initialState;
}

/**
 * Load existing workflow state
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @returns {object} State object
 */
export function loadState(baseDir) {
  const statePath = join(baseDir, STATE_FILE);

  if (!existsSync(statePath)) {
    throw new Error('No workflow state found. Initialize a new workflow with initWorkflow().');
  }

  try {
    const content = readFileSync(statePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid state file. The state.json file is corrupted.');
    }
    throw error;
  }
}

/**
 * Save state to file using atomic write pattern
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {object} state - State object to save
 */
function saveState(baseDir, state) {
  const statePath = join(baseDir, STATE_FILE);
  const tmpPath = join(baseDir, `${STATE_FILE}.tmp`);

  state.updatedAt = new Date().toISOString();

  // Write to temporary file first
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8');

  // Atomic rename (ensures no partial writes)
  renameSync(tmpPath, statePath);
}

/**
 * Update phase status
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {string} phaseName - Phase to update
 * @param {string} status - New status (pending/in_progress/completed)
 * @param {number} [quality] - Quality score (0-100)
 * @returns {object} Updated state
 */
export function updatePhase(baseDir, phaseName, status, quality = null) {
  // Validate inputs
  if (!PHASES.includes(phaseName)) {
    throw new Error(`Invalid phase: ${phaseName}. Must be one of: ${PHASES.join(', ')}`);
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const state = loadState(baseDir);
  const now = new Date().toISOString();

  // Update phase
  state.phases[phaseName].status = status;

  if (status === 'in_progress' && !state.phases[phaseName].startedAt) {
    state.phases[phaseName].startedAt = now;
  }

  if (status === 'completed') {
    state.phases[phaseName].completedAt = now;
    if (quality !== null) {
      state.phases[phaseName].quality = quality;
    }

    // Move to next phase
    const currentIndex = PHASES.indexOf(phaseName);
    if (currentIndex < PHASES.length - 1) {
      state.currentPhase = PHASES[currentIndex + 1];
    }
  }

  saveState(baseDir, state);
  return state;
}

/**
 * Get current phase name
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @returns {string} Current phase name
 */
export function getCurrentPhase(baseDir) {
  const state = loadState(baseDir);
  return state.currentPhase;
}

/**
 * Calculate workflow progress percentage
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @returns {number} Progress percentage (0-100)
 */
export function getProgress(baseDir) {
  const state = loadState(baseDir);
  const completedPhases = PHASES.filter(
    phase => state.phases[phase].status === 'completed'
  ).length;

  return Math.round((completedPhases / PHASES.length) * 100);
}

/**
 * Check if workflow is complete
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @returns {boolean} True if all phases completed
 */
export function isComplete(baseDir) {
  const state = loadState(baseDir);
  return PHASES.every(phase => state.phases[phase].status === 'completed');
}

/**
 * Reset workflow to initial state
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @returns {object} Reset state
 */
export function resetWorkflow(baseDir) {
  const state = loadState(baseDir);

  // Reset all phases
  PHASES.forEach(phase => {
    state.phases[phase] = {
      status: 'pending',
      quality: null,
      startedAt: null,
      completedAt: null
    };
  });

  state.currentPhase = 'constitute';

  saveState(baseDir, state);
  return state;
}
