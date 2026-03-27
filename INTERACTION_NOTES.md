# Timeline React Interaction Notes

## Purpose

This note captures the current interaction direction for timeline navigation.
It is meant to guide prototyping and implementation work without pretending that
all interaction questions are fully settled.

## Current Direction

### Primary Navigation

The timeline should move through time via scrolling.

Current implementation:

- vertical scroll pans through time
- scrolling up moves forward in time
- scrolling down moves backward in time
- panning is driven by continuous updates to viewport `focusTimeMs`

This should become the primary way to explore the timeline.
Button-based pan controls may remain temporarily, but should become secondary.

### Primary Zoom

The preferred zoom gesture is pinch zoom.
As a practical desktop fallback, modifier-plus-wheel can also control zoom.

Current implementation:

- pinch zooms when available
- modifier + wheel zooms as a fallback
- buttons may remain during transition, but should become secondary controls
- zoom still moves between discrete scale levels
- zoom transitions are animated separately from pan motion

Next experiment direction:

- zoom should eventually change `visibleDurationMs` continuously
- named scale levels should become derived scale bands rather than hard modes
- threshold crossings may initially swap dominant structure before later gaining
  smoother crossfades or progressive reveal

### Viewport Behavior

The default interaction model should support free exploration.

Current implementation:

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

Current implementation:

- keep discrete scale levels
- make navigation between them feel fluid
- avoid committing to fully continuous zoom until the interaction prototype is
  tested

The near-term goal is to approach the feeling of map navigation and progressive
reveal without prematurely solving every continuous zoom problem.

The next recommended prototype is semi-continuous:

- `visibleDurationMs` changes continuously
- an active scale band is derived from the current duration
- Gregorian-backed structural defaults remain in place for the first pass
- later iterations can separate those bands more fully from Gregorian
  assumptions

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

## Current Learnings

- Continuous pan feels much better when the viewport moves through time
  directly, rather than stepping from one leading tick boundary to the next.
- Buffered off-screen generation is needed for both points and spans.
  Applying that strategy only to points produces visible gaps during fast pan.
- Pan and zoom should not share the same animation strategy. Continuous pan
  should feel immediate, while discrete zoom may still benefit from staged
  transitions.
- Label formatting that works well for static views can become noisy during
  motion. Label strategy will need another pass with fluid navigation in mind.
- The next zoom prototype should target the real desired paradigm rather than
  over-polishing the current step-only model.
- It is acceptable for the first continuous-zoom experiment to keep Gregorian
  default structure while the interaction model becomes duration-driven.

## Open Questions

- Should `now` eventually live inside the layer/marker system rather than as a
  special-case render element?
- Should live-follow behavior exist as a separate mode later?
- When should pointer-centered zoom replace or augment viewport-centered zoom?
- What is the right recenter affordance once scroll navigation becomes primary?
- How should label density adapt during faster, more fluid navigation?
- When should the project move from discrete zoom levels to semi-continuous or
  continuous zoom?
- When should scale bands stop relying on Gregorian-backed structural defaults?
