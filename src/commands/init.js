/**
 * Init Command
 *
 * Initialize a new SpecKit workflow
 */

import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { colors, log, prompt, confirm, Spinner } from '../core/cli.js';
import { initWorkflow, updatePhase } from '../core/state.js';

export async function initCommand(args, flags) {
  const projectName = args[0];
  const cwd = process.cwd();
  const speckitDir = join(cwd, '.speckit');

  // Check if already initialized
  if (existsSync(speckitDir)) {
    log.error('SpecKit workflow already exists in this directory');
    log.info('Use `speckit status` to see current progress');
    log.info('Use `speckit reset` to start over');
    return { success: false };
  }

  // Get project name if not provided
  let name = projectName;
  if (!name) {
    name = await prompt('Project name');
    if (!name) {
      log.error('Project name is required');
      return { success: false };
    }
  }

  // Confirm initialization
  if (!flags.yes && !flags.y) {
    console.log(`\n${colors.bright('SpecKit will create:')}`);
    console.log(`  • .speckit/state.json - Workflow state tracking`);
    console.log(`  • .speckit/quality/ - Quality reports`);
    console.log(`  • .speckit/CONSTITUTION.md - Project principles (after constitute phase)`);
    console.log(`  • .speckit/SPECIFICATION.md - Requirements (after specify phase)`);
    console.log(`  • .speckit/PLAN.md - Technical plan (after plan phase)\n`);

    const confirmed = await confirm('Initialize SpecKit workflow?', true);
    if (!confirmed) {
      log.info('Initialization cancelled');
      return { success: false };
    }
  }

  // Initialize workflow
  const spinner = new Spinner('Initializing SpecKit workflow...');
  spinner.start();

  try {
    // Create workflow ID
    const date = new Date().toISOString().split('T')[0];
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const workflowId = `${date}-${slug}`;

    // Initialize
    const state = initWorkflow(speckitDir, workflowId, name);

    spinner.succeed('SpecKit workflow initialized!');

    console.log(`\n${colors.bright('Next steps:')}`);
    console.log(`  1. Run ${colors.cyan('speckit constitute')} to define project principles`);
    console.log(`  2. Run ${colors.cyan('speckit specify')} to create requirements`);
    console.log(`  3. Run ${colors.cyan('speckit plan')} to design architecture`);
    console.log(`  4. Run ${colors.cyan('speckit implement')} to build with TDD`);
    console.log(`\nOr run ${colors.cyan('speckit status')} to see workflow progress\n`);

    return { success: true, state };
  } catch (error) {
    spinner.fail('Failed to initialize workflow');
    throw error;
  }
}
