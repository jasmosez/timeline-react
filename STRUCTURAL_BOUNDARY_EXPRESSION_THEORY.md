# Structural Boundary Expression Theory

## Purpose

This document reframes structural timeline behavior around a more centralized
theory:

- structural calendar systems define **what period families exist**
- a shared expression policy defines **how those periods are expressed**

This is intended to be a cleaner and more durable product model than treating
each scale band as a bespoke collection of `ordinary`, `secondary`, and
`primary` rules.

The older rank language is still useful as a coarse description of current UI
states, but it should no longer be treated as the deepest truth of the system.

## Core Shift

The key shift is:

- ticks do not fundamentally become important because of the current zoom band
- ticks are expressions of certain kinds of structural periods
- those period kinds already stand in relation to one another
- zoom changes their **expression**, not their identity

So instead of saying:

- in week view, day is ordinary, week is secondary, month is primary

we increasingly want to say:

- Gregorian day, week, and month periods all exist
- at this viewport duration, the system chooses how strongly each is expressed

That distinction is important because it gives us:

- smoother zoom behavior
- cleaner centralized policy
- less bespoke per-scale logic
- a better path to supporting more structural systems

## Structural Ontology

Each structural calendar system defines a set of **structural period
families**.

Examples:

- Gregorian:
  - second
  - minute
  - hour
  - day
  - week
  - month
  - quarter
  - year
  - decade
- Hebrew:
  - intraday marker families
  - day
  - week rhythm / weekly identifier
  - month
  - quarter
  - year
  - shmita cycle
- life-relative:
  - elapsed and/or interpreted minute/hour boundaries
  - day of life
  - week of life
  - month of life
  - year of life
  - seven-year cycle

These are ontology-level definitions.

They answer:

- what kinds of periods does this structure know about?
- how are those periods calculated?
- what labels and spans could they potentially produce?

Each structural period family inherently has two coupled expressions:

- boundary-point expression
- interval expression

For example:

- hour family
  - boundaries: hour ticks
  - intervals: hour spans
- day family
  - boundaries: day ticks
  - intervals: day spans
- week family
  - boundaries: week ticks
  - intervals: week spans

The period family is the deeper whole.
Ticks and spans are two manifestations of that whole.

## Structural Period Families

Each structural period family should eventually be definable in terms like:

- `id`
- `calendarSystem`
- `kind`
- `calculationRule`
- `intrinsicScale`
- `significance`
- `labelCapabilities`
- `spanCapabilities`
- `contextCapabilities`
- `coalescingRequirements`, if relevant

This is still abstract, but it suggests a much cleaner architecture:

- calendar-specific code declares period families
- shared policy code decides how to express them

## Intrinsic Significance

Structural period families stand in an intrinsic hierarchy of significance.

A year boundary is not important only because a particular zoom band says so.
It is already the boundary expression of a larger-scale period than a minute
boundary.

This means the system should be able to reason with significance independently
of the current viewport.

We do not yet need to commit to exact numeric weights, but we do need the idea
that:

- some boundaries are locally fine-grained
- some are intermediate
- some are major
- some are macro-scale

This is deeper than `primary / secondary / ordinary`.

The older rank language can remain as a rendering snapshot if needed, but the
underlying theory should be period-family significance plus zoom-dependent
expression.

## Expression Policy

The shared policy engine should determine, for each structural period family at
a given viewport duration and density:

- whether ticks are shown
- how prominent ticks are
- whether labels are shown
- how rich labels are
- whether spans are shown
- whether span labels are shown
- whether sticky context is updated or promoted

This means the current scale band becomes less like a hard mode and more like an
expression environment.

## Expression States

For a given structural period family, expression can vary by zoom.

Examples of possible states:

- hidden
- visible but faint
- visible unlabeled
- visible labeled
- emphasized
- sticky-context-bearing
- span-bearing
- promoted-label-bearing

This is more flexible than a fixed rank-per-scale model and matches how the
product increasingly wants to behave.

## Ticks, Labels, and Spans Are Separate Channels

One of the most important consequences of this theory is that:

- tick visibility
- label visibility
- span visibility

should be treated as related but distinct channels.

For example:

- a tick may be visible while its label is suppressed
- a span may be visible without a span label
- a span label may be promoted only when the span covers the viewport

This does **not** mean ticks and spans are separate ontological species.
It means their expression can be independently controlled even when they belong
to the same underlying structural period family.

This is already partially true in the app and should become more explicit in
the shared policy system.

## Label Appearance In Stages

