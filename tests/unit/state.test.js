import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import * as State from '../../src/core/state.js';

const TEST_DIR = join(process.cwd(), '.test-speckit');
const STATE_FILE = join(TEST_DIR, 'state.json');

describe('State Management', () => {
  beforeEach(() => {
    // Create test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('initWorkflow', () => {
    it('should create initial state with all required fields', () => {
      const workflowId = '2025-10-20-test-project';
      const projectName = 'Test Project';

      const state = State.initWorkflow(TEST_DIR, workflowId, projectName);

      expect(state).toMatchObject({
        workflowId,
        projectName,
        version: '1.0',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        currentPhase: 'constitute',
        phases: {
          constitute: { status: 'pending', quality: null, startedAt: null, completedAt: null },
          specify: { status: 'pending', quality: null, startedAt: null, completedAt: null },
          plan: { status: 'pending', quality: null, startedAt: null, completedAt: null },
          implement: { status: 'pending', quality: null, startedAt: null, completedAt: null }
        }
      });
    });

    it('should write state to file system', () => {
      const workflowId = '2025-10-20-test-project';
      const projectName = 'Test Project';

      State.initWorkflow(TEST_DIR, workflowId, projectName);

      expect(existsSync(STATE_FILE)).toBe(true);

      const fileContent = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
      expect(fileContent.workflowId).toBe(workflowId);
      expect(fileContent.projectName).toBe(projectName);
    });

    it('should throw error if workflow already exists', () => {
      const workflowId = '2025-10-20-test-project';
      const projectName = 'Test Project';

      State.initWorkflow(TEST_DIR, workflowId, projectName);

      expect(() => {
        State.initWorkflow(TEST_DIR, workflowId, projectName);
      }).toThrow('Workflow already exists');
    });

    it('should create state directory if it does not exist', () => {
      rmSync(TEST_DIR, { recursive: true });

      const workflowId = '2025-10-20-test-project';
      const projectName = 'Test Project';

      State.initWorkflow(TEST_DIR, workflowId, projectName);

      expect(existsSync(TEST_DIR)).toBe(true);
      expect(existsSync(STATE_FILE)).toBe(true);
    });
  });

  describe('loadState', () => {
    it('should load existing state from file', () => {
      const workflowId = '2025-10-20-test-project';
      const projectName = 'Test Project';

      const original = State.initWorkflow(TEST_DIR, workflowId, projectName);
      const loaded = State.loadState(TEST_DIR);

      expect(loaded).toEqual(original);
    });

    it('should throw error if state file does not exist', () => {
      expect(() => {
        State.loadState(TEST_DIR);
      }).toThrow('No workflow state found');
    });

    it('should throw error if state file is invalid JSON', () => {
      writeFileSync(STATE_FILE, 'invalid json');

      expect(() => {
        State.loadState(TEST_DIR);
      }).toThrow('Invalid state file');
    });
  });

  describe('updatePhase', () => {
    it('should update phase status', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      const updated = State.updatePhase(TEST_DIR, 'constitute', 'in_progress');

      expect(updated.phases.constitute.status).toBe('in_progress');
      expect(updated.phases.constitute.startedAt).toBeTruthy();
    });

    it('should update quality score when provided', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      const updated = State.updatePhase(TEST_DIR, 'constitute', 'completed', 88);

      expect(updated.phases.constitute.status).toBe('completed');
      expect(updated.phases.constitute.quality).toBe(88);
      expect(updated.phases.constitute.completedAt).toBeTruthy();
    });

    it('should move to next phase when current phase is completed', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      const updated = State.updatePhase(TEST_DIR, 'constitute', 'completed', 90);

      expect(updated.currentPhase).toBe('specify');
    });

    it('should throw error for invalid phase name', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      expect(() => {
        State.updatePhase(TEST_DIR, 'invalid', 'in_progress');
      }).toThrow('Invalid phase');
    });

    it('should throw error for invalid status', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      expect(() => {
        State.updatePhase(TEST_DIR, 'constitute', 'invalid');
      }).toThrow('Invalid status');
    });
  });

  describe('getCurrentPhase', () => {
    it('should return current phase name', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      const phase = State.getCurrentPhase(TEST_DIR);

      expect(phase).toBe('constitute');
    });

    it('should return correct phase after update', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');
      State.updatePhase(TEST_DIR, 'constitute', 'completed', 90);

      const phase = State.getCurrentPhase(TEST_DIR);

      expect(phase).toBe('specify');
    });
  });

  describe('getProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      // 0% - nothing completed
      expect(State.getProgress(TEST_DIR)).toBe(0);

      // 25% - 1 of 4 phases completed
      State.updatePhase(TEST_DIR, 'constitute', 'completed', 90);
      expect(State.getProgress(TEST_DIR)).toBe(25);

      // 50% - 2 of 4 phases completed
      State.updatePhase(TEST_DIR, 'specify', 'completed', 88);
      expect(State.getProgress(TEST_DIR)).toBe(50);

      // 75% - 3 of 4 phases completed
      State.updatePhase(TEST_DIR, 'plan', 'completed', 85);
      expect(State.getProgress(TEST_DIR)).toBe(75);

      // 100% - all phases completed
      State.updatePhase(TEST_DIR, 'implement', 'completed', 92);
      expect(State.getProgress(TEST_DIR)).toBe(100);
    });
  });

  describe('isComplete', () => {
    it('should return false when workflow is not complete', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      expect(State.isComplete(TEST_DIR)).toBe(false);
    });

    it('should return true when all phases are completed', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      State.updatePhase(TEST_DIR, 'constitute', 'completed', 90);
      State.updatePhase(TEST_DIR, 'specify', 'completed', 88);
      State.updatePhase(TEST_DIR, 'plan', 'completed', 85);
      State.updatePhase(TEST_DIR, 'implement', 'completed', 92);

      expect(State.isComplete(TEST_DIR)).toBe(true);
    });
  });

  describe('resetWorkflow', () => {
    it('should reset workflow to initial state', () => {
      const workflowId = '2025-10-20-test-project';
      State.initWorkflow(TEST_DIR, workflowId, 'Test Project');

      // Make some progress
      State.updatePhase(TEST_DIR, 'constitute', 'completed', 90);
      State.updatePhase(TEST_DIR, 'specify', 'in_progress');

      // Reset
      const reset = State.resetWorkflow(TEST_DIR);

      expect(reset.currentPhase).toBe('constitute');
      expect(reset.phases.constitute.status).toBe('pending');
      expect(reset.phases.specify.status).toBe('pending');
    });
  });
});
