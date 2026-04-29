# Gregorian Policy-Driven Rendering Overview

## Purpose

This document describes the current end-to-end rendering model for the Gregorian structural calendar after the structural expression policy refactor.

It is intended to answer:

- what happens from viewport input to rendered ticks/spans
- where policy is now authoritative
- where legacy fallback seams still exist
- where simplification still feels desirable

## Top-Level Flow

The current Gregorian rendering path has five main layers:

1. **Family ownership**
2. **Family-level policy**
3. **Instance variance**
4. **Label rendering**
5. **Final positioned rendering**

At a high level:

- `gregorian.ts` decides which Gregorian family owns each tick or span
- `structuralExpressionPolicy.ts` decides how that family should express itself at the current scale
- instance variance adjusts dense Gregorian families like seconds, minutes, and hours
- `gregorianLabels.ts` renders the final label text for the declared strategy
- `layout.ts` positions the point/span visually

## 1. Family Ownership

File:
- [gregorian.ts](/Users/jms/code/timeline-react/src/timeline/gregorian.ts)

The main ownership function is:
- `getGregorianPointFamilyId(scaleLevel, tickTime)`

This implements the current "default upward" rule:

- a tick belongs to the highest-order active Gregorian family that owns that instant

Examples:

- **Minute view** (`scaleLevel === -1`)
  - ordinary second -> `second`
  - top of minute -> `minute`
  - top of hour -> `hour`
  - midnight -> `day`

- **Hour view** (`scaleLevel === 0`)
  - ordinary minute -> `minute`
  - top of hour -> `hour`
  - midnight -> `day`

- **Day view** (`scaleLevel === 1`)
  - ordinary hour -> `hour`
  - midnight -> `day`
  - Sunday midnight -> `week`

- **Week view** (`scaleLevel === 2`)
  - ordinary day -> `day`
  - Sunday -> `week`
  - first of month -> `month`

- **Month view** (`scaleLevel === 3`)
  - ordinary day -> `day`
  - Sunday -> `week`
  - first of month -> `month`
  - quarter-start month boundary -> `quarter`

- **Quarter view** (`scaleLevel === 4`)
  - regular generated ticks are `week`
  - separately generated month/quarter helper ticks are assigned `month` or `quarter`

- **Year view** (`scaleLevel === 5`)
  - month start -> `month`
  - January -> `year`
  - separately generated quarter helper ticks are `quarter`

- **Decade view** (`scaleLevel === 6`)
  - years -> `year`
  - decade boundaries -> `decade`

Span ownership is similar but simpler:
- `getGregorianSpanFamilyId(scaleLevel)`

## 2. Family-Level Policy

File:
- [structuralExpressionPolicy.ts](/Users/jms/code/timeline-react/src/timeline/structuralExpressionPolicy.ts)

Gregorian policy lives in:
- `GREGORIAN_EXPRESSION_DECLARATION`

The important pieces are:

- `activeSpanKindByScale`
  - which family owns the span layer at a given scale

- `tickPolicyByScale`
  - which families are active at a given scale
  - what label strategy they use
  - what transitional rank class they use

The shared entrypoint is:
- `getStructuralExpressionDecision(family, input)`

This returns a `StructuralExpressionDecision` containing:

- `tickState`
- `spanState`
- `showLabel`
- `labelStrategy`
- `tickRankClass`
- `prominence`

At this point, Gregorian policy is authoritative for:

- calm-scale family visibility
- calm-scale label strategy
- calm-scale rank intent
- dense-view baseline family behavior
- span visibility by scale

## 3. Instance Variance

File:
- [structuralExpressionPolicy.ts](/Users/jms/code/timeline-react/src/timeline/structuralExpressionPolicy.ts)

Dense Gregorian families still need intra-family variation.

Current instance-variance families:

- `second`
  - `five-second`

- `minute`
  - `five-minute`

- `hour`
  - `third-hour`

The relevant functions are:

- `getStructuralTickInstanceVariantId(...)`
- `getStructuralTickInstanceDecision(...)`

Current use:

- in `gregorian.ts`, instance variance is applied only for:
  - minute view on the `second` family
  - hour view on the `minute` family
  - day view on the `hour` family

This means:

- family ownership decides the baseline structural meaning
- instance variance only modulates the dense cadence inside that family

That is a major improvement over older logic, where cadence and structural meaning were more mixed together.

## 4. Label Rendering

Files:
- [gregorian.ts](/Users/jms/code/timeline-react/src/timeline/gregorian.ts)
- [gregorianLabels.ts](/Users/jms/code/timeline-react/src/timeline/gregorianLabels.ts)

The policy-aware bridge is:
- `getGregorianPolicyAwareTickLabel(...)`

Its logic is:

- if policy provides a Gregorian `labelStrategy`, use `renderGregorianStructuralLabelStrategy(...)`

### Policy-Driven Label Path

`renderGregorianStructuralLabelStrategy(...)` is now the main policy-driven renderer.

