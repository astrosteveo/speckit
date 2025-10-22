---
name: speckit
description: Specification-first development workflow that transforms ideas into production code through 4 phases - Constitute (principles), Specify (requirements), Plan (architecture with parallel execution), and Implement (TDD in parallel waves achieving 40-60% time savings). When you need structured, test-driven development with automated task parallelization and quality validation.
license: MIT
---

# SpecKit - Specification-First Development

## Overview

SpecKit is a comprehensive workflow system that guides projects from initial concept to production-ready code through four structured phases. The workflow emphasizes clarity, testability, and **parallel execution** to dramatically reduce development time.

**Key Benefits:**
- 📋 **Structured Requirements**: Clear specifications that guide implementation
- ⚡ **Parallel Execution**: 40-60% time reduction through automated task parallelization
- ✅ **Test-Driven**: Enforced TDD with RED → GREEN → REFACTOR cycle
- 📊 **Quality Gates**: Automated validation at each phase
- 🤖 **AI-Powered**: Specialized agents for analysis, architecture, and implementation

## Quick Start

### Initialize a New Project

```bash
# Install SpecKit
npm install -g @astrosteveo/speckit

# Create new project
speckit init my-project
cd my-project

# Open in Claude Code
claude

# Use the SpecKit skill OR slash commands
# Option 1: Mention the skill
"Use the SpecKit skill to build an e-commerce API"

# Option 2: Use slash commands
/speckit              # Full workflow
/constitute           # Just phase 1
/specify              # Just phase 2
/plan                 # Just phase 3
/implement            # Just phase 4
/validate             # Quality check
```

## The Four Phases

### Phase 1: Constitute - Define Project Principles

**Purpose**: Establish the project's foundation - values, constraints, and quality standards.

**Deliverable**: `.speckit/CONSTITUTION.md`

**Key Questions:**
1. What is the project vision?
2. What are the core values? (Simplicity, Performance, Security, etc.)
3. What technologies are required or forbidden?
4. What defines "done"? (Test coverage, code review, documentation)
5. What development principles should guide decisions?

**Example Constitution:**
```markdown
# Project Constitution

## Vision
Build a high-performance e-commerce API that handles 10K requests/second

## Core Values
1. **Performance First**: All endpoints must respond in <100ms
2. **Security**: Zero-trust architecture, all data encrypted
3. **Simplicity**: Prefer boring, proven technologies

## Technology Stack
- Language: TypeScript 5.0+
- Framework: Express.js
- Database: PostgreSQL 15
- Testing: Vitest + Supertest

## Quality Standards
- Test Coverage: Minimum 90%
- Code Review: All PRs require 2 approvals
- Documentation: All public APIs documented

## Development Principles
1. **TDD Mandatory**: Write tests first, always
2. **Small Commits**: Ship incrementally
3. **Fail Fast**: Validate early, fail loudly
```

**Quality Metrics:**
- Clarity ≥80%
- Completeness ≥80%
- Actionability ≥80%

---

### Phase 2: Specify - Create Detailed Requirements

**Purpose**: Transform the constitution into concrete, testable requirements.

**Deliverable**: `.speckit/SPECIFICATION.md`

**Uses**: Requirements Analyst Agent (`.claude/agents/analyst.md`)

**Output Structure:**

1. **Functional Requirements** (FR001, FR002, ...)
   - What the system MUST do
   - Each requirement clear, testable, traceable

2. **Non-Functional Requirements** (NFR001, NFR002, ...)
   - Performance, security, scalability
   - Specific metrics and thresholds

3. **User Stories** (US001, US002, ...)
   - Format: As a [user], I want [goal] so that [benefit]
   - Each with acceptance criteria checkboxes

4. **Success Metrics**
   - How to measure project success
   - Quality gates and thresholds

**Example Specification:**
```markdown
# Project Specification

## Functional Requirements

### FR001: User Authentication
System shall provide JWT-based authentication with email/password.

### FR002: Product Catalog
System shall support CRUD operations on products with categories, pricing, and inventory.

## Non-Functional Requirements

### NFR001: Performance
- API response time <100ms for 95th percentile
- Support 10,000 concurrent users
- Database query time <50ms

### NFR002: Security
- All passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire after 24 hours
- Rate limiting: 100 requests/minute per IP

## User Stories

### US001: User Registration
As a new user, I want to create an account so that I can make purchases.

**Acceptance Criteria:**
- [ ] POST /api/auth/register accepts email, password, name
- [ ] Password must be ≥8 characters with 1 uppercase, 1 number
- [ ] Returns JWT token on success
- [ ] Email must be unique (returns 409 if exists)
- [ ] Email validation follows RFC 5322

## Success Metrics
- 95% test coverage achieved
- All quality gates passing
- Zero critical security vulnerabilities
- API deployed and accessible at production URL
```

