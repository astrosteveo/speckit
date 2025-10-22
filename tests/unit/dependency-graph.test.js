/**
 * Dependency Graph Tests
 *
 * Tests for dependency parsing, topological sorting, and parallel execution planning
 */

import { describe, it, expect } from 'vitest';
import {
  parseDependencyGraph,
  topologicalSort,
  detectCircularDependencies,
  validateDependencies,
  calculateParallelizationScore,
  calculateTimeSavings,
  getNextWave,
  generateExecutionPlan
} from '../../src/core/dependency-graph.js';

describe('Dependency Graph', () => {
  describe('parseDependencyGraph', () => {
    it('should parse tasks with no dependencies', () => {
      const plan = `
### TASK-001: Database Schema
**Dependencies**: None
**Estimated Time**: 2 hours

Create database schema for users and products.

### TASK-002: API Routes
**Dependencies**: None
**Estimated Time**: 1.5 hours

Set up Express routes.
`;

      const graph = parseDependencyGraph(plan);

      expect(graph['TASK-001']).toBeDefined();
      expect(graph['TASK-001'].name).toBe('Database Schema');
      expect(graph['TASK-001'].dependencies).toEqual([]);
      expect(graph['TASK-001'].estimatedTime).toBe(120); // 2 hours in minutes

      expect(graph['TASK-002']).toBeDefined();
      expect(graph['TASK-002'].dependencies).toEqual([]);
      expect(graph['TASK-002'].estimatedTime).toBe(90); // 1.5 hours in minutes
    });

    it('should parse tasks with dependencies', () => {
      const plan = `
### TASK-001: Database Schema
**Dependencies**: None
**Estimated Time**: 2 hours

### TASK-002: User Model
**Dependencies**: TASK-001
**Estimated Time**: 1 hour

### TASK-003: Product Model
**Dependencies**: TASK-001
**Estimated Time**: 1 hour

### TASK-004: API Integration
**Dependencies**: TASK-002, TASK-003
**Estimated Time**: 2 hours
`;

      const graph = parseDependencyGraph(plan);

      expect(graph['TASK-001'].dependencies).toEqual([]);
      expect(graph['TASK-002'].dependencies).toEqual(['TASK-001']);
      expect(graph['TASK-003'].dependencies).toEqual(['TASK-001']);
      expect(graph['TASK-004'].dependencies).toEqual(['TASK-002', 'TASK-003']);
    });

    it('should handle T### format task IDs', () => {
      const plan = `
### T001 - Database Setup
**Dependencies**: None
**Estimated Time**: 30 minutes

### T002 - API Layer
**Dependencies**: T001
**Estimated Time**: 1 hour
`;

      const graph = parseDependencyGraph(plan);

      expect(graph['T001']).toBeDefined();
      expect(graph['T001'].name).toBe('Database Setup');
      expect(graph['T002'].dependencies).toEqual(['T001']);
    });

    it('should parse estimated time in various formats', () => {
      const plan = `
### TASK-001: Task A
**Estimated Time**: 2 hours

### TASK-002: Task B
**Estimated Time**: 30 minutes

### TASK-003: Task C
**Estimated Time**: 1.5 hours

### TASK-004: Task D
**Estimated Time**: 45 min
`;

      const graph = parseDependencyGraph(plan);

      expect(graph['TASK-001'].estimatedTime).toBe(120);
      expect(graph['TASK-002'].estimatedTime).toBe(30);
      expect(graph['TASK-003'].estimatedTime).toBe(90);
      expect(graph['TASK-004'].estimatedTime).toBe(45);
    });

    it('should handle dependencies with explanatory text', () => {
      const plan = `
### TASK-002: Authentication
**Dependencies**: TASK-001 (needs database schema)

Implement user authentication.
`;

      const graph = parseDependencyGraph(plan);

      expect(graph['TASK-002'].dependencies).toEqual(['TASK-001']);
    });
  });

  describe('topologicalSort', () => {
    it('should sort tasks with linear dependencies', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: ['TASK-001'] },
        'TASK-003': { dependencies: ['TASK-002'] }
      };

      const waves = topologicalSort(graph);

      expect(waves).toEqual([
        ['TASK-001'],
        ['TASK-002'],
        ['TASK-003']
      ]);
    });

    it('should identify parallel tasks', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: [] },
        'TASK-003': { dependencies: [] }
      };

      const waves = topologicalSort(graph);

      expect(waves.length).toBe(1);
      expect(waves[0]).toEqual(expect.arrayContaining(['TASK-001', 'TASK-002', 'TASK-003']));
    });

    it('should handle complex dependency graphs', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: [] },
        'TASK-003': { dependencies: ['TASK-001'] },
        'TASK-004': { dependencies: ['TASK-001'] },
        'TASK-005': { dependencies: ['TASK-003', 'TASK-004'] }
      };

      const waves = topologicalSort(graph);

      expect(waves.length).toBe(3);
      expect(waves[0]).toEqual(expect.arrayContaining(['TASK-001', 'TASK-002']));
      expect(waves[1]).toEqual(expect.arrayContaining(['TASK-003', 'TASK-004']));
      expect(waves[2]).toEqual(['TASK-005']);
    });

    it('should throw error for circular dependencies', () => {
      const graph = {
        'TASK-001': { dependencies: ['TASK-002'] },
        'TASK-002': { dependencies: ['TASK-001'] }
      };

      expect(() => topologicalSort(graph)).toThrow('Circular dependency');
    });
  });

  describe('detectCircularDependencies', () => {
    it('should detect simple circular dependency', () => {
      const graph = {
        'TASK-001': { dependencies: ['TASK-002'] },
        'TASK-002': { dependencies: ['TASK-001'] }
      };

      const cycle = detectCircularDependencies(graph);

      expect(cycle.length).toBeGreaterThan(0);
      expect(cycle).toContain('TASK-001');
      expect(cycle).toContain('TASK-002');
    });

    it('should detect complex circular dependency', () => {
      const graph = {
        'TASK-001': { dependencies: ['TASK-002'] },
        'TASK-002': { dependencies: ['TASK-003'] },
        'TASK-003': { dependencies: ['TASK-001'] }
      };

      const cycle = detectCircularDependencies(graph);

      expect(cycle.length).toBeGreaterThan(0);
    });

    it('should return empty array for acyclic graph', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: ['TASK-001'] },
        'TASK-003': { dependencies: ['TASK-002'] }
      };

      const cycle = detectCircularDependencies(graph);

      expect(cycle).toEqual([]);
    });

    it('should handle self-dependency', () => {
      const graph = {
        'TASK-001': { dependencies: ['TASK-001'] }
      };

      const cycle = detectCircularDependencies(graph);

      expect(cycle.length).toBeGreaterThan(0);
      expect(cycle).toContain('TASK-001');
    });
  });

  describe('validateDependencies', () => {
    it('should validate correct dependencies', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: ['TASK-001'] }
      };

      const result = validateDependencies(graph);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect non-existent dependencies', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: ['TASK-999'] }
      };

      const result = validateDependencies(graph);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('non-existent');
    });

    it('should detect circular dependencies', () => {
      const graph = {
        'TASK-001': { dependencies: ['TASK-002'] },
        'TASK-002': { dependencies: ['TASK-001'] }
      };

      const result = validateDependencies(graph);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Circular'))).toBe(true);
    });
  });

  describe('calculateParallelizationScore', () => {
    it('should give high score for fully parallel tasks', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: [] },
        'TASK-003': { dependencies: [] },
        'TASK-004': { dependencies: [] }
      };

      const score = calculateParallelizationScore(graph);

      expect(score).toBeGreaterThan(80);
    });

    it('should give low score for fully sequential tasks', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: ['TASK-001'] },
        'TASK-003': { dependencies: ['TASK-002'] },
        'TASK-004': { dependencies: ['TASK-003'] }
      };

      const score = calculateParallelizationScore(graph);

      expect(score).toBeLessThan(30);
    });

    it('should give medium score for mixed dependencies', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: [] },
        'TASK-003': { dependencies: ['TASK-001', 'TASK-002'] }
      };

      const score = calculateParallelizationScore(graph);

      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThan(80);
    });
  });

  describe('calculateTimeSavings', () => {
    it('should calculate time savings for parallel tasks', () => {
      const graph = {
        'TASK-001': { dependencies: [], estimatedTime: 60 },
        'TASK-002': { dependencies: [], estimatedTime: 90 },
        'TASK-003': { dependencies: [], estimatedTime: 30 }
      };

      const savings = calculateTimeSavings(graph);

      expect(savings.sequential).toBe(180); // 60 + 90 + 30
      expect(savings.parallel).toBe(90); // max(60, 90, 30)
      expect(savings.saved).toBe(90);
      expect(savings.percentage).toBe(50);
    });

    it('should handle sequential tasks', () => {
      const graph = {
        'TASK-001': { dependencies: [], estimatedTime: 60 },
        'TASK-002': { dependencies: ['TASK-001'], estimatedTime: 90 }
      };

      const savings = calculateTimeSavings(graph);

      expect(savings.sequential).toBe(150);
      expect(savings.parallel).toBe(150); // No parallelization
      expect(savings.saved).toBe(0);
    });

    it('should handle complex graphs', () => {
      const graph = {
        'TASK-001': { dependencies: [], estimatedTime: 120 },
        'TASK-002': { dependencies: [], estimatedTime: 60 },
        'TASK-003': { dependencies: ['TASK-001'], estimatedTime: 90 },
        'TASK-004': { dependencies: ['TASK-002'], estimatedTime: 30 }
      };

      const savings = calculateTimeSavings(graph);

      // Sequential: 120 + 60 + 90 + 30 = 300
      // Parallel: Wave 1 = max(120, 60) = 120, Wave 2 = max(90, 30) = 90, Total = 210
      expect(savings.sequential).toBe(300);
      expect(savings.parallel).toBe(210);
      expect(savings.saved).toBe(90);
      expect(savings.percentage).toBe(30);
    });
  });

  describe('getNextWave', () => {
    const graph = {
      'TASK-001': { dependencies: [] },
      'TASK-002': { dependencies: [] },
      'TASK-003': { dependencies: ['TASK-001'] },
      'TASK-004': { dependencies: ['TASK-001', 'TASK-002'] }
    };

    it('should get first wave when no tasks completed', () => {
      const wave = getNextWave(graph, []);

      expect(wave).toEqual(expect.arrayContaining(['TASK-001', 'TASK-002']));
      expect(wave.length).toBe(2);
    });

    it('should get next wave after some tasks complete', () => {
      const wave = getNextWave(graph, ['TASK-001']);

      expect(wave).toEqual(expect.arrayContaining(['TASK-002', 'TASK-003']));
      expect(wave.length).toBe(2);
    });

    it('should get final tasks when dependencies met', () => {
      const wave = getNextWave(graph, ['TASK-001', 'TASK-002', 'TASK-003']);

      expect(wave).toEqual(['TASK-004']);
    });

    it('should return empty array when all tasks complete', () => {
      const wave = getNextWave(graph, ['TASK-001', 'TASK-002', 'TASK-003', 'TASK-004']);

      expect(wave).toEqual([]);
    });
  });

  describe('generateExecutionPlan', () => {
    it('should generate readable execution plan', () => {
      const graph = {
        'TASK-001': { name: 'Setup Database', dependencies: [], estimatedTime: 120 },
        'TASK-002': { name: 'Setup Auth', dependencies: [], estimatedTime: 90 },
        'TASK-003': { name: 'Create API', dependencies: ['TASK-001', 'TASK-002'], estimatedTime: 60 }
      };

      const plan = generateExecutionPlan(graph);

      expect(plan).toContain('Total Tasks: 3');
      expect(plan).toContain('Execution Waves: 2');
      expect(plan).toContain('Setup Database');
      expect(plan).toContain('Setup Auth');
      expect(plan).toContain('Create API');
      expect(plan).toContain('Wave 1');
      expect(plan).toContain('Wave 2');
    });

    it('should include time estimates in plan', () => {
      const graph = {
        'TASK-001': { name: 'Task A', dependencies: [], estimatedTime: 120 },
        'TASK-002': { name: 'Task B', dependencies: [], estimatedTime: 60 }
      };

      const plan = generateExecutionPlan(graph);

      expect(plan).toContain('Sequential:');
      expect(plan).toContain('Parallel:');
      expect(plan).toContain('Time Saved:');
    });

    it('should handle tasks without time estimates', () => {
      const graph = {
        'TASK-001': { name: 'Task A', dependencies: [] },
        'TASK-002': { name: 'Task B', dependencies: ['TASK-001'] }
      };

      const plan = generateExecutionPlan(graph);

      expect(plan).toContain('Total Tasks: 2');
      expect(plan).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty graph', () => {
      const graph = {};

      const waves = topologicalSort(graph);
      expect(waves).toEqual([]);

      const score = calculateParallelizationScore(graph);
      expect(score).toBe(0);
    });

    it('should handle tasks with empty dependency arrays', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: [] }
      };

      const result = validateDependencies(graph);
      expect(result.valid).toBe(true);
    });

    it('should handle missing estimatedTime', () => {
      const graph = {
        'TASK-001': { dependencies: [] },
        'TASK-002': { dependencies: ['TASK-001'] }
      };

      const savings = calculateTimeSavings(graph);
      expect(savings.sequential).toBe(0);
      expect(savings.parallel).toBe(0);
    });
  });
});
