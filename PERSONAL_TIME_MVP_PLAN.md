# Personal Time MVP Plan

## Goal

Turn the current narrow birthday marker feature into a first real personal-time
 MVP centered on one primary person.

## Scope

### In

- one primary person profile
- Gregorian birth input plus explicit timeline-timezone semantics
- derived Hebrew birth date display
- day-of-life label augmentation
- week-of-life label augmentation
- existing Gregorian annual anniversary markers as the first personal
  anniversary surface

### Out

- multiple people
- seven-year cycle spans
- Hebrew anniversary rendering
- full persistence model
- deeper personal annotation tooling

## Product Rules

- birth input is entered in Gregorian context
- derived Hebrew birth date is computed with Hebcal using sunset-aware Hebrew
  date logic
- personal counters are date-based, not birth-time-anniversary-based
- day-of-life appears only when a label already carries day-of-month context
- week-of-life appears only when a label already carries week-number context
- personal counters are always the outermost label element
- the personal layer remains optional through the existing layer-toggle system

## Implementation Order

1. Add personal-time helpers for:
   - timezone-aware civil-date counting
   - day-of-life
   - week-of-life
   - derived Hebrew birth date
2. Extend layer render context so structural layers know whether the personal
   layer is active.
3. Add personal-counter augmentation to Gregorian labels at the positioned-layer
   generation stage.
4. Add personal-counter augmentation to Hebrew labels at the positioned-layer
   generation stage.
5. Update the personal layer UI:
   - relabel the layer more honestly
   - show derived Hebrew birth date
   - make the timeline-timezone assumption explicit
6. Keep anniversary markers as the first anniversary MVP and verify tests.

## Success Criteria

- turning the personal layer on adds day/week-of-life label context without
  overwhelming the timeline
- turning it off removes those counters cleanly
- the settings UI makes the Gregorian-input / Hebrew-derived relationship
  visible
- the implementation still leaves room for Hebrew anniversaries and multi-person
  support later
