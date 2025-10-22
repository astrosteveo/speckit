/**
 * Tests for Documentation Generator
 *
 * Following TDD: RED → GREEN → REFACTOR
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  parseSpecification,
  parseJSDoc,
  generateMarkdown,
  convertToHTML,
  generateDocs
} from '../../src/core/docs.js';

describe('Documentation Generator', () => {
  const testDir = join(process.cwd(), 'tests/fixtures/docs-test');

  beforeEach(() => {
    // Create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('parseSpecification', () => {
    it('should extract functional requirements from SPECIFICATION.md', () => {
      const spec = `
# Specification

## Functional Requirements

### FR001: User Authentication
Users must be able to log in with email and password.

### FR002: Task Creation
Users can create tasks with title and description.
`;
      const result = parseSpecification(spec);

      expect(result.functionalRequirements).toHaveLength(2);
      expect(result.functionalRequirements[0]).toMatchObject({
        id: 'FR001',
        title: 'User Authentication',
        description: expect.stringContaining('log in with email')
      });
    });

    it('should extract non-functional requirements', () => {
      const spec = `
## Non-Functional Requirements

### NFR001: Performance
API responses must complete within 200ms.
`;
      const result = parseSpecification(spec);

      expect(result.nonFunctionalRequirements).toHaveLength(1);
      expect(result.nonFunctionalRequirements[0].id).toBe('NFR001');
    });

    it('should extract user stories', () => {
      const spec = `
## User Stories

### US001: Task Management
As a user, I want to create tasks so that I can track my work.

**Acceptance Criteria**:
- [ ] User can create task
- [ ] Task has title and description
`;
      const result = parseSpecification(spec);

      expect(result.userStories).toHaveLength(1);
      expect(result.userStories[0]).toMatchObject({
        id: 'US001',
        title: 'Task Management',
        story: expect.stringContaining('As a user')
      });
    });

    it('should handle empty specification', () => {
      const result = parseSpecification('');

      expect(result.functionalRequirements).toEqual([]);
      expect(result.nonFunctionalRequirements).toEqual([]);
      expect(result.userStories).toEqual([]);
    });
  });

  describe('parseJSDoc', () => {
    it('should extract JSDoc comments from source code', () => {
      const source = `
/**
 * Calculate sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
export function add(a, b) {
  return a + b;
}
`;
      const result = parseJSDoc(source);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        description: 'Calculate sum of two numbers',
        params: [
          { name: 'a', type: 'number', description: 'First number' },
          { name: 'b', type: 'number', description: 'Second number' }
        ],
        returns: { type: 'number', description: 'Sum of a and b' }
      });
    });

    it('should extract function signature', () => {
      const source = `
/**
 * Test function
 */
export function testFunc(arg1, arg2) {}
`;
      const result = parseJSDoc(source);

      expect(result[0].signature).toBe('testFunc(arg1, arg2)');
    });

    it('should handle multiple JSDoc blocks', () => {
      const source = `
/**
 * Function one
 */
export function one() {}

/**
 * Function two
 */
