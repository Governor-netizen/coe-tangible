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

const CORE_LEN = 2.05;
const YOKE_R_IN = 1.56;
const YOKE_R_OUT = 1.78;
const POLE_SHOE_R_IN = 1.28;
const POLE_SHOE_R_OUT = 1.46;
const ARM_R = 1.2;
const ARM_SLOTS = 22;
const ARM_SLOT_DEPTH = 0.3;
const COMM_X = -1.72;
const COMM_R = 0.44;
const COMM_LEN = 0.62;
const COMM_SEGMENTS = 22;
const SHAFT_R = 0.17;
const SHAFT_LEN = 6.0;

/** Two main poles — the classic teaching machine for Faraday's law. */
const POLE_ANGLES = [Math.PI / 2, (3 * Math.PI) / 2];
const BRUSH_ANGLES = [0, Math.PI];

export function DCGeneratorModel({
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
  const parts = machineDatabase['dc-generator'].parts;
  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  const armatureCore = useMemo(
    () =>
      slottedCoreGeometry({
        rOuter: ARM_R,
        rInner: 0.19,
        slots: ARM_SLOTS,
        slotDepth: ARM_SLOT_DEPTH,
        slotWidth: 0.14,
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

  useFrame((_, delta) => {
    if (!isAnimating) return;
    const omega = rotorRpm !== null ? rpmToRadPerSec(rotorRpm) : animationSpeed * 3;
    const step = delta * omega;
    if (rotorRef.current) rotorRef.current.rotation.x += step;
    if (commutatorRef.current) commutatorRef.current.rotation.x += step;
    if (shaftRef.current) shaftRef.current.rotation.x += step;
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
      {/* ---- Stator: yoke and two main field poles ---------------------- */}
      <MachinePartMesh {...common('stator')} labelOffset={[-0.4, YOKE_R_OUT + 0.65, 0]}>
        <mesh geometry={yoke} rotation={AXIS.fromZ} castShadow receiveShadow>
          <meshStandardMaterial {...MAT.castIron} />
        </mesh>
        <CoolingFins count={20} radius={YOKE_R_OUT} length={CORE_LEN + 0.3} height={0.11} />

        {POLE_ANGLES.map((a) => (
          <SalientPole
            key={a}
            angle={a}
            rShoeInner={POLE_SHOE_R_IN}
            rShoeOuter={POLE_SHOE_R_OUT}
            rYoke={YOKE_R_IN}
            length={CORE_LEN}
            halfAngle={0.72}
            coilTurns={9}
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
        <TerminalBox radius={YOKE_R_OUT} x={0.15} studs={4} />
      </MachinePartMesh>

      {/* ---- Armature core + its winding -------------------------------- */}
      <MachinePartMesh {...common('rotor')} labelOffset={[0.2, ARM_R + 0.1, 1.5]}>
        <group ref={rotorRef}>
          <mesh geometry={armatureCore} rotation={AXIS.fromZ} castShadow receiveShadow>
            <meshStandardMaterial {...MAT.laminatedSteel} />
          </mesh>
          <LaminationLines radius={ARM_R + 0.004} length={CORE_LEN} count={18} />
          <CageBars
            count={ARM_SLOTS}
            radius={ARM_R - ARM_SLOT_DEPTH / 2}
            length={CORE_LEN + 0.1}
            barRadius={0.05}
          />
          <EndTurns x={CORE_LEN / 2 + 0.1} radius={ARM_R - 0.14} count={ARM_SLOTS} color="#a8481c" span={0.68} depth={0.22} />
          <EndTurns x={-(CORE_LEN / 2 + 0.1)} radius={ARM_R - 0.14} count={ARM_SLOTS} color="#a8481c" span={0.68} depth={0.22} />
        </group>
      </MachinePartMesh>

      {/* ---- Commutator -------------------------------------------------- */}
      <MachinePartMesh {...common('commutator')} labelOffset={[COMM_X - 0.5, -COMM_R - 0.6, 1.1]}>
        <group ref={commutatorRef}>
          <mesh position={[COMM_X, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
            <cylinderGeometry args={[COMM_R - 0.09, COMM_R - 0.09, COMM_LEN + 0.06, 32]} />
            <meshStandardMaterial {...MAT.insulation} />
          </mesh>
          <Instances limit={COMM_SEGMENTS} range={COMM_SEGMENTS} castShadow receiveShadow>
            <boxGeometry args={[COMM_LEN, 0.1, (2 * Math.PI * COMM_R) / COMM_SEGMENTS - 0.014]} />
            <meshStandardMaterial {...MAT.copper} />
            {commSegments.map((s) => (
              <Instance key={s.key} position={s.position} rotation={s.rotation} />
            ))}
          </Instances>
          {[COMM_X - COMM_LEN / 2 - 0.05, COMM_X + COMM_LEN / 2 + 0.05].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={AXIS.fromY} castShadow>
              <cylinderGeometry args={[COMM_R - 0.03, COMM_R - 0.03, 0.09, 32]} />
              <meshStandardMaterial {...MAT.boltSteel} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* ---- Brushes ------------------------------------------------------ */}
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
            <mesh position={[COMM_X, COMM_R + 0.66, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.2, 10]} />
              <meshStandardMaterial {...MAT.boltSteel} />
            </mesh>
            <mesh position={[COMM_X + 0.28, COMM_R + 0.52, 0]} rotation={[0, 0, -0.6]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
              <meshStandardMaterial {...MAT.copperWorn} />
            </mesh>
          </group>
        ))}
        <mesh position={[COMM_X, 0, 0]} rotation={AXIS.fromZ} castShadow>
          <torusGeometry args={[COMM_R + 0.62, 0.05, 8, 48]} />
          <meshStandardMaterial {...MAT.castIronDark} />
        </mesh>
      </MachinePartMesh>

      {/* ---- Shaft, bearings, and the prime-mover drive pulley ----------- */}
      <MachinePartMesh {...common('shaft')} labelOffset={[SHAFT_LEN / 2 - 0.2, 0.95, 0]}>
        <group ref={shaftRef}>
          <mesh rotation={AXIS.fromY} castShadow receiveShadow>
            <cylinderGeometry args={[SHAFT_R, SHAFT_R, SHAFT_LEN, 32]} />
            <meshStandardMaterial {...MAT.shaftSteel} />
          </mesh>

          {/* Belt pulley — the mechanical input from the prime mover. */}
          <mesh position={[SHAFT_LEN / 2 - 0.3, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 0.62, 0.34, 32]} />
            <meshStandardMaterial {...MAT.castIronDark} />
          </mesh>
          <mesh position={[SHAFT_LEN / 2 - 0.3, 0, 0]} rotation={AXIS.fromZ} castShadow>
            <torusGeometry args={[0.6, 0.07, 8, 40]} />
            <meshStandardMaterial {...MAT.castIron} />
          </mesh>

          <Bearing x={CORE_LEN / 2 + 0.4} rInner={SHAFT_R} rOuter={SHAFT_R + 0.19} />
          <Bearing x={-(CORE_LEN / 2 + 0.4)} rInner={SHAFT_R} rOuter={SHAFT_R + 0.19} />
        </group>
      </MachinePartMesh>
    </group>
  );
}
