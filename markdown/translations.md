# Translations Source File

This file contains all Icelandic copy from the application for translation into 8 additional languages.

## UI Elements

### Header
| ID | Icelandic | Context |
|----|-----------|---------|
| app_title | Veiðikortakort | Main app name |
| desktop_subtitle | A fisherman's best friend | Subtitle shown on desktop |
| mobile_subtitle | Besti vinur veiðimanna | Icelandic subtitle on mobile |

### Language Selector
| ID | Icelandic | Context |
|----|-----------|---------|
| lang_is | IS | Language code for Icelandic |
| lang_en | EN | Language code for English |

### Filter Sidebar

#### Region Section
| ID | Icelandic | Context |
|----|-----------|---------|
| section_region | Landssvæði | Section title - "Region" |
| region_all | Allt land | Button - "All country" |
| region_sudurland | Suðurland | Button - "Southland" |
| region_vesturland | Vesturland | Button - "Westland" |
| region_nordurland | Norðurland | Button - "Northland" |
| region_austurland | Austurland | Button - "Eastland" |

#### Lake Names Toggle
| ID | Icelandic | Context |
|----|-----------|---------|
| toggle_lake_names | Vatnsnöfn | Toggle label - "Lake names" |
| toggle_lake_names_desc | Sýna nöfn á korti | Toggle description - "Show names on map" |

#### Fishing Conditions Section
| ID | Icelandic | Context |
|----|-----------|---------|
| section_conditions | Veiðiskilyrði | Section title - "Fishing conditions" |
| toggle_night | Næturveiðar | Toggle label - "Night fishing" |
| toggle_night_desc | Veiðar eftir kl. 22 | Toggle description - "Fishing after 10 PM" |
| toggle_24h | Sólarhringsveiðar | Toggle label - "24-hour fishing" |
| toggle_24h_desc | 24h leyfilegar | Toggle description - "24h allowed" |
| toggle_camping | Tjaldsvæði | Toggle label - "Campsite" |
| toggle_camping_desc | Tjaldsvæði í nágrenni | Toggle description - "Campsite nearby" |
| toggle_allyear | Allt árið | Toggle label - "All year" |
| toggle_allyear_desc | Opna allan ársins hring | Toggle description - "Open all year round" |

#### Month Filter
| ID | Icelandic | Context |
|----|-----------|---------|
| section_months | Opnunartími | Section title - "Opening hours" |
| month_jan | Jan | January |
| month_feb | Feb | February |
| month_mar | Mar | March |
| month_apr | Apr | April |
| month_may | Maí | May |
| month_jun | Jún | June |
| month_jul | Júl | July |
| month_aug | Ágú | August |
| month_sep | Sep | September |
| month_oct | Okt | October |
| month_nov | Nóv | November |
| month_dec | Des | December |

#### Action Buttons
| ID | Icelandic | Context |
|----|-----------|---------|
| btn_reset | Hreinsa síur | Reset filters button - "Clear filters" |
| btn_reset_icon | ↺ | Icon before text |

### Map Legend
| ID | Icelandic | Context |
|----|-----------|---------|
| legend_standard | Venjulegt veiðisvæði | Standard fishing area |
| legend_special | 24h / Næturveiðar | 24h / Night fishing area |
| legend_dimmed | Utan síu | Outside filter (dimmed) |

### Empty State
| ID | Icelandic | Context |
|----|-----------|---------|
| empty_title | Engin svæði fundust | "No areas found" |
| empty_desc | Prófaðu að breyta síunum | "Try changing filters" |

### Mobile UI
| ID | Icelandic | Context |
|----|-----------|---------|
| mobile_filter_title | Sía | Bottom sheet title - "Filter" |
| mobile_filter_subtitle | Breyta síum | Bottom sheet subtitle - "Change filters" |
| mobile_close | Loka | Close button |
| fab_icon | ⚙️ | Filter button icon (gear) |

### Detail Panel

#### Info Labels
| ID | Icelandic | Context |
|----|-----------|---------|
| info_region | Landssvæði | Label - "Region" |
| info_season | Tímabil | Label - "Season/Period" |
| info_price | Verð | Label - "Price" |
| info_camping | Tjaldsvæði | Label - "Campsite" |
| info_accommodation | Gisting | Label - "Accommodation" |
| info_rules | Almennar reglur | Label - "General rules" |

#### Yes/No Values
| ID | Icelandic | Context |
|----|-----------|---------|
| yes | Já | "Yes" |
| no | Nei | "No" |

#### Price Format
| ID | Icelandic | Context |
|----|-----------|---------|
| price_isk | kr. | Icelandic króna suffix |
| price_day | /dag | "/day" suffix |

#### Season Format
| ID | Icelandic | Context |
|----|-----------|---------|
| season_year | Allt árið | "All year" |
| season_months | {{start}} - {{end}} | Month range format |

#### Close Button
| ID | Icelandic | Context |
|----|-----------|---------|
| btn_close | ✕ | Close panel button |

---

## Translation Instructions

### Languages Needed
1. English (EN)
2. Danish (DA)
3. Norwegian (NO)
4. Swedish (SV)
5. German (DE)
6. French (FR)
7. Spanish (ES)
8. Polish (PL)

### Notes for Translators

#### Fishing Terms
- "Veiðikortakort" is a proper noun (brand name), keep as is or adapt phonetically
- "Næturveiðar" refers specifically to night fishing (after 10 PM)
- "Sólarhringsveiðar" means 24-hour fishing permit
- "Tjaldsvæði" is camping area specifically for tents

#### Regional Names
Keep these Icelandic:
- Suðurland
- Vesturland
- Norðurland
- Austurland

These are proper place names like "California" or "Bavaria".

#### Formatting
- Short month abbreviations (3-4 chars max for mobile)
- Toggle descriptions should stay short (under 25 chars)
- Section titles are uppercase in Icelandic but may vary by language

#### Gender/Formality
- Use informal "you" (equivalent of Icelandic "þú" form)
- Keep it friendly but informative

---

## Example Translation Row

| ID | IS | EN | DA | NO | SV | DE | FR | ES | PL |
|----|----|----|----|----|----|----|----|----|----|
| app_title | Veiðikortakort | Veiðikortakort | Veiðikortakort | Veiðikortakort | Veiðikortakort | Veiðikortakort | Veiðikortakort | Veiðikortakort | Veiðikortakort |
| section_region | Landssvæði | Region | Region | Region | Region | Region | Région | Región | Region |

Fill in all columns for each row.
