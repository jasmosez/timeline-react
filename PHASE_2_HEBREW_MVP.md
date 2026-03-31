# Phase 2 Hebrew MVP

## Purpose

This note defines the first meaningful Hebrew-calendar slice for Phase 2.
The goal is not to add every Hebrew-time feature at once. The goal is to prove
that the timeline can support a second full calendrical system with different
structural boundaries while preserving the current navigation model.

## What We Are Trying to Prove

Phase 1 proved that the timeline can navigate continuous time well.
Phase 2 should now prove that:

- multiple structural calendar systems can coexist
- one system can be Gregorian while another is sunset-based
- viewport duration can remain neutral while calendar interpretation changes
- anchored navigation can be driven by a chosen primary calendar system

## Source of Truth

For the first Hebrew MVP:

- location: Northampton, MA 01060
- timezone: `America/New_York`
- calendar conversion and developer reference: Hebcal

This keeps the first implementation concrete and avoids premature settings work.

## In Scope

The Hebrew MVP should include:

- Hebrew date conversion
- sunset-based Hebrew day rollover
- Hebrew structural labels
- Hebrew structural boundaries at a small number of scales
- coexistence with Gregorian structure
- a notion of one primary calendar system for anchored viewport semantics

## Out of Scope

The Hebrew MVP should explicitly exclude:

- holidays
- zmanim
- proportional hours / seasonal hours
- multiple locations
- user-configurable timezone/location UI
- deep holiday/ritual metadata

Those belong to later Hebrew sub-layers or later phases.

## Key Architectural Distinction

### 1. Neutral Viewport Duration

The viewport should remain fundamentally duration-driven.

Examples:

- day-scale remains roughly day-sized
- week-scale remains roughly week-sized
- month-scale remains roughly month-sized

This should not be tightly coupled to one calendar system.

### 2. Structural Layers

Gregorian and Hebrew should both be able to contribute:

- structural boundary points
- structural spans
- structural labels

These are not just marker layers. They are true segmentation systems.

### 3. Primary Calendar System

The new concept Phase 2 likely needs is a chosen primary calendar system.

This primary system should govern anchored behaviors such as:

- reset to current containing period
- what “current day” means
- what “current week” means
- which structural labels get visual priority

This is different from visible duration.
Duration can stay neutral while anchored period semantics come from the primary
calendar.

## Proposed MVP Model

### Active Structural Layers

The app should allow more than one structural layer to be active at once.

For the first Hebrew MVP:

- Gregorian can be active
- Hebrew can be active
- both can be active together

### Primary Structural / Calendar Layer

One structural layer should be primary.

That primary layer should influence:

- dominant labels
- anchored containing-period calculations
- reset behavior
- future “current day/week/month” affordances

For MVP, this may be a simple app-level state value.

## First Hebrew Scales

The first Hebrew structural scales should likely be:

- day
- week
- month
- year

Why:

- day is where sunset rollover matters immediately
- week and month are where alternate structural labeling becomes meaningful
- year matters because Hebrew year identity diverges from Gregorian year

Minute and hour views do not need full Hebrew structural reinterpretation first.
They can remain mostly Gregorian in feel while still allowing Hebrew metadata or
day identity to exist.

## Sunset-Based Day Boundaries

The most important non-Gregorian pressure in the MVP is:

- a Hebrew day does not roll over at midnight
- it rolls over at sunset
- sunset depends on date and location

So Hebrew day structure cannot be derived from timestamp alone.
It requires:

- timestamp
- timezone
- location
- sunset calculation / source data

This is the core architectural test.

## First Rendering Strategy

The first rendering strategy should remain conservative:

- one primary structural layer gets dominant labels
- a secondary structural layer should still be legible, but spatially distinct
- label collision strategy can remain simple at first

The important thing is proving:

- Hebrew structural boundaries can render
- Gregorian and Hebrew can coexist
- the viewport model does not break

We do not need perfect multi-structure visual design in the very first slice.

Recommended MVP distinction:

- primary structural labels render on the left side of the timeline
- secondary structural labels render on the right side of the timeline
- subtle visual differences such as color or weight may be added later if
  spatial distinction alone is not enough

This should be treated as a first dual-structure rendering strategy, not
necessarily the final one.

## MVP Questions to Settle Before Coding

1. What exact Hebrew boundaries do we render first at each chosen scale?
2. How do we compute or source sunset boundaries in the first implementation?
3. How should reset behave when Hebrew is the primary calendar system?
4. When both structural layers are active, what makes the secondary one legible
   but not overwhelming?
5. Do we need separate UI concepts for:
   - active structural layers
   - primary structural layer
   or can one simple MVP control handle both?

## Recommended First Implementation Order

1. Introduce the concept of a primary calendar / structural system.
2. Add Hebrew date conversion and sunset-aware day identity.
3. Render a first Hebrew structural layer at one or two scales.
4. Make reset / containing-period anchoring respect the primary calendar.
5. Expand Hebrew structure to additional scales.

