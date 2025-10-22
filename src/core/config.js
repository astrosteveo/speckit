/**
 * Configuration Management
 *
 * Hierarchical configuration: env vars → project → global → defaults
 * Zero dependencies - uses Node.js built-ins
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config file locations
const GLOBAL_CONFIG_DIR = join(homedir(), '.speckit');
const GLOBAL_CONFIG_FILE = join(GLOBAL_CONFIG_DIR, 'config.json');
const PROJECT_CONFIG_FILE = '.speckit/config.json';

// Default configuration
const DEFAULTS = {
  editor: process.env.EDITOR || 'code',
  quiet: false,
  skipValidation: false,
  qualityThreshold: {
    specification: 85,
    plan: 85,
    implementation: 80
  },
  outputFormat: 'markdown',
  docsOutputDir: 'docs',
  pluginsDir: '.speckit/plugins',
  agentsDir: '.claude/agents',
  templatesDir: '.speckit/templates'
};

/**
 * Load configuration with hierarchy
 */
export function loadConfig(projectDir = process.cwd()) {
  const config = { ...DEFAULTS };

  // 1. Load global config
  if (existsSync(GLOBAL_CONFIG_FILE)) {
    try {
      const globalConfig = JSON.parse(readFileSync(GLOBAL_CONFIG_FILE, 'utf-8'));
      Object.assign(config, globalConfig);
    } catch (error) {
      // Ignore invalid global config
    }
  }

  // 2. Load project config
  const projectConfigPath = join(projectDir, PROJECT_CONFIG_FILE);
  if (existsSync(projectConfigPath)) {
    try {
      const projectConfig = JSON.parse(readFileSync(projectConfigPath, 'utf-8'));
      Object.assign(config, projectConfig);
    } catch (error) {
      // Ignore invalid project config
    }
  }

  // 3. Override with environment variables
  if (process.env.SPECKIT_EDITOR) config.editor = process.env.SPECKIT_EDITOR;
  if (process.env.SPECKIT_QUIET) config.quiet = process.env.SPECKIT_QUIET === 'true';
  if (process.env.SPECKIT_SKIP_VALIDATION) config.skipValidation = process.env.SPECKIT_SKIP_VALIDATION === 'true';
  if (process.env.SPECKIT_OUTPUT_FORMAT) config.outputFormat = process.env.SPECKIT_OUTPUT_FORMAT;

  return config;
}

/**
 * Get a config value by key (supports nested keys with dot notation)
 */
export function get(key, projectDir = process.cwd()) {
  const config = loadConfig(projectDir);

  // Support nested keys like "qualityThreshold.specification"
  const keys = key.split('.');
  let value = config;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Validate configuration value
 */
export function validateConfig(key, value) {
  const validators = {
    'editor': (v) => typeof v === 'string' && v.length > 0,
    'quiet': (v) => typeof v === 'boolean',
    'skipValidation': (v) => typeof v === 'boolean',
    'qualityThreshold.specification': (v) => typeof v === 'number' && v >= 0 && v <= 100,
    'qualityThreshold.plan': (v) => typeof v === 'number' && v >= 0 && v <= 100,
    'qualityThreshold.implementation': (v) => typeof v === 'number' && v >= 0 && v <= 100,
    'outputFormat': (v) => ['markdown', 'html', 'pdf'].includes(v),
    'docsOutputDir': (v) => typeof v === 'string' && v.length > 0,
    'pluginsDir': (v) => typeof v === 'string' && v.length > 0,
    'agentsDir': (v) => typeof v === 'string' && v.length > 0,
    'templatesDir': (v) => typeof v === 'string' && v.length > 0
  };

  const validator = validators[key];
  if (!validator) {
    // No specific validator - allow any value
    return { valid: true };
  }

  const valid = validator(value);
  if (!valid) {
    const errorMessages = {
      'editor': 'Editor must be a non-empty string',
      'quiet': 'Quiet must be a boolean (true/false)',
      'skipValidation': 'SkipValidation must be a boolean (true/false)',
      'qualityThreshold.specification': 'Quality threshold must be a number between 0 and 100',
      'qualityThreshold.plan': 'Quality threshold must be a number between 0 and 100',
      'qualityThreshold.implementation': 'Quality threshold must be a number between 0 and 100',
      'outputFormat': 'Output format must be one of: markdown, html, pdf',
      'docsOutputDir': 'Docs output directory must be a non-empty string',
      'pluginsDir': 'Plugins directory must be a non-empty string',
      'agentsDir': 'Agents directory must be a non-empty string',
      'templatesDir': 'Templates directory must be a non-empty string'
    };

    return {
      valid: false,
      error: errorMessages[key] || `Invalid value for ${key}`
    };
  }

  return { valid: true };
}

/**
 * Set a config value (saves to project or global config)
 */
export function set(key, value, options = {}) {
  const { global = false, projectDir = process.cwd() } = options;

  // Validate the value
  const validation = validateConfig(key, value);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Determine which config file to update
  const configPath = global ? GLOBAL_CONFIG_FILE : join(projectDir, PROJECT_CONFIG_FILE);

  // Load existing config
  let config = {};
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch (error) {
      // Start with empty config if invalid
    }
  }

  // Set value (support nested keys)
  const keys = key.split('.');
  let obj = config;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in obj) || typeof obj[k] !== 'object') {
      obj[k] = {};
    }
    obj = obj[k];
  }

  obj[keys[keys.length - 1]] = value;

  // Ensure directory exists
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Save config
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

  return true;
}

