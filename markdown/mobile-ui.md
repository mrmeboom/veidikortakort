# Mobile UI - Filter Access

## Problem
The filter sidebar is hidden entirely below 560px, meaning mobile users have no way to filter locations on the map.

## Goal
Add a mobile-friendly filter UI that allows users to access all filter controls on small screens.

## UI Pattern Options

### Option 1: Bottom Sheet (Recommended)
- A bottom sheet that slides up from the bottom of the screen
- Triggered by a floating action button (FAB) or hamburger menu icon
- Can be dragged to collapse/expand
- **Pros:** Modern, familiar pattern, works well with touch
- **Cons:** More complex to implement, may obscure map when open

### Option 2: Hamburger Menu + Modal
- Hamburger menu icon in header
- Opens a modal overlay with all filter controls
- Full-screen or large modal
- **Pros:** Simple pattern, easy to understand
- **Cons:** Obscures map completely, less immersive

### Option 3: Collapsible Sidebar
- Sidebar collapses to a thin strip with icons
- Tap to expand to full width
- **Pros:** Keeps context of map visible
- **Cons:** Still takes up space even when collapsed, may be cramped on very small screens

### Option 4: Filter Button + Modal
- Dedicated "Filter" button (could be in header or floating)
- Opens a modal with all filter controls
- **Pros:** Clear call-to-action, familiar pattern
- **Cons:** Same modal tradeoffs as Option 2

## Recommendation
**Option 1: Bottom Sheet** with a floating action button (FAB)

## Implementation Plan

### Phase 1: CSS Changes
1. Add media query for mobile (< 560px)
2. Hide sidebar on mobile
3. Add FAB styles (fixed position, bottom-right, z-index above map)
4. Add bottom sheet styles (fixed position, bottom: 0, transform for slide animation)
5. Add backdrop/overlay styles for when bottom sheet is open

### Phase 2: HTML Changes
1. Add FAB button to header or body
2. Move or duplicate filter controls into bottom sheet container
3. Add backdrop element
4. Add close button to bottom sheet

### Phase 3: JavaScript Changes
1. Add event listener for FAB click to open bottom sheet
2. Add event listener for backdrop click to close bottom sheet
3. Add event listener for close button click
4. Add swipe/drag gesture for bottom sheet (optional enhancement)
5. Ensure filter state syncs between bottom sheet and existing logic

### Phase 4: Testing
1. Test on various mobile screen sizes
2. Test filter functionality on mobile
3. Test bottom sheet open/close interactions
4. Test landscape vs portrait orientations

## Design Decisions to Discuss

1. **Trigger button:** FAB (floating) or header icon?
2. **Bottom sheet height:** Full height or partial (peeking)?
3. **Handle:** Should the bottom sheet have a drag handle?
4. **Backdrop:** Should clicking outside the bottom sheet close it?
5. **Animation:** Slide up from bottom or fade in?
6. **Z-index:** Ensure bottom sheet is above map but below detail panel

## Current Filter Controls to Include
- Region pills (Suðurland, Vesturland, Norðurland, Austurland, All)
- Night fishing toggle
- 24h fishing toggle
- Camping toggle
- All year toggle
- Month buttons (April-November)
- Reset button

## Notes
- The current filter logic is solid - we just need to expose it on mobile
- No changes needed to the filter state management
- The bottom sheet should use the same HTML structure as the sidebar for consistency
