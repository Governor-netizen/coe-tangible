

# Plan: Assessment Mode, Part Labels, DC Machine Contrast, and 3D Model Upload

## 1. Assessment / Quiz Mode (new tab in ControlPanel)

Add a fifth tab "Quiz" with a brain icon. The quiz flow:
- Shows a random part name and asks the student to **click the correct part** on the 3D model
- Tracks score (correct/total), shows feedback (correct/wrong with explanation)
- "Next Question" button to cycle through parts
- Timer optional — keep it simple for hackathon
- State managed in ControlPanel: `quizActive`, `currentQuestion`, `score`, `answered`
- When quiz is active, clicking a part checks if it matches the target part instead of showing info
- Need to pass `quizMode` and `onQuizAnswer` callback through MachineViewer to the models

**New state in Index.tsx**: `quizMode: boolean`, `quizTargetPart: string | null`

## 2. Always-On Part Labels in 3D View

Update `MachinePartMesh` to show floating labels (via `<Html>`) for each part **always**, not just in exploded view. Add a `showLabels` prop (toggled from control panel or always-on). Small text labels floating near each part showing its name.

## 3. More Contrast & Detail on DC Machines

**DC Motor & DC Generator** geometry improvements:
- **Stator**: Add visible pole shoes (protruding inward boxes), darker outer housing color, visible bolt/mounting details (small cylinders on end caps)
- **Rotor**: Add lamination lines (thin ring meshes at intervals), more distinct color contrast between rotor core and stator
- **Commutator**: Add visible copper segments (multiple thin box segments arranged in a ring instead of plain cylinder)
- **Brushes**: Add brush holders (slightly larger box behind each brush), spring suggestion (small cylinder)
- **Windings**: More visible coil turns, brighter copper color
- **Color updates**: Make stator darker (#2D5F6E), rotor more orange (#E05A2A), commutator more copper (#B8860B), shaft metallic silver (#C0C0C0)

## 4. User 3D Model Upload

Since we can't use Supabase storage (no connection), implement **client-side file upload**:
- Add an "Upload Model" button in the header or a new tab
- Accept `.glb` / `.gltf` files via file input
- Use `URL.createObjectURL()` to create a local URL
- Load with `useGLTF` or `useLoader(GLTFLoader, url)` from drei/three
- Display the uploaded model in the 3D viewer as a new "custom" machine type
- Store uploaded model reference in React state (lost on refresh — acceptable for hackathon)
- Add a "Custom Model" entry to the machine tabs when a model is uploaded

**Files to create/modify:**
- `src/data/machineData.ts` — add quiz question generation helper
- `src/components/MachinePartMesh.tsx` — always-show labels option
- `src/components/machines/DCMotorModel.tsx` — more geometry detail + contrast colors
- `src/components/machines/DCGeneratorModel.tsx` — same treatment
- `src/components/machines/CustomModel.tsx` — new component for uploaded GLB
- `src/components/ControlPanel.tsx` — add Quiz tab, label toggle, upload button
- `src/components/MachineViewer.tsx` — pass quiz/label props, support custom model
- `src/pages/Index.tsx` — quiz state, upload state, custom machine tab

## Technical Notes
- GLB loading uses `useLoader(GLTFLoader, objectUrl)` from three — need to import `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader`
- Labels use `<Html>` from drei with `distanceFactor` for distance-based sizing
- Quiz mode reuses the click handler but routes to quiz logic instead of info display

