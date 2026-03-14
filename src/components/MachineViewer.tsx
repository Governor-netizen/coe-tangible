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
  explodeSpread?: number;
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
  explodeSpread = 1,
}: MachineViewerProps) {
  const props = { selectedPart, onPartClick, isAnimating, animationSpeed, isExploded, showLabels, explodeSpread };

  if (machineType === 'custom' && customModelUrl) {
    return <CustomModel url={customModelUrl} isAnimating={isAnimating} animationSpeed={animationSpeed} />;
  }

  switch (machineType) {
    case 'dc-motor':
      return <DCMotorModel {...props} />;
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
          <Environment preset="studio" />
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
