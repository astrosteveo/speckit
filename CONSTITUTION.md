# SpecKit Constitution

**Project**: SpecKit
**Purpose**: Test-driven specification-first development toolkit for Claude Code
**Date**: 2025-10-20

## Core Principles

### 1. Simplicity Over Complexity

**We believe**: Simple tools are more powerful than complex ones.

**In practice**:
- One primary command (`/speckit`) instead of many
- Minimal configuration required
- Clear, obvious workflows
- No hidden magic or assumptions

**We reject**:
- Feature bloat
- Configuration hell
- Overly abstract architectures
- Unnecessary indirection

### 2. Test-First, Always

**We believe**: Tests are specifications. Code is implementation.

**In practice**:
- Write tests before code
- All features must have tests
- Minimum 80% code coverage
- Tests serve as documentation

**We reject**:
- "We'll add tests later"
- Untested edge cases
- Mock-heavy tests that don't validate behavior
- Tests that test implementation, not behavior

### 3. Specifications Are Executable

**We believe**: Specifications shouldn't be documentation. They should be contracts.

**In practice**:
- Specs define WHAT and WHY
- Code defines HOW
- Specs stay current (not outdated docs)
- Bugs update specs, not just code

**We reject**:
- Specs that drift from reality
- Code diverging from specs
- "The code is the documentation"
- Treating specs as throw-away artifacts

### 4. Human Judgment Required

**We believe**: AI assists. Humans decide.

**In practice**:
- Checkpoints at every phase
- Human approval required to proceed
- AI suggests, human validates
- Clear points for review

**We reject**:
- Fully autonomous code generation
- Auto-proceeding without review
- Treating AI output as infallible
- Bypassing human oversight

### 5. Iterative, Not Linear

**We believe**: Good design emerges through iteration.

**In practice**:
- Easy to go back and refine
- Version specs (v1, v2, v3...)
- Encourage experimentation
- Learn from mistakes

**We reject**:
- Waterfall "spec once, never change"
- Rigid phase gates that prevent learning
- Making refinement difficult
- Punishing course correction

## Technical Principles

### 6. Claude Code Native

**We believe**: Build for the platform, use its strengths.

**In practice**:
- Use Claude Code Agent SDK properly
- Leverage sub-agents for specialized tasks
- Use MCPs for external knowledge
- Use Skills for autonomous assistance

**We reject**:
- Platform-agnostic abstractions
- Reinventing what Claude Code provides
- Fighting the framework
- Lowest-common-denominator design

### 7. Minimal State, Maximum Clarity

**We believe**: State should be simple and inspectable.

**In practice**:
- One state file (`.speckit/state.json`)
- Human-readable formats
- Easy to debug and fix manually
- State lives in version control

**We reject**:
- Complex state machines
- Binary state files
- State in databases
- State that can't be inspected/fixed

### 8. Dependencies Are Liabilities

**We believe**: Every dependency is a risk and maintenance burden.

**In practice**:
- Zero runtime dependencies
- Minimal dev dependencies (just testing)
- Use Node.js built-ins
- Keep it lean

**We reject**:
- npm install hell
- Framework churn
- Dependency vulnerabilities
- "There's an npm for that"

## Quality Principles

### 9. Quality Is Built-In, Not Bolted-On

**We believe**: Quality must be part of the process, not an afterthought.

**In practice**:
- Quality gates at each phase
- Automated quality scoring
- Clear quality thresholds
- Fail fast on quality issues

**We reject**:
- "We'll fix quality later"
- Shipping known-bad code
- Ignoring quality metrics
- Post-hoc quality audits

### 10. Documentation Is Code

**We believe**: Good code explains itself. Good docs show examples.

**In practice**:
- Code is readable first
- Comments explain WHY, not WHAT
- Examples over long explanations
- README shows quick start

**We reject**:
- Walls of text
- Outdated documentation
- Docs that repeat code
- "RTFM" attitudes

## Workflow Principles

### 11. Workflows Are Conversations

**We believe**: Development is dialogue between human and AI.

**In practice**:
- Ask questions instead of assuming
- Confirm understanding before proceeding
- Show work, explain reasoning
- Adapt to user feedback

**We reject**:
- One-shot code generation
- Silent failures
- Assuming user intent
- Ignoring clarification questions

### 12. Errors Should Teach

**We believe**: Bugs are learning opportunities.

**In practice**:
- Bug reports trace back to specs
- Failed quality gates explain why
- Clear error messages with suggestions
- Turn bugs into better specs

**We reject**:
- Cryptic error messages
- Silent failures
- "Works on my machine"
- Treating symptoms, not causes

## Meta-Principle

### 13. We Eat Our Own Dog Food

**We believe**: If SpecKit can't build SpecKit, it's not good enough.

**In practice**:
- SpecKit is built using SpecKit principles
- This constitution guides SpecKit development
- We write specs for SpecKit
- We practice what we preach

**We reject**:
- "Do as I say, not as I do"
- Building tools we wouldn't use ourselves
- Exempting ourselves from our own rules
- Hypocrisy

---

## Governance

### How We Make Decisions

1. Does it align with our principles?
2. Does it make the tool simpler or more complex?
3. Would we want to use it ourselves?
4. Can we test it?
5. Is it worth the maintenance burden?

If the answer to 1, 3, and 4 is YES, and 2 is SIMPLER, and 5 is YES, we proceed.

### How We Handle Tradeoffs

When principles conflict:
- **Simplicity trumps features**
- **Testing trumps cleverness**
- **User clarity trumps developer convenience**
- **Long-term maintainability trumps short-term productivity**

### How We Evolve

This constitution is not immutable. As we learn:
- Document what we learn
- Update principles based on evidence
- Version this constitution (v1, v2, v3...)
- Explain changes in changelog

---

## Commitment

By building SpecKit, we commit to:
- Following these principles ourselves
- Accepting feedback when we violate them
- Continuously improving based on experience
- Being honest about what works and what doesn't

**This is our contract with ourselves and our users.**

---

**Version**: 1.0
**Last Updated**: 2025-10-20
**Status**: Active
