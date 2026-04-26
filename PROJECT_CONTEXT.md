# Veiðikortið – Fishing Dashboard

## What this is
A map-based dashboard for [veidikortid.is](https://veidikortid.is), the Icelandic fishing association. A single annual fishing license gives access to ~38 lakes and rivers across Iceland, but the existing website presents them as a flat list of individual pages with no way to compare, filter, or get a geographic overview.

This dashboard solves that by putting all locations on a map of Iceland with filters and a detail sidebar — so a license holder can quickly research where to fish based on their dates, preferences, and location.

## Current state
Single self-contained HTML file (`veidikortid-dashboard.html`). No build step. Dependencies are Leaflet.js (CDN) for the map and Google Fonts. All 38 locations are hardcoded as a JS data array — scraped from veidikortid.is.

## Features built
- Interactive Iceland map (CartoDB/OpenStreetMap tiles via Leaflet)
- All 38 fishing locations as clickable markers
- Filter sidebar: by region (Suðurland / Vesturland / Norðurland / Austurland), night fishing, 24h fishing, camping, open year-round, and open-in-month (Apr–Nov)
- Non-matching markers dim rather than disappear to preserve spatial context
- Click-to-open detail panel with season dates, daily hours, fish species, feature grid, and link to the original page on veidikortid.is
- Visual style follows veidikortid.is: dark forest green, gold accents, serif/sans font pairing

## Data gaps (need manual filling)
The following fields exist in the data schema but are incomplete:
- **`camping`** — only Þingvallavatn confirmed `true`; needs checking the "Gisting" section of each location page
- **`fishSpecies`** — only populated for Elliðavatn and Þingvallavatn
- A **`fourByFour`** flag doesn't exist yet but should — Frostastaðavatn and Ófærur og Blautulón are highland F-road locations only accessible by 4x4

## Known bugs / rough edges
- Night fishing and 24h toggles are mutually exclusive in logic but presented as two independent toggles — should probably be a radio or segmented control
- Filter sidebar is hidden entirely below 560px — no mobile filter access yet
- Detail panel pushes the map rather than overlaying it — feels cramped at mid-width
- Þingvallavatn and Vífilsstaðavatn shared identical coordinates on the source site (copy-paste error); manually corrected but worth a sanity check on the map
- Some season start dates are approximate (e.g. "when the ice melts") — `mStart` for those is a best guess
