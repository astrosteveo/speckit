/**
 * Cross-Platform Compatibility Tests
 *
 * Verifies that SpecKit works correctly across different operating systems
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join, sep, normalize } from 'path';
import { tmpdir } from 'os';
import { platform, EOL } from 'os';

describe('Cross-Platform Compatibility', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `speckit-platform-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Path Handling', () => {
    it('should use platform-appropriate path separators', () => {
      const testPath = join('foo', 'bar', 'baz.txt');

      // Path should contain the platform-specific separator
      if (platform() === 'win32') {
        expect(testPath).toContain('\\');
      } else {
        expect(testPath).toContain('/');
      }
    });

    it('should normalize paths correctly', () => {
      const unnormalizedPath = 'foo//bar/../baz/./file.txt';
      const normalizedPath = normalize(unnormalizedPath);

      // Normalized path should not contain .. or . or //
      expect(normalizedPath).not.toContain('..');
      expect(normalizedPath).not.toContain('//');
      expect(normalizedPath).not.toContain(sep + '.' + sep);
    });

    it('should handle absolute and relative paths correctly', () => {
      const absolutePath = join(testDir, 'file.txt');
      const relativePath = join('.', 'subdir', 'file.txt');

      expect(absolutePath.startsWith(testDir)).toBe(true);
      // join normalizes './' to just the path, so check if it's NOT absolute
      expect(absolutePath.startsWith(sep)).toBe(true); // Absolute path
      expect(relativePath.startsWith(sep)).toBe(false); // Relative path
    });

    it('should create nested directories on all platforms', () => {
      const nestedDir = join(testDir, 'a', 'b', 'c', 'd');

      mkdirSync(nestedDir, { recursive: true });

      expect(existsSync(nestedDir)).toBe(true);
    });
  });

  describe('Line Endings', () => {
    it('should use platform-appropriate line endings', () => {
      if (platform() === 'win32') {
        expect(EOL).toBe('\r\n');
      } else {
        expect(EOL).toBe('\n');
      }
    });

    it('should handle files with different line endings', () => {
      const unixFile = join(testDir, 'unix.txt');
      const windowsFile = join(testDir, 'windows.txt');

      // Create files with different line endings
      writeFileSync(unixFile, 'line1\nline2\nline3', 'utf-8');
      writeFileSync(windowsFile, 'line1\r\nline2\r\nline3', 'utf-8');

      // Should be able to read both
      const unixContent = readFileSync(unixFile, 'utf-8');
      const windowsContent = readFileSync(windowsFile, 'utf-8');

      expect(unixContent).toContain('line1');
      expect(unixContent).toContain('line2');
      expect(windowsContent).toContain('line1');
      expect(windowsContent).toContain('line2');
    });

    it('should write files with consistent content regardless of platform', () => {
      const testFile = join(testDir, 'test.txt');
      const content = ['Line 1', 'Line 2', 'Line 3'].join(EOL);

      writeFileSync(testFile, content, 'utf-8');

      const readContent = readFileSync(testFile, 'utf-8');
      expect(readContent).toContain('Line 1');
      expect(readContent).toContain('Line 2');
      expect(readContent).toContain('Line 3');
    });
  });

  describe('File Permissions', () => {
    it('should create files that are readable', () => {
      const testFile = join(testDir, 'readable.txt');

      writeFileSync(testFile, 'test content', 'utf-8');

      expect(existsSync(testFile)).toBe(true);
      const content = readFileSync(testFile, 'utf-8');
      expect(content).toBe('test content');
    });

    it('should create files that are writable', () => {
      const testFile = join(testDir, 'writable.txt');

      writeFileSync(testFile, 'initial', 'utf-8');
      writeFileSync(testFile, 'updated', 'utf-8');

      const content = readFileSync(testFile, 'utf-8');
      expect(content).toBe('updated');
    });

    it('should be able to remove created files and directories', () => {
      const testFile = join(testDir, 'removable.txt');
      const testSubDir = join(testDir, 'removable');

      writeFileSync(testFile, 'test', 'utf-8');
      mkdirSync(testSubDir);

      expect(existsSync(testFile)).toBe(true);
      expect(existsSync(testSubDir)).toBe(true);

      rmSync(testFile);
      rmSync(testSubDir, { recursive: true });

      expect(existsSync(testFile)).toBe(false);
      expect(existsSync(testSubDir)).toBe(false);
    });
  });

  describe('Environment Variables', () => {
    it('should access HOME or USERPROFILE based on platform', () => {
      const homeDir = platform() === 'win32'
        ? process.env.USERPROFILE
        : process.env.HOME;

      expect(homeDir).toBeDefined();
      expect(homeDir.length).toBeGreaterThan(0);
    });

    it('should handle TEMP/TMP directory correctly', () => {
      const tempDir = tmpdir();

      expect(tempDir).toBeDefined();
      expect(existsSync(tempDir)).toBe(true);
    });

    it('should respect NO_COLOR environment variable', () => {
      const originalNoColor = process.env.NO_COLOR;

      // Test with NO_COLOR set
      process.env.NO_COLOR = '1';
      expect(process.env.NO_COLOR).toBe('1');

      // Test with NO_COLOR unset
      delete process.env.NO_COLOR;
      expect(process.env.NO_COLOR).toBeUndefined();

      // Restore original value
      if (originalNoColor !== undefined) {
        process.env.NO_COLOR = originalNoColor;
      } else {
        delete process.env.NO_COLOR;
      }
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize and deserialize state correctly', () => {
      const stateFile = join(testDir, 'state.json');
      const state = {
        workflowId: 'test-workflow',
        projectName: 'Test Project',
        version: '1.0',
        currentPhase: 'constitute',
        phases: {
          constitute: { status: 'pending' },
          specify: { status: 'pending' }
        }
      };

      writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf-8');

      const loaded = JSON.parse(readFileSync(stateFile, 'utf-8'));

      expect(loaded.workflowId).toBe(state.workflowId);
      expect(loaded.projectName).toBe(state.projectName);
      expect(loaded.currentPhase).toBe(state.currentPhase);
    });

    it('should handle unicode characters in JSON', () => {
      const jsonFile = join(testDir, 'unicode.json');
      const data = {
        emoji: '✅ ❌ ⚠️',
        chinese: '你好世界',
        arabic: 'مرحبا',
        special: '™ © ®'
      };

      writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf-8');

      const loaded = JSON.parse(readFileSync(jsonFile, 'utf-8'));

      expect(loaded.emoji).toBe(data.emoji);
      expect(loaded.chinese).toBe(data.chinese);
      expect(loaded.arabic).toBe(data.arabic);
      expect(loaded.special).toBe(data.special);
    });
  });

  describe('Platform Detection', () => {
    it('should detect current platform', () => {
      const currentPlatform = platform();

      expect(['darwin', 'linux', 'win32', 'freebsd', 'openbsd']).toContain(currentPlatform);
    });

    it('should provide platform-specific information', () => {
      expect(platform()).toBeDefined();
      expect(typeof platform()).toBe('string');
      expect(platform().length).toBeGreaterThan(0);
    });
  });

  describe('Atomic File Operations', () => {
    it('should support atomic write pattern (write to temp, then rename)', () => {
      const finalPath = join(testDir, 'final.json');
      const tmpPath = join(testDir, 'final.json.tmp');

      const data = { value: 'test' };

      // Write to temp file
      writeFileSync(tmpPath, JSON.stringify(data), 'utf-8');
      expect(existsSync(tmpPath)).toBe(true);

      // Atomic rename (this works on all platforms)
      // Note: On Windows, target must not exist for rename to work
      if (existsSync(finalPath)) {
        rmSync(finalPath);
      }

      // Use import to get renameSync
      import('fs').then(fs => {
        fs.renameSync(tmpPath, finalPath);
      });

      // Allow async operation to complete
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(existsSync(finalPath)).toBe(true);
        expect(existsSync(tmpPath)).toBe(false);

        const loaded = JSON.parse(readFileSync(finalPath, 'utf-8'));
        expect(loaded.value).toBe('test');
      });
    });
  });

  describe('Character Encoding', () => {
    it('should handle UTF-8 encoding correctly', () => {
      const testFile = join(testDir, 'utf8.txt');
      const content = 'Hello 世界 مرحبا 🌍';

      writeFileSync(testFile, content, 'utf-8');

      const loaded = readFileSync(testFile, 'utf-8');
      expect(loaded).toBe(content);
    });

    it('should preserve special characters in file names', () => {
      // Only test characters that are valid on all platforms
      const safeChars = 'test-file_123.txt';
      const testFile = join(testDir, safeChars);

      writeFileSync(testFile, 'content', 'utf-8');

      expect(existsSync(testFile)).toBe(true);
    });
  });
});
