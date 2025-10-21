# SpecKit Specification

**Version**: 1.0
**Status**: Draft
**Date**: 2025-10-20

## Purpose

SpecKit is a test-driven, specification-first development toolkit for Claude Code that transforms project ideas into production-ready code through an iterative, human-guided workflow.

## Problem Statement

**Current State**: Developers using AI coding assistants often experience "vibe coding" - generating code without clear requirements, leading to:
- Unclear requirements that shift during implementation
- Code that doesn't match actual needs
- Difficult-to-maintain codebases
- Lost context between sessions
- No clear source of truth

**Desired State**: Developers have a structured workflow that:
- Captures requirements clearly before coding
- Maintains specifications as living documents
- Enables iterative refinement based on learning
- Provides clear checkpoints for human review
- Ensures code matches specifications

## User Stories

### Story 1: Starting a New Project
**As a** developer
**I want to** start a new project with clear specifications
**So that** I know exactly what I'm building before I write code

**Acceptance Criteria**:
- Single command (`/speckit`) initiates workflow
- Interactive prompts gather project context
- Constitution (principles) created and reviewed
- Specification generated from conversation
- Human can approve or refine before proceeding

### Story 2: Iterating on Specifications
**As a** developer
**I want to** refine my specifications after reviewing plans
**So that** I can improve requirements based on what I learn

**Acceptance Criteria**:
- Can go back to any previous phase
- Specification versioning (v1, v2, v3)
- Changelog tracks what changed and why
- Downstream artifacts marked as outdated
- Easy regeneration of affected artifacts

### Story 3: Test-Driven Implementation
**As a** developer
**I want** tests written before implementation
**So that** I have confidence the code works as specified

**Acceptance Criteria**:
- Tests generated from acceptance criteria
- RED-GREEN-REFACTOR cycle enforced
- Tests run automatically
- Coverage measured and reported
- Quality gates prevent proceeding with failing tests

### Story 4: Resuming Work
**As a** developer
**I want to** resume work easily after breaks
**So that** I don't lose context or forget where I was

**Acceptance Criteria**:
- State persisted in `.speckit/state.json`
- Status command shows current phase and progress
- Clear next actions suggested
- All artifacts readable and inspectable
- Can manually edit state if needed

### Story 5: Tracking Quality
**As a** developer
**I want** automated quality scoring
**So that** I know if specifications and code meet standards

**Acceptance Criteria**:
- Quality scores for each phase (0-100)
- Clear thresholds (spec ≥85, code ≥80)
- Specific feedback on quality issues
- Quality reports in JSON format
- Historical quality tracking

## Functional Requirements

### FR1: Workflow Management
- **FR1.1**: Single `/speckit` command initiates complete workflow
- **FR1.2**: Workflow has 4 phases: Constitute → Specify → Plan → Implement
- **FR1.3**: Each phase has human checkpoint before proceeding
- **FR1.4**: Can return to previous phase at any time
- **FR1.5**: State persists between sessions

### FR2: Constitution Phase
- **FR2.1**: Interactive questions about project principles
- **FR2.2**: Generates `CONSTITUTION.md` in project root
- **FR2.3**: Human reviews and approves principles
- **FR2.4**: Can iterate until acceptable

### FR3: Specification Phase
- **FR3.1**: Conversational requirement gathering
- **FR3.2**: Generates structured specification with:
  - Functional requirements
  - Non-functional requirements
  - User stories with acceptance criteria
  - Success metrics
  - Constraints
- **FR3.3**: Quality scoring (completeness, clarity, testability)
- **FR3.4**: Version control (v1, v2, v3...)
- **FR3.5**: Changelog for modifications

### FR4: Planning Phase
- **FR4.1**: Converts specification into technical plan
- **FR4.2**: Plan includes:
  - Architecture overview
  - Technology choices
  - Task breakdown
  - Dependency graph
  - Estimated effort
- **FR4.3**: Quality scoring (completeness, actionability, feasibility)
- **FR4.4**: Detects spec changes and marks plan outdated

### FR5: Implementation Phase
- **FR5.1**: Test-driven development enforced
- **FR5.2**: For each task:
  - Write tests (RED)
  - Implement code (GREEN)
  - Refactor (REFACTOR)
- **FR5.3**: Quality gates:
  - All tests passing
  - Coverage ≥80%
  - No linting errors
  - Acceptance criteria met
- **FR5.4**: Progress tracking per task
- **FR5.5**: Auto-resume from last incomplete task

### FR6: State Management
- **FR6.1**: Single source of truth: `.speckit/state.json`
- **FR6.2**: Human-readable JSON format
- **FR6.3**: Tracks:
  - Current phase
  - Workflow ID
  - Project name
  - Phase status (pending/in_progress/completed)
  - Quality scores
  - Current task
  - Timestamps
- **FR6.4**: Can be manually edited
- **FR6.5**: Versioned with git

### FR7: Agent Orchestration
- **FR7.1**: Uses Claude Code Task tool for sub-agents
- **FR7.2**: Three specialized agents:
  - Analyst (requirements)
  - Architect (planning)
  - Engineer (implementation)
- **FR7.3**: Agents work in isolation (context-free between agents)
- **FR7.4**: Agents communicate via artifacts (files)

