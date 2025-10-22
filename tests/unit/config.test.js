/**
 * Tests for Configuration Management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig, get, set, validateConfig, list, reset, unset } from '../../src/core/config.js';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Configuration Management', () => {
  let testDir;

  beforeEach(() => {
    // Create temp test directory
    testDir = join(tmpdir(), `speckit-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, '.speckit'), { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }

    // Clean up environment variables
    delete process.env.SPECKIT_EDITOR;
    delete process.env.SPECKIT_QUIET;
    delete process.env.SPECKIT_SKIP_VALIDATION;
    delete process.env.SPECKIT_OUTPUT_FORMAT;
  });

  describe('loadConfig', () => {
    it('should load default configuration', () => {
      const config = loadConfig(testDir);

      expect(config).toBeDefined();
      expect(config.editor).toBeDefined();
      expect(config.qualityThreshold).toBeDefined();
      expect(config.qualityThreshold.specification).toBe(85);
    });

    it('should merge project config with defaults', () => {
      const projectConfig = {
        editor: 'vim',
        customField: 'custom value'
      };

      writeFileSync(
        join(testDir, '.speckit', 'config.json'),
        JSON.stringify(projectConfig, null, 2)
      );

      const config = loadConfig(testDir);

      expect(config.editor).toBe('vim');
      expect(config.customField).toBe('custom value');
      expect(config.qualityThreshold.specification).toBe(85); // default
    });

    it('should override with environment variables', () => {
      process.env.SPECKIT_EDITOR = 'nano';
      process.env.SPECKIT_QUIET = 'true';

      const config = loadConfig(testDir);

      expect(config.editor).toBe('nano');
      expect(config.quiet).toBe(true);
    });

    it('should respect precedence: env > project > defaults', () => {
      // Set project config
      writeFileSync(
        join(testDir, '.speckit', 'config.json'),
        JSON.stringify({ editor: 'vim' }, null, 2)
      );

      // Set env var (should override project)
      process.env.SPECKIT_EDITOR = 'emacs';

      const config = loadConfig(testDir);

      expect(config.editor).toBe('emacs'); // env wins
    });
  });

  describe('get', () => {
    it('should get top-level config value', () => {
      const editor = get('editor', testDir);
      expect(editor).toBeDefined();
    });

    it('should get nested config value with dot notation', () => {
      const threshold = get('qualityThreshold.specification', testDir);
      expect(threshold).toBe(85);
    });

    it('should return undefined for non-existent key', () => {
      const value = get('nonexistent.key', testDir);
      expect(value).toBeUndefined();
    });

    it('should handle deep nesting', () => {
      writeFileSync(
        join(testDir, '.speckit', 'config.json'),
        JSON.stringify({
          level1: {
            level2: {
              level3: 'deep value'
            }
          }
        }, null, 2)
      );

      const value = get('level1.level2.level3', testDir);
      expect(value).toBe('deep value');
    });
  });

  describe('validateConfig', () => {
    it('should validate editor as string', () => {
      const result = validateConfig('editor', 'code');
      expect(result.valid).toBe(true);
    });

    it('should reject empty editor', () => {
      const result = validateConfig('editor', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-empty string');
    });

    it('should validate quality threshold in range', () => {
      const result = validateConfig('qualityThreshold.specification', 85);
      expect(result.valid).toBe(true);
    });

    it('should reject quality threshold out of range', () => {
      const result1 = validateConfig('qualityThreshold.specification', 150);
      expect(result1.valid).toBe(false);

      const result2 = validateConfig('qualityThreshold.specification', -10);
      expect(result2.valid).toBe(false);
    });

    it('should validate boolean flags', () => {
      const result = validateConfig('quiet', true);
      expect(result.valid).toBe(true);
    });

    it('should reject non-boolean for boolean fields', () => {
      const result = validateConfig('quiet', 'yes');
      expect(result.valid).toBe(false);
    });

    it('should validate outputFormat choices', () => {
      const result1 = validateConfig('outputFormat', 'markdown');
      expect(result1.valid).toBe(true);

      const result2 = validateConfig('outputFormat', 'html');
      expect(result2.valid).toBe(true);

      const result3 = validateConfig('outputFormat', 'pdf');
      expect(result3.valid).toBe(true);
    });

    it('should reject invalid outputFormat', () => {
      const result = validateConfig('outputFormat', 'docx');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('markdown, html, pdf');
    });

    it('should allow unknown keys without validation', () => {
      const result = validateConfig('customField', 'any value');
      expect(result.valid).toBe(true);
    });
  });

  describe('set', () => {
    it('should set config value to project config', () => {
      set('editor', 'vim', { projectDir: testDir });

      const config = loadConfig(testDir);
      expect(config.editor).toBe('vim');
    });

    it('should set nested config value', () => {
      set('qualityThreshold.specification', 90, { projectDir: testDir });

      const value = get('qualityThreshold.specification', testDir);
      expect(value).toBe(90);
    });

    it('should validate before setting', () => {
      expect(() => {
        set('qualityThreshold.specification', 150, { projectDir: testDir });
      }).toThrow();
    });

    it('should create nested objects for new keys', () => {
      set('new.nested.key', 'value', { projectDir: testDir });

      const value = get('new.nested.key', testDir);
      expect(value).toBe('value');
    });

    it('should persist to config file', () => {
      set('editor', 'emacs', { projectDir: testDir });

      const configPath = join(testDir, '.speckit', 'config.json');
      expect(existsSync(configPath)).toBe(true);

      // Load again to verify persistence
      const config = loadConfig(testDir);
      expect(config.editor).toBe('emacs');
    });

    it('should create config directory if not exists', () => {
      const newDir = join(tmpdir(), `speckit-new-${Date.now()}`);

      try {
        set('editor', 'code', { projectDir: newDir });

        const configPath = join(newDir, '.speckit', 'config.json');
        expect(existsSync(configPath)).toBe(true);
      } finally {
        if (existsSync(newDir)) {
          rmSync(newDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('unset', () => {
    it('should remove config value', () => {
      set('customKey', 'value', { projectDir: testDir });

      const result = unset('customKey', { projectDir: testDir });
      expect(result).toBe(true);

      const value = get('customKey', testDir);
      expect(value).toBeUndefined();
    });

    it('should return false if key does not exist', () => {
      const result = unset('nonexistent', { projectDir: testDir });
      expect(result).toBe(false);
    });

    it('should handle nested keys', () => {
      set('level1.level2.key', 'value', { projectDir: testDir });

      const result = unset('level1.level2.key', { projectDir: testDir });
      expect(result).toBe(true);
    });
  });

  describe('list', () => {
    it('should list all config values', () => {
      const configList = list(testDir);

      expect(Array.isArray(configList)).toBe(true);
      expect(configList.length).toBeGreaterThan(0);
    });

    it('should include source for each value', () => {
      const configList = list(testDir);

      configList.forEach(item => {
        expect(item).toHaveProperty('key');
        expect(item).toHaveProperty('value');
        expect(item).toHaveProperty('source');
        expect(['default', 'global', 'project', 'env']).toContain(item.source);
      });
    });

    it('should show project source for project config', () => {
      set('editor', 'sublime', { projectDir: testDir });

      const configList = list(testDir);
      const editorItem = configList.find(item => item.key === 'editor');

      expect(editorItem).toBeDefined();
      expect(editorItem.value).toBe('sublime');
      expect(editorItem.source).toBe('project');
    });

    it('should show env source for environment variables', () => {
      process.env.SPECKIT_EDITOR = 'atom';

      const configList = list(testDir);
      const editorItem = configList.find(item => item.key === 'editor');

      expect(editorItem).toBeDefined();
      expect(editorItem.value).toBe('atom');
      expect(editorItem.source).toBe('env');
    });
  });

  describe('reset', () => {
    it('should reset project config', () => {
      set('editor', 'custom', { projectDir: testDir });

      reset({ projectDir: testDir });

      // After reset, should use defaults
      const config = loadConfig(testDir);
      expect(config.editor).toBe(process.env.EDITOR || 'code'); // default
    });

    it('should clear config file but not delete it', () => {
      set('editor', 'custom', { projectDir: testDir });

      const configPath = join(testDir, '.speckit', 'config.json');
      expect(existsSync(configPath)).toBe(true);

      reset({ projectDir: testDir });

      expect(existsSync(configPath)).toBe(true);
    });
  });
});
