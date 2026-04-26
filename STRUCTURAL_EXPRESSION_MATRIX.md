# Structural Expression Matrix

This matrix is the first rigorous source-of-truth draft for how the app’s
structural calendar systems express themselves by scale band.

It includes:

- Gregorian
- Hebrew
- life-relative

It distinguishes:

- `Current`
- `Target`
- `Gap / Tension`
- `Status`

The first version is intentionally limited to current implemented scale bands.
Future century / millennium / deep-time rows should be added later rather than
smuggled into this first pass.

## Cell Template

Each cell is described using this template:

- `Units / Boundaries`
- `Ticks`
- `Ranks`
- `Labels`
- `Spans`
- `Context`
- `Coexistence Notes`
- `Current`
- `Target`
- `Gap / Tension`
- `Status`

## Scale: Minute (`-1`)

### Gregorian

- `Units / Boundaries`
  - second internals
  - minute boundary
  - hour boundary
  - midnight/day boundary
- `Ticks`
  - second ticks
  - minute ticks
  - top-of-hour ticks
  - midnight tick
- `Ranks`
  - ordinary = second
  - secondary = minute
  - primary = hour
  - super-primary behavior at midnight
- `Labels`
  - `:05` on 5-second ticks
  - `12 PM` at top of hour
  - `12:34 PM` at top of minute
  - midnight day boundary includes weekday/day/time
  - supporting reorders midnight boundary to time-first
- `Spans`
  - alternating second/minute structural spans
- `Context`
  - sticky context includes weekday, month, day, and current minute
- `Coexistence Notes`
  - strong Gregorian local readability
  - Hebrew currently uses intraday markers rather than minute subdivision
- `Current`
  - implemented and tested
- `Target`
  - largely acceptable for current product
- `Gap / Tension`
  - broader inter-band transition normalization still deferred
- `Status`
  - settled enough for current app

### Hebrew

- `Units / Boundaries`
  - no Hebrew minute subdivision
  - named intraday markers and carried spans from day-scale intraday structure
- `Ticks`
  - named intraday markers only
- `Ranks`
  - currently all minute-scale Hebrew markers inherit day-scale intraday rank
- `Labels`
  - civil-time-first labels with Hebrew weekday/day context
  - includes seconds at minute scale
- `Spans`
  - existing intraday spans persist through minute view
  - promoted span labels may appear when a span covers the viewport
- `Context`
  - sticky context includes Hebrew weekday, month/day, and current civil minute
- `Coexistence Notes`
  - Hebrew minute view is intentionally non-subdividing
  - it behaves more like a zoom into day intraday structure than a native
    minute grid
- `Current`
  - implemented and tested
- `Target`
  - acceptable first intraday MVP
- `Gap / Tension`
  - not yet a fully theorized native Hebrew minute structure
  - strong dependence on day-view intraday semantics
- `Status`
  - implemented but underdocumented

### Life-Relative

- `Units / Boundaries`
  - birth-instant anchoring suggests possible native elapsed-minute semantics
  - no coalesced minute structure defined yet
- `Ticks`
  - none
- `Ranks`
  - none
- `Labels`
  - none
- `Spans`
  - none
- `Context`
  - none
- `Coexistence Notes`
  - likely future home for fine-grain / instant-exact life-relative truth
  - may surface first via context or span labeling rather than dense ticks
- `Current`
  - no life-relative structural implementation
- `Target`
  - likely minimal at minute scale for MVP
  - preserve conceptual room for fine-grain birth-relative boundary truth
- `Gap / Tension`
  - no implementation
  - product theory says this scale may matter, but not necessarily through full
    dense structure
- `Status`
  - documented but not implemented

## Scale: Hour (`0`)

### Gregorian

- `Units / Boundaries`
  - minute internals
  - hour boundary
  - day boundary at midnight
- `Ticks`
  - minute ticks
  - hour ticks
  - midnight tick
- `Ranks`
  - ordinary = minute
  - secondary = hour
  - primary = day
- `Labels`
  - `:05` on 5-minute ticks
  - `12:00 PM` at hour
  - midnight label includes weekday/day/time
  - supporting reorders midnight to time-first
  - DST labels can include timezone disambiguation
- `Spans`
  - alternating minute/hour structural spans
- `Context`
  - sticky context includes weekday, month, day, and hour
- `Coexistence Notes`
  - clean and stable on its own
  - Hebrew is again intraday-marker-driven rather than hour-grid-driven
- `Current`
  - implemented and tested
- `Target`
  - acceptable current behavior
- `Gap / Tension`
  - broader transition smoothing still deferred
- `Status`
  - settled enough for current app

