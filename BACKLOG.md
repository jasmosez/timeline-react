# Timeline React Backlog

This is a lightweight parking lot for ideas that come up while we are focused on
other work.

Usage:

- keep items short
- include an optional `Target:` when we have a likely phase in mind
- review items targeted at the current phase at the start and midpoint of that
  phase

## Soon

- Birthday date/time input in HQ or adjacent controls
  Target: Phase 2

- Label strategy pass for motion and overlap
  Notes: revisit Tufte-style economy under fluid pan/zoom and multi-layer views
  Target: Phase 2

- Multi-layer lateral offset / lane strategy
  Notes: birthday markers and future layers may need asymmetric rightward
  offsetting or lane assignment
  Target: Phase 2

## Later

- Smooth band-transition treatment for gesture zoom and HQ button zoom
  Notes: prefer honest transitions; revisit crossfade or progressive reveal
  once label strategy is stronger
  Target: Phase 5

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
