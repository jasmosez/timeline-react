# Phase 1 Retro

## What Went Well

- Chat context plus repo docs worked well together. Key decisions are now
  captured in [PROJECT_PLAN.md](/Users/jms/code/timeline-react/PROJECT_PLAN.md),
  [ARCHITECTURE.md](/Users/jms/code/timeline-react/ARCHITECTURE.md), and
  [INTERACTION_NOTES.md](/Users/jms/code/timeline-react/INTERACTION_NOTES.md).
- Small, coherent commits kept the refactor understandable.
- Tight attention to naming and mental-model clarity paid off.
- We caught conceptual mismatches early instead of polishing the wrong thing.
- Tests were added at a good moment and now protect important regressions.

## What Could Be Improved

- We sometimes stayed in micro-checkpoint mode longer than necessary.
- Side ideas sometimes interrupted the active thread before there was a simple
  place to park them.
- We occasionally updated code first and docs second, which created brief doc
  drift.

## Lessons Learned

- Honest behavior is better than fake polish. Clean structural band swaps were
  better than misleading animation.
- Product-language precision matters. Marker vs segmentation, `Lock Now`,
  `visibleDurationMs`, and related naming work materially improved the code.
- Continuous pan plus duration-driven zoom was the right architectural center of
  gravity.
- Strong product instincts are often expressed first as “this feels
  conceptually off,” and that is worth taking seriously early.

## Process Adjustments

- Use [BACKLOG.md](/Users/jms/code/timeline-react/BACKLOG.md) to capture side
  ideas quickly without derailing active work.
- Give backlog items an optional target phase.
- Review backlog items targeted at the current phase at the start and midpoint
  of that phase.
- Keep using docs + commits as the primary external memory for long-running
  work.
