/**
 * Terminal UI Library
 *
 * Colors, spinners, progress bars, prompts, and tables
 * Zero dependencies - uses ANSI escape codes and Node.js built-ins
 */

import { createInterface } from 'readline';
import { stdin, stdout } from 'process';

// ANSI escape codes
const ANSI = {
  // Colors
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',

  // Cursor control
  clearLine: '\x1b[2K',
  cursorUp: '\x1b[1A',
  cursorDown: '\x1b[1B',
  cursorStart: '\x1b[G'
};

/**
 * Color text
 */
export const colors = {
  reset: (text) => `${ANSI.reset}${text}${ANSI.reset}`,
  bright: (text) => `${ANSI.bright}${text}${ANSI.reset}`,
  dim: (text) => `${ANSI.dim}${text}${ANSI.reset}`,

  black: (text) => `${ANSI.black}${text}${ANSI.reset}`,
  red: (text) => `${ANSI.red}${text}${ANSI.reset}`,
  green: (text) => `${ANSI.green}${text}${ANSI.reset}`,
  yellow: (text) => `${ANSI.yellow}${text}${ANSI.reset}`,
  blue: (text) => `${ANSI.blue}${text}${ANSI.reset}`,
  magenta: (text) => `${ANSI.magenta}${text}${ANSI.reset}`,
  cyan: (text) => `${ANSI.cyan}${text}${ANSI.reset}`,
  white: (text) => `${ANSI.white}${text}${ANSI.reset}`,
  gray: (text) => `${ANSI.gray}${text}${ANSI.reset}`,

  success: (text) => `${ANSI.green}${text}${ANSI.reset}`,
  error: (text) => `${ANSI.red}${text}${ANSI.reset}`,
  warning: (text) => `${ANSI.yellow}${text}${ANSI.reset}`,
  info: (text) => `${ANSI.cyan}${text}${ANSI.reset}`
};

/**
 * Spinner for long-running operations
 */
export class Spinner {
  constructor(message = 'Loading...') {
    this.message = message;
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.frameIndex = 0;
    this.interval = null;
    this.isSpinning = false;
  }

  start() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.render();

    this.interval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.render();
    }, 80);
  }

  render() {
    stdout.write(`${ANSI.clearLine}${ANSI.cursorStart}${colors.cyan(this.frames[this.frameIndex])} ${this.message}`);
  }

  succeed(message) {
    this.stop();
    console.log(`${colors.green('✓')} ${message || this.message}`);
  }

  fail(message) {
    this.stop();
    console.log(`${colors.red('✗')} ${message || this.message}`);
  }

  warn(message) {
    this.stop();
    console.log(`${colors.yellow('⚠')} ${message || this.message}`);
  }

  info(message) {
    this.stop();
    console.log(`${colors.cyan('ℹ')} ${message || this.message}`);
  }

  stop() {
    if (!this.isSpinning) return;

    this.isSpinning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    stdout.write(`${ANSI.clearLine}${ANSI.cursorStart}`);
  }

  update(message) {
    this.message = message;
  }
}

/**
 * Progress bar
 */
export class ProgressBar {
  constructor(total, message = '') {
    this.total = total;
    this.current = 0;
    this.message = message;
    this.width = 40;
  }

  update(current, message) {
    this.current = current;
    if (message !== undefined) {
      this.message = message;
    }
    this.render();
  }

  increment(message) {
    this.update(this.current + 1, message);
  }

  render() {
    const percentage = Math.floor((this.current / this.total) * 100);
    const filled = Math.floor((this.current / this.total) * this.width);
    const empty = this.width - filled;

    const bar = `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
    const text = `[${bar}] ${percentage}%`;

    stdout.write(`${ANSI.clearLine}${ANSI.cursorStart}${colors.cyan(text)} ${this.message}`);
  }

  complete(message) {
    this.update(this.total, message);
    console.log(''); // New line
  }
}

/**
 * Interactive prompt
 */
export async function prompt(question, defaultValue = '') {
  const rl = createInterface({
    input: stdin,
    output: stdout
  });

  return new Promise((resolve) => {
    const query = defaultValue
      ? `${question} ${colors.dim(`(${defaultValue})`)}: `
      : `${question}: `;

    rl.question(query, (answer) => {
      rl.close();
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Confirm (yes/no) prompt
 */
export async function confirm(question, defaultValue = false) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} (${defaultText})`);

  if (!answer) return defaultValue;

  const normalized = answer.toLowerCase();
  return normalized === 'y' || normalized === 'yes';
}

/**
 * Select from options
 */
export async function select(question, options) {
  console.log(`\n${colors.bright(question)}\n`);

  options.forEach((option, index) => {
    console.log(`  ${colors.cyan(`${index + 1}.`)} ${option}`);
  });

  const answer = await prompt('\nSelect option (1-' + options.length + ')');
  const index = parseInt(answer) - 1;

  if (index >= 0 && index < options.length) {
    return options[index];
  }

  console.log(colors.error('Invalid selection'));
  return select(question, options);
}

/**
 * Display table
 */
export function table(data, options = {}) {
  if (!data || data.length === 0) {
    console.log(colors.dim('(no data)'));
    return;
  }

  const columns = options.columns || Object.keys(data[0]);
  const headers = options.headers || columns;

  // Calculate column widths
  const widths = columns.map((col, i) => {
    const headerWidth = headers[i].length;
    const dataWidth = Math.max(...data.map(row => String(row[col] || '').length));
    return Math.max(headerWidth, dataWidth);
  });

  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  console.log(colors.bright(headerRow));
  console.log(colors.dim('─'.repeat(headerRow.length)));

  // Print rows
  data.forEach(row => {
    const rowText = columns.map((col, i) =>
      String(row[col] || '').padEnd(widths[i])
    ).join('  ');
    console.log(rowText);
  });
}

/**
 * Box around text
 */
export function box(text, title = '') {
  const lines = text.split('\n');
  const maxWidth = Math.max(...lines.map(l => l.length), title.length);
  const width = maxWidth + 4;

  let output = '┌' + '─'.repeat(width - 2) + '┐\n';

  if (title) {
    const padding = Math.floor((width - title.length - 4) / 2);
    output += `│ ${' '.repeat(padding)}${colors.bright(title)}${' '.repeat(width - title.length - padding - 4)} │\n`;
    output += '├' + '─'.repeat(width - 2) + '┤\n';
  }

  lines.forEach(line => {
    output += `│ ${line.padEnd(maxWidth + 2)} │\n`;
  });

  output += '└' + '─'.repeat(width - 2) + '┘';

  console.log(output);
}

/**
 * Log levels with colors
 */
export const log = {
  success: (message) => console.log(`${colors.green('✓')} ${message}`),
  error: (message) => console.log(`${colors.red('✗')} ${message}`),
  warning: (message) => console.log(`${colors.yellow('⚠')} ${message}`),
  info: (message) => console.log(`${colors.cyan('ℹ')} ${message}`),
  debug: (message) => console.log(`${colors.gray('•')} ${message}`)
};
