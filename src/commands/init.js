/**
 * Init Command
 *
 * Initialize a new SpecKit workflow, optionally creating a new project directory
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { colors, log, prompt, confirm, Spinner } from '../core/cli.js';
import { initWorkflow, updatePhase } from '../core/state.js';

export async function initCommand(args, flags) {
  const projectName = args[0];
  let cwd = process.cwd();
  let projectDir = cwd;
  let createdProject = false;

  // Get project name if not provided
  let name = projectName;
  if (!name) {
    name = await prompt('Project name');
    if (!name) {
      log.error('Project name is required');
      return { success: false };
    }
  }

  // If project name is provided, check if we should create a new directory
  if (projectName) {
    const projectPath = join(cwd, projectName);

    if (existsSync(projectPath)) {
      // Directory exists, use it as project dir
      projectDir = projectPath;
      cwd = projectPath;
    } else {
      // Directory doesn't exist, offer to create it
      if (!flags.yes && !flags.y) {
        const shouldCreate = await confirm(
          `Create new directory "${projectName}"?`,
          true
        );
        if (!shouldCreate) {
          log.info('Using current directory instead');
        } else {
          projectDir = projectPath;
          cwd = projectPath;
          createdProject = true;
        }
      } else {
        projectDir = projectPath;
        cwd = projectPath;
        createdProject = true;
      }
    }
  }

  const speckitDir = join(cwd, '.speckit');

  // Check if already initialized
  if (existsSync(speckitDir)) {
    log.error('SpecKit workflow already exists in this directory');
    log.info('Use `speckit status` to see current progress');
    log.info('Use `speckit reset` to start over');
    return { success: false };
  }

  // Confirm initialization
  if (!flags.yes && !flags.y) {
    console.log(`\n${colors.bright('SpecKit will create:')}`);
    if (createdProject) {
      console.log(`  • ${projectName}/ - Project directory`);
      console.log(`  • .git - Git repository`);
      console.log(`  • .gitignore - Git ignore file`);
      console.log(`  • README.md - Project readme`);
    }
    console.log(`  • .speckit/state.json - Workflow state tracking`);
    console.log(`  • .speckit/quality/ - Quality reports`);
    console.log(`  • .speckit/CONSTITUTION.md - Project principles (after constitute phase)`);
    console.log(`  • .speckit/SPECIFICATION.md - Requirements (after specify phase)`);
    console.log(`  • .speckit/PLAN.md - Technical plan (after plan phase)\n`);

    const confirmed = await confirm('Initialize SpecKit workflow?', true);
    if (!confirmed) {
      log.info('Initialization cancelled');
      return { success: false };
    }
  }

  // Initialize workflow
  const spinner = new Spinner(
    createdProject ? 'Creating project and initializing SpecKit...' : 'Initializing SpecKit workflow...'
  );
  spinner.start();

  try {
    // Create project directory if needed
    if (createdProject) {
      mkdirSync(projectDir, { recursive: true });
    }

    // Create workflow ID
    const date = new Date().toISOString().split('T')[0];
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const workflowId = `${date}-${slug}`;

    // Initialize git if creating new project and git is available
    let gitInitialized = false;
    if (createdProject) {
      try {
        execSync('git --version', { stdio: 'ignore' });
        execSync('git init', { cwd: projectDir, stdio: 'ignore' });
        gitInitialized = true;

        // Create .gitignore
        const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.log

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# SpecKit (keep workflow files)
# .speckit/
`;
        writeFileSync(join(projectDir, '.gitignore'), gitignore);

        // Create README.md
        const readme = `# ${name}

> Initialized with [SpecKit](https://github.com/astrosteveo/speckit) - Specification-first development workflow

## SpecKit Workflow

This project uses SpecKit for structured development:

1. **Constitute** - Define project principles and values
2. **Specify** - Create detailed requirements
3. **Plan** - Design technical architecture
4. **Implement** - Build with TDD

## Getting Started

\`\`\`bash
# Define project principles
speckit constitute

# Create requirements
speckit specify

# Design architecture
speckit plan

# Start building
speckit implement
\`\`\`

## Development

\`\`\`bash
# Check workflow progress
speckit status

# Validate current phase
speckit validate
\`\`\`

## License

MIT
`;
        writeFileSync(join(projectDir, 'README.md'), readme);
      } catch (error) {
        // Git not available, skip git init
      }
    }

    // Initialize workflow
    const state = initWorkflow(speckitDir, workflowId, name);

    // Create subdirectories
    mkdirSync(join(speckitDir, 'quality'), { recursive: true });
    mkdirSync(join(speckitDir, 'docs'), { recursive: true });
    mkdirSync(join(speckitDir, 'templates'), { recursive: true });

    // Create initial git commit if we initialized git
    if (gitInitialized) {
      try {
        execSync('git add .', { cwd: projectDir, stdio: 'ignore' });
        execSync('git commit -m "Initial commit: SpecKit workflow initialized"', {
          cwd: projectDir,
          stdio: 'ignore'
        });
      } catch (error) {
        // Commit failed, not critical
      }
    }

    spinner.succeed(
      createdProject
        ? `Project "${name}" created and initialized!`
        : 'SpecKit workflow initialized!'
    );

    if (createdProject) {
      console.log(`\n${colors.bright('Get started:')}`);
      console.log(`  ${colors.cyan(`cd ${projectName}`)}`);
      console.log(`  ${colors.cyan('speckit constitute')}\n`);
    }

    console.log(`${colors.bright('Workflow phases:')}`);
    console.log(`  1. Run ${colors.cyan('speckit constitute')} to define project principles`);
    console.log(`  2. Run ${colors.cyan('speckit specify')} to create requirements`);
    console.log(`  3. Run ${colors.cyan('speckit plan')} to design architecture`);
    console.log(`  4. Run ${colors.cyan('speckit implement')} to build with TDD`);
    console.log(`\nOr run ${colors.cyan('speckit status')} to see workflow progress\n`);

    return { success: true, state, createdProject, projectDir };
  } catch (error) {
    spinner.fail('Failed to initialize workflow');
    throw error;
  }
}
