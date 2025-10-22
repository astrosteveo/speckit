# Parallel Execution Design

## Overview

Enable parallel execution of independent tasks during SpecKit workflow phases to dramatically reduce total execution time.

## Problem

Currently, SpecKit executes all tasks sequentially:
- Constitute → Specify → Plan → Implement
- Within Implement: Task 1 → Task 2 → Task 3 → ... → Task N

This is inefficient when tasks have no dependencies and could run concurrently.

## Solution

### 1. Dependency Graph in PLAN.md

The Technical Architect will include dependency information in PLAN.md:

```markdown
## Implementation Tasks

### TASK-001: Database Schema
**Dependencies**: None
**Estimated Time**: 2 hours
...

### TASK-002: API Authentication
**Dependencies**: TASK-001 (needs database)
**Estimated Time**: 3 hours
...

### TASK-003: Frontend Components
**Dependencies**: None
**Estimated Time**: 2 hours
...

### TASK-004: Integration Tests
**Dependencies**: TASK-002, TASK-003
**Estimated Time**: 1 hour
...
```

### 2. Parallel Execution Algorithm

```javascript
// Parse dependency graph from PLAN.md
const tasks = parsePlan(planContent);
const graph = buildDependencyGraph(tasks);

// Execute in waves (topological sort with parallelization)
while (remainingTasks.length > 0) {
  // Find all tasks with satisfied dependencies
  const readyTasks = tasks.filter(task =>
    task.dependencies.every(dep => completedTasks.includes(dep))
  );

  // Execute all ready tasks IN PARALLEL
  const results = await Promise.all(
    readyTasks.map(task => executeTask(task))
  );

  // Mark completed
  completedTasks.push(...readyTasks);
}
```

### 3. Claude Code Integration

Use multiple `Task` tool calls in a single message to launch parallel agents:

```javascript
// In the /speckit slash command orchestrator
if (readyTasks.length > 1) {
  // Launch multiple agents in parallel
  for (const task of readyTasks) {
    // Use Task tool with subagent_type=general-purpose
    // Each agent gets its own task context
  }
} else {
  // Single task, execute normally
}
```

### 4. State Tracking for Parallel Execution

Extend `.speckit/state.json` to track parallel execution:

```json
{
  "workflowId": "2025-01-21-myproject",
  "projectName": "My Project",
  "currentPhase": "implement",
  "phases": {
    "implement": {
      "status": "in_progress",
      "parallelExecution": {
        "enabled": true,
        "currentWave": 2,
        "activeTasks": ["TASK-005", "TASK-006", "TASK-007"],
        "completedTasks": ["TASK-001", "TASK-002", "TASK-003", "TASK-004"]
      }
    }
  }
}
```

## Benefits

### Time Savings Example

**Sequential Execution:**
```
TASK-001 (2h) → TASK-002 (3h) → TASK-003 (2h) → TASK-004 (1h)
Total: 8 hours
```

**Parallel Execution:**
```
Wave 1: TASK-001 (2h) || TASK-003 (2h)  →  2 hours
Wave 2: TASK-002 (3h)                    →  3 hours
Wave 3: TASK-004 (1h)                    →  1 hour
Total: 6 hours (25% faster!)
```

With more independent tasks, savings increase dramatically:
- 10 tasks with 5 independent pairs: ~50% time reduction
- 20 tasks with good parallelization: ~60-70% time reduction

## Implementation Plan

### Phase 1: Update Plan Validator (Quality Gates)

1. **Modify `validatePlan()` in `src/core/quality.js`**
   - Check for "Dependencies" field in each task
   - Validate dependency references (all deps must exist)
   - Detect circular dependencies
   - Award quality points for good parallelization opportunities

2. **Update architect agent** (`.claude/agents/architect.md`)
   - Instruct to always include Dependencies field
   - Encourage identifying independent tasks
   - Suggest breaking large tasks into parallel-friendly subtasks

### Phase 2: Build Dependency Graph Parser

3. **Create `src/core/dependency-graph.js`**
   ```javascript
   export function parseDependencyGraph(planContent) {
     // Parse PLAN.md and extract task dependencies
     // Return: { taskId: { dependencies: [...], estimatedTime: number } }
   }

   export function topologicalSort(graph) {
     // Return waves of tasks that can run in parallel
     // [[TASK-001, TASK-003], [TASK-002], [TASK-004]]
   }

   export function detectCircularDependencies(graph) {
     // Throw error if circular deps found
   }
   ```

