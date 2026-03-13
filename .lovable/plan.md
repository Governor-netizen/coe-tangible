

# Plan: Separate Home Page with Video Hero

## Concept

Add a dedicated **Home** view as the default landing screen, distinct from the machine explorer tabs. The home page is a full-screen hero section with the background video clearly visible, a welcome message, and CTA buttons that navigate users to each machine tab.

When a user clicks a CTA or a machine tab, the hero disappears and the current 3D explorer view takes over.

## Implementation

### State change in `Index.tsx`

Add a `currentView` state: `'home' | MachineType`. Default is `'home'`. When `'home'`, render the hero page. Otherwise render the existing explorer layout.

### Home Page Hero Section

- **Full-screen** video background with reduced overlay opacity (`bg-black/30`) so the video is clearly visible
- Centered content block with:
  - Title: "Machine Explorer" (large, serif, white text with text shadow)
  - Subtitle: "Interactive 3D Learning Platform for Electrical Machines"
  - 4 CTA cards/buttons in a grid — one per machine (DC Motor, DC Generator, Transformer, Induction Motor), each with the machine icon and name
  - "Upload Your Own 3D Model" button below the grid
- Clicking any CTA sets `currentView` to that machine type

### Navigation

- Add a "Home" button/icon in the header of the explorer view so users can return to the hero page
- Machine tabs in the explorer header remain for switching between machines without going back to home

### Files to modify

- **`src/pages/Index.tsx`** — add `currentView` state, conditionally render home hero vs explorer, add home button in explorer header

