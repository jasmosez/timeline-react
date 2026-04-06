# Testing and Seams Audit

## Purpose

This is a compact audit of:

- where the current regression protection is strong
- where it is still thin
- which code seams currently feel healthy
- which seams still look like likely cleanup targets

It is meant as a Phase 2 decision aid, not a final refactor spec.

## Testing Status

### Current Strengths

Unit coverage is solid for the current engine and calendar logic:

- Gregorian label composition and scale behavior
- Gregorian structural layer behavior
- Hebrew label behavior
- Hebrew structural layer behavior
- Hebrew time adapter behavior
- viewport initialization and derivation
- period anchoring
- layout span creation
- scale helpers

Browser-level coverage exists for:

- HQ control clickability
- reset behavior
- lock-now disabling on manual pan
- leading-structure selection behavior
- anchored vs exploratory navigation mode transitions
- gesture pan behavior
- gesture zoom behavior
- cursor-anchored zoom
- viewport clipping

### Current Gaps

The biggest current testing gaps are not helper-level correctness.
They are system-behavior and interaction gaps:

- promoted structural span labels
- sticky-context behavior under more edge cases
- multi-layer coexistence behavior beyond current happy paths
- visual/interaction behavior for dense label situations
- proportional-hours layer behavior as a first-class visible layer
- broader Hebrew intraday evolution if hour/minute/day diverge later

E2E coverage is still intentionally small.
That is okay for now, but it means some regressions would still only be caught
by direct visual review.

### Testing Recommendation

The next useful testing step is probably not “more tests everywhere.”
It is a more intentional second wave focused on:

- promoted span label behavior
- multi-layer coexistence regressions
- a few key visual-state interaction cases
- high-risk Hebrew intraday behavior if that area evolves further

## Seam Review

### Seams That Feel Good

- viewport state vs layer rendering
- layer registry and active-layer filtering
- Gregorian structure vs Gregorian label policy
- Hebrew structural boundaries vs Hebrew intraday day-view construction
- proportional-hours as a separate marker layer
- sticky-context presentation extracted out of `Timeline`

These seams are doing real work now and generally match the product model.

### Seams That Still Feel A Little Fragile

#### 1. Scale-band representation

The numeric `ScaleLevel` scheme is still widespread.
It appears in scale helpers, Gregorian/Hebrew structure, labels, anchoring, and
tests.

This is readable once you know the mapping, but it is carrying cognitive cost.
This is a real post-Phase-2 refactor target, not a local cleanup.

#### 2. Span metadata remains thin

`TimelineSpan` is still lightweight:

- `id`
- `kind`
- `startTimeMs`
- `endTimeMs`
- optional `label`
- optional `priority`

That has been enough so far, but promoted span labels showed that spans are
starting to want richer semantics, such as:

- origin/owner layer
- side/lane intent
- intrinsic label vs promoted/borrowed label

This does not require immediate refactoring, but it is the next likely pressure
point if span behavior gets richer.

#### 3. `NowTick` is still outside the layer system

This remains an intentional special case.
It is not urgent, but it is still a seam to watch if marker behavior becomes
more unified later.

#### 4. Layer interface still compresses different layer kinds

The current `TimelineLayer` interface is still deliberately lightweight.
It serves structural layers and marker layers well enough, but it does not yet
express the difference between:

- segmentation-style layers
- marker-style layers
- mixed systems

This is acceptable now, but it is part of the likely post-Phase-2 cleanup.

### Bridge Logic Still Present

Bridge logic still exists in a few places, but it is more visible than it used
to be:

- the outermost scale band is still shared even though Gregorian and Hebrew
  interpret it differently
- promoted structural span labels currently borrow start-boundary labels rather
  than using a richer intrinsic span-label model
- some long-term label-composition theory is documented more fully than it is
  encoded

These are okay bridges for now because they are documented and localized.

## Overall Assessment

The codebase is in a healthier place than it was earlier in Phase 2.

The most important shift is that complexity is increasingly living in the right
places:

- Hebrew intraday complexity is now in its own module
- Gregorian label complexity is already separated from Gregorian structure
- viewport and navigation behavior are explicit

So the main risks are no longer hidden architectural tangles.
They are known next-step seams:

- scale-band naming
- richer span semantics
- broader label-composition normalization
- broader interaction/UI regression coverage

## Suggested Next Cleanup-Adjacent Slices

If we want a cleanup/quality-oriented next slice, the best options are:

1. Add targeted tests for promoted span labels
2. Do the fuller testing roadmap pass
3. Lightly tighten span semantics if promoted labels expand further
4. Leave the big scale-band naming cleanup for the post-Phase-2 refactor
