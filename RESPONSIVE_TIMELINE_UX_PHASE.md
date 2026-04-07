# Responsive Timeline UX Phase

## Purpose

This document scopes the next phase of work:

- make the app feel like one coherent product across desktop and mobile
- improve layout and controls without splitting into separate device-specific
  products
- add touch-native timeline interaction
- tighten accessibility and readability across screen sizes

This is not just a "mobile version" effort.
The goal is a shared product model with responsive adaptation.

## Design Principles

### 1. One Product, Not Two

Desktop and mobile should share:

- the same viewport model
- the same timeline semantics
- the same label/span/context grammar
- the same major controls and product concepts

What changes by device class should be:

- control density
- placement of controls
- gutter and lane spacing
- input affordances

### 2. Timeline First

The timeline should remain the primary visual surface on every device.
Controls should support it, not crowd it out.

### 3. Responsive, Not Hidden by Default

Desktop may still benefit from a rail.
But even desktop should allow minimization/collapse so that the experience can
feel continuous across devices and user preferences.

### 4. Touch Is a First-Class Input Mode

Touch interaction should not be left to browser defaults when the user is
clearly interacting with the timeline itself.

## Current Problems

### Layout

- HQ is a fixed rail and dominates small screens.
- The axis/gutter model assumes desktop width.
- Sticky context, promoted span labels, and structural labels are tuned for
  desktop spacing.

### Interaction

- Wheel/trackpad interaction exists.
- Touch pan and pinch do not yet intentionally control the timeline.
- Mobile pinch still zooms the browser window.

### Accessibility / Readability

- Control sizing is not tuned for touch.
- Dense labels have not been reviewed systematically on small screens.
- The app needs explicit cross-device readability thresholds.

## Phase Structure

## Slice 0: HQ Product Redesign

### Goal

Replace the legacy "HQ rail" concept with a cleaner product information
architecture before responsive implementation begins.

### Scope

- inventory current HQ functions and readouts
- separate:
  - primary controls
  - layers/settings
  - debug/dev-only information
- remove pan buttons from the intended primary product UI
- define the target shell/surfaces that responsive work will adapt
- plan for user-editable location, timezone, and birthday settings

### Reference

- [HQ_PRODUCT_REDESIGN.md](/Users/jms/code/timeline-react/HQ_PRODUCT_REDESIGN.md)

### Success Criteria

- responsive work is acting on a product-real control model
- debug-era readouts are no longer treated as required user-facing UI
- desktop and mobile adaptations can share one information architecture

## Slice 1: Responsive Layout Foundation

### Goal

Replace fixed desktop layout assumptions with responsive layout primitives.

### Scope

- introduce breakpoint-aware CSS variables for:
  - HQ width / collapsed width
  - left gutter
  - axis position
  - lane spacing
  - context offsets
- define a responsive HQ shell:
  - desktop expanded rail
  - desktop minimized state
  - small-screen compact mode
- keep current controls/functionality intact while changing layout behavior

### Product Decisions To Embody

- HQ can be minimized on desktop, not just mobile
- small screens should default to a compact control mode
- the timeline axis should not depend on a permanently expanded rail

### Risks

- layout regressions on existing desktop views
- context/label overlap after gutter changes

### Success Criteria

- desktop still feels stable
- HQ can collapse/minimize
- small screens no longer feel like the rail owns the viewport

## Slice 2: Cross-Device Timeline Presentation

### Goal

Make the timeline presentation system adapt gracefully to narrower screens.

### Scope

- tune label lane spacing by breakpoint
- tune context/promoted-span-label spacing by breakpoint
- tune tick/span widths only if needed
- ensure the timeline remains readable when HQ is compact or minimized

### Product Decisions To Embody

- same label grammar across devices
- narrower spacing is okay; different semantics are not
- promoted span labels and sticky context should remain distinct even in tight
  spaces

### Risks

- overfitting to one device size
- making desktop feel cramped while improving mobile

### Success Criteria

- labels still scan well on desktop
- mobile spacing feels intentional
- no obvious breakage in leading/supporting coexistence

## Slice 3: Touch-Native Timeline Interaction

### Goal

Add touch interaction that maps directly to the viewport model.

### Scope

- single-finger pan on the timeline surface
- two-finger pinch zoom mapped to visible duration
- prevent accidental page zoom while the user is interacting with the timeline
- preserve existing wheel/trackpad behavior

### Product Decisions To Embody

- same anchored/exploratory semantics across input modes
- touch should manipulate the timeline, not the browser page
- direct manipulation should feel map-like

### Risks

- gesture conflicts with browser scroll/zoom behavior
- overcomplicating the first touch implementation

### Success Criteria

- panning works naturally on touch devices
- pinch zoom changes timeline zoom, not page zoom
- desktop interactions remain intact

## Slice 4: Cross-Device Accessibility and Review Pass

### Goal

Establish practical accessibility/readability thresholds for the responsive UX.

### Scope

- minimum tap-target sizing
- control spacing
- label readability review
- manual review pass using
  [MANUAL_VISUAL_CHECKLIST.md](/Users/jms/code/timeline-react/MANUAL_VISUAL_CHECKLIST.md)
- add or adjust targeted tests if the responsive/touch work introduces
  meaningful new behavior

### Product Decisions To Embody

- accessibility is not separate from design quality
- desktop and mobile should both meet reasonable usability baselines

### Risks

- treating the checklist as busywork instead of a real gate

### Success Criteria

- controls are comfortably usable on touch devices
- no obvious readability collapse on small screens
- the phase ends with a clearer shared baseline for future product work

## Recommended Execution Order

0. Slice 0: HQ product redesign
1. Slice 1: responsive layout foundation
2. Slice 2: cross-device timeline presentation
3. Slice 3: touch-native interaction
4. Slice 4: accessibility and review pass

## Why This Order

- HQ/product IA should be clarified before responsive layout adapts it
- layout must stabilize before presentation tuning is meaningful
- presentation should be reasonably adapted before touch interaction is judged
- accessibility/review should consolidate the earlier changes rather than
  blindly precede them

## Open Questions To Tune Before Implementation

- What should the minimized HQ look like on desktop?
- What should the compact small-screen control pattern be?
  - top bar
  - bottom drawer
  - floating button + sheet
- Should the timeline axis shift when HQ is minimized, or should the timeline
  layout reserve a stable control gutter?
- How aggressive should we be in reducing label lane spacing on smaller
  screens?
- For touch interaction, should single-finger drag on the timeline always pan,
  or only after a threshold?

## Current Progress

The first coordinated pass has now landed:

- HQ/product-control redesign has begun:
  - compact primary controls
  - tabbed expanded controls
  - dev-only debug information
- responsive layout tokens now drive the control shell and timeline gutter more
  than the old fixed rail assumption
- touch interaction now maps single-finger pan and two-finger pinch to the
  viewport model
- timeline presentation has a first responsive spacing pass for smaller screens

This should be treated as a strong first iteration rather than the end of the
phase.