### Hebrew

- `Units / Boundaries`
  - same carried intraday marker/spans model as minute view
- `Ticks`
  - named intraday markers only
- `Ranks`
  - inherited day-scale intraday hierarchy
- `Labels`
  - civil-time-first marker labels with Hebrew weekday/day
- `Spans`
  - day intraday spans persist
- `Context`
  - sticky context includes Hebrew weekday, date, and hour
- `Coexistence Notes`
  - again reads more like a zoom into day intraday structure than a native
    hour segmentation
- `Current`
  - implemented and tested
- `Target`
  - acceptable first intraday MVP
- `Gap / Tension`
  - no native Hebrew hour partition model
- `Status`
  - implemented but underdocumented

### Life-Relative

- `Units / Boundaries`
  - potentially relevant to fine-grain birth-relative boundaries
- `Ticks`
  - none
- `Ranks`
  - none
- `Labels`
  - none
- `Spans`
  - none
- `Context`
  - none
- `Coexistence Notes`
  - likely future home for instant-exact day/year transitions in life-relative
    reading
- `Current`
  - no structural implementation
- `Target`
  - probably not a rich grid in MVP
  - may use context or span labels instead
- `Gap / Tension`
  - theory richer than implementation
- `Status`
  - documented but not implemented

## Scale: Day (`1`)

### Gregorian

- `Units / Boundaries`
  - hour internals
  - day boundary
  - week boundary at Sunday midnight
- `Ticks`
  - 3-hour ordinary ticks
  - midnight day-boundary ticks
  - Sunday-midnight week-boundary ticks
- `Ranks`
  - ordinary = hour
  - secondary = day
  - primary = week boundary on Sunday midnight
- `Labels`
  - ordinary hours labeled every 3 hours
  - ordinary day boundary: `Wed 1, 12 AM`
  - supporting: `12 AM, 1 Wed`
  - week boundary leading: `W14, Sun 29, 12 AM`
  - week boundary supporting: `12 AM, 29 Sun, W14`
- `Spans`
  - hourly structural spans
- `Context`
  - sticky context carries weekday, month, day, year
- `Coexistence Notes`
  - one of the clearest current transition stories: `Tue 3, 12 AM -> Tue 3 ->
    3`
  - month remains sticky-context-heavy at this scale
- `Current`
  - implemented and tested
- `Target`
  - close to target
- `Gap / Tension`
  - month/year super-primary handling is still mostly sticky-only
- `Status`
  - settled enough for current app

### Hebrew

- `Units / Boundaries`
  - named intraday markers
  - named intraday spans between markers
  - `Shabbat Ends / Tzeit` special case
- `Ticks`
  - all selected named intraday markers
  - `Shkiah` as secondary boundary tick
  - `Tzeit` ordinary except `Shabbat Ends / Tzeit` primary on Saturdays
- `Ranks`
  - ordinary = most named markers
  - secondary = `Shkiah`
  - primary = `Shabbat Ends / Tzeit`
- `Labels`
  - civil time included in labels
  - `Shkiah` carries weekday + Hebrew day number
  - leading example: `Sheni 19 - Shkiah, 7:20 PM`
  - supporting example: `Shkiah, 7:20 PM - 19, Sheni`
- `Spans`
  - spans between named intraday markers
  - absolute striping
  - promoted labels available when a span covers the viewport
- `Context`
  - sticky context carries Hebrew weekday, date, year
- `Coexistence Notes`
  - currently strong as a self-contained intraday system
  - very different structural grammar from Gregorian day
- `Current`
  - implemented and tested
- `Target`
  - acceptable first Hebrew intraday MVP
- `Gap / Tension`
  - still not reconciled with broader label-composition normalization
  - proportional hours are a separate marker layer, not structural Hebrew
- `Status`
  - implemented but underdocumented

### Life-Relative

- `Units / Boundaries`
  - day of life is a first-class target unit
  - interpretation/coalescing and gross vs fine-grain matters immediately
- `Ticks`
  - none structural
- `Ranks`
  - none
- `Labels`
  - currently day-of-life can augment Gregorian/Hebrew labels when personal
    layer is visible
- `Spans`
  - none structural
- `Context`
  - none yet
- `Coexistence Notes`
  - current implementation treats life-relative as label augmentation, not as a
    third structural calendar
- `Current`
  - personal counters appended to Gregorian/Hebrew labels when personal layer is
    active
- `Target`
  - life-relative day should eventually become a genuine structural expression
    at this scale
  - interpretation and granularity choices should be surfaced in controls
- `Gap / Tension`
  - major gap: theory says third structural system; implementation is still
    marker/label augmentation only
