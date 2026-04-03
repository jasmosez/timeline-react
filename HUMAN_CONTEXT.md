# Human Context and Current System Map

## Purpose

This is a living re-entry document.
It is meant to help a human collaborator regain confidence quickly when the
project starts to feel too large to keep fully in working memory.

This document should stay short, current, and practical.
It is not a replacement for the deeper architectural docs.
It is the fast map.

Recommended maintenance rule:

- refresh this after major Phase 2 slices
- refresh it after any substantial architecture or visual-system cleanup
- prefer updating this over writing long chat recaps from scratch

## What the Product Is

Timeline React is a vertical personal time interface.
It is trying to make time legible across multiple scales and multiple calendar
systems in one continuous interactive surface.

Current structural systems:

- Gregorian
- Hebrew

Current non-structural personal overlay:

- birthday marker layer

Core product qualities being pursued:

- information-rich but calm
- zoomable and pannable like a map
- multiple time systems on one shared substrate
- beautiful enough that visual details are part of the product, not an afterthought

## Current System Map

### 1. Canonical Time Substrate

Everything is positioned on one continuous time axis.
Calendar systems interpret that substrate rather than replacing it.

### 2. Viewport Model

The viewport is driven by:

- `focusTimeMs`
- `visibleDurationMs`
- `rangeStrategy`

`rangeStrategy` currently has two meaningful modes:

- `currentContainingPeriod`
  anchored mode
- `centered`
  exploratory mode

### 3. Calendar Semantics

The app distinguishes:

- `leadingCalendarSystemId`
  which calendar governs anchored/current-period semantics
- visible structural layers
  which structural systems are actually shown

This distinction matters and should be preserved.

### 4. Rendering Model

Layers generate:

- points
- spans

These are combined, positioned, and rendered onto the shared timeline.

Current important layer roles:

- structural layers:
  Gregorian, Hebrew
- personal overlay layer:
  birthday
- reference marker:
  `now`

### 5. Presentation Model

The timeline presentation system has its own concepts.
These are presentation concepts, not data-model concepts.

Named lanes:

- reference lane
  `now`
- leading structural lane
  left-side labels for the leading visible structural system
- supporting structural lane
  right-side labels for the supporting visible structural system
- personal overlay lane
  birthday and future personal overlays
- context lane
  sticky top/bottom context labels

Tick rank:

- `primary`
- `secondary`
- `ordinary`

For now, tick rank affects tick length only.

### 6. File-Level Mental Map

Useful “where things live” summary:

- [src/App.tsx](/Users/jms/code/timeline-react/src/App.tsx)
  top-level state, environment, navigation behavior
- [src/viewport.ts](/Users/jms/code/timeline-react/src/viewport.ts)
  viewport helpers and initialization
- [src/timeline/scales.ts](/Users/jms/code/timeline-react/src/timeline/scales.ts)
  scale-band mechanics
- [src/timeline/periodAnchoring.ts](/Users/jms/code/timeline-react/src/timeline/periodAnchoring.ts)
  calendar-aware anchoring/current-period focus
- [src/timeline/gregorian.ts](/Users/jms/code/timeline-react/src/timeline/gregorian.ts)
  Gregorian structure generation
- [src/timeline/hebrew.ts](/Users/jms/code/timeline-react/src/timeline/hebrew.ts)
  Hebrew structure generation
- [src/timeline/hebrewTime.ts](/Users/jms/code/timeline-react/src/timeline/hebrewTime.ts)
  Hebrew time/date/sunset semantics
- [src/timeline/gregorianLabels.ts](/Users/jms/code/timeline-react/src/timeline/gregorianLabels.ts)
  Gregorian label policy
- [src/timeline/hebrewLabels.ts](/Users/jms/code/timeline-react/src/timeline/hebrewLabels.ts)
  Hebrew label policy
- [src/components/Timeline.tsx](/Users/jms/code/timeline-react/src/components/Timeline.tsx)
  main render orchestration
- [src/components/useStickyContextPresentation.ts](/Users/jms/code/timeline-react/src/components/useStickyContextPresentation.ts)
  sticky-context sizing and side/lane presentation
