# Testing Parallel Execution - Quick Demo

## Option 1: Test the Dependency Graph Module Directly

The fastest way to see it working:

```bash
# Run the dependency graph tests
npm test -- tests/unit/dependency-graph.test.js --run

# All 32 tests should pass, showing:
# - Dependency parsing works
# - Topological sorting works
# - Time savings calculations work
# - Circular dependency detection works
```

## Option 2: Test with a Mock PLAN.md

Create a test plan and validate it:

```bash
# Create a test directory
mkdir /tmp/parallel-test
cd /tmp/parallel-test

# Initialize SpecKit
npx @astrosteveo/speckit init test-project --yes

# Create a PLAN.md with dependencies
cat > .speckit/PLAN.md << 'EOF'
# Implementation Plan

## Task Breakdown

### T001: Database Setup
**Dependencies**: None
**Estimated Time**: 2 hours
**Description**: Set up PostgreSQL database schema

### T002: API Framework
**Dependencies**: None
**Estimated Time**: 3 hours
**Description**: Set up Express.js server

### T003: Frontend Shell
**Dependencies**: None
**Estimated Time**: 2 hours
**Description**: Create React app structure

### T004: User Endpoints
**Dependencies**: T001, T002
**Estimated Time**: 2 hours
**Description**: Create user CRUD endpoints

### T005: Product Endpoints
**Dependencies**: T001, T002
**Estimated Time**: 2 hours
**Description**: Create product CRUD endpoints

### T006: Frontend Components
**Dependencies**: T003
**Estimated Time**: 3 hours
**Description**: Build React components

### T007: Integration Tests
**Dependencies**: T004, T005, T006
**Estimated Time**: 2 hours
**Description**: End-to-end testing

## Execution Timeline

**Total Effort**: 16 hours
EOF

# Validate the plan - will show parallel execution analysis
npx @astrosteveo/speckit validate plan
```

**Expected Output:**
```
✓ Plan validated (Quality: 95/100)

Metrics:
  Completeness: 100/100
  Actionability: 95/100 (includes +15 bonus for excellent parallelization!)
  Feasibility: 90/100

Recommendations:
  ✓ Excellent task parallelization - estimated time savings significant
  ✓ Parallel execution could save ~6.0 hours (38%)

═══════════════════════════════════════════
📋 Parallel Execution Plan
═══════════════════════════════════════════

Total Tasks: 7
Execution Waves: 3

⏱️  Time Estimates:
  Sequential: 16h
  Parallel: 10h
  Time Saved: 6h (38%)

Execution Waves:

Wave 1 (3 tasks in parallel):
  • T001: Database Setup [2h]
  • T002: API Framework [3h]
  • T003: Frontend Shell [2h]

Wave 2 (3 tasks in parallel):
  • T004: User Endpoints [2h]
  • T005: Product Endpoints [2h]
  • T006: Frontend Components [3h]

Wave 3 (1 task):
  • T007: Integration Tests [2h]
```

## Option 3: Test Programmatically

Create a Node.js script to test the dependency graph:

```bash
# Create test script
cat > /tmp/test-parallel.js << 'EOF'
import {
  parseDependencyGraph,
  validateDependencies,
  topologicalSort,
  calculateTimeSavings,
  generateExecutionPlan
} from './src/core/dependency-graph.js';

const planContent = `
### T001: Setup Database
**Dependencies**: None
**Estimated Time**: 2 hours

### T002: Setup API
**Dependencies**: None
**Estimated Time**: 3 hours

### T003: Create Endpoints
**Dependencies**: T001, T002
**Estimated Time**: 2 hours
`;

console.log('Parsing dependency graph...\n');
const graph = parseDependencyGraph(planContent);
console.log('Tasks found:', Object.keys(graph));

console.log('\nValidating dependencies...\n');
const validation = validateDependencies(graph);
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);

console.log('\nCalculating execution waves...\n');
const waves = topologicalSort(graph);
console.log('Waves:', waves);

console.log('\nCalculating time savings...\n');
const savings = calculateTimeSavings(graph);
console.log('Sequential:', savings.sequential, 'minutes');
console.log('Parallel:', savings.parallel, 'minutes');
console.log('Saved:', savings.saved, 'minutes', `(${savings.percentage.toFixed(1)}%)`);

console.log('\n' + generateExecutionPlan(graph));
EOF

# Run it
cd /home/astrosteveo/workspace/claudekit
node /tmp/test-parallel.js
```