- `Status`
  - documented but not implemented

## Scale: Week (`2`)

### Gregorian

- `Units / Boundaries`
  - day internals
  - week boundary / Sunday
  - month boundary
- `Ticks`
  - daily ticks
  - Sunday ticks
  - month-boundary ticks
- `Ranks`
  - ordinary = day
  - secondary = Sunday / week boundary
  - primary = month boundary
- `Labels`
  - ordinary leading: `Wed 1`
  - ordinary supporting: `1 Wed`
  - Sunday leading: `W14, Sun 29`
  - Sunday supporting: `29 Sun, W14`
  - month-boundary day stays lightweight: `Wed 1`
- `Spans`
  - day spans
- `Context`
  - sticky context carries `Wxx, Mon YYYY`
- `Coexistence Notes`
  - one of the clearest coexistence scales
  - Gregorian inner-slot emphasis is local weekday/day with week outward
- `Current`
  - implemented and tested
- `Target`
  - mostly close
- `Gap / Tension`
  - month boundary meaning still leans heavily on sticky context rather than
    richer in-label composition
- `Status`
  - implemented but underdocumented

### Hebrew

- `Units / Boundaries`
  - Hebrew day
  - Hebrew week rhythm via weekday / Shabbat
  - Hebrew month boundary
- `Ticks`
  - daily Hebrew boundary ticks at sunset
- `Ranks`
  - ordinary = Hebrew day
  - secondary = weekly rhythm / Shabbat
  - primary = Hebrew month boundary
- `Labels`
  - ordinary leading: `Sheni 3`
  - ordinary supporting: `3, Sheni`
  - month-boundary leading: `Iyyar, Shabbat 1`
  - month-boundary supporting: `1 Iyyar, Shabbat`
- `Spans`
  - Hebrew day spans
- `Context`
  - sticky context carries Hebrew month/year
- `Coexistence Notes`
  - strong candidate for cross-calendar slot alignment
  - current weekly identity is weekday/Shabbat rhythm, not a normalized week id
- `Current`
  - implemented and tested
- `Target`
  - partly settled, but still open around how explicit Hebrew weekly identity
    should become
- `Gap / Tension`
  - no stable Hebrew week identifier parallel to Gregorian week number
- `Status`
  - unresolved but functional

### Life-Relative

- `Units / Boundaries`
  - week of life is a first-class target unit
- `Ticks`
  - none structural
- `Ranks`
  - none
- `Labels`
  - currently week-of-life can augment Sunday/week-number labels
- `Spans`
  - none structural
- `Context`
  - none
- `Coexistence Notes`
  - this is likely one of the most important future scales for life-relative
    structure
- `Current`
  - week-of-life appears only as label augmentation when personal layer is on
- `Target`
  - life-relative week should become a real structural expression
  - potentially one of the strongest early scales for the third structural
    system
- `Gap / Tension`
  - major theory/implementation gap
- `Status`
  - documented but not implemented

## Scale: Month (`3`)

### Gregorian

- `Units / Boundaries`
  - day internals
  - Sunday / week boundary
  - month boundary
  - quarter boundary at quarter-start month
- `Ticks`
  - day ticks
  - Sunday ticks
  - month-boundary ticks
  - quarter-start month ticks
- `Ranks`
  - ordinary = day
  - secondary = week / Sunday
  - primary = month boundary
  - quarter currently behaves like a surfaced higher-order boundary
- `Labels`
  - ordinary: `17`
  - Sunday leading: `W13, 22`
  - Sunday supporting: `22, W13`
  - month boundary leading: `Apr 1`
  - month boundary supporting: `1 Apr`
  - quarter-start month leading: `Q2, Apr 1`
  - quarter-start month supporting: `1 Apr, Q2`
  - if week + month + quarter coincide: `Q4, W40, Oct 1` / `Oct 1, W40, Q4`
- `Spans`
  - day spans
- `Context`
  - sticky context carries month/year
- `Coexistence Notes`
  - very important coexistence scale
  - current implementation relies on slot stability and sticky context rather
    than heavy year carry
- `Current`
  - implemented and tested
- `Target`
  - close to target for Gregorian
- `Gap / Tension`
  - year boundary currently intentionally lightweight
- `Status`
  - settled enough for current app

### Hebrew

- `Units / Boundaries`
  - Hebrew day
  - Hebrew weekly rhythm
  - Hebrew month boundary
- `Ticks`
  - daily Hebrew boundary ticks
- `Ranks`
  - ordinary = Hebrew day
  - secondary = Shabbat rhythm / weekly emphasis
  - primary = Hebrew month boundary
