import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
  FanBlades,
  LaminationLines,
  MountingFeet,
  TerminalBox,
} from './primitives';
import { ringGeometry, slottedCoreGeometry } from './geometry';
import { MachineModelProps } from './types';

const CORE_LEN = 2.4;
const FRAME_R_OUT = 1.9;
const STATOR_R_OUT = 1.62;
const STATOR_BORE = 1.06;
const STATOR_SLOTS = 24;
const ROTOR_R = 1.03;
const ROTOR_SLOTS = 20;
const ROTOR_SLOT_DEPTH = 0.16;
const SHAFT_R = 0.19;
const SHAFT_LEN = 6.4;
const END_SHIELD_X = CORE_LEN / 2 + 0.42;

/** Phase belts sit 120 electrical degrees apart around the bore. */
const PHASES = [
  { id: 'phaseR', color: '#dc2626', offset: 0 },
  { id: 'phaseY', color: '#d97706', offset: (Math.PI * 2) / 3 },
  { id: 'phaseB', color: '#2563eb', offset: (Math.PI * 4) / 3 },
] as const;

export function InductionMotorModel({
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
  const shaftRef = useRef<THREE.Group>(null);
  const fanRef = useRef<THREE.Group>(null);
  const parts = machineDatabase['induction-motor'].parts;
  const getPart = (id: string) => parts.find((p) => p.id === id)!;

  const statorCore = useMemo(
    () =>
      slottedCoreGeometry({
        rOuter: STATOR_R_OUT,
        rInner: STATOR_BORE,
        slots: STATOR_SLOTS,
        slotDepth: 0.3,
        slotWidth: 0.16,
        facing: 'in',
        length: CORE_LEN,
      }),
    [],
  );

  const rotorCore = useMemo(
    () =>
      slottedCoreGeometry({
        rOuter: ROTOR_R,
        rInner: SHAFT_R + 0.01,
        slots: ROTOR_SLOTS,
        slotDepth: ROTOR_SLOT_DEPTH,
        slotWidth: 0.11,
        facing: 'out',
        length: CORE_LEN,
      }),
    [],
  );

  const frame = useMemo(() => ringGeometry(STATOR_R_OUT, FRAME_R_OUT, CORE_LEN + 0.5), []);
  const endShield = useMemo(() => ringGeometry(SHAFT_R + 0.24, FRAME_R_OUT, 0.18), []);

  useFrame((_, delta) => {
    if (!isAnimating) return;
    const omega = rotorRpm !== null ? rpmToRadPerSec(rotorRpm) : animationSpeed * 3;
    const step = delta * omega;
    if (rotorRef.current) rotorRef.current.rotation.x += step;
    if (shaftRef.current) shaftRef.current.rotation.x += step;
    if (fanRef.current) fanRef.current.rotation.x += step;
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
      {/* ---- 1. Frame: finned cast housing with feet -------------------- */}
      <MachinePartMesh {...common('housing')} labelOffset={[-1.3, FRAME_R_OUT + 0.45, 0]}>
        <mesh geometry={frame} rotation={AXIS.fromZ} castShadow receiveShadow>
          <meshStandardMaterial {...MAT.paintedShell} />
        </mesh>
        <CoolingFins count={28} radius={FRAME_R_OUT} length={CORE_LEN + 0.4} height={0.19} thickness={0.04} />
        <MountingFeet length={CORE_LEN + 0.9} radius={FRAME_R_OUT} width={0.6} />
        {/* Lifting eye. */}
        <mesh position={[0, FRAME_R_OUT + 0.32, 0]} rotation={AXIS.fromZ} castShadow>
          <torusGeometry args={[0.16, 0.045, 8, 20]} />
          <meshStandardMaterial {...MAT.boltSteel} />
        </mesh>
      </MachinePartMesh>

      {/* ---- 2. Stator core: 24-slot laminated stack -------------------- */}
      <MachinePartMesh {...common('statorCore')} labelOffset={[0.7, STATOR_R_OUT + 0.05, 1.6]}>
        <mesh geometry={statorCore} rotation={AXIS.fromZ} castShadow receiveShadow>
          <meshStandardMaterial {...MAT.laminatedSteel} />
        </mesh>
        <LaminationLines radius={STATOR_R_OUT + 0.004} length={CORE_LEN} count={20} />
      </MachinePartMesh>

      {/* ---- 3-5. Three phase belts: slot conductors + end-turn crowns --- */}
      {PHASES.map((phase, pi) => (
        <MachinePartMesh
          key={phase.id}
          {...common(phase.id)}
          labelOffset={[
            -(CORE_LEN / 2 + 0.95),
            (STATOR_BORE + 0.7) * Math.cos(phase.offset),
            (STATOR_BORE + 0.7) * Math.sin(phase.offset),
          ]}
        >
          {/* Conductors sitting in every third slot. */}
          <group>
            {Array.from({ length: STATOR_SLOTS / 3 }, (_, i) => {
              const a = phase.offset / 3 + ((i * 3) / STATOR_SLOTS) * Math.PI * 2;
              const r = STATOR_BORE + 0.16;
              return (
                <mesh
                  key={i}
                  position={[0, Math.cos(a) * r, Math.sin(a) * r]}
                  rotation={AXIS.fromY}
                  castShadow
                  receiveShadow
                >
                  <cylinderGeometry args={[0.06, 0.06, CORE_LEN + 0.05, 8]} />
                  <meshStandardMaterial color={phase.color} metalness={0.5} roughness={0.4} />
                </mesh>
              );
            })}
          </group>
          <EndTurns
            x={CORE_LEN / 2 + 0.14}
            radius={STATOR_BORE + 0.16}
            count={STATOR_SLOTS / 3}
            color={phase.color}
            span={0.9}
            depth={0.24 + pi * 0.06}
            phaseOffset={phase.offset / 3}
          />
          <EndTurns
            x={-(CORE_LEN / 2 + 0.14)}
            radius={STATOR_BORE + 0.16}
            count={STATOR_SLOTS / 3}
            color={phase.color}
            span={0.9}
            depth={0.24 + pi * 0.06}
            phaseOffset={phase.offset / 3}
          />
        </MachinePartMesh>
      ))}

      {/* ---- 6. Squirrel-cage rotor: skewed bars + end rings ------------- */}
      <MachinePartMesh {...common('rotor')} labelOffset={[-0.6, -ROTOR_R - 0.7, 1.5]}>
        <group ref={rotorRef}>
          <mesh geometry={rotorCore} rotation={AXIS.fromZ} castShadow receiveShadow>
            <meshStandardMaterial {...MAT.laminatedSteel} />
          </mesh>
          <LaminationLines radius={ROTOR_R + 0.003} length={CORE_LEN} count={16} thickness={0.005} />
          <CageBars
            count={ROTOR_SLOTS}
            radius={ROTOR_R - ROTOR_SLOT_DEPTH / 2}
            length={CORE_LEN + 0.28}
            barRadius={0.052}
          />
          {/* Short-circuiting end rings — what makes the cage a closed circuit. */}
          {[-(CORE_LEN / 2 + 0.17), CORE_LEN / 2 + 0.17].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
              <cylinderGeometry args={[ROTOR_R - 0.02, ROTOR_R - 0.02, 0.16, 40]} />
              <meshStandardMaterial {...MAT.aluminium} />
            </mesh>
          ))}
        </group>
      </MachinePartMesh>

      {/* ---- 7. Shaft ---------------------------------------------------- */}
      <MachinePartMesh {...common('shaft')} labelOffset={[SHAFT_LEN / 2 - 0.25, 0.72, 0]}>
        <group ref={shaftRef}>
          <mesh rotation={AXIS.fromY} castShadow receiveShadow>
            <cylinderGeometry args={[SHAFT_R, SHAFT_R, SHAFT_LEN, 32]} />
            <meshStandardMaterial {...MAT.shaftSteel} />
          </mesh>
          {/* Drive-end extension with keyway. */}
          <mesh position={[SHAFT_LEN / 2 - 0.5, SHAFT_R, 0]} castShadow>
            <boxGeometry args={[0.8, 0.06, 0.1]} />
            <meshStandardMaterial {...MAT.boltSteel} />
          </mesh>
          <Bearing x={END_SHIELD_X} rInner={SHAFT_R} rOuter={SHAFT_R + 0.2} />
          <Bearing x={-END_SHIELD_X} rInner={SHAFT_R} rOuter={SHAFT_R + 0.2} />
        </group>
      </MachinePartMesh>

      {/* ---- 8. End shields ---------------------------------------------- */}
      <MachinePartMesh {...common('endShield')} labelOffset={[END_SHIELD_X + 0.35, -FRAME_R_OUT - 0.45, 0]}>
        {[END_SHIELD_X, -END_SHIELD_X].map((x) => (
          <group key={x}>
            <mesh geometry={endShield} position={[x, 0, 0]} rotation={AXIS.fromZ} castShadow receiveShadow>
              <meshStandardMaterial {...MAT.castIron} />
            </mesh>
            {/* Bearing boss. */}
            <mesh position={[x + Math.sign(x) * 0.14, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
              <cylinderGeometry args={[SHAFT_R + 0.32, SHAFT_R + 0.32, 0.3, 24]} />
              <meshStandardMaterial {...MAT.castIron} />
            </mesh>
            <BoltCircle count={4} radius={FRAME_R_OUT - 0.22} x={x + Math.sign(x) * 0.12} />
          </group>
        ))}
      </MachinePartMesh>

      {/* ---- 9. Cooling fan under its cowl ------------------------------- */}
      <MachinePartMesh {...common('coolingFan')} labelOffset={[-(END_SHIELD_X + 1.35), 1.55, 0]}>
        <group ref={fanRef}>
          <FanBlades x={-(END_SHIELD_X + 0.45)} hubRadius={0.36} bladeLength={0.86} count={11} />
        </group>
        {/* The cowl is stationary — it stays outside the rotating group. */}
        <mesh position={[-(END_SHIELD_X + 0.5), 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
          <cylinderGeometry args={[1.42, 1.42, 0.66, 40, 1, true]} />
          <meshStandardMaterial {...MAT.castIronDark} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-(END_SHIELD_X + 0.85), 0, 0]} rotation={AXIS.fromY} castShadow>
          <cylinderGeometry args={[1.42, 1.1, 0.12, 40, 1, true]} />
          <meshStandardMaterial {...MAT.castIronDark} side={THREE.DoubleSide} />
        </mesh>
      </MachinePartMesh>

      {/* ---- 10. Terminal box -------------------------------------------- */}
      <MachinePartMesh {...common('terminalBox')} labelOffset={[1.15, FRAME_R_OUT + 1.05, 0]}>
        <TerminalBox radius={FRAME_R_OUT} width={1.15} height={0.62} depth={0.85} studs={6} />
      </MachinePartMesh>
    </group>
  );
}
