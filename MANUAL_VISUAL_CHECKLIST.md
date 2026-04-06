# Manual Visual Checklist

This is a lightweight regression checklist for timeline behavior that is still
better judged by eye than by brittle automation.

Use it:

- before or after meaningful presentation changes
- after major layer/label work
- before wrapping a larger Phase 2 slice

It should stay short.
If a check becomes well-covered by stable automation, it can be removed here.

## 1. Dense Label Readability

Review:

- minute view
- hour view
- day view

Check:

- labels remain readable without obvious collisions
- tick-length hierarchy is still visually legible
- sticky context does not compete too strongly with ordinary labels
- `now` remains readable in the busiest area

## 2. Promoted Span Labels

Review:

- Hebrew intraday spans at minute and hour scale

Check:

- promoted span label appears only when the viewport is fully inside a span
- promoted span label disappears again when a boundary re-enters view
- promoted span label reads like timeline structure, not like unrelated chrome
- vertical spacing relative to sticky context labels feels intentional

## 3. Sticky Context Labels

Review:

- day -> week transitions
- week -> month transitions
- month -> quarter transitions
- Hebrew month/quarter/year context

Check:

- context labels update cleanly as boundaries are crossed
- top and bottom context labels do not feel contradictory
- leading/supporting side assignment still reads correctly

## 4. Multi-Layer Coexistence

Review:

- Gregorian only
- Hebrew only
- Gregorian + Hebrew
- Gregorian + Hebrew + birthday
- Hebrew + proportional hours

Check:

- lanes remain visually distinct
- one layer does not drown out another unintentionally
- supporting labels remain readable beside leading labels
- promoted span labels do not create confusing lane collisions

## 5. Hebrew Intraday Legibility

Review:

- day view
- hour view
- minute view

Check:

- named intraday markers feel appropriately ranked
- `Shkiah` / `Tzeit` / `Shabbat Ends` distinctions remain clear
- intraday spans alternate cleanly and consistently while scrolling
- proportional-hours layer feels separate from the main Hebrew layer

## 6. Motion / Interaction Feel

Review:

- HQ zoom in/out
- gesture pan
- gesture zoom
- cursor-anchored zoom

Check:

- zoom still feels anchored where expected
- context labels and promoted span labels do not flicker oddly
- crossing major boundaries feels honest, even if not yet fully smoothed