- `Labels`
  - ordinary day: day number only
  - Shabbat: `Shabbat 5`
  - month-boundary Shabbat: `Iyyar, Shabbat 1`
  - supporting month-boundary Shabbat: `1 Iyyar, Shabbat`
- `Spans`
  - Hebrew day spans
- `Context`
  - sticky context carries Hebrew month/year
- `Coexistence Notes`
  - one of the most conceptually unresolved coexistence scales
  - weekly geometry and `Shabbat` label rhythm are not fully unified
- `Current`
  - implemented and tested
- `Target`
  - still under active theory, though user currently feels month view is solid
- `Gap / Tension`
  - documented audit calls this theoretically irregular even if product-feel is
    currently acceptable
- `Status`
  - unresolved but functioning

### Life-Relative

- `Units / Boundaries`
  - month of life is first-class in theory
- `Ticks`
  - none structural
- `Ranks`
  - none
- `Labels`
  - no structural month-of-life labels
- `Spans`
  - none structural
- `Context`
  - none
- `Coexistence Notes`
  - likely one of the most meaningful scales for future life-relative structure
  - current personal annotations already appear here, but as personal data layer
    not structural time
- `Current`
  - day annotations visible in month view when personal layer is on
  - no structural life-relative month implementation
- `Target`
  - month-of-life should eventually have structural expression
  - annotations remain a separate data layer on the right side
- `Gap / Tension`
  - current month-level personal presence is annotation/data, not structure
- `Status`
  - documented but not implemented

## Scale: Quarter (`4`)

### Gregorian

- `Units / Boundaries`
  - week internals
  - month boundary
  - quarter boundary
- `Ticks`
  - week-number ticks throughout
  - stronger month-boundary ticks
  - quarter-start month tick
- `Ranks`
  - ordinary = week
  - secondary = month
  - primary = quarter
- `Labels`
  - week internals: `W15`
  - month boundary: `May`
  - quarter start: `Q2, Apr` / `Apr, Q2`
  - week + month start: `Feb, W6` / `W6, Feb`
- `Spans`
  - weekly spans
- `Context`
  - sticky context carries year
- `Coexistence Notes`
  - Gregorian quarter is week-forward
- `Current`
  - implemented and tested
- `Target`
  - accepted current behavior
- `Gap / Tension`
  - asymmetry with Hebrew quarter is intentional but still notable
- `Status`
  - settled enough for current app

### Hebrew

- `Units / Boundaries`
  - Hebrew month
  - Hebrew quarter boundary
- `Ticks`
  - month ticks only by default
  - optional quarter-start month emphasis
  - no ordinary week internals
- `Ranks`
  - secondary = month
  - primary = quarter-start month
- `Labels`
  - ordinary month: `Iyyar`
  - quarter-start month: `Q3, Nisan` / `Nisan, Q3`
- `Spans`
  - monthly spans
- `Context`
  - sticky context carries Hebrew year
- `Coexistence Notes`
  - Hebrew quarter is month-forward and intentionally lighter than Gregorian
    quarter
- `Current`
  - implemented and tested
- `Target`
  - intentionally asymmetric for now
- `Gap / Tension`
  - may need revisiting if Hebrew weekly identity becomes richer later
- `Status`
  - implemented but intentionally asymmetric

### Life-Relative

- `Units / Boundaries`
  - quarter-of-life is not first-class for now
- `Ticks`
  - none
- `Ranks`
  - none
- `Labels`
  - none
- `Spans`
  - none
- `Context`
  - none
- `Coexistence Notes`
  - no reason to force quarter-of-life into MVP
- `Current`
  - no implementation
- `Target`
  - intentionally not first-class for now
- `Gap / Tension`
  - none if kept explicitly out of scope
- `Status`
  - intentionally deferred

## Scale: Year (`5`)

### Gregorian

- `Units / Boundaries`
  - month internals
  - quarter starts
  - year start
- `Ticks`
  - month ticks
  - unlabeled quarter ticks at Apr/Jul/Oct
  - January tick with year label
- `Ranks`
  - ordinary = month
  - secondary = unlabeled quarter
  - primary = January / year start
- `Labels`
  - ordinary month: `Apr`
  - January leading: `2026, Jan`
  - January supporting: `Jan 2026`
- `Spans`
  - monthly spans
- `Context`
  - sticky context carries year
- `Coexistence Notes`
  - one of the most elegant coexistence scales
- `Current`
  - implemented and tested
- `Target`
  - close to target
- `Gap / Tension`
  - quarter remains geometric-only here
- `Status`
  - settled enough for current app

### Hebrew

- `Units / Boundaries`
  - Hebrew month
  - Hebrew year start at Tishrei
  - unlabeled quarter-start overlays
