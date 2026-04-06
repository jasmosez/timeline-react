# Timeline React Backlog

This is a lightweight parking lot for ideas that come up while we are focused on
other work.

Usage:

- keep items short
- include an optional `Target:` when we have a likely phase in mind
- review items targeted at the current phase at the start and midpoint of that
  phase

## Soon

- Mobile / responsive accessibility phase
  Notes: remove unintended Vite dark-mode defaults, make HQ usable on small
  screens, add a mobile/touch-first timeline interaction model, and define a
  clean responsive lane/layout strategy before wider sharing
  Target: Next prioritization pass

- Birthday date/time input in HQ or adjacent controls
  Target: Phase 2

- Label strategy pass for motion and overlap
  Notes: revisit Tufte-style economy under fluid pan/zoom and multi-layer views
  Target: Phase 2

- Multi-layer lateral offset / lane strategy
  Notes: birthday markers and future layers may need asymmetric rightward
  offsetting or lane assignment
  Target: Phase 2

- Hebrew sunset times in week view and other broader scales
  Notes: likely optional or context-sensitive rather than always-on by default
  Target: Phase 2

- Revisit Hebrew Shabbat/week boundary semantics at broader scales
  Notes: if Hebrew week identity or week ticks become richer in month/quarter
  views, decide whether Shabbat should be treated as the longer culminating
  interval and Rishon as the shorter boundary marker, and how that should affect
  tick rank, intermediary labels, and transitions between adjacent scale bands
  Target: Phase 2

- Density-aware suppression for Hebrew day-view boundary labels
  Notes: especially near `now` or other high-attention regions
  Target: Phase 2

- Explore richer Hebrew day-view halachic window spans
  Notes: beyond simple alternating proportional-hour striping, consider spans
  for windows such as latest `Shma`, mincha-permitted time, or other named
  halachic intervals; keep this separate from the baseline intraday span model
  so the first pass stays legible
  Target: Phase 2

- Build out the broader promoted span-label system after the structural-span MVP
  Notes: define partial-clipping rules, precedence, suppression, stacking across
  layers, truncation, and interaction with sticky structural context labels
  Target: Phase 2

- Scale-aware label suppression near primary boundary labels
  Notes: suppress secondary labels within one default increment of a primary
  label, for example 1 hour in day view or 1 minute in hour view
  Target: Phase 2

- Switch gestural zoom from viewport-centered to pointer/cursor-based zoom
  Notes: especially important for trackpad and map-like direct manipulation
  feel
  Target: Phase 2

- Rebalance Gregorian and Hebrew structural visual weight
  Notes: Gregorian gray/black still feels too primary, while some Hebrew blues
  are not yet distinct enough from one another
  Target: Phase 2

- Explore optional 24-hour display mode for time labels and sticky context
  Notes: could simplify dense minute/hour labeling, but should be a deliberate
  app-wide mode choice
  Target: Phase 2

- Month-view week spans outside day spans
  Notes: Gregorian week spans could sit farther from the axis than day spans,
  using the existing Sunday/week boundary hierarchy
  Target: Phase 2

- Revisit secondary-label ordering across structural layers
  Notes: when a calendar is secondary, it may read better if the element closest
  to the timeline appears first in the label string, for example `5, Shabbat`
  instead of `Shabbat 5`; explore implications by scale and calendar
  Target: Phase 2

- Document the full tick/label composition universe before further label-logic deepening
  Notes: enumerate by scale and calendar the `primary` / `secondary` /
  `ordinary` ticks, then document current leading/supporting label behavior for
  each rank and each combined-rank case (`ordinary+secondary`,
  `ordinary+primary`, `secondary+primary`, and all three together); use that as
  the basis for the next label-composition refactor
  Target: Phase 2

- Continue the label-composition normalization pass after the Hebrew intraday slice
  Notes: use the audit to review all Gregorian/Hebrew scales together for
  leading/supporting symmetry, cross-calendar coexistence, sticky-context
  allocation, and cleanup of remaining higher-order label carry; treat Hebrew
  day-and-below / zmanim design as the next prerequisite before finishing the
  broader normalization pass
  Target: Phase 2

- Audit and roadmap the test suite more explicitly
  Notes: review current unit and e2e coverage, identify blind spots in
  interaction, layer rendering, span labeling, and future intraday work, and
  decide what regression protection should be added during the remainder of
  Phase 2
  Target: Phase 2

- Execute the next wave of Phase 2 testing work
  Notes: finish targeted unit coverage for proportional-hours and intraday span
  construction, add focused e2e coverage for promoted span labels and sticky
  context under motion, and establish a short manual visual-regression
  checklist for dense-label and multi-layer coexistence review
  Target: Phase 2

- Plan a post-Phase-2 architectural cleanup / refactor pass
  Notes: review whether files still separate concerns cleanly, remove bridge
  logic that was useful during Phase 2 but no longer reflects the product
  model, tighten naming, and realign modules with the final structural,
  intraday, presentation, and label-composition seams
  Target: Phase 3

## Later

- Smooth band-transition treatment for gesture zoom and HQ button zoom
  Notes: prefer honest transitions; revisit crossfade or progressive reveal
  once label strategy is stronger
  Target: Phase 5

- Twilight layer with civil, nautical, and astronomical morning/evening
  boundaries or spans
  Notes: likely starts as a marker/span layer and may later interact with
  Hebrew-time sunrise/sunset context
  Target: Phase 3

- Hebrew parsha labeling as a possible analogue to Gregorian week numbers
  Notes: likely a separate Hebrew toggle or contextual layer rather than part
  of baseline Hebrew structural labels
  Target: Phase 3

- Add shmita cycle numbering to the first post-shmita Hebrew year label
  Notes: when Hebrew is leading, use `Cycle 827, 5783` style; when supporting,
  use `5783, Cycle 827`; derive the cycle number from the shmita year divided by
  7
  Target: Phase 2

- Give `Shabbat` spans a distinct visual treatment within the Hebrew palette
  Notes: likely most useful in Hebrew week/month views; should feel related to
  the Hebrew layer without overpowering it; probably best explored alongside
  broader span architecture rather than as a one-off tweak
  Target: Phase 2

- Mobile / responsive layout strategy
  Notes: rail collapse, touch interaction, and preserving timeline-first
  composition on small screens
  Target: Later

- `now` as a first-class marker layer rather than a special-case render path
  Target: Later

- Spiral / cylindrical time representation exploration
  Notes: could align Sundays, January 1sts, or Rosh Hashanahs vertically
  Target: Later

## Questions

- Should the first UI for birthday-relative input include timezone immediately,
  or start with date + time only?
  Target: Phase 2

- When should scale bands stop using Gregorian-backed structural defaults and
  become more explicitly layer-neutral?
  Target: Phase 2+

- When should a richer ticketing/backlog workflow replace this lightweight
  file-based one?
  Target: Unclear
