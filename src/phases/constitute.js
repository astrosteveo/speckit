/**
 * Constitute Phase Orchestrator
 *
 * Guides interactive conversation to establish project principles
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute the constitute phase
 *
 * This is an interactive phase - no agent needed, just structured conversation
 *
 * @param {string} baseDir - Base directory (.speckit/)
 * @param {string} projectName - Project name
 * @param {object} responses - User responses to constitution questions
 * @returns {object} Constitution data
 */
export function executeConstitutePhase(baseDir, projectName, responses) {
  const {
    purpose,
    principles,
    priorities,
    nonNegotiables,
    successCriteria
  } = responses;

  // Build constitution data
  const constitution = {
    projectName,
    createdAt: new Date().toISOString(),
    purpose,
    principles: principles.map((p, index) => ({
      index: index + 1,
      title: p.title,
      description: p.description
    })),
    priorities: priorities.map(p => ({
      name: p.name,
      rationale: p.rationale
    })),
    nonNegotiables,
    successCriteria
  };

  // Render template (use __dirname to get path relative to this module)
  const template = readFileSync(
    join(__dirname, '..', 'templates', 'constitution.md'),
    'utf-8'
  );

  const rendered = renderTemplate(template, constitution);

  // Save to .speckit/CONSTITUTION.md
  const constitutionPath = join(baseDir, 'CONSTITUTION.md');
  writeFileSync(constitutionPath, rendered, 'utf-8');

  return constitution;
}

/**
 * Simple template renderer (Mustache-like)
 *
 * @param {string} template - Template string
 * @param {object} data - Data to fill template
 * @returns {string} Rendered template
 */
function renderTemplate(template, data) {
  let rendered = template;

  // Simple variable replacement {{variable}}
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
  });

  // Handle arrays with {{#array}}...{{/array}} blocks
  // For principles
  if (data.principles) {
    const principlesBlock = rendered.match(/{{#principles}}([\s\S]*?){{\/principles}}/);
    if (principlesBlock) {
      const itemTemplate = principlesBlock[1];
      const renderedItems = data.principles.map(principle => {
        let item = itemTemplate;
        Object.keys(principle).forEach(k => {
          item = item.replace(new RegExp(`{{${k}}}`, 'g'), principle[k]);
        });
        return item;
      }).join('');
      rendered = rendered.replace(principlesBlock[0], renderedItems);
    }
  }

  // For priorities
  if (data.priorities) {
    const prioritiesBlock = rendered.match(/{{#priorities}}([\s\S]*?){{\/priorities}}/);
    if (prioritiesBlock) {
      const itemTemplate = prioritiesBlock[1];
      const renderedItems = data.priorities.map(priority => {
        let item = itemTemplate;
        Object.keys(priority).forEach(k => {
          item = item.replace(new RegExp(`{{${k}}}`, 'g'), priority[k]);
        });
        return item;
      }).join('');
      rendered = rendered.replace(prioritiesBlock[0], renderedItems);
    }
  }

  // For simple arrays (nonNegotiables, successCriteria)
  if (data.nonNegotiables) {
    const block = rendered.match(/{{#nonNegotiables}}([\s\S]*?){{\/nonNegotiables}}/);
    if (block) {
      const itemTemplate = block[1];
      const renderedItems = data.nonNegotiables.map(item => {
        return itemTemplate.replace(/{{item}}/g, item);
      }).join('');
      rendered = rendered.replace(block[0], renderedItems);
    }
  }

  if (data.successCriteria) {
    const block = rendered.match(/{{#successCriteria}}([\s\S]*?){{\/successCriteria}}/);
    if (block) {
      const itemTemplate = block[1];
      const renderedItems = data.successCriteria.map(criterion => {
        return itemTemplate.replace(/{{criterion}}/g, criterion);
      }).join('');
      rendered = rendered.replace(block[0], renderedItems);
    }
  }

  return rendered;
}

/**
 * Get constitution questions for user
 *
 * @returns {Array} Array of question objects
 */
export function getConstituteQuestions() {
  return [
    {
      id: 'purpose',
      question: 'What is the core purpose of this project? (1-2 sentences)',
      type: 'text',
      required: true
    },
    {
      id: 'principles',
      question: 'What principles should guide decisions? (List 3-5 principles with brief descriptions)',
      type: 'structured',
      schema: [
        { field: 'title', type: 'text' },
        { field: 'description', type: 'text' }
      ],
      min: 3,
      max: 5,
      required: true
    },
    {
      id: 'priorities',
      question: 'What should this project optimize for? (e.g., simplicity, performance, security)',
      type: 'structured',
      schema: [
        { field: 'name', type: 'text' },
        { field: 'rationale', type: 'text' }
      ],
      min: 2,
      max: 4,
      required: true
    },
    {
      id: 'nonNegotiables',
      question: 'What are the non-negotiables? (Things you will NOT compromise on)',
      type: 'list',
      min: 1,
      max: 5,
      required: true
    },
    {
      id: 'successCriteria',
      question: 'How will you know this project succeeded? (Measurable outcomes)',
      type: 'list',
      min: 2,
      max: 5,
      required: true
    }
  ];
}
