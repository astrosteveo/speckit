# SpecKit: Vibe-Coder Friendly Improvements

**Status**: In Progress (Not ready for publish yet)
**Goal**: Make SpecKit frictionless for developers who want to jump in and code

---

## The Problem

**Original Constitution Phase**:
- ❌ Asked **20+ questions** before you could start
- ❌ Required detailed answers for each
- ❌ Felt like homework, not coding
- ❌ Discouraging for vibe-coders who just want to build

**Target Audience** (vibe-coders):
- Want to jump in and sling code
- Don't want to fill out forms
- Need guardrails but shouldn't feel them
- Want quick → coding, not quick → questions

---

## The Solution

### 1. Streamlined Constitution (3 Questions Max)

**Old Flow** (20+ prompts):
```
Question 1: Core Purpose (1-2 sentences)
Question 2: How many principles? (3-5)
  Principle 1 Title:
  Principle 1 Description:
  Principle 2 Title:
  Principle 2 Description:
  ...
Question 3: How many priorities? (2-4)
  Priority 1 Name:
  Priority 1 Rationale:
  Priority 2 Name:
  Priority 2 Rationale:
  ...
Question 4: How many non-negotiables? (1-5)
  Non-negotiable 1:
  Non-negotiable 2:
  ...
Question 5: How many success criteria? (2-5)
  Success criterion 1:
  Success criterion 2:
  ...

Total: 20+ questions!
```

**New Flow** (3 questions, 2 optional):
```
What are you building?
→ "A todo app" or "A real-time collaborative task manager"

Any specific priorities? (optional - hit enter to skip)
→ "fast, simple" or "" (skip)

Anything to avoid or constraints? (optional - hit enter to skip)
→ "no databases" or "" (skip)

Done! Constitution auto-generated.
Time to Constitution: ~30 seconds (down from 5-10 minutes)
```

### 2. Auto-Generated Principles

Instead of asking users to define principles, we auto-generate sensible ones:

```markdown
## Guiding Principles

1. **Specification-Driven**: Build what's specified, specify what's needed
2. **Test-First Development**: Write tests before code (RED → GREEN → REFACTOR)
3. **Quality Over Speed**: Ship working, tested code - not rushed code
```

These principles **enforce the framework** while being invisible to the user.

### 3. Flexible Input

**User can be succinct**:
```
What are you building?
→ todo app

Any specific priorities?
→ [enter to skip]

Any constraints?
→ [enter to skip]
```

**Or detailed** (if they want):
```
What are you building?
→ A full-stack task management system with real-time collaboration,
  offline sync, team workspaces, and mobile apps

Any specific priorities?
→ real-time performance, offline-first architecture, enterprise security

Any constraints?
→ must support 10,000+ concurrent users, mobile apps need <5MB bundle,
  compliance with SOC2 and GDPR
```

Both work! The level of detail is up to the user.

---

## The Real Guardrails (Invisible)

The **actual** controls that keep AI on track:

### 1. Quality Gates (Automatic)
After Specification is created, automatic validation:
- ✅ 5+ clear functional requirements
- ✅ 2+ non-functional requirements
- ✅ Testable acceptance criteria
- ✅ Score ≥85/100

**If fails**: Blocks progression, shows issues, requires refinement
**User never has to answer 20 questions** - the Analyst agent does the work

### 2. TDD Enforcement (Natural)
Implementation phase follows strict cycle:
```
For each task:
  1. RED: Write failing test
  2. GREEN: Make it pass
  3. REFACTOR: Clean up

Next task only starts after cycle completes.
```

This **feels natural** to coders - they're coding within minutes.

### 3. Phase Progression (Can't Skip)
```
Constitution (required)
    ↓
Specification (validated, user approves)
    ↓
Plan (validated, user approves)
    ↓
Implementation (validated per task)
```

Can't skip phases. But checkpoints feel like **pair programming approval**, not bureaucracy.

---

## Ideal User Experience

**Goal**: 3 minutes from start to coding

