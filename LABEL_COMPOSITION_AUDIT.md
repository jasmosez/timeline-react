# Label Composition Audit

This document is meant to do three things at once:

1. state the design theory we are uncovering
2. record the current implemented behavior precisely
3. describe a principled target state without pretending every rule is already
   settled

It is intentionally broader than a list of current labels. The real system here
includes:

- tick rank
- label cadence
- label composition
- sticky context content
- suppression rules
- optional span lanes
- higher-order transition cues

## Scope

In scope:

- Gregorian and Hebrew structural layers
- leading vs supporting calendar roles
- ordinary / secondary / primary tick rank
- higher-order transitional meaning
- sticky context labels as part of information allocation

Out of scope for this pass:

- exact CSS/styling
- `now` and birthday markers
- final collision-resolution implementation
- final Hebrew intraday/zmanim semantics

## Design Theory

### 1. Treat Tick Rank As The Structural Spine

The most important distinction this audit needs to preserve is:

- a tick can exist without being labeled
- a labeled tick can still share the same rank as unlabeled ticks nearby
- rank does not automatically imply label presence

So we should reason with at least these layers:

- tick rank:
  how structurally important a rendered boundary is in the current scale band
- label cadence:
  which instances of a rank usually receive text
- label composition:
  what data the label contains when it is shown

When necessary, the document can also name the boundary family represented by a
rank, such as:

- second boundary
- minute boundary
- hour boundary
- day boundary

But those boundary families are subordinate to the rank structure. They do not
need their own top-level “tick cadence” section if that section is only
repeating what the ranks already imply.

### 2. Default Rank Model By Scale Band

The cleanest default theory currently emerging is:

- `ordinary` ticks represent the next finer unit
- `secondary` ticks represent the current scale band’s native unit
- `primary` ticks represent the next coarser unit

Examples:

- minute:
  - ordinary = second
  - secondary = minute
  - primary = hour
- hour:
  - ordinary = minute
  - secondary = hour
  - primary = day
- week:
  - ordinary = day
  - secondary = week
  - primary = month

This should be treated as the default law, not as a guarantee that every scale
already follows it.

### 3. Transitional Meaning: Primary and Super-Primary

A primary tick is not the whole transitional story.

We also care about higher-scale boundaries that are still being surfaced inside
the current scale with some kind of distinguishing treatment. This document
calls those **super-primary** cases.

That treatment does not have to be a dedicated text label. It may be:

- richer in-tick composition
- a distinct rank or geometry treatment
- a sticky-context shift that coincides with the boundary
- or some combination of these

So `super-primary` is broader than “the immediate parent scale’s primary
boundary.” It means:

- a surfaced higher-order boundary that outranks the current scale’s primary
  boundary in semantic scope

Examples:

- minute:
  - hour boundary is primary
  - day boundary at midnight is super-primary
- hour:
  - day boundary is primary
  - week boundary would be super-primary if surfaced
- week:
  - month boundary is primary
  - quarter boundary would be super-primary if surfaced
- more generally:
  - a first-of-year marker inside hour or day view could also count as
    super-primary if it received explicit distinguishing treatment

`super-primary` is currently a composition concept more than an implemented
universal rank. We do not need to add it to code yet in order to reason with it
here.

### 4. Leading vs Supporting Ordering

The current design direction is:

- leading labels tend to read outside-in
- supporting labels tend to read inside-out

In plainer terms:

- leading can foreground broader structural meaning
- supporting should usually place the datum nearest the axis first

This is not a pure symmetry rule. It is a spatial-reading rule.

### 5. Label Composition Parts

The current code does not yet model explicit label parts, but the design logic
is clearly circling around them.

#### Element Vocabulary

The current label system should be understood as drawing from a bounded set of
calendar-specific elements.

Gregorian elements:

- year
- quarter
- month
- week number
- weekday
- day
- hour
- minute
- second
- meridiem (`AM/PM`)
- timezone qualifier

Hebrew elements:

- shmita cycle number
- shmita label
- year
- quarter
- month
- week identity
- weekday
- day
- intraday element(s), still TBD

Important note:

- Gregorian week identity is currently explicit via week number
- Hebrew week identity is not yet normalized the same way
- today it is mostly structural rhythm rather than a stable label element
- later it may be optional parsha, another weekly identifier, or remain mostly
  geometric depending on product decisions

Useful conceptual parts include:

- `local`
  the datum nearest the axis
- `band`
  the current scale band’s native identity
