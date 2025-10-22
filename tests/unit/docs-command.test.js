/**
 * Tests for Docs Command
 *
 * Tests the CLI command interface for documentation generation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { docsCommand } from '../../src/commands/docs.js';

describe('Docs Command', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    // Save original cwd
    originalCwd = process.cwd();

    // Create temp test directory
    testDir = join(tmpdir(), `speckit-docs-cmd-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Create .speckit directory
    const speckitDir = join(testDir, '.speckit');
    mkdirSync(speckitDir, { recursive: true });

    // Create sample SPECIFICATION.md
    writeFileSync(join(speckitDir, 'SPECIFICATION.md'), `# Test Specification

## Functional Requirements

### FR001: User Login
Users can log in with email and password.

### FR002: User Registration
Users can create a new account.
`);

    // Create sample source files with JSDoc
    const srcDir = join(testDir, 'src');
    mkdirSync(srcDir, { recursive: true });

    writeFileSync(join(srcDir, 'auth.js'), `/**
 * Authentication Module
 *
 * Handles user authentication and authorization
 */

/**
 * Login user with credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object with token
 */
export async function login(email, password) {
  // Implementation
}

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User display name
 * @returns {Promise<object>} Created user object
 */
export async function register(email, password, name) {
  // Implementation
}
`);

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

  describe('markdown generation', () => {
    it('should generate markdown documentation by default', async () => {
      const result = await docsCommand([], {});

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should include specification content in docs', async () => {
      const result = await docsCommand([], {});

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
    });

    it('should generate both markdown and HTML by default', async () => {
      const result = await docsCommand([], {});

      expect(result.success).toBe(true);
      expect(result.files.some(f => f.includes('markdown'))).toBe(true);
      expect(result.files.some(f => f.includes('html'))).toBe(true);
    });
  });

  describe('html generation', () => {
    it('should generate HTML documentation when --format=html', async () => {
      const result = await docsCommand([], { format: 'html' });

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(result.files.some(f => f.endsWith('.html'))).toBe(true);
    });

    it('should only generate HTML when --format=html specified', async () => {
      const result = await docsCommand([], { format: 'html' });

      expect(result.success).toBe(true);
      expect(result.files.every(f => f.includes('html'))).toBe(true);
      expect(result.files.some(f => f.includes('markdown'))).toBe(false);
    });
  });

  describe('output directory', () => {
    it('should use custom output directory when --output provided', async () => {
      const customDir = join(testDir, 'custom-docs');

      const result = await docsCommand([], { output: customDir });

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(result.files.some(f => f.includes('custom-docs'))).toBe(true);
    });

    it('should create output directory if it does not exist', async () => {
      const customDir = join(testDir, 'nested', 'docs', 'output');

      const result = await docsCommand([], { output: customDir });

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(result.files.some(f => f.includes('nested'))).toBe(true);
    });
  });

  describe('incremental mode', () => {
    it('should preserve existing files when --incremental flag set', async () => {
      const docsDir = join(testDir, '.speckit', 'docs', 'markdown');
      mkdirSync(docsDir, { recursive: true });

      // Create existing file
      writeFileSync(join(docsDir, 'custom.md'), '# Custom Doc');

      const result = await docsCommand([], { incremental: true });

      expect(result.success).toBe(true);
      expect(existsSync(join(docsDir, 'custom.md'))).toBe(true);
      expect(existsSync(join(docsDir, 'documentation.md'))).toBe(true);
    });

    it('should regenerate documentation files in incremental mode', async () => {
      // First generation
      await docsCommand([], { incremental: true });

      // Modify spec
      const specPath = join(testDir, '.speckit', 'SPECIFICATION.md');
      writeFileSync(specPath, `# Updated Specification

### FR001: User Login (Enhanced)
Users can log in with email and password, with 2FA support.
`);

      // Second generation
      const result = await docsCommand([], { incremental: true });

      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should fail when no .speckit directory exists', async () => {
      // Remove .speckit directory
      rmSync(join(testDir, '.speckit'), { recursive: true, force: true });

      const result = await docsCommand([], {});

      expect(result.success).toBe(false);
    });

    it('should handle missing SPECIFICATION.md gracefully', async () => {
      // Remove spec file
      rmSync(join(testDir, '.speckit', 'SPECIFICATION.md'));

      const result = await docsCommand([], {});

      // Should still succeed (can generate from source only)
      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
    });

    it('should handle empty source directory gracefully', async () => {
      // Remove source files
      rmSync(join(testDir, 'src'), { recursive: true, force: true });

      const result = await docsCommand([], {});

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
    });

    it('should reject invalid format option', async () => {
      const result = await docsCommand([], { format: 'invalid' });

      expect(result.success).toBe(false);
    });
  });

  describe('file listing', () => {
    it('should return list of generated files', async () => {
      const result = await docsCommand([], {});

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should include both spec and API docs in file list', async () => {
      const result = await docsCommand([], {});

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
    });
  });

  describe('markdown only', () => {
    it('should generate only markdown when --format=markdown', async () => {
      const result = await docsCommand([], { format: 'markdown' });

      expect(result.success).toBe(true);
      expect(result.files.every(f => f.includes('markdown'))).toBe(true);
      expect(result.files.some(f => f.includes('html'))).toBe(false);
    });
  });

  describe('return value', () => {
    it('should return structured data with success and files', async () => {
      const result = await docsCommand([], {});

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
    });
  });
});