```
Time 0:00
User: /speckit todo-app

SpecKit: What are you building?

Time 0:15
User: A simple todo list

SpecKit: Any specific priorities? (enter to skip)

Time 0:20
User: [hits enter]

SpecKit: Any constraints? (enter to skip)

Time 0:22
User: [hits enter]

SpecKit: ✅ Constitution created
Launching Requirements Analyst...

Time 0:30
[Analyst agent reads "simple todo list" + auto-generated principles]
[Analyst creates detailed specification]
[Validator runs automatically]

SpecKit: ✅ Specification created (Quality: 88/100)
   - 5 functional requirements
   - 3 non-functional requirements
   - 4 user stories

Review: .speckit/SPECIFICATION.md

Approve? (yes/refine)

Time 1:00
User: yes

SpecKit: Launching Technical Architect...

Time 1:30
[Architect creates implementation plan]
[Validator runs automatically]

SpecKit: ✅ Plan created (Quality: 92/100)
   - 8 tasks (~20 hours)
   - Node.js + Express + SQLite

Review: .speckit/PLAN.md

Approve? (yes/refine)

Time 2:00
User: yes

SpecKit: Starting implementation...

Task 1/8: Initialize project structure
Let's write the tests first...

Time 3:00
[User is now coding with TDD]
```

**Total questions asked**: 3 (2 were optional)
**Time to coding**: 3 minutes
**Guardrails active**: All of them (invisible)

---

## What's Changed (Implementation)

### Constitution Command (`src/commands/constitute.js`)

**Before**:
- 5 major questions
- 3-5 sub-prompts for each
- 20+ total prompts
- Detailed title + description for each item

**After**:
- 3 questions total
- 2 are optional (hit enter to skip)
- Accepts comma-separated input for quick entry
- Auto-generates sensible principles

### Constitution Template (`src/templates/constitution.md`)

**Before**:
- Complex structure with rationales
- Multiple sections (principles, priorities, non-negotiables, success criteria, decision framework)

**After**:
- Simple structure
- Auto-generated principles (always the same, enforce framework)
- Optional priorities and constraints
- Focus on methodology

### Phase Orchestrator (`src/phases/constitute.js`)

**Before**:
- Expected detailed structured objects

**After**:
- Accepts simple strings
- Parses comma-separated input
- Auto-generates quality principles
- Defaults to sensible values if skipped

---

## What Still Needs Work

### ⏳ Pending Tasks

1. **Update `.claude/commands/speckit` orchestration**
   - Reflect streamlined constitution flow
   - Emphasize "quick to code" messaging
   - Update example flows

2. **Test complete user flow**
   - Manually test from `/speckit` to coding
   - Verify 3-minute target
   - Ensure agents work with minimal input

3. **Update all documentation**
   - README.md
   - CLAUDE_CODE_INTEGRATION.md
   - `.claude/commands/speckit.md` (user-facing)
   - Emphasize "vibe-coder friendly"

4. **Add "Skip All" Option**
   - For ultimate speed: `/speckit my-app --quick`
   - Skips all optional questions
   - Uses all defaults
   - Straight to Specification phase

5. **Test Edge Cases**
   - What if user just types "app" for project description?
   - What if all fields are skipped?
   - How does Analyst agent handle minimal input?

---

## Success Criteria

Before we publish v2.2.0, it must:

- ✅ Constitution phase: 3 questions max (2 optional)
- ✅ Constitution phase: <1 minute to complete
- ⏳ Full workflow: Start to coding in <3 minutes
- ⏳ User tests: 3+ vibe-coders try it, report it's easy
- ⏳ Quality gates: Still enforce 85% threshold
- ⏳ TDD enforcement: Still works properly
- ⏳ Documentation: Clearly shows "quick start" path

---

## Comparison: Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Constitution questions | 20+ | 3 (2 optional) |
| Time to constitution | 5-10 min | 30 sec |
| Required detail | High | User's choice |
| Time to coding | 10-15 min | 3 min (goal) |
| Feel | Homework | Conversation |
| Principles | User defines | Auto-generated |
| Guardrails | Visible (questions) | Invisible (gates) |

---

## Philosophy

**Old Approach**:
"Gather detailed requirements upfront through structured questions"

**New Approach**:
"Let users describe their vision naturally, then AI does the structured work"

**The Key Insight**:
- Vibe-coders don't want to answer questions
- They want to **describe** what they're building
- The framework should **extract** structure from description
- Guardrails should be **automatic** (quality gates, TDD), not manual (questions)

---

## Next Steps

1. Test the streamlined flow manually
2. Ensure Analyst agent works with minimal input ("todo app")
3. Update all documentation to reflect new experience
4. Get feedback from 2-3 real users
5. Only then publish v2.2.0

**Status**: Not ready for publish yet. Good progress, more testing needed.

---

**Built for**: Vibe-coders who want to jump in and build
**Philosophy**: Invisible guardrails, visible progress
**Target**: 3 minutes from idea to coding, with quality enforced automatically
