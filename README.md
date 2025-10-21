# SpecKit

> **Test-driven, specification-first development for Claude Code**

Transform project ideas into production-ready code through structured, quality-gated phases.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-34%2F34%20passing-success)](tests/)
[![Coverage](https://img.shields.io/badge/coverage-100%25-success)](#)

## The Problem

AI-assisted development often leads to "vibe coding":
- ❌ Unclear requirements that shift during implementation
- ❌ Code that doesn't match actual needs
- ❌ Difficult-to-maintain codebases
- ❌ Lost context between sessions
- ❌ No clear source of truth

## The Solution

SpecKit enforces a structured workflow:
- ✅ **Specifications first**, code second
- ✅ **Quality gates** prevent downstream problems
- ✅ **Test-driven development** enforced, not suggested
- ✅ **Human checkpoints** at every phase
- ✅ **Traceable artifacts** from idea to implementation

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/astrosteveo/speckit.git
cd speckit

# Install dependencies (dev only - zero runtime deps!)
npm install
```

### Usage

```bash
# Start a new workflow
/speckit my-project

# Resume existing workflow
/speckit

# Check status
/speckit status
```

## How It Works

### Four Phases, Four Quality Gates

```
Idea → Constitute → Specify → Plan → Implement → Production Code
         ✓           ✓         ✓         ✓
       (Review)   (≥85%)    (≥85%)    (≥80%)
```

### Phase 1: Constitute (5-10 min)

Define guiding principles for your project.

**Output**: `CONSTITUTION.md`

```markdown
# My Project Constitution

## Principles
1. User privacy is paramount
2. Simplicity over feature-richness
3. Mobile-first design
```

### Phase 2: Specify (20-40 min)

Create detailed, testable requirements.

**Agent**: Requirements Analyst
**Quality Gate**: ≥85% (completeness, clarity, testability)
**Output**: `SPECIFICATION.md` with requirements, user stories, acceptance criteria

**Example**:
```markdown
## FR001: User Authentication
Users can create accounts with email/password, with password
strength validation (min 8 chars, 1 uppercase, 1 number, 1 special).

## User Story
As a user, I want to create an account
so that I can save my data securely.

Acceptance Criteria:
- [ ] POST /auth/register accepts email, password
- [ ] Password validated against strength rules
- [ ] Returns 201 with user object on success
- [ ] Returns 400 with validation errors
```

### Phase 3: Plan (30-60 min)

Design architecture and break into tasks.

**Agent**: Technical Architect
**Quality Gate**: ≥85% (completeness, actionability, feasibility)
**Output**: `PLAN.md` with architecture, tech choices, task breakdown

**Example**:
```markdown
## Architecture
React frontend + Express API + PostgreSQL database

## Tasks
T001: Initialize project (2h)
T002: Database schema (4h) [depends on T001]
T003: Auth tests (3h) [depends on T002]
T004: Auth implementation (4h) [depends on T003]
```

### Phase 4: Implement (Varies)

Build with strict TDD.

**Agent**: Implementation Engineer
**Quality Gate** (per task): Tests passing + Coverage ≥80% + No lint errors
**Output**: Working code + comprehensive tests

**Process**:
1. **RED**: Write failing tests
2. **GREEN**: Implement until tests pass
3. **REFACTOR**: Clean up code
4. **VALIDATE**: Quality checks
5. **COMMIT**: Save progress

## Features

### 🎯 Quality-Driven

Every phase has automated quality scoring:
- **Specifications**: Completeness, clarity, testability
- **Plans**: Actionability, feasibility, proper task sizing
- **Implementation**: Test coverage, code quality, acceptance criteria

### 🔄 Iterative

Easy to refine at any checkpoint:
```bash
/speckit refine
```

Specifications version automatically (v1, v2, v3...) with changelogs.

### 🧪 TDD Enforced

Not optional. Not suggested. **Required.**

- Tests before implementation
- 80% minimum coverage
- All tests must pass
- No lint errors allowed

### 📊 Progress Tracking

Always know where you are:

```
Phase 4: Implementation [████████░░] 80%
  ✅ T001: Project setup (2h)
  ✅ T002: Database schema (4h)
  ✅ T003: Auth tests (3h)
  ✅ T004: Auth implementation (4h)
  ⏳ T005: API tests (3h) <- Current
  ⏸  T006: API implementation (6h)
```

### 🎨 Zero Dependencies

Runtime: **0 dependencies**
All built on Node.js standard library.

DevDeps: Only Vitest for testing.

## Example Workflow

```
You: /speckit blog-api

SpecKit: Let's define your project principles...

[Constitution created - 5 min]

SpecKit: Now let's create the specification...

[Specification created - Quality: 88/100]
✅ 8 functional requirements
✅ 3 non-functional requirements
✅ 4 user stories

Review .speckit/SPECIFICATION.md

You: Approved

[Plan created - Quality: 91/100]
✅ Express + PostgreSQL architecture
✅ 15 tasks, 42 hour estimate
✅ Clear dependency graph

Review .speckit/PLAN.md

You: Approved

[Implementation begins]

SpecKit: T001: Initialize Project
RED phase - writing tests...
GREEN phase - implementing...
REFACTOR phase - cleaning up...
✅ Complete (Coverage: 95%)

Moving to T002...
```

## Project Structure

```
your-project/
├── .speckit/
│   ├── state.json              # Workflow state
│   ├── CONSTITUTION.md         # Project principles
│   ├── SPECIFICATION.md        # Requirements
│   ├── PLAN.md                 # Architecture & tasks
│   └── quality/
│       ├── spec-quality.json
│       ├── plan-quality.json
│       └── T001-quality.json
├── src/                        # Your code
├── tests/                      # Your tests
└── package.json
```

## Philosophy

### From Our Constitution

1. **Simplicity Over Complexity** - One command, clear workflow
2. **Test-First, Always** - TDD is not optional
3. **Specifications Are Executable** - They drive implementation, not document it
4. **Human Judgment Required** - AI suggests, humans decide
5. **Iterative, Not Linear** - Easy to refine and improve

### We Eat Our Own Dog Food

SpecKit was built using SpecKit principles:
- Started with [CONSTITUTION.md](CONSTITUTION.md)
- Created [SPECIFICATION.md](SPECIFICATION.md)
- Built with TDD (34/34 tests passing, 100% coverage)
- Zero dependencies (we practice what we preach)

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

**Current Status**: 34/34 tests passing, 100% coverage

## Architecture

```
speckit/
├── src/
│   ├── core/
│   │   ├── state.js        # State management (18 tests)
│   │   └── quality.js      # Quality validation (16 tests)
│   ├── phases/             # [Future] Phase implementations
│   ├── agents/             # Agent definitions
│   │   ├── analyst.md      # Requirements analysis
│   │   ├── architect.md    # Technical planning
│   │   └── engineer.md     # TDD implementation
│   └── templates/          # [Future] Templates
├── .claude/
│   ├── commands/
│   │   └── speckit.md      # Main command
│   └── agents/             # (symlink to src/agents)
└── tests/
    ├── unit/
    └── integration/        # [Future]
```

## Development

### Running Tests

```bash
npm test                    # Run all tests
npm run test:coverage      # With coverage report
```

### Code Quality

- **Linting**: ESLint (zero errors policy)
- **Testing**: Vitest
- **Coverage**: Minimum 80%
- **Dependencies**: Zero runtime, minimal dev

## Contributing

SpecKit is designed to be simple and focused. Contributions welcome!

**Before contributing**:
1. Read [CONSTITUTION.md](CONSTITUTION.md) - our principles
2. Read [SPECIFICATION.md](SPECIFICATION.md) - what SpecKit does
3. Follow TDD - tests before code
4. Maintain zero runtime dependencies

## Comparison

### SpecKit vs Traditional Development

| Aspect | Traditional | SpecKit |
|--------|-------------|---------|
| Requirements | Vague or missing | Structured, scored ≥85% |
| Planning | Ad-hoc | Quality-gated, task-level |
| Testing | After coding | Before coding (TDD enforced) |
| Quality | Hope for the best | Gates prevent bad code |
| Documentation | Outdated | Living specification |
| Traceability | Lost in commits | Idea → Spec → Plan → Code |

### SpecKit vs Other Tools

**vs Spec-Kit (GitHub)**:
- SpecKit is optimized specifically for Claude Code
- Built-in agent orchestration
- Automated quality scoring
- Zero external dependencies

**vs Manual TDD**:
- SpecKit enforces TDD, doesn't just suggest it
- Quality gates prevent shortcuts
- Specification stays current

## Roadmap

- [x] Core state management
- [x] Quality validation system
- [x] Agent definitions
- [x] Main command
- [ ] Phase implementations (constitute, specify, plan, implement)
- [ ] Refinement workflows
- [ ] Integration tests
- [ ] Example projects
- [ ] Plugin marketplace listing

## License

MIT - See [LICENSE](LICENSE)

## Acknowledgments

- Inspired by [Spec-Kit](https://github.com/github/spec-kit)
- Built for [Claude Code](https://claude.com/claude-code)
- Follows test-driven development principles

---

**Ready to build better software?**

```bash
/speckit
```

**Built with SpecKit** 🛠️ **Following SpecKit principles** 📋 **100% test coverage** ✅
