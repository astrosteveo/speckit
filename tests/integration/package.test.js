/**
 * Package Setup Tests
 *
 * Verify that the package is correctly configured for npm distribution
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

describe('Package Setup', () => {
  it('should have valid package.json', () => {
    const pkgPath = join(process.cwd(), 'package.json');
    expect(existsSync(pkgPath)).toBe(true);

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    // Required fields
    expect(pkg.name).toBe('@astrosteveo/speckit');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.description).toBeDefined();
    expect(pkg.license).toBe('MIT');

    // Entry points
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin.speckit).toBeDefined();
    expect(pkg.main).toBeDefined();

    // Node version
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toBe('>=18.0.0');

    // Type
    expect(pkg.type).toBe('module');
  });

  it('should have bin/speckit.js entry point', () => {
    const binPath = join(process.cwd(), 'bin/speckit.js');
    expect(existsSync(binPath)).toBe(true);

    const content = readFileSync(binPath, 'utf-8');

    // Should have shebang
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('should export main module', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const mainPath = join(process.cwd(), pkg.main);

    expect(existsSync(mainPath)).toBe(true);
  });

  it('should have zero runtime dependencies', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

    // Runtime dependencies should not exist or be empty
    expect(pkg.dependencies || {}).toEqual({});
  });

  it('should include necessary files in npm package', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

    expect(pkg.files).toBeDefined();
    expect(pkg.files).toContain('bin/');
    expect(pkg.files).toContain('src/');
    expect(pkg.files).toContain('.claude/');
    expect(pkg.files).toContain('README.md');
    expect(pkg.files).toContain('LICENSE');
  });

  it('should have proper exports defined', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

    expect(pkg.exports).toBeDefined();
    expect(pkg.exports['.']).toBeDefined();
    expect(pkg.exports['./package.json']).toBe('./package.json');
  });
});

describe('CLI Executable', () => {
  it('should be executable', () => {
    const binPath = join(process.cwd(), 'bin/speckit.js');

    // Check file exists
    expect(existsSync(binPath)).toBe(true);

    // On Unix systems, check if it has execute permissions
    if (process.platform !== 'win32') {
      const stats = readFileSync(binPath, 'utf-8');
      expect(stats).toBeTruthy();
    }
  });

  it('should run without errors when called with --version', () => {
    const binPath = join(process.cwd(), 'bin/speckit.js');

    expect(() => {
      const output = execSync(`node ${binPath} --version`, { encoding: 'utf-8' });
      expect(output).toMatch(/\d+\.\d+\.\d+/);
    }).not.toThrow();
  });

  it('should run without errors when called with --help', () => {
    const binPath = join(process.cwd(), 'bin/speckit.js');

    expect(() => {
      const output = execSync(`node ${binPath} --help`, { encoding: 'utf-8' });
      expect(output).toContain('speckit');
    }).not.toThrow();
  });
});