### FR8: Quality Validation
- **FR8.1**: Automated quality scoring for each phase
- **FR8.2**: Configurable thresholds
- **FR8.3**: Quality reports in JSON format
- **FR8.4**: Specific feedback and suggestions
- **FR8.5**: Prevents proceeding below threshold

## Non-Functional Requirements

### NFR1: Performance
- Workflow initialization: < 2 seconds
- Phase transitions: < 1 second
- Agent dispatch: < 5 seconds to start
- State reads/writes: < 100ms

### NFR2: Reliability
- All operations are idempotent
- State corruption recovery possible
- No data loss on interruption
- Graceful failure handling

### NFR3: Usability
- Single command to learn: `/speckit`
- Clear prompts and questions
- Progress indicators visible
- Next actions always suggested
- Error messages actionable

### NFR4: Maintainability
- Zero runtime dependencies
- 100% test coverage goal (minimum 80%)
- All code documented
- Simple architecture (no over-engineering)

### NFR5: Compatibility
- Node.js ≥18.0.0
- Claude Code ≥1.0.0
- Works on Linux, macOS, Windows
- Git required for versioning

### NFR6: Security
- No credentials in state files
- No external API calls (except MCPs)
- All data stays local
- User controls all data

## Technical Constraints

### TC1: Platform
- Built for Claude Code Agent SDK
- Uses Task tool for agent dispatch
- Integrates with Claude Code command system
- Follows Claude Code conventions

### TC2: Implementation
- JavaScript ES modules
- No transpilation/build step
- Vitest for testing
- No framework dependencies

### TC3: Storage
- File-based (no databases)
- JSON for structured data
- Markdown for human documents
- Git for version control

### TC4: Architecture
```
speckit/
├── src/
│   ├── core/
│   │   ├── workflow.js       # Main workflow engine
│   │   ├── state.js          # State management
│   │   └── quality.js        # Quality validation
│   ├── phases/
│   │   ├── constitute.js     # Phase 1: Principles
│   │   ├── specify.js        # Phase 2: Requirements
│   │   ├── plan.js           # Phase 3: Architecture
│   │   └── implement.js      # Phase 4: Code
│   ├── agents/
│   │   ├── analyst.js        # Requirements agent
│   │   ├── architect.js      # Planning agent
│   │   └── engineer.js       # Implementation agent
│   └── templates/
│       ├── constitution.js
│       ├── specification.js
│       └── plan.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── helpers/
├── .claude/
│   └── commands/
│       └── speckit.md
└── .speckit/                 # Created per-project
    ├── state.json
    ├── CONSTITUTION.md
    ├── SPECIFICATION.md
    ├── PLAN.md
    └── quality/
        └── *.json
```

## Success Metrics

### Primary Metrics
- **Specification Quality**: Average quality score ≥85
- **Test Coverage**: ≥80% for all projects
- **User Satisfaction**: Developers find it useful
- **Adoption**: Used for real projects

### Secondary Metrics
- Time from idea to working code
- Number of spec iterations (shows learning)
- Bug rate (specs prevent bugs)
- Developer productivity

## Open Questions

1. **Q**: Should we support multiple workflows simultaneously?
   **A**: Yes, but keep state per-project in `.speckit/`

2. **Q**: How to handle very large projects?
   **A**: Start with MVP, can add multi-spec support later

3. **Q**: Integration with existing codebases?
   **A**: V1 focuses on greenfield, V2 can add brownfield

4. **Q**: Custom agent types?
   **A**: Start with 3 core agents, extensibility later

5. **Q**: Multi-language support?
   **A**: Tool is language-agnostic, works for any language

## Out of Scope (V1)

- Visual UI/dashboard
- Cloud sync
- Team collaboration features
- CI/CD integration beyond basic git
- IDE extensions beyond Claude Code
- Migration from other tools
- Multi-repository projects
- Custom agent creation
- Plugin system

## Dependencies

**Required**:
- Node.js ≥18.0.0
- Git
- Claude Code

**Optional**:
- MCP servers (context7, puppeteer) for enhanced agents

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agent responses inconsistent | Medium | High | Templates, quality gates, testing |
| State corruption | Low | High | JSON validation, recovery tools |
| Slow agent responses | Medium | Medium | Streaming, progress indicators |
| User abandonment mid-flow | High | Low | State persistence, easy resume |
| Over-complexity | Medium | High | Constitution principle #1 |

## Validation Plan

### Unit Tests
- All core functions tested
- Edge cases covered
- Error handling validated
- Mock-free where possible

### Integration Tests
- Complete workflow end-to-end
- Phase transitions
- State persistence
- Quality gates

### Manual Testing
- Build a real project with SpecKit
- Test all user stories
- Verify acceptance criteria
- Dogfood our own tool

### Quality Gates
- 80% test coverage minimum
- All tests passing
- No linting errors
- Documentation complete

## Changelog

### v1.0 - 2025-10-20
- Initial specification
- Aligned with CONSTITUTION.md principles
- Based on Spec-Kit methodology
- Optimized for Claude Code

---

**Status**: Ready for review and approval
**Next Phase**: Set up testing infrastructure and begin TDD implementation
