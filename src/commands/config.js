/**
 * Config Command
 *
 * Get or set configuration values
 */

import { colors, log, table, confirm } from '../core/cli.js';
import { get, set, unset, list, reset } from '../core/config.js';

export async function configCommand(args, flags) {
  const action = args[0]; // get, set, unset, list
  const key = args[1];
  const value = args[2];

  // List all config
  if (!action || action === 'list') {
    const configList = list();

    console.log('');
    console.log(colors.bright('⚙️  Configuration'));
    console.log('');

    // configList is an array of {key, value, source} objects
    const rows = configList.map(item => ({
      key: item.key,
      value: Array.isArray(item.value) ? `[${item.value.join(', ')}]` : String(item.value),
      source: item.source
    }));

    table(rows, {
      columns: ['key', 'value', 'source'],
      headers: ['Key', 'Value', 'Source']
    });

    console.log('');
    console.log(colors.dim('Use `speckit config get <key>` to get a specific value'));
    console.log(colors.dim('Use `speckit config set <key> <value>` to set a value'));
    console.log(colors.dim('Use `speckit config reset` to restore defaults'));
    console.log('');

    return { success: true, config: configList };
  }

  // Get config value
  if (action === 'get') {
    if (!key) {
      log.error('Key is required');
      log.info('Usage: speckit config get <key>');
      return { success: false };
    }

    const val = get(key);

    if (val === undefined) {
      log.error(`Config key '${key}' not found`);
      return { success: false };
    }

    if (flags.json) {
      console.log(JSON.stringify({ [key]: val }, null, 2));
    } else {
      console.log(val);
    }

    return { success: true, value: val };
  }

  // Set config value
  if (action === 'set') {
    if (!key || value === undefined) {
      log.error('Key and value are required');
      log.info('Usage: speckit config set <key> <value>');
      return { success: false };
    }

    // Parse value (try JSON first, then use as string)
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      // Use as string
    }

    set(key, parsedValue, { global: flags.global });

    const scope = flags.global ? 'global' : 'project';
    log.success(`Set ${key} = ${value} (${scope})`);

    return { success: true };
  }

  // Unset config value
  if (action === 'unset') {
    if (!key) {
      log.error('Key is required');
      log.info('Usage: speckit config unset <key>');
      return { success: false };
    }

    const removed = unset(key, { global: flags.global });

    if (removed) {
      const scope = flags.global ? 'global' : 'project';
      log.success(`Removed ${key} (${scope})`);
    } else {
      log.error(`Config key '${key}' not found`);
    }

    return { success: removed };
  }

  // Reset config to defaults
  if (action === 'reset') {
    const scope = flags.global ? 'global' : 'project';

    const confirmed = await confirm(
      `Reset ${scope} configuration to defaults?`,
      false
    );

    if (!confirmed) {
      log.info('Reset cancelled');
      return { success: false };
    }

    reset({ global: flags.global });
    log.success(`${scope.charAt(0).toUpperCase() + scope.slice(1)} configuration reset to defaults`);

    return { success: true };
  }

  // Unknown action
  log.error(`Unknown action: ${action}`);
  log.info('Valid actions: get, set, unset, list, reset');

  return { success: false };
}
