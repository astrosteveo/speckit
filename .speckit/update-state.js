/**
 * Update state to mark plan phase complete
 */

import { updatePhase } from '../src/core/state.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const BASE_DIR = join(process.cwd(), '.speckit');
const QUALITY_REPORT = JSON.parse(
  readFileSync(join(BASE_DIR, 'quality/plan-quality.json'), 'utf-8')
);

// Update plan phase to completed with quality score
const state = updatePhase(BASE_DIR, 'plan', 'completed', QUALITY_REPORT.overall);

console.log('\n✅ Plan phase marked as complete');
console.log(`Quality Score: ${QUALITY_REPORT.overall}/100`);
console.log(`Current Phase: ${state.currentPhase}`);
console.log('\nNext step: Run implementation phase\n');