**Quality Metrics:**
- Clarity ≥85%
- Completeness ≥85%
- Testability ≥90%

---

### Phase 3: Plan - Design Architecture with Parallel Execution

**Purpose**: Create technical implementation plan optimized for **parallel task execution**.

**Deliverable**: `.speckit/PLAN.md`

**Uses**: Technical Architect Agent (`.claude/agents/architect.md`)

**Critical Feature**: **Dependency Graph Analysis**

The plan includes:
1. Architecture overview and technology decisions
2. Task breakdown with **Dependencies** and **Estimated Time**
3. **Execution Waves** - tasks grouped by parallelization
4. Time savings calculation (Sequential vs Parallel)

**Example Plan Structure:**
```markdown
# Implementation Plan

## Architecture Overview
Three-tier: React frontend + Express API + PostgreSQL

## Task Breakdown

### T001: Project Initialization
**Dependencies**: None
**Estimated Time**: 2 hours
**Description**: Set up monorepo, TypeScript, testing, CI/CD

**Acceptance Criteria:**
- [ ] package.json with workspaces configured
- [ ] TypeScript with strict mode enabled
- [ ] Vitest configured and running
- [ ] GitHub Actions CI/CD pipeline

### T002: Database Schema
**Dependencies**: None
**Estimated Time**: 3 hours
**Description**: Design and implement database schema with migrations

**Acceptance Criteria:**
- [ ] Users table (id, email, password_hash, created_at)
- [ ] Products table (id, name, price, stock, category_id)
- [ ] Orders table (id, user_id, status, total)
- [ ] Migrations with up/down scripts

### T003: API Framework Setup
**Dependencies**: T001
**Estimated Time**: 2 hours
**Description**: Express server with middleware

**Acceptance Criteria:**
- [ ] Server running on port 3000
- [ ] Error handling middleware
- [ ] Request logging with Winston
- [ ] Health check endpoint /api/health

## Execution Timeline

**Sequential Execution**: 54 hours (7 working days)

**Parallel Execution**: ~28 hours (4 working days)

**Time Savings**: 26 hours (48% faster!)

### Execution Waves

**Wave 1** (3 tasks, max 3 hours):
- T001: Project Init (2h)
- T002: Database Schema (3h)
- T004: Frontend Shell (2h)

**Wave 2** (3 tasks, max 5 hours):
- T003: API Framework (2h) [depends on T001]
- T005: User Auth API (4h) [depends on T002]
- T006: Product CRUD (3h) [depends on T002]

**Critical Path**: T001 → T003 → T007 → T011 → T015
```

**Quality Metrics:**
- Clarity ≥85%
- Completeness ≥85%
- Actionability ≥85%
- Parallelization Score (bonus points):
  - ≥70%: +15 points
  - ≥40%: +10 points
  - ≥20%: +5 points

**Validation Commands:**
```bash
# Show parallel execution analysis
node -e "
import('./src/core/dependency-graph.js').then(m => {
  const fs = require('fs');
  const plan = fs.readFileSync('.speckit/PLAN.md', 'utf-8');
  const graph = m.parseDependencyGraph(plan);
  console.log(m.generateExecutionPlan(graph));
  console.log(m.calculateTimeSavings(graph));
});
"

# Or use slash command
/validate plan
```

---

### Phase 4: Implement - Build with TDD in Parallel Waves

**Purpose**: Execute implementation tasks in **parallel waves** using test-driven development.

**Uses**: Implementation Engineer Agent (`.claude/agents/engineer.md`)

**Parallel Execution Process:**

1. **Parse Dependency Graph** from PLAN.md
2. **Group tasks into waves** (tasks with no dependencies run together)
3. **Launch wave tasks in parallel** using multiple Task tool calls
4. **Wait for wave completion** before proceeding
5. **Validate results** (tests pass, acceptance criteria met)
6. **Report time savings**