### Phase 3: Update Slash Command Orchestrator

4. **Modify `.claude/commands/speckit`**
   - For Implement phase: Parse dependency graph
   - Determine current wave of tasks
   - Launch multiple agents in parallel for independent tasks
   - Track completion and move to next wave

### Phase 4: Update State Management

5. **Extend `src/core/state.js`**
   - Add `parallelExecution` field to phase status
   - Track currentWave, activeTasks, completedTasks
   - Update `getProgress()` to show parallel execution status

### Phase 5: Enhanced Progress Display

6. **Update `speckit status` command**
   ```
   ═══════════════════════════════════════════
   📊 SpecKit Workflow Status
   ═══════════════════════════════════════════
   Project: My Project
   Progress: [██████░░░░] 60%

   Phase Status:
     ✅ Constitute    (100%)
     ✅ Specify       (88/100)
     ✅ Plan          (91/100)
     ⏳ Implement     Wave 2/4

   Parallel Execution:
     Wave 2 (3 tasks running in parallel):
       ⏳ TASK-005 - User authentication
       ⏳ TASK-006 - Email notifications
       ⏳ TASK-007 - Admin dashboard

   Completed: 12/20 tasks (60%)
   Est. Time Saved: 4.5 hours (through parallelization)
   ```

## Configuration

Add to `.speckit/config.json`:

```json
{
  "parallelExecution": {
    "enabled": true,
    "maxConcurrentTasks": 5,
    "autoDetectDependencies": true
  }
}
```

## Testing Strategy

1. **Unit tests for dependency graph**
   - Parse dependencies from PLAN.md
   - Topological sort correctness
   - Circular dependency detection
   - Empty graph handling

2. **Integration tests for parallel execution**
   - Mock multiple tasks with dependencies
   - Verify correct wave execution order
   - Verify all tasks complete
   - Verify state tracking accuracy

3. **End-to-end test**
   - Create a test project with 10 tasks
   - Run with parallel execution enabled
   - Verify time savings vs sequential
   - Verify correctness of final implementation

## Risks & Mitigations

**Risk**: Tasks thought to be independent actually have hidden dependencies
- **Mitigation**: Quality validation checks for common patterns (e.g., both tasks modify same file)

**Risk**: Claude Code context limits when running many agents in parallel
- **Mitigation**: maxConcurrentTasks configuration limit (default: 5)

**Risk**: One parallel task fails, blocks dependent tasks
- **Mitigation**: Robust error handling, allow retry of failed task without restarting wave

**Risk**: Merge conflicts when parallel tasks modify related code
- **Mitigation**: Architect agent instructed to identify potential conflicts, warn user

## Future Enhancements

1. **Auto-dependency detection**: Analyze task descriptions with LLM to suggest dependencies
2. **Dynamic re-scheduling**: If task completes faster than estimated, start next wave early
3. **Resource-aware scheduling**: Limit parallel tasks based on system resources
4. **Visual timeline**: Show Gantt chart of parallel execution plan
5. **Parallel Specify/Plan phases**: Break large specs/plans into parallel sections

## Success Metrics

- **Time Reduction**: Average 40-60% reduction in total workflow time for projects with 10+ tasks
- **Quality Maintained**: No drop in quality scores for parallel vs sequential execution
- **User Satisfaction**: 90%+ of users report improved workflow speed
- **Correctness**: 100% of parallel executions produce identical results to sequential

## Example: Real-World Project

**Project**: E-commerce platform with 24 implementation tasks

**Sequential Execution**: 48 hours total

**Parallel Execution**:
- Wave 1 (5 tasks): Database, Auth, Cart, Products, Orders → 6 hours
- Wave 2 (7 tasks): APIs depending on Wave 1 → 8 hours
- Wave 3 (8 tasks): Frontend components → 6 hours
- Wave 4 (4 tasks): Integration tests → 4 hours

**Total**: 24 hours (50% faster!)

---

## Next Steps

1. Implement Phase 1: Update plan validator
2. Create dependency graph parser
3. Update slash command orchestrator
4. Test with real project
5. Measure time savings
6. Iterate based on results
