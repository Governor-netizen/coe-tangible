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
      {/* 1. OUTER HOUSING - hollow with cooling fins */}
      <MachinePartMesh partId="housing" name={getPart('housing').name} color={getPart('housing').color} isSelected={selectedPart === 'housing'} isExploded={isExploded} explodeOffset={getPart('housing').explodeOffset} assemblyOrder={getPart('housing').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        {/* Main hollow cylinder */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 4.0, 64, 1, true]} />
          <meshStandardMaterial color="#9ba8b5" metalness={0.3} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Cooling fins on outside */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          return (
            <mesh key={`fin-${i}`} position={[Math.cos(angle) * 2.08, 0, Math.sin(angle) * 2.08]} rotation={[0, -angle + Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[0.03, 3.6, 0.15]} />
              <meshStandardMaterial color="#8a96a3" metalness={0.35} roughness={0.55} />
            </mesh>
          );
        })}
        {/* Mounting feet */}
        {[-0.8, 0.8].map((z) => (
          <mesh key={z} position={[0, -2.2, z]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.15, 0.5]} />
            <meshStandardMaterial color="#9ba8b5" metalness={0.3} roughness={0.6} />
          </mesh>
        ))}
      </MachinePartMesh>

      {/* 2. STATOR CORE */}
      <MachinePartMesh partId="statorCore" name={getPart('statorCore').name} color={getPart('statorCore').color} isSelected={selectedPart === 'statorCore'} isExploded={isExploded} explodeOffset={getPart('statorCore').explodeOffset} assemblyOrder={getPart('statorCore').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.7, 1.7, 3.6, 64]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Lamination lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[0, -1.65 + i * 0.3, 0]}>
            <torusGeometry args={[1.71, 0.008, 8, 64]} />
            <meshStandardMaterial color="#2d3748" roughness={0.5} />
          </mesh>
        ))}
        {/* Stator slots */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          return (
            <mesh key={`ss-${i}`} position={[Math.cos(angle) * 1.55, 0, Math.sin(angle) * 1.55]} rotation={[0, -angle, 0]} castShadow>
              <boxGeometry args={[0.04, 3.4, 0.08]} />
              <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.5} />
            </mesh>
          );
        })}
      </MachinePartMesh>

      {/* 3. PHASE R WINDING */}
      <MachinePartMesh partId="phaseR" name={getPart('phaseR').name} color={getPart('phaseR').color} isSelected={selectedPart === 'phaseR'} isExploded={isExploded} explodeOffset={getPart('phaseR').explodeOffset} assemblyOrder={getPart('phaseR').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        {[-1.0, 1.0].map((y, i) => (
          <mesh key={i} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]}>
            <torusGeometry args={[1.5, 0.14, 16, 32]} />
            <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
      </MachinePartMesh>

      {/* 4. PHASE Y WINDING */}
      <MachinePartMesh partId="phaseY" name={getPart('phaseY').name} color={getPart('phaseY').color} isSelected={selectedPart === 'phaseY'} isExploded={isExploded} explodeOffset={getPart('phaseY').explodeOffset} assemblyOrder={getPart('phaseY').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        {[-0.5, 0.5].map((y, i) => (
          <mesh key={i} castShadow receiveShadow rotation={[Math.PI / 2, 0, (Math.PI * 2) / 3]} position={[0, y, 0]}>
            <torusGeometry args={[1.5, 0.14, 16, 32]} />
            <meshStandardMaterial color="#d97706" metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
      </MachinePartMesh>

      {/* 5. PHASE B WINDING */}
      <MachinePartMesh partId="phaseB" name={getPart('phaseB').name} color={getPart('phaseB').color} isSelected={selectedPart === 'phaseB'} isExploded={isExploded} explodeOffset={getPart('phaseB').explodeOffset} assemblyOrder={getPart('phaseB').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        {[0, -0.0].map((y, i) => (
          <mesh key={i} castShadow receiveShadow rotation={[Math.PI / 2, 0, (Math.PI * 4) / 3]} position={[0, y, 0]}>
            <torusGeometry args={[1.5, 0.14, 16, 32]} />
            <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
      </MachinePartMesh>

      {/* 6. SQUIRREL CAGE ROTOR */}
      <MachinePartMesh partId="rotor" name={getPart('rotor').name} color={getPart('rotor').color} isSelected={selectedPart === 'rotor'} isExploded={isExploded} explodeOffset={getPart('rotor').explodeOffset} assemblyOrder={getPart('rotor').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={rotorRef}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.1, 1.1, 3.6, 64]} />
            <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Lamination lines on rotor */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh key={`rl-${i}`} position={[0, -1.6 + i * 0.35, 0]}>
              <torusGeometry args={[1.11, 0.006, 8, 64]} />
              <meshStandardMaterial color="#2d3748" roughness={0.5} />
            </mesh>
          ))}
          {/* Rotor bars - 16 for more realism */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0]} castShadow>
                <cylinderGeometry args={[0.06, 0.06, 3.8, 12]} />
                <meshStandardMaterial color="#b8c4cc" metalness={0.9} roughness={0.2} />
              </mesh>
            );
          })}
          {/* End rings */}
          {[-1.9, 1.9].map((yPos) => (
            <mesh key={yPos} rotation={[Math.PI / 2, 0, 0]} position={[0, yPos, 0]} castShadow>
              <torusGeometry args={[1.0, 0.1, 16, 48]} />
              <meshStandardMaterial color="#b8c4cc" metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* 7. SHAFT */}
      <MachinePartMesh partId="shaft" name={getPart('shaft').name} color={getPart('shaft').color} isSelected={selectedPart === 'shaft'} isExploded={isExploded} explodeOffset={getPart('shaft').explodeOffset} assemblyOrder={getPart('shaft').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={shaftRef}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.18, 7.0, 32]} />
            <meshStandardMaterial color="#d4d8e0" metalness={1.0} roughness={0.05} />
          </mesh>
          {/* Keyway */}
          <mesh position={[0.14, 2.8, 0]} castShadow>
            <boxGeometry args={[0.06, 1.0, 0.06]} />
            <meshStandardMaterial color="#b0b8c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* 8. END SHIELDS with bearing detail */}
      <MachinePartMesh partId="endShield" name={getPart('endShield').name} color={getPart('endShield').color} isSelected={selectedPart === 'endShield'} isExploded={isExploded} explodeOffset={getPart('endShield').explodeOffset} assemblyOrder={getPart('endShield').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        {[2.1, -2.1].map((y) => (
          <group key={y}>
            <mesh position={[0, y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[2.0, 2.0, 0.2, 64]} />
              <meshStandardMaterial color="#9ba8b5" metalness={0.3} roughness={0.6} />
            </mesh>
            {/* Bearing recess */}
            <mesh position={[0, y, 0]}>
              <torusGeometry args={[0.3, 0.08, 16, 32]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Bolts */}
            {[0, 1, 2, 3].map((i) => {
              const a = (i * Math.PI) / 2;
              return (
                <mesh key={`bolt-${y}-${i}`} position={[Math.cos(a) * 1.7, y + (y > 0 ? 0.12 : -0.12), Math.sin(a) * 1.7]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
                  <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
                </mesh>
              );
            })}
          </group>
        ))}
      </MachinePartMesh>

      {/* 9. COOLING FAN - curved blades */}
      <MachinePartMesh partId="coolingFan" name={getPart('coolingFan').name} color={getPart('coolingFan').color} isSelected={selectedPart === 'coolingFan'} isExploded={isExploded} explodeOffset={getPart('coolingFan').explodeOffset} assemblyOrder={getPart('coolingFan').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <group ref={fanRef}>
          {/* Hub */}
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.4, 32]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Blades */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 1.0, 2.5, Math.sin(angle) * 1.0]} rotation={[0.3, angle, 0.2]} castShadow>
                <boxGeometry args={[0.08, 0.45, 0.5]} />
                <meshStandardMaterial color="#b8c4cc" metalness={0.7} roughness={0.3} />
              </mesh>
            );
          })}
          {/* Fan cowl */}
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.6, 1.6, 0.5, 64, 1, true]} />
            <meshStandardMaterial color="#9ba8b5" metalness={0.25} roughness={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* 10. TERMINAL BOX */}
      <MachinePartMesh partId="terminalBox" name={getPart('terminalBox').name} color={getPart('terminalBox').color} isSelected={selectedPart === 'terminalBox'} isExploded={isExploded} explodeOffset={getPart('terminalBox').explodeOffset} assemblyOrder={getPart('terminalBox').assemblyOrder} onClick={onPartClick} showLabel={showLabels}>
        <mesh position={[2.3, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.7, 0.5]} />
          <meshStandardMaterial color="#9ba8b5" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* Lid */}
        <mesh position={[2.8, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.6, 0.4]} />
          <meshStandardMaterial color="#8a96a3" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Cable entry */}
        <mesh position={[2.3, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.4} />
        </mesh>
      </MachinePartMesh>
    </group>
  );
}
