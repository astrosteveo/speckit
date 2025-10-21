/**
 * CLI Command Router
 *
 * Route parsed commands to appropriate handlers
 */

// Command registry
const commands = new Map();

/**
 * Register a command handler
 */
export function registerCommand(name, handler, options = {}) {
  commands.set(name, {
    handler,
    description: options.description || '',
    usage: options.usage || '',
    aliases: options.aliases || []
  });

  // Register aliases
  if (options.aliases) {
    for (const alias of options.aliases) {
      commands.set(alias, { handler, isAlias: true, aliasOf: name });
    }
  }
}

/**
 * Route command to handler
 */
export async function routeCommand(parsed) {
  const { command, args, flags } = parsed;

  // No command - show help
  if (!command) {
    return { success: false, error: 'NO_COMMAND' };
  }

  // Find command
  const cmd = commands.get(command);
  if (!cmd) {
    return { success: false, error: 'UNKNOWN_COMMAND', command };
  }

  // Execute handler
  try {
    const result = await cmd.handler(args, flags);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: 'HANDLER_ERROR', details: error };
  }
}

/**
 * Get all registered commands
 */
export function getCommands() {
  const commandList = [];

  for (const [name, cmd] of commands.entries()) {
    if (!cmd.isAlias) {
      commandList.push({
        name,
        description: cmd.description,
        usage: cmd.usage,
        aliases: cmd.aliases
      });
    }
  }

  return commandList;
}

/**
 * Check if command exists
 */
export function hasCommand(name) {
  return commands.has(name);
}