- `parent`
  the next coarser boundary
- `superPrimary`
  any surfaced higher-order boundary that exceeds the current scale’s primary
  boundary in scope
- `cycle`
  longer-span context like `Q2`, `W14`, `Shmita`, or a future shmita cycle
  number
- `clock`
  civil time, especially at intraday boundary moments
- `stickyContext`
  the context already supplied by the sticky top/bottom labels

The design problem is not just “what data exists.” It is:

- which elements are available at a given scale
- which elements belong to ordinary / secondary / primary / super-primary
  labels
- which can be offloaded to sticky context
- which should be suppressed as redundant
- and how the same element set should be ordered differently in leading and
  supporting roles

### 6. Near-Axis Priority and Column Stability

The most important symmetry rule is not that labels on both sides should be
perfect mirrors. It is that the innermost element should be stable and
predictable enough to scan with minimal friction.

Principle:

- the element nearest the axis should be the most stable, locally identifying
  datum for that scale

Why this matters:

- the eye scans vertically along the axis first
- the innermost element is ingested with the least friction
- stable inner slots make it easier to compare ticks up and down the timeline
- that stability helps tick-length/rank differences remain visually salient
- if the first or second slot changes semantic role unpredictably, the text can
  overpower the geometric hierarchy

So labels should be thought of not just as strings, but as ordered slots or
columns:

- inner slot
- middle slot(s)
- outer slot

The target is not literal fixed character widths. It is consistent slot role.

This is especially important when deciding:

- leading vs supporting ordering
- combined-rank labels
- when to add or omit a larger contextual element
- when sticky context makes additional in-label context unnecessary

### 7. Sticky Context Is Part of the System

Sticky context labels are not merely interface chrome. They are part of the
information-allocation strategy.

They affect what ordinary, secondary, primary, and super-primary labels do or
do not need to say.

Questions they directly influence:

- how much month/year context a tick label should carry
- when a richer boundary label is necessary
- when a super-primary label can stay compact because sticky context is doing
  enough work already

### 8. Label Cadence vs Label Suppression

These are closely related, but not identical.

- label cadence:
  the default intended frequency of labels
- label suppression:
  context-sensitive removal of labels that would otherwise appear

Examples:

- minute view labeling every 5 seconds is cadence
- hiding a label because it is too close to a stronger boundary label is
  suppression

For design purposes, they belong in the same family and should be audited
together.

### 9. Spans Want the Same Architecture

The same structure likely applies to spans:

- ordinary spans
- secondary spans
- primary spans

Not every scale needs all of these, but the system should be able to express
them coherently rather than through one-off special cases.

## Current State

This section tries to record what the app does now, not what it ideally should
do.

For each scale, the current-state shape is:

- ordinary tick
- secondary tick
- primary tick
- super-primary case
- label cadence
- label composition
- sticky context
- mismatch notes

## Gregorian: Current State

### Minute

Ordinary tick:

- represents non-minute second boundaries

Secondary tick:

- represents minute boundaries, including top-of-hour boundaries

Primary tick:

- currently only the midnight / day-boundary case

Super-primary case:

- not separately represented from the current primary tick

Current-state note:

- current implementation differs from the cleaner target model here:
  top-of-hour is not primary on its own; it is only a richer secondary case,
  and midnight is the only primary case

Label cadence:

- ordinary labels appear every 5 seconds
- secondary labels appear at top of minute
- primary labels appear only at midnight/day boundary

Label composition:

- ordinary: `:05`
- secondary: `2:01 AM`
- primary: `Wed 1, 12:00 AM`
- supporting primary: `12:00 AM, 1 Wed`

Sticky context:

- current sticky context carries weekday, date, and current minute

Combined-rank behavior:

- midnight currently collapses hour/day information into one richer boundary
  label
- the old first-visible-tick context behavior is still a vestigial special case
  in the underlying scale config and can still affect minute labeling in current
  code

Element notes:

- inner slot is effectively seconds for ordinary labels and hour/minute for
  stronger labels
- current implementation is not yet explicitly preserving slot-role language;
  it is achieving it indirectly

### Hour

Ordinary tick:

- represents minute boundaries

Secondary tick:

- represents hour boundaries

Primary tick:

- represents day boundaries

Super-primary case:

- not surfaced yet

Current-state note:

- as in minute view, implementation still expresses too much of this structure
  through label cadence rather than through a fully explicit rank model

Label cadence:

