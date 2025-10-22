/**
 * Phase Command Helpers
 *
 * Utilities for phase commands to handle validation, quality checks, and state updates
 */

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { log, colors } from './cli.js';
import { loadState, updatePhase } from './state.js';
import { validateSpecification, validatePlan } from './quality.js';

/**
 * Validate phase prerequisite
 *
 * @param {string} speckitDir - .speckit directory path
 * @param {string} prerequisitePhase - Name of phase that must be completed
 * @returns {boolean} True if prerequisite is met
 */
export function validatePrerequisite(speckitDir, prerequisitePhase) {
  const state = loadState(speckitDir);

  if (state.phases[prerequisitePhase].status !== 'completed') {
    log.error(`${prerequisitePhase} phase must be completed first`);
    log.info(`Run 'speckit ${prerequisitePhase}' to complete the prerequisite phase`);
    return false;
  }

  return true;
}

/**
 * Run quality validation and save report
 *
 * @param {string} speckitDir - .speckit directory path
 * @param {string} phaseName - Phase being validated (specify/plan)
 * @param {boolean} skipValidation - Skip validation flag
 * @returns {object|null} Quality result or null if skipped
 */
export async function runQualityValidation(speckitDir, phaseName, skipValidation = false) {
  if (skipValidation) {
    log.warning('⚠ Quality validation skipped (--skip-validation flag)');
    console.log('');
    return null;
  }

  const validators = {
    'specify': {
      artifactPath: 'SPECIFICATION.md',
      qualityPath: 'quality/spec-quality.json',
      validator: validateSpecification,
      name: 'Specification'
    },
    'plan': {
      artifactPath: 'PLAN.md',
      qualityPath: 'quality/plan-quality.json',
      validator: validatePlan,
      name: 'Plan'
    }
  };

  const config = validators[phaseName];
  if (!config) {
    // No validation for this phase
    return null;
  }

  const artifactPath = join(speckitDir, config.artifactPath);
  const qualityPath = join(speckitDir, config.qualityPath);

  if (!existsSync(artifactPath)) {
    log.error(`${config.name} not found at ${config.artifactPath}`);
    return null;
  }

  console.log('');
  console.log(colors.bright('Running quality validation...'));

  const artifact = readFileSync(artifactPath, 'utf-8');
  const quality = config.validator(artifact, speckitDir);

  // Save quality report
  writeFileSync(qualityPath, JSON.stringify(quality, null, 2), 'utf-8');

  // Display results
  console.log('');
  console.log(colors.bright('Quality Score:'));
  console.log('');

  const scoreColor = quality.passed ? colors.green : colors.red;
  console.log(`  Overall: ${scoreColor(quality.overall + '/100')}`);

  if (quality.completeness !== undefined) {
    console.log(`  Completeness: ${quality.completeness}/100`);
  }
  if (quality.clarity !== undefined) {
    console.log(`  Clarity: ${quality.clarity}/100`);
  }
  if (quality.testability !== undefined) {
    console.log(`  Testability: ${quality.testability}/100`);
  }
  if (quality.actionability !== undefined) {
    console.log(`  Actionability: ${quality.actionability}/100`);
  }
  if (quality.feasibility !== undefined) {
    console.log(`  Feasibility: ${quality.feasibility}/100`);
  }

  console.log('');

  if (quality.issues && quality.issues.length > 0) {
    console.log(colors.red('Issues:'));
    quality.issues.forEach(issue => {
      console.log(`  ${colors.red('✗')} ${issue}`);
    });
    console.log('');
  }

  if (quality.recommendations && quality.recommendations.length > 0) {
    console.log(colors.yellow('Recommendations:'));
    quality.recommendations.forEach(rec => {
      console.log(`  ${colors.yellow('→')} ${rec}`);
    });
    console.log('');
  }

  // Check if passed
  if (!quality.passed) {
    log.error(`${config.name} quality validation failed (${quality.overall}/100, need ${quality.threshold})`);
    console.log('');
    console.log('Options:');
    console.log(`  1. Improve the ${config.name.toLowerCase()} and run 'speckit ${phaseName}' again`);
    console.log(`  2. Run with '--skip-validation' to proceed anyway (not recommended)`);
    console.log('');
    return quality;
  }

  log.success(`${config.name} meets quality standards (${quality.overall}/100)`);
  console.log('');

  return quality;
}

/**
 * Complete phase with validation
 *
 * @param {string} speckitDir - .speckit directory path
 * @param {string} phaseName - Phase to complete
 * @param {boolean} skipValidation - Skip validation flag
 * @returns {object} Result object with success status and quality
 */
export async function completePhaseWithValidation(speckitDir, phaseName, skipValidation = false) {
  // Run quality validation
  const quality = await runQualityValidation(speckitDir, phaseName, skipValidation);

  // Check if validation failed (and not skipped)
  if (quality && !quality.passed && !skipValidation) {
    return {
      success: false,
      quality,
      validationFailed: true
    };
  }

  // Update phase to completed
  const qualityScore = quality ? quality.overall : null;
  updatePhase(speckitDir, phaseName, 'completed', qualityScore);

  return {
    success: true,
    quality,
    validationFailed: false
  };
}

/**
 * Get next phase name
 *
 * @param {string} currentPhase - Current phase name
 * @returns {string|null} Next phase name or null if current is last
 */
export function getNextPhase(currentPhase) {
  const phases = ['constitute', 'specify', 'plan', 'implement'];
  const currentIndex = phases.indexOf(currentPhase);

  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return null;
  }

  return phases[currentIndex + 1];
}
