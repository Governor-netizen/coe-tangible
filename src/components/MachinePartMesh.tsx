import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  explodeSpread?: number;
  /** Quiz target — pulses so the learner can confirm what they found. */
  isHinted?: boolean;
  /** Push into the background because another part has focus. */
  isDimmed?: boolean;
  children: React.ReactNode;
}

const SELECT_EMISSIVE = new THREE.Color('#06b6d4');
const HOVER_EMISSIVE = new THREE.Color('#2563eb');
const HINT_EMISSIVE = new THREE.Color('#f59e0b');
const OFF_EMISSIVE = new THREE.Color('#000000');

type TrackedMaterial = THREE.Material & {
  emissive?: THREE.Color;
  emissiveIntensity?: number;
};

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
  explodeSpread = 1,
  isHinted = false,
  isDimmed = false,
  children,
}: MachinePartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const contentRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<TrackedMaterial[]>([]);
  const [hovered, setHovered] = useState(false);

  const target = useMemo(() => new THREE.Vector3(), []);

  /**
   * Collect every material under this part so highlight state can be applied
   * directly. Each machine model declares its own `<meshStandardMaterial>`
   * elements, so nothing here is shared with a sibling part.
   */
  const collectMaterials = useCallback(() => {
    const found: TrackedMaterial[] = [];
    contentRef.current?.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.material) return;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of list) {
        const mat = m as TrackedMaterial;
        if (mat.userData.__baseOpacity === undefined) {
          mat.userData.__baseOpacity = mat.opacity;
          mat.userData.__baseTransparent = mat.transparent;
        }
        found.push(mat);
      }
    });
    materialsRef.current = found;
  }, []);

  useEffect(() => {
    collectMaterials();
  }, [collectMaterials, children]);

  // Emissive highlight + focus dimming. Runs on state change, not per frame.
  useEffect(() => {
    if (materialsRef.current.length === 0) collectMaterials();

    const emissive = isSelected
      ? SELECT_EMISSIVE
      : isHinted
        ? HINT_EMISSIVE
        : hovered
          ? HOVER_EMISSIVE
          : OFF_EMISSIVE;
    const intensity = isSelected ? 0.45 : isHinted ? 0.4 : hovered ? 0.2 : 0;
    const dim = isDimmed && !isSelected;

    for (const mat of materialsRef.current) {
      // emissive and opacity are plain uniforms — mutating them must NOT set
      // needsUpdate, or every hover recompiles a few dozen shader programs.
      if (mat.emissive) mat.emissive.copy(emissive);
      if ('emissiveIntensity' in mat) mat.emissiveIntensity = intensity;

      const baseOpacity = (mat.userData.__baseOpacity as number) ?? 1;
      const baseTransparent = (mat.userData.__baseTransparent as boolean) ?? false;
      const nextTransparent = dim ? true : baseTransparent;

      mat.opacity = dim ? baseOpacity * 0.18 : baseOpacity;
      mat.depthWrite = !dim;
      if (mat.transparent !== nextTransparent) {
        // Switching the transparency branch does change the program.
        mat.transparent = nextTransparent;
        mat.needsUpdate = true;
      }
    }
  }, [isSelected, hovered, isHinted, isDimmed, collectMaterials]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('cursor-pointer');
    };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      target.set(
        explodeOffset[0] * explodeSpread,
        explodeOffset[1] * explodeSpread,
        explodeOffset[2] * explodeSpread,
      );
      if (!isExploded) target.set(0, 0, 0);
      // Frame-rate independent damping instead of a fixed 0.08 lerp.
      groupRef.current.position.lerp(target, 1 - Math.pow(0.001, delta));
    }

    if (isHinted) {
      const pulse = 0.28 + Math.sin(state.clock.elapsedTime * 4) * 0.18;
      for (const mat of materialsRef.current) {
        if ('emissiveIntensity' in mat) mat.emissiveIntensity = pulse;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group
        ref={contentRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(partId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.classList.add('cursor-pointer');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.classList.remove('cursor-pointer');
        }}
      >
        {children}
      </group>

      {showLabel && (
        <Html
          distanceFactor={isExploded ? 5 : 6}
          position={isExploded ? [0, 0.85, 0] : labelOffset}
          center
          zIndexRange={[20, 0]}
        >
          <div
            className="flex items-center gap-1.5 bg-card/85 backdrop-blur border border-border rounded px-2 py-0.5 text-[11px] font-medium text-foreground whitespace-nowrap shadow-sm pointer-events-none select-none"
            style={isSelected ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` } : undefined}
          >
            {isExploded && <span className="text-primary font-bold">{assemblyOrder}.</span>}
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
