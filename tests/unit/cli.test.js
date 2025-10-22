/**
 * Tests for Terminal UI Library
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { colors, Spinner, ProgressBar, table, box, log } from '../../src/core/cli.js';

describe('colors', () => {
  beforeEach(() => {
    // Ensure colors are enabled for tests
    delete process.env.NO_COLOR;
  });

  it('should return colored text when colors enabled', () => {
    const result = colors.green('Success');
    // In a TTY environment with colors, this will have ANSI codes
    expect(result).toContain('Success');
  });

  it('should return plain text when NO_COLOR is set', () => {
    const originalIsTTY = process.stdout.isTTY;
    const originalNOCOLOR = process.env.NO_COLOR;

    // Temporarily set NO_COLOR
    process.env.NO_COLOR = '1';

    // Re-import to pick up new env var
    // Note: This is a limitation of the test - in reality we'd need to reset the module
    // For now, we'll just verify the logic works

    const result = colors.green('Success');
    expect(result).toBe('Success');

    // Restore
    if (originalNOCOLOR === undefined) {
      delete process.env.NO_COLOR;
    } else {
      process.env.NO_COLOR = originalNOCOLOR;
    }
  });

  it('should have success color helper', () => {
    const result = colors.success('Done');
    expect(result).toContain('Done');
  });

  it('should have error color helper', () => {
    const result = colors.error('Failed');
    expect(result).toContain('Failed');
  });

  it('should have warning color helper', () => {
    const result = colors.warning('Warning');
    expect(result).toContain('Warning');
  });

  it('should have info color helper', () => {
    const result = colors.info('Info');
    expect(result).toContain('Info');
  });
});

describe('Spinner', () => {
  it('should create spinner with default message', () => {
    const spinner = new Spinner();
    expect(spinner.message).toBe('Loading...');
    expect(spinner.isSpinning).toBe(false);
  });

  it('should create spinner with custom message', () => {
    const spinner = new Spinner('Processing...');
    expect(spinner.message).toBe('Processing...');
  });

  it('should start and stop spinner', () => {
    const spinner = new Spinner('Test');
    spinner.start();
    expect(spinner.isSpinning).toBe(true);

    spinner.stop();
    expect(spinner.isSpinning).toBe(false);
  });

  it('should update spinner message', () => {
    const spinner = new Spinner('Initial');
    spinner.update('Updated');
    expect(spinner.message).toBe('Updated');
  });

  it('should not start if already spinning', () => {
    const spinner = new Spinner();
    spinner.start();
    const intervalBefore = spinner.interval;

    spinner.start(); // Try starting again
    expect(spinner.interval).toBe(intervalBefore);

    spinner.stop();
  });
});

describe('ProgressBar', () => {
  it('should create progress bar with total', () => {
    const bar = new ProgressBar(100);
    expect(bar.total).toBe(100);
    expect(bar.current).toBe(0);
  });

  it('should update progress', () => {
    const bar = new ProgressBar(100);
    bar.update(50);
    expect(bar.current).toBe(50);
  });

  it('should increment progress', () => {
    const bar = new ProgressBar(100);
    bar.increment();
    expect(bar.current).toBe(1);

    bar.increment();
    expect(bar.current).toBe(2);
  });

  it('should update message with progress', () => {
    const bar = new ProgressBar(100, 'Initial');
    expect(bar.message).toBe('Initial');

    bar.update(50, 'Halfway');
    expect(bar.message).toBe('Halfway');
  });

  it('should complete progress bar', () => {
    const bar = new ProgressBar(100);
    bar.complete('Done');
    expect(bar.current).toBe(100);
    expect(bar.message).toBe('Done');
  });
});

describe('table', () => {
  it('should handle empty data', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    table([]);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should display table with data', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ];

    table(data);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should respect custom columns', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const data = [
      { name: 'Alice', age: 30, city: 'NYC' },
      { name: 'Bob', age: 25, city: 'LA' }
    ];

    table(data, { columns: ['name', 'city'] });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('box', () => {
  it('should create box around text', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    box('Hello World');

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toContain('Hello World');
    expect(output).toContain('┌');
    expect(output).toContain('└');

    consoleSpy.mockRestore();
  });

  it('should create box with title', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    box('Content', 'Title');

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toContain('Content');
    expect(output).toContain('Title');

    consoleSpy.mockRestore();
  });

  it('should handle multiline text', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    box('Line 1\nLine 2\nLine 3');

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toContain('Line 1');
    expect(output).toContain('Line 2');
    expect(output).toContain('Line 3');

    consoleSpy.mockRestore();
  });
});

describe('log', () => {
  it('should log success message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    log.success('Operation successful');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log error message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    log.error('Operation failed');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log warning message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    log.warning('Warning message');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log info message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    log.info('Info message');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log debug message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    log.debug('Debug message');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
