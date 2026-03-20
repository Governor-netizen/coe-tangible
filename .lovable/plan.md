

# Match Landing Page Exactly to Reference

## Changes Needed (single file: `src/components/landing/LandingPage.tsx`)

### 1. Third Model Card — Wrong content
**Current**: tag `INDUCTION_MOTORS`, title "Three-Phase Induction Motor", machineId `induction-motor`
**Reference**: tag `CONTROL_SYSTEMS`, title "Inverted Pendulum", same description about PID parameters

Fix: Update the third card in `MODEL_CARDS` to use `CONTROL_SYSTEMS` tag and "Inverted Pendulum" title. Keep `induction-motor` as the machineId for now (since there's no inverted pendulum machine type), or map it to `dc-motor` as a fallback.

### 2. No other structural changes needed
The rest of the landing page (nav, hero, workflow, lecture section, deep dive, footer) already matches the reference. The images, layout, colors, typography, floating labels, part tabs, content tabs, stats — all match.

## Technical Detail
One constant update in `MODEL_CARDS` array (line 38-43), changing `tag`, `title`, and optionally the image used.

