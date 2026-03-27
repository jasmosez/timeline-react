# Timeline React Interaction Notes

## Purpose

This note captures the current interaction direction for timeline navigation.
It is meant to guide prototyping and implementation work without pretending that
all interaction questions are fully settled.

## Current Direction

### Primary Navigation

The timeline should move through time via scrolling.

MVP direction:

- vertical scroll pans through time
- scrolling up moves forward in time
- scrolling down moves backward in time

This should become the primary way to explore the timeline.
Button-based pan controls may remain temporarily, but should become secondary.

### Primary Zoom

The preferred zoom gesture is pinch zoom.
As a practical desktop fallback, modifier-plus-wheel can also control zoom.

MVP direction:

- pinch zooms when available
- modifier + wheel zooms as a fallback
- buttons may remain during transition, but should become secondary controls

### Viewport Behavior

The default interaction model should support free exploration.

MVP direction:

- the viewport moves freely through time
- `now` is not pinned to a fixed screen position
- `now` may leave the visible range
- recentering on `now` is an explicit action, not a constant default behavior

This keeps the model simple and aligns with the current architectural direction.

### Zoom Center

For MVP, zoom should center around the viewport center rather than the pointer.

Why:

- simpler to implement and reason about
- less surprising while interaction behavior is still being established
- easier to test before more advanced gesture behavior is introduced

Pointer-centered zoom remains a possible future improvement.

## Scale Transition Direction

The current product still uses discrete scale levels.
That remains acceptable for the next interaction prototype.

MVP direction:

- keep discrete scale levels
- make navigation between them feel fluid
- avoid committing to fully continuous zoom until the interaction prototype is
  tested

The near-term goal is to approach the feeling of map navigation and progressive
reveal without prematurely solving every continuous zoom problem.

## `now` Behavior

`now` is currently best understood as a marker-style element rather than part of
the structural segmentation.

Implications:

- `now` is important, but not the definition of the viewport
- `now` may eventually be governed by the same marker/overlay logic as other
  notable points
- `now` may eventually be toggleable or configurable independently

For MVP interaction work, `now` should remain visible when in range, but should
not constrain the viewport model.

## Interaction Philosophy

The long-term target is closer to map navigation than mode switching.

Desired characteristics:

- smooth movement through time
- scale changes that feel continuous even if underlying levels are discrete
- progressive reveal of information as scale changes
- a sense that small narratives are nested within larger arcs

Google Earth is a useful inspiration for this interaction philosophy.

## MVP Prototype Plan

The recommended next interaction prototype is:

1. Replace button-first panning with scroll-driven panning.
2. Add modifier-plus-wheel zooming.
3. Keep existing discrete scale levels.
4. Center zoom around the viewport center.
5. Keep recenter-on-now as an explicit control.
6. Observe where the interaction feels good versus where it breaks down.

This prototype should help answer:

- whether scroll-based time navigation feels natural
- whether discrete scales already feel sufficiently fluid with better gesture
  support
- where animation or label density problems become most noticeable
- whether pointer-centered zoom is needed soon or can wait

## Open Questions

- Should `now` eventually live inside the layer/marker system rather than as a
  special-case render element?
- Should live-follow behavior exist as a separate mode later?
- When should pointer-centered zoom replace or augment viewport-centered zoom?
- What is the right recenter affordance once scroll navigation becomes primary?
- How should label density adapt during faster, more fluid navigation?
- When should the project move from discrete zoom levels to semi-continuous or
  continuous zoom?
