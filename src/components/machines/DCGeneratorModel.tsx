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
}

export function DCGeneratorModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
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
      {/* Stator */}
      <MachinePartMesh
        partId="stator"
        name={getPart('stator').name}
        color={getPart('stator').color}
        isSelected={selectedPart === 'stator'}
        isExploded={isExploded}
        explodeOffset={getPart('stator').explodeOffset}
        assemblyOrder={getPart('stator').assemblyOrder}
        onClick={onPartClick}
      >
        <mesh>
          <cylinderGeometry args={[1.8, 1.8, 2.5, 32, 1, true]} />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <ringGeometry args={[0.6, 1.8, 32]} />
          <meshStandardMaterial color={getPart('stator').color} roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, -1.25, 0]} rotation={[Math.PI, 0, 0]}>
          <ringGeometry args={[0.6, 1.8, 32]} />
          <meshStandardMaterial color={getPart('stator').color} roughness={0.4} metalness={0.3} />
        </mesh>
      </MachinePartMesh>

      {/* Rotor */}
      <MachinePartMesh
        partId="rotor"
        name={getPart('rotor').name}
        color={getPart('rotor').color}
        isSelected={selectedPart === 'rotor'}
        isExploded={isExploded}
        explodeOffset={getPart('rotor').explodeOffset}
        assemblyOrder={getPart('rotor').assemblyOrder}
        onClick={onPartClick}
      >
        <group ref={rotorRef}>
          <mesh>
            <cylinderGeometry args={[0.85, 0.85, 2, 32]} />
          </mesh>
          {/* Armature slots */}
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
              <mesh position={[0.6, 0, 0]}>
                <boxGeometry args={[0.08, 1.8, 0.15]} />
                <meshStandardMaterial color="#C94040" roughness={0.4} metalness={0.3} />
              </mesh>
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* Commutator */}
      <MachinePartMesh
        partId="commutator"
        name={getPart('commutator').name}
        color={getPart('commutator').color}
        isSelected={selectedPart === 'commutator'}
        isExploded={isExploded}
        explodeOffset={getPart('commutator').explodeOffset}
        assemblyOrder={getPart('commutator').assemblyOrder}
        onClick={onPartClick}
      >
        <group ref={commutatorRef}>
          <mesh position={[0, -1.6, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.5, 6]} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* Brushes */}
      <MachinePartMesh
        partId="brushes"
        name={getPart('brushes').name}
        color={getPart('brushes').color}
        isSelected={selectedPart === 'brushes'}
        isExploded={isExploded}
        explodeOffset={getPart('brushes').explodeOffset}
        assemblyOrder={getPart('brushes').assemblyOrder}
        onClick={onPartClick}
      >
        <mesh position={[0.65, -1.6, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.3]} />
        </mesh>
        <mesh position={[-0.65, -1.6, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.3]} />
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
      >
        <group ref={shaftRef}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 5, 16]} />
          </mesh>
        </group>
      </MachinePartMesh>
    </group>
  );
}
