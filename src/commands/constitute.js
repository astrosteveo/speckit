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
  console.log(colors.bright('📜 Phase 1: Constitute - Define Project Principles'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');
  console.log('Let\'s establish the guiding principles for your project.');
  console.log('This constitution will serve as the north star for all decisions.\n');

  // Gather responses
  const responses = {
    principles: [],
    priorities: [],
    nonNegotiables: [],
    successCriteria: []
  };

  // Question 1: Purpose
  console.log(colors.bright('Question 1: Core Purpose'));
  console.log(colors.dim('What is the core purpose of this project? (1-2 sentences)\n'));
  responses.purpose = await prompt('Purpose');
  console.log('');

  // Question 2: Principles
  console.log(colors.bright('Question 2: Guiding Principles'));
  console.log(colors.dim('What principles should guide decisions? (3-5 principles)\n'));

  const numPrinciples = parseInt(await prompt('How many principles? (3-5)', '3'));

  for (let i = 0; i < numPrinciples; i++) {
    console.log(colors.cyan(`\nPrinciple ${i + 1}:`));
    const title = await prompt('  Title');
    const description = await prompt('  Description');
    responses.principles.push({ title, description });
  }
  console.log('');

  // Question 3: Priorities
  console.log(colors.bright('Question 3: Priorities'));
  console.log(colors.dim('What should this project optimize for? (2-4 priorities)\n'));

  const numPriorities = parseInt(await prompt('How many priorities? (2-4)', '3'));

  for (let i = 0; i < numPriorities; i++) {
    console.log(colors.cyan(`\nPriority ${i + 1}:`));
    const name = await prompt('  Name');
    const rationale = await prompt('  Rationale');
    responses.priorities.push({ name, rationale });
  }
  console.log('');

  // Question 4: Non-negotiables
  console.log(colors.bright('Question 4: Non-Negotiables'));
  console.log(colors.dim('What will you NOT compromise on? (1-5 items)\n'));

  const numNonNegotiables = parseInt(await prompt('How many non-negotiables? (1-5)', '3'));

  for (let i = 0; i < numNonNegotiables; i++) {
    const item = await prompt(`  Non-negotiable ${i + 1}`);
    responses.nonNegotiables.push(item);
  }
  console.log('');

  // Question 5: Success criteria
  console.log(colors.bright('Question 5: Success Criteria'));
  console.log(colors.dim('How will you know this project succeeded? (2-5 measurable outcomes)\n'));

  const numCriteria = parseInt(await prompt('How many success criteria? (2-5)', '3'));

  for (let i = 0; i < numCriteria; i++) {
    const criterion = await prompt(`  Success criterion ${i + 1}`);
    responses.successCriteria.push(criterion);
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
