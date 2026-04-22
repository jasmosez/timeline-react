# Life-Relative Calendar

## Purpose

The life-relative calendar is a third structural calendar system alongside
Gregorian and Hebrew.

It is not a personal-data layer and not merely a birthday marker scheme.
It is a way of partitioning and understanding time relative to a specific human
life.

In the broadest product framing:

- Gregorian tells us shared civil time
- Hebrew tells us sacred and cultural time
- life-relative tells us lived personal time

## Core Distinction

The project now distinguishes between:

- **structural calendar systems**
  - Gregorian
  - Hebrew
  - life-relative
- **personal data layers**
  - day annotations
  - plans
  - journal
  - future custom personal spans and notes

These should remain independently meaningful and independently toggleable.

Life-relative structure answers:

- how is time partitioned relative to a life?

Personal data layers answer:

- what authored or recorded meaning has been attached to those times?

## Anchor And Interpretation

### Anchor

The life-relative system is anchored to the birth instant in the configured
birth-local timezone.

This anchor is real and structural. It is not flattened first into Gregorian
date-only semantics.

### Interpretation

The anchored life-relative system becomes human-legible through explicit
interpretation, also described internally as **coalescing**.

That means:

- the birth instant is the native anchor
- meaningful human units such as day, week, month, and year are interpreted
  through another calendar structure

For MVP:

- the default life-relative interpretation is **Gregorian**

This should be surfaced explicitly in the UI, even if Gregorian is the only
available choice at first.

## Coalescing

Coalescing is a general product concept.

It describes how one structural system is interpreted through or related to
another.

Examples:

- a birth instant coalesces to both a Gregorian and a Hebrew date
- a present Gregorian day may primarily overlap a present Hebrew day
- life-relative day or year boundaries may be read through Gregorian or Hebrew
  rules

This matters because the app is not trying to collapse all structure into one
canonical system. It is trying to make multiple valid structures intelligible at
 once.

Coalescing therefore applies:

- between life-relative and Gregorian
- between life-relative and Hebrew
- and between Gregorian and Hebrew themselves

## Gross And Fine-Grain Readings

Life-relative interpretation also has a granularity question.

The product should preserve the distinction between:

- **gross / coalesced readings**
  - example: Day 2 begins at midnight on April 20, 1982
- **fine-grain / instant-exact readings**
  - example: Day 2 begins at 2:25 AM ET on April 20, 1982

Both are meaningful.

Broad scales will often favor gross/coalesced legibility.
Finer scales may increasingly favor instant-exact truth.

For MVP:

- the app may use coalesced defaults in many places
- but those defaults should not be buried
- the UI should make visible both:
  - the current interpretation
  - the current granularity assumption

Even if no alternate options are selectable yet, the product should make the
 simplification visible.

## Core Units

The first-class life-relative units are:

- day of life
- week of life
- month of life
- year of life
- seven-year cycle

Not first-class for now:

- quarter of life
- decade of life

These units are interpreted through the active coalescing calendar rather than
through naive fixed durations.

That means:

- month and year of life are calendar-native units
- they must respect the native month and year rules of the chosen
  interpretation
- leap behavior and variable month lengths are part of the unit definition, not
  an edge cleanup task

Examples:

- Gregorian interpretation must handle February 29 and end-of-month births
- Hebrew interpretation must eventually handle leap months, Adar / Adar II, and
  variable month lengths

These rules should be tested early, not deferred.

## Year Of Life Versus Age

The system distinguishes between:

- **year of life**
  - a 1-indexed structural span
- **age**
  - a 0-indexed colloquial state

Examples:

- from birth until the first birthday:
  - Year 1
  - Age 0
- from first birthday until the second birthday:
  - Year 2
  - Age 1

The first birthday marks the end of the first year of life.

Both concepts are valid and useful, but they should not be conflated.

## Gregorian And Hebrew Anniversaries

Life-relative is its own anchored structural system.

Gregorian and Hebrew anniversaries are best understood as coalesced expressions
of that anchored system rather than as separate competing foundations.

For MVP:

- Gregorian interpretation is the default yearly reading
- Gregorian birthday boundaries can therefore serve as the default annual
  boundary of the life-relative system

But the theory should remain open to:

- Hebrew anniversary interpretation
- multiple valid anniversary readings
- future cases where more than one coalesced expression is shown at once

## One Life-Relative Calendar Or Many

The life-relative system is conceptually plural.

That means the product model should support the idea of:

- one person
- or more than one person
- or several foundational life-relative calendars

For MVP:

- only one active life-relative calendar is required

But neither the data model nor the visual grammar should treat singularity as a
permanent truth.

The design should remain open to a future with:

- a fourth structural layer
- a fifth structural layer
- multiple person-anchored structural systems

## Coexistence With Gregorian And Hebrew

Only one structural calendar should lead at a time.

When more than one structural calendar is active, the non-leading calendars need
an explicit hierarchy:

- supporting
- tertiary
- and potentially beyond

At minimum this hierarchy must determine:

- horizontal ordering
- lane priority
- likely visual emphasis and density

A reasonable starting hypothesis is:

- one sticky context label per active structural calendar

But the actual rendering grammar for three simultaneous structural systems
requires visual design discovery and should not be overcommitted in this first
theory doc.

## Scale Relevance

Life-relative is most fully expressible at human-near scales, especially:

- day
- week
- month
- year
- multi-year / seven-year views

Below day scale:

- the system may still matter
- but often through context labels, span labels, or finer-grain boundary truth
  rather than through fully elaborated day/week/month structure

At much larger scales:

- life-relative does not necessarily stop being structural
- but the appropriate form of its structural expression may change

This means:

- lower scales may use fine ordinal units
- broader scales may use coarser spans, boundaries, or era-like framing
- suppression or transformation of representation is expected
- conceptual disappearance is not assumed

The MVP should implement the near-scale forms cleanly while leaving larger-scale
expression open.

## What This Doc Intentionally Does Not Settle

This theory doc does not yet lock:

- exact rendering rules for three or more simultaneous structural calendars
- deep-scale expression of life-relative structure
- exact label composition at every scale
- multi-person UI
- all Hebrew-interpretation edge cases
- all transition behavior between neighboring scale bands

Those will be handled through later visual design discovery and through a
separate structural expression matrix.

## Next Design Artifact

The next useful source-of-truth artifact should be a structural expression
matrix with:

- columns for structural calendar systems
- rows for scale bands
- and cell-level articulation of:
  - visible ticks
  - ranks
  - labels
  - spans
  - context
  - calculation notes
  - suppression / transformation rules

This should begin with current scale bands and current structural systems, and
leave unresolved cells explicit rather than forced.
