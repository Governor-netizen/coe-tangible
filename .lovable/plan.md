

# Plan: Replace DC Motor 3D View with Sketchfab Embed

## Approach

For the DC Motor specifically, replace the Three.js Canvas with the Sketchfab iframe embed. The Sketchfab model provides a much higher quality 3D model with built-in controls. We'll overlay HTML labels on top of the iframe to identify key parts.

## Changes

### `src/components/MachineViewer.tsx`
- When `machineType === 'dc-motor'`, render a Sketchfab iframe embed instead of the Three.js Canvas
- The iframe uses the Sketchfab embed URL with `autostart=1&ui_controls=0&ui_infos=0` params for a cleaner look
- Overlay clickable label hotspots (absolute-positioned HTML elements) on top of the iframe pointing to approximate part locations (stator, rotor, commutator, brushes, shaft, windings)
- Clicking a label triggers `onPartClick` so the ControlPanel still shows part info
- All other machine types continue using the Three.js Canvas as before

### Label Positioning
- Position labels using percentage-based CSS (`top`, `left`) over the iframe
- Each label corresponds to a part ID from `machineDatabase['dc-motor'].parts`
- Labels styled consistently with existing floating labels (small pill with part name)
- Selected label gets a highlight ring

### What stays the same
- ControlPanel, quiz mode, exploded view info — all still work via `selectedPart` state
- Exploded view and animation toggles will be hidden/disabled for the Sketchfab embed since the iframe doesn't support programmatic control
- Other machines (DC Generator, Transformer, Induction Motor) remain Three.js-based