The product increasingly wants labels to appear progressively rather than as
binary on/off decorations tied to one hard scale.

A likely staged model is:

1. boundary exists but is hidden
2. boundary appears as a tick
3. tick becomes more prominent
4. label appears
5. richer label composition appears
6. sticky context or promoted labels take over when appropriate

In the opposite direction:

1. rich labels simplify
2. labels suppress when density is too high
3. ticks remain visible longer than labels
4. ticks fade/shrink away when their boundary family is no longer useful at the
   current scale

This is a better mental model for inter-scale transitions than treating each
scale band as a fully separate handcrafted regime.

## Suppression And Thresholds

The system will likely need shared threshold logic.

Examples of useful threshold rungs:

- 1 second
- 5 seconds
- 15 seconds
- 1 minute
- 5 minutes
- 15 minutes
- 1 hour
- 3 hours
- 12 hours
- 1 day
- 1 week
- 1 month
- 3 months
- 1 year
- 5 years
- 10 years

These do not all need to become user-visible scales.
They can function as policy thresholds for:

- when a period family appears
- when labels appear
- when richer composition appears
- when suppression begins

Not every structural system will map onto every rung in the same way, but the
policy engine can still use a shared ladder concept.

## Structural And Non-Structural Temporal Objects

The boundary/span coupling is not only true of structural time.

More generally:

- ticks express boundary points
- spans express the interval between boundary points

This is likely true across the app, including future:

- annotations
- event spans
- imported data layers
- custom user spans

So the deeper ontology is probably not “ticks versus spans.”
It is temporal objects with:

- boundary expression
- interval expression

What makes structural systems different is not that they uniquely have this
relationship.
What makes them different is that their expression policy should be much more
systematic, shared, and theory-driven.

In structural contexts:

- expression should be family-based
- zoom-driven
- and broadly consistent across the system

In non-structural contexts:

- the same boundary/span linkage may still exist
- but expression can be more authored, contextual, and per-layer specific

## Calendar-Specific Declarations Versus Shared Policy

The cleaner long-term split is:

### Calendar-Specific

Each structural system defines:

- its period families
- how those periods are calculated
- what labels they can produce
- what spans they can produce
- any special cultural or structural semantics

Examples:

- Hebrew parsha as a possible weekly identifier
- Hebrew shmita cycle numbering
- life-relative interpretation and gross/fine-grain modes

### Shared Policy

The engine defines:

- visibility thresholds
- prominence rules
- label/suppression rules
- context promotion rules
- coexistence ordering rules

This split should reduce duplication and make it easier to add:

- a third structural system
- a fourth or fifth later
- richer inter-scale transitions

## Coexistence

This theory also supports the newer multi-structure model:

- one leading structural calendar
- one or more non-leading calendars with explicit hierarchy

That hierarchy should influence:

- lane order
- tick/label prominence
- context placement
- suppression behavior

The current app mainly knows leading vs supporting.
The new theory should support supporting, tertiary, and beyond without needing
to rethink the whole system later.

## Life-Relative As A Third Structural System

This theory is particularly helpful for life-relative time.

Life-relative should not be forced into:

- marker-only behavior
- label-augmentation-only behavior
- one hardcoded scale recipe

Instead:

- life-relative declares its period families
- interpretation and coalescing affect how those families are calculated
- shared expression policy determines when they appear and how they are shown

This makes life-relative a genuine structural peer rather than a bolt-on.

## Role Of The Structural Expression Matrix

The structural expression matrix is still useful, but its role changes.

It should no longer be treated as:

- a forever-handwritten set of bespoke scale recipes

Instead it should become:

- a source of truth for expected expression outcomes
- a validation surface for the shared policy system
- a place to mark intentional asymmetries and unresolved exceptions

So the matrix remains important, but it becomes:

- policy examples
- design targets
- exception registry

rather than the only way to specify behavior.

## What This Theory Does Not Yet Settle

This theory does not yet define:

- exact numeric significance weights
- exact zoom thresholds for each family
- exact coexistence layout for 3+ structural calendars
- exact life-relative deep-scale expression
- final Hebrew weekly identifier choice

Those can remain open while the core architecture becomes much clearer.

## Practical Implication

The most likely future implementation path is:

1. define structural period families more explicitly per structural system
2. define a shared expression policy layer
3. use the matrix to validate the generated outcomes
4. keep explicit exceptions only where the general policy is not enough

If this works, the app should become:

- easier to reason about
- easier to extend
- easier to refactor cleanly
- and more continuous in its zoom behavior
