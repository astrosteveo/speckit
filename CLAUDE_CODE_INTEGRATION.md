# SpecKit + Claude Code Integration Guide

**Version**: 2.1.1
**Purpose**: Keep AI agents focused and on-track during development

---

## Why SpecKit?

Traditional AI coding can go off-rails:
- ❌ AI makes assumptions without asking
- ❌ Implementations drift from requirements
- ❌ No clear stopping points
- ❌ Hard to validate what was built

**SpecKit solves this** with structured phases, quality gates, and human checkpoints.

---

## How SpecKit Keeps AI On Track

### 1. **Phase Boundaries** (Can't Skip Ahead)

```
Constitution → Specification → Plan → Implementation
     ↓              ↓           ↓           ↓
  (manual)     (validated)  (validated)  (validated)
```

Each phase MUST complete before the next begins. Quality gates enforce this.

### 2. **Quality Gates** (Automatic Validation)

After each phase, hooks run validators:

**Specification**:
```bash
# Triggered after .speckit/SPECIFICATION.md is written
node .speckit/validate-spec.js
```

Checks:
- ✅ 5+ functional requirements
- ✅ 2+ non-functional requirements
- ✅ 2+ user stories with acceptance criteria
- ✅ Clear, testable language
- ✅ Overall score ≥85/100

**If fails**: Blocks progression, shows specific issues, requires refinement.

**Plan**:
```bash
# Triggered after .speckit/PLAN.md is written
node .speckit/validate-plan.js
```

Checks:
- ✅ Architecture defined
- ✅ Tasks broken down (2-8 hour estimates)
- ✅ Dependencies clear
- ✅ Test strategy included
- ✅ Overall score ≥85/100

**If fails**: Blocks progression, shows recommendations, requires fixing.

### 3. **Human Checkpoints** (User Approval Required)

After each phase validation passes:

```
✅ Specification created (Quality: 88/100)

Review: .speckit/SPECIFICATION.md

Approve specification? (yes/refine/restart)
```

AI **MUST WAIT** for user response before continuing. No auto-approval.

### 4. **Agent Specialization** (Single Responsibility)

Each phase has a dedicated agent with specific instructions:

| Phase | Agent | Role | Output |
|-------|-------|------|--------|
| Specify | Requirements Analyst | Extract clear requirements | SPECIFICATION.md |
| Plan | Technical Architect | Design architecture & tasks | PLAN.md |
| Implement | Implementation Engineer | Build with TDD | Code + Tests |

Agents can **only** work on their assigned phase. No overlap.

### 5. **TDD Enforcement** (Test-First Always)

Implementation phase follows strict cycle:

```
For each task:
  1. RED: Write failing tests first
  2. GREEN: Implement minimum code to pass
  3. REFACTOR: Clean up
  4. VALIDATE: Run quality checks
  5. COMMIT: Save progress

Next task only starts after all 5 steps complete.
```

### 6. **State Tracking** (Progress Visible)

```json
// .speckit/state.json
{
  "currentPhase": "implement",
  "phases": {
    "constitute": { "status": "completed" },
    "specify": { "status": "completed", "quality": 88 },
    "plan": { "status": "completed", "quality": 91 },
    "implement": { "status": "in_progress" }
  }
}
```

State prevents:
- Skipping phases
- Losing progress
- Forgetting what's next

---

## Installation & Setup

### 1. Install SpecKit

```bash
npm install -g @astrosteveo/speckit
```

The `.claude/` and `.claude-plugin/` directories are included, making it a Claude Code plugin automatically.

### 2. Start a Project

In Claude Code, run:

```
/speckit my-project
```

This initializes:
- `.speckit/` directory
- `state.json` for tracking
- Phase orchestration

### 3. Follow the Workflow

SpecKit guides you through each phase. At each checkpoint, **you decide** whether to proceed or refine.

---

## Using SpecKit in Claude Code

### Command Reference

```bash
/speckit                  # Resume existing or start new workflow
/speckit my-project       # Start new workflow with name
/speckit status           # Show detailed progress
```

### Typical Session

