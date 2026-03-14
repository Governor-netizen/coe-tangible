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
  explodeSpread?: number;
}

export function TransformerModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
  explodeSpread = 1,
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
      {/* CORE with lamination lines */}
      <MachinePartMesh partId="core" name={getPart('core').name} color={getPart('core').color} isSelected={selectedPart === 'core'} isExploded={isExploded} explodeOffset={getPart('core').explodeOffset} assemblyOrder={getPart('core').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        {/* Left limb */}
        <mesh position={[-1.2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 3, 0.8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Right limb */}
        <mesh position={[1.2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 3, 0.8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Center limb */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 2.65, 0.8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Top yoke */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.35, 0.8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Bottom yoke */}
        <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.35, 0.8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Lamination lines on limbs */}
        {[-1.2, 0, 1.2].map((x) => (
          Array.from({ length: 8 }).map((_, i) => (
            <mesh key={`lam-${x}-${i}`} position={[x, -1.1 + i * 0.32, 0.41]} castShadow>
              <boxGeometry args={[0.42, 0.01, 0.01]} />
              <meshStandardMaterial color="#2d3748" roughness={0.6} />
            </mesh>
          ))
        ))}
        {/* HV bushings on top */}
        {[-0.6, 0.6].map((x) => (
          <group key={`bushing-${x}`}>
            <mesh position={[x, 2.0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.7, 16]} />
              <meshStandardMaterial color="#8B4513" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Bushing skirt */}
            {[0, 0.15, 0.3].map((offset) => (
              <mesh key={offset} position={[x, 1.85 + offset, 0]}>
                <torusGeometry args={[0.1, 0.02, 8, 16]} />
                <meshStandardMaterial color="#8B4513" metalness={0.4} roughness={0.5} />
              </mesh>
            ))}
          </group>
        ))}
      </MachinePartMesh>

      {/* PRIMARY WINDING - 8 turns */}
      <MachinePartMesh partId="primaryWinding" name={getPart('primaryWinding').name} color={getPart('primaryWinding').color} isSelected={selectedPart === 'primaryWinding'} isExploded={isExploded} explodeOffset={getPart('primaryWinding').explodeOffset} assemblyOrder={getPart('primaryWinding').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={primaryRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-0.6, -0.9 + i * 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <torusGeometry args={[0.35, 0.06, 16, 32]} />
              <meshStandardMaterial color="#c8400a" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* SECONDARY WINDING - 8 turns */}
      <MachinePartMesh partId="secondaryWinding" name={getPart('secondaryWinding').name} color={getPart('secondaryWinding').color} isSelected={selectedPart === 'secondaryWinding'} isExploded={isExploded} explodeOffset={getPart('secondaryWinding').explodeOffset} assemblyOrder={getPart('secondaryWinding').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={secondaryRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0.6, -0.9 + i * 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <torusGeometry args={[0.35, 0.06, 16, 32]} />
              <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* INSULATION */}
      <MachinePartMesh partId="insulation" name={getPart('insulation').name} color={getPart('insulation').color} isSelected={selectedPart === 'insulation'} isExploded={isExploded} explodeOffset={getPart('insulation').explodeOffset} assemblyOrder={getPart('insulation').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh position={[-0.6, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.48, 0.48, 2.2, 32, 1, true]} />
          <meshStandardMaterial color="#e8d5a3" metalness={0.0} roughness={0.8} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.6, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.48, 0.48, 2.2, 32, 1, true]} />
          <meshStandardMaterial color="#e8d5a3" metalness={0.0} roughness={0.8} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </MachinePartMesh>

      {/* MOUNTING BASE */}
      <group>
        <mesh position={[0, -1.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.2, 1.2]} />
          <meshStandardMaterial color="#9ba8b5" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* Feet */}
        {[-1.4, 1.4].map((x) => (
          <mesh key={x} position={[x, -2.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.4, 0.2, 1.2]} />
            <meshStandardMaterial color="#9ba8b5" metalness={0.2} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
