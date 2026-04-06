# Timeline React Visual System

## Purpose

This note captures the current visual-direction thinking for timeline styling.
It is meant to guide styling and polish work now that the structural and label
systems are becoming more coherent.

The goal is not to freeze a final design language too early. The goal is to
create a shared grammar for how different kinds of timeline elements should
look and relate to each other.

## Core Principle

Visual distinction should be driven first by role, then by layer.

That means:

- structural systems should share a common grammar
- layer-specific branding should sit inside that grammar
- `now` should read as a separate kind of object, not just another layer
- personal overlays such as birthday markers should form their own visual
  family

## Visual Roles

### Structure

Structural layers partition time.

Current examples:

- Gregorian
- Hebrew

Structural elements include:

- ticks
- labels
- spans
- sticky context labels

These should feel calm, legible, and reliable rather than emotionally loud.

### Reference

`now` is a live orienting marker.

It is not part of the structural calendar systems.
It should feel singular, vivid, and immediate.

### Personal Overlay

Birthday is the first example of a more personal interpretive overlay.

Later this family may include:

- annotations
- custom spans
- planning objects

These should feel distinct from both structural layers and from `now`.

### Viewport Context

Sticky context labels are viewport aids, not timeline objects in the same sense
as ticks and spans.

They should feel quieter, more stable, and more UI-like than ordinary tick
labels.

## Layer Families

### Gregorian

Gregorian is the baseline civil frame.

Desired feeling:

- neutral
- stable
- default
- understated

Design direction:

- ticks should be near-black or charcoal
- labels should be medium gray rather than fully dark
- spans should be much softer than ticks and should likely move away from the
  current strong red treatment
- sticky labels should be quiet neutral context, not heavy black labels

### Hebrew

Hebrew is a second structural intelligence, not an ornamental overlay.

Desired feeling:

- distinct from Gregorian
- calm rather than flashy
- slightly more luminous or elevated

Design direction:

- blue remains a good family color
- ticks should carry the strongest blue signal
- labels should use a quieter blue-gray tone
- spans should be a pale blue wash rather than a strong object color
- sticky labels should be calmer than ordinary Hebrew tick labels

### Now

`now` is a reference marker, not structure.

Desired feeling:

- vivid
- precise
- singular
- immediate

Design direction:

- keep a strong red family reserved for `now`
- keep the `now` tick longer and asymmetrical
- keep the `now` label higher contrast than structural labels
- do not reuse this exact emphasis pattern for ordinary layers

### Personal Overlays

Birthday should begin establishing the visual family for future annotations and
custom overlays.

Desired feeling:

- human
- interpretive
- softer than `now`
- distinct from structural systems

Design direction:

- avoid using the same neutral/black as Gregorian
- avoid using the same blue as Hebrew
- avoid using the same vivid red as `now`
- choose a distinct but restrained family, such as:
  - muted coral
  - plum-brown
  - deep amber
  - mossy rose

## Role Hierarchy Within a Layer

Not every element in a layer should carry the same branding weight.

Recommended hierarchy:

- ticks carry the strongest layer signal
- labels are slightly softer than ticks
- spans are the softest layer element
- sticky labels are quieter than ordinary tick labels

This allows a layer to feel coherent without painting every object with the
same intensity.

## Spatial Grammar

Color should not do all the work.
Placement and geometry should carry a large share of the distinction.

### Named Lanes

The timeline now uses a small set of named horizontal lanes.
These are presentation concepts, not data-model concepts.

- reference lane: the far-left lane reserved for `now`
- leading structural lane: the left-side label lane for the leading visible
  structural system
- supporting structural lane: the right-side label lane for the supporting
  visible structural system
- personal overlay lane: the right-side lane used by birthday and future
  personal overlays
- context lane: the top/bottom sticky-label lane on either side of the axis

These lane names are helpful because they explain why multiple systems can
coexist without sharing the same horizontal real estate.

### Labels

The current lane system is strong and should continue:

- `now` uses the reference lane
- leading structural labels use the leading structural lane
- supporting structural labels use the supporting structural lane
- birthday and future personal overlays use the personal overlay lane

Sticky context labels are outside these ordinary tick-label lanes and should be
treated as viewport chrome.

### Ticks

Recommended geometry:

- structural ticks are short and symmetric around the axis
- `now` is longer and asymmetrical to the left
- personal overlays may later claim their own asymmetry or lane

### Spans

Current direction is good:

- leading structural spans occupy only one side of the axis
- supporting structural spans occupy only the other side

Important follow-up tuning areas:

- how flush spans sit against the axis
- span thickness
- span opacity
- distance from the axis
- when a structural span should gain a viewport-promoted label