Examples:

- `minute-view-five-second`
- `minute-view-minute-boundary`
- `hour-view-hour-boundary`
- `day-view-week-boundary`
- `week-view-month-boundary`
- `quarter-view-month-boundary-leading`
- `year-view-year-boundary`

This function now directly renders almost all migrated Gregorian label roles.

### Remaining Fallback Hub

The main remaining legacy seam is:

This is no longer the main source of truth, but it still acts as:

- a compatibility surface for tests and older callers
- a fallback for any non-policy path

It is now smaller in practical importance than it used to be, because:

- month-view policy no longer routes back through it for its primary renderer path
- year-view policy no longer routes back through it for year boundary rendering

### Smaller Render Helpers That Still Make Sense

The following still feel good and useful:

- `getGregorianMinuteTickLabel(...)`
- `getGregorianHourTickLabel(...)`
- `getGregorianDayTickLabel(...)`
- `getGregorianWeekTickLabel(...)`
- `getGregorianMonthTickLabel(...)`
- `getGregorianSupportingMonthTickLabel(...)`
- `getGregorianQuarterWeekTickLabel(...)`
- `getGregorianQuarterBoundaryLabel(...)`
- `getGregorianYearBoundaryLabel(...)`
- `getGregorianDecadeTickLabel(...)`

These are not all "legacy" in a bad sense.
Most of them are now better understood as renderer helpers for already-declared behavior.

## 5. Final Rendering

File:
- [gregorian.ts](/Users/jms/code/timeline-react/src/timeline/gregorian.ts)

Final tick rendering happens in:
- `addPositionedTicksForScaleLevel(...)`
- `addQuarterBoundaryTicks(...)`
- `addYearQuarterBoundaryTicks(...)`

For each tick:

1. determine owning family
2. compute family-level policy decision
3. optionally apply instance variance
4. skip if hidden
5. render label text from policy-aware renderer
6. augment personal-time labels if the personal layer is active
7. apply class names and opacity
8. position the point

Spans follow a simpler path:

1. determine span family
2. compute family-level policy decision
3. skip if hidden
4. generate raw spans with layout helpers
5. apply stripe, side, opacity, metadata

## Current State of Authority

### Policy Is Clearly Authoritative For

- family ownership meaning
- baseline visibility for migrated Gregorian scales
- label strategy for migrated Gregorian scales
- transitional rank intent for migrated Gregorian scales
- dense cadence instance variance for second/minute/hour families

### The Renderer Still Owns

- exact string composition
- locale/date formatting details
- week/quarter formatting helpers
- DST-sensitive hour/minute display nuances

This split feels healthy.

## Remaining Transitional Seams

### 1. `tickRankClass`

This is still a migration adapter, not the final expression model.

It is useful now because:

- it lets policy control old visual channels without rewriting all CSS/rendering semantics

But long-term it likely wants to give way to a more explicit prominence/expression model.

### 2. Legacy Compatibility Note

This is still the main Gregorian compatibility hub.

It is no longer as dangerous as it once was, but it still exists as:

- a big scale-switch function
- a public test surface
- a fallback path when no policy strategy is used

This is the most obvious remaining Gregorian legacy seam.

### 3. Special Helper Generators

These still exist:

- `addQuarterBoundaryTicks(...)`
- `addYearQuarterBoundaryTicks(...)`

They are policy-aware now, which is good.
But they are still special generators rather than a unified emission model.

This is probably acceptable for now.

### 4. Leading vs Supporting Split

There are still two layers of role handling:

- **semantic/content role**
  - encoded in policy when wording changes by role

- **visual role**
  - encoded in class names and render-time label/side treatment

This is not necessarily wrong, but it is still more visible than ideal in the code.

## Simplification Opportunities

### Worth Doing Soon

1. **Keep shrinking legacy compatibility seams**
   - especially any branches whose behavior is already fully represented by policy strategies

2. **Clarify role semantics**
   - possibly by making "role in view" more explicit as a concept, even if styling remains downstream

3. **Eventually reduce `tickRankClass` dependence**
   - once a better prominence/expression model is ready

### Probably Not Worth Doing Yet

1. **Eliminating label modules entirely**
   - they still serve a good role as renderer/formatter layers

2. **Forcing all special helper generators into one universal emission engine**
   - likely too much complexity for too little payoff right now

3. **Removing every fallback seam**
   - a small compatibility/render seam is acceptable
   - the real goal is to remove fallback seams that still own product truth

## My Current Read

Gregorian is now in a much better place than before the refactor.

The core architecture is:

- family ownership
- policy decision
- optional instance variance
- renderer strategy
- positioned output

That is a coherent model.

The main remaining Gregorian cleanup target is no longer "make policy real."
It is:

- reduce the remaining size and importance of the compatibility hub
- while keeping the renderer layer healthy and readable

If we keep simplifying, I think the next best question is:

- when is a separate compatibility seam no longer worth preserving at all?
