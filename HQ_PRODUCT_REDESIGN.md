# HQ Product Redesign

## Purpose

This document reframes `HQ` as product UI rather than a legacy prototype rail.

The goal is to answer:

- what HQ is currently doing
- which parts are real product controls
- which parts are settings
- which parts are debug/developer information
- whether HQ should survive as a monolithic rail at all

This is the real first step of the Responsive Timeline UX Phase.

## Current Reality

Today, [src/components/HQ.tsx](/Users/jms/code/timeline-react/src/components/HQ.tsx)
combines several distinct jobs:

- core timeline controls
- layer controls
- settings-ish information
- status readouts
- developer/debug-era readouts

That was useful while inventing the product, but it now creates three
problems:

- it makes the control surface feel larger than it needs to be
- it hides the true information architecture of the product
- it makes responsive work harder because we are adapting an accidental bundle
  instead of a deliberate UI system

## Current HQ Inventory

### A. Core Timeline Controls

These are clearly product-real:

- zoom in
- zoom out
- reset timeline
- lock now

Current issue:

- pan buttons are present, but they now feel more like legacy fallback controls
  than part of the ideal UI

Proposed direction:

- keep zoom
- keep reset
- keep lock now
- remove pan buttons from the primary control surface

## B. Layer Controls

These are also product-real:

- layer toggles
- leading-structure selection

Current issue:

- they are mixed into the same always-open rail as everything else

Proposed direction:

- make this a collapsible control section or panel
- likely share a common "Layers / Settings" surface with app settings

## C. App / Personal Settings

These are product-real, but they should not live as always-visible rail text:

- location
- timezone
- birthday config

Current issue:

- location and timezone are read-only display
- birthday is effectively hardcoded and not user-editable

Proposed direction:

- make these user-settable
- treat them as settings, not status
- possibly place them in the same collapsible surface as layers, with tabs or
  sections

## D. Status / Informational Readouts

Currently present:

- current scale title
- "Currently" time
- birthday-relative day/week counters

Assessment:

- scale title feels product-real
- current time may be useful, but does not need to live in a large rail
- birthday-relative counters are meaningful, but their current presentation
  feels more prototype-like than mature

Proposed direction:

- preserve a compact scale-band status in the primary control shell
- drop "Currently" from HQ for now
- drop birthday-relative counters from HQ for now and defer them to future
  personalization/annotation work

## E. Debug / Developer Readouts

Currently present:

- first visible tick
- navigation mode

Assessment:

- these are valuable while building
- they are not mature product UI

Proposed direction:

- move them to a dev-only debug panel
- keep them out of the normal user-facing control surface

## Product Conclusion

We probably do still need an HQ-like concept, but not as one persistent
monolithic rail.

The better product model is:

- a compact primary control shell
- a collapsible layers/settings surface
- a dev-only debug panel

In other words:

- **keep the functions**
- **replace the container and information architecture**

## Proposed Information Architecture

## 1. Primary Controls

Always available.
Small and calm.

Contents:

- compact scale-band status (`Week`, `Day`, `Quarter`, etc.)
- zoom controls
- reset
- lock now
- entrypoint to expanded controls

What is intentionally not here:

- pan buttons
- layer lists
- raw debug/status readouts

## 2. Expanded Controls Surface

Collapsible.
Available on desktop and mobile.

Possible organization:

- `Layers`
  - layer toggles
  - leading structure selection
- `Settings`
  - location
  - timezone
  - birthday
  - future display settings such as 24-hour mode

This may be:

- one panel with tabs
- one panel with sections
- or two separate surfaces

Current recommendation:

- one shared surface
- two tabs: `Layers` and `Settings`

Why tabs:

- the split between layer controls and app/personal settings is stable
- tabs keep the surface compact on both desktop and mobile
- tabs scale better once location/timezone/birthday become editable
- tabs avoid a long mixed stack of controls on small screens

## 3. Dev / Debug Panel

Visible in development only.

Contents:

- first visible tick
- navigation mode
- any future debugging-oriented viewport diagnostics

This keeps build-time/product-facing UI cleaner without losing useful
engineering visibility.

## Cross-Device Manifestation

The key goal is one product across devices, not separate desktop/mobile UIs.

### Desktop

- compact primary controls remain visible
- expanded controls default open as a left rail or side panel
- panel can also be minimized/collapsed

### Mobile

- compact primary controls remain visible
- expanded controls default closed and open as a sheet/drawer

This preserves the same IA:

- primary controls
- expanded controls
- debug only in dev

## Proposed First Implementation Shape

For the upcoming responsive phase, the first HQ redesign implementation should
target:

- a compact always-visible primary control shell
- a collapsible expanded controls surface
- removal of pan buttons from product UI
- movement of debug readouts into dev-only rendering
- user-editable location/timezone/birthday settings scaffold

## Current Decisions

- desktop expanded controls default open
- smaller screens/mobile expanded controls default closed
- `Layers` and `Settings` should be tabs in one shared surface
- current time is dropped from HQ for now
- birthday-relative day/week counters are dropped from HQ for now
- scale state should be compact and local to the primary controls

## Open Design Questions

- Should the primary controls sit as a top bar, corner cluster, or compact rail
  stub?
- What is the cleanest icon/button treatment for opening the expanded controls
  surface?

## Recommendation

Before implementing responsive layout directly, use this IA as the actual first
slice:

1. redesign HQ into product-real control surfaces
2. then make those surfaces responsive across desktop and mobile
