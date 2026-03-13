import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MachinePartMesh } from '../MachinePartMesh';
import { machineDatabase } from '@/data/machineData';

interface DCMotorModelProps {
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  isExploded: boolean;
  showLabels?: boolean;
}

export function DCMotorModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
}: DCMotorModelProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const commutatorRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Group>(null);
  const windingsRef = useRef<THREE.Group>(null);
  const parts = machineDatabase['dc-motor'].parts;

  useFrame((_, delta) => {
    if (!isAnimating) return;
    const speed = delta * animationSpeed * 3;
    if (rotorRef.current) rotorRef.current.rotation.z += speed;
    if (commutatorRef.current) commutatorRef.current.rotation.z += speed;
    if (shaftRef.current) shaftRef.current.rotation.z += speed;
    if (windingsRef.current) windingsRef.current.rotation.z += speed;
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
        {/* Outer housing */}
        <mesh>
          <cylinderGeometry args={[1.9, 1.9, 2.6, 32, 1, true]} />
        </mesh>
        {/* End caps */}
        <mesh position={[0, 1.3, 0]}>
          <ringGeometry args={[0.6, 1.9, 32]} />
          <meshStandardMaterial color={getPart('stator').color} roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, -1.3, 0]} rotation={[Math.PI, 0, 0]}>
          <ringGeometry args={[0.6, 1.9, 32]} />
          <meshStandardMaterial color={getPart('stator').color} roughness={0.35} metalness={0.4} />
        </mesh>
        {/* Pole shoes - protruding inward */}
        {[0, Math.PI].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 1.35, 0, Math.sin(angle) * 1.35]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <boxGeometry args={[0.6, 2, 0.25]} />
            <meshStandardMaterial color="#1E4A56" roughness={0.35} metalness={0.4} />
          </mesh>
        ))}
        {/* Mounting bolts on end caps */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2;
          return (
            <mesh key={`bolt-${i}`} position={[Math.cos(a) * 1.5, 1.35, Math.sin(a) * 1.5]}>
              <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
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
          <mesh>
            <cylinderGeometry args={[0.9, 0.9, 2, 32]} />
          </mesh>
          {/* Lamination lines */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <torusGeometry args={[0.91, 0.01, 4, 32]} />
              <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
            </mesh>
          ))}
          {/* Armature slots */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={`slot-${i}`} rotation={[0, (i * Math.PI) / 3, 0]}>
              <mesh position={[0.7, 0, 0]}>
                <boxGeometry args={[0.06, 1.8, 0.12]} />
                <meshStandardMaterial color="#D4442A" roughness={0.4} metalness={0.3} />
              </mesh>
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* Commutator - segmented copper */}
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
          {/* Segmented copper ring */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const nextAngle = ((i + 1) / 8) * Math.PI * 2;
            const midAngle = (angle + nextAngle) / 2;
            return (
              <mesh key={i} position={[Math.cos(midAngle) * 0.38, -1.6, Math.sin(midAngle) * 0.38]} rotation={[0, -midAngle, 0]}>
                <boxGeometry args={[0.28, 0.5, 0.06]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#B8860B' : '#9A7209'} roughness={0.25} metalness={0.7} />
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
        {/* Right brush + holder */}
        <mesh position={[0.7, -1.6, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.3]} />
        </mesh>
        <mesh position={[0.9, -1.6, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.35]} />
          <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Spring */}
        <mesh position={[0.95, -1.35, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
          <meshStandardMaterial color="#AAAAAA" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Left brush + holder */}
        <mesh position={[-0.7, -1.6, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.3]} />
        </mesh>
        <mesh position={[-0.9, -1.6, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.35]} />
          <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[-0.95, -1.35, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
          <meshStandardMaterial color="#AAAAAA" roughness={0.3} metalness={0.6} />
        </mesh>
      </MachinePartMesh>

      {/* Shaft */}
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
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 5, 16]} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* Windings */}
      <MachinePartMesh
        partId="windings"
        name={getPart('windings').name}
        color={getPart('windings').color}
        isSelected={selectedPart === 'windings'}
        isExploded={isExploded}
        explodeOffset={getPart('windings').explodeOffset}
        assemblyOrder={getPart('windings').assemblyOrder}
        onClick={onPartClick}
        showLabel={showLabels}
        labelOffset={[1, 0.4, 0]}
      >
        <group ref={windingsRef}>
          {[0.6, 0, -0.6].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}>
              <torusGeometry args={[0.65, 0.1, 8, 24]} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>
    </group>
  );
}
