# Structural Expression Matrix Process

## Purpose

This document defines the working process for building the structural
expression matrix.

The goal is not to invent an abstract idealized table disconnected from the
current app. The goal is to build a rigorous source of truth that begins from:

- current implemented behavior
- current documented product intent
- the tensions between those two

This process is meant to keep the work honest, comparable, and reviewable.

## Scope Of The First Matrix

The first matrix should include:

- Gregorian
- Hebrew
- life-relative

The first matrix should be limited to **current implemented scale bands**, not
future century / millennium / deep-time scales.

Those future scales can be mentioned in notes, but should not be added as full
rows in the initial matrix.

Life-relative should be included even where behavior is not yet implemented, so
the matrix can already function as a source of truth for the third structural
system.

## Build Sequence

### 1. Evidence-Gathering Pass

Before drafting the matrix, comb:

- product docs
- code
- tests

For each structure / scale combination, establish:

- what the app currently does
- what the docs/spec say it should do
- where those are aligned
- where they are in tension
- where the spec is still unresolved

The audit should use both implementation and tests as evidence, not just memory
or intent.

### 2. First Matrix Draft

Create a single main matrix document.

Each cell should use a consistent template so different structures and scales
can be compared directly.

Each cell should distinguish:

- `Current`
- `Target`
- `Gap / Tension`

This distinction is mandatory so the matrix does not blur current behavior and
desired behavior together.

### 3. Review Package

When sharing the first draft for review, also provide:

- a list of tensions between current app behavior and the product spec
- a consistency assessment by calendar system
- a consistency assessment by scale band
- the main unresolved questions and clarifications needed
- a proposed review method for getting from first draft to crystal-clear spec

The matrix is the main artifact, but the surrounding analysis is part of the
process and should not be omitted.

### 4. Spec-Clarification Pass

After review, revise the matrix so it becomes a clearer articulation of the
product source of truth.

The goal of this pass is:

- remove ambiguities where possible
- mark unresolved cells honestly where needed
- tighten consistency of terms and structure
- make the target behavior legible enough to guide future implementation and
  refactoring

### 5. Implementation Delta Pass

After the matrix is mature enough to act as a true source of truth, perform a
follow-up pass identifying:

- behavior changes needed to align the app with the matrix
- refactors needed to better match theory and code seams
- places where centralized expression / label generation would help
- places where current code structure still reflects historical discovery rather
  than settled product logic

This pass should identify both:

- behavior changes
- architecture / seam improvements

## Cell Template Requirements

Each matrix cell should be rigorously consistent.

The default template should include:

- units / boundaries
- ticks
- ranks
- labels
- spans
- context
- coexistence notes
- notes / open questions
- current-vs-target status

Not every cell will need all sections populated equally, but the template
should remain stable enough that cells are directly comparable.

## Status Language

Each cell should also carry a sense of maturity / confidence.

Suggested language:

- `settled`
- `implemented but underdocumented`
- `documented but not implemented`
- `unresolved`

This does not need to be numerical.
The point is to distinguish mature truth from provisional direction.

## Review Principles

The review process should favor:

- precision over breadth
- explicit gaps over implicit assumptions
- comparison across structures and scales
- honest marking of unresolved questions

The review should not rush to “solve” every open cell if the product theory is
not ready.

It is better to mark:

- unresolved
- design discovery needed
- intentionally deferred

than to smuggle in pseudo-answers.

## Deliverables

This process should produce:

1. one main structural expression matrix document
2. a first-draft review package identifying tensions, questions, and
   consistency issues
3. a later implementation-delta pass identifying behavior changes and refactors

## Success Criteria

This process is successful if:

- the matrix becomes a trustworthy product source of truth
- current behavior and target behavior are clearly separated
- tensions between the codebase and the product spec are legible
- life-relative is integrated into the framework without pretending it is
  already fully implemented
- the matrix becomes useful not just for design clarity, but also for
  implementation planning and future refactoring