- ordinary labels every 5 minutes
- secondary labels every hour
- primary labels at day boundaries

Label composition:

- ordinary: `:05`
- secondary: `6:00 AM`
- primary: `Wed 1, 12:00 AM`
- supporting primary: `12:00 AM, 1 Wed`

Sticky context:

- current sticky context carries weekday, date, and current hour

Combined-rank behavior:

- repeated hours or DST-shift hours can gain timezone clarification

Element notes:

- timezone qualifier is currently a conditional composition element, not a
  separate rank signal

### Day

Ordinary tick:

- represents hour boundaries

Secondary tick:

- currently represents every 6 hours

Primary tick:

- currently represents day boundaries

Super-primary case:

- not currently surfaced as its own explicit case

Label cadence:

- ordinary labels are sparse
- secondary labels appear every 3 hours
- primary labels appear at day boundaries

Label composition:

- secondary: `3 AM`
- primary: `Wed 1, 12 AM`
- supporting primary: `12 AM, 1 Wed`

Sticky context:

- current sticky context carries weekday, month, day, year

Combined-rank behavior:

- day boundary currently works as both current-band identity and stronger
  transitional label

Mismatch notes:

- this is one of the clearest places where current state may not match the
  cleaner theory
- the 6-hour rank / 3-hour label split appears useful visually, but
  conceptually it may want to be
  label cadence or visual emphasis rather than true rank
- this is also a scale where the inner-slot rule is not yet clearly normalized

### Week

Ordinary tick:

- represents day boundaries

Secondary tick:

- represents week boundaries / Sundays

Primary tick:

- not currently implemented as a separate overlaid tick; month-boundary meaning
  is mostly carried through combined label composition and sticky context

Super-primary case:

- not surfaced

Label cadence:

- daily labels shown
- Sunday labels richer

Label composition:

- ordinary: `Wed 1`
- secondary leading: `W14, Sun 29`
- secondary supporting: `Sun 29, W14`

Sticky context:

- current sticky context carries month/year context

Combined-rank behavior:

- a month-boundary day currently stays fairly lightweight and relies heavily on
  sticky context rather than richer in-label month composition

### Month

Ordinary tick:

- represents day boundaries

Secondary tick:

- represents Sunday / week boundaries

Primary tick:

- represents first of month

Super-primary case:

- year boundary is currently handled mainly through composition and sticky
  context rather than a separate explicit category

Label cadence:

- ordinary labels appear on day ticks
- Sunday labels are richer
- month-boundary labels are richer

Label composition:

- ordinary: `17`
- secondary leading: `W11, 8`
- secondary supporting: `8, W11`
- primary: `Apr 1`
- primary + secondary leading: `W31, Aug 1`
- primary + secondary supporting: `Aug 1, W31`

Sticky context:

- current sticky context carries month/year

Combined-rank behavior:

- month view is currently one of the strongest examples of explicit composition
  done well
- current code still allows the first visible tick to pick up month context even
  when it is not the first of the month

Element notes:

- week number behaves like a middle/outer slot element rather than the inner
  slot
- day stays as the innermost local identifier

### Quarter

Ordinary tick:

- represents week boundaries

Secondary tick:

- represents month boundaries

Primary tick:

- represents quarter-start month

Super-primary case:

- year boundary is not currently surfaced as a distinct in-label case

Label cadence:

- ordinary week labels shown
- month labels shown at boundaries
- quarter labels shown at quarter starts

Label composition:

- ordinary: `W15`
- secondary: `May`
- primary leading: `Q2, Apr`
- primary supporting: `Apr, Q2`

Sticky context:

- current sticky context carries the year

Combined-rank behavior:

- week/month/quarter information currently coexists, but collision handling is
  largely visual rather than conceptually normalized

Element notes:

- quarter view already behaves as a multi-element composition system:
  week number, month, quarter

### Year

Ordinary tick:

- represents month boundaries

Secondary tick:

- unlabeled quarter-start tick at April, July, October

Primary tick:

- January / year start

Super-primary case:

- none surfaced

Label cadence:

- every month labeled
- year appears only on January
- quarter overlays are unlabeled

Label composition:

- primary leading: `2026, Jan`
- primary supporting: `Jan 2026`
- ordinary: `Apr`

Sticky context:

- current sticky context carries year context

Combined-rank behavior:

- quarter structure is intentionally partly non-textual at this scale

Element notes:

- the month remains the inner/local text element
- year is only added at January
- quarter is currently geometric only

