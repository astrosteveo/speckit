# Documentation

## Table of Contents

- [Requirements](#requirements)
- [API Reference](#api-reference)

## Requirements

### Functional Requirements

#### FR001: Global NPM Installation and Package Distribution

**Description**: Enable installation of SpecKit as a global npm package that can be invoked from any directory using the `speckit` command. The package must include proper bin configuration, entry point setup, file permissions for executables, and all necessary files bundled for distribution. Installation must complete in under 30 seconds on a standard internet connection with no errors or warnings.

**Priority**: Critical

**Testability**:
- Verify `npm install -g speckit` completes successfully in <30 seconds
- Verify `speckit --version` returns correct version number
- Verify `speckit --help` displays usage information
- Verify installation works on Linux, macOS, and Windows
- Verify no npm warnings or errors during installation
- Verify uninstallation with `npm uninstall -g speckit` removes all files

**Details**:
- Add `bin` field to package.json pointing to CLI entry point
- Create executable CLI entry script with proper shebang (`#!/usr/bin/env node`)
- Set executable permissions on CLI files
- Include all necessary files in npm package (use `files` field in package.json)
- Test installation on all major platforms (Linux, macOS, Windows)
- Provide both global (`-g`) and npx usage patterns
- Ensure zero runtime dependencies (dev dependencies allowed for testing)

---

#### FR002: Interactive Project Initialization with Smart Detection

**Description**: Implement `speckit init` command that initializes SpecKit in any directory by creating the `.speckit/` directory structure, generating default configuration files (state.json, CONSTITUTION.md template), detecting existing project metadata (package.json, git repository), and providing interactive prompts for project details with sensible defaults. The command must complete initialization in under 5 seconds and detect if SpecKit is already initialized to prevent accidental overwrites.

**Priority**: Critical

**Testability**:
- Verify `speckit init` creates `.speckit/` directory structure
- Verify `state.json` is created with correct schema and initial values
- Verify constitution template is copied to `.speckit/CONSTITUTION.md`
- Verify initialization completes in <5 seconds
- Verify command detects existing `.speckit/` and prompts before overwriting
- Verify project name is auto-detected from package.json or directory name
- Verify git repository is detected and recorded in state
- Verify interactive prompts work with default values when no input provided

**Details**:
- Create `.speckit/` directory with subdirectories: `quality/`, `docs/`, `templates/`
- Initialize `state.json` with workflow metadata structure
- Copy constitution template with placeholders for project name and description
- Auto-detect project name from package.json or current directory name
- Auto-detect git repository URL if present
- Prompt user for project description, version, and other metadata
- Provide sensible defaults for all prompts (allow Enter to accept)
- Validate user inputs (non-empty project name, valid version format)
- Display success message with next steps after initialization

---

#### FR003: Workflow Status Dashboard with Real-Time Monitoring

**Description**: Implement `speckit status` command that displays a comprehensive dashboard showing current workflow phase, completion status of each phase (constitute, specify, plan, implement), quality scores for completed phases with color-coded indicators, recent activity log with timestamps, and next recommended actions. The dashboard must refresh in under 1 second and display data in a clear, color-coded, table format with visual indicators for pass/fail status.

**Priority**: High

**Testability**:
- Verify `speckit status` displays current phase correctly
- Verify all four phases are shown with correct status (pending/in-progress/completed)
- Verify quality scores are displayed for completed phases
- Verify color coding: green for passed (85%+), yellow for warning (70-84%), red for failed (<70%)
- Verify command executes in <1 second
- Verify error handling when `.speckit/` directory not found
- Verify status includes timestamp of last update
- Verify suggested next actions are displayed based on current phase

**Details**:
- Read state from `.speckit/state.json`
- Display workflow ID, project name, version, and current phase
- Show each phase with status icon: ⏸ (pending), ⏩ (in-progress), ✅ (completed)
- Display quality scores from `.speckit/quality/*.json` files
- Use color codes: green (scores 85%+), yellow (70-84%), red (<70%)
- Show last activity timestamp in human-readable format ("2 hours ago")
- Display next recommended action based on workflow state
- Provide `--json` flag for machine-readable output

---

#### FR004: Automated Documentation Generation from Specs and Code

**Description**: Implement automatic documentation generation that reads specifications from `.speckit/SPECIFICATION.md`, extracts functional requirements, user stories, and acceptance criteria, generates API documentation from JSDoc comments in code, creates user guides from specs with examples, and outputs documentation in Markdown, HTML, and PDF formats. Documentation generation must complete in under 10 seconds for projects with <100 files and <10000 lines of code.

**Priority**: High

**Testability**:
- Verify `speckit docs generate` creates documentation files in `.speckit/docs/`
- Verify Markdown output contains all functional requirements from spec
- Verify HTML output is valid and renders correctly in browsers
- Verify PDF output is generated and readable
- Verify API docs are extracted from JSDoc comments in code
- Verify generation completes in <10 seconds for projects <100 files
- Verify incremental updates only regenerate changed sections
- Verify documentation includes table of contents and navigation links

**Details**:
- Parse `.speckit/SPECIFICATION.md` to extract requirements and stories
- Scan source files for JSDoc comments and extract API signatures
- Generate documentation in multiple formats: Markdown (default), HTML, PDF
- Create separate documentation sections: Requirements, API Reference, User Guide
- Include table of contents with anchor links for navigation
- Support incremental updates (only regenerate changed sections)
- Provide `speckit docs generate --format=<format>` to specify output format
- Validate that generated docs match specification content
- Include examples and code snippets where relevant

---

#### FR005: Phase Execution Commands with Progress Tracking

**Description**: Implement commands for executing each workflow phase (`speckit constitute`, `speckit specify`, `speckit plan`, `speckit implement`) with real-time progress indicators showing current step and estimated time remaining, validation of prerequisites before phase execution, automatic state updates in state.json, quality validation after phase completion with detailed reports, and error recovery mechanisms with helpful messages. Each command must update state atomically and handle interruptions gracefully.

**Priority**: Critical

**Testability**:
- Verify `speckit constitute` executes constitution phase and updates state
- Verify `speckit specify` validates constitution exists before running
- Verify `speckit plan` validates specification exists before running
- Verify `speckit implement` validates plan exists before running
- Verify progress indicators display during long-running operations
- Verify state.json is updated atomically after phase completion
- Verify quality validation runs automatically after each phase
- Verify error messages include recovery steps when validation fails
- Verify phase can be resumed after interruption

**Details**:
- Implement `speckit constitute` to guide creation of CONSTITUTION.md
- Implement `speckit specify` to guide creation of SPECIFICATION.md
- Implement `speckit plan` to guide creation of technical plan
- Implement `speckit implement` to track implementation progress
- Validate prerequisites before each phase (previous phases completed)
- Display progress bar or spinner for long-running operations
- Update state.json phase status: pending → in-progress → completed
- Run quality validation automatically after phase completion
- Save quality reports to `.speckit/quality/{phase}-quality.json`
- Provide clear error messages with recovery instructions on validation failure
- Allow `--skip-validation` flag for advanced users (with warning)

---

#### FR006: Quality Validation with Detailed Reporting and Recommendations

**Description**: Implement comprehensive quality validation that checks specifications against completeness (85%), clarity (90%), and testability (80%) thresholds, validates plans against actionability and feasibility metrics, validates implementations against test coverage (80%+), zero lint errors, and passing tests, generates detailed quality reports with scores, issues, and actionable recommendations, and prevents progression to next phase if quality thresholds are not met. Validation must execute in under 5 seconds for documents <5000 lines.

**Priority**: Critical

**Testability**:
- Verify specification validation checks for minimum 5 functional requirements
- Verify specification validation checks for minimum 2 non-functional requirements
- Verify specification validation checks for minimum 3 user stories with acceptance criteria
- Verify plan validation checks for architecture components and tasks
- Verify implementation validation requires tests written and passing
- Verify implementation validation requires test coverage 80%+
- Verify validation reports include scores, issues, and recommendations
- Verify validation completes in <5 seconds for documents <5000 lines
- Verify validation prevents phase progression when thresholds not met

**Details**:
- Use existing quality validation from `src/core/quality.js`
- Validate specifications: completeness (85%), clarity (90%), testability (80%)
- Validate plans: completeness (85%), actionability (85%), feasibility (85%)
- Validate implementations: tests written, tests passing, coverage 80%+, zero lint errors
- Generate detailed JSON reports with scores, issues, and recommendations
- Save reports to `.speckit/quality/{type}-quality.json`
- Display quality summary in terminal with color-coded scores
- Block progression to next phase if validation fails
- Provide `speckit validate <type>` command for manual validation
- Support `--fix` flag to apply automated fixes where possible

---

#### FR007: Claude Agent SDK Integration with Proper Lifecycle Management

**Description**: Integrate with Claude Agent SDK following best practices including proper agent lifecycle management (initialize, execute, cleanup), native tool usage patterns with error handling, state persistence via SDK mechanisms, proper error handling with user-friendly messages, and adherence to SDK documentation and examples. All SDK interactions must be wrapped in try-catch blocks with fallback behaviors.

**Priority**: High

**Testability**:
- Verify agent initialization follows SDK patterns with proper configuration
- Verify tool invocations use SDK-provided methods and error handling
- Verify state persistence uses SDK mechanisms not custom file I/O
- Verify errors from SDK are caught and translated to user-friendly messages
- Verify SDK version compatibility is checked at startup
- Verify cleanup routines execute on exit or error
- Verify no deprecated SDK methods are used
- Verify integration tests pass with actual SDK

**Details**:
- Initialize agents using SDK agent factory patterns
- Register tools using SDK tool registration APIs
- Use SDK state management instead of custom state.json where applicable
- Implement proper error handling for all SDK calls (try-catch with logging)
- Translate SDK errors into user-friendly messages with recovery steps
- Check SDK version compatibility at startup and warn on mismatch
- Implement cleanup handlers for graceful shutdown
- Follow SDK documentation for all integration points
- Add integration tests using SDK testing utilities
- Document SDK integration patterns for extension developers

---

#### FR008: Enhanced User Experience with Clear Feedback and Helpful Errors

**Description**: Provide comprehensive user experience enhancements including colored terminal output with consistent formatting, progress indicators for operations taking >2 seconds (spinners or progress bars), helpful error messages with recovery steps and documentation links, confirmation prompts for destructive actions with clear defaults, interactive wizards for complex workflows with step-by-step guidance, and success messages with next steps. All output must be accessible and work in environments without color support.

**Priority**: High

**Testability**:
- Verify terminal output uses colors appropriately (green=success, yellow=warning, red=error)
- Verify progress indicators appear for operations >2 seconds
- Verify error messages include specific problem description and recovery steps
- Verify destructive actions prompt for confirmation with clear default (N)
- Verify all prompts have sensible defaults and accept Enter key
- Verify output is readable when colors are disabled (NO_COLOR environment variable)
- Verify success messages include suggested next steps
- Verify help text is comprehensive and includes examples

**Details**:
- Use ANSI color codes for terminal output (green, yellow, red, blue)
- Detect NO_COLOR environment variable and disable colors when set
- Display spinner for operations taking >2 seconds (e.g., "Validating...")
- Display progress bar for long operations with known duration
- Format error messages: "[ERROR] {problem}. Try: {recovery steps}. Docs: {link}"
- Prompt for confirmation on destructive actions (e.g., overwrite, delete)
- Provide interactive wizards for init and configure commands
- Include examples in help text for all commands
- Show success messages with clear next steps ("Done! Run 'speckit status' to see progress")
- Support `--quiet` flag to suppress non-error output

---

#### FR009: Plugin Architecture for Custom Agents, Validators, and Templates

**Description**: Implement extensible plugin system that allows loading custom agents from `.speckit/agents/` directory, loading custom quality validators from `.speckit/validators/`, loading custom templates from `.speckit/templates/`, plugin discovery and registration at startup, validation of plugin interfaces and error handling for malformed plugins, and documentation and examples for creating custom plugins. Plugin loading must complete in <2 seconds for <20 plugins.

**Priority**: Medium

**Testability**:
- Verify plugins are discovered from `.speckit/agents/` directory
- Verify custom validators are loaded from `.speckit/validators/`
- Verify custom templates are loaded from `.speckit/templates/`
- Verify plugin loading completes in <2 seconds for <20 plugins
- Verify invalid plugins are rejected with clear error messages
- Verify plugins can extend built-in agents without breaking core functionality
- Verify plugin API is documented with examples
- Verify plugin registry shows loaded plugins with `speckit plugins list`

**Details**:
- Define plugin interface specification (required exports, methods, metadata)
- Scan `.speckit/agents/` directory for custom agent definitions
- Scan `.speckit/validators/` directory for custom quality validators
- Scan `.speckit/templates/` directory for custom document templates
- Validate plugin structure and interfaces at load time
- Register plugins in a central registry accessible to core system
- Provide plugin lifecycle hooks: onLoad, onUnload, onError
- Handle plugin errors gracefully without crashing main process
- Implement `speckit plugins list` to show loaded plugins
- Implement `speckit plugins create <name>` to scaffold new plugin
- Document plugin API with examples in `.speckit/docs/plugins.md`
- Provide example plugins in repository for reference

---

#### FR010: Configuration Management with Environment-Specific Settings

**Description**: Implement configuration system that supports global configuration in `~/.speckit/config.json`, project-specific configuration in `.speckit/config.json`, environment variable overrides (SPECKIT_* prefix), configuration validation with schema checking, and commands for viewing and updating configuration (`speckit config get/set`). Configuration changes must be validated before saving and invalid configurations must be rejected with helpful error messages.

**Priority**: Medium

**Testability**:
- Verify global config is read from `~/.speckit/config.json`
- Verify project config is read from `.speckit/config.json`
- Verify environment variables override config values (SPECKIT_* prefix)
- Verify `speckit config get <key>` returns correct value
- Verify `speckit config set <key> <value>` updates config file
- Verify invalid config values are rejected with validation error
- Verify config merging follows precedence: env vars > project > global > defaults
- Verify config schema is documented and validated

**Details**:
- Define configuration schema with validation rules
- Support hierarchical configuration: defaults → global → project → environment
- Read global config from `~/.speckit/config.json` if exists
- Read project config from `.speckit/config.json` if exists
- Override with environment variables matching pattern `SPECKIT_*`
- Implement `speckit config get <key>` to display configuration value
- Implement `speckit config set <key> <value>` to update configuration
- Implement `speckit config list` to show all active configuration
- Validate configuration values against schema before saving
- Provide helpful error messages for invalid configuration
- Document all available configuration options with examples
- Support nested configuration keys using dot notation (e.g., `quality.threshold`)

---

### Non-Functional Requirements

#### NFR001: Performance - Fast Execution and Minimal Latency

**Description**: All SpecKit operations must execute within defined time bounds to ensure responsive user experience. Installation must complete in under 30 seconds, initialization in under 5 seconds, status checks in under 1 second, documentation generation in under 10 seconds for projects <100 files, quality validation in under 5 seconds for documents <5000 lines, and plugin loading in under 2 seconds for <20 plugins. Performance must be measured and validated in CI pipeline.

**Metric**: Execution time in seconds measured using performance.now() before and after each operation

**Target**:
- Installation: <30 seconds
- Initialization: <5 seconds
- Status check: <1 second
- Documentation generation: <10 seconds (projects <100 files)
- Quality validation: <5 seconds (documents <5000 lines)
- Plugin loading: <2 seconds (<20 plugins)

**Rationale**: Developers expect fast, responsive tools. Slow operations lead to frustration and abandonment. Fast execution times enable rapid iteration and workflow efficiency.

---

#### NFR002: Reliability - Zero Data Loss and Graceful Error Recovery

**Description**: SpecKit must handle errors gracefully without data loss or corruption of state files. All state mutations must be atomic (write to temp file, then rename), interrupted operations must be resumable from last checkpoint, error messages must be actionable with recovery steps, and the system must never leave the project in an inconsistent state. Reliability must be tested through fault injection and chaos testing.

**Metric**: Number of error scenarios with successful recovery measured through fault injection testing

**Target**:
- 100% of state mutations are atomic (no partial writes)
- 100% of interrupted operations can be resumed
- 0 instances of state corruption in fault injection tests
- 95%+ of errors include actionable recovery steps

**Rationale**: Data loss destroys trust and productivity. State corruption can break entire projects. Graceful error handling ensures developers can recover from failures without losing work.

---

#### NFR003: Maintainability - Test Coverage and Code Quality

**Description**: All code must maintain high test coverage and quality standards. Test coverage must be 80% or higher for all new code, all modules must have unit tests with isolated dependencies, integration tests must cover critical user workflows end-to-end, linting must pass with zero errors or warnings, and code must follow consistent style guidelines enforced by automated tools.

**Metric**: Test coverage percentage measured by Vitest coverage reporter, lint error count from ESLint

**Target**:
- Test coverage: 80%+ (measured by Vitest)
- Unit test coverage: 85%+ for core modules
- Integration test coverage: 100% of critical user workflows
- Lint errors: 0 (measured by ESLint)
- Code complexity: Cyclomatic complexity <10 per function

**Rationale**: High test coverage prevents regressions and ensures reliability. Lint-free code is easier to maintain and has fewer bugs. Consistent style improves readability and collaboration.

---

#### NFR004: Compatibility - Cross-Platform and Node Version Support

**Description**: SpecKit must work consistently across all major platforms (Linux, macOS, Windows) and Node.js versions (18.x, 20.x, 22.x LTS). All file paths must use platform-independent path APIs, all shell commands must have platform-specific implementations or fallbacks, and all features must be tested on each supported platform and Node version in CI pipeline.

**Metric**: Platform compatibility matrix showing pass/fail status for each platform and Node version combination

**Target**:
- 100% feature parity across Linux, macOS, Windows
- 100% test pass rate on Node.js 18.x, 20.x, 22.x
- 0 platform-specific bugs in production
- CI pipeline validates all platforms and Node versions

**Rationale**: Developers use diverse environments. Platform-specific bugs create friction and limit adoption. Cross-platform support ensures SpecKit works reliably for all users.

---

#### NFR005: Security - Dependency Safety and Input Validation

**Description**: SpecKit must have zero runtime dependencies to minimize supply chain attack surface, all user inputs must be validated and sanitized before processing, file operations must validate paths to prevent directory traversal attacks, and all dependencies (dev only) must be audited regularly for known vulnerabilities using npm audit.

**Metric**: Number of runtime dependencies (must be 0), number of high/critical vulnerabilities in npm audit

**Target**:
- Runtime dependencies: 0
- High/critical npm audit vulnerabilities: 0
- Input validation coverage: 100% of user inputs validated
- Path traversal protection: 100% of file operations validated

**Rationale**: Dependencies introduce security risks and maintenance burden. Zero runtime dependencies eliminates supply chain attack vectors. Input validation prevents injection attacks and malicious inputs.

---

## API Reference

### parseArgs(argv)

CLI Argument Parser Parse command-line arguments into structured format

### registerCommand(name, handler, options = {})

CLI Command Router Route parsed commands to appropriate handlers

### registerCommand(name, handler, options = {})

Register a command handler

### routeCommand(parsed)

Route command to handler

### getCommands()

Get all registered commands

### hasCommand(name)

Check if command exists

### configCommand(args, flags)

Config Command Get or set configuration values

### constituteCommand(args, flags)

Constitute Command Run the constitute phase - define project principles interactively

### docsCommand(args, flags)

Docs Command Generate documentation from specification and source code

### initCommand(args, flags)

Init Command Initialize a new SpecKit workflow, optionally creating a new project directory

### specifyCommand(args, flags)

Specify Command Run the specify phase - create detailed requirements using Requirements Analyst

### statusCommand(args, flags)

Status Command Show workflow progress and status

### validateCommand(args, flags)

Validate Command Validate current phase quality

### prompt(question, defaultValue = '')

Terminal UI Library Colors, spinners, progress bars, prompts, and tables Zero dependencies - uses ANSI escape codes and Node.js built-ins

### prompt(question, defaultValue = '')

Color text

### prompt(question, defaultValue = '')

Spinner for long-running operations

### prompt(question, defaultValue = '')

Progress bar

### prompt(question, defaultValue = '')

Interactive prompt

### confirm(question, defaultValue = false)

Confirm (yes/no) prompt

### select(question, options)

Select from options

### table(data, options = {})

Display table

### box(text, title = '')

Box around text

### loadConfig(projectDir = process.cwd()

Configuration Management Hierarchical configuration: env vars → project → global → defaults Zero dependencies - uses Node.js built-ins

### loadConfig(projectDir = process.cwd()

Load configuration with hierarchy

### get(key, projectDir = process.cwd()

Get a config value by key (supports nested keys with dot notation)

### set(key, value, options = {})

Set a config value (saves to project or global config)

### unset(key, options = {})

Delete a config value

### list(projectDir = process.cwd()

List all config values

### reset(options = {})

Reset config to defaults

### initGlobalConfig()

Initialize global config directory

### parseSpecification(content)

Documentation Generator Extracts requirements from SPECIFICATION.md, parses JSDoc from source code, generates documentation in Markdown and HTML formats Zero dependencies - uses only Node.js built-ins

### parseSpecification(content)

Parse SPECIFICATION.md to extract requirements

**Parameters:**

- `content` (string): Specification file content

**Returns:** Object - Parsed requirements

### parseJSDoc(source)

Parse JSDoc comments from source code

**Parameters:**

- `source` (string): Source code content

**Returns:** Array - Array of parsed JSDoc blocks

### generateMarkdown(data)

Scan directory recursively for JavaScript files

**Parameters:**

- `dir` (string): Directory to scan
- `fileList` (Array): Accumulated file list

**Returns:** Array - List of JS file paths

### generateMarkdown(data)

Generate markdown documentation from parsed data

**Parameters:**

- `data` (Object): Parsed requirements and API data

**Returns:** string - Markdown content

### convertToHTML(markdown)

Convert Markdown to HTML

**Parameters:**

- `markdown` (string): Markdown content

**Returns:** string - HTML content with styling

### generateDocs(options)

Generate documentation from project

**Parameters:**

- `options` (Object): Generation options
- `options` (string): .projectPath - Path to project root
- `options` (Array<string>): .formats - Formats to generate (markdown, html)
- `options` (string): .outputDir - Output directory (default: .speckit/docs)
- `options` (boolean): .incremental - Enable incremental updates

**Returns:** Promise<Object> - Result object with success status and file list

### validateSpecification(spec, options = {})

Quality Validation for SpecKit Validates specifications, plans, and implementations against quality thresholds Principle: Quality is built-in, not bolted-on

### validateSpecification(spec, options = {})

Validate a specification

**Parameters:**

- `spec` (object): Specification object
- `options` (object): Validation options

**Returns:** object - Quality report

### validatePlan(plan, options = {})

Validate a technical plan

**Parameters:**

- `plan` (object): Plan object
- `options` (object): Validation options

**Returns:** object - Quality report

### validateImplementation(implementation, options = {})

Validate implementation quality

**Parameters:**

- `implementation` (object): Implementation metrics
- `options` (object): Validation options

**Returns:** object - Quality report

### initWorkflow(baseDir, workflowId, projectName)

State Management for SpecKit Manages workflow state in .speckit/state.json Principle: Simple, inspectable, human-editable JSON

### initWorkflow(baseDir, workflowId, projectName)

Initialize a new workflow

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `workflowId` (string): Unique workflow identifier (YYYY-MM-DD-slug)
- `projectName` (string): Human-readable project name

**Returns:** object - Initial state object

### loadState(baseDir)

Load existing workflow state

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)

**Returns:** object - State object

### updatePhase(baseDir, phaseName, status, quality = null)

Save state to file

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `state` (object): State object to save

### updatePhase(baseDir, phaseName, status, quality = null)

Update phase status

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `phaseName` (string): Phase to update
- `status` (string): New status (pending/in_progress/completed)

**Returns:** object - Updated state

### getCurrentPhase(baseDir)

Get current phase name

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)

