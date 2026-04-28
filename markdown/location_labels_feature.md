# Feature: Lake Name Labels Toggle

## What
A toggle button on the map that shows/hides location name labels next to each marker. Off by default.

## Button
- Label: "Lake names"
- Placement: map controls area, no separate filter section title needed
- Off by default on all screen sizes

## Labels
- Absolutely positioned HTML elements rendered over the Leaflet map
- Small pill style: white fill, subtle border, 11px medium weight font
- Render left or right of their marker depending on available space
- Short leader line connecting label to marker when the label has been pushed more than ~20px away
- Small dot at the marker end of the line for clarity
- Labels stay within map viewport bounds, never clipped at edges

## Collision avoidance
No external libraries. Vanilla JS only — 38 points is well within range for a simple custom nudge function.

Logic:
1. Project each marker to current screen coordinates
2. Check every label rect against every other
3. Nudge conflicting labels left/right/up/down until nothing overlaps
4. Draw leader line where label has moved significantly from its marker
5. Recalculate on Leaflet `moveend` and `zoomend` events

## What to avoid
- No marker clustering (numbered circles). Labels and leader lines are the solution to density — not hiding markers behind clusters.
- No D3 or other libraries for this feature
