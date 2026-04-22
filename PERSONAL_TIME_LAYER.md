# Personal Time Layer

## Purpose

The personal time layer interprets the canonical timeline through the lived time
of a person rather than only through shared civil calendar structure.

This layer family should eventually support:

- ongoing life-position counters such as day-of-life and week-of-life
- annual anniversaries in more than one calendar system
- day annotations keyed to lived days
- longer personal cycles such as seven-year spans
- multiple named people

The important framing is that "birthday" is too narrow a name for the full
product direction. The deeper idea is personal time.

## Core Design Tension

Birth information is entered in Gregorian terms, but it immediately participates
in multiple calendar interpretations:

- Gregorian input date and time
- the corresponding Hebrew date
- recurring Gregorian anniversaries
- recurring Hebrew anniversaries
- lived-time counters such as day-of-life and week-of-life

This means the personal time layer cannot assume that one anniversary model is
canonical. A person has one birth event, but multiple meaningful recurrence
systems.

## Conceptual Model

### Person Profile

A person profile should eventually include:

- display name
- birth instant entered in Gregorian context
- birth location
- birth timezone or explicitly chosen local-date interpretation
- derived Hebrew birth date

The first product slice can still focus on one primary person, but the data
model should be honest that multiple people are a future use case.

### Birth Event vs Recurrences

We should distinguish:

- the birth event itself
- Gregorian yearly anniversaries of that event
- Hebrew yearly anniversaries of the corresponding Hebrew birth date
- lived-time counters derived from the person's local-date progression

This distinction matters because these are not all the same thing.

### Date-Based vs Instant-Based Personal Time

For this product, the most important personal counters are date-based rather
than pure elapsed-time calculations.

That means:

- day-of-life is tied to the person's local calendar date
- week-of-life is tied to seven-day groupings from the birth date
- these do not wait for the birth-time anniversary inside the day

For example:

- April 19, 1982 is Day 1
- the first week can be partial
- week 1 begins on the birth date and covers the first seven date-based days

This is the right human-centered interpretation for the current product.

## Personal Time Features

### 1. Running Counters

These answer:

- what day of life is this?
- what week of life is this?

Current design direction:

- day-of-life counts the birth date as day 1
- week-of-life counts the first seven-day block as week 1, even if it is not
  aligned to a civil week boundary

These are likely to surface primarily as labels, context, and optional marker
annotations rather than as dense always-on structural geometry.

### 2. Anniversaries

These answer:

- when is the person's Gregorian birthday anniversary?
- when is the person's Hebrew birthday anniversary?

Both are valid and should be modeled explicitly.

Gregorian anniversaries:

- recur yearly on the Gregorian month/day of birth
- probably default to point markers

Hebrew anniversaries:

- recur yearly on the Hebrew month/day of the corresponding Hebrew birth date
- move relative to the Gregorian calendar
- should be treated as a parallel valid anniversary system, not an exotic
  afterthought

### 3. Longer Personal Cycles

Examples:

- seven-year life cycles
- eventually other custom developmental or ritual cycles

These are naturally expressed as spans rather than points.

### 4. Day Annotations

Day annotations are a first authored-meaning surface inside personal time.

Current MVP direction:

- one annotation per day-of-life
- annotation belongs to the personal layer and is visible only when that layer
  is on
- fields:
  - `plans`
  - `journal`
  - manual `journaledOnDay`
- visibility:
  - month view: truncated preview
  - week view: wrapped preview
  - not shown at day-and-below or quarter-and-above
- presentation:
  - right-side-only personal note surface
  - spreadsheet-like side-by-side columns for `plans` and `journal`
  - inline editing rather than a sidebar editor
- storage:
  - local-only MVP storage is acceptable
  - durable persistence and version history are later concerns

The key point is that these are not generic Gregorian date notes. They are
notes attached to a person's lived days, with day-of-life as the dominant key.

### 5. Multiple People

Later, the same system should support:

- partner birthdays
- children
- parents
- friends

This is likely the first bridge from personal time into broader custom marker
and span functionality.

## Calendar-System Responsibilities

The personal time layer must remain conscious of the app's dual structural
calendar model.

Gregorian interaction:

- birth data entry is Gregorian-first
- Gregorian anniversaries are directly derived from the entered birth event

Hebrew interaction:

- the birth event also yields a Hebrew birth date
- that Hebrew birth date should be derived using Hebcal
- because Hebrew date identity changes at sunset, the derived Hebrew birth date
  must be computed with sunset-aware Hebrew date logic rather than only by the
  civil Gregorian date
- Hebrew anniversaries recur according to that Hebrew date
- the Hebrew layer and personal-time layer must coexist without pretending that
  Hebrew recurrence is reducible to Gregorian recurrence

The design goal is not to collapse these into one anniversary rule, but to make
both intelligible and optional.

## MVP Recommendation

The next implementation slice should stay narrow:

### Personal Time MVP

- one primary person
- Gregorian birth input with explicit date/time/timezone intent
- derived Hebrew birth date
- day-of-life counter
- week-of-life counter
- Gregorian birthday anniversary markers

Optional in the same slice if still manageable:

- Hebrew birthday anniversary markers

Not yet in MVP:

- seven-year spans
- multiple people
- personal-time settings beyond one primary person
- complex per-person styling systems

## Open Questions

- Should the first personal-time UI explicitly show the derived Hebrew birth
  date next to the Gregorian input?
- Should Gregorian and Hebrew anniversaries share one layer with toggles, or
  become separate sublayers?
- Should a birthday anniversary be represented as a point, a day-long span, or
  both depending on scale?
- When we later support multiple people, do we keep one personal-time layer with
  multiple profiles, or create one layer per person?

## Personal Counter Label Rules

The current target state for day-of-life and week-of-life is:

- these appear as label data, not new dense structural geometry
- they should be appended only when the underlying label already contains the
  matching local calendar datum

Matching rules:

- if a label contains a day-of-month datum, it may also carry day-of-life
- if a label contains a week-number datum, it may also carry week-of-life

Composition rules:

- personal counter data is always the outermost element
- on a leading label, that means leftmost / farthest from the timeline axis
- on a supporting label, that means rightmost / farthest from the timeline axis
- the personal counter is separated from the rest of the label with ` - `

Examples:

- leading day label:
  `Day 16060 - Tue 3`
- supporting day label:
  `3 Tue - Day 16060`
- leading week label:
  `Week 2295 - W14, Sun 29`
- supporting week label:
  `29 Sun, W14 - Week 2295`

This follows the broader label-composition rule that the innermost element
should remain the most locally identifying structural datum, while personal-time
information lives at the outside edge of the label.

## Near-Term Roadmap

1. Define the person-profile data model clearly.
2. Make birthday input explicit about date, time, and timezone semantics.
3. Implement day-of-life and week-of-life for the primary person.
4. Improve anniversary handling from "birthday marker" to explicit Gregorian
   personal anniversaries.
5. Add Hebrew anniversary support once the core single-person model is solid.