**Returns:** string - Current phase name

### getProgress(baseDir)

Calculate workflow progress percentage

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)

**Returns:** number - Progress percentage (0-100)

### isComplete(baseDir)

Check if workflow is complete

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)

**Returns:** boolean - True if all phases completed

### resetWorkflow(baseDir)

Reset workflow to initial state

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)

**Returns:** object - Reset state

### executeConstitutePhase(baseDir, projectName, responses)

Constitute Phase Orchestrator Guides interactive conversation to establish project principles

### executeConstitutePhase(baseDir, projectName, responses)

Execute the constitute phase This is an interactive phase - no agent needed, just structured conversation

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `projectName` (string): Project name
- `responses` (object): User responses to constitution questions

**Returns:** object - Constitution data

### getConstituteQuestions()

Simple template renderer (Mustache-like)

**Parameters:**

- `template` (string): Template string
- `data` (object): Data to fill template

**Returns:** string - Rendered template

### getConstituteQuestions()

Get constitution questions for user

**Returns:** Array - Array of question objects

### executeImplementPhase(baseDir, plan, currentTaskId = null)

Implement Phase Orchestrator Launches Implementation Engineer agent for each task

### executeImplementPhase(baseDir, plan, currentTaskId = null)

Execute the implement phase This launches the Implementation Engineer agent for each task

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `plan` (object): Approved technical plan
- `currentTaskId` (string): Task ID to implement (null for next task)

