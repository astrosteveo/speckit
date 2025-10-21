#!/usr/bin/env node
/**
 * Validate the SPECIFICATION.md and generate quality report
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateSpecification } from '../src/core/quality.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function parseSpecification(content) {
  const spec = {
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    userStories: [],
    constraints: [],
    successMetrics: [],
    assumptions: [],
    openQuestions: [],
    outOfScope: []
  };

  // Extract functional requirements
  const frMatches = content.matchAll(/### (FR\d+): (.+?)\n\n\*\*Description\*\*: (.+?)\n\n\*\*Priority/gs);
  for (const match of frMatches) {
    spec.functionalRequirements.push({
      id: match[1],
      title: match[2],
      description: match[3],
      priority: 'High'
    });
  }

  // Extract non-functional requirements
  const nfrMatches = content.matchAll(/### (NFR\d+): (.+?)\n\n\*\*Description\*\*: (.+?)\n\n\*\*Metric\*\*: (.+?)\n/gs);
  for (const match of nfrMatches) {
    spec.nonFunctionalRequirements.push({
      id: match[1],
      title: match[2],
      description: match[3],
      metric: match[4]
    });
  }

  // Extract user stories
  const storyMatches = content.matchAll(/### Story \d+: (.+?)\n\n\*\*As a\*\* (.+?)\n\*\*I want\*\* (.+?)\n\*\*So that\*\* (.+?)\n\n\*\*Acceptance Criteria\*\*:\n\n((?:- \[.*?\n)+)/gs);
  for (const match of storyMatches) {
    const criteria = match[5].split('\n').filter(c => c.trim()).map(c => c.replace(/^- \[ \] /, ''));
    spec.userStories.push({
      title: match[1],
      story: `As a ${match[2]}, I want ${match[3]} so that ${match[4]}`,
      role: match[2],
      feature: match[3],
      benefit: match[4],
      acceptanceCriteria: criteria
    });
  }

  return spec;
}

async function main() {
  try {
    console.log('Reading SPECIFICATION.md...');
    const specPath = join(__dirname, 'SPECIFICATION.md');
    const content = await readFile(specPath, 'utf-8');

    console.log('Parsing specification...');
    const spec = await parseSpecification(content);

    console.log('Validating specification...');
    console.log(`  Found ${spec.functionalRequirements.length} functional requirements`);
    console.log(`  Found ${spec.nonFunctionalRequirements.length} non-functional requirements`);
    console.log(`  Found ${spec.userStories.length} user stories`);

    const report = validateSpecification(spec, { threshold: 85 });

    console.log('\n=== Quality Validation Report ===\n');
    console.log(`Overall Score: ${report.overall}/100`);
    console.log(`Completeness: ${report.completeness}/100`);
    console.log(`Clarity: ${report.clarity}/100`);
    console.log(`Testability: ${report.testability}/100`);
    console.log(`Threshold: ${report.threshold}/100`);
    console.log(`Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (report.issues.length > 0) {
      console.log('\nIssues:');
      report.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    // Save quality report
    console.log('\nSaving quality report...');
    const qualityDir = join(__dirname, 'quality');
    await mkdir(qualityDir, { recursive: true });

    const reportPath = join(qualityDir, 'spec-quality.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`Quality report saved to: ${reportPath}`);

    // Update SPECIFICATION.md with quality report
    const updatedContent = content.replace(
      /## Quality Report\n\n.*?\n\n\*\*Overall Score\*\*: TBD\/100\n\n\*\*Metrics\*\*:\n- Completeness: TBD\/100\n- Clarity: TBD\/100\n- Testability: TBD\/100\n\n\*\*Status\*\*: ⏸ Pending Validation/s,
      `## Quality Report\n\nGenerated: ${new Date().toISOString()}\n\n**Overall Score**: ${report.overall}/100\n\n**Metrics**:\n- Completeness: ${report.completeness}/100\n- Clarity: ${report.clarity}/100\n- Testability: ${report.testability}/100\n\n**Status**: ${report.passed ? '✅ Passed' : '❌ Needs Refinement'}`
    );

    await writeFile(specPath, updatedContent, 'utf-8');
    console.log('SPECIFICATION.md updated with quality report');

    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    console.error('Error validating specification:', error);
    process.exit(1);
  }
}

main();
