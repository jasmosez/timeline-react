# Timeline React Architecture Note

## Purpose

This note describes the current architecture, the main technical constraints in
the existing implementation, and the recommended direction for the next round of
refactoring.

It is intentionally near-term. The goal is not to fully design the end-state of
the product, but to establish abstractions that support:

- a stronger Phase 1 timeline engine
- future multi-layer calendar rendering
- support for both ticks and spans
- eventual continuous or semi-continuous zoom behavior

## Architectural North Star

The app should treat continuous time as the canonical substrate and render
multiple interpretations on top of it.

In practical terms:

- timestamps remain the source of truth for positioning
- the viewport defines what part of time is visible
- zoom defines visible scale, not a separate rendering system
- calendar systems become layers that annotate or segment the same underlying
  time range
- points and spans share the same placement model
- `now` is an important marker within the timeline, not the definition of the
  viewport itself

This keeps navigation, rendering, and imported data aligned around one model.

## Current Implementation

### Main State

Today, [src/App.tsx](/Users/jms/code/timeline-react/src/App.tsx) owns:

- `now`
- `viewport`
- `birthDate`
- `activeLayerIds`
- shared timeline environment data passed to layers

The most important current shift is that `focusTimeMs` inside the viewport is
now the primary navigation driver. A leading `startTickDate` is still derived
for structural labeling and readouts, but it no longer drives pan behavior.

The next likely shift is similar for zoom: `visibleDurationMs` will likely
become the primary zoom state, while named scale bands become derived
interpretations of that duration.

### Current Architecture Shape

The current implementation already has several important seams in place:

- a real viewport object in app state
- a layer registry and active layer selection in app state
- shared timeline environment data passed to layers
- normalized point and span primitives
- a layout step that positions semantic primitives against the visible range
- a dedicated animation hook that separates zoom-transition state from ordinary
  pan updates

This means the code is no longer organized around “render ticks directly from a
single monolithic zoom config.” It is already partway into the intended engine
shape.

### Rendering Flow

The current rendering pipeline is roughly:

1. `App` computes viewport state, active layers, and the shared environment.
2. `Timeline` builds a `LayerRenderContext` from `zoom`, `focusTimeMs`, and the
   current `startTickDate`.
3. Active layers generate semantic points and spans for the current buffered
   time range.
4. Layout helpers convert those semantic items into positioned render objects.
5. `Tick`, `Span`, and `NowTick` render the positioned objects.

Most of the timeline domain logic now lives in focused modules under
[src/timeline](/Users/jms/code/timeline-react/src/timeline) rather than one
utility file.

The current code path is roughly:

- `App` owns viewport state, layer selection, and environment
- `Timeline` orchestrates layer rendering for the current viewport
- active layers generate semantic points and spans
- layout helpers convert those into positioned render objects
- point and span view components render the final DOM elements

For now, the default structural rendering path is still Gregorian-backed. That
is intentional for the current phase: the interaction and viewport model are
being generalized faster than the structural segmentation rules.

### Strengths of the Current Prototype

- It already proves the core visual metaphor.
- Scroll-based pan now feels much closer to free exploration than button-only
  navigation did.
- Discrete zoom levels make the product legible early.
- Time is already positioned continuously within the visible screen span.
- The app has a first example of alternate time interpretation via
  birthday-relative counters and anniversary markers.
- Some views already behave more like "show the current containing period" than
  "center directly on now."

### Current Architectural Frictions

The current model is good for a prototype but will get harder to extend.
Key issues:

- scale config still carries Gregorian assumptions around boundaries and label
  formatting
- `startTickDate` is still a useful structural anchor, but its role should stay
  secondary to `focusTimeMs`
- `NowTick` is still special-cased outside the layer system
- zoom interaction remains discrete even though pan is now continuous
- label strategy is still tuned more for static views than for fluid motion
- current scale definitions are still backed by Gregorian default structure,
  even though the long-term model should allow other layers to become primary
  at the same visible duration
