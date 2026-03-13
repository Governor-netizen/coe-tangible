import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { MachineType } from '@/data/machineData';
import { DCMotorModel } from './machines/DCMotorModel';
import { DCGeneratorModel } from './machines/DCGeneratorModel';
import { TransformerModel } from './machines/TransformerModel';
import { InductionMotorModel } from './machines/InductionMotorModel';
import { CustomModel } from './machines/CustomModel';
import { Suspense } from 'react';

interface MachineViewerProps {
  machineType: MachineType;
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  isExploded: boolean;
  showLabels?: boolean;
  customModelUrl?: string | null;
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
    <div className="w-full h-full min-h-[400px] bg-muted/30 rounded-lg overflow-hidden relative">
      <Canvas shadows>
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
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-3, 3, -3]} intensity={0.3} />
          <pointLight position={[0, 5, 0]} intensity={0.3} />
          <MachineScene {...props} />
          <gridHelper args={[10, 10, '#cbd5e1', '#e2e8f0']} position={[0, -2.5, 0]} />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-sm border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground">
        🖱️ Click parts to learn • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
