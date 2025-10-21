import { describe, it, expect } from 'vitest';
import * as Quality from '../../src/core/quality.js';

describe('Quality Validation', () => {
  describe('validateSpecification', () => {
    it('should score a high-quality specification highly', () => {
      const spec = {
        functionalRequirements: [
          { id: 'FR1', description: 'User can create an account with email and password' },
          { id: 'FR2', description: 'User can log in with credentials' },
          { id: 'FR3', description: 'User can reset password via email' },
          { id: 'FR4', description: 'User session persists for 30 days' },
          { id: 'FR5', description: 'User can log out from any device' }
        ],
        nonFunctionalRequirements: [
          { id: 'NFR1', description: 'Password hashing with bcrypt', metric: 'All passwords encrypted' },
          { id: 'NFR2', description: 'Response time < 200ms', metric: 'P95 latency' }
        ],
        userStories: [
          {
            story: 'As a user, I want to create an account so that I can access the system',
            acceptanceCriteria: [
              'Email validation required',
              'Password must be 8+ characters',
              'Confirmation email sent'
            ]
          },
          {
            story: 'As a user, I want to log in so that I can access my account',
            acceptanceCriteria: [
              'Credentials validated',
              'Session token generated',
              'Redirect to dashboard'
            ]
          }
        ]
      };

      const result = Quality.validateSpecification(spec);

      expect(result.overall).toBeGreaterThanOrEqual(85);
      expect(result.completeness).toBeGreaterThan(80);
      expect(result.clarity).toBeGreaterThan(80);
      expect(result.testability).toBeGreaterThan(80);
      expect(result.passed).toBe(true);
    });

    it('should score an incomplete specification poorly', () => {
      const spec = {
        functionalRequirements: [
          { id: 'FR1', description: 'User can login' }
        ],
        nonFunctionalRequirements: [],
        userStories: []
      };

      const result = Quality.validateSpecification(spec);

      expect(result.overall).toBeLessThan(70);
      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Too few functional requirements (minimum 5)');
      expect(result.issues).toContain('No user stories defined');
    });

    it('should score unclear requirements poorly', () => {
      const spec = {
        functionalRequirements: [
          { id: 'FR1', description: 'Login' },
          { id: 'FR2', description: 'Logout' },
          { id: 'FR3', description: 'Create' },
          { id: 'FR4', description: 'Delete' },
          { id: 'FR5', description: 'Update' }
        ],
        nonFunctionalRequirements: [
          { id: 'NFR1', description: 'Fast' }
        ],
        userStories: [
          {
            story: 'User wants to use the system',
            acceptanceCriteria: ['It works']
          }
        ]
      };

      const result = Quality.validateSpecification(spec);

      expect(result.clarity).toBeLessThan(60);
      expect(result.issues.some(i => i.includes('requirements') && i.includes('vague'))).toBe(true);
    });

    it('should identify untestable acceptance criteria', () => {
      const spec = {
        functionalRequirements: [
          { id: 'FR1', description: 'System should be user-friendly' },
          { id: 'FR2', description: 'Interface must be intuitive' },
          { id: 'FR3', description: 'Performance should be good' },
          { id: 'FR4', description: 'Security should be robust' },
          { id: 'FR5', description: 'Code should be maintainable' }
        ],
        nonFunctionalRequirements: [],
        userStories: [
          {
            story: 'As a user, I want an easy interface',
            acceptanceCriteria: ['Interface is easy to use']
          }
        ]
      };

      const result = Quality.validateSpecification(spec);

      expect(result.testability).toBeLessThanOrEqual(50);
      expect(result.issues.some(i => i.includes('vague') || i.includes('unmeasurable'))).toBe(true);
    });

    it('should provide actionable recommendations', () => {
      const spec = {
        functionalRequirements: [
          { id: 'FR1', description: 'Do something' }
        ],
        nonFunctionalRequirements: [],
        userStories: []
      };

      const result = Quality.validateSpecification(spec);

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes('Add more'))).toBe(true);
    });
  });

  describe('validatePlan', () => {
    it('should score a complete plan highly', () => {
      const plan = {
        architecture: {
          overview: 'Three-tier architecture with React frontend, Express API, PostgreSQL database',
          components: [
            { name: 'Frontend', tech: 'React 18', purpose: 'User interface' },
            { name: 'API', tech: 'Express.js', purpose: 'Business logic' },
            { name: 'Database', tech: 'PostgreSQL 15', purpose: 'Data persistence' }
          ]
        },
        tasks: [
          { id: 'T001', title: 'Set up database schema', effort: '4h', dependencies: [] },
          { id: 'T002', title: 'Create API endpoints', effort: '6h', dependencies: ['T001'] },
          { id: 'T003', title: 'Build frontend components', effort: '8h', dependencies: ['T002'] }
        ],
        timeline: {
          totalEffort: '18h',
          phases: ['Setup', 'Implementation', 'Testing']
        }
      };

      const result = Quality.validatePlan(plan);

      expect(result.overall).toBeGreaterThanOrEqual(85);
      expect(result.completeness).toBeGreaterThan(80);
      expect(result.actionability).toBeGreaterThan(80);
      expect(result.feasibility).toBeGreaterThan(80);
      expect(result.passed).toBe(true);
    });

    it('should identify missing dependencies', () => {
      const plan = {
        architecture: {
          overview: 'Simple app',
          components: []
        },
        tasks: [
          { id: 'T001', title: 'Deploy app', effort: '2h', dependencies: [] }
        ],
        timeline: {}
      };

      const result = Quality.validatePlan(plan);

      expect(result.issues.some(i => i.includes('No architecture components'))).toBe(true);
      expect(result.passed).toBe(false);
    });

    it('should validate task granularity', () => {
      const plan = {
        architecture: {
          overview: 'App architecture',
          components: [{ name: 'App', tech: 'Node', purpose: 'Do stuff' }]
        },
        tasks: [
          { id: 'T001', title: 'Build entire application', effort: '200h', dependencies: [] }
        ],
        timeline: { totalEffort: '200h', phases: ['Build'] }
      };

      const result = Quality.validatePlan(plan);

      expect(result.actionability).toBeLessThan(70);
      expect(result.issues.some(i => i.includes('too large'))).toBe(true);
    });
  });

  describe('validateImplementation', () => {
    it('should score quality implementation highly', () => {
      const implementation = {
        testsWritten: true,
        testsPassing: true,
        coverage: 92,
        lintErrors: 0,
        acceptanceCriteriaMet: ['Login works', 'Validation works', 'Session persists']
      };

      const result = Quality.validateImplementation(implementation);

      expect(result.overall).toBeGreaterThanOrEqual(90);
      expect(result.testCoverage).toBe(92);
      expect(result.passed).toBe(true);
    });

    it('should fail if tests not written', () => {
      const implementation = {
        testsWritten: false,
        testsPassing: false,
        coverage: 0,
        lintErrors: 0,
        acceptanceCriteriaMet: []
      };

      const result = Quality.validateImplementation(implementation);

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('No tests written');
    });

    it('should fail if tests are failing', () => {
      const implementation = {
        testsWritten: true,
        testsPassing: false,
        coverage: 0,
        lintErrors: 0,
        acceptanceCriteriaMet: []
      };

      const result = Quality.validateImplementation(implementation);

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Tests are failing');
    });

    it('should fail if coverage below threshold', () => {
      const implementation = {
        testsWritten: true,
        testsPassing: true,
        coverage: 65,
        lintErrors: 0,
        acceptanceCriteriaMet: ['Works']
      };

      const result = Quality.validateImplementation(implementation);

      expect(result.passed).toBe(false);
      expect(result.issues.some(i => i.includes('coverage'))).toBe(true);
    });

    it('should fail if lint errors exist', () => {
      const implementation = {
        testsWritten: true,
        testsPassing: true,
        coverage: 85,
        lintErrors: 12,
        acceptanceCriteriaMet: ['Works']
      };

      const result = Quality.validateImplementation(implementation);

      expect(result.passed).toBe(false);
      expect(result.issues.some(i => i.includes('lint errors'))).toBe(true);
    });

    it('should warn if no acceptance criteria met', () => {
      const implementation = {
        testsWritten: true,
        testsPassing: true,
        coverage: 85,
        lintErrors: 0,
        acceptanceCriteriaMet: []
      };

      const result = Quality.validateImplementation(implementation);

      expect(result.issues).toContain('No acceptance criteria documented as met');
    });
  });

  describe('thresholds', () => {
    it('should use default thresholds if not provided', () => {
      const spec = {
        functionalRequirements: [
          { id: 'FR1', description: 'Clear requirement 1' },
          { id: 'FR2', description: 'Clear requirement 2' },
          { id: 'FR3', description: 'Clear requirement 3' },
          { id: 'FR4', description: 'Clear requirement 4' },
          { id: 'FR5', description: 'Clear requirement 5' }
        ],
        nonFunctionalRequirements: [
          { id: 'NFR1', description: 'Performance < 200ms', metric: 'P95' }
        ],
        userStories: [
          {
            story: 'As a user, I want X so that Y',
            acceptanceCriteria: ['A', 'B', 'C']
          }
        ]
      };

      const result = Quality.validateSpecification(spec);

      expect(result.threshold).toBe(85);
    });

    it('should allow custom thresholds', () => {
      const spec = {
        functionalRequirements: [
          { id: 'FR1', description: 'Req' }
        ],
        nonFunctionalRequirements: [],
        userStories: []
      };

      const result = Quality.validateSpecification(spec, { threshold: 50 });

      // Even though quality is low, it passes the custom threshold
      if (result.overall >= 50) {
        expect(result.passed).toBe(true);
      }
    });
  });
});
