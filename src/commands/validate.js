/**
 * Validate Command
 *
 * Validate current phase quality
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { colors, log, Spinner } from '../core/cli.js';
import { loadState, getCurrentPhase } from '../core/state.js';
import { validateSpecification, validatePlan, validateImplementation } from '../core/quality.js';

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

  console.log('');
  console.log(colors.bright('═'.repeat(60)));
  console.log(colors.bright('🔍 Quality Validation'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');

  // Determine what to validate based on argument or current phase
  const type = args[0]; // spec, plan, impl
  let qualityFile = null;
  let phaseName = null;
  let artifactPath = null;
  let validator = null;

  if (type === 'spec' || (!type && state.phases.specify.status === 'completed')) {
    artifactPath = join(speckitDir, 'SPECIFICATION.md');
    qualityFile = join(speckitDir, 'quality/spec-quality.json');
    phaseName = 'Specification';
    validator = validateSpecification;
  } else if (type === 'plan' || (!type && state.phases.plan.status === 'completed')) {
    artifactPath = join(speckitDir, 'PLAN.md');
    qualityFile = join(speckitDir, 'quality/plan-quality.json');
    phaseName = 'Plan';
    validator = validatePlan;
  } else if (type === 'impl') {
    qualityFile = join(speckitDir, 'quality/impl-quality.json');
    phaseName = 'Implementation';
    validator = validateImplementation;
  } else {
    log.warning('No completed phases to validate');
    log.info('Complete specify or plan phase first, then run validation');
    log.info('Or specify type: speckit validate [spec|plan|impl]');
    return { success: false };
  }

  // Run validation if artifact exists
  let quality = null;

  if (artifactPath && existsSync(artifactPath)) {
    const spinner = new Spinner(`Validating ${phaseName}...`);
    spinner.start();

    try {
      const artifact = readFileSync(artifactPath, 'utf-8');
      quality = validator(artifact, speckitDir);

      // Save quality report
      writeFileSync(qualityFile, JSON.stringify(quality, null, 2), 'utf-8');

      spinner.succeed(`${phaseName} validated`);
    } catch (error) {
      spinner.fail('Validation failed');
      throw error;
    }
  } else if (existsSync(qualityFile)) {
    // Load existing quality report
    quality = JSON.parse(readFileSync(qualityFile, 'utf-8'));
  } else {
    log.error(`No ${phaseName.toLowerCase()} found to validate`);
    return { success: false };
  }

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

  // Return appropriate exit code
  return {
    success: quality.passed,
    quality,
    exitCode: quality.passed ? 0 : 1
  };
}