- [src/timelinePresentation.css](/Users/jms/code/timeline-react/src/timelinePresentation.css)
  timeline presentation tokens and rules

## Current Product Truths

These are useful short reminders:

- Hebrew is now a real structural peer to Gregorian.
- Primary calendar semantics and visible structural layers are not the same.
- Sticky context labels are viewport chrome, not ordinary timeline labels.
- One-sided ticks significantly improved readability.
- Pixel tuning has repeatedly been product work, not wasted polish.
- Tests now cover a meaningful amount of subtle interaction behavior.

## Current Open Questions

Some important active or near-active topics:

- pointer/cursor-based gestural zoom
- label-density suppression near primary boundaries
- Gregorian visual primacy still being a bit too strong in some views
- richer Hebrew boundary context at broader scales
- Hebrew day view and below, including the path toward zmanim / richer intraday
  Hebrew structure
- broader label-composition normalization after the Hebrew intraday slice
- later 24-hour mode exploration

## Current Product Truths Worth Remembering

- Gregorian quarter view currently uses weekly internal ticks, plus stronger
  month and quarter boundaries.
- Hebrew quarter view currently stays month-based; Hebrew week ticks there are
  intentionally deferred for a later parsha/toggle decision.
- Year view now shows unlabeled quarter ticks for both Gregorian and Hebrew.
- Scale `6` is no longer symmetrical:
  - Gregorian reads as decade
  - Hebrew reads as shmita cycle
- [LABEL_COMPOSITION_AUDIT.md](/Users/jms/code/timeline-react/LABEL_COMPOSITION_AUDIT.md)
  is now the main design map for future label normalization, but that work is
  intentionally paused until after the next Hebrew intraday slice.

## How To Stay On Top Of The Project

### Recommended Check-In Cadence

At the end of a meaningful slice, ask for:

- “Where are we now?”
- “What did this commit actually simplify?”
- “What are the top 3 current complexity risks?”

At the start or midpoint of a phase, ask for:

- “What backlog items targeted at this phase should we pull in?”
- “What still feels architecturally unresolved?”

After a long design or interaction pass, ask for:

- “What changed conceptually, not just visually?”
- “What parts of the current system map should be updated?”

### Recommended Review Prompts

Useful prompts to reuse:

- Explain the current rendering flow in plain English.
- Explain the current navigation model in plain English.
- What is model logic here, and what is presentation logic?
- What names feel misaligned with the actual architecture?
- If I had to relearn this codebase in 10 minutes, what should I read first?
- What assumptions are currently fragile?

### Recommended Working Habits

- Keep using [BACKLOG.md](/Users/jms/code/timeline-react/BACKLOG.md) to park
  ideas quickly.
- Classify feedback as:
  - must-fix now
  - try now
  - backlog
- Keep asking for summaries and seam reviews.
  That is part of maintaining quality, not a sign of confusion.
- Prefer periodic map-making over trying to hold the whole project in memory at
  once.
- Continue reading code directly.
  Human product-eye review is catching important issues.

## How To Keep Moving Fast

The best speed lever is not lowering taste.
It is deciding earlier which ideas belong to which bucket:

- foundational to the active slice
- worthwhile experiment
- future/backlog

Good reminder:

- many good ideas do not need immediate embodiment
- some ideas are valuable mainly because they improve the next decision, not
  because they must be built now

## Reading Order for Re-Entry

If the project feels fuzzy, reread in this order:

1. [HUMAN_CONTEXT.md](/Users/jms/code/timeline-react/HUMAN_CONTEXT.md)
2. [PROJECT_PLAN.md](/Users/jms/code/timeline-react/PROJECT_PLAN.md)
3. [ARCHITECTURE.md](/Users/jms/code/timeline-react/ARCHITECTURE.md)
4. [VISUAL_SYSTEM.md](/Users/jms/code/timeline-react/VISUAL_SYSTEM.md)
5. [INTERACTION_NOTES.md](/Users/jms/code/timeline-react/INTERACTION_NOTES.md)

Then, if needed:

6. [src/App.tsx](/Users/jms/code/timeline-react/src/App.tsx)
7. [src/components/Timeline.tsx](/Users/jms/code/timeline-react/src/components/Timeline.tsx)
8. one calendar module and one label module
