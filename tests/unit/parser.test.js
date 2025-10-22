/**
 * Tests for CLI Argument Parser
 */

import { describe, it, expect } from 'vitest';
import { parseArgs } from '../../src/cli/parser.js';

describe('parseArgs', () => {
  it('should parse command without arguments', () => {
    const result = parseArgs(['node', 'script.js', 'init']);

    expect(result.command).toBe('init');
    expect(result.args).toEqual([]);
  });

  it('should parse command with positional arguments', () => {
    const result = parseArgs(['node', 'script.js', 'init', 'my-project']);

    expect(result.command).toBe('init');
    expect(result.args).toEqual(['my-project']);
  });

  it('should parse short flags', () => {
    const result = parseArgs(['node', 'script.js', 'status', '-h']);

    expect(result.flags.help).toBe(true);
  });

  it('should parse multiple short flags combined', () => {
    const result = parseArgs(['node', 'script.js', 'status', '-qv']);

    expect(result.flags.quiet).toBe(true);
    expect(result.flags.version).toBe(true);
  });

  it('should parse long flags', () => {
    const result = parseArgs(['node', 'script.js', 'docs', '--help']);

    expect(result.flags.help).toBe(true);
  });

  it('should parse long flags with values', () => {
    const result = parseArgs(['node', 'script.js', 'docs', '--format=html', '--output=dist']);

    expect(result.flags.format).toBe('html');
    expect(result.flags.output).toBe('dist');
  });

  it('should parse mixed command, args, and flags', () => {
    const result = parseArgs(['node', 'script.js', 'init', 'my-project', '--quiet', '-v']);

    expect(result.command).toBe('init');
    expect(result.args).toEqual(['my-project']);
    expect(result.flags.quiet).toBe(true);
    expect(result.flags.version).toBe(true);
  });

  it('should handle --version flag', () => {
    const result = parseArgs(['node', 'script.js', '--version']);

    expect(result.flags.version).toBe(true);
  });

  it('should handle --help flag', () => {
    const result = parseArgs(['node', 'script.js', '--help']);

    expect(result.flags.help).toBe(true);
  });

  it('should handle --json flag', () => {
    const result = parseArgs(['node', 'script.js', 'status', '--json']);

    expect(result.flags.json).toBe(true);
  });

  it('should handle --skip-validation flag', () => {
    const result = parseArgs(['node', 'script.js', 'specify', '--skip-validation']);

    expect(result.flags.skipValidation).toBe(true);
  });

  it('should handle no command', () => {
    const result = parseArgs(['node', 'script.js']);

    expect(result.command).toBe(null);
    expect(result.args).toEqual([]);
  });

  it('should handle custom flags', () => {
    const result = parseArgs(['node', 'script.js', 'test', '--custom-flag']);

    expect(result.flags['custom-flag']).toBe(true);
  });
});
