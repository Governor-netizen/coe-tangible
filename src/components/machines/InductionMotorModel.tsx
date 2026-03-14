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
  showLabels?: boolean;
}

export function InductionMotorModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
}: InductionMotorModelProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Group>(null);
  const fanRef = useRef<THREE.Group>(null);
  const parts = machineDatabase['induction-motor'].parts;

  useFrame((_, delta) => {
    if (!isAnimating) return;
    const speed = delta * animationSpeed * 3;
    if (rotorRef.current) rotorRef.current.rotation.y += speed * 0.95;
    if (shaftRef.current) shaftRef.current.rotation.y += speed * 0.95;
    if (fanRef.current) fanRef.current.rotation.y += speed * 0.95;
  });

  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  return (
    <group>
      {/* 1. OUTER HOUSING */}
      <MachinePartMesh partId="housing" name={getPart('housing').name} color={getPart('housing').color} isSelected={selectedPart === 'housing'} isExploded={isExploded} explodeOffset={getPart('housing').explodeOffset} assemblyOrder={getPart('housing').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 4.0, 32]} />
          <meshStandardMaterial color="#9ba8b5" metalness={0.3} roughness={0.6} />
        </mesh>
      </MachinePartMesh>

      {/* 2. STATOR CORE */}
      <MachinePartMesh partId="statorCore" name={getPart('statorCore').name} color={getPart('statorCore').color} isSelected={selectedPart === 'statorCore'} isExploded={isExploded} explodeOffset={getPart('statorCore').explodeOffset} assemblyOrder={getPart('statorCore').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.7, 1.7, 3.6, 32]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
        </mesh>
      </MachinePartMesh>

      {/* 3. PHASE R WINDING */}
      <MachinePartMesh partId="phaseR" name={getPart('phaseR').name} color={getPart('phaseR').color} isSelected={selectedPart === 'phaseR'} isExploded={isExploded} explodeOffset={getPart('phaseR').explodeOffset} assemblyOrder={getPart('phaseR').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, -1.0, 0]}>
          <torusGeometry args={[1.5, 0.18, 8, 6]} />
          <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.5} />
        </mesh>
      </MachinePartMesh>

      {/* 4. PHASE Y WINDING */}
      <MachinePartMesh partId="phaseY" name={getPart('phaseY').name} color={getPart('phaseY').color} isSelected={selectedPart === 'phaseY'} isExploded={isExploded} explodeOffset={getPart('phaseY').explodeOffset} assemblyOrder={getPart('phaseY').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, (Math.PI * 2) / 3]} position={[0, 0, 0]}>
          <torusGeometry args={[1.5, 0.18, 8, 6]} />
          <meshStandardMaterial color="#d97706" metalness={0.3} roughness={0.5} />
        </mesh>
      </MachinePartMesh>

      {/* 5. PHASE B WINDING */}
      <MachinePartMesh partId="phaseB" name={getPart('phaseB').name} color={getPart('phaseB').color} isSelected={selectedPart === 'phaseB'} isExploded={isExploded} explodeOffset={getPart('phaseB').explodeOffset} assemblyOrder={getPart('phaseB').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, (Math.PI * 4) / 3]} position={[0, 1.0, 0]}>
          <torusGeometry args={[1.5, 0.18, 8, 6]} />
          <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.5} />
        </mesh>
      </MachinePartMesh>

      {/* 6. SQUIRREL CAGE ROTOR */}
      <MachinePartMesh partId="rotor" name={getPart('rotor').name} color={getPart('rotor').color} isSelected={selectedPart === 'rotor'} isExploded={isExploded} explodeOffset={getPart('rotor').explodeOffset} assemblyOrder={getPart('rotor').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={rotorRef}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.1, 1.1, 3.6, 32]} />
            <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Rotor bars */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 3.8, 8]} />
                <meshStandardMaterial color="#b8c4cc" metalness={0.9} roughness={0.2} />
              </mesh>
            );
          })}
          {/* End rings */}
          {[-1.9, 1.9].map((yPos) => (
            <mesh key={yPos} rotation={[Math.PI / 2, 0, 0]} position={[0, yPos, 0]} castShadow>
              <torusGeometry args={[1.0, 0.1, 8, 32]} />
              <meshStandardMaterial color="#b8c4cc" metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* 7. SHAFT */}
      <MachinePartMesh partId="shaft" name={getPart('shaft').name} color={getPart('shaft').color} isSelected={selectedPart === 'shaft'} isExploded={isExploded} explodeOffset={getPart('shaft').explodeOffset} assemblyOrder={getPart('shaft').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={shaftRef}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.18, 7.0, 16]} />
            <meshStandardMaterial color="#d4d8e0" metalness={1.0} roughness={0.05} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* 8. END SHIELDS */}
      <MachinePartMesh partId="endShield" name={getPart('endShield').name} color={getPart('endShield').color} isSelected={selectedPart === 'endShield'} isExploded={isExploded} explodeOffset={getPart('endShield').explodeOffset} assemblyOrder={getPart('endShield').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 0.2, 32]} />
          <meshStandardMaterial color="#9ba8b5" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0, -2.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 0.2, 32]} />
          <meshStandardMaterial color="#9ba8b5" metalness={0.3} roughness={0.6} />
        </mesh>
      </MachinePartMesh>

      {/* 9. COOLING FAN */}
      <MachinePartMesh partId="coolingFan" name={getPart('coolingFan').name} color={getPart('coolingFan').color} isSelected={selectedPart === 'coolingFan'} isExploded={isExploded} explodeOffset={getPart('coolingFan').explodeOffset} assemblyOrder={getPart('coolingFan').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={fanRef}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 1.4, 2.5, Math.sin(angle) * 1.4]} rotation={[0, angle, 0]} castShadow>
                <boxGeometry args={[0.15, 0.5, 0.3]} />
                <meshStandardMaterial color="#b8c4cc" metalness={0.7} roughness={0.3} />
              </mesh>
            );
          })}
        </group>
      </MachinePartMesh>

      {/* 10. TERMINAL BOX */}
      <MachinePartMesh partId="terminalBox" name={getPart('terminalBox').name} color={getPart('terminalBox').color} isSelected={selectedPart === 'terminalBox'} isExploded={isExploded} explodeOffset={getPart('terminalBox').explodeOffset} assemblyOrder={getPart('terminalBox').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh position={[2.3, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.7, 0.5]} />
          <meshStandardMaterial color="#9ba8b5" metalness={0.2} roughness={0.7} />
        </mesh>
      </MachinePartMesh>
    </group>
  );
}
