# Veiðikortakort

A map-based dashboard for [veidikortid.is](https://veidikortid.is), the Icelandic fishing association. A single annual fishing license gives access to ~38 lakes and rivers across Iceland, and this dashboard puts all locations on an interactive map with filters and detailed information.

## What is this?

The existing veidikortid.is website presents fishing locations as a flat list of individual pages with no way to compare, filter, or get a geographic overview. Veiðikortakort solves this by:

- Displaying all 38 fishing locations on an interactive map of Iceland
- Providing filters by region, fishing conditions, and season
- Showing detailed information for each location (hours, season, fish species, features)
- Linking directly to the original veidikortid.is pages for full details

## Features

- **Interactive Iceland map** using Leaflet.js with CartoDB tiles
- **38 fishing locations** as clickable markers across Iceland
- **Filter sidebar** with:
  - Region filter (Suðurland / Vesturland / Norðurland / Austurland)
  - Night fishing toggle
  - 24h fishing toggle
  - Camping availability toggle
  - Open year-round toggle
  - Month filter (April–November)
- **Non-matching markers dim** rather than disappear to preserve spatial context
- **Detail panel** with season dates, daily hours, fish species, feature grid, and link to original page
- **Visual style** follows veidikortid.is: dark forest green, gold accents, serif/sans font pairing

## Project Structure

```
veidikortakort/
├── index.html      # Main HTML structure
├── style.css       # All styling
├── app.js          # Map logic and UI controls
├── data.js         # Hardcoded data for 38 locations
└── README.md       # This file
```

## Setup

No build step required. Simply:

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Or serve it with any static file server (e.g., `python -m http.server`)

## Dependencies

- Leaflet.js (CDN) - Interactive maps
- Google Fonts (CDN) - Fraunces and DM Sans fonts

## Data

All 38 fishing locations are hardcoded in `data.js`. The data includes:

- Location name and region
- GPS coordinates
- Daily fishing hours
- Season dates
- Fishing conditions (night fishing, 24h, camping, year-round)
- Fish species (where available)
- Description
- Link to original veidikortid.is page

### Data Gaps

The following fields exist but are incomplete and could be filled in future updates:

- **`camping`** - Only Þingvallavatn confirmed as `true`; others default to `false`
- **`fishSpecies`** - Only populated for Elliðavatn and Þingvallavatn
- **`fourByFour`** - Not yet implemented; Frostastaðavatn and Ófærur og Blautulón are highland F-road locations requiring 4x4

## Known Issues

- Night fishing and 24h toggles are mutually exclusive in logic but presented as two independent toggles - should be a radio or segmented control
- Filter sidebar is hidden entirely below 560px - no mobile filter access yet
- Detail panel pushes the map rather than overlaying it - feels cramped at mid-width viewports
- Some season start dates are approximate (e.g., "when the ice melts")

## License

Private - All rights reserved

## Name

"Veiðikortakort" is a play on words. In Icelandic, "kort" means both "card" and "map". Since this is a map of the fishing card (Veiðikortið), it's jokingly called "Veiðikortakort" (the map of the fishing card).
