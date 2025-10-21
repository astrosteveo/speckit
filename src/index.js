/**
 * SpecKit - Main Module
 *
 * Entry point for programmatic usage
 */

// Core modules
export {
  initWorkflow,
  loadState,
  updatePhase,
  getCurrentPhase,
  getProgress,
  isComplete,
  resetWorkflow
} from './core/state.js';

export {
  validateSpecification,
  validatePlan,
  validateImplementation
} from './core/quality.js';

// Phase orchestrators
export {
  executeConstitutePhase,
  getConstituteQuestions
} from './phases/constitute.js';

export {
  executeSpecifyPhase,
  validateAndSaveSpecification,
  createSpecification
} from './phases/specify.js';

export {
  executePlanPhase,
  validateAndSavePlan,
  createPlan
} from './phases/plan.js';

export {
  executeImplementPhase,
  getNextTask,
  validateAndSaveImplementation,
  calculateImplementProgress,
  updateTaskStatus
} from './phases/implement.js';

// Version
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgPath = join(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

export const VERSION = pkg.version;
