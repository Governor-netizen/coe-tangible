

# Redesign Landing Page — Dark Technical/Scientific Theme

## Overview
Completely rebuild the home view in `src/pages/Index.tsx` to match the reference design: a dark, technical, multi-section landing page with engineering-aesthetic styling. The user will place a DC machine animation in the hero section later.

## Sections to Build (matching reference)

### 1. Navigation Bar
- Dark background, logo + "Tangible" branding left
- Nav links: Machines, Systems, Courses, Research, About
- Sign In + "Get Access →" CTA button right
- Sticky header

### 2. Hero Section
- Left: "ENGINEERING · VISUALIZED" tag in green, large serif headline "Understand **Machines** Through Motion.", subtitle, two CTA buttons ("→ Explore the Library", "View Featured: DC Motor Series ↗")
- Right: Placeholder area for 3D DC machine animation (user will add later) with floating tech labels (SYSTEM_STABLE, DC_MOTOR_MODEL_A1, FIELD_WINDING, VOLTAGE)
- Dark background with subtle grid pattern

### 3. Recently Published Models
- 3 card grid with images, category tags (DC_MACHINES, TRANSFORMERS, CONTROL_SYSTEMS), titles, descriptions, "OPEN MODEL →" links
- Uses existing machine icons/images

### 4. A Scientific Workflow
- 3-step horizontal layout with icons: Browse Library → Open 3D → Annotate & Study
- Step numbers (STEP_01, STEP_02, STEP_03) in green

### 5. From Lecture to Spatial Understanding
- Split: left text + "View Course Mapping →" button, right image placeholder with course label overlay
- Stats bar: 150+ Interactive Models, 24 African Partner Unis, 98% Retention Improvement, 0.5s Latency

### 6. Featured Deep Dive
- Interactive section showing Series DC Motor with part tabs (Stator, Armature, Commutator, Brushes)
- Content tabs (Overview, Working Principle, Equations, 3D View)
- Description + bullet points + "Open Full 3D Model →" CTA

### 7. Footer
- Logo, tagline "Built for engineering education in Africa"
- Links: ResearchGate, GitHub, LinkedIn, Privacy, Terms
- Copyright © 2026 TANGIBLE

## Design Tokens
- Background: `#0a0f1a` (very dark navy/black)
- Card backgrounds: `#111827` with subtle borders `#1e293b`
- Accent green: `#4DFFB4` for tags, step numbers
- Primary blue: `#2563eb` for CTAs
- Text: white with various opacities
- Fonts: Serif for headings (existing Merriweather), monospace feel for labels (IBM Plex Mono via Google Fonts or fallback)
- Subtle blueprint grid background pattern

## Technical Approach

### Files to modify
| File | Action |
|------|--------|
| `src/pages/Index.tsx` | **Major rewrite** of home view — replace simple centered layout with full multi-section landing page |
| `src/index.css` | **Add** blueprint grid pattern CSS, animations (materialize, slide-label, etc.) |

### Implementation details
- Keep the explorer view (non-home) completely unchanged
- All machine card clicks still call `handleMachineChange(id)` 
- Hero right side: empty placeholder div styled for the 3D animation the user will add later
- Use existing `machineIcons` for the model cards
- Responsive: stack sections vertically on mobile, side-by-side on desktop
- Navigation links that correspond to machines will call `handleMachineChange`, others can be anchors or no-ops for now

