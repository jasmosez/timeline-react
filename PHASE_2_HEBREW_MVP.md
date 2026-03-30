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
- secondary structural layers may render more quietly
- label collision strategy can remain simple at first

The important thing is proving:

- Hebrew structural boundaries can render
- Gregorian and Hebrew can coexist
- the viewport model does not break

We do not need perfect multi-structure visual design in the very first slice.

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

## Success Criteria

We should consider the Hebrew MVP successful if:

- Gregorian and Hebrew can both be enabled
- Hebrew day identity respects sunset in Northampton / `America/New_York`
- one calendar system can be primary for anchored navigation semantics
- reset/current-period behavior still feels coherent
- the layer architecture is healthier afterward, not more tangled
