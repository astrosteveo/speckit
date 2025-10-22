/**
 * CLI Argument Parser
 *
 * Parse command-line arguments into structured format
 */

/**
 * Convert kebab-case to camelCase
 */
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

export function parseArgs(argv) {
  const args = argv.slice(2); // Remove 'node' and script path

  const parsed = {
    command: null,
    args: [],
    flags: {
      help: false,
      version: false,
      quiet: false,
      json: false,
      skipValidation: false,
      format: null,
      output: null
    }
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      // Long flag
      const flag = arg.slice(2);
      const [key, value] = flag.split('=');
      const camelKey = toCamelCase(key);

      if (value !== undefined) {
        // --key=value
        parsed.flags[camelKey] = value;
      } else if (camelKey in parsed.flags) {
        // Boolean flag
        parsed.flags[camelKey] = true;
      } else {
        // Custom flag (use original key for custom flags)
        parsed.flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      // Short flag
      const flags = arg.slice(1);
      for (const flag of flags) {
        switch (flag) {
          case 'h':
            parsed.flags.help = true;
            break;
          case 'v':
            parsed.flags.version = true;
            break;
          case 'q':
            parsed.flags.quiet = true;
            break;
          default:
            parsed.flags[flag] = true;
        }
      }
    } else {
      // Positional argument
      if (!parsed.command) {
        parsed.command = arg;
      } else {
        parsed.args.push(arg);
      }
    }
  }

  return parsed;
}
