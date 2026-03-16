

# DC Motor Principle Animation — Step-by-Step Interactive Scenes

## What We're Building

A new **"Principles"** tab in the Tutor section (or a standalone page accessible from the Tutor tab) with 5 interactive 2D/3D animated scenes that teach the fundamental electromagnetic principle behind DC motors — from a single conductor all the way to a rotating armature coil.

## Scene Breakdown

### Scene 1: Current-Carrying Conductor
- A straight vertical conductor (cylinder) connected to a battery (voltage source) via wires
- Animated current flow (moving dots/arrows along the wire)
- When current is "on," concentric circular magnetic field lines appear around the conductor (torii)
- Right-hand rule callout: thumb = current direction, fingers = field direction
- User can toggle current on/off

### Scene 2: External Magnetic Field
- Two large pole pieces: **N** (red) and **S** (blue) facing each other
- Animated horizontal field lines (arrows) flowing from N to S
- Clean, simple — sets the stage

### Scene 3: Conductor in the Magnetic Field
- Combine Scene 1 + Scene 2: place the current-carrying conductor between the poles
- Show cross-sectional view with dot/cross notation for current direction
- Conductor's circular field lines interact with the horizontal field:
  - **Top**: fields add up → denser lines, stronger field
  - **Bottom**: fields cancel → sparse lines, weaker field
- Visual "catapult" force arrow pointing downward on the conductor
- Text explanation of the force (F = BIL)

### Scene 4: Both Sides of the Coil
- Show two conductors (one side going "in" ⊗, one side coming "out" ⊙) connected as a coil
- Opposite force directions on each side → net torque
- Animated arrows showing one side pushed down, other pushed up

### Scene 5: Rotating Armature Coil
- Single rectangular coil between N-S poles mounted on a shaft
- Animated rotation driven by the torques from Scene 4
- Simplified commutator + brushes to show current reversal at neutral axis
- Connects back to the full DC motor model

## Technical Approach

1. **New component**: `src/components/MotorPrincipleAnimation.tsx`
   - Uses React Three Fiber (same stack as existing models)
   - Internal state machine: `scene` (1–5), with Next/Back navigation
   - Each scene is a sub-component rendered in the same Canvas
   - Animated elements using `useFrame` (moving dots for current, rotating coils)

2. **Integration**: Add a "⚡ Principles" button/card in the `DCMachineTutor.tsx` component (at the top, before the operation steps) that opens a full-screen or large modal/overlay with the animation, OR add it as a new tab in the ControlPanel.

3. **Key 3D elements** (all geometric primitives, no external models):
   - Conductor: `cylinderGeometry`
   - Wires: `tubeGeometry` with path curves
   - Battery: boxes with +/- labels via `Html` from drei
   - Magnetic field lines: curved `tubeGeometry` or animated line segments
   - Poles: `boxGeometry` colored red (N) / blue (S)
   - Current dots: small spheres animated along paths with `useFrame`
   - Force arrows: `coneGeometry` + `cylinderGeometry`
   - Dot/Cross notation: `Html` overlays with ⊗ and ⊙ symbols

4. **Interactivity**:
   - Next/Back buttons to navigate scenes
   - Toggle current on/off in Scene 1
   - Each scene has a text explanation panel (Html overlay or DOM overlay)
   - Smooth camera transitions between scenes

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/MotorPrincipleAnimation.tsx` | **Create** — main 5-scene animated component |
| `src/components/DCMachineTutor.tsx` | **Modify** — add "Principles" entry point button |
| `src/pages/Index.tsx` | **Modify** — add state + route/overlay for the principles view |

## Implementation Size
~400-500 lines for the animation component. Moderate complexity — all primitives, no external assets needed.

