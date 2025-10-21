/**
 * Specify Command
 *
 * Run the specify phase - create detailed requirements using Requirements Analyst
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { colors, log, confirm, Spinner } from '../core/cli.js';
import { loadState, updatePhase } from '../core/state.js';

export async function specifyCommand(args, flags) {
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

  // Check if constitute is complete
  if (state.phases.constitute.status !== 'completed') {
    log.error('Constitute phase must be completed first');
    log.info('Run `speckit constitute` to define project principles');
    return { success: false };
  }

  // Check if already completed
  if (state.phases.specify.status === 'completed') {
    log.warning('Specify phase already completed');

    const redo = await confirm('Run specify phase again?', false);
    if (!redo) {
      log.info('Skipping specify phase');
      return { success: false };
    }
  }

  console.log('');
  console.log(colors.bright('═'.repeat(60)));
  console.log(colors.bright('📋 Phase 2: Specify - Create Detailed Requirements'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');

  // Read constitution
  const constitutionPath = join(speckitDir, 'CONSTITUTION.md');
  const constitution = readFileSync(constitutionPath, 'utf-8');

  console.log(colors.bright('Constitution loaded from:') + ' .speckit/CONSTITUTION.md');
  console.log('');

  // Get project description
  console.log(colors.bright('Project Description'));
  console.log(colors.dim('Provide a detailed description of what you want to build.\n'));

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(colors.dim('(Type your description, press Ctrl+D when done)\n'));

  let description = '';
  for await (const line of rl) {
    description += line + '\n';
  }

  console.log('');

  // Update phase to in_progress
  updatePhase(speckitDir, 'specify', 'in_progress');

  console.log(colors.bright('Launching Requirements Analyst agent...'));
  console.log(colors.dim('This will create a detailed specification with:'));
  console.log(colors.dim('  • Functional requirements (5+)'));
  console.log(colors.dim('  • Non-functional requirements (2+)'));
  console.log(colors.dim('  • User stories with acceptance criteria (2+)'));
  console.log(colors.dim('  • Constraints and success metrics'));
  console.log('');

  // Note: In a real implementation, this would use the Task tool to launch the agent
  // For now, we'll provide instructions

  console.log(colors.warning('⚠ Manual step required:'));
  console.log('');
  console.log('In Claude Code, run the following:');
  console.log('');
  console.log(colors.cyan('  Use the Task tool with the Requirements Analyst agent'));
  console.log('');
  console.log('Input:');
  console.log(`  - Constitution: ${constitutionPath}`);
  console.log(`  - Description: (the text you just entered)`);
  console.log('');
  console.log('The agent will:');
  console.log('  1. Create .speckit/SPECIFICATION.md');
  console.log('  2. Validate quality (must score ≥85)');
  console.log('  3. Save quality report to .speckit/quality/spec-quality.json');
  console.log('');
  console.log('When complete, the specification will be ready for review.');
  console.log('');
  console.log(colors.bright('After agent completes:'));
  console.log(`  Run ${colors.cyan('speckit validate')} to check quality`);
  console.log(`  Then ${colors.cyan('speckit plan')} to continue`);
  console.log('');

  return { success: true, waitingForAgent: true };
}