- the layout now assumes a real left rail plus a reserved left gutter for the
  persistent `now` label, but responsive/mobile adaptations are still ahead

## Recommended Direction

## 1. Continue the Explicit Viewport Model

The viewport model is now in place, and it should remain the center of gravity
for future navigation work.

Suggested shape:

```ts
type ScaleLevelId = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'decade'

type Viewport = {
  focusTimeMs: number
  scaleLevel: ScaleLevelId
  rangeStrategy: 'centered' | 'currentContainingPeriod'
}
```

This can later expand if needed:

```ts
type Viewport = {
  focusTimeMs: number
  scaleLevel: ScaleLevelId
  rangeStrategy: 'centered' | 'currentContainingPeriod'
  interactionMode?: 'live' | 'exploring'
}
```

Why keep this as the primary model instead of drifting back toward structural
tick anchoring?

- viewport behavior becomes explicit rather than implicit
- zooming around a focal point becomes conceptually cleaner
- recentering on now becomes one possible viewport operation
- scroll and drag interactions map naturally to moving the viewport
- a future continuous zoom model can preserve the same conceptual focus
- "show the current week/month/period" remains possible without pretending the
  view is literally centered on now

For the current implementation, discrete scale levels still derive a structural
visible range from this viewport.

Examples:

- week view may use `rangeStrategy: 'currentContainingPeriod'` with the visible
  range derived from the current Gregorian week
- a recentered exploration mode may use `rangeStrategy: 'centered'`

### Next Zoom Step: Continuous Duration with Derived Scale Bands

The next likely experiment should make zoom more like pan: continuous in the
underlying viewport model, while still using named scale bands as derived
interpretations.

Suggested direction:

```ts
type Viewport = {
  focusTimeMs: number
  visibleDurationMs: number
  rangeStrategy: 'centered' | 'currentContainingPeriod'
}

type ActiveScaleBand = {
  scaleLevel: ScaleLevelId
  transitionProgress: number
}
```

In this model:

- `visibleDurationMs` becomes the primary zoom state
- named scale bands are derived from the current duration
- band changes can begin as threshold-based structural swaps
- later, adjacent bands may crossfade or progressively reveal labels

The current codebase now uses this simpler threshold-swap approach rather than
trying to animate between incompatible structural snapshots. That is a better
interim architecture: honest visual swaps now, smoother band-transition
treatments later.

For the first prototype of this model, the structural defaults can remain
Gregorian-backed. That is a useful interim step, not the final architectural
destination.

## 2. Continue Separating Scale from Calendar Interpretation

This separation has started, but it is not complete.

This distinction matters because scale is not the same thing as period identity.
A "month-scale" view should not be hard-coded to mean a Gregorian month. It is
better understood as a view sized for month-like navigation and label density.

### Scale Definition

This answers:

- how much time is visible at this zoom level or scale?
- what visual density is reasonable?
- what baseline navigation step is appropriate?

Example:

```ts
type ScaleDefinition = {
  id: ScaleLevelId
  visibleDurationMs: number
  targetTickCount: number
  defaultPanStepMs?: number
}
```

### Layer-Specific Segmentation and Labeling

This answers:

- where are meaningful boundaries in the current range?
- how should those boundaries be labeled?
- which markers or spans are important at this scale?

Gregorian, birthday-relative, Hebrew, and future astrology logic should live
here rather than inside one global scale config.

However, the next continuous-zoom experiment does not need to solve that split
perfectly. It is acceptable for the current scale bands to keep using
Gregorian-backed structural defaults while the viewport and interaction model
become duration-driven.

This means:

- all scales can remain globally available
- different layers may surface different meaningful boundaries at the same scale
- one layer may be visually primary without owning navigation itself
- future 7-year or shmita-style cycles can be introduced as layer-defined
  structures first, and only later become dedicated scale presets if useful

## 3. Standardize Render Primitives

The timeline should render a small set of canonical item types rather than
special-casing each feature.

Suggested primitives:

```ts
type TimelinePoint = {
  id: string
  kind: 'tick' | 'marker' | 'zman' | 'event-start'
  timeMs: number
  label?: string
  lane?: string
  priority?: number
  styleVariant?: string
}

type TimelineSpan = {
  id: string
  kind: 'event' | 'note-range' | 'calendar-window' | 'relationship' | 'semester'
  startMs: number
  endMs: number
  label?: string
  lane?: string
  priority?: number
  styleVariant?: string
}
```

Rendering then becomes:

- points are positioned with one time-to-screen function
- spans are positioned with the same function applied to start and end
- layers contribute items
- the viewport decides whether items are visible

Important distinction:

- some spans are structural periods derived from a layer or calendar system
- other spans are authored data such as notes, events, or life periods

Not every structural period needs to be stored as a persistent object. For
example, days and weeks can usually be derived when needed, and annotations can
later attach to those derived periods or to equivalent explicit ranges.

This is the main step that unlocks events, custom spans, zmanim, and future
astrological windows without redesigning the renderer each time.

## 4. Evolve the Layer Interface

The product vision depends on multiple simultaneous interpretations of the same
time range. That is now explicit in code, but the interface is still an early
version.

Current shape, conceptually:

```ts
type LayerContext = {
  viewport: Viewport
  nowMs: number
  birthDate?: Date
  timezone?: string
  location?: {
    latitude: number
    longitude: number
  }
}

type TimelineLayer = {
  id: string
  label: string
  getPoints: (context: LayerContext) => TimelinePoint[]
  getSpans: (context: LayerContext) => TimelineSpan[]
}
```

Current implemented layers:

- Gregorian layer
- birthday marker layer behavior

Future layers:

- fuller birthday-relative structural layer behavior
- Hebrew layer
- astrology layer

The key current lesson is that not every layer is the same kind of layer.
Some are primarily segmentation-style, while others are marker-style. A single
system may eventually need to do both.
- imported calendar layer
- notes/journaling layer

This layer model should stay lightweight. The goal is not full plugin-style
extensibility yet, only a clean seam between interpretation logic and rendering.

It should also allow grouped but independently toggleable overlays. For example,
the Hebrew family may eventually include separate render layers or sublayers for:

- Hebrew date boundaries
- Hebrew holidays
- zmanim points
- zmanim windows

The UI may present these as one grouped section while the underlying rendering
model keeps them separable.

## 5. Treat Interaction as Viewport Mutation

Phase 1 should establish a simple rule:

all navigation is expressed as changes to the viewport

Examples:

- scroll moves `focusTimeMs`
- drag moves `focusTimeMs`
- zoom in/out changes `zoomLevel`
- recenter may set `focusTimeMs` back to `now`

This matters because it keeps button controls, trackpad interactions, keyboard
shortcuts, and future gesture systems aligned on one mental model.

## 6. Prepare for Continuous Zoom Without Requiring It Now

There is a real design question about whether Phase 5 should be folded into
Phase 1. The recommendation here is:

- do not implement continuous zoom yet
- do design Phase 1 around abstractions that will not block it later

That means:

- use an explicit focus-based viewport instead of tick-anchored navigation
- separate scale definition from layer labeling
- avoid tying rendering to a fixed number of discrete tick generators
- keep time-to-screen math generic

Discrete zoom levels can remain the product behavior for now, but the internals
should start looking like a scalable navigation system rather than a collection
of mode-specific cases.

## Proposed Component Direction

One likely direction after refactor:

### `App`

Owns app-level state:

- viewport
- live clock
- user settings
- enabled layers

### `TimelineSurface`

Owns the visible timeline canvas and interaction handling:

- wheel/scroll input
- drag input
- layout measurements
- item rendering

### `TimelineRenderer`

Responsible for rendering points and spans from normalized item data.

### `layers/*`

Each layer owns its segmentation, labels, metadata, and special markers.

### `time/*`

Shared date math and viewport math:

- visible range calculation
- time-to-percent conversion
- scale definitions
- tick density heuristics

### `panels/*`

UI components such as settings, metadata, controls, and future note editors.