/**
 * Delete a config value
 */
export function unset(key, options = {}) {
  const { global = false, projectDir = process.cwd() } = options;

  const configPath = global ? GLOBAL_CONFIG_FILE : join(projectDir, PROJECT_CONFIG_FILE);

  if (!existsSync(configPath)) {
    return false;
  }

  let config = {};
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    return false;
  }

  // Delete value (support nested keys)
  const keys = key.split('.');
  let obj = config;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in obj) || typeof obj[k] !== 'object') {
      return false; // Key doesn't exist
    }
    obj = obj[k];
  }

  const lastKey = keys[keys.length - 1];
  if (!(lastKey in obj)) {
    return false; // Key doesn't exist
  }

  delete obj[lastKey];

  // Save config
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

  return true;
}

/**
 * List all config values with sources
 */
export function list(projectDir = process.cwd()) {
  const result = [];

  // Get default values
  const defaults = { ...DEFAULTS };
  const globalConfig = existsSync(GLOBAL_CONFIG_FILE)
    ? JSON.parse(readFileSync(GLOBAL_CONFIG_FILE, 'utf-8'))
    : {};
  const projectConfigPath = join(projectDir, PROJECT_CONFIG_FILE);
  const projectConfig = existsSync(projectConfigPath)
    ? JSON.parse(readFileSync(projectConfigPath, 'utf-8'))
    : {};

  // Flatten config and determine sources
  const flattenConfig = (obj, prefix = '', source = 'default') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenConfig(value, fullKey, source);
      } else {
        // Determine actual source
        let actualSource = 'default';

        // Check env vars
        const envKey = 'SPECKIT_' + fullKey.toUpperCase().replace(/\./g, '_');
        if (process.env[envKey]) {
          actualSource = 'env';
        } else if (getNestedValue(projectConfig, fullKey) !== undefined) {
          actualSource = 'project';
        } else if (getNestedValue(globalConfig, fullKey) !== undefined) {
          actualSource = 'global';
        }

        result.push({
          key: fullKey,
          value: getNestedValue(loadConfig(projectDir), fullKey),
          source: actualSource
        });
      }
    }
  };

  flattenConfig(loadConfig(projectDir));
  return result;
}

/**
 * Helper to get nested value
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let value = obj;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Reset config to defaults
 */
export function reset(options = {}) {
  const { global = false, projectDir = process.cwd() } = options;

  const configPath = global ? GLOBAL_CONFIG_FILE : join(projectDir, PROJECT_CONFIG_FILE);

  if (existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify({}, null, 2), 'utf-8');
  }

  return true;
}

/**
 * Initialize global config directory
 */
export function initGlobalConfig() {
  if (!existsSync(GLOBAL_CONFIG_DIR)) {
    mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  }

  if (!existsSync(GLOBAL_CONFIG_FILE)) {
    writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}
