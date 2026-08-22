import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { MachinePartMesh } from '../MachinePartMesh';
import { machineDatabase } from '@/data/machineData';
import { AXIS, MAT, rpmToRadPerSec } from './materials';
import {
  Bearing,
  BoltCircle,
  CageBars,
  CoolingFins,
  EndTurns,
  LaminationLines,
  MountingFeet,
  SalientPole,
  TerminalBox,
} from './primitives';
import { ringGeometry, slottedCoreGeometry } from './geometry';
import { MachineModelProps } from './types';

/* --- Machine geometry constants (metres, shaft along +X) --------------- */
const CORE_LEN = 2.05;
const YOKE_R_IN = 1.56;
const YOKE_R_OUT = 1.78;
const POLE_SHOE_R_IN = 1.28;
const POLE_SHOE_R_OUT = 1.46;
const ARM_R = 1.2;
const ARM_BORE = 0.19;
const ARM_SLOTS = 20;
const ARM_SLOT_DEPTH = 0.3;
const COMM_X = -1.72;
const COMM_R = 0.44;
const COMM_LEN = 0.62;
const COMM_SEGMENTS = 24;
const SHAFT_R = 0.17;
const SHAFT_LEN = 5.6;

/** Four salient poles, with the brushes sitting on the 45° geometric neutral. */
const POLE_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
const BRUSH_ANGLES = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

