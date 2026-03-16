

# Fix Mobile Tab Visibility — Keep Icons, Fix Layout

## Problem
On mobile (414px), the 3D viewer takes all available space via `flex-1`, leaving the ControlPanel with zero/minimal height. The 6 tabs in `grid-cols-6` are cramped (~60px each). User wants icons kept visible.

## Changes

### 1. `src/pages/Index.tsx` — Constrain 3D viewer on mobile
- Change the 3D viewer div from `flex-1` to `h-[40vh] md:flex-1 md:h-auto` so on mobile the viewer takes 40% of viewport, leaving 60% for the control panel
- Add `flex-1 min-h-0` to the control panel div on mobile so it fills remaining space and scrolls

### 2. `src/components/ControlPanel.tsx` — Make tabs responsive with icons
- Change `grid-cols-6` to `grid-cols-3 grid-rows-2` so tabs wrap into 2 rows of 3 on mobile — each tab gets ~120px width, enough for icon + label
- On `md:` screens, keep `md:grid-cols-6` single row
- Keep all icons visible at all sizes
- Add `flex items-center` to each TabsTrigger so icon + text align nicely

