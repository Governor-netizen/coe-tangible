import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  Preload,
} from '@react-three/drei';
import { Camera, Loader2, Maximize2, Scissors } from 'lucide-react';
import * as THREE from 'three';
import { MachineType } from '@/data/machineData';
import { DCMotorModel } from './machines/DCMotorModel';
import { DCGeneratorModel } from './machines/DCGeneratorModel';
import { TransformerModel } from './machines/TransformerModel';
import { InductionMotorModel } from './machines/InductionMotorModel';
import { CustomModel } from './machines/CustomModel';
import { FieldOverlay } from './machines/FieldOverlay';
import { getCurrentTheme, ThemeMode } from '@/lib/theme';

export interface MachineViewerProps {
  machineType: MachineType;
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  isExploded: boolean;
  showLabels?: boolean;
  customModelUrl?: string | null;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
  explodeSpread?: number;
  /** Quiz target to pulse. */
  hintedPart?: string | null;
  /** Fade everything except the selected part. */
  focusMode?: boolean;
  /** Draw magnetic flux / rotating-field overlays. */
  showField?: boolean;
  /** Rotor + field speed from the virtual lab; null means use the slider. */
  rotorRpm?: number | null;
  fieldRpm?: number | null;
  flux?: number;
  current?: number;
}

type ViewPreset = 'iso' | 'front' | 'side' | 'top';

const THEME_BG: Record<ThemeMode, string> = { light: '#dde3ea', dark: '#0e1218' };
const THEME_GRID: Record<ThemeMode, [string, string]> = {
  light: ['#b8c4ce', '#c8d0da'],
  dark: ['#2a3542', '#1b232c'],
};

/** Distance the camera sits back at, per machine. */
const FRAMING: Record<MachineType, number> = {
  'dc-motor': 9.5,
  'dc-generator': 10.5,
  'transformer': 9,
  'induction-motor': 11,
  custom: 7,
};

/**
 * Machines are built with the shaft along +X, so "front" is the drive-end
 * view down the axis and "side" is the profile across it.
 */
const PRESET_DIRECTIONS: Record<ViewPreset, [number, number, number]> = {
  iso: [0.62, 0.42, 0.66],
  front: [1, 0.08, 0],
  side: [0, 0.08, 1],
  top: [0.001, 1, 0.001],
};

function useTheme(): ThemeMode {
  const [theme, setTheme] = useState<ThemeMode>(() => getCurrentTheme());
  useEffect(() => {
    const onChange = () => setTheme(getCurrentTheme());
    window.addEventListener('themechange', onChange);
    return () => window.removeEventListener('themechange', onChange);
  }, []);
  return theme;
}

/**
 * Studio lighting built entirely in-scene. The previous `Environment preset`
 * fetched an HDRI from a CDN inside Suspense, so an offline or firewalled
 * machine sat on a blank canvas forever.
 */
function StudioEnvironment({ theme }: { theme: ThemeMode }) {
  const isDark = theme === 'dark';
  return (
    <>
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={isDark ? 1.6 : 2.4} form="rect" position={[0, 5, 2]} scale={[8, 4, 1]} rotation={[-Math.PI / 2, 0, 0]} color="#ffffff" />
        <Lightformer intensity={1.1} form="rect" position={[-6, 2, 3]} scale={[5, 5, 1]} rotation={[0, Math.PI / 3, 0]} color="#cfe4ff" />
        <Lightformer intensity={0.9} form="rect" position={[6, 1, -4]} scale={[5, 5, 1]} rotation={[0, -Math.PI / 3, 0]} color="#ffe6c9" />
        <Lightformer intensity={0.6} form="ring" position={[0, -4, 0]} scale={8} rotation={[Math.PI / 2, 0, 0]} color="#8fa3b8" />
      </Environment>

      <ambientLight intensity={isDark ? 0.35 : 0.55} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={isDark ? 1.5 : 2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#88aaff" />
      <hemisphereLight args={[isDark ? '#33465c' : '#ddeeff', isDark ? '#0b1016' : '#8899aa', 0.5]} />
    </>
  );
}

function Ground({ theme }: { theme: ThemeMode }) {
  const [gridA, gridB] = THEME_GRID[theme];
  return (
    <group position={[0, -2.9, 0]}>
      <ContactShadows opacity={theme === 'dark' ? 0.5 : 0.35} scale={26} blur={2.4} far={7} resolution={512} />
      <gridHelper args={[40, 60, gridA, gridB]} position={[0, 0.01, 0]} />
    </group>
  );
}

/**
 * Applies a clipping plane across the whole scene so learners can slice a
 * machine open in place instead of exploding it apart.
 */
function SectionRig({ enabled, offset }: { enabled: boolean; offset: number }) {
  const { scene, gl } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 4), []);
  const active = useMemo(() => [plane], [plane]);
  const inactive = useMemo<THREE.Plane[]>(() => [], []);

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  useFrame(() => {
    plane.constant = offset;
    const target = enabled ? active : inactive;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.material) return;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of list) {
        if (mat.clippingPlanes !== target) {
          // Changing the plane count recompiles the shader, so only touch the
          // material when the assignment actually changes.
          mat.clippingPlanes = target;
          mat.clipShadows = enabled;
          // Cut geometry has no cap, so a single-sided shell reads as a hole.
          // Rendering both sides while sliced keeps interiors looking solid.
          if (mat.userData.__baseSide === undefined) mat.userData.__baseSide = mat.side;
          mat.side = enabled ? THREE.DoubleSide : (mat.userData.__baseSide as THREE.Side);
          mat.needsUpdate = true;
        }
      }
    });
  });

  return null;
}