export function two() {}
`;
      const result = parseJSDoc(source);

      expect(result).toHaveLength(2);
    });

    it('should handle no JSDoc comments', () => {
      const source = 'export function noDoc() {}';
      const result = parseJSDoc(source);

      expect(result).toEqual([]);
    });
  });

  describe('generateMarkdown', () => {
    it('should generate markdown with requirements section', () => {
      const data = {
        requirements: {
          functionalRequirements: [
            { id: 'FR001', title: 'Auth', description: 'User login' }
          ],
          nonFunctionalRequirements: [],
          userStories: []
        },
        api: []
      };

      const md = generateMarkdown(data);

      expect(md).toContain('# Documentation');
      expect(md).toContain('## Requirements');
      expect(md).toContain('### FR001: Auth');
      expect(md).toContain('User login');
    });

    it('should generate API reference section', () => {
      const data = {
        requirements: {
          functionalRequirements: [],
          nonFunctionalRequirements: [],
          userStories: []
        },
        api: [
          {
            signature: 'add(a, b)',
            description: 'Add numbers',
            params: [{ name: 'a', type: 'number' }],
            returns: { type: 'number' }
          }
        ]
      };

      const md = generateMarkdown(data);

      expect(md).toContain('## API Reference');
      expect(md).toContain('### add(a, b)');
      expect(md).toContain('Add numbers');
    });

    it('should include table of contents', () => {
      const data = {
        requirements: {
          functionalRequirements: [{ id: 'FR001', title: 'Test', description: 'Test' }],
          nonFunctionalRequirements: [],
          userStories: []
        },
        api: []
      };

      const md = generateMarkdown(data);

      expect(md).toContain('## Table of Contents');
      expect(md).toContain('- [Requirements](#requirements)');
    });
  });

  describe('convertToHTML', () => {
    it('should convert headings', () => {
      const md = '# Heading 1\n## Heading 2';
      const html = convertToHTML(md);

      expect(html).toContain('<h1>Heading 1</h1>');
      expect(html).toContain('<h2>Heading 2</h2>');
    });

    it('should convert code blocks', () => {
      const md = '```javascript\nconst x = 1;\n```';
      const html = convertToHTML(md);

      expect(html).toContain('<pre><code class="language-javascript">');
      expect(html).toContain('const x = 1;');
    });

    it('should convert lists', () => {
      const md = '- Item 1\n- Item 2';
      const html = convertToHTML(md);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
    });

    it('should convert links', () => {
      const md = '[Link](https://example.com)';
      const html = convertToHTML(md);

      expect(html).toContain('<a href="https://example.com">Link</a>');
    });

    it('should add basic styling', () => {
      const md = '# Test';
      const html = convertToHTML(md);

      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
    });
  });

  describe('generateDocs', () => {
    it('should generate documentation from project', async () => {
      // Create test project structure
      const speckitDir = join(testDir, '.speckit');
      const srcDir = join(testDir, 'src');

      mkdirSync(speckitDir, { recursive: true });
      mkdirSync(srcDir, { recursive: true });

      // Create specification
      writeFileSync(join(speckitDir, 'SPECIFICATION.md'), `
# Specification

## Functional Requirements

### FR001: Test Feature
This is a test feature.
`);

      // Create source file with JSDoc
      writeFileSync(join(srcDir, 'index.js'), `
/**
 * Test function
 * @param {string} name - Name parameter
 * @returns {string} Greeting
 */
export function greet(name) {
  return \`Hello \${name}\`;
}
`);

      const result = await generateDocs({
        projectPath: testDir,
        formats: ['markdown', 'html'],
        outputDir: join(speckitDir, 'docs')
      });

      expect(result.success).toBe(true);
      expect(result.files).toContain(join(speckitDir, 'docs/markdown/documentation.md'));
      expect(result.files).toContain(join(speckitDir, 'docs/html/documentation.html'));

      // Verify files exist
      expect(existsSync(join(speckitDir, 'docs/markdown/documentation.md'))).toBe(true);
      expect(existsSync(join(speckitDir, 'docs/html/documentation.html'))).toBe(true);
    });

    it('should support incremental updates', async () => {
      const speckitDir = join(testDir, '.speckit');
      mkdirSync(speckitDir, { recursive: true });

      writeFileSync(join(speckitDir, 'SPECIFICATION.md'), '# Test');

      // First generation
      await generateDocs({
        projectPath: testDir,
        formats: ['markdown'],
        incremental: true
      });

      const firstMtime = readFileSync(join(speckitDir, 'docs/markdown/documentation.md'));

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second generation without changes - should be fast
      const start = Date.now();
      await generateDocs({
        projectPath: testDir,
        formats: ['markdown'],
        incremental: true
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should be very fast with no changes
    });

    it('should handle errors gracefully', async () => {
      const result = await generateDocs({
        projectPath: '/nonexistent/path',
        formats: ['markdown']
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
