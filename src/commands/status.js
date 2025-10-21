/**
 * Status Command
 *
 * Show workflow progress and status
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { colors, log, table } from '../core/cli.js';
import { loadState, getProgress, getCurrentPhase } from '../core/state.js';

export async function statusCommand(args, flags) {
  const cwd = process.cwd();
  const speckitDir = join(cwd, '.speckit');

  // Check if initialized
  if (!existsSync(speckitDir)) {
    log.error('No SpecKit workflow found in this directory');
    log.info('Run `speckit init` to initialize a new workflow');
    return { success: false };
  }

  try {
    const state = loadState(speckitDir);
    const progress = getProgress(speckitDir);
    const currentPhase = getCurrentPhase(speckitDir);

    // Header
    console.log('');
    console.log(colors.bright('═'.repeat(60)));
    console.log(colors.bright(`📊 SpecKit Workflow Status`));
    console.log(colors.bright('═'.repeat(60)));
    console.log('');

    // Project info
    console.log(`${colors.bright('Project:')} ${state.projectName}`);
    console.log(`${colors.bright('Workflow ID:')} ${state.workflowId}`);
    console.log(`${colors.bright('Created:')} ${new Date(state.createdAt).toLocaleDateString()}`);
    console.log(`${colors.bright('Last Updated:')} ${new Date(state.updatedAt).toLocaleString()}`);
    console.log('');

    // Progress bar
    const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
    console.log(`${colors.bright('Progress:')} [${colors.cyan(progressBar)}] ${progress}%`);
    console.log('');

    // Phase status
    console.log(colors.bright('Phase Status:'));
    console.log('');

    const phases = [
      { name: 'Constitute', key: 'constitute' },
      { name: 'Specify', key: 'specify' },
      { name: 'Plan', key: 'plan' },
      { name: 'Implement', key: 'implement' }
    ];

    phases.forEach(({ name, key }) => {
      const phase = state.phases[key];
      let statusIcon, statusText, qualityText;

      if (phase.status === 'completed') {
        statusIcon = colors.green('✅');
        statusText = colors.green('Complete');
        qualityText = phase.quality ? colors.cyan(`${phase.quality.overall || phase.quality}/100`) : '';
      } else if (phase.status === 'in_progress') {
        statusIcon = colors.yellow('⏳');
        statusText = colors.yellow('In Progress');
        qualityText = '';
      } else {
        statusIcon = colors.gray('⏸️');
        statusText = colors.gray('Pending');
        qualityText = '';
      }

      console.log(`  ${statusIcon} ${colors.bright(name.padEnd(12))} ${statusText.padEnd(20)} ${qualityText}`);
    });

    console.log('');

    // Current phase details
    if (currentPhase) {
      console.log(colors.bright('Current Phase:') + ` ${colors.cyan(currentPhase)}`);

      // Implementation progress
      if (currentPhase === 'implement' && state.phases.implement.taskProgress) {
        const taskProgress = state.phases.implement.taskProgress;
        const completed = Object.values(taskProgress).filter(s => s === 'completed').length;
        const total = Object.keys(taskProgress).length;

        if (total > 0) {
          console.log(`${colors.bright('Tasks:')} ${completed}/${total} completed`);
        }
      }
    }

    console.log('');

    // Next action
    if (progress < 100) {
      console.log(colors.bright('Next Action:'));

      if (state.phases.constitute.status === 'pending') {
        console.log(`  Run ${colors.cyan('speckit constitute')} to define project principles`);
      } else if (state.phases.specify.status === 'pending') {
        console.log(`  Run ${colors.cyan('speckit specify')} to create requirements`);
      } else if (state.phases.plan.status === 'pending') {
        console.log(`  Run ${colors.cyan('speckit plan')} to design architecture`);
      } else if (state.phases.implement.status === 'pending') {
        console.log(`  Run ${colors.cyan('speckit implement')} to start building`);
      } else if (state.phases.implement.status === 'in_progress') {
        console.log(`  Run ${colors.cyan('speckit implement')} to continue building`);
      }

      console.log('');
    } else {
      log.success('Workflow complete! 🎉');
      console.log('');
    }

    // JSON output if requested
    if (flags.json) {
      console.log(JSON.stringify(state, null, 2));
    }

    return { success: true, state };
  } catch (error) {
    log.error('Failed to load workflow state');
    throw error;
  }
}