This does not need to be implemented all at once, but it is a useful direction
for moving logic out of one growing `utils.tsx`.

## Label Density and Priority

The timeline will eventually need label selection logic similar in spirit to map
systems. Not every potential label should render at every scale.

Near-term guidance:

- layers should be allowed to emit more candidate labels than are shown
- the renderer or a label-selection stage should decide which labels survive
- priority should be explicit on render items
- primary versus secondary layer emphasis should affect label selection

This becomes especially important once Gregorian, birthday-relative, and Hebrew
information are shown together.

## Layer Roles

Not all layers are the same kind of layer.

An important distinction that emerged during implementation is the difference
between segmentation-style layers and marker-style layers.

### Segmentation-Style Layers

These define the structural shape of time in a given view.
They are responsible for boundaries and the periods between them.

Examples:

- Gregorian tick boundaries
- structural spans between Gregorian ticks
- future birthday-relative day or week boundaries
- future Hebrew day, month, or year boundaries

In the current codebase, this role is mostly expressed through:

- `TimelinePoint` with `kind: 'tick'`
- `TimelineSpan` with `kind: 'structural-period'`

### Marker-Style Layers

These annotate the timeline with notable instants or windows without defining
the primary structural segmentation.

Examples:

- the current moment (`now`)
- birthday anniversaries
- future holidays
- future sunrise, sunset, or zmanim markers
- future astrological transit instants

In the current codebase, this role is mostly expressed through:

- `TimelinePoint` with `kind: 'marker'`

### Mixed Systems

One timekeeping system may eventually play both roles.

For example:

- Gregorian time is currently acting as a segmentation-style layer
- the birthday layer is currently implemented only as a marker-style layer
- birthday-relative time as a product concept is likely larger than that and may
  later define structural boundaries as well
- Hebrew time is also likely to need both segmentation and marker behavior

This means the current `TimelineLayer` interface is a good first seam, but it
may eventually need explicit subtypes or conventions for different layer roles.

## Spreadsheet-Like Data Entry Implications

The future note and planning model should be reflected in architecture early.

Implications:

- spans and annotations should be first-class data concepts
- buckets like day, week, weekend, and custom ranges should be representable
- editing should not depend on one visualization only
- the timeline should be able to render data that may also be edited in a more
  grid-like interface later

In other words, the data model should support both timeline-native interaction
and spreadsheet-inspired workflows.

## Special Considerations for Hebrew Time

Hebrew time should not be treated as “just another label formatter.”
It introduces real segmentation complexity:

- Hebrew dates do not align one-to-one with Gregorian dates
- day boundaries may depend on sunset rather than midnight
- zmanim introduce meaningful intra-day moments or windows

The layer model is intended to absorb this complexity without forcing the core
viewport or renderer to understand Hebrew calendar rules directly.

## Special Considerations for Astrology

Astrology is currently deprioritized, but the architecture should not rule it
out. It fits the shared model well:

- planetary placements can be represented as point-in-time metadata
- transits can produce moments or spans
- natal chart comparisons can be derived from birth data plus current instants

This is one reason the architecture should favor a general layer-and-item model
over calendar-specific special cases.

## Immediate Refactor Targets

The next implementation work should likely happen in this order:

1. Introduce a `Viewport` concept in code without changing visible behavior much.
2. Move scale definitions out of the current `ZOOM` monolith.
3. Extract shared time-to-screen math into a timeline utility module.
4. Introduce normalized point and span item types.
5. Refactor the current Gregorian tick generation to use those item types.
6. Add the first non-Gregorian layer behavior through the new interface.

This sequence keeps the prototype working while creating the seams needed for
future layers and interactions.

## Non-Goals for the Next Refactor

To keep momentum, the next refactor should not attempt to solve everything at
once.

Not yet:

- full continuous zoom
- full Google Calendar integration
- full note editor design
- full Hebrew sunset and zmanim UX
- astrology calculations
- spiral or cylindrical timeline layouts

The goal is to create the right base, not to finish the whole vision in one
pass.
