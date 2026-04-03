# Timeline React Project Plan

## Vision

Timeline React is a personal time interface built around a vertical timeline.
Its goal is to help a person interact with and understand time at multiple
scales, from seconds to years, through a beautiful, simple, and information-rich
view.

The product begins with a zoomable vertical timeline spanning:

- minute view with second-based ticks
- hour view with minute-based ticks
- day view with hour-based ticks
- week view with day-based ticks
- month view with day-based ticks
- quarter view with week- or month-based internal ticks depending on the active
  calendar structure
- year view with month-based ticks
- decade / shmita view with year-based ticks

Over time, the app should grow from a timeline viewer into a flexible personal
time system that supports multiple ways of measuring time, scheduled and lived
experiences, and richer interaction patterns.

## Product Goals

### 1. Make Time Legible

The interface should make the passage of time easier to see and feel.
The vertical timeline is not only a layout choice; it is the core metaphor.

### 2. Support Multiple Timekeeping Modes

Gregorian time is the baseline, but it is not the only lens.
The app should support at least three parallel ways of interpreting time:

- Gregorian calendar time
- birthday-relative time
- Hebrew calendar time

These modes should be able to coexist in the same view, be toggled on or off,
and eventually be promoted or demoted in visual priority.

### 3. Connect Planned Time and Lived Time

The product should show what is scheduled or expected as well as what actually
happened. This includes:

- event spans
- notes on days, weeks, weekends, weekdays, or custom spans
- forward-looking planning
- retrospective journaling

The data-entry experience matters here. The current spreadsheet prototypes are
an important reference point, and the eventual input model should feel direct,
fast, and intuitive rather than overly modal or heavy.

### 4. Keep the UI Simple

The interface should remain calm, beautiful, and easy to read even as the data
model grows more sophisticated.

## Design Principles

### Canonical Time Substrate

The application should use one continuous underlying time model for positioning
and navigation. Calendar systems such as birthday-relative time and Hebrew time
should behave as interpretation layers projected onto that shared substrate.

This should make it easier to:

- display multiple timekeeping systems at once
- keep rendering and navigation logic unified
- integrate event spans from external sources
- avoid duplicating view logic for each calendar system

### Timeline First

The timeline is the primary interaction surface. Controls, metadata, settings,
and overlays should support the timeline rather than compete with it.

The vertical orientation is deliberate. It creates label-density and layout
constraints because text is read more naturally along the horizontal axis, but
those constraints are part of the design challenge rather than a reason to
abandon the form.

### Progressive Complexity

The first experience should feel understandable with no setup.
Additional complexity should reveal itself only when needed through layers,
overlays, and settings.

### Smoothness Matters

Motion and navigation quality are part of the product, not polish to be added
at the end. Pan, zoom, scroll, and animated transitions should eventually feel
continuous and intuitive.

The long-term standard here is closer to map navigation than mode switching.
As in tools like Google Earth, what is visible and emphasized should evolve
smoothly with scale so that smaller narratives feel nested inside larger arcs.

### Distinct but Compatible Time Systems

Each timekeeping mode should expose its own labels, boundaries, metadata, and
notable moments, while still fitting into a shared rendering model.

### Alternative Spatial Representations

The vertical timeline is the initial visual metaphor, but it may not be the
only one. A future representation may wrap time around a cylinder or spiral so
that repeating boundaries line up vertically, such as:

- Sundays
- January 1st boundaries
- Rosh Hashanah across years

This would likely require some visual fudging at larger, uneven intervals, but
it is an important exploration path rather than an unrelated idea.

## Core Concepts

### 1. Instant

A single point in time on the canonical timeline.
Likely represented internally by a JavaScript `Date` or timestamp.

### 2. Viewport

The currently visible segment of the timeline.
This includes the current focal point and visible range. In the longer-term
model, visible duration may become more primary than a named zoom level.

### 3. Scale Level / Scale Band

A discrete representation of scale used by the current implementation.
Examples: minute, hour, day, week, month, quarter, year, decade.

Long term, these may become derived scale bands rather than primary state,
with continuous visible duration driving zoom behavior underneath.

### 4. Tick

A rendered marker that represents a boundary or interval within the active view.
Different calendar systems may contribute labels or annotations to the same
visible region.

### 5. Layer

A renderable interpretation of time.
Initial target layers:

- Gregorian layer
- birthday-relative layer
- Hebrew layer

Likely future layers:

- astrology layer
- twilight layer (civil, nautical, astronomical; morning and evening)
- Hebrew parsha / weekly Torah-portion contextual layer

A layer may provide:

- tick labels
- metadata
- boundaries
- special dates or moments
- event or annotation overlays

