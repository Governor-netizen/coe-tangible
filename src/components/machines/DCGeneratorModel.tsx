import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MachinePartMesh } from '../MachinePartMesh';
import { machineDatabase } from '@/data/machineData';

interface DCGeneratorModelProps {
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  isExploded: boolean;
  showLabels?: boolean;
  explodeSpread?: number;
}

export function DCGeneratorModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
  explodeSpread = 1,
}: DCGeneratorModelProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const commutatorRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Group>(null);
  const parts = machineDatabase['dc-generator'].parts;

  useFrame((_, delta) => {
    if (!isAnimating) return;
    const speed = delta * animationSpeed * 3;
    if (rotorRef.current) rotorRef.current.rotation.z += speed;
    if (commutatorRef.current) commutatorRef.current.rotation.z += speed;
    if (shaftRef.current) shaftRef.current.rotation.z += speed;
  });

  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  return (
    <group>
      {/* Stator - darker housing with pole shoes */}
      <MachinePartMesh
        partId="stator"
        name={getPart('stator').name}
        color={getPart('stator').color}
        isSelected={selectedPart === 'stator'}
        isExploded={isExploded}
        explodeOffset={getPart('stator').explodeOffset}
        assemblyOrder={getPart('stator').assemblyOrder}
        onClick={onPartClick}
        showLabel={showLabels}
        labelOffset={[0, 2, 0]}
      >
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.9, 1.9, 2.6, 64, 1, true]} />
          <meshStandardMaterial color="#3d4450" metalness={0.7} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <ringGeometry args={[0.6, 1.9, 64]} />
          <meshStandardMaterial color="#3d4450" metalness={0.7} roughness={0.6} />
        </mesh>
        <mesh position={[0, -1.3, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
          <ringGeometry args={[0.6, 1.9, 64]} />
          <meshStandardMaterial color="#3d4450" metalness={0.7} roughness={0.6} />
        </mesh>
        {/* Pole shoes */}
        {[0, Math.PI].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 1.35, 0, Math.sin(angle) * 1.35]} rotation={[0, -angle + Math.PI / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 2, 0.25]} />
            <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}
        {/* Field windings on pole shoes */}
        {[0, Math.PI].map((angle, i) => (
          <group key={`fw-${i}`} position={[Math.cos(angle) * 1.35, 0, Math.sin(angle) * 1.35]} rotation={[0, -angle + Math.PI / 2, 0]}>
            {[-0.6, -0.3, 0, 0.3, 0.6].map((y, j) => (
              <mesh key={j} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <torusGeometry args={[0.2, 0.04, 16, 24]} />
                <meshStandardMaterial color="#c8400a" metalness={0.6} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Bolts */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2;
          return (
            <mesh key={`bolt-${i}`} position={[Math.cos(a) * 1.5, 1.35, Math.sin(a) * 1.5]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.15, 12]} />
              <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
            </mesh>
          );
        })}
      </MachinePartMesh>

      {/* Rotor with lamination lines */}
      <MachinePartMesh
        partId="rotor"
        name={getPart('rotor').name}
        color={getPart('rotor').color}
        isSelected={selectedPart === 'rotor'}
        isExploded={isExploded}
        explodeOffset={getPart('rotor').explodeOffset}
        assemblyOrder={getPart('rotor').assemblyOrder}
        onClick={onPartClick}
        showLabel={showLabels}
        labelOffset={[1.2, 0, 0]}
      >
        <group ref={rotorRef}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.85, 0.85, 2, 64]} />
            <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Lamination lines */}
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[0, -0.8 + i * 0.2, 0]}>
              <torusGeometry args={[0.86, 0.008, 8, 64]} />
              <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
            </mesh>
          ))}
          {/* Armature slots */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={`slot-${i}`} rotation={[0, (i * Math.PI) / 4, 0]}>
              <mesh position={[0.6, 0, 0]} castShadow>
                <boxGeometry args={[0.05, 1.8, 0.1]} />
                <meshStandardMaterial color="#c8400a" metalness={0.6} roughness={0.3} />
              </mesh>
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* Commutator - 12 segments */}
      <MachinePartMesh
        partId="commutator"
        name={getPart('commutator').name}
        color={getPart('commutator').color}
        isSelected={selectedPart === 'commutator'}
        isExploded={isExploded}
        explodeOffset={getPart('commutator').explodeOffset}
        assemblyOrder={getPart('commutator').assemblyOrder}
        onClick={onPartClick}
        showLabel={showLabels}
        labelOffset={[0.8, -1.6, 0]}
      >
        <group ref={commutatorRef}>
          <mesh position={[0, -1.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.5, 64]} />
            <meshStandardMaterial color="#8B6914" metalness={0.8} roughness={0.3} />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => {
            const midAngle = (i / 12) * Math.PI * 2 + Math.PI / 12;
            return (
              <mesh key={i} position={[Math.cos(midAngle) * 0.38, -1.6, Math.sin(midAngle) * 0.38]} rotation={[0, -midAngle, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.19, 0.52, 0.04]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#b87333' : '#a06428'} metalness={0.9} roughness={0.2} />
              </mesh>
            );
          })}
        </group>
      </MachinePartMesh>

      {/* Brushes with holders */}
      <MachinePartMesh
        partId="brushes"
        name={getPart('brushes').name}
        color={getPart('brushes').color}
        isSelected={selectedPart === 'brushes'}
        isExploded={isExploded}
        explodeOffset={getPart('brushes').explodeOffset}
        assemblyOrder={getPart('brushes').assemblyOrder}
        onClick={onPartClick}
        showLabel={showLabels}
        labelOffset={[1.2, -1.6, 0]}
      >
        <mesh position={[0.65, -1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.4, 0.3]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.85, -1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.5, 0.35]} />
          <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0.9, -1.35, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 12]} />
          <meshStandardMaterial color="#AAAAAA" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[-0.65, -1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.4, 0.3]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[-0.85, -1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.5, 0.35]} />
          <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[-0.9, -1.35, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 12]} />
          <meshStandardMaterial color="#AAAAAA" roughness={0.3} metalness={0.6} />
        </mesh>
      </MachinePartMesh>

      {/* Shaft with bearings */}
      <MachinePartMesh
        partId="shaft"
        name={getPart('shaft').name}
        color={getPart('shaft').color}
        isSelected={selectedPart === 'shaft'}
        isExploded={isExploded}
        explodeOffset={getPart('shaft').explodeOffset}
        assemblyOrder={getPart('shaft').assemblyOrder}
        onClick={onPartClick}
        showLabel={showLabels}
        labelOffset={[0, 2.8, 0]}
      >
        <group ref={shaftRef}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.12, 5, 32]} />
            <meshStandardMaterial color="#d4d8e0" metalness={1.0} roughness={0.05} />
          </mesh>
          {/* Bearings */}
          {[1.3, -1.3].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.25, 32]} />
              <meshStandardMaterial color="#888888" metalness={0.85} roughness={0.15} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* Fan at back */}
      <group position={[0, -2.2, 0]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8]} rotation={[0.2, angle, 0]} castShadow>
              <boxGeometry args={[0.06, 0.35, 0.3]} />
              <meshStandardMaterial color="#b8c4cc" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
