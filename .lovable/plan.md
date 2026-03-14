

# Plan: Modernize and Polish All 3D Models

## Problems Identified

1. **MachinePartMesh bug**: An orphaned `<meshStandardMaterial>` sits at the group level (line 65-73) but never applies to children since each child defines its own material. This is dead code.

2. **Low polygon counts**: Torus geometries use only 6-8 tubular segments, making windings look hexagonal instead of round. Cylinders use 32 segments (acceptable) but some use only 16.

3. **DC Generator**: Missing field windings around pole shoes, no bearings, basic rotor slots.

4. **Transformer**: Only 5 turns per winding (sparse), no base/mounting, core looks flat without beveled edges or lamination detail.

5. **Induction Motor**: Housing is a solid cylinder (should show it's hollow). Winding torus segments = 6 (hexagonal). Fan blades are simple boxes.

6. **No environment reflections**: Metallic parts (shaft, commutator) look flat without an environment map for reflections.

## Changes

### 1. `src/components/MachinePartMesh.tsx`
- Remove the orphaned `<meshStandardMaterial>` from the group level — it doesn't do anything and wastes a draw call

### 2. `src/components/MachineViewer.tsx`  
- Add `<Environment preset="studio" />` from drei inside the Canvas for realistic metallic reflections on all models
- This single change dramatically improves how metal materials look

### 3. `src/components/machines/DCGeneratorModel.tsx`
- Increase cylinder segments from 32 to 64 for smoother curves
- Add copper field windings (torus coils) around the two pole shoes
- Add bearing housings at both ends of the shaft (small cylinders)
- Increase commutator segments from 8 to 12 for more realism
- Add a fan at the back end

### 4. `src/components/machines/TransformerModel.tsx`
- Increase winding turns from 5 to 8 per side for denser coil appearance
- Increase torus tubular segments from 8 to 16 for rounder coils
- Add lamination lines on the core (thin dark rings)
- Add mounting base (flat box beneath the core)
- Add HV/LV bushings on top (small cylinders poking up from the top yoke)

### 5. `src/components/machines/InductionMotorModel.tsx`
- Increase torus segments from 6 to 24 for smooth round windings
- Make housing a hollow cylinder (`open: true` + end caps) so it looks like a real casting
- Add cooling fins on the outside of the housing (thin box strips around circumference)
- Add bearing detail inside end shields (small torus rings)
- Increase cylinder segments to 64

### 6. `src/components/machines/DCMotorModel.tsx`
- Increase cylinder segments to 64
- Add bearing housings at shaft ends
- Increase torus segments on windings from 8 to 16

## Technical Details
- Import `Environment` from `@react-three/drei` (already a dependency)
- All geometry changes are segment count increases and additional detail meshes — no structural rewrites
- All existing click detection, explode view, animation, and state hooks remain untouched
- No changes to routing, homepage, sidebar, or data files

## Files Modified
- `src/components/MachinePartMesh.tsx` — remove orphaned material
- `src/components/MachineViewer.tsx` — add Environment
- `src/components/machines/DCGeneratorModel.tsx` — more detail + higher poly
- `src/components/machines/TransformerModel.tsx` — more detail + higher poly  
- `src/components/machines/InductionMotorModel.tsx` — more detail + higher poly
- `src/components/machines/DCMotorModel.tsx` — higher poly counts

