/**
 * Docs Command
 *
 * Generate documentation from specification and source code
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { colors, log, Spinner } from '../core/cli.js';
import { generateDocs } from '../core/docs.js';

export async function docsCommand(args, flags) {
  const cwd = process.cwd();
  const speckitDir = join(cwd, '.speckit');

  // Check if workflow exists
  if (!existsSync(speckitDir)) {
    log.error('No SpecKit workflow found');
    log.info('Run `speckit init` to initialize a workflow');
    return { success: false };
  }

  // Parse subcommand (default to 'generate')
  const subcommand = args[0] || 'generate';

  if (subcommand !== 'generate') {
    log.error(`Unknown subcommand: ${subcommand}`);
    log.info('Available subcommands: generate');
    return { success: false };
  }

  // Parse formats flag
  let formats = ['markdown', 'html'];
  if (flags.format) {
    const requestedFormat = flags.format.toLowerCase();
    if (!['markdown', 'html'].includes(requestedFormat)) {
      log.error(`Unknown format: ${requestedFormat}`);
      log.info('Supported formats: markdown, html');
      return { success: false };
    }
    formats = [requestedFormat];
  }

  // Parse output directory
  const outputDir = flags.output
    ? join(cwd, flags.output)
    : join(speckitDir, 'docs');

  // Parse incremental flag
  const incremental = flags.incremental || false;

  // Show what we're doing
  console.log('');
  console.log(colors.bright('═'.repeat(60)));
  console.log(colors.bright('📚 Documentation Generator'));
  console.log(colors.bright('═'.repeat(60)));
  console.log('');

  console.log(`${colors.bright('Project:')} ${cwd}`);
  console.log(`${colors.bright('Formats:')} ${formats.join(', ')}`);
  console.log(`${colors.bright('Output:')} ${outputDir}`);
  if (incremental) {
    console.log(`${colors.bright('Mode:')} Incremental`);
  }
  console.log('');

  // Start spinner
  const spinner = new Spinner('Generating documentation...');
  spinner.start();

  try {
    // Generate documentation
    const result = await generateDocs({
      projectPath: cwd,
      formats,
      outputDir,
      incremental
    });

    spinner.stop();

    if (!result.success) {
      log.error(`Failed to generate documentation: ${result.error}`);
      return { success: false, error: result.error };
    }

    // Show success
    log.success('Documentation generated successfully!');
    console.log('');

    // List generated files
    console.log(colors.bright('Generated files:'));
    for (const file of result.files) {
      console.log(`  ${colors.green('✓')} ${file}`);
    }
    console.log('');

    // Next steps
    if (formats.includes('html')) {
      const htmlFile = result.files.find(f => f.endsWith('.html'));
      if (htmlFile) {
        console.log(colors.bright('Next steps:'));
        console.log(`  Open ${colors.cyan(htmlFile)} in your browser`);
        console.log('');
      }
    }

    return { success: true, files: result.files };
  } catch (error) {
    spinner.stop();
    log.error(`Documentation generation failed: ${error.message}`);
    if (!flags.quiet) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}
