/**
 * Constitute Command
 *
 * Run the constitute phase - define project principles interactively
 */

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { colors, log, prompt, confirm, Spinner } from '../core/cli.js';
import { loadState, updatePhase } from '../core/state.js';
import { getConstituteQuestions, executeConstitutePhase } from '../phases/constitute.js';

export async function constituteCommand(args, flags) {
  const cwd = process.cwd();
  const speckitDir = join(cwd, '.speckit');

  // Check if workflow exists
  if (!existsSync(speckitDir)) {
    log.error('No SpecKit workflow found');
    log.info('Run `speckit init` to initialize a workflow');
    return { success: false };
  }

  // Load state
  const state = loadState(speckitDir);

  // Check if already completed
  if (state.phases.constitute.status === 'completed') {
    log.warning('Constitute phase already completed');

    const redo = await confirm('Run constitute phase again?', false);
    if (!redo) {
      log.info('Skipping constitute phase');
      return { success: false };
    }
  }

  // Update phase to in_progress
  updatePhase(speckitDir, 'constitute', 'in_progress');

  console.log('');
  console.log(colors.bright('═'.repeat(60)));
  console.log(colors.bright('📜 Phase 1: Constitute - Quick Setup'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');
  console.log('Let\'s get started. Just a couple quick questions...\n');

  // Gather responses (streamlined)
  const responses = {
    principles: [],
    priorities: [],
    constraints: []
  };

  // Question 1: What are you building? (REQUIRED)
  console.log(colors.bright('What are you building?'));
  console.log(colors.dim('(Be as brief or detailed as you want)\n'));
  responses.purpose = await prompt('Project');

  if (!responses.purpose || responses.purpose.trim() === '') {
    log.error('Project description required');
    return { success: false };
  }
  console.log('');

  // Question 2: Any specific priorities? (OPTIONAL)
  console.log(colors.bright('Any specific priorities?'));
  console.log(colors.dim('(e.g., "fast and simple", "secure", or just hit enter to skip)\n'));
  const priorities = await prompt('Priorities (optional)', '');

  if (priorities && priorities.trim()) {
    // Parse comma-separated priorities
    responses.priorities = priorities.split(',').map(p => p.trim()).filter(p => p);
  }
  console.log('');

  // Question 3: Anything to avoid? (OPTIONAL)
  console.log(colors.bright('Anything to avoid or constraints?'));
  console.log(colors.dim('(e.g., "no databases", "keep it simple", or just hit enter to skip)\n'));
  const constraints = await prompt('Constraints (optional)', '');

  if (constraints && constraints.trim()) {
    // Parse comma-separated constraints
    responses.constraints = constraints.split(',').map(c => c.trim()).filter(c => c);
  }
  console.log('');

  // Execute phase
  const spinner = new Spinner('Creating constitution...');
  spinner.start();

  try {
    const constitution = executeConstitutePhase(speckitDir, state.projectName, responses);

    spinner.succeed('Constitution created!');

    // Mark phase complete
    updatePhase(speckitDir, 'constitute', 'completed');

    console.log('');
    console.log(colors.success('✓ Constitute phase complete'));
    console.log('');
    console.log(colors.bright('Constitution saved to:') + ' .speckit/CONSTITUTION.md');
    console.log('');
    console.log(colors.bright('Next step:'));
    console.log(`  Run ${colors.cyan('speckit specify')} to create detailed requirements`);
    console.log('');

    return { success: true, constitution };
  } catch (error) {
    spinner.fail('Failed to create constitution');
    throw error;
  }
}