**Returns:** Promise<object> - Implementation result

### getNextTask(plan, state)

Get next task to implement

**Parameters:**

- `plan` (object): Technical plan
- `state` (object): Workflow state

**Returns:** object|null - Next task or null if all complete

### validateAndSaveImplementation(baseDir, taskId, implementation)

Validate and save implementation Called by the agent to validate and save implementation results

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `taskId` (string): Task ID
- `implementation` (object): Implementation metrics

**Returns:** object - Quality report

### calculateImplementProgress(plan, state)

Calculate implementation progress

**Parameters:**

- `plan` (object): Technical plan
- `state` (object): Workflow state

**Returns:** object - Progress data

### updateTaskStatus(baseDir, state, taskId, status)

Update task status in state

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `state` (object): Workflow state
- `taskId` (string): Task ID
- `status` (string): Status (pending/in_progress/completed)

### executePlanPhase(baseDir, specification)

Plan Phase Orchestrator Launches Technical Architect agent to create implementation plan

### executePlanPhase(baseDir, specification)

Execute the plan phase This launches the Technical Architect agent

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `specification` (object): Approved specification

**Returns:** Promise<object> - Plan data and quality report

### validateAndSavePlan(baseDir, plan)

Validate and save plan Called by the agent to validate and save the plan

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `plan` (object): Plan object

**Returns:** object - Quality report

### createPlan(data)

Create a plan object from structured data Helper for agents to structure their output

**Parameters:**

- `data` (object): Structured plan data

**Returns:** object - Plan object

### executeSpecifyPhase(baseDir, projectName, projectDescription, constitution)

Specify Phase Orchestrator Launches Requirements Analyst agent to create specification

### executeSpecifyPhase(baseDir, projectName, projectDescription, constitution)

Execute the specify phase This launches the Requirements Analyst agent

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `projectName` (string): Project name
- `projectDescription` (string): User's project description
- `constitution` (object): Constitution data

**Returns:** Promise<object> - Specification data and quality report

### validateAndSaveSpecification(baseDir, spec)

Validate and save specification Called by the agent to validate and save the spec

**Parameters:**

- `baseDir` (string): Base directory (.speckit/)
- `spec` (object): Specification object

**Returns:** object - Quality report

### createSpecification(data)

Create a specification object from structured data Helper for agents to structure their output

**Parameters:**

- `data` (object): Structured specification data

**Returns:** object - Specification object
