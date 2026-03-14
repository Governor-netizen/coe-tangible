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
  showLabels?: boolean;
}

export function TransformerModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
}: TransformerModelProps) {
  const primaryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);
  const glowRef = useRef<number>(0);
  const parts = machineDatabase['transformer'].parts;

  useFrame((_, delta) => {
    if (!isAnimating) return;
    glowRef.current += delta * animationSpeed * 3;
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
    <group>
      <MachinePartMesh partId="core" name={getPart('core').name} color={getPart('core').color} isSelected={selectedPart === 'core'} isExploded={isExploded} explodeOffset={getPart('core').explodeOffset} assemblyOrder={getPart('core').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh position={[-1.2, 0, 0]} castShadow receiveShadow><boxGeometry args={[0.4, 3, 0.8]} /><meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} /></mesh>
        <mesh position={[1.2, 0, 0]} castShadow receiveShadow><boxGeometry args={[0.4, 3, 0.8]} /><meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} /></mesh>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[2.8, 0.35, 0.8]} /><meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} /></mesh>
        <mesh position={[0, -1.5, 0]} castShadow receiveShadow><boxGeometry args={[2.8, 0.35, 0.8]} /><meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} /></mesh>
        <mesh position={[0, 0, 0]} castShadow receiveShadow><boxGeometry args={[0.4, 2.65, 0.8]} /><meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} /></mesh>
      </MachinePartMesh>

      <MachinePartMesh partId="primaryWinding" name={getPart('primaryWinding').name} color={getPart('primaryWinding').color} isSelected={selectedPart === 'primaryWinding'} isExploded={isExploded} explodeOffset={getPart('primaryWinding').explodeOffset} assemblyOrder={getPart('primaryWinding').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={primaryRef}>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[-0.6, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow><torusGeometry args={[0.35, 0.08, 8, 16]} /><meshStandardMaterial color="#c8400a" metalness={0.6} roughness={0.3} /></mesh>
          ))}
        </group>
      </MachinePartMesh>

      <MachinePartMesh partId="secondaryWinding" name={getPart('secondaryWinding').name} color={getPart('secondaryWinding').color} isSelected={selectedPart === 'secondaryWinding'} isExploded={isExploded} explodeOffset={getPart('secondaryWinding').explodeOffset} assemblyOrder={getPart('secondaryWinding').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={secondaryRef}>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[0.6, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow><torusGeometry args={[0.35, 0.08, 8, 16]} /><meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.2} /></mesh>
          ))}
        </group>
      </MachinePartMesh>

      <MachinePartMesh partId="insulation" name={getPart('insulation').name} color={getPart('insulation').color} isSelected={selectedPart === 'insulation'} isExploded={isExploded} explodeOffset={getPart('insulation').explodeOffset} assemblyOrder={getPart('insulation').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh position={[-0.6, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 2, 16, 1, true]} /><meshStandardMaterial color={getPart('insulation').color} transparent opacity={0.4} roughness={0.8} /></mesh>
        <mesh position={[0.6, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 2, 16, 1, true]} /><meshStandardMaterial color={getPart('insulation').color} transparent opacity={0.4} roughness={0.8} /></mesh>
      </MachinePartMesh>
    </group>
  );
}