export function DCMotorModel({
  selectedPart,
  onPartClick,
  isAnimating,
  animationSpeed,
  isExploded,
  showLabels = false,
  explodeSpread = 1,
  hintedPart = null,
  focusMode = false,
  rotorRpm = null,
}: MachineModelProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const commutatorRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Group>(null);
  const windingsRef = useRef<THREE.Group>(null);
  const parts = machineDatabase['dc-motor'].parts;
  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  const armatureCore = useMemo(
    () =>
      slottedCoreGeometry({
        rOuter: ARM_R,
        rInner: ARM_BORE,
        slots: ARM_SLOTS,
        slotDepth: ARM_SLOT_DEPTH,
        slotWidth: 0.15,
        facing: 'out',
        length: CORE_LEN,
      }),
    [],
  );

  const yoke = useMemo(() => ringGeometry(YOKE_R_IN, YOKE_R_OUT, CORE_LEN + 0.85), []);
  const endShield = useMemo(() => ringGeometry(0.4, YOKE_R_OUT, 0.16), []);

  const commSegments = useMemo(
    () =>
      Array.from({ length: COMM_SEGMENTS }, (_, i) => {
        const a = (i / COMM_SEGMENTS) * Math.PI * 2;
        return {
          key: i,
          position: [COMM_X, Math.cos(a) * COMM_R, Math.sin(a) * COMM_R] as [number, number, number],
          rotation: [a, 0, 0] as [number, number, number],
        };
      }),
    [],
  );

  const armatureBars = useMemo(
    () =>
      Array.from({ length: ARM_SLOTS }, (_, i) => {
        const a = (i / ARM_SLOTS) * Math.PI * 2;
        const r = ARM_R - ARM_SLOT_DEPTH / 2;
        return {
          key: i,
          position: [0, Math.cos(a) * r, Math.sin(a) * r] as [number, number, number],
        };
      }),
    [],
  );

  // Spin about the machine axis (+X). Driven by the simulated RPM when the
  // lab is linked, otherwise by the manual speed slider.
  useFrame((_, delta) => {
    if (!isAnimating) return;
    const omega = rotorRpm !== null ? rpmToRadPerSec(rotorRpm) : animationSpeed * 3;
    const step = delta * omega;
    if (rotorRef.current) rotorRef.current.rotation.x += step;
    if (commutatorRef.current) commutatorRef.current.rotation.x += step;
    if (shaftRef.current) shaftRef.current.rotation.x += step;
    if (windingsRef.current) windingsRef.current.rotation.x += step;
  });

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
      {/* ---- Stator: yoke, salient poles, end shields, frame ------------ */}
      <MachinePartMesh {...common('stator')} labelOffset={[-0.4, YOKE_R_OUT + 0.65, 0]}>
        <mesh geometry={yoke} rotation={AXIS.fromZ} castShadow receiveShadow>
          <meshStandardMaterial {...MAT.paintedShell} />
        </mesh>

        <CoolingFins count={24} radius={YOKE_R_OUT} length={CORE_LEN + 0.3} height={0.13} />

        {POLE_ANGLES.map((a) => (
          <SalientPole
            key={a}
            angle={a}
            rShoeInner={POLE_SHOE_R_IN}
            rShoeOuter={POLE_SHOE_R_OUT}
            rYoke={YOKE_R_IN}
            length={CORE_LEN}
            halfAngle={0.55}
          />
        ))}

        {/* Clear of the winding end-turns, which overhang the core. */}
        {[-(CORE_LEN / 2 + 0.52), CORE_LEN / 2 + 0.52].map((x) => (
          <group key={x}>
            <mesh geometry={endShield} position={[x, 0, 0]} rotation={AXIS.fromZ} castShadow receiveShadow>
              <meshStandardMaterial {...MAT.castIron} />
            </mesh>
            <BoltCircle count={6} radius={YOKE_R_OUT - 0.16} x={x + Math.sign(x) * 0.1} />
          </group>
        ))}

        <MountingFeet length={CORE_LEN + 0.6} radius={YOKE_R_OUT} />
        <TerminalBox radius={YOKE_R_OUT} x={0.15} />
      </MachinePartMesh>

      {/* ---- Rotor: laminated armature core ----------------------------- */}
      <MachinePartMesh {...common('rotor')} labelOffset={[0.2, ARM_R + 0.1, 1.5]}>
        <group ref={rotorRef}>
          <mesh geometry={armatureCore} rotation={AXIS.fromZ} castShadow receiveShadow>
            <meshStandardMaterial {...MAT.laminatedSteel} />
          </mesh>
          <LaminationLines radius={ARM_R + 0.004} length={CORE_LEN} count={16} />
        </group>
      </MachinePartMesh>

      {/* ---- Armature windings: slot conductors + end-turn crowns -------- */}
      <MachinePartMesh {...common('windings')} labelOffset={[CORE_LEN / 2 + 0.35, -ARM_R - 0.3, 1.4]}>
        <group ref={windingsRef}>
          <CageBars
            count={ARM_SLOTS}
            radius={ARM_R - ARM_SLOT_DEPTH / 2}
            length={CORE_LEN + 0.12}
            barRadius={0.055}
          />
          <EndTurns x={CORE_LEN / 2 + 0.1} radius={ARM_R - 0.14} count={ARM_SLOTS} color="#a8481c" span={0.72} depth={0.22} />
          <EndTurns x={-(CORE_LEN / 2 + 0.1)} radius={ARM_R - 0.14} count={ARM_SLOTS} color="#a8481c" span={0.72} depth={0.22} />
          {/* Risers carrying each coil down to its commutator segment. */}
          <Instances limit={ARM_SLOTS} range={ARM_SLOTS} castShadow>
            <boxGeometry args={[0.9, 0.03, 0.045]} />
            <meshStandardMaterial {...MAT.copperWorn} />
            {armatureBars.map((b, i) => {
              const a = (i / ARM_SLOTS) * Math.PI * 2;
              const r = (ARM_R - ARM_SLOT_DEPTH / 2 + COMM_R) / 2;
              return (
                <Instance
                  key={b.key}
                  position={[-(CORE_LEN / 2 + 0.62), Math.cos(a) * r, Math.sin(a) * r]}
                  rotation={[a, 0, 0]}
                />
              );
            })}
          </Instances>
        </group>
      </MachinePartMesh>

      {/* ---- Commutator: copper segments separated by mica --------------- */}
      <MachinePartMesh {...common('commutator')} labelOffset={[COMM_X - 0.5, -COMM_R - 0.6, 1.1]}>
        <group ref={commutatorRef}>
          {/* Insulating sleeve the segments are clamped onto. */}
          <mesh position={[COMM_X, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
            <cylinderGeometry args={[COMM_R - 0.09, COMM_R - 0.09, COMM_LEN + 0.06, 32]} />
            <meshStandardMaterial {...MAT.insulation} />
          </mesh>

          <Instances limit={COMM_SEGMENTS} range={COMM_SEGMENTS} castShadow receiveShadow>
            <boxGeometry args={[COMM_LEN, 0.1, (2 * Math.PI * COMM_R) / COMM_SEGMENTS - 0.012]} />
            <meshStandardMaterial {...MAT.copper} />
            {commSegments.map((s) => (
              <Instance key={s.key} position={s.position} rotation={s.rotation} />
            ))}
          </Instances>

          {/* V-rings clamping the stack at each end. */}
          {[COMM_X - COMM_LEN / 2 - 0.05, COMM_X + COMM_LEN / 2 + 0.05].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={AXIS.fromY} castShadow>
              <cylinderGeometry args={[COMM_R - 0.03, COMM_R - 0.03, 0.09, 32]} />
              <meshStandardMaterial {...MAT.boltSteel} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* ---- Brushes: carbon block, holder, spring, pigtail -------------- */}
      <MachinePartMesh {...common('brushes')} labelOffset={[COMM_X - 0.6, COMM_R + 1.25, -0.9]}>
        {BRUSH_ANGLES.map((a) => (
          <group key={a} rotation={[a, 0, 0]}>
            <mesh position={[COMM_X, COMM_R + 0.19, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.34, 0.36, 0.26]} />
              <meshStandardMaterial {...MAT.carbon} />
            </mesh>
            <mesh position={[COMM_X, COMM_R + 0.46, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.42, 0.24, 0.34]} />
              <meshStandardMaterial {...MAT.brass} />
            </mesh>
            {/* Constant-pressure spring. */}
            <mesh position={[COMM_X, COMM_R + 0.66, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.2, 10]} />
              <meshStandardMaterial {...MAT.boltSteel} />
            </mesh>
            {/* Flexible pigtail lead back to the terminal. */}
            <mesh position={[COMM_X + 0.28, COMM_R + 0.52, 0]} rotation={[0, 0, -0.6]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
              <meshStandardMaterial {...MAT.copperWorn} />
            </mesh>
          </group>
        ))}
        {/* Brush rocker ring the holders are mounted on. */}
        <mesh position={[COMM_X, 0, 0]} rotation={AXIS.fromZ} castShadow>
          <torusGeometry args={[COMM_R + 0.62, 0.05, 8, 48]} />
          <meshStandardMaterial {...MAT.castIronDark} />
        </mesh>
      </MachinePartMesh>

      {/* ---- Shaft: stepped journal, keyway, bearings -------------------- */}
      <MachinePartMesh {...common('shaft')} labelOffset={[SHAFT_LEN / 2 - 0.2, 0.75, 0]}>
        <group ref={shaftRef}>
          <mesh rotation={AXIS.fromY} castShadow receiveShadow>
            <cylinderGeometry args={[SHAFT_R, SHAFT_R, SHAFT_LEN, 32]} />
            <meshStandardMaterial {...MAT.shaftSteel} />
          </mesh>
          {/* Reduced drive-end journal + key. */}
          <mesh position={[SHAFT_LEN / 2 - 0.45, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
            <cylinderGeometry args={[SHAFT_R * 0.82, SHAFT_R * 0.82, 0.9, 32]} />
            <meshStandardMaterial {...MAT.shaftSteel} />
          </mesh>
          <mesh position={[SHAFT_LEN / 2 - 0.55, SHAFT_R * 0.82, 0]} castShadow>
            <boxGeometry args={[0.5, 0.05, 0.09]} />
            <meshStandardMaterial {...MAT.boltSteel} />
          </mesh>
          <Bearing x={CORE_LEN / 2 + 0.4} rInner={SHAFT_R} rOuter={SHAFT_R + 0.19} />
          <Bearing x={-(CORE_LEN / 2 + 0.4)} rInner={SHAFT_R} rOuter={SHAFT_R + 0.19} />
        </group>
      </MachinePartMesh>
    </group>
  );
}
