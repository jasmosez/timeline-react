# Structural Expression Policy Refactor Plan

## Purpose

This plan translates the current theory work into an implementation path.

The goal is **not** to rebuild the app from scratch.
The goal is to incrementally move from:

- distributed per-scale / per-layer expression logic

to:

- explicit structural period families
- shared expression policy
- clearer separation between structural ontology and rendering behavior

while preserving the app’s working product behavior as much as possible.

## Why This Refactor Exists

The current codebase has taught us a lot, but it now carries too much product
truth in distributed logic:

- per-scale handcrafted tick-rank logic
- per-layer label composition branching
- span behavior that is only partly centralized
- life-relative behavior that no longer fits its current “birthday marker”
  conceptual shape

The new theory suggests a better architecture:

- structural systems define **period families**
- a shared policy layer determines how those families are expressed at a given
  zoom / density / coexistence state
- the expression matrix validates the resulting behavior rather than serving as
  the only authoring mechanism

## Refactor Goals

### Primary Goals

- define structural period families explicitly
- separate structural definition from expression policy
- centralize visibility / prominence / label / span decisions as much as
  possible
- preserve current Gregorian and Hebrew behavior where it is already good
- create a path for life-relative to become a true third structural system

### Secondary Goals

- reduce bespoke rank logic spread across calendar files
- improve the match between product theory and code seams
- make future coexistence with third / fourth structural systems less painful

### Non-Goals

- fully implement life-relative structural behavior during the first pass
- solve every deep-time / future-scale question now
- perfect the final visual design of 3+ structural coexistence
- eliminate all explicit exceptions

This is a refactor toward a better architecture, not an attempt to finish the
entire product in one move.

## High-Level Strategy

The safest strategy is:

1. preserve current behavior as the baseline
2. introduce the new abstractions in parallel
3. migrate one structural slice at a time
4. keep verification running after each slice
5. only remove old bespoke logic after the new path is proven

This should be treated as an incremental migration, not a flag day rewrite.

## Proposed New Architectural Layers

### 1. Structural Period Family Definitions

Each structural calendar system should declare its period families.

These families should describe:

- identity
- calculation
- relative significance
- possible boundary expression
- possible interval expression
- possible label/context capabilities

Examples:

- Gregorian hour
- Gregorian day
- Gregorian week
- Hebrew day
- Hebrew month
- Hebrew shmita
- future life-relative week

The first refactor does not need to define all future life-relative families,
but it should establish the shape that will support them.

### 2. Shared Expression Policy Layer

This layer should decide, for each period family in the current viewport:

- whether boundaries appear as ticks
- whether intervals appear as spans
- tick prominence
- span prominence
- label visibility
- label richness
- suppression rules
- sticky context / promoted label responsibilities

This is the main architectural target of the refactor.

### 3. Rendering Layer

Rendering components should increasingly consume already-decided expression
outputs rather than reproducing calendar-specific policy.

The rendering layer should remain concerned mainly with:

- placement
- visual classes
- interaction
- sticky / promoted presentation mechanics

not with deciding structural policy from scratch.

## Phased Refactor Plan

## Phase 0: Preparation

### Objective

Create the branch and preserve a clean baseline before code movement begins.

### Work

- branch from current mainline
- preserve current docs and matrix as baseline artifacts
- identify the minimum current files that form the structural expression seam

### Likely seam files

- `src/timeline/gregorian.ts`
- `src/timeline/hebrew.ts`
- `src/timeline/gregorianLabels.ts`
- `src/timeline/hebrewLabels.ts`
- `src/timeline/layout.ts`
- `src/components/Timeline.tsx`
- `src/timeline/types.ts`

### Deliverable

- branch ready
- baseline preserved

## Phase 1: Introduce Core Types And Policy Skeleton

### Objective

Create the new vocabulary without yet migrating all behavior.

### Work

- introduce types for structural period families
- introduce types for expression state/output
- introduce a shared policy module skeleton
- keep old behavior in place

### Suggested type families

- `StructuralPeriodFamily`
- `BoundaryExpression`
- `SpanExpression`
- `ExpressionPolicyInput`
- `ExpressionPolicyOutput`

### Deliverable

- no major behavior change
- new concepts exist in code and can be used in later phases

## Phase 2: Migrate Gregorian First

### Objective

Prove the architecture on the most mature structural system first.

### Why Gregorian First

- behavior is relatively coherent
- tests are comparatively strong
- fewer unresolved theory questions than Hebrew or life-relative

### Work

