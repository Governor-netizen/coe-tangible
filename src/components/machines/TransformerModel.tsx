import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MachinePartMesh } from '../MachinePartMesh';
import { machineDatabase } from '@/data/machineData';

interface TransformerModelProps {
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  isExploded: boolean;
}

export function TransformerModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
}: TransformerModelProps) {
  const primaryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);
  const glowRef = useRef<number>(0);
  const parts = machineDatabase['transformer'].parts;

  useFrame((_, delta) => {
    if (!isAnimating) return;
    glowRef.current += delta * animationSpeed * 3;
    // Pulsing effect on windings to show AC
    if (primaryRef.current) {
      const scale = 1 + Math.sin(glowRef.current) * 0.03;
      primaryRef.current.scale.set(scale, scale, scale);
    }
    if (secondaryRef.current) {
      const scale = 1 + Math.sin(glowRef.current + Math.PI) * 0.03;
      secondaryRef.current.scale.set(scale, scale, scale);
    }
  });

  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  return (
    <group rotation={[0, 0, 0]}>
      {/* Core - E-shaped iron core */}
      <MachinePartMesh
        partId="core"
        name={getPart('core').name}
        color={getPart('core').color}
        isSelected={selectedPart === 'core'}
        isExploded={isExploded}
        explodeOffset={getPart('core').explodeOffset}
        assemblyOrder={getPart('core').assemblyOrder}
        onClick={onPartClick}
      >
        {/* Left leg */}
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[0.4, 3, 0.8]} />
        </mesh>
        {/* Right leg */}
        <mesh position={[1.2, 0, 0]}>
          <boxGeometry args={[0.4, 3, 0.8]} />
        </mesh>
        {/* Top yoke */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[2.8, 0.35, 0.8]} />
        </mesh>
        {/* Bottom yoke */}
        <mesh position={[0, -1.5, 0]}>
          <boxGeometry args={[2.8, 0.35, 0.8]} />
        </mesh>
        {/* Center leg */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 2.65, 0.8]} />
        </mesh>
      </MachinePartMesh>

      {/* Primary Winding */}
      <MachinePartMesh
        partId="primaryWinding"
        name={getPart('primaryWinding').name}
        color={getPart('primaryWinding').color}
        isSelected={selectedPart === 'primaryWinding'}
        isExploded={isExploded}
        explodeOffset={getPart('primaryWinding').explodeOffset}
        assemblyOrder={getPart('primaryWinding').assemblyOrder}
        onClick={onPartClick}
      >
        <group ref={primaryRef}>
          {/* Winding coils around left leg */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[-0.6, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.35, 0.08, 8, 16]} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* Secondary Winding */}
      <MachinePartMesh
        partId="secondaryWinding"
        name={getPart('secondaryWinding').name}
        color={getPart('secondaryWinding').color}
        isSelected={selectedPart === 'secondaryWinding'}
        isExploded={isExploded}
        explodeOffset={getPart('secondaryWinding').explodeOffset}
        assemblyOrder={getPart('secondaryWinding').assemblyOrder}
        onClick={onPartClick}
      >
        <group ref={secondaryRef}>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[0.6, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.35, 0.08, 8, 16]} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* Insulation */}
      <MachinePartMesh
        partId="insulation"
        name={getPart('insulation').name}
        color={getPart('insulation').color}
        isSelected={selectedPart === 'insulation'}
        isExploded={isExploded}
        explodeOffset={getPart('insulation').explodeOffset}
        assemblyOrder={getPart('insulation').assemblyOrder}
        onClick={onPartClick}
      >
        <mesh position={[-0.6, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 2, 16, 1, true]} />
          <meshStandardMaterial
            color={getPart('insulation').color}
            transparent
            opacity={0.4}
            roughness={0.8}
          />
        </mesh>
        <mesh position={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 2, 16, 1, true]} />
          <meshStandardMaterial
            color={getPart('insulation').color}
            transparent
            opacity={0.4}
            roughness={0.8}
          />
        </mesh>
      </MachinePartMesh>
    </group>
  );
}