/** Eases the camera to a preset direction while leaving orbit control free. */
function CameraRig({
  preset,
  distance,
  nonce,
}: {
  preset: ViewPreset;
  distance: number;
  nonce: number;
}) {
  const { camera, controls } = useThree();
  const target = useRef(new THREE.Vector3());
  const active = useRef(false);

  useEffect(() => {
    const dir = new THREE.Vector3(...PRESET_DIRECTIONS[preset]).normalize();
    target.current.copy(dir.multiplyScalar(distance));
    active.current = true;
  }, [preset, distance, nonce]);

  useFrame((_, delta) => {
    if (!active.current) return;
    camera.position.lerp(target.current, 1 - Math.pow(0.004, delta));
    const orbit = controls as { target?: THREE.Vector3; update?: () => void } | null;
    orbit?.target?.set(0, 0, 0);
    orbit?.update?.();
    if (camera.position.distanceTo(target.current) < 0.05) active.current = false;
  });

  return null;
}

function MachineScene(props: MachineViewerProps) {
  const {
    machineType,
    customModelUrl,
    selectedPart,
    onPartClick,
    isAnimating,
    animationSpeed,
    isExploded,
    showLabels = false,
    explodeSpread = 1,
    hintedPart = null,
    focusMode = false,
    rotorRpm = null,
    fieldRpm = null,
  } = props;

  const modelProps = {
    selectedPart,
    onPartClick,
    isAnimating,
    animationSpeed,
    isExploded,
    showLabels,
    explodeSpread,
    hintedPart,
    focusMode,
    rotorRpm,
    fieldRpm,
  };

  if (machineType === 'custom') {
    if (!customModelUrl) return null;
    return (
      <CustomModel
        url={customModelUrl}
        isAnimating={isAnimating}
        animationSpeed={animationSpeed}
        selectedPart={selectedPart}
        onPartClick={onPartClick}
        isExploded={isExploded}
        showLabels={showLabels}
        explodeSpread={explodeSpread}
      />
    );
  }

  switch (machineType) {
    case 'dc-motor':
      return <DCMotorModel {...modelProps} />;
    case 'dc-generator':
      return <DCGeneratorModel {...modelProps} />;
    case 'transformer':
      return <TransformerModel {...modelProps} />;
    case 'induction-motor':
      return <InductionMotorModel {...modelProps} />;
    default:
      return null;
  }
}

