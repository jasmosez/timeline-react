# Structural Expression Matrix Review Notes

This note accompanies the first draft of
[STRUCTURAL_EXPRESSION_MATRIX.md](/Users/jms/code/timeline-react/STRUCTURAL_EXPRESSION_MATRIX.md).

Its purpose is to make review efficient by calling out:

- the main tensions between current app behavior and product theory
- consistency strengths and weaknesses
- the main open questions still needing clarification
- a suggested review process for getting to a crystal-clear source of truth

## Biggest Current-vs-Spec Tensions

### 1. Life-Relative Is Theory-Rich But Structurally Unimplemented

The biggest gap in the app is now life-relative.

Current implementation:

- `birthday` layer id labeled `Personal`
- Gregorian `Age N` anniversary markers
- day/week-of-life label augmentation
- day annotations as a personal data layer

Product theory:

- life-relative is a third structural calendar system
- it has an anchor, interpretation, units, and future coexistence grammar

So the biggest overall tension is:

- current app treats life-relative mostly as markers/data augmentation
- product theory now treats it as a structural system

### 2. Hebrew Intraday Is Productively Real But Not Yet Fully Normalized

The Hebrew intraday MVP is strong and useful.

But it still has a special-case feeling compared with Gregorian structural
bands:

- minute/hour/day Hebrew are zooms into a shared intraday marker/span system
- they are not parallel to Gregorian minute/hour/day segmentation
- this is acceptable for now, but it means these cells are not yet “settled
  forever”

### 3. Hebrew Month View Still Has The Most Theoretical Friction Above Intraday

The user currently feels month view is working well, which matters a lot.

But the audit still suggests a theoretical tension:

- weekly geometry
- `Shabbat` rhythm
- month-boundary meaning

are not yet unified by one simple rule.

This may be fine as product reality, but it should stay explicitly visible in
the matrix.

### 4. Scale 6 Is Intentionally Asymmetric

Gregorian scale 6 is:

- plain year / 5-year / decade cadence

Hebrew scale 6 is:

- year
- shmita marking
- post-shmita emphasis

This asymmetry seems intentional rather than accidental, but it is still one of
the strongest places where the calendars diverge structurally.

### 5. Supporting/Tertiary Structural Hierarchy Is Now Theory But Not Yet Product Grammar

The life-relative theory clarified that future coexistence requires:

- one leading calendar
- ranked non-leading calendars

The current app only really knows:

- leading
- supporting

So tertiary-and-beyond coexistence remains a theory requirement rather than an
implemented visual grammar.

## Consistency Assessment By Calendar

### Gregorian

Strongest:

- day
- week
- month
- quarter
- year

Current Gregorian behavior is comparatively coherent and well tested.

Main remaining weaknesses:

- some larger-scale asymmetry with Hebrew is intentional but still visible
- broader transition smoothing is deferred

### Hebrew

Strongest:

- week
- year
- intraday MVP as its own coherent first pass

Most open:

- month
- quarter
- large-scale normalization relative to Gregorian

Hebrew is no longer sketchy, but it is still the structurally less normalized of
the two implemented calendars.

### Life-Relative

Strongest:

- product theory
- conceptual separation from personal data layers

Weakest:

- actual structural implementation at every scale

Life-relative is now the least implemented but most strategically important
calendar system.

## Consistency Assessment By Scale Band

### Most Consistent

- week
- year

These are the scales where Gregorian and Hebrew currently coexist most cleanly.

### Strong But Still Open

- day
- month

Day is strong, but Hebrew/Gregorian day are structurally very different.
Month is powerful, but Hebrew month theory is still not fully collapsed into one
rule.

### Intentionally Asymmetric

- quarter
- scale 6

These are functioning, but their asymmetry is visible and should be treated as
real rather than denied.

### Least Implemented Across All Structures

- minute
- hour

Gregorian is mature here, but Hebrew is still a carried intraday system and
life-relative is not structurally implemented.

## Main Questions For Review

### 1. Which Current Asymmetries Are True Product Choices?

Especially:

- Gregorian quarter vs Hebrew quarter
- Gregorian scale 6 vs Hebrew scale 6
- Hebrew month’s current hybrid weekly logic

We should identify which asymmetries are:

- intentional
- tolerated for MVP
- or actually problems to solve

### 2. Where Should Life-Relative Become Structural First?

The matrix strongly suggests likely early structural scales:

- day
- week
- month
- year

But it would help to prioritize which one should be the first real
implementation target.

### 3. How Far Should We Push Hebrew Intraday Normalization?

Is the current intraday system:

- a satisfactory durable asymmetric solution
- or a placeholder until a more native Hebrew scale theory emerges?

### 4. Which Cells Need Design Discovery Rather Than More Verbal Theory?

At least:

- three-calendar coexistence
- sticky context behavior for more than two structural systems
- large-scale life-relative expression

These may need mockups before more prose.

## Suggested Review Process

### Pass 1: Calendar-by-Calendar

Review Gregorian, Hebrew, and life-relative separately.

For each:

- confirm what already feels correct
- mark where the `Target` is right
- mark where the `Target` still feels wrong or premature

### Pass 2: Scale-by-Scale

Review each scale band across all three structures:

- minute
- hour
- day
- week
- month
- quarter
- year
- scale 6

This is where cross-system tensions become most obvious.

### Pass 3: Identify Cell Types

For each cell, classify it as one of:

- leave as-is
- clarify theory only
- behavior change needed
- design discovery needed
- intentionally deferred

### Pass 4: Group Implementation Work

Once the matrix is mature enough, group future code work into:

- pure behavior changes
- refactors that better align code with theory
- larger architecture shifts still better left for later

## What I Would Ask You To Focus On In Review

The highest-value review questions are:

- where does the matrix misdescribe the current app?
- where does the target theory feel wrong or overcommitted?
- which asymmetries should become explicit product doctrine?
- where should life-relative structurally enter first?
- which open cells are actually resolved in your head but not yet written down?

## Likely Implementation Delta Categories

Not the final implementation plan yet, but the matrix already suggests four
future categories of work:

### 1. Life-Relative Structural Implementation

- new structural layer semantics
- interpretation/granularity controls
- units by scale
- coexistence with Gregorian and Hebrew

### 2. Hebrew Normalization / Clarification

- month/quarter theory tightening
- maybe further intraday clarification

### 3. Coexistence Grammar Beyond Two Structures

- supporting / tertiary hierarchy
- sticky context strategy
- lane ordering and density control

### 4. Code-Shape Improvements

- more centralized expression / label rules
- clearer seams between structure definition and rendering
- less scattering of composition logic across layer files

Those should be revisited only after the matrix is more settled.
