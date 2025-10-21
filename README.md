# SpecKit v2.0

**Specification-Driven Development for Claude Code**

Transform ideas into production-ready code through test-driven development with AI agents.

```
┌──────────────────────────────────────────────────────────┐
│                      SpecKit v2.0                         │
│    Idea → Constitution → Spec → Plan → Implementation    │
└──────────────────────────────────────────────────────────┘
```

## Features ✨

- 🚀 **Zero Runtime Dependencies** - Pure Node.js, no bloat
- 🎨 **Beautiful CLI** - Colors, spinners, progress bars
- 📋 **4-Phase Workflow** - Structured, repeatable process
- 🤖 **AI Agent Integration** - Requirements Analyst, Technical Architect, Implementation Engineer
- ✅ **Quality Gates** - Built-in validation at every phase
- 🔧 **Configurable** - Hierarchical configuration system
- 📦 **npm Ready** - Install globally or use locally

## Quick Start

```bash
# Install (when published to npm)
npm install -g speckit

# Or use locally
node bin/speckit.js init my-awesome-app

# Follow the workflow
speckit constitute  # Define principles
speckit specify     # Create requirements
speckit plan        # Design architecture
speckit implement   # Build with TDD

# Check progress anytime
speckit status
```

## The SpecKit Workflow

### Phase 1: Constitute (5-10 min)

Define your project's guiding principles:

```bash
$ speckit constitute

📜 Phase 1: Constitute - Define Project Principles

Question 1: Core Purpose
> A REST API for managing todos with user authentication

Question 2: Guiding Principles
> 1. Security first - protect user data
> 2. Simple > Feature-rich
> 3. API-first design

✓ Constitution created!
```

**Output**: `.speckit/CONSTITUTION.md`

### Phase 2: Specify (20-40 min)

Create detailed requirements with the Requirements Analyst agent:

```bash
$ speckit specify

📋 Phase 2: Specify - Create Detailed Requirements

Launching Requirements Analyst agent...

✓ Specification created! (Quality: 96/100)
  • 10 functional requirements
  • 5 non-functional requirements
  • 6 user stories with acceptance criteria
```

**Output**: `.speckit/SPECIFICATION.md` + quality report

### Phase 3: Plan (30-60 min)

Design architecture with the Technical Architect agent:

```bash
$ speckit plan

🏗️ Phase 3: Plan - Design Technical Architecture

Launching Technical Architect agent...

✓ Plan created! (Quality: 100/100)
  • Architecture overview
  • 24 tasks, 80 hours estimated
  • Clear dependencies
```

**Output**: `.speckit/PLAN.md` + quality report

### Phase 4: Implement (varies)

Build with TDD using the Implementation Engineer agent:

```bash
$ speckit implement

🔨 Phase 4: Implement - Build with TDD

Task 1/24: Package Setup
  RED: Write failing tests...
  GREEN: Implement features...
  REFACTOR: Clean up code...
  ✓ Complete (Coverage: 92%)

Progress: [████████░░] 80%
```

**Output**: Working code + tests + quality reports

## Commands

### Project Management

```bash
speckit init [name]         # Initialize new workflow
speckit status              # Show progress dashboard
speckit validate            # Check quality of current phase
```

### Workflow Phases

```bash
speckit constitute          # Define project principles
speckit specify             # Create requirements (with AI agent)
speckit plan                # Design architecture (with AI agent)
speckit implement           # Build with TDD (with AI agent)
```

### Configuration

```bash
speckit config list         # Show all configuration
speckit config get <key>    # Get specific value
speckit config set <key> <value>  # Set value
```

### Utility

```bash
speckit --version           # Show version
speckit --help              # Show help
```

## Example Output

### Status Dashboard

```
═══════════════════════════════════════════
📊 SpecKit Workflow Status
═══════════════════════════════════════════

Project: my-awesome-app
Workflow ID: 2025-10-20-my-awesome-app
Created: 2025-10-20
Last Updated: 2025-10-20 10:30:45 PM

Progress: [████████░░] 75%

Phase Status:
  ✅ Constitute   Complete
  ✅ Specify      Complete      96/100
  ✅ Plan         Complete      100/100
  ⏳ Implement    In Progress   (18/24 tasks)

Current Phase: implement
Next Action: Run speckit implement to continue building
```

### Configuration

```
⚙️  Configuration

Key                              Value
────────────────────────────────────────────
editor                           code
quiet                            false
qualityThreshold.specification   85
qualityThreshold.plan            85
qualityThreshold.implementation  80
outputFormat                     markdown
docsOutputDir                    docs
```

## Requirements

- Node.js ≥18.0.0
- No other dependencies!

## License

MIT

---

**Status**: v2.0.0 - Production Ready 🚀