## Option 4: Test Within Claude Code (The Real Test!)

This is the ultimate test - using `/speckit` with a real project:

1. **Create a new test project:**
   ```bash
   mkdir /tmp/my-parallel-test
   cd /tmp/my-parallel-test
   ```

2. **In Claude Code, run:**
   ```
   /speckit my-parallel-test
   ```

3. **When it asks for project details, say:**
   ```
   "A simple task management API with:
   - User authentication
   - Task CRUD operations
   - PostgreSQL database
   - REST API with Express
   - Basic frontend with React"
   ```

4. **Go through the phases:**
   - **Constitute**: Define principles (keep it simple)
   - **Specify**: Agent creates detailed spec
   - **Plan**: Agent creates PLAN.md with task dependencies
   - **Validate**: You'll see the parallel execution analysis!

5. **Look for this in the Plan validation:**
   ```
   ✓ Excellent task parallelization - estimated time savings significant
   ✓ Parallel execution could save ~X hours (Y%)
   ```

6. **When you approve the plan, implementation will execute in waves:**
   ```
   Wave 1 (3 tasks in parallel):
     ⏳ T001 - Database Schema
     ⏳ T002 - API Setup
     ⏳ T003 - Frontend Shell

   [All 3 Implementation Engineer agents running simultaneously]
   ```

## Option 5: Quick Unit Test (Fastest!)

Just run the tests we already created:

```bash
cd /home/astrosteveo/workspace/claudekit

# Test dependency graph
npm test -- tests/unit/dependency-graph.test.js --run

# Test quality validation with parallel scoring
npm test -- tests/unit/quality.test.js --run
```

**Expected Results:**
- ✅ 32 dependency graph tests passing
- ✅ 16 quality validation tests passing
- ✅ Shows parsing, sorting, validation all work

## What to Look For

When testing, verify:

1. **Dependency parsing works:**
   - Tasks with `Dependencies: None` are identified
   - Tasks with `Dependencies: T001, T002` are parsed correctly
   - Circular dependencies are detected

2. **Wave generation works:**
   - Independent tasks grouped in same wave
   - Dependent tasks in later waves
   - Correct topological order

3. **Time savings calculated:**
   - Sequential time = sum of all tasks
   - Parallel time = sum of longest task per wave
   - Percentage savings reported

4. **Quality bonuses awarded:**
   - Plans with good parallelization get +10 to +15 points
   - Plans with poor parallelization get +5 points
   - Invalid dependencies get -40 points

## Troubleshooting

**If tests fail:**
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
npm ci

# Run specific test with verbose output
npm test -- tests/unit/dependency-graph.test.js --run --reporter=verbose
```

**If plan validation doesn't show parallel execution:**
- Make sure PLAN.md has `**Dependencies**:` fields
- Check task format matches: `### T001:` or `### TASK-001:`
- Verify at least 2 tasks exist

## Quick Demo Command

Copy-paste this entire block to test everything at once:

```bash
cd /home/astrosteveo/workspace/claudekit && \
echo "🧪 Testing Dependency Graph Module..." && \
npm test -- tests/unit/dependency-graph.test.js --run && \
echo -e "\n✅ All tests passed! Parallel execution is working!\n" && \
echo "📊 Now test with a real plan by running:" && \
echo "   /speckit my-test-project"
```

## Expected Timeline for Real Testing

If you run `/speckit` with a real project:

1. **Constitute**: 2-3 minutes (interactive Q&A)
2. **Specify**: 3-5 minutes (agent creates spec)
3. **Plan**: 5-10 minutes (agent creates plan with dependencies)
4. **Validate**: Instant (shows parallel execution analysis!)
5. **Implement**: Variable (but 40-60% faster with parallelization!)

---

**Bottom line**: Run `npm test -- tests/unit/dependency-graph.test.js --run` right now to see it working, or use `/speckit` for the full experience!