Not all layers will play the same role.
Some layers will primarily define structural segmentation, while others will
primarily add markers or annotations to the existing structure. Some systems may
eventually need to do both.

### 6. Span

A duration with a start and end time.
Examples:

- calendar events
- prayer windows
- note ranges
- weekend or weekday blocks
- journaling periods
- school semesters
- college as a whole
- romantic relationships
- any other user-defined life period

### 7. Annotation

User-authored content attached to a day, week, span, or other time bucket.
This may include plans, notes, journal entries, or summaries.

## Current State

The current app already demonstrates the basic product direction:

- a vertical timeline with free exploratory navigation
- discrete zoom levels from minute to decade
- scroll-based panning plus button fallbacks
- a configurable birth date
- life-relative day and week counters
- layered rendering for Gregorian structure and birthday markers
- app-level layer toggles
- explicit viewport state built around focus time
- normalized point and span rendering primitives

Known current limitations include:

- zoom animation behavior is still rough
- zoom is still driven by discrete scale levels rather than continuous visible
  duration
- label behavior during motion still needs design work
- `now` marker motion still needs cleanup so it feels correct and intentional
- the README does not yet describe the actual project
- timezone handling is minimal
- Gregorian label behavior is improving, but Hebrew label policy still needs a
  first real design pass
- the birth date settings UI currently captures only a date, not a full
  date-time with timezone intent
- marker-style and segmentation-style layers still share one lightweight
  interface
- spans are implemented structurally, but not yet as user-authored annotations

## Roadmap

### Phase 1: Strengthen the Timeline Engine

Goal: make the core timeline feel robust enough to support future product work.

Milestones:

- clarify viewport and zoom state responsibilities
- improve tick rendering and animation architecture
- replace button-only panning with scroll and/or drag interaction
- support smoother recentering and navigation behavior
- add an optional `Lock Now` navigation mode for live viewing
- introduce a proper span rendering primitive
- establish a cleaner styling and layout foundation
- make Phase 1 abstractions compatible with future continuous or semi-continuous
  zoom work
- prototype continuous visible-duration zoom with derived scale bands

Success looks like:

- the timeline is pleasant to navigate
- panning and zooming feel stable and predictable
- the rendering model can support both points and spans
- the architecture can support continuous zoom without assuming Gregorian
  structure is the only long-term possibility

Current progress:

- explicit viewport state is in place
- scroll-based panning is in place
- points and spans are first-class render primitives
- Gregorian structure and birthday markers both render through the layer system
- duration-driven zoom is in place with derived scale bands
- Phase 1 zoom polish is complete at the current fidelity level, using clean
  structural band switches rather than misleading transitional animation
- `Lock Now` is in place for live viewing, with manual pan returning the app to
  free exploration

### Phase 1.5: Add Regression Protection

Goal: protect the new timeline engine with a lightweight but durable test
foundation.

Milestones:

- add unit coverage for core time math and viewport derivation
- add a small browser-level suite for critical interaction behavior
- ensure important regressions like blocked controls are caught automatically
- establish a simple, sustainable testing workflow for future refactors

Success looks like:

- core timeline math is covered by unit tests
- a few high-value interactions are covered end-to-end
- future interaction work can move faster with less fear of silent regressions

### Phase 2: Formalize Timekeeping Layers

Goal: model multiple time systems without fragmenting the UI architecture.

Milestones:

- define a layer interface for labels, metadata, and boundaries
- extract Gregorian behavior into a first-class layer
- add birthday-relative calculations as a layer
- add Hebrew date conversion and display behavior
- decide how sunset-based day boundaries should be represented
- decide how zmanim should appear as points or spans
- keep room in the layer model for a future astrology layer without forcing it
  into the first implementation

Success looks like:

- multiple time systems can appear together in one view
- layers can be toggled or reprioritized cleanly
- core rendering does not depend on one calendar model

Current progress:

- the first layer interface exists
- Gregorian is the default structural layer
- birthday-relative rendering has begun in marker form, not yet structural form
- a Hebrew time adapter exists for sunset-aware date identity in Northampton /
  `America/New_York`
- Gregorian and Hebrew can both render as structural layers
- one primary calendar system can now drive anchored reset/current-period
  semantics
- dual-structure rendering is working with first-pass left/right label
  separation
- Gregorian label policy is being separated from generic scale-band mechanics,
  which should make Hebrew labeling cleaner to implement next
- a broad label-composition audit now exists and is guiding future normalization
  work across Gregorian and Hebrew
- the next active Phase 2 implementation focus is Hebrew day view and below,
  including the path toward honest intraday Hebrew time

Near-term sequencing:

- next: Hebrew day view and below
- after that: return to the broader label-composition normalization pass with
  the Hebrew intraday horizon clarified

Phase 2 notes:

