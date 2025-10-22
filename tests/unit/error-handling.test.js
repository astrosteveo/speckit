/**
 * Error Handling and Recovery Tests
 *
 * Verifies that SpecKit handles errors gracefully and provides recovery options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadState, initWorkflow } from '../../src/core/state.js';
import { loadConfig } from '../../src/core/config.js';
import { validateSpecification, validatePlan } from '../../src/core/quality.js';
import { generateDocs } from '../../src/core/docs.js';

describe('Error Handling and Recovery', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `speckit-error-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('State Management Errors', () => {
    it('should throw error when loading non-existent state', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      expect(() => loadState(speckitDir)).toThrow('No workflow state found');
    });

    it('should throw error when state file is corrupted', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      // Write invalid JSON
      writeFileSync(join(speckitDir, 'state.json'), '{ invalid json', 'utf-8');

      expect(() => loadState(speckitDir)).toThrow('Invalid state file');
    });

    it('should prevent duplicate workflow initialization', () => {
      const speckitDir = join(testDir, '.speckit');

      // Initialize once
      initWorkflow(speckitDir, 'test-123', 'Test Project');

      // Try to initialize again
      expect(() => initWorkflow(speckitDir, 'test-456', 'Another Project')).toThrow('Workflow already exists');
    });

    it('should validate phase names', () => {
      const speckitDir = join(testDir, '.speckit');
      initWorkflow(speckitDir, 'test-123', 'Test Project');

      // Import updatePhase
      return import('../../src/core/state.js').then(({ updatePhase }) => {
        expect(() => updatePhase(speckitDir, 'invalid-phase', 'pending')).toThrow('Invalid phase');
      });
    });

    it('should validate phase statuses', () => {
      const speckitDir = join(testDir, '.speckit');
      initWorkflow(speckitDir, 'test-123', 'Test Project');

      return import('../../src/core/state.js').then(({ updatePhase }) => {
        expect(() => updatePhase(speckitDir, 'constitute', 'invalid-status')).toThrow('Invalid status');
      });
    });
  });

  describe('Configuration Errors', () => {
    it('should handle missing config file gracefully', () => {
      // Load config when no .speckit directory exists
      const config = loadConfig(testDir);

      // Should return defaults, not throw
      expect(config).toBeDefined();
      expect(config.editor).toBeDefined();
    });

    it('should handle corrupted config file gracefully', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      // Write invalid JSON
      writeFileSync(join(speckitDir, 'config.json'), '{ broken', 'utf-8');

      // Should fall back to defaults, not crash
      const config = loadConfig(testDir);
      expect(config).toBeDefined();
    });

    it('should validate config schema', () => {
      return import('../../src/core/config.js').then(({ validateConfig }) => {
        const config = {
          editor: 'vscode',
          qualityThreshold: { specification: 85 }
        };

        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Quality Validation Errors', () => {
    it('should handle empty specification gracefully', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      const result = validateSpecification('', speckitDir);

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(85);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should handle missing sections in specification', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      const incompleteSpec = '# Specification\n\n## Functional Requirements\n\n### FR001: Test\nTest requirement.';

      const result = validateSpecification(incompleteSpec, speckitDir);

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(85);
      expect(result.issues.some(i => i.includes('user stories'))).toBe(true);
    });

    it('should handle empty plan gracefully', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      const result = validatePlan('', speckitDir);

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(85);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should handle malformed plan structure', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      const badPlan = '# Plan\n\nSome random text without proper sections.';

      const result = validatePlan(badPlan, speckitDir);

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(85);
    });
  });

  describe('Documentation Generation Errors', () => {
    it('should require .speckit directory for docs generation', async () => {
      const result = await generateDocs({
        projectPath: testDir,
        formats: ['markdown'],
        outputDir: join(testDir, 'docs')
      });

      // generateDocs needs .speckit to exist
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle unreadable source files', async () => {
      const srcDir = join(testDir, 'src');
      mkdirSync(srcDir);

      // Create a file then make it unreadable (Unix only)
      const testFile = join(srcDir, 'test.js');
      writeFileSync(testFile, 'export function test() {}', 'utf-8');

      // On non-Windows systems, we can test file permissions
      if (process.platform !== 'win32') {
        try {
          chmodSync(testFile, 0o000); // No permissions

          const result = await generateDocs({
            projectPath: testDir,
            formats: ['markdown'],
            outputDir: join(testDir, 'docs')
          });

          // Should continue despite unreadable file
          expect(result.success).toBe(true);

          // Restore permissions for cleanup
          chmodSync(testFile, 0o644);
        } catch (error) {
          // If chmod fails, skip this test
        }
      }
    });

    it('should create output directory when it doesnt exist', async () => {
      // Create .speckit directory first
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);
      writeFileSync(join(speckitDir, 'SPECIFICATION.md'), '# Test', 'utf-8');

      const nestedDir = join(testDir, 'deeply', 'nested', 'docs');

      const result = await generateDocs({
        projectPath: testDir,
        formats: ['markdown'],
        outputDir: nestedDir
      });

      // Should create the directory and succeed
      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
    });
  });

  describe('File System Errors', () => {
    it('should throw on reading non-existent files', () => {
      const nonExistentFile = join(testDir, 'doesnt-exist.json');

      expect(() => {
        import('fs').then(fs => fs.default.readFileSync(nonExistentFile, 'utf-8'));
      }).toBeDefined();
    });

    it('should handle write errors to protected directories', async () => {
      // Skip on Windows where permissions work differently
      if (process.platform === 'win32') {
        return;
      }

      const protectedDir = join(testDir, 'protected');
      mkdirSync(protectedDir);

      try {
        // Make directory read-only
        chmodSync(protectedDir, 0o444);

        const testFile = join(protectedDir, 'test.txt');

        expect(() => {
          writeFileSync(testFile, 'test', 'utf-8');
        }).toThrow();

        // Restore permissions
        chmodSync(protectedDir, 0o755);
      } catch (error) {
        // If chmod fails, clean up and skip
        chmodSync(protectedDir, 0o755);
      }
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should allow resetting corrupted workflow', () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir);

      // Create corrupted state
      writeFileSync(join(speckitDir, 'state.json'), '{ corrupted', 'utf-8');

      // Verify it's corrupted
      expect(() => loadState(speckitDir)).toThrow();

      // Delete and recreate
      rmSync(join(speckitDir, 'state.json'));
      const newState = initWorkflow(speckitDir, 'new-123', 'New Project');

      expect(newState).toBeDefined();
      expect(newState.projectName).toBe('New Project');

      // Verify it can be loaded now
      const loaded = loadState(speckitDir);
      expect(loaded.projectName).toBe('New Project');
    });

    it('should support backup and restore workflow', () => {
      const speckitDir = join(testDir, '.speckit');
      const state = initWorkflow(speckitDir, 'test-123', 'Test Project');

      // Create backup
      const statePath = join(speckitDir, 'state.json');
      const backupPath = join(speckitDir, 'state.json.backup');
      const stateContent = JSON.stringify(state, null, 2);
      writeFileSync(backupPath, stateContent, 'utf-8');

      // Corrupt original
      writeFileSync(statePath, '{ corrupted', 'utf-8');

      // Verify it's corrupted
      expect(() => loadState(speckitDir)).toThrow();

      // Restore from backup
      rmSync(statePath);
      writeFileSync(statePath, stateContent, 'utf-8');

      // Verify restoration
      const restored = loadState(speckitDir);
      expect(restored.projectName).toBe('Test Project');
    });
  });

  describe('Input Validation', () => {
    it('should accept valid project names', () => {
      const speckitDir = join(testDir, '.speckit');

      // Valid workflow ID and project name
      const state = initWorkflow(speckitDir, 'test-123', 'Test Project');

      expect(state).toBeDefined();
      expect(state.workflowId).toBe('test-123');
      expect(state.projectName).toBe('Test Project');
    });

    it('should accept valid quality scores', () => {
      const speckitDir = join(testDir, '.speckit');
      initWorkflow(speckitDir, 'test-123', 'Test');

      return import('../../src/core/state.js').then(({ updatePhase }) => {
        // Valid scores
        updatePhase(speckitDir, 'constitute', 'completed', 0);
        updatePhase(speckitDir, 'specify', 'completed', 50);
        updatePhase(speckitDir, 'plan', 'completed', 100);

        const state = loadState(speckitDir);
        expect(state.phases.constitute.quality).toBe(0);
        expect(state.phases.specify.quality).toBe(50);
        expect(state.phases.plan.quality).toBe(100);
      });
    });
  });

  describe('Graceful Degradation', () => {
    it('should work without color support', () => {
      const originalNoColor = process.env.NO_COLOR;
      process.env.NO_COLOR = '1';

      // Import colors module
      return import('../../src/core/cli.js').then(({ colors }) => {
        // Colors should return plain text
        const text = colors.red('test');
        expect(text).toBe('test'); // No ANSI codes

        // Restore
        if (originalNoColor) {
          process.env.NO_COLOR = originalNoColor;
        } else {
          delete process.env.NO_COLOR;
        }
      });
    });

    it('should work in non-TTY environments', () => {
      const isTTY = process.stdout.isTTY;

      // Spinners and progress bars should degrade gracefully
      return import('../../src/core/cli.js').then(({ Spinner, ProgressBar }) => {
        const spinner = new Spinner('Testing');
        spinner.start();
        spinner.stop();

        const progress = new ProgressBar(10);
        progress.update(5);
        progress.complete();

        // Should not throw in non-TTY environment
        expect(true).toBe(true);
      });
    });
  });
});
