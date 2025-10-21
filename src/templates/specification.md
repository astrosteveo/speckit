# {{projectName}} Specification

**Version**: {{version}}
**Created**: {{createdAt}}
**Last Updated**: {{updatedAt}}
**Status**: {{status}}

## Overview

{{overview}}

## Functional Requirements

{{#functionalRequirements}}
### {{id}}: {{title}}

**Description**: {{description}}

**Priority**: {{priority}}

**Testability**: {{testability}}

{{#details}}
- {{item}}
{{/details}}

---

{{/functionalRequirements}}

## Non-Functional Requirements

{{#nonFunctionalRequirements}}
### {{id}}: {{title}}

**Description**: {{description}}

**Metric**: {{metric}}

**Target**: {{target}}

**Rationale**: {{rationale}}

---

{{/nonFunctionalRequirements}}

## User Stories

{{#userStories}}
### Story {{index}}: {{title}}

**As a** {{role}}
**I want** {{feature}}
**So that** {{benefit}}

**Acceptance Criteria**:

{{#acceptanceCriteria}}
- [ ] {{criterion}}
{{/acceptanceCriteria}}

**Priority**: {{priority}}

---

{{/userStories}}

## Constraints

{{#constraints}}
- **{{type}}**: {{description}}
{{/constraints}}

## Success Metrics

How we'll measure success:

{{#successMetrics}}
- **{{metric}}**: {{target}} ({{measurement}})
{{/successMetrics}}

## Assumptions

{{#assumptions}}
- {{assumption}}
{{/assumptions}}

## Open Questions

{{#openQuestions}}
- ❓ {{question}}
{{/openQuestions}}

## Out of Scope

{{#outOfScope}}
- {{item}}
{{/outOfScope}}

---

## Quality Report

**Overall Score**: {{qualityScore}}/100

**Metrics**:
- Completeness: {{completeness}}/100
- Clarity: {{clarity}}/100
- Testability: {{testability}}/100

**Status**: {{#qualityPassed}}✅ Passed{{/qualityPassed}}{{^qualityPassed}}❌ Needs Refinement{{/qualityPassed}}

{{#qualityIssues}}
**Issues**:
{{#issues}}
- {{issue}}
{{/issues}}
{{/qualityIssues}}

{{#qualityRecommendations}}
**Recommendations**:
{{#recommendations}}
- {{recommendation}}
{{/recommendations}}
{{/qualityRecommendations}}

---

*This specification serves as the source of truth for what this project delivers. All implementation must trace back to requirements defined here.*
