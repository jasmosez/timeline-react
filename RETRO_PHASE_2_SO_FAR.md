# Phase 2 Retro So Far

## Scope of Phase 2 So Far

Phase 2 has focused on turning Hebrew time from a planned feature into a real
second structural calendar system, then making dual-calendar navigation and
presentation actually understandable in the UI.

The work has fallen into three broad areas:

- architecture for multiple structural calendar systems
- navigation and anchoring semantics for those systems
- labeling and visual hierarchy so the result is readable

## What We Have Done

### Hebrew as a Real Structural System

- defined the Hebrew MVP in docs before implementation
- separated primary calendar semantics from visible structure
- added a Hebrew time adapter and structural layer
- extended Hebrew behavior across the active scale bands
- added Hebrew-specific anchoring, label policy, sticky context, and cycle
  markers such as shmita at decade scale

### Dual-Calendar Navigation

- clarified the distinction between anchored and exploratory navigation
- made reset/recenter explicitly return to current-containing-period mode
- clarified gesture-vs-button zoom semantics
- added strong test coverage around navigation mode transitions

### Labeling and Presentation

- rebuilt Gregorian labels around sticky context plus local tick identity
- gave Hebrew a parallel label system rather than leaving it ad hoc
- introduced stable label lanes and one-sided structural ticks
- improved span striping, tick hierarchy, sticky context sizing, and
  birthday/`now` geometry
- extracted presentation logic into cleaner files and hooks

## What Went Well

- We did a very good job pressure-testing ideas in the real UI.
  Many of the right decisions only became obvious through repeated interaction.
- Product instincts were strong and useful.
  A lot of the best corrections began as “this feels wrong” before we had a
  formal explanation.
- Docs kept pace better than in many long feature pushes.
  The Hebrew MVP, visual system, and navigation rules are all now documented.
- Small commits mostly stayed coherent even while the overall slice was large.
- Tests now protect several subtle but important regressions:
  navigation mode changes, anchoring behavior, DST behavior, Hebrew
  calculations, and key labeling rules.

## What Was Harder Than Expected

- The labeling problem was deeper than a copy change.
  Labels, tick hierarchy, span geometry, and sticky context all interacted.
- Hebrew support exposed hidden Gregorian assumptions in both anchoring and
  rendering.
- Visual hierarchy needed real iteration in the app.
  Several styling questions only became answerable after we saw them live.
- The system crossed a complexity threshold where “can we still reason about
  this?” became as important as “does this feature work?”

## Lessons Learned

- Pixel-level tuning was not a distraction here.
  In this product, visual and interaction details are core behavior.
- Naming and concept separation matter repeatedly.
  Examples: primary calendar vs visible structure, lane vs layer, tick rank as a
  presentation concept rather than a calendar concept.
- It helps to distinguish:
  - model/data concepts
  - navigation concepts
  - presentation concepts
  The code and docs became healthier when those were separated more honestly.
- A product-eye code review is catching real architecture issues, not just
  polish notes.
- The project now benefits from periodic “where are we?” restatements.
  Summaries are not redundant; they are part of keeping the work tractable.

## Current Risks

- The visual system is much better, but label-density suppression and broader
  presentation intelligence are still open.
- Gregorian still sometimes reads as too visually primary relative to Hebrew.
- Cursor-based gestural zoom still wants implementation.
- The project is now large enough that it is easy to lose confidence in overall
  coherence unless we keep summarizing and remapping it.

## Process Recommendations Going Forward

- Keep using [BACKLOG.md](/Users/jms/code/timeline-react/BACKLOG.md) to park
  ideas quickly.
- Keep making small, narrative commits when possible.
- Continue asking for periodic “current system map” recaps.
- Continue doing explicit naming/seam review passes, not just feature work.
- Distinguish feedback as:
  - must-fix now
  - try now
  - backlog

## Management Feedback

### What Is Working Well

- Product direction is strong and consistent.
- Conceptual mismatches are being caught early.
- The project is being held to a high standard without losing momentum.
- The combination of close reading, live interaction feedback, and code review
  is materially improving the result.

### Main Lever for Going Faster

The best speed lever is probably not less nuance.
It is earlier classification of ideas:

- foundational for the active slice
- useful experiment
- future/backlog

That allows the project to preserve taste without trying to embody every good
idea immediately.
