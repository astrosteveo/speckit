/**
 * Plugins Command
 *
 * List and manage plugins
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { colors, log, Spinner, table, select } from '../core/cli.js';
import { loadPlugins, getPlugins } from '../core/plugins.js';

export async function pluginsCommand(args, flags) {
  const cwd = process.cwd();
  const claudeDir = join(cwd, '.claude');

  // Parse subcommand (default to 'list')
  const subcommand = args[0] || 'list';

  if (subcommand === 'list') {
    return await listPlugins(claudeDir, flags);
  } else if (subcommand === 'create') {
    const pluginName = args[1];
    if (!pluginName) {
      log.error('Plugin name required');
      log.info('Usage: speckit plugins create <name>');
      return { success: false };
    }
    return await createPlugin(claudeDir, pluginName, flags);
  } else {
    log.error(`Unknown subcommand: ${subcommand}`);
    log.info('Available subcommands: list, create');
    return { success: false };
  }
}

async function listPlugins(claudeDir, flags) {
  const cwd = process.cwd();

  console.log('');
  console.log(colors.bright('═'.repeat(60)));
  console.log(colors.bright('🔌 Loaded Plugins'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');

  // Check if .claude directory exists
  if (!existsSync(claudeDir)) {
    log.warning('No .claude directory found');
    log.info('Plugins are loaded from .claude/agents/, validators/, templates/');
    return { success: false };
  }

  // Load plugins
  const spinner = new Spinner('Loading plugins...');
  spinner.start();

  const result = await loadPlugins(claudeDir);

  spinner.stop();

  const plugins = getPlugins();

  if (plugins.length === 0) {
    log.warning('No plugins found');
    console.log('');
    console.log('Create a plugin with:');
    console.log(`  ${colors.cyan('speckit plugins create <name>')}`);
    console.log('');
    return { success: true, plugins: [] };
  }

  // Display plugins in table
  const tableData = plugins.map(p => ({
    Name: p.name,
    Version: p.version,
    Type: p.type,
    Format: p.format || 'javascript',
    Path: p.sourcePath.replace(cwd + '/', '')
  }));

  table(tableData);

  console.log('');
  console.log(colors.bright(`Total: ${plugins.length} plugin(s)`));

  // Show failed plugins if any
  if (result.failed.length > 0) {
    console.log('');
    console.log(colors.red(`Failed to load ${result.failed.length} plugin(s):`));
    for (const failure of result.failed) {
      console.log(`  ${colors.red('✗')} ${failure.file.replace(cwd + '/', '')}`);
      console.log(`    ${colors.gray(failure.error)}`);
    }
  }

  console.log('');

  return { success: true, plugins };
}

async function createPlugin(claudeDir, pluginName, flags) {
  console.log('');
  console.log(colors.bright('═'.repeat(60)));
  console.log(colors.bright('🔌 Create Plugin'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');

  console.log(`${colors.bright('Plugin name:')} ${pluginName}`);
  console.log('');

  // Prompt for plugin type
  const pluginType = await select('Select plugin type:', [
    'agent - AI agent for workflow phases',
    'validator - Custom quality validator',
    'template - Document template'
  ]);

  const type = pluginType.split(' - ')[0];

  // Determine directory and file extension
  const typeDir = join(claudeDir, `${type}s`); // agents, validators, templates
  const format = type === 'agent' ? 'markdown' : 'javascript';
  const ext = format === 'markdown' ? '.md' : '.js';
  const filePath = join(typeDir, `${pluginName}${ext}`);

  // Check if plugin already exists
  if (existsSync(filePath)) {
    log.error(`Plugin already exists: ${filePath.replace(process.cwd() + '/', '')}`);
    return { success: false };
  }

  // Create directory if it doesn't exist
  if (!existsSync(typeDir)) {
    mkdirSync(typeDir, { recursive: true });
  }

  // Generate plugin content
  let content;

  if (format === 'markdown') {
    content = generateMarkdownAgentTemplate(pluginName);
  } else {
    content = generateJSPluginTemplate(pluginName, type);
  }

  // Write plugin file
  writeFileSync(filePath, content, 'utf8');

  log.success('Plugin created successfully!');
  console.log('');
  console.log(`${colors.bright('File:')} ${filePath.replace(process.cwd() + '/', '')}`);
  console.log('');

  console.log(colors.bright('Next steps:'));
  console.log(`  1. Edit the plugin file to implement functionality`);
  console.log(`  2. Run ${colors.cyan('speckit plugins list')} to verify it loads`);
  console.log('');

  return { success: true, path: filePath };
}

function generateMarkdownAgentTemplate(name) {
  const titleCase = name.charAt(0).toUpperCase() + name.slice(1);

  return `# ${titleCase} Agent

**Role**: Describe the agent's role here

**Purpose**: Explain what this agent does and when to use it

## Instructions

Provide detailed instructions for the AI agent here.

## Tasks

1. Task 1: Describe what the agent should do
2. Task 2: Next step
3. Task 3: Final step

## Output Format

Describe the expected output format:
- File format
- Structure
- Location

## Quality Criteria

Define what makes a successful execution:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Examples

Provide examples of good outputs here.
`;
}

function generateJSPluginTemplate(name, type) {
  const templates = {
    agent: `/**
 * ${name} Agent
 *
 * TODO: Describe what this agent does
 */

export default {
  name: '${name}',
  version: '1.0.0',
  type: 'agent',
  description: 'TODO: Add description',

  /**
   * Execute the agent
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async execute(context) {
    // TODO: Implement agent logic
    return {
      success: true,
      output: {}
    };
  }
};
`,
    validator: `/**
 * ${name} Validator
 *
 * TODO: Describe what this validator checks
 */

export default {
  name: '${name}',
  version: '1.0.0',
  type: 'validator',
  description: 'TODO: Add description',

  /**
   * Validate content
   * @param {string} content - Content to validate
   * @returns {Object} Validation result
   */
  validate(content) {
    // TODO: Implement validation logic

    return {
      valid: true,
      score: 100,
      issues: [],
      recommendations: []
    };
  }
};
`,
    template: `/**
 * ${name} Template
 *
 * TODO: Describe what this template generates
 */

export default {
  name: '${name}',
  version: '1.0.0',
  type: 'template',
  description: 'TODO: Add description',

  /**
   * Generate content from template
   * @param {Object} data - Template data
   * @returns {string} Generated content
   */
  generate(data) {
    // TODO: Implement template logic
    return \`# \${data.title}

TODO: Add template content
\`;
  }
};
`
  };

  return templates[type];
}