## Promoted Span Labels

Span labels are becoming a real feature category.
The first MVP should remain narrow and future-oriented.

Working rule:

- if a structural span fully covers the viewport so that both bounding ticks are
  offscreen, the span may gain a sticky top label on its side of the timeline

For this MVP:

- do not assume all structural spans need intrinsic labels
- if a structural span has no explicit label, its promoted label may borrow the
  top/start bounding tick label
- this is a viewport-context behavior, not a claim that ordinary structural
  spans are normally labeled

This should generalize later to:

- Hebrew intraday spans
- structural quarter/week/month spans
- user-authored spans
- event spans
- note ranges

### Tick Rank

Tick rank is now an explicit part of the visual system.
It is a local, per-scale presentation signal rather than a global truth about
time.

Current ranks:

- `primary`
- `secondary`
- `ordinary`

For now, rank affects tick length only.
It does not yet change label richness or label logic.

This is intentional.
Tick rank gives us structural hierarchy inside a stable scale without forcing us
to solve cross-band transition labeling all at once.

## Sticky Context Labels

Sticky labels should feel like stable context, not floating tick labels.

That implies:

- smaller or quieter than ordinary structural labels
- less contrast than major tick labels
- visually consistent within a layer family
- positioned with clear top/bottom intent rather than accidental overlap

If both structural systems are visible, both may eventually have sticky context
labels. Their coexistence should rely first on spatial separation and only
secondarily on color differences.

## Design Rules

- Structure should feel calm.
- Reference should feel vivid.
- Personal overlays should feel distinct from both structure and reference.
- Spans should be softer than ticks.
- Labels should usually be softer than ticks.
- Sticky context labels should feel like viewport UI, not ordinary timeline
  content.
- Spatial distinction should do as much work as color whenever possible.
- No two roles should share exactly the same emphasis pattern.

## Immediate Styling Implications

Before typography polish, the most likely early wins are:

- soften Gregorian spans so they read as neutral structure rather than urgent
  red objects
- desaturate Hebrew labels relative to Hebrew ticks
- lighten Hebrew spans substantially
- keep `now` vivid and privileged
- give birthday and future personal overlays their own non-blue, non-red
  family
- keep sticky labels quieter than ordinary structural labels

## Suggested Implementation Order

1. Choose color families for Gregorian, Hebrew, `now`, and personal overlays.
2. Define the within-layer hierarchy for ticks, labels, spans, and sticky
   labels.
3. Tune spatial geometry:
   - tick length
   - span width
   - lane offsets
4. Revisit typography and text styling after the visual grammar is stable.

## Concrete Styling Spec

This section turns the visual-system direction into a more implementation-ready
target.

It is still a design spec, not a frozen CSS contract. The point is to create a
shared baseline for the next styling pass.

### Palette Direction

The current working recommendation is:

- Gregorian:
  - tick ink: charcoal
  - label ink: cool gray
  - sticky context: muted slate
  - spans: soft neutral-warm wash
- Hebrew:
  - tick ink: strong but calm blue
  - label ink: muted blue-gray
  - sticky context: quieter blue-slate
  - spans: pale blue wash
- Now:
  - tick ink: bright red
  - label ink: same family, slightly darker or equal
- Personal overlays:
  - start with a muted coral, plum-brown, deep amber, or mossy rose family

The main shift from the current live UI is:

- Gregorian spans should stop using a vivid red family
- Hebrew should use more tonal separation between ticks, labels, spans, and
  sticky context

### Suggested Intensity Hierarchy

Within a layer family, recommended emphasis should be:

1. tick
2. label
3. sticky context
4. span

Exception:

- `now` remains stronger than any structural element

This means:

- structural ticks should be the clearest physical marks
- structural labels should remain readable but less dark/saturated than ticks
- sticky labels should sit one step quieter than ordinary labels
- spans should mostly read as subtle background structure

### Suggested Opacity / Weight Targets

These are qualitative targets rather than final values:

- Gregorian ticks:
  - fully opaque or close to it
- Gregorian labels:
  - roughly medium contrast
- Gregorian sticky labels:
  - low-to-medium contrast
- Gregorian spans:
  - low opacity, thin border, subtle presence

- Hebrew ticks:
  - fully opaque or close to it
- Hebrew labels:
  - moderately desaturated compared with Hebrew ticks
- Hebrew sticky labels:
  - slightly quieter than Hebrew tick labels
- Hebrew spans:
  - noticeably lighter than Hebrew labels

- Now:
  - strongest line and strongest label contrast on the screen

- Birthday:
  - stronger than spans, weaker than `now`