**TDD Enforcement (Mandatory):**

Every task follows:
1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass test
3. **REFACTOR**: Improve code quality while tests pass

**Example Wave Execution:**

```
╔═══════════════════════════════════════════════════════════╗
║  WAVE 1: 3 tasks (max 3 hours)                           ║
╠═══════════════════════════════════════════════════════════╣
║  ⏳ T001: Project Init (2h) → In Progress                ║
║  ⏳ T002: Database Schema (3h) → In Progress             ║
║  ⏳ T004: Frontend Shell (2h) → In Progress              ║
╚═══════════════════════════════════════════════════════════╝

[All tasks execute simultaneously]

╔═══════════════════════════════════════════════════════════╗
║  WAVE 1: Complete! (actual: 3.2h)                        ║
╠═══════════════════════════════════════════════════════════╣
║  ✅ T001: Complete (1.8h)                                ║
║  ✅ T002: Complete (3.2h)                                ║
║  ✅ T004: Complete (2.1h)                                ║
║                                                           ║
║  Progress: 3/16 tasks (18%)                              ║
║  Time Saved: 1.8 hours so far                            ║
╚═══════════════════════════════════════════════════════════╝

Moving to Wave 2...
```

**Task Implementation Instructions:**

For each task, the Implementation Engineer receives:
```markdown
Implement T001: Project Initialization

**Requirements from SPECIFICATION.md:**
- FR001: User Authentication
- NFR001: Performance (<100ms)

**Acceptance Criteria from PLAN.md:**
- [ ] package.json with workspaces
- [ ] TypeScript strict mode
- [ ] Vitest configured
- [ ] GitHub Actions

**TDD Workflow:**
1. RED: Write test that fails
2. GREEN: Implement minimal code
3. REFACTOR: Improve quality

**Deliverables:**
- Implementation code
- Test files with passing tests
- Updated checkboxes in PLAN.md
- Completion report
```

**Final Report:**

```
╔═══════════════════════════════════════════════════════════╗
║  🎉 IMPLEMENTATION COMPLETE!                              ║
╠═══════════════════════════════════════════════════════════╣
║  Total Tasks: 16                                          ║
║  Waves Executed: 5                                        ║
║  Sequential Time: 54 hours                                ║
║  Parallel Time: 28 hours                                  ║
║  Time Saved: 26 hours (48%)                               ║
║  Tests: ✓ 142/142 passing                                 ║
║  Quality Score: 94%                                       ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Workflow State Management

SpecKit tracks progress in `.speckit/state.json`:

```json
{
  "workflowId": "2025-01-22-my-project",
  "projectName": "my-project",
  "currentPhase": "implement",
  "phases": {
    "constitute": { "status": "completed", "completedAt": "2025-01-22T10:00:00Z" },
    "specify": { "status": "completed", "completedAt": "2025-01-22T11:30:00Z" },
    "plan": { "status": "completed", "completedAt": "2025-01-22T13:00:00Z" },
    "implement": { "status": "in_progress", "startedAt": "2025-01-22T14:00:00Z" }
  },
  "completedTasks": ["T001", "T002", "T003"]
}
```

## Quality Validation

At any time, validate deliverables:

```bash
# Validate current phase
/validate

# Validate specific deliverable
/validate constitution
/validate specification
/validate plan

