

# 3D Electrical Machines Learning Platform

An interactive educational web app where students explore electrical machines in 3D — click parts, watch animations, adjust parameters, and see exploded views.

## Layout & Design
- **Split view**: 3D viewer on the left (~65%), info/controls panel on the right (~35%)
- **Light academic style**: Clean white background, subtle shadows, blue/teal accents for interactive elements
- **Top navigation bar** with machine selector tabs: DC Motor, DC Generator, Transformer, Induction Motor
- Responsive — panel collapses to bottom sheet on mobile

## 4 Machines (Built with geometric shapes)
Each machine built from simple Three.js primitives (cylinders, toruses, boxes) with distinct colors per part:

1. **DC Motor** — Stator (outer cylinder), Rotor (inner cylinder), Commutator (segmented ring), Brushes (small boxes), Shaft (thin cylinder), Armature windings (torus shapes)
2. **DC Generator** — Similar structure to DC Motor with different labeling and explanations
3. **Transformer** — Core (E-shaped boxes), Primary winding (torus), Secondary winding (torus), Laminated core layers
4. **Three-phase Induction Motor** — Stator with 3 phase windings (colored red/yellow/blue), Squirrel cage rotor, Shaft

## Feature 1: Interactive 3D Clickable Parts
- Orbit controls (rotate, zoom, pan)
- Hover → part highlights (glow/outline effect)
- Click → right panel shows: part name, image/diagram, function description, related concepts
- Each machine has 4-6 clickable parts with educational content

## Feature 2: Animated Operation Mode
- "Start/Stop" button in the control panel
- **DC Motor**: Rotor spins, animated current flow arrows along windings, magnetic field lines shown
- **DC Generator**: Similar rotation with output voltage indicator
- **Transformer**: Animated magnetic flux through core, alternating current visualization
- **Induction Motor**: Rotating magnetic field animation (3 phases), rotor follows with slip
- Speed control slider to slow down/speed up animations for learning

## Feature 3: Virtual Lab Mode
- Parameter sliders in the right panel with real-time results:
  - **DC Motor**: Voltage (V) → Speed (RPM), Load (Nm) → Torque response, showing N = (V - IaRa) / (Kφ)
  - **Transformer**: Primary voltage → Secondary voltage, turns ratio slider, showing V1/V2 = N1/N2
  - **Induction Motor**: Supply frequency → synchronous speed, load → slip percentage
- Live formula display showing the math updating in real-time
- Small chart/gauge showing output values

## Feature 4: Exploded View
- "Explode/Assemble" toggle button
- Smooth animation: parts spread outward from center with connecting dotted lines
- Labels appear next to each separated part
- Parts remain clickable in exploded state
- Assembly order numbers shown

## Right Panel Sections (Tabs)
1. **Parts Info** — Shows clicked part details
2. **Operation** — Start/stop animation + speed control
3. **Virtual Lab** — Parameter sliders + formulas + output gauges
4. **Exploded View** — Explode toggle + parts list

## Tech Approach
- React Three Fiber (@react-three/fiber@^8.18) + @react-three/drei@^9.122.0 for 3D
- Geometric primitives for all machine models (no external files needed)
- Recharts for any output graphs in the virtual lab
- shadcn/ui components for the control panel