- the `now` marker should eventually reflect the primary calendar system in its
  label treatment, not only Gregorian civil labeling
- Hebrew labeling will need a smarter, more expressive strategy as the Hebrew
  layer matures
- Hebrew sunset boundary times should eventually be optionally visible at
  broader scales such as week view
- Hebrew day-view labels will likely need density-aware suppression near
  high-attention areas such as the current moment
- Gregorian labeling should also evolve into a more sustainable dynamic-label
  system rather than relying on ad hoc special cases
- Gregorian week numbers should be introduced as an additional contextual data
  point after the current Hebrew labeling pass
- gestural zoom should move from viewport-centered behavior to pointer/cursor-
  based zooming during Phase 2 so direct manipulation feels more map-like
- optional 24-hour display mode is worth exploring later as a deliberate
  whole-app time-format choice, not an ad hoc label fix

### Phase 3: Add Notes and Planning Primitives

Goal: let the timeline hold meaning, not only structure.

Milestones:

- support annotations on days and weeks
- support note blocks on custom spans
- distinguish planned versus actual entries
- design compact, legible timeline representations for spans and notes
- define the first persistence format for annotations

Success looks like:

- the timeline can represent both schedule and reflection
- users can attach meaning to time buckets directly in the interface

### Phase 4: Add External Time Sources

Goal: enrich the timeline with imported and synchronized data.

Milestones:

- import Google Calendar events as spans
- map external events into the timeline data model
- support filtering and visual grouping of imported events
- explore importing spreadsheet-like planning and journaling data

Success looks like:

- real calendar data appears naturally in the timeline
- external events coexist with personal notes and alternate time layers

### Phase 5: Expand Navigation and Scale

Goal: move from a strong discrete prototype to a more fluid time interface.

Milestones:

- experiment with continuous or semi-continuous zoom
- extend zoom range beyond decade
- improve performance for dense views and long spans
- refine interaction design for advanced navigation
- smooth transitions between structural scale bands, including button-triggered
  HQ zoom interactions
- further separate scale bands from Gregorian-backed structural defaults when
  layer architecture is ready

Success looks like:

- the app feels more like a fluid time surface than a set of modes

## Immediate Product Questions

These are important, but they do not all need to be answered before coding
continues:

- What should be the primary navigation model: scroll, drag, trackpad gestures,
  keyboard shortcuts, or some blend?
- What exactly defines a birthday-relative week in the product?
- How should age in decimal years be calculated and displayed?
- How should Hebrew sunset boundaries be shown visually?
- Which location and timezone rules should drive sunrise, sunset, and zmanim?
- How should multiple layers compete for limited label space in tight views?
- What is the right first persistence model for notes and spans?
- What should a spreadsheet-inspired note and planning workflow look like in the
  product?
- Which Phase 5 ideas must be enabled early by Phase 1 architecture, and which
  can safely wait?
- Should the layer model eventually distinguish explicitly between
  segmentation-style layers and marker-style layers?
- When should continuous visible-duration zoom become primary state in the
  viewport?
- When should scale levels stop being Gregorian-backed defaults and become more
  fully layer-neutral?
- How should the layout adapt for mobile and smaller screens without fighting
  the long-term timeline-first design?

This section should also serve as a parking lot for open design questions that
do not yet block implementation.

## Suggested Near-Term Execution Plan

This is the recommended order for the next implementation work:

1. Document the current architecture and clean up the README.
2. Refactor the timeline into clearer navigation and rendering concepts.
3. Introduce span rendering support before external integrations.
4. Define a lightweight layer interface and migrate Gregorian logic into it.
5. Add birthday-relative layer behavior on top of that model.
6. Prototype semi-continuous zoom using visible duration plus derived scale
   bands.
7. Prototype Hebrew date overlays before tackling sunset and zmanim in depth.

## Documentation Strategy

The repo should gradually accumulate a small set of high-value context
documents, each with a distinct purpose:

- `PROJECT_PLAN.md` for product direction, principles, and roadmap
- an architecture note for current structure and near-term technical direction
- a refreshed `README.md` for project setup and a concise project overview
- additional focused notes only when they reduce ambiguity for future work

These documents should stay short, opinionated, and easy to revise.

## Working Agreement

To build strong shared context and make good design decisions, the project can
follow this collaboration pattern:

- use this document as the evolving source of truth for product direction
- discuss major architectural choices before hardening them into abstractions
- keep implementation work small and reviewable
- favor working software over premature generalization
- preserve room for design iteration, especially around interaction and layout

## Next Recommended Artifact

After this plan, the next useful artifact is a short architecture note that
describes the current React state model and proposes a path toward:

- viewport-based navigation
- layer-based time interpretation
- support for both ticks and spans
