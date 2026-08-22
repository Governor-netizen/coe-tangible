import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { MachinePartMesh } from '../MachinePartMesh';
import { machineDatabase } from '@/data/machineData';
import { MAT } from './materials';
import { Coil } from './primitives';
import { MachineModelProps } from './types';

/*
 * Two-limb core-type transformer, limbs vertical (Y), single window in XY.
 * This is the arrangement the operating description assumes: one flux path,
 * primary on one limb, secondary on the other.
 */
const LIMB_X = [-1.5, 1.5];
const LIMB_W = 0.5;
const LIMB_D = 0.85;
const WINDOW_H = 2.5;
const YOKE_H = 0.5;
const CORE_H = WINDOW_H + YOKE_H;
const COIL_H = 1.9;
const LV_R = 0.52;
const HV_R = 0.78;

export function TransformerModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
  explodeSpread = 1,
  hintedPart = null,
  focusMode = false,
}: MachineModelProps) {
  const primaryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const parts = machineDatabase['transformer'].parts;
  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  /**
   * Nothing rotates in a transformer, so the "animation" is the excitation
   * itself: primary and secondary MMFs breathe in antiphase, which is exactly
   * the relationship students are meant to take away.
   */
  useFrame((_, delta) => {
    if (!isAnimating) return;
    phase.current += delta * animationSpeed * 3;
    const p = 1 + Math.sin(phase.current) * 0.025;
    const s = 1 + Math.sin(phase.current + Math.PI) * 0.025;
    primaryRef.current?.scale.set(1, p, p);
    secondaryRef.current?.scale.set(1, s, s);
  });

  const laminationLines = useMemo(() => {
    const items: { key: string; position: [number, number, number] }[] = [];
    LIMB_X.forEach((x, li) => {
      for (let i = 0; i < 7; i++) {
        items.push({
          key: `${li}-${i}`,
          position: [x - LIMB_W / 2 + (LIMB_W * (i + 0.5)) / 7, 0, LIMB_D / 2 + 0.005],
        });
      }
    });
    return items;
  }, []);

  const dim = (id: string) => focusMode && selectedPart !== null && selectedPart !== id;
  const common = (id: string) => ({
    partId: id,
    name: getPart(id).name,
    color: getPart(id).color,
    isSelected: selectedPart === id,
    isExploded,
    explodeOffset: getPart(id).explodeOffset,
    assemblyOrder: getPart(id).assemblyOrder,
    onClick: onPartClick,
    showLabel: showLabels,
    explodeSpread,
    isHinted: hintedPart === id,
    isDimmed: dim(id),
  });

  return (
    <group>
      {/* ---- Core: three limbs clamped between two yokes ----------------- */}
      <MachinePartMesh {...common('core')} labelOffset={[0, CORE_H / 2 + 0.35, 0]}>
        {LIMB_X.map((x) => (
          <mesh key={x} position={[x, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[LIMB_W, WINDOW_H, LIMB_D]} />
            <meshStandardMaterial {...MAT.laminatedSteel} />
          </mesh>
        ))}
        {[WINDOW_H / 2 + YOKE_H / 2, -(WINDOW_H / 2 + YOKE_H / 2)].map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[LIMB_X[1] - LIMB_X[0] + LIMB_W, YOKE_H, LIMB_D]} />
            <meshStandardMaterial {...MAT.laminatedSteel} />
          </mesh>
        ))}

        {/* Lamination edges visible on the face of every limb. */}
        <Instances limit={laminationLines.length} range={laminationLines.length}>
          <boxGeometry args={[0.012, WINDOW_H, 0.012]} />
          <meshStandardMaterial color="#2c3340" metalness={0.6} roughness={0.55} />
          {laminationLines.map((l) => (
            <Instance key={l.key} position={l.position} />
          ))}
        </Instances>

        {/* Clamping frames and tie rods. */}
        {[LIMB_D / 2 + 0.06, -(LIMB_D / 2 + 0.06)].map((z) => (
          <mesh key={z} position={[0, WINDOW_H / 2 + YOKE_H / 2, z]} castShadow>
            <boxGeometry args={[LIMB_X[1] - LIMB_X[0] + LIMB_W + 0.2, 0.16, 0.08]} />
            <meshStandardMaterial {...MAT.castIronDark} />
          </mesh>
        ))}

        {/* HV bushings on top, one per phase limb. */}
        {LIMB_X.map((x) => (
          <group key={`b-${x}`}>
            <mesh position={[x, CORE_H / 2 + 0.42, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.09, 0.11, 0.85, 16]} />
              <meshStandardMaterial {...MAT.porcelain} />
            </mesh>
            <Instances limit={4} range={4} castShadow>
              <torusGeometry args={[0.16, 0.035, 8, 20]} />
              <meshStandardMaterial {...MAT.porcelain} />
              {[0, 1, 2, 3].map((i) => (
                <Instance
                  key={i}
                  position={[x, CORE_H / 2 + 0.15 + i * 0.2, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={1 - i * 0.12}
                />
              ))}
            </Instances>
            <mesh position={[x, CORE_H / 2 + 0.9, 0]} castShadow>
              <sphereGeometry args={[0.08, 12, 10]} />
              <meshStandardMaterial {...MAT.brass} />
            </mesh>
          </group>
        ))}
      </MachinePartMesh>

      {/* ---- Primary (HV, outer) — wound on the left and centre limbs ---- */}
      <MachinePartMesh {...common('primaryWinding')} labelOffset={[-1.5, -COIL_H / 2 - 0.45, 1.1]}>
        <group ref={primaryRef}>
          <Coil
            radius={HV_R}
            turns={16}
            length={COIL_H}
            wireRadius={0.055}
            axis="y"
            position={[LIMB_X[0], 0, 0]}
            material={MAT.magnetWire}
          />
          {/* Lead-out to the bushing. */}
          <mesh position={[LIMB_X[0] - HV_R, COIL_H / 2 + 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.8, 8]} />
            <meshStandardMaterial {...MAT.copperWorn} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* ---- Secondary (LV, inner) --------------------------------------- */}
      <MachinePartMesh {...common('secondaryWinding')} labelOffset={[1.5, -COIL_H / 2 - 0.45, 1.1]}>
        <group ref={secondaryRef}>
          <Coil
            radius={LV_R}
            turns={10}
            length={COIL_H * 0.92}
            wireRadius={0.07}
            axis="y"
            position={[LIMB_X[1], 0, 0]}
            material={MAT.copper}
          />
          <mesh position={[LIMB_X[1] + LV_R, COIL_H / 2 + 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.8, 8]} />
            <meshStandardMaterial {...MAT.copper} />
          </mesh>
        </group>
      </MachinePartMesh>

      {/* ---- Insulation cylinders between core, LV and HV ---------------- */}
      <MachinePartMesh {...common('insulation')} labelOffset={[0, 0, 1.6]}>
        {[LIMB_X[0], LIMB_X[1]].map((x) => (
          <group key={x}>
            <mesh position={[x, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[LV_R - 0.12, LV_R - 0.12, COIL_H + 0.2, 32, 1, true]} />
              <meshStandardMaterial {...MAT.insulation} transparent opacity={0.45} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[x, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[HV_R - 0.12, HV_R - 0.12, COIL_H + 0.1, 32, 1, true]} />
              <meshStandardMaterial {...MAT.insulation} transparent opacity={0.32} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {/* Pressboard end blocks. */}
        {[COIL_H / 2 + 0.12, -(COIL_H / 2 + 0.12)].map((y) =>
          [LIMB_X[0], LIMB_X[1]].map((x) => (
            <mesh key={`${x}-${y}`} position={[x, y, 0]} castShadow>
              <cylinderGeometry args={[HV_R - 0.02, HV_R - 0.02, 0.07, 32]} />
              <meshStandardMaterial {...MAT.insulation} />
            </mesh>
          )),
        )}
      </MachinePartMesh>

      {/* ---- Base frame (not an interactive part) ------------------------ */}
      <group>
        <mesh position={[0, -CORE_H / 2 - 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.2, 1.5]} />
          <meshStandardMaterial {...MAT.castIronDark} />
        </mesh>
        {[-1.9, 1.9].map((x) => (
          <mesh key={x} position={[x, -CORE_H / 2 - 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.22, 1.5]} />
            <meshStandardMaterial {...MAT.castIron} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
