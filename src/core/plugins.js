/**
 * Plugin System
 *
 * Discovers, loads, and manages plugins from .claude/agents/, validators/, templates/
 * Supports both JavaScript modules and Markdown agent definitions
 *
 * Zero dependencies - uses only Node.js built-ins
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { pathToFileURL } from 'url';

// Plugin registry (Map of plugin name -> plugin object)
const pluginRegistry = new Map();

// Plugin loading results
let lastLoadResult = {
  loaded: [],
  failed: []
};

/**
 * Validate plugin exports
 * @param {Object} plugin - Plugin object to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validatePlugin(plugin) {
  const errors = [];

  // Check required fields
  if (!plugin.name) {
    errors.push('Plugin must have a name');
  }

  if (!plugin.version) {
    errors.push('Plugin must have a version');
  }

  if (!plugin.type) {
    errors.push('Plugin must have a type');
  } else if (!['agent', 'validator', 'template'].includes(plugin.type)) {
    errors.push('Plugin type must be one of: agent, validator, template');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Load a JavaScript plugin module
 * @param {string} filePath - Path to plugin file
 * @returns {Promise<Object>} Plugin object or null
 */
async function loadJSPlugin(filePath) {
  try {
    // Convert file path to file URL for import()
    const fileUrl = pathToFileURL(filePath).href;

    // Dynamically import the module
    const module = await import(fileUrl);

    // Get default export
    const plugin = module.default;

    if (!plugin) {
      return {
        error: 'Plugin must have a default export',
        file: filePath
      };
    }

    // Add source path
    plugin.sourcePath = filePath;
    plugin.format = 'javascript';

    // Validate plugin
    const validation = validatePlugin(plugin);

    if (!validation.valid) {
      return {
        error: validation.errors.join(', '),
        errors: validation.errors,
        file: filePath
      };
    }

    return { plugin };
  } catch (error) {
    return {
      error: error.message,
      file: filePath
    };
  }
}

/**
 * Load a Markdown agent definition
 * @param {string} filePath - Path to markdown file
 * @returns {Object} Plugin object
 */
function loadMarkdownPlugin(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const name = basename(filePath, '.md');

    // Extract title from markdown (first # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : name;

    const plugin = {
      name,
      version: '1.0.0', // Markdown plugins default to 1.0.0
      type: 'agent',
      format: 'markdown',
      title,
      content,
      sourcePath: filePath
    };

    return { plugin };
  } catch (error) {
    return {
      error: error.message,
      file: filePath
    };
  }
}

/**
 * Scan directory for plugin files
 * @param {string} dir - Directory to scan
 * @param {string} type - Plugin type (agent, validator, template)
 * @returns {Array} Array of file paths
 */
function scanDirectory(dir, type) {
  const files = [];

  if (!existsSync(dir)) {
    return files;
  }

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const filePath = join(dir, entry);
      const stat = statSync(filePath);

      if (stat.isFile()) {
        const ext = extname(entry);
        // Support .js for all types, .md only for agents
        if (ext === '.js' || (ext === '.md' && type === 'agent')) {
          files.push(filePath);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read - return empty array
  }

  return files;
}

/**
 * Load plugins from .claude directory
 * @param {string} claudeDir - Path to .claude directory
 * @returns {Promise<Object>} Load result with loaded and failed arrays
 */
export async function loadPlugins(claudeDir) {
  const loaded = [];
  const failed = [];

  // Clear registry
  pluginRegistry.clear();

  // If directory doesn't exist, return empty result
  if (!existsSync(claudeDir)) {
    lastLoadResult = { loaded: [], failed: [] };
    return lastLoadResult;
  }

  // Scan plugin directories
  const pluginDirs = [
    { dir: join(claudeDir, 'agents'), type: 'agent' },
    { dir: join(claudeDir, 'validators'), type: 'validator' },
    { dir: join(claudeDir, 'templates'), type: 'template' }
  ];

  // Collect all plugin files
  const pluginFiles = [];
  for (const { dir, type } of pluginDirs) {
    const files = scanDirectory(dir, type);
    pluginFiles.push(...files);
  }

  // Load each plugin
  for (const filePath of pluginFiles) {
    const ext = extname(filePath);
    let result;

    if (ext === '.js') {
      result = await loadJSPlugin(filePath);
    } else if (ext === '.md') {
      result = loadMarkdownPlugin(filePath);
    }

    if (result.plugin) {
      // Successfully loaded
      loaded.push(result.plugin);
      pluginRegistry.set(result.plugin.name, result.plugin);
    } else {
      // Failed to load
      failed.push({
        file: filePath,
        error: result.error,
        errors: result.errors || [result.error]
      });
    }
  }

  lastLoadResult = { loaded, failed };
  return lastLoadResult;
}

/**
 * Get all loaded plugins
 * @param {Object} options - Filter options
 * @param {string} options.type - Filter by plugin type
 * @returns {Array} Array of loaded plugins
 */
export function getPlugins(options = {}) {
  let plugins = Array.from(pluginRegistry.values());

  // Filter by type if specified
  if (options.type) {
    plugins = plugins.filter(p => p.type === options.type);
  }

  return plugins;
}

/**
 * Get specific plugin by name
 * @param {string} name - Plugin name
 * @returns {Object|null} Plugin object or null if not found
 */
export function getPlugin(name) {
  return pluginRegistry.get(name) || null;
}

/**
 * Get last load result
 * @returns {Object} Last load result with loaded and failed arrays
 */
export function getLastLoadResult() {
  return lastLoadResult;
}
