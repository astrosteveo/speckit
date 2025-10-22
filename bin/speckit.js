#!/usr/bin/env node

/**
 * SpecKit CLI Entry Point
 *
 * Global command-line interface for SpecKit
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from '../src/cli/parser.js';
import { routeCommand, registerCommand } from '../src/cli/router.js';

// Import commands
import { initCommand } from '../src/commands/init.js';
import { statusCommand } from '../src/commands/status.js';
import { constituteCommand } from '../src/commands/constitute.js';
import { specifyCommand } from '../src/commands/specify.js';
import { validateCommand } from '../src/commands/validate.js';
import { configCommand } from '../src/commands/config.js';
import { docsCommand } from '../src/commands/docs.js';
import { pluginsCommand } from '../src/commands/plugins.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Signal handlers for graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nReceived SIGINT. Exiting gracefully...');
  process.exit(130); // Standard exit code for SIGINT
});

process.on('SIGTERM', () => {
  console.log('\n\nReceived SIGTERM. Exiting gracefully...');
  process.exit(143); // Standard exit code for SIGTERM
});

// Register commands
registerCommand('init', initCommand, {
  description: 'Initialize a new SpecKit workflow',
  usage: 'speckit init [project-name]',
  aliases: ['i']
});

registerCommand('status', statusCommand, {
  description: 'Show workflow progress and status',
  usage: 'speckit status',
  aliases: ['s']
});

registerCommand('constitute', constituteCommand, {
  description: 'Run the constitute phase (define project principles)',
  usage: 'speckit constitute'
});

registerCommand('specify', specifyCommand, {
  description: 'Run the specify phase (create requirements)',
  usage: 'speckit specify'
});

registerCommand('validate', validateCommand, {
  description: 'Validate current phase quality',
  usage: 'speckit validate',
  aliases: ['v']
});

registerCommand('config', configCommand, {
  description: 'Get or set configuration values',
  usage: 'speckit config [get|set|unset|list] [key] [value]',
  aliases: ['c']
});

registerCommand('docs', docsCommand, {
  description: 'Generate documentation from specification and code',
  usage: 'speckit docs [generate] [--format=markdown|html] [--output=dir] [--incremental]',
  aliases: ['d']
});

registerCommand('plugins', pluginsCommand, {
  description: 'List or create plugins',
  usage: 'speckit plugins [list|create] [name]',
  aliases: ['p']
});

// Parse arguments
const parsed = parseArgs(process.argv);

// Handle version flag
if (parsed.flags.version) {
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

// Handle help flag
if (parsed.flags.help && !parsed.command) {
  showHelp();
  process.exit(0);
}

// Show help if no command
if (!parsed.command) {
  showHelp();
  process.exit(0);
}

// Route to command handler
const result = await routeCommand(parsed);

if (!result.success) {
  if (result.error === 'NO_COMMAND') {
    showHelp();
    process.exit(0);
  } else if (result.error === 'UNKNOWN_COMMAND') {
    console.error(`\nError: Unknown command '${result.command}'\n`);
    console.error(`Run 'speckit --help' to see available commands.\n`);
    process.exit(1);
  } else if (result.error === 'HANDLER_ERROR') {
    console.error(`\nError: Command failed\n`);
    console.error(result.details.message);
    if (!parsed.flags.quiet) {
      console.error('\nStack trace:');
      console.error(result.details.stack);
    }
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
┌──────────────────────────────────────────────────────────┐
│                        SpecKit v2.0                       │
│      Specification-Driven Development for Claude Code     │
└──────────────────────────────────────────────────────────┘

Usage:
  speckit <command> [options]

Commands:
  init [name]           Initialize a new SpecKit workflow
  status                Show workflow progress and status
  constitute            Run the constitute phase
  specify               Run the specify phase
  plan                  Run the plan phase
  implement             Run the implement phase
  docs                  Generate documentation
  validate              Validate current phase quality
  config <key> [value]  Get or set configuration
  plugins               List or manage plugins

Options:
  -h, --help            Show this help message
  -v, --version         Show version number
  -q, --quiet           Suppress non-essential output
  --json                Output in JSON format
  --skip-validation     Skip quality validation

Examples:
  speckit init my-app           Start new workflow
  speckit status                Check progress
  speckit docs --format html    Generate HTML docs
  speckit config get editor     Get editor config

Documentation: https://github.com/astrosteveo/speckit#readme
Report issues: https://github.com/astrosteveo/speckit/issues
`);
}