### Decade

Ordinary tick:

- represents year boundaries

Secondary tick:

- year ending in `5`

Primary tick:

- year ending in `0`

Super-primary case:

- none surfaced

Label cadence:

- every year labeled

Label composition:

- atomic year labels such as `2026`

Sticky context:

- no sticky context

Combined-rank behavior:

- rank currently affects geometry, not text

Element notes:

- current decade view is intentionally text-simple

## Hebrew: Current State

### Minute

Ordinary tick:

- placeholder civil-second boundaries

Secondary tick:

- not cleanly differentiated yet

Primary tick:

- sunset boundary

Super-primary case:

- not cleanly articulated yet in current implementation

Label cadence:

- sunset boundary gets a label
- civil subdivision follows Gregorian-like placeholder cadence

Label composition:

- sunset label: `7:15:05 PM, Revi'i 14`

Sticky context:

- current sticky context carries weekday, date, and minute

Combined-rank behavior:

- Hebrew minute view is still a placeholder composition regime because the
  underlying intraday model is not yet zmanim/proportional-hour based

Element notes:

- current labels use clock + weekday + day
- this should be treated as provisional, not final compositional theory
- placeholder civil subticks currently inherit some Gregorian first-visible-tick
  behavior through the shared scale helpers

### Hour

Ordinary tick:

- placeholder civil-minute boundaries

Secondary tick:

- not cleanly differentiated yet

Primary tick:

- sunset boundary

Super-primary case:

- not surfaced yet

Label cadence:

- sunset boundary labeled
- civil-minute labels shown at placeholder cadence

Label composition:

- sunset label: `7:15 PM, Revi'i 14`

Sticky context:

- current sticky context carries weekday, date, and hour

Element notes:

- current labels again use clock + weekday + day as the provisional element set
- placeholder civil subticks currently inherit some Gregorian first-visible-tick
  behavior through the shared scale helpers

### Day

Ordinary tick:

- placeholder civil-hour boundaries

Secondary tick:

- not cleanly differentiated yet

Primary tick:

- sunset boundary

Super-primary case:

- not surfaced yet

Label cadence:

- sunset boundary labeled
- civil-hour labels follow placeholder cadence

Label composition:

- sunset label: `7:15 PM, Revi'i 14`

Sticky context:

- current sticky context carries weekday, date, year

Combined-rank behavior:

- midnight is intentionally ordinary in Hebrew day logic

Element notes:

- current day-scale Hebrew boundary labels intentionally omit month

### Week

Ordinary tick:

- Hebrew day boundary

Secondary tick:

- first day after `Shabbat`

Primary tick:

- first of Hebrew month

Super-primary case:

- not surfaced

Label cadence:

- daily labels shown
- month-boundary labels richer

Label composition:

- ordinary leading: `Sheni 10`
- ordinary supporting: `10, Sheni`
- secondary leading: `Rishon 14`
- secondary supporting: `14, Rishon`
- primary leading: `Iyyar, Shabbat 1`
- primary supporting: `1 Iyyar, Shabbat`

Sticky context:

- current sticky context carries Hebrew month/year

Combined-rank behavior:

- when the first of the month lands on `Shabbat`, the weekly-emphasis tick is
  still the following `Rishon`
- leading and supporting order diverge more strongly here than in Gregorian

Element notes:

- supporting labels currently preserve the day number nearer the axis more
  clearly than leading labels do

### Month

Ordinary tick:

- Hebrew day boundary

Secondary tick:

- post-`Shabbat` weekly boundary in geometry

Primary tick:

- first of Hebrew month

Super-primary case:

- not surfaced

Label cadence:

- ordinary labels usually just day number
- `Shabbat` gets richer label treatment
- first of month gets richer label treatment

Label composition:

- ordinary: `12`
- rhythm cue leading: `Shabbat 5`
- rhythm cue supporting: `5, Shabbat`
- primary leading: `Iyyar 1`
- primary supporting: `1 Iyyar`
- primary + rhythm cue leading: `Iyyar, Shabbat 1`
- primary + rhythm cue supporting: `1 Iyyar, Shabbat`

Sticky context:

- current sticky context carries Hebrew month/year

Mismatch notes:

- this scale mixes geometric weekly emphasis and label-side `Shabbat` rhythm in
  a way that is understandable but not fully normalized yet

Element notes:

- month, weekday/rhythm, and day are all participating as composition elements
  here

### Quarter