## Current MVP Decisions

These are the current working decisions for the first implementation:

- When both Gregorian and Hebrew structural layers are active:
  - primary structural labels render on the left side of the axis
  - secondary structural labels render on the right side of the axis
- Hebrew-primary week behavior should be interpreted as a 7-day span ending
  with Shabbat
- Within a Hebrew day, intraday tick marks should continue to use civil
  Gregorian hours for MVP
- Within a Hebrew day, structural spans should also follow those civil-hour
  subdivisions so the day view reads coherently
- Proportional / seasonal Hebrew hours remain out of scope for this first slice

## Proposed Scale-by-Scale Hebrew Behavior

This section is meant to make explicit what Hebrew contributes at each scale,
including where we are intentionally conservative.

### Minute View

- keep Gregorian / civil seconds as the structural ticks
- do not introduce Hebrew proportional-hour or zmanim logic yet
- Hebrew may eventually contribute contextual labeling, but not primary
  structural subdivision in this MVP

Rationale:

- minute view is too fine-grained to benefit from Hebrew structural
  reinterpretation before zmanim / halachic-hour choices are settled

### Hour View

- keep Gregorian / civil minute ticks as the structural ticks
- do not attempt to reinterpret the hour using halachic-hour logic yet
- Hebrew may eventually contribute contextual day identity or nearby sunset
  awareness, but not full structural subdivision in this MVP

Rationale:

- hour view still depends on unresolved halachic-time choices
- civil-time structure remains the clearest interim model

### Day View

- Hebrew day boundaries are sunset-based
- intraday ticks remain civil-hour ticks
- intraday spans also follow civil-hour subdivision
- when Hebrew is primary, Hebrew labels and anchored semantics define which day
  is “current”

Rationale:

- this gives a strong non-Gregorian day identity without pretending we have
  chosen a proportional-hour interpretation yet

### Week View

- Hebrew contributes sunset-based day boundaries and Hebrew day labels
- Hebrew-primary week is interpreted as a 7-day span ending with Shabbat
- intraday structure is not emphasized at this scale

Rationale:

- week view is the first scale where alternate day identity and week framing
  become strongly legible

### Month View

- Hebrew contributes day-level boundaries and Hebrew day numbering
- Hebrew month transitions should be labeled clearly
- Hebrew-primary month should be framed by the current Hebrew month rather than
  the Gregorian month

Rationale:

- month view is where Hebrew month identity becomes an important structural
  difference

### Quarter View

- Hebrew-primary quarter should be framed by the current Hebrew quarter
- internal ticks and spans should still be month-by-month within that quarter
- Hebrew quarter 1 is `Tishrei–Kislev`
- in leap years, both `Adar I` and `Adar II` belong to quarter 2

Rationale:

- quarter view is still a meaningful aggregate of Hebrew months, and a clear
  quarter definition is sufficient for MVP

### Year View

- Hebrew contributes month boundaries and month labels
- Hebrew year identity should be visible
- Hebrew-primary year should be framed by the current Hebrew year

Rationale:

- year view is where Hebrew month/year identity diverges meaningfully from
  Gregorian structure without requiring finer-grained halachic-time choices

### Decade View

- Hebrew contributes year boundaries inside the current Hebrew decade
- Hebrew-primary decade should be framed by the current 10-year Hebrew interval

Rationale:

- decade view can still usefully express Hebrew year identity without requiring
  a more exotic long-span interpretation

## Follow-Up Notes

- the `now` marker should eventually adopt primary-calendar-aware labeling
- Hebrew labeling will need richer rules than the current first-pass labels
- Gregorian labeling should also be refactored toward a more durable dynamic
  strategy so both systems can coexist gracefully during motion and zoom

## Success Criteria

We should consider the Hebrew MVP successful if:

- Gregorian and Hebrew can both be enabled
- Hebrew day identity respects sunset in Northampton / `America/New_York`
- one calendar system can be primary for anchored navigation semantics
- reset/current-period behavior still feels coherent
- the layer architecture is healthier afterward, not more tangled

## Current Implementation Status

The first implementation slice has now landed:

- Hebrew date conversion and sunset-aware day identity exist in code
- Hebrew day/week/month/year structure can render
- Hebrew quarter and decade structure now render too
- Gregorian and Hebrew can both be active at once
- one primary calendar system now drives anchored reset/current-period
  semantics
- day view currently uses civil-hour intraday ticks and spans inside the Hebrew
  structure
- Gregorian label/context policy is now being separated from generic scale-band
  mechanics so Hebrew label policy can follow a cleaner seam

What remains notably rough:

- Hebrew labels are still first-pass and need richer formatting rules
- the `now` marker is now primary-calendar-aware, but its long-term label
  design still needs refinement
- dual-structure visual tuning is still ongoing, especially around spans and
  dense label moments
- zoom is still viewport-centered rather than pointer/cursor-based