```
You: /speckit todo-app

SpecKit: Let's build your todo app! First, let's define the guiding principles.
What is the core purpose of this todo app?

You: A simple, fast todo list with offline support.

SpecKit: Perfect. What should this project prioritize?
[Interactive questions follow...]

[Constitution created]

SpecKit: ✅ Constitution created
Review: .speckit/CONSTITUTION.md

Ready to create the detailed specification?

You: Yes

[SpecKit launches Requirements Analyst agent]
[Agent reads constitution + your description]
[Agent creates SPECIFICATION.md]
[Validator runs automatically]

SpecKit: ✅ Specification created (Quality: 92/100)
- 8 functional requirements
- 3 non-functional requirements
- 5 user stories with acceptance criteria

Review: .speckit/SPECIFICATION.md

Approve specification? (yes/refine/restart)

You: Yes

[Process continues through Plan → Implement phases]
```

### What Makes This Different?

**GitHub Spec-Kit**:
- Multi-agent compatible
- Can go off-rails
- No automatic validation
- Manual quality checks

**SpecKit (This)**:
- Claude Code optimized
- **Cannot** go off-rails (quality gates + hooks)
- Automatic validation at every phase
- Human approval required at checkpoints
- TDD enforced
- State-tracked progress

---

## Quality Gate Details

### Specification Validation

```javascript
// Checks performed by validate-spec.js

1. Completeness (33%)
   - Functional requirements ≥5
   - Non-functional requirements ≥2
   - User stories ≥2
   - Acceptance criteria present

2. Clarity (33%)
   - No vague terms (easy, simple, fast)
   - Specific metrics
   - Clear success criteria

3. Testability (34%)
   - Each requirement can be tested
   - Acceptance criteria are measurable
   - No ambiguous language
```

**Pass threshold**: 85/100

**If fails**:
```
❌ Specification Quality: 72/100 (threshold: 85)

Issues:
- Too few functional requirements (3, need 5+)
- No user stories defined
- 4 requirements too vague: "app should be fast"

Recommendations:
- Add 2+ more functional requirements
- Create user stories with acceptance criteria
- Replace "fast" with specific metric (e.g., "<200ms response time")
```

### Plan Validation

```javascript
// Checks performed by validate-plan.js

1. Completeness (40%)
   - Architecture overview present
   - All components identified
   - Tech stack decisions documented

2. Actionability (40%)
   - Tasks broken down
   - Dependencies clear
   - Estimates reasonable (2-8 hours)

3. Feasibility (20%)
   - No obvious blockers
   - Test strategy defined
   - Risks identified
```

**Pass threshold**: 85/100

---

## Hooks Explained

### Pre-Write Hook

```json
{
  "matcher": "Write",
  "hooks": [{
    "command": "node .speckit/validate-before-write.js"
  }]
}
```

**Runs before**: Any Write tool call
**Checks**: Phase prerequisites (e.g., can't write PLAN.md if SPECIFICATION.md doesn't exist)
**Result**: Blocks write if prerequisites missing

### Post-Write Hooks

```json
{
  "matcher": "Write(.speckit/SPECIFICATION.md)",
  "hooks": [{
    "command": "node .speckit/validate-spec.js"
  }]
}
```

**Runs after**: SPECIFICATION.md is written
**Checks**: Quality score ≥85
**Result**: Blocks progression if validation fails

---

## Agent Orchestration

When SpecKit invokes an agent, it uses the Task tool:

```
Task tool with description: "Analyze and create specification"

Prompt:
---
You are the Requirements Analyst.

[Full agent instructions from .claude/agents/analyst.md]

Project: todo-app
Constitution: [content from CONSTITUTION.md]

Your task:
Create a detailed specification with:
- 5+ functional requirements
- 2+ non-functional requirements
- 2+ user stories with acceptance criteria

Output:
Write to .speckit/SPECIFICATION.md

Quality will be validated automatically after you finish.
---
```

The agent:
1. Reads the constitution
2. Analyzes the project
3. Creates SPECIFICATION.md
4. Quality validator runs automatically (hook)
5. If ≥85: Shows to user for approval
6. If <85: Shows issues, blocks progression

