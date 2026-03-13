import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MachinePartMesh } from '../MachinePartMesh';
import { machineDatabase } from '@/data/machineData';

interface InductionMotorModelProps {
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  isExploded: boolean;
}

export function InductionMotorModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
}: InductionMotorModelProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Group>(null);
  const fieldRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const parts = machineDatabase['induction-motor'].parts;

  useFrame((_, delta) => {
    if (!isAnimating) return;
    const speed = delta * animationSpeed * 3;
    timeRef.current += speed;
    // Rotor spins slightly slower than field (slip)
    if (rotorRef.current) rotorRef.current.rotation.y += speed * 0.95;
    if (shaftRef.current) shaftRef.current.rotation.y += speed * 0.95;
    // Rotating field visualization
    if (fieldRef.current) fieldRef.current.rotation.y += speed;
  });

  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
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

      {/* Phase A Winding - Red */}
      <MachinePartMesh
        partId="phaseA"
        name={getPart('phaseA').name}
        color={getPart('phaseA').color}
        isSelected={selectedPart === 'phaseA'}
        isExploded={isExploded}
        explodeOffset={getPart('phaseA').explodeOffset}
        assemblyOrder={getPart('phaseA').assemblyOrder}
        onClick={onPartClick}
      >
        <group ref={fieldRef}>
          <mesh position={[1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.35, 0.08, 8, 16]} />
          </mesh>
          <mesh position={[-1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.35, 0.08, 8, 16]} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* Phase B Winding - Yellow */}
      <MachinePartMesh
        partId="phaseB"
        name={getPart('phaseB').name}
        color={getPart('phaseB').color}
        isSelected={selectedPart === 'phaseB'}
        isExploded={isExploded}
        explodeOffset={getPart('phaseB').explodeOffset}
        assemblyOrder={getPart('phaseB').assemblyOrder}
        onClick={onPartClick}
      >
        <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.08, 8, 16]} />
        </mesh>
        <mesh position={[0, 0, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.08, 8, 16]} />
        </mesh>
      </MachinePartMesh>

      {/* Phase C Winding - Green */}
      <MachinePartMesh
        partId="phaseC"
        name={getPart('phaseC').name}
        color={getPart('phaseC').color}
        isSelected={selectedPart === 'phaseC'}
        isExploded={isExploded}
        explodeOffset={getPart('phaseC').explodeOffset}
        assemblyOrder={getPart('phaseC').assemblyOrder}
        onClick={onPartClick}
      >
        <mesh position={[1, 0, 1]} rotation={[Math.PI / 4, 0, Math.PI / 2]}>
          <torusGeometry args={[0.35, 0.08, 8, 16]} />
        </mesh>
        <mesh position={[-1, 0, -1]} rotation={[Math.PI / 4, 0, Math.PI / 2]}>
          <torusGeometry args={[0.35, 0.08, 8, 16]} />
        </mesh>
      </MachinePartMesh>

      {/* Squirrel Cage Rotor */}
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
          {/* Core */}
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
          </mesh>
          {/* Conductor bars */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.7, 0, Math.sin(angle) * 0.7]}
              >
                <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
                <meshStandardMaterial color="#D4A843" roughness={0.3} metalness={0.6} />
              </mesh>
            );
          })}
          {/* End rings */}
          <mesh position={[0, 1.1, 0]}>
            <torusGeometry args={[0.7, 0.05, 8, 24]} />
            <meshStandardMaterial color="#D4A843" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, -1.1, 0]}>
            <torusGeometry args={[0.7, 0.05, 8, 24]} />
            <meshStandardMaterial color="#D4A843" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
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