export function MachineViewer(props: MachineViewerProps) {
  const theme = useTheme();
  const {
    machineType,
    isAnimating,
    isExploded,
    showField = false,
    rotorRpm = null,
    fieldRpm = null,
    flux = 0.5,
    current = 0,
  } = props;

  const [preset, setPreset] = useState<ViewPreset>('iso');
  const [presetNonce, setPresetNonce] = useState(0);
  const [sectionOn, setSectionOn] = useState(false);
  const [sectionOffset, setSectionOffset] = useState(0);
  const localCanvas = useRef<HTMLCanvasElement | null>(null);

  const distance = FRAMING[machineType] ?? 9;

  // Re-frame whenever the machine changes so nothing starts off-screen.
  useEffect(() => {
    setPreset('iso');
    setPresetNonce((n) => n + 1);
    setSectionOn(false);
    setSectionOffset(0);
  }, [machineType]);

  const applyPreset = (next: ViewPreset) => {
    setPreset(next);
    setPresetNonce((n) => n + 1);
  };

  const capture = useCallback(() => {
    const canvas = localCanvas.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `tangible-${machineType}-${Date.now()}.png`;
    a.click();
  }, [machineType]);

  const btn =
    'inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-label tracking-wider uppercase border transition-colors';
  const btnIdle = 'bg-card/80 backdrop-blur border-border text-muted-foreground hover:text-foreground';
  const btnActive = 'bg-primary text-primary-foreground border-primary';

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden relative" style={{ background: THEME_BG[theme] }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          // Needed so the capture button can read pixels back out.
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: theme === 'dark' ? 1.05 : 1.15,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.localClippingEnabled = true;
          localCanvas.current = gl.domElement;
          if (props.canvasRef) props.canvasRef.current = gl.domElement;
        }}
      >
        <color attach="background" args={[THEME_BG[theme]]} />
        <fog attach="fog" args={[THEME_BG[theme], 22, 55]} />

        <PerspectiveCamera makeDefault position={[6, 4, 7]} fov={42} near={0.1} far={120} />
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={30}
          autoRotate={!isAnimating && !isExploded}
          autoRotateSpeed={0.4}
        />

        <StudioEnvironment theme={theme} />
        <Ground theme={theme} />

        <Suspense fallback={null}>
          <MachineScene {...props} />
          {showField && machineType !== 'custom' && (
            <FieldOverlay
              machineType={machineType}
              rotorRpm={rotorRpm ?? 900}
              fieldRpm={fieldRpm ?? rotorRpm ?? 900}
              flux={flux}
              current={current}
            />
          )}
          <Preload all />
        </Suspense>

        <SectionRig enabled={sectionOn} offset={sectionOffset} />
        <CameraRig preset={preset} distance={distance} nonce={presetNonce} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>

      {/* View presets */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
        {(['iso', 'front', 'side', 'top'] as ViewPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`${btn} ${preset === p ? btnActive : btnIdle}`}
            title={`${p} view`}
          >
            {p}
          </button>
        ))}
        <button onClick={() => applyPreset(preset)} className={`${btn} ${btnIdle}`} title="Re-centre">
          <Maximize2 className="w-3 h-3" />
        </button>
        <button onClick={capture} className={`${btn} ${btnIdle}`} title="Save a PNG of this view">
          <Camera className="w-3 h-3" />
        </button>
      </div>

      {/* Cutaway control */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-card/80 backdrop-blur border border-border rounded px-2 py-1">
        <button
          onClick={() => setSectionOn((v) => !v)}
          className={`inline-flex items-center gap-1 text-[10px] font-label tracking-wider uppercase ${
            sectionOn ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Slice the machine open in place"
        >
          <Scissors className="w-3 h-3" />
          Cutaway
        </button>
        {sectionOn && (
          <input
            type="range"
            min={-3}
            max={3}
            step={0.05}
            value={sectionOffset}
            onChange={(e) => setSectionOffset(parseFloat(e.target.value))}
            className="w-24 accent-primary"
            aria-label="Cutaway depth"
          />
        )}
      </div>

      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground pointer-events-none">
        Click parts to learn · Drag to rotate · Scroll to zoom
      </div>

      {rotorRpm !== null && rotorRpm > 0 && (
        <div className="absolute bottom-3 right-3 bg-card/85 backdrop-blur border border-border rounded-md px-3 py-1.5 text-xs pointer-events-none">
          <span className="text-muted-foreground">Rotor </span>
          <span className="font-mono font-bold text-primary">{Math.round(rotorRpm)}</span>
          <span className="text-muted-foreground"> RPM</span>
          {fieldRpm !== null && fieldRpm > rotorRpm + 1 && (
            <>
              <span className="text-muted-foreground"> · Field </span>
              <span className="font-mono font-bold text-primary">{Math.round(fieldRpm)}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Small spinner used while a custom upload is decoding. */
export function ViewerLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