### Geometry Targets

The timeline axis should remain the compositional anchor.

Recommended starting geometry:

- axis:
  - hairline or 1px
  - darkest neutral on screen
- ordinary structural ticks:
  - short
  - symmetric across the axis
- Hebrew subticks:
  - shorter than major structural ticks
  - visibly subordinate
- `now` tick:
  - much longer than ordinary ticks
  - asymmetrical to the left
- birthday markers:
  - distinct from both structural ticks and `now`
  - likely asymmetrical, but not as dominant as `now`

### Span Geometry Targets

Current one-sided span logic is the right basis.

Recommended starting rules:

- leading structural spans:
  - occupy only the left side of the axis
  - inner edge flush to the axis
- supporting structural spans:
  - occupy only the right side of the axis
  - inner edge flush to the axis
- span width should remain narrow enough to feel structural, not block-like
- span height should preserve the current 1px breathing room from boundary
  ticks

The key visual goal is:

- spans should reinforce duration without becoming the dominant object on screen

### Label Lane Targets

Current lane logic should be made more deliberate:

- far-left lane:
  - reserved for `now`
- near-left lane:
  - leading structural labels
- right lane:
  - supporting structural labels
- sticky context:
  - separate from tick-label lanes
  - attached to viewport top and bottom rather than to individual ticks

Important implication:

- lane spacing should be visually intentional, not just “whatever clears the
  tick”

### Sticky Context Targets

Sticky context should feel like reading the frame, not reading the timeline
body.

Recommended targets:

- smaller than ordinary structural labels
- somewhat heavier in weight if needed, but lower in contrast
- placed with clear top and bottom offsets
- visually stable during motion

If both Gregorian and Hebrew sticky labels are visible, their coexistence should
rely on:

- side placement
- top/bottom offset
- tonal distinction

before relying on saturation.

## Proposed First Styling Pass

The next styling implementation pass should likely do the following in order:

1. Rework Gregorian color treatment
   - especially spans and label contrast
2. Rework Hebrew tonal hierarchy
   - ticks strongest, spans lightest
3. Preserve `now` as the clearest high-emphasis element
4. Choose a distinct birthday/personal-overlay family
5. Tighten lane spacing and span flushness
6. Revisit typography only after the above is in place

## Questions To Judge During Styling

- Are Gregorian spans still too emotionally loud?
- Are Hebrew labels still too saturated relative to Hebrew ticks?
- Does `now` remain the clearest thing on screen without feeling cartoonish?
- Do sticky labels read as viewport context rather than extra timeline labels?
- Do primary and secondary spans feel clearly separated by side placement?
- Does birthday feel like the start of a coherent personal-overlay family?

## Structural Rank Recommendations

Structural rank should be local to the current scale.
For now, it should affect tick length only.

Recommended ranks:

### Gregorian

- minute:
  - primary: midnight
  - secondary: top of minute
  - ordinary: other visible second ticks
- hour:
  - primary: midnight
  - secondary: top of hour
  - ordinary: other visible minute ticks
- day:
  - primary: midnight
  - secondary: 6-hour boundaries
  - ordinary: other visible hour ticks
- week:
  - primary: first of month
  - secondary: Sunday
  - ordinary: other day ticks
- month:
  - primary: first of month
  - secondary: Sunday
  - ordinary: other day ticks
- quarter:
  - primary: quarter-start month
  - ordinary: other month ticks
- year:
  - primary: year-start month
  - secondary: unlabeled quarter-start month tick
  - ordinary: other month ticks
- decade:
  - primary: first year of the decade
  - secondary: midpoint year, such as years ending in `5`
  - ordinary: other years

### Hebrew

- minute:
  - primary: sunset boundary
  - ordinary: civil subdivision ticks
- hour:
  - primary: sunset boundary
  - ordinary: civil subdivision ticks
- day:
  - primary: sunset boundary
  - ordinary: civil-hour subdivision ticks
- week:
  - primary: first of Hebrew month
  - secondary: Shabbat
  - ordinary: other days
- month:
  - primary: first of Hebrew month
  - secondary: Shabbat
  - ordinary: other days
- quarter:
  - primary: quarter-start Hebrew month
  - secondary: other Hebrew month starts
  - ordinary: other month ticks
- year:
  - primary: Tishrei / start of Hebrew year
  - secondary: unlabeled Hebrew quarter-start tick
  - ordinary: other month ticks
- decade:
  - primary: first year after shmita (start of the current shmita cycle)
  - secondary: none
  - ordinary: other years, including shmita-labeled years

These rankings are intended as a bridge toward later transition-aware
presentation, not as the final full hierarchy model.