# See detailed parallel execution analysis
/validate plan
```

**Quality Reports:**

Each validation creates a JSON report in `.speckit/quality/`:
- `constitution-quality.json`
- `specification-quality.json`
- `plan-quality.json`

Example report:
```json
{
  "phase": "plan",
  "timestamp": "2025-01-22T13:00:00Z",
  "scores": {
    "clarity": 92,
    "completeness": 88,
    "actionability": 90,
    "parallelization": 74
  },
  "overall": 96,
  "passed": true,
  "threshold": 85,
  "bonus": 15,
  "timeSavings": {
    "sequential": 54,
    "parallel": 28,
    "saved": 26,
    "percentage": 48
  },
  "issues": [],
  "recommendations": [
    "Consider splitting T008 into smaller tasks for better parallelization"
  ]
}
```

## CLI Commands

**Project Setup:**
```bash
speckit init <project-name>  # Initialize new project
speckit status               # Show workflow progress
speckit config list          # View configuration
```

**Phase Execution:**
```bash
speckit constitute           # Define principles
speckit specify              # Create requirements
speckit plan                 # Design architecture
speckit implement            # Build with TDD
```

**Validation:**
```bash
speckit validate             # Validate current phase
speckit validate plan        # Validate plan with parallel analysis
```

**Documentation:**
```bash
speckit docs                 # Generate project documentation
speckit docs --format html   # Generate HTML docs
```

## Integration with Claude Code

SpecKit provides both **Skills** and **Slash Commands**:

**Skills (Natural Language):**
```
"Use the SpecKit skill to build a REST API for a blog platform"
"Use SpecKit to validate my plan and show time savings"
"Create a constitution for a mobile app with SpecKit"
```

**Slash Commands (Direct):**
```
/speckit              # Full guided workflow
/constitute           # Phase 1 only
/specify              # Phase 2 only
/plan                 # Phase 3 only
/implement            # Phase 4 only
/validate plan        # Quality check with parallel analysis
```

## Advanced Features

### Dependency Graph Analysis

SpecKit automatically:
1. Parses task dependencies from PLAN.md
2. Detects circular dependencies
3. Performs topological sort
4. Calculates optimal execution waves
5. Estimates time savings

**API:**
```javascript
import { parseDependencyGraph, calculateTimeSavings } from '@astrosteveo/speckit';

const plan = fs.readFileSync('.speckit/PLAN.md', 'utf-8');
const graph = parseDependencyGraph(plan);
const savings = calculateTimeSavings(graph);

console.log(`Time saved: ${savings.saved}h (${savings.percentage}%)`);
```

### Custom Agents

Create specialized agents in `.claude/agents/`:

```markdown
# .claude/agents/security-reviewer.md

You are a Security Reviewer specialized in identifying vulnerabilities.

## Your Task

Review code for:
- SQL injection risks
- XSS vulnerabilities
- Authentication flaws
- Sensitive data exposure

## Output Format

Provide:
1. Risk level (Critical/High/Medium/Low)
2. Description of vulnerability
3. Code location
4. Remediation steps
```

### Hooks

Add pre/post hooks in `.claude/hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'About to run Bash command'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint"
          }
        ]
      }
    ]
  }
}
```

## Troubleshooting

**Issue**: Circular dependencies detected

**Solution**:
```bash
/validate plan  # Shows which tasks form the cycle
# Edit PLAN.md to break the cycle
```

**Issue**: Low parallelization score

**Solution**:
- Reduce dependencies between tasks
- Split large tasks into smaller independent pieces
- Group related work (e.g., all DB work in one task, all frontend in another)

**Issue**: Tests failing during implementation

**Solution**:
- Task marked as "in progress" (not complete) until tests pass
- Fix tests before proceeding to next wave
- Use `/validate` to check quality

## Best Practices

1. **Start with a solid constitution** - It guides everything else
2. **Make requirements testable** - Every requirement should have clear acceptance criteria
3. **Optimize for parallelization** - Minimize dependencies, maximize concurrent work
4. **Enforce TDD rigorously** - RED → GREEN → REFACTOR, always
5. **Validate early and often** - Use `/validate` after each phase
6. **Keep tasks small** - 2-4 hour tasks are ideal for parallelization

## Example Project Flow

```bash
# Day 1: Planning
speckit init my-saas-app
cd my-saas-app
claude

# Conversation:
"Use SpecKit to build a SaaS subscription platform with Stripe"

# Claude guides through:
1. Constitution (30 min)
2. Specification (1 hour)
3. Plan (1.5 hours)
   → Shows: "48% time savings with parallel execution!"

# Day 2-5: Implementation
/implement

# Claude executes in parallel waves:
- Wave 1: 4 tasks simultaneously (3h)
- Wave 2: 3 tasks simultaneously (4h)
- Wave 3: 5 tasks simultaneously (5h)
- Total: 28h instead of 54h

# Day 6: Validation & Deployment
/validate
npm test
npm run build
npm run deploy
```

## Resources

- **GitHub**: https://github.com/astrosteveo/speckit
- **NPM**: https://www.npmjs.com/package/@astrosteveo/speckit
- **Docs**: Coming soon
- **Issues**: https://github.com/astrosteveo/speckit/issues

## License

MIT - Use freely in commercial and open source projects
