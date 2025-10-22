/**
 * Tests for Plugin System
 *
 * Following TDD: RED → GREEN → REFACTOR
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import {
  loadPlugins,
  getPlugins,
  getPlugin,
  validatePlugin
} from '../../src/core/plugins.js';

describe('Plugin System', () => {
  const testDir = join(process.cwd(), 'tests/fixtures/plugins-test');
  const claudeDir = join(testDir, '.claude');

  beforeEach(() => {
    // Create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(claudeDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('validatePlugin', () => {
    it('should validate valid plugin with all required fields', () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        type: 'agent',
        description: 'Test plugin',
        execute: () => {}
      };

      const result = validatePlugin(plugin);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject plugin without name', () => {
      const plugin = {
        version: '1.0.0',
        type: 'agent'
      };

      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plugin must have a name');
    });

    it('should reject plugin without version', () => {
      const plugin = {
        name: 'test',
        type: 'agent'
      };

      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plugin must have a version');
    });

    it('should reject plugin without type', () => {
      const plugin = {
        name: 'test',
        version: '1.0.0'
      };

      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plugin must have a type');
    });

    it('should reject plugin with invalid type', () => {
      const plugin = {
        name: 'test',
        version: '1.0.0',
        type: 'invalid'
      };

      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plugin type must be one of: agent, validator, template');
    });
  });

  describe('loadPlugins', () => {
    it('should load JavaScript plugins from agents directory', async () => {
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      // Create a valid plugin
      writeFileSync(join(agentsDir, 'test-agent.js'), `
export default {
  name: 'test-agent',
  version: '1.0.0',
  type: 'agent',
  description: 'Test agent plugin',
  execute: () => {}
};
`);

      const result = await loadPlugins(claudeDir);

      expect(result.loaded).toHaveLength(1);
      expect(result.loaded[0].name).toBe('test-agent');
      expect(result.failed).toHaveLength(0);
    });

    it('should load plugins from multiple directories', async () => {
      const agentsDir = join(claudeDir, 'agents');
      const validatorsDir = join(claudeDir, 'validators');
      const templatesDir = join(claudeDir, 'templates');

      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(validatorsDir, { recursive: true });
      mkdirSync(templatesDir, { recursive: true });

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

      const result = await loadPlugins(claudeDir);

      expect(result.loaded).toHaveLength(2);
      expect(result.loaded.map(p => p.name)).toContain('agent');
      expect(result.loaded.map(p => p.name)).toContain('validator');
    });

    it('should handle invalid plugins gracefully', async () => {
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      // Create invalid plugin (missing required fields)
      writeFileSync(join(agentsDir, 'invalid.js'), `
export default {
  name: 'invalid'
  // missing version and type
};
`);

      const result = await loadPlugins(claudeDir);

      expect(result.loaded).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toMatchObject({
        file: expect.stringContaining('invalid.js'),
        errors: expect.any(Array)
      });
    });

    it('should handle plugin load errors', async () => {
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      // Create plugin with syntax error
      writeFileSync(join(agentsDir, 'broken.js'), `
export default {
  this is not valid javascript
};
`);

      const result = await loadPlugins(claudeDir);

      expect(result.loaded).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
    });

    it('should load markdown agent definitions', async () => {
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(join(agentsDir, 'analyst.md'), `
# Requirements Analyst

This is an agent definition in markdown format.
`);

      const result = await loadPlugins(claudeDir);

      expect(result.loaded).toHaveLength(1);
      expect(result.loaded[0]).toMatchObject({
        name: 'analyst',
        type: 'agent',
        format: 'markdown'
      });
    });

    it('should complete in under 2 seconds for 20 plugins', async () => {
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      // Create 20 plugins
      for (let i = 0; i < 20; i++) {
        writeFileSync(join(agentsDir, `plugin-${i}.js`), `
export default {
  name: 'plugin-${i}',
  version: '1.0.0',
  type: 'agent',
  execute: () => {}
};
`);
      }

      const start = Date.now();
      await loadPlugins(claudeDir);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });

    it('should handle nonexistent directory gracefully', async () => {
      const result = await loadPlugins(join(testDir, 'nonexistent'));

      expect(result.loaded).toEqual([]);
      expect(result.failed).toEqual([]);
    });
  });

  describe('getPlugins', () => {
    it('should return all loaded plugins', async () => {
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(join(agentsDir, 'test.js'), `
export default {
  name: 'test',
  version: '1.0.0',
  type: 'agent',
  execute: () => {}
};
`);

      await loadPlugins(claudeDir);
      const plugins = getPlugins();

      expect(plugins).toHaveLength(1);
      expect(plugins[0].name).toBe('test');
    });

    it('should filter by type', async () => {
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

      await loadPlugins(claudeDir);
      const agents = getPlugins({ type: 'agent' });
      const validators = getPlugins({ type: 'validator' });

      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('agent');
      expect(validators).toHaveLength(1);
      expect(validators[0].name).toBe('validator');
    });
  });

  describe('getPlugin', () => {
    it('should return specific plugin by name', async () => {
      const agentsDir = join(claudeDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(join(agentsDir, 'test.js'), `
export default {
  name: 'test',
  version: '1.0.0',
  type: 'agent',
  execute: () => {}
};
`);

      await loadPlugins(claudeDir);
      const plugin = getPlugin('test');

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('test');
    });

    it('should return null for nonexistent plugin', async () => {
      await loadPlugins(claudeDir);
      const plugin = getPlugin('nonexistent');

      expect(plugin).toBeNull();
    });
  });
});