- `Ticks`
  - month ticks
  - unlabeled quarter-start ticks
  - Tishrei with year
- `Ranks`
  - ordinary = month
  - secondary = unlabeled quarter
  - primary = Tishrei / year start
- `Labels`
  - ordinary month: `Iyyar`
  - Tishrei leading: `5786, Tishrei`
  - Tishrei supporting: `Tishrei 5786`
- `Spans`
  - monthly spans
- `Context`
  - sticky context carries Hebrew year
- `Coexistence Notes`
  - closely parallels Gregorian year view and coexists well
- `Current`
  - implemented and tested
- `Target`
  - close to target
- `Gap / Tension`
  - none major beyond broader normalization polish
- `Status`
  - settled enough for current app

### Life-Relative

- `Units / Boundaries`
  - year of life is first-class in theory
  - age is a parallel but distinct concept
- `Ticks`
  - current birthday anniversary markers only
- `Ranks`
  - marker-layer behavior only, not structural
- `Labels`
  - `Age N` at Gregorian birth anniversaries
- `Spans`
  - none structural
- `Context`
  - none
- `Coexistence Notes`
  - current implementation conflates personal yearly expression with marker-only
    birthday anniversaries
- `Current`
  - anniversary markers rendered through `birthday` layer id labeled `Personal`
- `Target`
  - year-of-life should become structural
  - age should remain available as a distinct colloquial reading
  - Gregorian interpretation can anchor MVP yearly boundaries
- `Gap / Tension`
  - large gap between current marker-only behavior and target structural theory
- `Status`
  - documented but not implemented

## Scale: Scale 6 / Shmita-Decade (`6`)

### Gregorian

- `Units / Boundaries`
  - year internals
  - 5-year midpoint
  - decade boundary
- `Ticks`
  - yearly ticks
  - stronger 5-year ticks
  - strongest decade ticks
- `Ranks`
  - ordinary = year
  - secondary = year ending in 5
  - primary = year ending in 0
- `Labels`
  - every year labeled, e.g. `2026`
- `Spans`
  - yearly spans
- `Context`
  - no sticky context
- `Coexistence Notes`
  - very simple and thin compared with Hebrew scale 6
- `Current`
  - implemented
- `Target`
  - acceptable current behavior
- `Gap / Tension`
  - strong asymmetry with Hebrew scale 6
- `Status`
  - implemented but intentionally asymmetric

### Hebrew

- `Units / Boundaries`
  - Hebrew year
  - shmita year marking
  - first post-shmita year emphasis
- `Ticks`
  - yearly ticks
  - first post-shmita year primary tick
  - shmita year textually marked
- `Ranks`
  - ordinary = year
  - primary = first post-shmita year
  - shmita year gets special text but not a parallel rank model
- `Labels`
  - ordinary: `5786`
  - leading shmita year: `Shmita 5782`
  - supporting shmita year: `5782, Shmita`
- `Spans`
  - yearly spans
- `Context`
  - no sticky context
- `Coexistence Notes`
  - much richer cycle semantics than Gregorian at this band
- `Current`
  - implemented and tested
- `Target`
  - acceptable for now, but clearly divergent
- `Gap / Tension`
  - larger-scale coexistence theory not normalized here
- `Status`
  - implemented but intentionally asymmetric

### Life-Relative

- `Units / Boundaries`
  - seven-year cycle is first-class in theory
  - larger life-relative expression is still open
- `Ticks`
  - none
- `Ranks`
  - none
- `Labels`
  - none
- `Spans`
  - none
- `Context`
  - none
- `Coexistence Notes`
  - this is where life-relative may eventually need a transformed, lower-density
    structural expression
- `Current`
  - no implementation
- `Target`
  - seven-year cycle likely belongs here or across adjacent larger human-life
    scales
  - exact expression intentionally open
- `Gap / Tension`
  - theory says meaningful; implementation absent; expression form unresolved
- `Status`
  - unresolved

## Cross-Cutting Notes

- Gregorian and Hebrew are reasonably well articulated across current scale
  bands, though Hebrew month/quarter and Hebrew intraday remain more open.
- Life-relative is now much better defined in theory than in implementation.
- The current app still treats life-relative mostly as:
  - personal counters
  - anniversary markers
  - personal data overlays
  rather than as a third structural calendar.
- The biggest current theory/implementation gap is therefore life-relative.
- The most mature coexistence scales remain:
  - week
  - month
  - year
- The least normalized areas are:
  - Hebrew intraday
  - Hebrew month theory
  - large-scale asymmetry at scale 6
  - all structural expression for life-relative
