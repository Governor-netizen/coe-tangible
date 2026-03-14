import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { MachineType } from '@/data/machineData';
import { DCMotorModel } from './machines/DCMotorModel';
import { DCGeneratorModel } from './machines/DCGeneratorModel';
import { TransformerModel } from './machines/TransformerModel';
import { InductionMotorModel } from './machines/InductionMotorModel';
import { CustomModel } from './machines/CustomModel';
import { Suspense, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

interface MachineViewerProps {
  machineType: MachineType;
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  isExploded: boolean;
  showLabels?: boolean;
  customModelUrl?: string | null;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
}

const DC_MOTOR_LABELS: { id: string; name: string; top: string; left: string }[] = [
  { id: 'stator', name: 'Stator', top: '30%', left: '20%' },
  { id: 'rotor', name: 'Rotor', top: '50%', left: '50%' },
  { id: 'commutator', name: 'Commutator', top: '55%', left: '75%' },
  { id: 'brushes', name: 'Brushes', top: '35%', left: '78%' },
  { id: 'shaft', name: 'Shaft', top: '50%', left: '88%' },
  { id: 'windings', name: 'Windings', top: '40%', left: '40%' },
];

function SketchfabDCMotor({ selectedPart, onPartClick }: Pick<MachineViewerProps, 'selectedPart' | 'onPartClick'>) {
  return (
    <div className="w-full h-full min-h-[400px] bg-muted/30 rounded-lg overflow-hidden relative">
      <iframe
        title="DC Motor - Sketchfab"
        className="w-full h-full absolute inset-0"
        src="https://sketchfab.com/models/bbeb81be53fe459aa666e975dbc9448f/embed?autostart=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark=0&ui_watermark_link=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
      {DC_MOTOR_LABELS.map((label) => (
        <button
          key={label.id}
          onClick={() => onPartClick(label.id)}
          className={cn(
            'absolute z-10 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer',
            'bg-card/90 backdrop-blur-sm border shadow-sm hover:scale-105',
            selectedPart === label.id
              ? 'border-primary ring-2 ring-primary/40 text-primary'
              : 'border-border text-foreground hover:border-primary/50'
          )}
          style={{ top: label.top, left: label.left, transform: 'translate(-50%, -50%)' }}
        >
          {label.name}
        </button>
      ))}
      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-sm border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground">
        🖱️ Click labels to learn • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

function SceneSetup() {
  return (
    <>
      <color attach="background" args={['#dde3ea']} />
      <fog attach="fog" args={['#dde3ea', 25, 60]} />

      {/* Ambient */}
      <ambientLight intensity={0.6} />

      {/* Key light */}
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill light */}
      <directionalLight position={[-5, 3, -3]} intensity={0.6} />

      {/* Rim light */}
      <directionalLight position={[0, 5, -10]} intensity={0.5} color="#88aaff" />

      {/* Hemisphere */}
      <hemisphereLight args={['#ddeeff', '#8899aa', 0.5]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#dde3ea" metalness={0.05} roughness={0.9} />
      </mesh>

      {/* Grid on floor */}
      <gridHelper
        args={[30, 50, '#b8c4ce', '#c8d0da']}
        position={[0, -2.99, 0]}
      />
    </>
  );
}

function MachineScene({
  machineType,
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
  customModelUrl,
}: MachineViewerProps) {
  const props = { selectedPart, onPartClick, isAnimating, animationSpeed, isExploded, showLabels };

  if (machineType === 'custom' && customModelUrl) {
    return <CustomModel url={customModelUrl} isAnimating={isAnimating} animationSpeed={animationSpeed} />;
  }

  switch (machineType) {
    case 'dc-generator':
      return <DCGeneratorModel {...props} />;
    case 'transformer':
      return <TransformerModel {...props} />;
    case 'induction-motor':
      return <InductionMotorModel {...props} />;
    default:
      return null;
  }
}

export function MachineViewer(props: MachineViewerProps) {
  // Use Sketchfab embed for DC Motor
  if (props.machineType === 'dc-motor') {
    return <SketchfabDCMotor selectedPart={props.selectedPart} onPartClick={props.onPartClick} />;
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden relative" style={{ background: '#dde3ea' }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          if (props.canvasRef) {
            props.canvasRef.current = gl.domElement;
          }
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={3}
            maxDistance={15}
            autoRotate={!props.isAnimating && !props.isExploded}
            autoRotateSpeed={0.5}
          />
          <SceneSetup />
          <MachineScene {...props} />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-sm border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground">
        🖱️ Click parts to learn • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
