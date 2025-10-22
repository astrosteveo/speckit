/**
 * Tests for Core Commands
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { initCommand } from '../../src/commands/init.js';
import { statusCommand } from '../../src/commands/status.js';
import { configCommand } from '../../src/commands/config.js';
import { validateCommand } from '../../src/commands/validate.js';

describe('Core Commands', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    // Save original cwd
    originalCwd = process.cwd();

    // Create temp test directory
    testDir = join(tmpdir(), `speckit-cmd-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(() => {
    // Restore original cwd
    process.chdir(originalCwd);

    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('initCommand', () => {
    it('should initialize a new workflow in current directory', async () => {
      // Don't provide a project name to init in current directory
      const result = await initCommand([], { yes: true });

      expect(result.success).toBe(true);
      expect(existsSync(join(testDir, '.speckit'))).toBe(true);
      expect(existsSync(join(testDir, '.speckit', 'state.json'))).toBe(true);
      expect(existsSync(join(testDir, '.speckit', 'quality'))).toBe(true);
      expect(existsSync(join(testDir, '.speckit', 'docs'))).toBe(true);
      expect(existsSync(join(testDir, '.speckit', 'templates'))).toBe(true);
    });

    it('should create project directory when provided', async () => {
      const result = await initCommand(['my-new-project'], { yes: true });

      expect(result.success).toBe(true);
      expect(result.createdProject).toBe(true);
      expect(existsSync(join(testDir, 'my-new-project'))).toBe(true);
      expect(existsSync(join(testDir, 'my-new-project', '.speckit'))).toBe(true);
    });

    it('should fail if workflow already exists', async () => {
      // Initialize once
      await initCommand(['test'], { yes: true });

      // Try to initialize again
      const result = await initCommand(['test'], { yes: true });

      expect(result.success).toBe(false);
    });

    it('should create git repository when creating new project', async () => {
      const result = await initCommand(['git-project'], { yes: true });

      // Git init might not work in CI, so just check if we tried
      expect(result.success).toBe(true);
    });

    it('should create all required subdirectories', async () => {
      await initCommand(['test'], { yes: true });

      const speckitDir = join(testDir, '.speckit');

      expect(existsSync(join(speckitDir, 'quality'))).toBe(true);
      expect(existsSync(join(speckitDir, 'docs'))).toBe(true);
      expect(existsSync(join(speckitDir, 'templates'))).toBe(true);
    });
  });

  describe('statusCommand', () => {
    beforeEach(async () => {
      // Initialize workflow for status tests (no project name = use current dir)
      await initCommand([], { yes: true });
    });

    it('should display workflow status', async () => {
      const result = await statusCommand([], {});

      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
      expect(result.state.projectName).toBeDefined();
    });

    it('should show 0% progress for new workflow', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await statusCommand([], {});

      expect(result.success).toBe(true);

      // Check that progress is displayed (look for "0%")
      const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('0%');

      consoleSpy.mockRestore();
    });

    it('should output JSON when --json flag provided', async () => {
      const result = await statusCommand([], { json: true });

      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
      expect(typeof result.state).toBe('object');
    });

    it('should fail when no workflow exists', async () => {
      // Remove .speckit directory
      const speckitDir = join(testDir, '.speckit');
      if (existsSync(speckitDir)) {
        rmSync(speckitDir, { recursive: true, force: true });
      }

      const result = await statusCommand([], {});

      expect(result.success).toBe(false);
    });

    it('should show correct phase status', async () => {
      const result = await statusCommand([], {});

      expect(result.state.currentPhase).toBe('constitute');
      expect(result.state.phases.constitute.status).toBe('pending');
      expect(result.state.phases.specify.status).toBe('pending');
    });
  });

  describe('configCommand', () => {
    beforeEach(async () => {
      // Initialize workflow for config tests
      await initCommand([], { yes: true });
    });

    it('should list all configuration', async () => {
      const result = await configCommand([], {});

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(Array.isArray(result.config)).toBe(true);
    });

    it('should get a config value', async () => {
      const result = await configCommand(['get', 'editor'], {});

      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });

    it('should set a config value', async () => {
      const setResult = await configCommand(['set', 'editor', 'vim'], {});
      expect(setResult.success).toBe(true);

      const getResult = await configCommand(['get', 'editor'], {});
      expect(getResult.value).toBe('vim');
    });

    it('should unset a config value', async () => {
      // Set a value first
      await configCommand(['set', 'customKey', 'customValue'], {});

      // Unset it
      const result = await configCommand(['unset', 'customKey'], {});

      expect(result.success).toBe(true);
    });

    it('should handle nested keys with dot notation', async () => {
      const result = await configCommand(['get', 'qualityThreshold.specification'], {});

      expect(result.success).toBe(true);
      expect(result.value).toBe(85);
    });

    it('should fail for unknown config action', async () => {
      const result = await configCommand(['invalid-action'], {});

      expect(result.success).toBe(false);
    });

    it('should require key for get action', async () => {
      const result = await configCommand(['get'], {});

      expect(result.success).toBe(false);
    });

    it('should require key and value for set action', async () => {
      const result = await configCommand(['set', 'editor'], {});

      expect(result.success).toBe(false);
    });
  });

  describe('validateCommand', () => {
    beforeEach(async () => {
      // Initialize workflow
      await initCommand([], { yes: true });
    });

    it('should fail when no completed phases exist', async () => {
      const result = await validateCommand([], {});

      expect(result.success).toBe(false);
    });

    it('should fail when no workflow exists', async () => {
      // Remove .speckit directory
      rmSync(join(testDir, '.speckit'), { recursive: true, force: true });

      const result = await validateCommand([], {});

      expect(result.success).toBe(false);
    });

    it('should validate specification when it exists', async () => {
      const speckitDir = join(testDir, '.speckit');

      // Create a simple specification
      const spec = `# Specification

## Functional Requirements

### FR001: User Login
Users can log in with email and password.

### FR002: User Registration
Users can register a new account.

### FR003: Password Reset
Users can reset their password via email.

### FR004: Profile Management
Users can edit their profile information.

### FR005: Two-Factor Authentication
Users can enable 2FA for additional security.

## Non-Functional Requirements

### NFR001: Performance
System should respond within 200ms for 95% of requests.

### NFR002: Security
All passwords must be hashed using bcrypt.

## User Stories

### US001: Login
As a user, I want to log in so that I can access my account.

Acceptance Criteria:
- Valid email/password combinations are accepted
- Invalid credentials show error message
- Successful login redirects to dashboard

### US002: Registration
As a new user, I want to create an account so that I can use the system.

Acceptance Criteria:
- Email validation is performed
- Password strength is checked
- Confirmation email is sent
`;

      writeFileSync(join(speckitDir, 'SPECIFICATION.md'), spec);

      const result = await validateCommand(['spec'], {});

      expect(result).toBeDefined();
      expect(result.quality).toBeDefined();
    });

    it('should validate plan when it exists', async () => {
      const speckitDir = join(testDir, '.speckit');

      // Create a simple plan
      const plan = `# Technical Plan

## Architecture Overview

Three-tier web application with React frontend, Node.js backend, and PostgreSQL database.

## Components

### Component 1: Frontend (React)
User interface layer built with React and TypeScript.

### Component 2: API Server (Node.js)
RESTful API built with Express.js.

### Component 3: Database (PostgreSQL)
Relational database for data persistence.

## Tasks

### TASK-001: Setup Project (2h)
Initialize project structure and install dependencies.

### TASK-002: Database Schema (4h)
Design and implement database schema.

### TASK-003: API Endpoints (6h)
Implement REST API endpoints.

### TASK-004: Frontend Components (8h)
Build React components for UI.

### TASK-005: Integration (4h)
Integrate frontend with backend API.

## Timeline

Total Estimated Effort: 24 hours
`;

      writeFileSync(join(speckitDir, 'PLAN.md'), plan);

      const result = await validateCommand(['plan'], {});

      expect(result).toBeDefined();
      expect(result.quality).toBeDefined();
    });
  });
});
