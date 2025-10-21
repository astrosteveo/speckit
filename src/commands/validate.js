/**
 * Validate Command
 *
 * Validate current phase quality
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { colors, log } from '../core/cli.js';
import { loadState, getCurrentPhase } from '../core/state.js';

export async function validateCommand(args, flags) {
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
  const currentPhase = getCurrentPhase(speckitDir);

  console.log('');
  console.log(colors.bright('═'.repeat(60)));
  console.log(colors.bright('🔍 Quality Validation'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');

  // Determine what to validate
  let qualityFile = null;
  let phaseName = null;

  if (state.phases.specify.status === 'completed') {
    qualityFile = join(speckitDir, 'quality/spec-quality.json');
    phaseName = 'Specification';
  }

  if (state.phases.plan.status === 'completed') {
    qualityFile = join(speckitDir, 'quality/plan-quality.json');
    phaseName = 'Plan';
  }

  if (!qualityFile || !existsSync(qualityFile)) {
    log.warning('No quality reports found yet');
    log.info('Quality validation runs after specify and plan phases');
    return { success: false };
  }

  // Load quality report
  const quality = JSON.parse(readFileSync(qualityFile, 'utf-8'));

  console.log(colors.bright(`${phaseName} Quality Report`));
  console.log('');

  // Overall score
  const scoreColor = quality.overall >= quality.threshold
    ? colors.green
    : colors.red;

  console.log(`${colors.bright('Overall Score:')} ${scoreColor(`${quality.overall}/100`)}`);
  console.log(`${colors.bright('Threshold:')} ${quality.threshold}`);
  console.log(`${colors.bright('Status:')} ${quality.passed ? colors.green('✓ PASSED') : colors.red('✗ FAILED')}`);
  console.log('');

  // Detailed metrics
  console.log(colors.bright('Detailed Metrics:'));
  console.log('');

  const metrics = Object.keys(quality).filter(k =>
    typeof quality[k] === 'number' && k !== 'overall' && k !== 'threshold'
  );

  metrics.forEach(metric => {
    const value = quality[metric];
    const bar = '█'.repeat(Math.floor(value / 10)) + '░'.repeat(10 - Math.floor(value / 10));
    console.log(`  ${metric.padEnd(15)} [${colors.cyan(bar)}] ${value}/100`);
  });

  console.log('');

  // Issues
  if (quality.issues && quality.issues.length > 0) {
    console.log(colors.red('Issues:'));
    quality.issues.forEach(issue => {
      console.log(`  ${colors.red('✗')} ${issue}`);
    });
    console.log('');
  }

  // Recommendations
  if (quality.recommendations && quality.recommendations.length > 0) {
    console.log(colors.yellow('Recommendations:'));
    quality.recommendations.forEach(rec => {
      console.log(`  ${colors.yellow('→')} ${rec}`);
    });
    console.log('');
  }

  if (quality.passed) {
    log.success(`${phaseName} meets quality standards!`);
  } else {
    log.error(`${phaseName} needs improvement`);
    console.log('');
    console.log('Address the issues above and regenerate the phase.');
  }

  console.log('');

  return { success: true, quality };
}
