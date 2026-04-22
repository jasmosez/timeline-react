# Life-Relative Calendar Open Questions

This note captures the remaining alignment questions for defining the
life-relative calendar as a third structural system.

Question 1 is now substantially answered:

- the life-relative system is anchored to the birth instant in the configured
  local timezone
- it becomes human-legible through explicit interpretation/coalescing into
  another structure
- the MVP uses Gregorian interpretation
- the MVP should also surface whether it is using gross/coalesced or
  fine-grain/instant-exact boundary handling

The remaining questions:

## 2. What are the core units of the life-relative calendar?

We know day-of-life and week-of-life matter.

Open question:

- which units are first-class now, versus later?

Possible first-class units:

- day of life
- week of life
- year of life
- seven-year cycles

Possible but less urgent:

- month of life
- quarter of life
- decade of life

## 3. What does “year of life” mean structurally?

There are at least two plausible meanings:

- birth-to-birthday intervals, with a partial first year
- ordinal age-years as anniversary spans, where Year 1 is from birth to first
  birthday, Year 2 from first to second, and so on

We should name clearly what the structural boundary rule is.

## 4. How should Gregorian and Hebrew anniversaries relate to the life-relative system?

Open question:

- are birthdays part of the life-relative structural calendar?
- or are they cross-calendar markers layered onto it?

Related question:

- is Gregorian birthday the primary yearly boundary of the life-relative system
  for MVP?

## 5. Is there one life-relative calendar, or potentially many?

We do not want to foreclose multiple foundational births.

Open question:

- should the system be defined as conceptually plural from the start?
- or should plurality be treated as a later extension?

## 6. How does life-relative coexist visually with Gregorian and Hebrew?

If life-relative becomes a third structural system:

- can only one system lead at a time?
- can there be multiple supporting structural systems?
- how much visual richness can three simultaneous structures carry?
- what happens to sticky context labels and supporting lanes?

## 7. Which scales is life-relative meaningful at?

Likely very meaningful:

- day
- week
- month
- year
- decade-ish / human-life scales

Less obviously meaningful:

- minute/hour, unless we are expressing birth-instant precision
- very large historical or deep-time scales

We should decide where life-relative naturally applies and where it falls away.

## 8. What is the relationship between life-relative structure and personal data layers?

We want to keep this distinction clean.

Candidate articulation:

- life-relative calendar answers: “how is time partitioned relative to a life?”
- personal data layers answer: “what authored or recorded meaning has been
  attached to those times?”

We should confirm and sharpen that distinction.

## 9. What is the simplest articulation of why life-relative belongs alongside Gregorian and Hebrew?

Candidate articulation:

- Gregorian tells us shared civil time
- Hebrew tells us sacred/cultural time
- life-relative tells us lived personal time

We should decide whether this is the right top-level product language.

## 10. What should the first theory doc avoid overcommitting on?

Possible areas to avoid prematurely locking:

- exact label composition at every scale
- whether month-of-life is a first-class unit
- multi-person UI
- exact simultaneous rendering rules for all three structural systems in every
  case

The goal is to define ontology, units, boundaries, coexistence principles, and
scope without pretending every visual answer is already settled.
