# Testing Strategy

## Purpose

This note defines a lightweight testing strategy for the timeline engine during
late Phase 1 and early Phase 2.

The goal is not to add maximal process or a heavy BDD stack. The goal is to
protect the parts of the system that are now becoming architecturally stable:

- time-range math
- scale-band derivation
- structural point/span generation
- core interaction regressions

## Phase 1.5 Goals

Phase 1.5 is a small testing foundation pass between core interaction work and
further polish.

Success looks like:

- the repo has a clear test stack
- core timeline math has unit coverage
- a few high-value browser behaviors are covered end-to-end
- major interaction regressions can be caught automatically

## Testing Principles

### 1. Favor High-Leverage Tests

Start with the logic most likely to regress and most painful to verify by hand:

- visible range math
- derived scale-band selection
- start tick derivation
- structural span generation
- control clickability

### 2. Keep the Stack Lean

Use:

- `vitest` + `jsdom` for unit and component-adjacent tests
- Playwright for a very small browser suite

Avoid introducing Gherkin or a full BDD framework unless the value becomes
clear later. Behavior-driven thinking is good; extra tooling is not yet
necessary.

### 3. Write Tests in Behavioral Language

Even without Gherkin, tests should read like expected product behavior.

Examples:

- `derives the nearest scale band from visible duration`
- `keeps HQ controls clickable above the timeline`
- `reset returns to the current containing period`

### 4. Add Tests Alongside Core Refactors

For future work:

- core time math changes should usually include unit test updates
- interaction regressions that matter to product feel should usually get a
  browser test once behavior is stable enough

## Scope of the First Test Batch

### Unit Tests

Initial unit coverage should focus on:

- `getNearestScaleLevel(...)`
- visible range math
- viewport start tick derivation
- structural span generation for buffered ranges

### Browser Tests

Initial browser coverage should stay small and concrete:

- HQ buttons remain clickable
- layer toggles work
- reset returns the timeline to the current containing period

Additional zoom behavior tests can follow once the semi-continuous zoom
prototype stabilizes a bit more.

## What Robust Coverage Would Mean

### Robust Unit Coverage

A mature unit suite would likely cover:

- scale-band derivation and boundaries
- visible range math
- first visible tick derivation
- structural tick generation across multiple scale bands
- structural span generation across multiple scale bands
- birthday-relative anniversary and future structural calculations
- layer-combination behavior where ordering or visibility matters

### Robust Browser Coverage

A mature browser suite would likely cover:

- HQ controls and collapse/expand behavior
- layer toggles and multi-layer rendering expectations
- reset and recenter behaviors
- wheel pan behavior
- continuous zoom behavior across scale-band transitions
- critical layout expectations such as control accessibility and visible `now`
  behavior

### Coverage Estimate Today

This is a rough qualitative estimate, not a measured percentage from a coverage
tool.

- core unit coverage of high-risk timeline math: roughly 25%
- browser coverage of critical user-facing behavior: roughly 15%
- regression protection for the most recently changed interaction paths: much
  higher than those percentages imply

In other words:

- the suite is intentionally narrow
- it does not aim for broad completeness yet
- it does already protect several of the most likely and expensive regressions

## When To Expand Coverage

We should expand toward more robust coverage when one or more of these become
true:

- zoom and label behavior are stable enough that browser assertions stop
  churning
- multi-layer rendering becomes more complex and harder to verify by eye
- notes, events, and imported spans begin sharing the same rendering surface
- manual regression checking starts to feel slow or error-prone
- we begin to treat parts of the timeline engine as stable product behavior
  rather than active experimentation

## What We Are Not Doing Yet

- full visual regression testing
- exhaustive UI snapshot testing
- a formal Gherkin stack
- broad end-to-end coverage of every interaction path

Those may become useful later, but they are not required for the current phase.

## Workflow Guidance

Recommended default workflow:

1. clarify expected behavior
2. make or refine the implementation
3. add or update focused tests for stable behavior
4. run build plus relevant tests before committing

This is intended to be test-aware, not rigidly dogmatic.