---

## Preventing Off-Rails Behavior

### Problem: AI Makes Assumptions

**Solution**: Phase 1 (Constitute) forces asking clarifying questions first.

### Problem: Requirements Drift

**Solution**: SPECIFICATION.md is the source of truth. All code must trace back to a requirement.

### Problem: No Stopping Points

**Solution**: Human checkpoints after Constitute, Specify, Plan phases.

### Problem: Hard to Validate

**Solution**: Automated quality gates + acceptance criteria in every user story.

### Problem: Unclear Next Steps

**Solution**: State tracking shows exactly what phase you're in and what's next.

---

## Advanced Features

### Documentation Generator

```bash
speckit docs generate --format=html
```

Generates docs from:
- SPECIFICATION.md (requirements)
- Source code (JSDoc)

Output: `.speckit/docs/html/documentation.html`

### Plugin System

```bash
speckit plugins list          # Show loaded plugins
speckit plugins create agent  # Create custom agent
```

Extend SpecKit with:
- Custom agents (`.claude/agents/`)
- Custom validators (`.claude/validators/`)
- Custom templates (`.claude/templates/`)

### Configuration

```bash
speckit config list                        # Show all config
speckit config set qualityThreshold.spec 90  # Raise quality bar
```

---

## Troubleshooting

### "Quality gate keeps failing"

**Problem**: Specification score is 78/100
**Solution**: Read the specific issues in the validation output. Address each one explicitly.

### "Agent went off-script"

**Problem**: Implementation doesn't match spec
**Solution**: This shouldn't happen with SpecKit! If it does:
1. Check `.speckit/state.json` - did phases complete?
2. Run `/speckit status` - are you in the right phase?
3. Refer back to SPECIFICATION.md - is the requirement clear?

### "Stuck in a phase"

**Problem**: Can't seem to progress
**Solution**:
```
/speckit refine   # Make changes to current phase
```

### "Want to start over"

**Problem**: Went down wrong path
**Solution**:
```
/speckit reset    # Clear everything, start fresh
```

---

## Comparison: GitHub Spec-Kit vs. SpecKit

| Feature | GitHub Spec-Kit | SpecKit (This) |
|---------|----------------|----------------|
| Phases | 6 | 4 (streamlined) |
| Quality Gates | Manual | **Automatic** |
| Multi-Agent | Yes (many) | Yes (Claude Code) |
| Can Go Off-Rails | **Yes** | **No** (hooks prevent) |
| TDD Enforcement | No | **Yes** |
| Human Checkpoints | Optional | **Required** |
| State Tracking | No | **Yes** |
| npm Package | No | **Yes** |
| Documentation Generator | No | **Yes** |
| Plugin System | No | **Yes** |

---

## Best Practices

### 1. Trust the Process

Don't rush through phases. If quality gate fails, there's a real issue.

### 2. Review at Checkpoints

Actually read SPECIFICATION.md before approving. Catch issues early.

### 3. Use Refinement

If something's not right, use `/speckit refine` instead of approving and fixing later.

### 4. Keep Constitution Handy

When making decisions during implementation, refer back to your principles.

### 5. Follow TDD Strictly

RED → GREEN → REFACTOR. No shortcuts.

---

## Summary

**SpecKit** is a Claude Code plugin that enforces spec-driven, test-driven development with:

- ✅ **4 structured phases** (Constitution → Specification → Plan → Implementation)
- ✅ **Automatic quality gates** (≥85% threshold)
- ✅ **Human checkpoints** (must approve before proceeding)
- ✅ **Agent specialization** (each phase has dedicated agent)
- ✅ **TDD enforcement** (RED → GREEN → REFACTOR cycle)
- ✅ **State tracking** (always know where you are)
- ✅ **Validation hooks** (prevent going off-rails)

**Result**: AI stays focused, builds what you actually want, with tests to prove it works.

---

**Get Started:**
```
npm install -g @astrosteveo/speckit
/speckit my-project
```

**Documentation**: https://github.com/astrosteveo/speckit
**Issues**: https://github.com/astrosteveo/speckit/issues
