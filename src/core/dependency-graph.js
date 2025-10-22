/**
 * Dependency Graph Parser and Execution Planner
 *
 * Parses task dependencies from PLAN.md and creates an execution plan
 * that maximizes parallelization while respecting dependencies.
 */

/**
 * Parse dependency graph from PLAN.md content
 * @param {string} planContent - The full PLAN.md content
 * @returns {Object} Graph object with tasks and dependencies
 */
export function parseDependencyGraph(planContent) {
  const tasks = {};
  const lines = planContent.split('\n');

  let currentTask = null;
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match task headers: ### TASK-001: Task Name or ### T001 - Task Name
    const taskMatch = line.match(/^###\s+(TASK-\d+|T\d+)[\s:-]+(.+)/);
    if (taskMatch) {
      currentTask = taskMatch[1];
      tasks[currentTask] = {
        id: currentTask,
        name: taskMatch[2].trim(),
        dependencies: [],
        estimatedTime: null,
        description: ''
      };
      currentSection = null;
      continue;
    }

    if (!currentTask) continue;

    // Match **Dependencies**: or Dependencies:
    if (line.match(/^\*\*Dependencies\*\*:/i) || line.match(/^Dependencies:/i)) {
      currentSection = 'dependencies';

      // Extract dependencies from same line if present
      const depMatch = line.match(/dependencies\*\*?:\s*(.+)/i);
      if (depMatch) {
        const depText = depMatch[1].trim();
        if (depText.toLowerCase() === 'none') {
          tasks[currentTask].dependencies = [];
        } else {
          // Parse dependencies: "TASK-001, TASK-003" or "T001 (needs database)"
          const deps = depText.split(',').map(d => {
            const match = d.trim().match(/(TASK-\d+|T\d+)/);
            return match ? match[1] : null;
          }).filter(Boolean);
          tasks[currentTask].dependencies = deps;
        }
      }
      continue;
    }

    // Match **Estimated Time**: or Estimated Time:
    if (line.match(/^\*\*Estimated Time\*\*:/i) || line.match(/^Estimated Time:/i)) {
      currentSection = 'time';
      const timeMatch = line.match(/time\*\*?:\s*(.+)/i);
      if (timeMatch) {
        tasks[currentTask].estimatedTime = parseEstimatedTime(timeMatch[1].trim());
      }
      continue;
    }

    // Accumulate description
    if (currentSection === null && line && !line.startsWith('#')) {
      tasks[currentTask].description += line + '\n';
    }
  }

  return tasks;
}

/**
 * Parse estimated time string to minutes
 * @param {string} timeStr - e.g., "2 hours", "30 minutes", "1.5 hours"
 * @returns {number} Time in minutes
 */
function parseEstimatedTime(timeStr) {
  const hourMatch = timeStr.match(/([\d.]+)\s*h(ou)?r/i);
  if (hourMatch) {
    return parseFloat(hourMatch[1]) * 60;
  }

  const minMatch = timeStr.match(/([\d.]+)\s*m(in)?/i);
  if (minMatch) {
    return parseFloat(minMatch[1]);
  }

  return null; // Unknown format
}

/**
 * Perform topological sort to create execution waves
 * @param {Object} graph - Task graph from parseDependencyGraph
 * @returns {Array<Array<string>>} Array of waves, each containing task IDs
 */
export function topologicalSort(graph) {
  const tasks = Object.keys(graph);
  const completed = new Set();
  const waves = [];

  while (completed.size < tasks.length) {
    // Find all tasks with satisfied dependencies
    const ready = tasks.filter(taskId => {
      if (completed.has(taskId)) return false;

      const deps = graph[taskId].dependencies || [];
      return deps.every(dep => completed.has(dep));
    });

    if (ready.length === 0) {
      // No tasks ready - either circular dependency or all done
      if (completed.size < tasks.length) {
        throw new Error('Circular dependency detected or invalid task references');
      }
      break;
    }

    // Add this wave
    waves.push(ready);

    // Mark as completed
    ready.forEach(taskId => completed.add(taskId));
  }

  return waves;
}

/**
 * Detect circular dependencies in the graph
 * @param {Object} graph - Task graph from parseDependencyGraph
 * @returns {Array<string>} Array of task IDs involved in circular dependency, or empty if none
 */
export function detectCircularDependencies(graph) {
  const visited = new Set();
  const recursionStack = new Set();
  const cycle = [];

  function dfs(taskId, path = []) {
    if (recursionStack.has(taskId)) {
      // Found a cycle
      const cycleStart = path.indexOf(taskId);
      return path.slice(cycleStart).concat(taskId);
    }

    if (visited.has(taskId)) {
      return null;
    }

    visited.add(taskId);
    recursionStack.add(taskId);
    path.push(taskId);

    const deps = graph[taskId]?.dependencies || [];
    for (const dep of deps) {
      if (!graph[dep]) {
        // Invalid reference, but not a cycle
        continue;
      }

      const result = dfs(dep, [...path]);
      if (result) {
        return result;
      }
    }

    recursionStack.delete(taskId);
    return null;
  }

  for (const taskId of Object.keys(graph)) {
    const result = dfs(taskId);
    if (result) {
      return result;
    }
  }

  return [];
}

