# {{projectName}} Technical Plan

**Version**: {{version}}
**Created**: {{createdAt}}
**Last Updated**: {{updatedAt}}
**Based on Specification**: v{{specVersion}}

## Architecture Overview

{{architectureOverview}}

## Components

{{#components}}
### Component {{index}}: {{name}}

**Technology**: {{technology}}

**Purpose**: {{purpose}}

**Responsibilities**:
{{#responsibilities}}
- {{responsibility}}
{{/responsibilities}}

**Interfaces**:
{{#interfaces}}
- {{interface}}
{{/interfaces}}

{{#dataModel}}
**Data Model**:
```
{{dataModel}}
```
{{/dataModel}}

---

{{/components}}

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
{{#techChoices}}
| {{decision}} | {{choice}} | {{rationale}} |
{{/techChoices}}

## Task Breakdown

{{#phases}}
### Phase {{index}}: {{name}}

**Effort**: {{totalEffort}} hours
**Description**: {{description}}

{{#tasks}}
#### {{taskId}}: {{title}}

**Effort**: {{effort}} hours
**Dependencies**: {{#dependencies}}{{.}}{{^last}}, {{/last}}{{/dependencies}}{{^dependencies}}None{{/dependencies}}

**Description**: {{description}}

**Acceptance Criteria**:
{{#acceptanceCriteria}}
- [ ] {{criterion}}
{{/acceptanceCriteria}}

{{#technicalNotes}}
**Technical Notes**:
{{#notes}}
- {{note}}
{{/notes}}
{{/technicalNotes}}

---

{{/tasks}}

{{/phases}}

## Execution Timeline

**Total Effort**: {{totalEffort}} hours ({{totalDays}} days at {{hoursPerDay}}h/day)

**Phase Summary**:
{{#phaseSummary}}
- Phase {{index}} ({{name}}): {{effort}} hours
{{/phaseSummary}}

**Critical Path**: {{criticalPath}}

**Milestones**:
{{#milestones}}
- {{milestone}}: {{date}} (after {{cumulativeHours}}h)
{{/milestones}}

## Dependencies & Prerequisites

**Required Before Starting**:
{{#prerequisites}}
- {{prerequisite}}
{{/prerequisites}}

**External Services**:
{{#externalServices}}
- **{{service}}**: {{purpose}}
{{/externalServices}}

**Environment Setup**:
{{#envSetup}}
- {{step}}
{{/envSetup}}

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
{{#risks}}
| {{risk}} | {{probability}} | {{impact}} | {{mitigation}} |
{{/risks}}

## Test Strategy

{{testStrategy}}

**Testing Breakdown**:
{{#testingBreakdown}}
- **{{level}}**: {{description}} ({{coverage}}% coverage target)
{{/testingBreakdown}}

## Future Enhancements

Features identified but not included in this plan:

{{#futureEnhancements}}
- **{{feature}}**: {{description}} (Estimated: {{effort}}h)
{{/futureEnhancements}}

---

## Quality Report

**Overall Score**: {{qualityScore}}/100

**Metrics**:
- Completeness: {{completeness}}/100
- Actionability: {{actionability}}/100
- Feasibility: {{feasibility}}/100

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

*This plan breaks down the specification into concrete, achievable tasks. Follow TDD strictly: RED → GREEN → REFACTOR for every task.*
