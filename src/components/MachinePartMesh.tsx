import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface MachinePartMeshProps {
  partId: string;
  name: string;
  color: string;
  isSelected: boolean;
  isExploded: boolean;
  explodeOffset: [number, number, number];
  assemblyOrder: number;
  onClick: (id: string) => void;
  showLabel?: boolean;
  labelOffset?: [number, number, number];
  children: React.ReactNode;
}

export function MachinePartMesh({
  partId,
  name,
  color,
  isSelected,
  isExploded,
  explodeOffset,
  assemblyOrder,
  onClick,
  showLabel = false,
  labelOffset = [0, 1.2, 0],
  children,
}: MachinePartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = isExploded
      ? new THREE.Vector3(...explodeOffset)
      : new THREE.Vector3(0, 0, 0);
    groupRef.current.position.lerp(target, 0.08);
  });

  const emissiveColor = isSelected ? '#00bcd4' : hovered ? '#80deea' : '#000000';
  const emissiveIntensity = isSelected ? 0.4 : hovered ? 0.25 : 0;

  return (
    <group ref={groupRef}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onClick(partId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          transparent={hovered && !isSelected}
          opacity={hovered && !isSelected ? 0.85 : 1}
          roughness={0.4}
          metalness={0.3}
        />
        {children}
      </group>

      {/* Always-on label */}
      {showLabel && !isExploded && (
        <Html distanceFactor={10} position={labelOffset} center>
          <div className="bg-card/80 backdrop-blur border border-border rounded px-1.5 py-0.5 text-[10px] font-medium text-foreground whitespace-nowrap shadow-sm pointer-events-none select-none">
            {name}
          </div>
        </Html>
      )}

      {/* Exploded view label with assembly order */}
      {isExploded && (
        <Html distanceFactor={8} position={[0, 0.8, 0]} center>
          <div className="bg-card/90 backdrop-blur border border-border rounded px-2 py-1 text-xs font-medium text-foreground whitespace-nowrap shadow-md pointer-events-none">
            <span className="text-primary font-bold mr-1">{assemblyOrder}.</span>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