- declare Gregorian period families explicitly
- move Gregorian tick/span visibility and prominence decisions into shared
  policy
- keep Gregorian label composition behavior matching current product
- preserve known good DST behavior and current sticky context behavior

### Deliverable

- Gregorian runs through the new architecture
- behavior is unchanged or intentionally clarified

## Phase 3: Migrate Hebrew Structural Behavior

### Objective

Bring Hebrew onto the same architecture while preserving intentional
asymmetries.

### Work

- declare Hebrew period families explicitly
- route Hebrew structural expression through the shared policy
- preserve current intraday MVP behavior
- preserve current month/quarter asymmetries where they are intentional
- do not force Hebrew into false Gregorian symmetry

### Deliverable

- Hebrew uses the new architecture
- unresolved theory areas stay explicit rather than being hidden in bespoke code

## Phase 4: Unify Shared Expression Outputs

### Objective

Make the renderer consume more uniform policy outputs.

### Work

- reduce special-case rank logic in structural layer files
- unify tick/span expression output shapes
- centralize lane / prominence / labeling responsibilities where practical
- identify where explicit exceptions still remain

### Deliverable

- clearer seam between structural declaration and rendering

## Phase 5: Life-Relative Structural Entry Point

### Objective

Create the first true structural foothold for life-relative without solving the
entire life-relative system.

### Work

- define the first life-relative period families
- surface interpretation / granularity settings in controls
- choose the first structural scale to implement
  - likely day, week, month, or year
- keep annotations as a separate personal data layer

### Deliverable

- life-relative is no longer only marker augmentation conceptually or
  architecturally

## Phase 6: Cleanup And Deletion Pass

### Objective

Remove old policy logic only after the new path is proven.

### Work

- delete obsolete bespoke rank logic
- tighten names and seams
- remove transitional bridge logic
- update docs to reflect the new architecture

### Deliverable

- cleaner codebase
- fewer dual systems lingering

## Migration Order Recommendation

Recommended order:

1. branch and prepare
2. core types / policy skeleton
3. Gregorian migration
4. Hebrew migration
5. unified rendering seam cleanup
6. first life-relative structural entry
7. deletion and cleanup

This order minimizes risk and uses the most stable calendar system as the first
proving ground.

## Risk Areas

### 1. Losing Product Fidelity While Generalizing

The biggest risk is replacing real behavior with an abstraction that is too
clean to express it.

Mitigation:

- preserve the matrix as validation
- migrate incrementally
- keep exceptions explicit when needed

### 2. Overfitting Shared Policy To Gregorian

Gregorian is the easiest first migration, but the shared layer must not assume
Gregorian-normal behavior everywhere.

Mitigation:

- test Hebrew against the architecture, not against Gregorian symmetry
- preserve intentional asymmetry where it is product-real

### 3. Refactor Scope Creep

This work could easily expand into:

- visual redesign
- life-relative feature implementation
- full deep-time theory
- multi-structure coexistence UI overhaul

Mitigation:

- keep each phase sharply scoped
- treat later product frontiers as later phases

### 4. Span Logic Lagging Behind Tick Logic

We already know span theory is less mature than tick theory.

Mitigation:

- model period families as inherently having both boundary and interval
  expression
- do not let spans become a forgotten afterthought in the new policy layer

## Verification Strategy

### During Refactor

After each phase:

- run unit tests
- run build
- run e2e
- do targeted visual review on affected scales

### Matrix Validation

Use the current matrix as a baseline during migration.

After the refactor:

- generate a new matrix
- compare old and new matrices
- identify:
  - preserved behaviors
  - intentional changes
  - remaining gaps

This comparison should be a formal success-assessment step, not an afterthought.

## What To Preserve Strictly

These should be treated as high-confidence current behaviors unless explicitly
changed:

- Gregorian day/week/month/year label behavior
- current DST handling in Gregorian intraday labels
- Hebrew intraday MVP behavior
- promoted span label MVP behavior
- responsive controls and interaction behavior unless directly affected

## What Is Most Likely To Change

- internal rank logic and naming
- how tick prominence is calculated
- how span visibility is decided
- how expression decisions are centralized
- the internal architecture of structural layers

## Suggested Immediate Next Step

Before implementation:

1. confirm this refactor plan
2. decide branch timing
3. choose the exact first migration target inside Gregorian

My recommendation:

- branch right before Phase 1 begins
- and make Gregorian week/month/year the first proving slice inside the new
  shared policy system

Those scales are the best balance of:

- strong existing behavior
- cross-calendar importance
- manageable complexity
