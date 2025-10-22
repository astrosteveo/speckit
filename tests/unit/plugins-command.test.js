/**
 * Tests for Plugins Command
 *
 * Tests the CLI command interface for plugin management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock the select function from cli
vi.mock('../../src/core/cli.js', async () => {
  const actual = await vi.importActual('../../src/core/cli.js');
  return {
    ...actual,
    select: vi.fn()
  };
});

import { pluginsCommand } from '../../src/commands/plugins.js';
import { select } from '../../src/core/cli.js';

describe('Plugins Command', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    // Save original cwd
    originalCwd = process.cwd();

    // Create temp test directory
    testDir = join(tmpdir(), `speckit-plugins-cmd-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(() => {
    // Restore original cwd
    process.chdir(originalCwd);

    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('list subcommand', () => {
    it('should handle missing .claude directory', async () => {
      const result = await pluginsCommand([], {});

      expect(result.success).toBe(false);
    });

    it('should list plugins when .claude directory exists', async () => {
      const claudeDir = join(testDir, '.claude');
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      // Create a test plugin
      writeFileSync(join(agentsDir, 'test-agent.js'), `
export default {
  name: 'test-agent',
  version: '1.0.0',
  type: 'agent',
  description: 'Test agent',
  execute: () => {}
};
`);

      const result = await pluginsCommand(['list'], {});

      expect(result.success).toBe(true);
      expect(result.plugins).toHaveLength(1);
      expect(result.plugins[0].name).toBe('test-agent');
    });

    it('should handle empty .claude directory', async () => {
      const claudeDir = join(testDir, '.claude');
      mkdirSync(claudeDir, { recursive: true });

      const result = await pluginsCommand(['list'], {});

      expect(result.success).toBe(true);
      expect(result.plugins).toHaveLength(0);
    });

    it('should default to list when no subcommand provided', async () => {
      const claudeDir = join(testDir, '.claude');
      mkdirSync(claudeDir, { recursive: true });

      const result = await pluginsCommand([], {});

      // Should default to list
      expect(result).toBeDefined();
      expect(result.plugins).toBeDefined();
    });

    it('should show multiple plugins from different directories', async () => {
      const claudeDir = join(testDir, '.claude');
      const agentsDir = join(claudeDir, 'agents');
      const validatorsDir = join(claudeDir, 'validators');

      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(validatorsDir, { recursive: true });

      writeFileSync(join(agentsDir, 'agent.js'), `
export default {
  name: 'agent',
  version: '1.0.0',
  type: 'agent',
  execute: () => {}
};
`);

      writeFileSync(join(validatorsDir, 'validator.js'), `
export default {
  name: 'validator',
  version: '1.0.0',
  type: 'validator',
  validate: () => {}
};
`);

      const result = await pluginsCommand(['list'], {});

      expect(result.success).toBe(true);
      expect(result.plugins).toHaveLength(2);
    });

    it('should load markdown agent definitions', async () => {
      const claudeDir = join(testDir, '.claude');
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(join(agentsDir, 'analyst.md'), `
# Requirements Analyst

This agent analyzes requirements.
`);

      const result = await pluginsCommand(['list'], {});

      expect(result.success).toBe(true);
      expect(result.plugins).toHaveLength(1);
      expect(result.plugins[0].name).toBe('analyst');
      expect(result.plugins[0].format).toBe('markdown');
    });
  });

  describe('create subcommand', () => {
    it('should require plugin name', async () => {
      const result = await pluginsCommand(['create'], {});

      expect(result.success).toBe(false);
    });

    it('should create agent plugin with markdown format', async () => {
      // Mock select to return 'agent' type
      vi.mocked(select).mockResolvedValueOnce('agent - AI agent for workflow phases');

      const result = await pluginsCommand(['create', 'my-agent'], {});

      expect(result.success).toBe(true);
      expect(existsSync(join(testDir, '.claude', 'agents', 'my-agent.md'))).toBe(true);
    });

    it('should create validator plugin with javascript format', async () => {
      vi.mocked(select).mockResolvedValueOnce('validator - Custom quality validator');

      const result = await pluginsCommand(['create', 'my-validator'], {});

      expect(result.success).toBe(true);
      expect(existsSync(join(testDir, '.claude', 'validators', 'my-validator.js'))).toBe(true);
    });

    it('should create template plugin', async () => {
      vi.mocked(select).mockResolvedValueOnce('template - Document template');

      const result = await pluginsCommand(['create', 'my-template'], {});

      expect(result.success).toBe(true);
      expect(existsSync(join(testDir, '.claude', 'templates', 'my-template.js'))).toBe(true);
    });

    it('should fail if plugin already exists', async () => {
      const claudeDir = join(testDir, '.claude');
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      // Create existing plugin
      writeFileSync(join(agentsDir, 'existing.md'), '# Existing Agent');

      vi.mocked(select).mockResolvedValueOnce('agent - AI agent for workflow phases');

      const result = await pluginsCommand(['create', 'existing'], {});

      expect(result.success).toBe(false);
    });
  });

  describe('unknown subcommand', () => {
    it('should fail for unknown subcommand', async () => {
      const result = await pluginsCommand(['invalid'], {});

      expect(result.success).toBe(false);
    });
  });
});
