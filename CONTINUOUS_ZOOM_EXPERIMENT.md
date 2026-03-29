# Continuous Zoom Experiment

## Purpose

This note describes the first semi-continuous zoom experiment for the current
timeline architecture.

The goal is not to implement the full end-state of continuous zoom. The goal is
to make zoom follow the same architectural direction that pan now follows:
continuous viewport state first, structural interpretation second.

## Desired Outcome

After this experiment:

- pan should remain continuous and stable
- zoom should be driven by continuous `visibleDurationMs`
- named scale levels should become derived scale bands rather than hard modes
- the timeline should still render one dominant Gregorian structural
  interpretation at a time
- threshold crossings between bands should feel informative, even if not yet
  elegant

This is intentionally Option A:

- smooth duration changes
- one dominant structural band at a time
- no adjacent-band crossfade yet

## Current Starting Point

Today the app already has the right general engine shape:

- `App` owns viewport state
- `focusTimeMs` drives navigation
- layers generate semantic points and spans
- layout positions those items against the visible range
- scroll pan is continuous

What is still discrete is zoom:

- viewport stores `scaleLevel`
- visible duration is derived from `SCALE_LEVEL_CONFIG[scaleLevel].screenSpan`
- Gregorian structure is generated from that active scale level
- wheel zoom changes scale level in steps

So the experiment is specifically about changing what zoom means, not about
replacing the rest of the rendering architecture.

## Proposed Viewport Model

### Current

```ts
type Viewport = {
  focusTimeMs: number
  scaleLevel: ScaleLevel
  rangeStrategy: 'centered' | 'currentContainingPeriod'
}
```

### Experiment

```ts
type Viewport = {
  focusTimeMs: number
  visibleDurationMs: number
  rangeStrategy: 'centered' | 'currentContainingPeriod'
}
```

Derived values:

```ts
type ActiveScaleBand = {
  scaleLevel: ScaleLevel
  transitionProgress: number
}
```

Important consequence:

- `visibleDurationMs` becomes the primary zoom state
- `scaleLevel` becomes a derived structural interpretation of the current
  duration

## Band Model

The current named scale levels remain useful, but their role changes.

Instead of meaning “the app is in this hard mode,” they become:

- duration bands
- presets
- default structural interpretations

For example:

- `day` band remains associated with day-scale navigation
- its default Gregorian structure may still use hour ticks
- as visible duration shrinks toward hour-scale, the active band eventually
  shifts to `hour`

This lets us say:

- users zoom continuously
- the app derives which scale band is currently dominant

## Deliberate Interim Constraint

For this first experiment, the dominant structural interpretation should remain
Gregorian-backed.

That means:

- scale bands are still mapped to Gregorian default structure
- Hebrew, birthday-relative, and future layers remain overlays for now
- we do not solve multi-calendar structural competition in this slice

This is acceptable because the main thing being tested is the interaction and
viewport model, not the final layer hierarchy.

## Implementation Sketch

### 1. Add duration-driven viewport state

Update [src/viewport.ts](/Users/jms/code/timeline-react/src/viewport.ts):

- replace `scaleLevel` in `Viewport` with `visibleDurationMs`
- initialize it from the current starting scale level preset
- keep `focusTimeMs` and `rangeStrategy` unchanged

Needed helpers:

- `getInitialVisibleDurationMs()`
- `getViewportVisibleRange(viewport)`

### 2. Turn scale config into band presets

Update [src/timeline/scales.ts](/Users/jms/code/timeline-react/src/timeline/scales.ts):

- keep the existing preset data as band definitions
- continue using current Gregorian-backed durations and interval rules
- add helpers such as:

```ts
getScaleBandPresets()
getNearestScaleLevel(visibleDurationMs)
getScaleBandBounds(scaleLevel)
getScaleBandProgress(visibleDurationMs)
```

For the first pass:

- nearest-band derivation is enough
- `transitionProgress` can be computed but not yet used widely

### 3. Make visible range depend on duration directly

Update range/layout helpers:

- `getVisibleTimeRange(...)` should accept `visibleDurationMs` directly
- `getPointPercent(...)` should derive from `focusTimeMs + visibleDurationMs`
- layout should stop treating scale presets as the source of visible duration

This is the core architectural move.

### 4. Derive the active scale band in `App`

Update [src/App.tsx](/Users/jms/code/timeline-react/src/App.tsx):

- derive `activeScaleLevel` from `viewport.visibleDurationMs`
- derive `startTickDate` from `activeScaleLevel + focusTimeMs + rangeStrategy`
- pass both:
  - continuous viewport data
  - derived active scale band

This keeps `App` as the source of truth for the current viewport.

### 5. Change wheel zoom to update duration instead of scale level

Still in [src/App.tsx](/Users/jms/code/timeline-react/src/App.tsx):

- replace stepwise zoom updates with multiplicative duration changes
- keep viewport center stable during the change

Example conceptual behavior:

- wheel/pinch in -> reduce `visibleDurationMs`
- wheel/pinch out -> increase `visibleDurationMs`

The main choice here is the zoom factor per input increment.
That should be tuned experimentally, not over-designed in advance.

### 6. Keep Gregorian generation keyed to derived active band

Update [src/timeline/gregorian.ts](/Users/jms/code/timeline-react/src/timeline/gregorian.ts):

- continue generating one dominant structural layer at a time
- use derived `activeScaleLevel` for interval/boundary rules
- use `visibleDurationMs` for range positioning and buffering

In other words:

- structure still comes from the band
- visibility and motion come from continuous duration

### 7. Keep zoom animation minimal in the first pass

Update [src/hooks/useAnimatedTimelineState.ts](/Users/jms/code/timeline-react/src/hooks/useAnimatedTimelineState.ts):

- this hook will likely need to animate between visible durations rather than
  between scale levels
- for the first pass, keep the transition model simple
- do not try to crossfade adjacent bands yet

This experiment is mainly about:

- continuous zoom input
- derived structural bands
- usable threshold transitions

It is not yet about polished band blending.

## What Stays Out of Scope

This experiment should explicitly avoid trying to solve:

- full continuous multi-interval rendering
- crossfading adjacent scale bands
- Hebrew or birthday structural segmentation
- label-priority redesign across multiple active structural systems
- pointer-centered zoom

Those are all valid later steps, but they are not required to validate the
core shift from discrete zoom state to continuous visible duration.

## Success Criteria

This experiment is successful if:

- zoom input feels continuous rather than stepped
- pan remains stable
- the active scale band changes in understandable places
- the app remains structurally legible across band transitions
- the implementation leaves room for later adjacent-band blending

## Likely Follow-up Steps

If the first pass works, the next most likely steps are:

1. add `transitionProgress`-aware visual behavior near band boundaries
2. crossfade adjacent Gregorian structural bands near thresholds
3. redesign label strategy for dynamic motion
4. revisit whether scale bands should remain globally Gregorian-backed or begin
   accepting stronger layer-specific structural overrides

## Practical First Slice

If we want the smallest meaningful implementation slice, it should be:

1. replace `viewport.scaleLevel` with `viewport.visibleDurationMs`
2. derive `activeScaleLevel` from duration
3. update pan/positioning helpers to use duration directly
4. update wheel zoom to change duration continuously
5. keep Gregorian structure keyed to derived `activeScaleLevel`

That is the smallest slice that meaningfully tests the desired paradigm.