/**
 * Validate all task dependencies exist
 * @param {Object} graph - Task graph from parseDependencyGraph
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export function validateDependencies(graph) {
  const errors = [];
  const taskIds = Object.keys(graph);

  for (const taskId of taskIds) {
    const deps = graph[taskId].dependencies || [];

    for (const dep of deps) {
      if (!graph[dep]) {
        errors.push(`Task ${taskId} depends on non-existent task ${dep}`);
      }
    }
  }

  // Check for circular dependencies
  const cycle = detectCircularDependencies(graph);
  if (cycle.length > 0) {
    errors.push(`Circular dependency detected: ${cycle.join(' → ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate parallelization score (0-100)
 * Higher score = better parallelization opportunities
 * @param {Object} graph - Task graph from parseDependencyGraph
 * @returns {number} Score from 0-100
 */
export function calculateParallelizationScore(graph) {
  const tasks = Object.keys(graph);
  if (tasks.length === 0) return 0;

  const waves = topologicalSort(graph);

  // Ideal: All tasks can run in parallel (1 wave)
  // Worst: All tasks sequential (N waves)
  const idealWaves = 1;
  const worstWaves = tasks.length;
  const actualWaves = waves.length;

  // Score based on how close to ideal
  const waveScore = ((worstWaves - actualWaves) / (worstWaves - idealWaves)) * 50;

  // Bonus for having multiple tasks per wave
  const avgTasksPerWave = tasks.length / waves.length;
  const parallelismBonus = Math.min(avgTasksPerWave * 10, 50);

  return Math.round(waveScore + parallelismBonus);
}

/**
 * Calculate estimated time savings from parallelization
 * @param {Object} graph - Task graph with estimatedTime for each task
 * @returns {Object} { sequential: number, parallel: number, saved: number }
 */
export function calculateTimeSavings(graph) {
  const tasks = Object.values(graph);

  // Sequential time: sum of all tasks
  const sequential = tasks.reduce((sum, task) => {
    return sum + (task.estimatedTime || 0);
  }, 0);

  // Parallel time: sum of longest task in each wave
  const waves = topologicalSort(graph);
  const parallel = waves.reduce((sum, wave) => {
    const longestTask = Math.max(...wave.map(taskId =>
      graph[taskId].estimatedTime || 0
    ));
    return sum + longestTask;
  }, 0);

  return {
    sequential,
    parallel,
    saved: sequential - parallel,
    percentage: sequential > 0 ? ((sequential - parallel) / sequential * 100) : 0
  };
}

/**
 * Get next wave of tasks to execute
 * @param {Object} graph - Task graph from parseDependencyGraph
 * @param {Array<string>} completedTasks - Array of completed task IDs
 * @returns {Array<string>} Task IDs ready to execute
 */
export function getNextWave(graph, completedTasks = []) {
  const completed = new Set(completedTasks);
  const tasks = Object.keys(graph);

  return tasks.filter(taskId => {
    if (completed.has(taskId)) return false;

    const deps = graph[taskId].dependencies || [];
    return deps.every(dep => completed.has(dep));
  });
}

/**
 * Generate execution plan summary
 * @param {Object} graph - Task graph from parseDependencyGraph
 * @returns {string} Human-readable execution plan
 */
export function generateExecutionPlan(graph) {
  const waves = topologicalSort(graph);
  const timeSavings = calculateTimeSavings(graph);

  let plan = '═══════════════════════════════════════════\n';
  plan += '📋 Parallel Execution Plan\n';
  plan += '═══════════════════════════════════════════\n\n';

  plan += `Total Tasks: ${Object.keys(graph).length}\n`;
  plan += `Execution Waves: ${waves.length}\n\n`;

  if (timeSavings.sequential > 0) {
    plan += `⏱️  Time Estimates:\n`;
    plan += `  Sequential: ${formatTime(timeSavings.sequential)}\n`;
    plan += `  Parallel: ${formatTime(timeSavings.parallel)}\n`;
    plan += `  Time Saved: ${formatTime(timeSavings.saved)} (${timeSavings.percentage.toFixed(1)}%)\n\n`;
  }

  plan += `Execution Waves:\n\n`;

  waves.forEach((wave, i) => {
    plan += `Wave ${i + 1} (${wave.length} task${wave.length > 1 ? 's' : ''} in parallel):\n`;
    wave.forEach(taskId => {
      const task = graph[taskId];
      const time = task.estimatedTime ? ` [${formatTime(task.estimatedTime)}]` : '';
      plan += `  • ${taskId}: ${task.name}${time}\n`;
    });
    plan += '\n';
  });

  return plan;
}

/**
 * Format time in minutes to human-readable string
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time (e.g., "2h 30m")
 */
function formatTime(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}