Ordinary tick:

- none currently rendered

Secondary tick:

- non-quarter-start Hebrew month

Primary tick:

- quarter-start Hebrew month

Super-primary case:

- not surfaced

Label cadence:

- month labels shown
- quarter labels shown at quarter starts

Label composition:

- primary leading: `Q3, Nisan`
- primary supporting: `Nisan, Q3`
- secondary: `Iyyar`

Sticky context:

- current sticky context carries Hebrew year

Combined-rank behavior:

- quarter currently avoids the week-label problem by simply not rendering Hebrew
  week internals at all

Element notes:

- current Hebrew quarter composition is intentionally lightweight until week
  identity/parsha decisions are made

### Year

Ordinary tick:

- Hebrew month boundary

Secondary tick:

- unlabeled Hebrew quarter-start overlay

Primary tick:

- Tishrei / start of Hebrew year

Super-primary case:

- none surfaced

Label cadence:

- every Hebrew month labeled
- year included only at Tishrei
- quarter overlays unlabeled

Label composition:

- primary leading: `5786, Tishrei`
- primary supporting: `Tishrei 5786`
- ordinary: `Nisan`

Sticky context:

- current sticky context carries Hebrew year

### Scale 6: Decade / Shmita

Ordinary tick:

- most Hebrew year boundaries

Secondary tick:

- none currently used

Primary tick:

- first year after shmita

Super-primary case:

- none surfaced

Current-state note:

- the shmita year itself is ordinary-rank but gets special label text

Label cadence:

- every year labeled

Label composition:

- leading post-shmita primary: `5783`
- supporting post-shmita primary: `5783`
- leading shmita year: `Shmita 5789`
- supporting shmita year: `5789, Shmita`
- ordinary year: `5786`

Sticky context:

- no sticky context

Combined-rank behavior:

- rank and label content are deliberately decoupled here
- future backlog item:
  add shmita cycle numbering to the post-shmita primary label

Element notes:

- shmita-scale Hebrew is already using a richer cycle element vocabulary than
  Gregorian decade view

## Target State

This section captures where the system seems to want to go, not what we must
force immediately.

## Cross-Cutting Target Principles

### 1. Remove First-Visible-Tick Special Labels

This is a vestige of a less dynamic timeline.

Target rule:

- first-visible-tick differences should be removed
- sticky context should solve the context problem those labels were previously
  solving

### 2. Normalize Tick Cadence vs Label Cadence

Target rule:

- ordinary/secondary/primary should describe structural ticks
- label cadence should be a separate explicit rule

This especially matters in minute, hour, and day views.

### 3. Use the Default Rank Model More Consistently

Target default:

- ordinary = next finer unit
- secondary = current scale band unit
- primary = next coarser unit

Explicit deviations should be documented rather than allowed to remain implicit.

### 4. Treat Super-Primary as a Real Composition Concept

Target rule:

- when a higher-order boundary is surfaced inside the current scale, it should
  be treated as a special composition case
- this does not yet require a universal fourth code-level rank

### 5. Make Sticky Context Part of the Allocation Contract

For each scale we should be able to answer:

- what information is guaranteed by sticky context
- what ordinary labels may omit because of that
- what secondary labels still need to add
- what primary or super-primary labels must still say explicitly

### 6. Model Label Composition Explicitly

Target refactor direction:

- define explicit label parts
- define scale-specific composition recipes
- define leading/supporting ordering against those parts

Rather than:

- accumulating more formatter-specific string branching

And do so with explicit awareness of:

- which element should occupy the inner slot
- which elements may move outward
- which elements should be sticky-context-only at a given scale
- which combined-rank cases genuinely need unioned element sets

## Gregorian: Target Direction

### Minute

Desired structure:

- ordinary ticks = every second
- secondary ticks = every minute
- primary ticks = every hour
- super-primary case = day boundary at midnight

Desired label cadence:

- ordinary labels only every 5 seconds by default
- secondary labels every minute
- primary labels every hour
- super-primary labels richer at midnight/day boundary

Desired composition:

- ordinary: local seconds only
- secondary: full minute label like `2:01 AM`
- primary: same clock format, not a shortened `2 AM`
- super-primary: add weekday/day context

### Hour

Desired structure:

- ordinary ticks = every minute
- secondary ticks = every hour
- primary ticks = every day boundary
- super-primary case = week boundary if surfaced later

Desired label cadence:

- ordinary labels every 5 minutes by default
- secondary labels every hour
- primary labels every day boundary

