/**
 * Validate the technical plan
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { validatePlan } from '../src/core/quality.js';

const PLAN_PATH = join(process.cwd(), '.speckit/PLAN.md');
const QUALITY_DIR = join(process.cwd(), '.speckit/quality');
const QUALITY_REPORT_PATH = join(QUALITY_DIR, 'plan-quality.json');

// Ensure quality directory exists
if (!existsSync(QUALITY_DIR)) {
  mkdirSync(QUALITY_DIR, { recursive: true });
}

// Read and parse plan
const planMarkdown = readFileSync(PLAN_PATH, 'utf-8');

// Extract plan data from markdown
const plan = {
  architecture: {
    overview: extractSection(planMarkdown, 'Architecture Overview'),
    components: extractComponents(planMarkdown)
  },
  tasks: extractTasks(planMarkdown),
  timeline: extractTimeline(planMarkdown)
};

// Run validation
const qualityReport = validatePlan(plan, { threshold: 85 });

// Save quality report
writeFileSync(QUALITY_REPORT_PATH, JSON.stringify(qualityReport, null, 2), 'utf-8');

// Display results
console.log('\n=== PLAN QUALITY REPORT ===\n');
console.log(`Overall Score: ${qualityReport.overall}/100`);
console.log(`Completeness: ${qualityReport.completeness}/100`);
console.log(`Actionability: ${qualityReport.actionability}/100`);
console.log(`Feasibility: ${qualityReport.feasibility}/100`);
console.log(`\nPassed: ${qualityReport.passed ? '✅ YES' : '❌ NO'}`);

if (qualityReport.issues.length > 0) {
  console.log('\nIssues:');
  qualityReport.issues.forEach(issue => console.log(`  - ${issue}`));
}

if (qualityReport.recommendations.length > 0) {
  console.log('\nRecommendations:');
  qualityReport.recommendations.forEach(rec => console.log(`  - ${rec}`));
}

console.log(`\nQuality report saved to: ${QUALITY_REPORT_PATH}\n`);

// Exit with appropriate code
process.exit(qualityReport.passed ? 0 : 1);

// Helper functions
function extractSection(markdown, heading) {
  const regex = new RegExp(`## ${heading}\\s+([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}

function extractComponents(markdown) {
  const components = [];
  const componentRegex = /### Component \d+: (.+?)\n\n\*\*Technology\*\*: (.+?)\n/g;
  let match;

  while ((match = componentRegex.exec(markdown)) !== null) {
    components.push({
      name: match[1].trim(),
      tech: match[2].trim()
    });
  }

  return components;
}

function extractTasks(markdown) {
  const tasks = [];
  const taskRegex = /#### (TASK-[\d.]+): (.+?)\n\n\*\*Effort\*\*: (\d+) hours/g;
  let match;

  while ((match = taskRegex.exec(markdown)) !== null) {
    const taskId = match[1];
    const title = match[2];
    const effort = match[3];

    // Extract dependencies
    const depRegex = new RegExp(`#### ${taskId}:[\\s\\S]*?\\*\\*Dependencies\\*\\*: (.+?)\\n`, 'i');
    const depMatch = markdown.match(depRegex);
    const dependencies = depMatch && depMatch[1] !== 'None'
      ? depMatch[1].split(',').map(d => d.trim())
      : [];

    tasks.push({
      id: taskId,
      title,
      effort: `${effort} hours`,
      dependencies
    });
  }

  return tasks;
}

function extractTimeline(markdown) {
  const timelineSection = extractSection(markdown, 'Execution Timeline');
  const effortMatch = timelineSection.match(/\*\*Total Effort\*\*: (\d+) hours/);

  return {
    totalEffort: effortMatch ? `${effortMatch[1]} hours` : '0 hours'
  };
}