Desired composition:

- ordinary: minute-only
- secondary: `6:00 AM`
- primary: `Wed 1, 12:00 AM`
- supporting primary: `12:00 AM, 1 Wed`

### Day

Desired structure (likely):

- ordinary ticks = every hour
- secondary ticks = day boundary
- primary ticks = week boundary
- super-primary case = month boundary

This is a likely future refactor target, not current behavior.

Desired label cadence:

- ordinary labels sparse, possibly every few hours
- secondary labels at every day boundary
- primary labels at week boundaries

Desired composition:

- ordinary: hour
- secondary: day boundary with time
- primary: day boundary plus week number
- super-primary: possibly include month if needed, but only if sticky context is
  not enough

### Week

Desired structure:

- ordinary = day
- secondary = week boundary
- primary = month boundary
- super-primary = quarter boundary if surfaced later

Desired composition:

- ordinary: local weekday/day
- secondary: add week number
- primary: decide explicitly whether month should remain sticky-only or enter
  the label

Current intuition:

- sticky context may be sufficient for many month-boundary cases here

### Month

Desired structure:

- ordinary = day
- secondary = week boundary / Sunday
- primary = month boundary
- super-primary = year boundary

Desired composition:

- current month view is already close to a principled target
- year boundary may remain lightweight if sticky context continues to do enough
  work

### Quarter

Desired structure:

- ordinary = week
- secondary = month
- primary = quarter
- super-primary = year

Desired composition:

- ordinary: week number
- secondary: month
- primary: quarter + month
- super-primary: likely rely heavily on sticky context unless we later want
  explicit year carry-in

### Year

Desired structure:

- ordinary = month
- secondary = quarter
- primary = year start

Desired composition:

- month nearest axis
- year carried only at January
- quarter can remain geometric/unlabeled unless we later decide that quarter
  labels add enough value

### Decade

Desired structure:

- ordinary = year
- secondary = midpoint year
- primary = decade start

Desired composition:

- keep labels atomic unless a stronger reason emerges

## Hebrew: Target Direction

### Minute / Hour / Day

Target direction:

- stop overfitting the current civil-time placeholder regime
- treat these scales as provisional until zmanim/proportional-hour design lands

Likely target:

- ordinary/secondary/primary should eventually be rethought around Hebrew
  intraday structure rather than inherited civil cadence
- sunset will remain a key transitional/super-primary moment

### Week

Desired structure:

- ordinary = Hebrew day
- secondary = Hebrew week boundary after `Shabbat`
- primary = first of Hebrew month
- super-primary = Hebrew quarter/year boundary if surfaced later

Desired composition:

- supporting labels should keep the day number nearest the axis
- leading labels may foreground the month transition more strongly

### Month

Desired structure:

- ordinary = Hebrew day
- secondary = weekly Hebrew rhythm / boundary
- primary = first of Hebrew month

Desired composition:

- this scale needs clearer normalization between:
  - weekly geometry
  - `Shabbat` label cue
  - month-boundary composition

### Quarter

Desired structure:

- ordinary = probably still none for now
- secondary = Hebrew month
- primary = Hebrew quarter start
- future optional layer:
  Hebrew week/parsha internals

Desired composition:

- keep the current month/quarter system lightweight until parsha/toggle
  decisions are made

### Year

Desired structure:

- ordinary = Hebrew month
- secondary = Hebrew quarter
- primary = Hebrew year start

Desired composition:

- current unlabeled quarter ticks feel like a good target for now

### Scale 6: Decade / Shmita

Desired structure:

- ordinary = Hebrew year
- primary = first year after shmita
- super-primary may eventually be a larger long-span cycle if the app grows
  there

Desired composition:

- keep shmita year explicitly labeled
- enrich the post-shmita primary tick with cycle number later
- do not pretend this band is a normal Hebrew decade

## Major Current Mismatches To Resolve Later

1. minute/hour/day currently blur tick cadence and label cadence
2. day view likely wants a rank rethink
3. Hebrew intraday structure is still provisional
4. combined-rank composition is still implemented as formatter branching rather
   than explicit composition data
5. sticky context’s role in reducing super-primary label burden is still only
   partially articulated

## Recommended Next Design Move

Before further label-code deepening, the next step should be:

1. use this document to normalize the theory
2. identify the clearest mismatch to fix first, probably day view
3. define explicit label parts and composition recipes
4. only then refactor formatter code toward that model
