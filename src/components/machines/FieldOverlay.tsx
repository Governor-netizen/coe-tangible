import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MachineType } from '@/data/machineData';
import { rpmToRadPerSec } from './materials';

/* Overlays never intercept clicks — parts stay selectable through them. */
const NO_RAYCAST = () => null;

const dummy = new THREE.Object3D();

/**
 * Charge/flux carriers travelling along a path. The line itself is drawn as a
 * faint tube; the moving markers are one instanced mesh.
 */
function FlowLine({
  curve,
  color,
  count = 10,
  speed = 0.18,
  markerSize = 0.055,
  tubeRadius = 0.012,
  direction = 1,
  opacity = 0.35,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  color: string;
  count?: number;
  speed?: number;
  markerSize?: number;
  tubeRadius?: number;
  direction?: number;
  opacity?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tube = useMemo(
    () => new THREE.TubeGeometry(curve, 120, tubeRadius, 6, false),
    [curve, tubeRadius],
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t0 = (state.clock.elapsedTime * speed * direction) % 1;
    for (let i = 0; i < count; i++) {
      let t = (t0 + i / count) % 1;
      if (t < 0) t += 1;
      curve.getPointAt(t, dummy.position);
      dummy.scale.setScalar(0.6 + Math.sin(t * Math.PI) * 0.7);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={tube} raycast={NO_RAYCAST}>
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[markerSize, 10, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** An arrow lying in the YZ plane at a given radius, pointing tangentially. */
function RadialMarker({
  angleRef,
  radius,
  color,
  label,
  x = 0,
  length = 0.55,
}: {
  angleRef: React.MutableRefObject<number>;
  radius: number;
  color: string;
  label: string;
  /** Axial position — kept clear of the frame so the arrow is actually visible. */
  x?: number;
  length?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.x = angleRef.current;
  });

  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      <group position={[0, radius, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.035, 0.035, length, 10]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <mesh position={[length / 2 + 0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]} raycast={NO_RAYCAST}>
          <coneGeometry args={[0.1, 0.22, 12]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <Html center distanceFactor={12} position={[0, 0.35, 0]} zIndexRange={[15, 0]}>
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none select-none"
            style={{ background: color, color: '#0b0f14' }}
          >
            {label}
          </div>
        </Html>
      </group>
    </group>
  );
}

/**
 * A closed magnetic circuit for a salient-pole DC machine: out of one pole
 * face, across the airgap, through the armature, out the neighbouring pole,
 * and home through the yoke.
 */
function dcFluxLoop(
  aFrom: number,
  aTo: number,
  rGap: number,
  rArm: number,
  rYoke: number,
  x: number,
) {
  const pts: THREE.Vector3[] = [];
  const at = (r: number, a: number) => new THREE.Vector3(x, Math.cos(a) * r, Math.sin(a) * r);

  pts.push(at(rYoke, aFrom));
  pts.push(at(rGap, aFrom));
  // Sweep through the rotor iron between the two pole centres.
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = aFrom + (aTo - aFrom) * t;
    const r = rGap - Math.sin(t * Math.PI) * (rGap - rArm);
    pts.push(at(r, a));
  }
  pts.push(at(rGap, aTo));
  pts.push(at(rYoke, aTo));
  // Return path around the outside of the yoke.
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const a = aFrom + (aTo - aFrom) * t;
    pts.push(at(rYoke + 0.12, a));
  }

  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.4);
}

function DCFieldOverlay({
  poleAngles,
  rGap,
  rArm,
  rYoke,
  rotorRpm,
  isMotor,
  planeX,
  torqueX,
}: {
  poleAngles: number[];
  rGap: number;
  rArm: number;
  rYoke: number;
  rotorRpm: number;
  isMotor: boolean;
  /** Flux is drawn just clear of the end face so the frame doesn't hide it. */
  planeX: number;
  torqueX: number;
}) {
  const loops = useMemo(
    () =>
      poleAngles.map((a, i) => ({
        key: i,
        curve: dcFluxLoop(a, poleAngles[(i + 1) % poleAngles.length], rGap, rArm, rYoke, planeX),
      })),
    [poleAngles, rGap, rArm, rYoke, planeX],
  );

  const torqueRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (torqueRef.current) torqueRef.current.rotation.x += delta * rpmToRadPerSec(rotorRpm) * 0.35;
  });

  const accent = isMotor ? '#f59e0b' : '#34d399';

  return (
    <group>
      {loops.map((l) => (
        <FlowLine key={l.key} curve={l.curve} color="#22d3ee" count={9} speed={0.12} opacity={0.35} markerSize={0.06} />
      ))}

      <Html center distanceFactor={9} position={[planeX, -rYoke - 0.7, 0]} zIndexRange={[15, 0]}>
        <div className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-cyan-400/40 text-[10px] text-cyan-100 whitespace-nowrap pointer-events-none select-none">
          Main flux Φ: pole → airgap → armature → yoke
        </div>
      </Html>

      {/* Rotation-direction indicator, kept clear of the shaft. */}
      <group ref={torqueRef} position={[torqueX, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]} raycast={NO_RAYCAST}>
          <torusGeometry args={[0.55, 0.022, 8, 36, Math.PI * 1.5]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <coneGeometry args={[0.08, 0.2, 12]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
        <Html center distanceFactor={8} position={[0, 0.78, 0]} zIndexRange={[15, 0]}>
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none select-none"
            style={{ background: accent, color: '#0b0f14' }}
          >
            {isMotor ? 'Torque out' : 'Drive in'}
          </div>
        </Html>
      </group>
    </group>
  );
}

function InductionFieldOverlay({
  fieldRpm,
  rotorRpm,
  rGap,
  planeX,
}: {
  fieldRpm: number;
  rotorRpm: number;
  rGap: number;
  planeX: number;
}) {
  const fieldAngle = useRef(0);
  const rotorAngle = useRef(0);

  useFrame((_, delta) => {
    fieldAngle.current += delta * rpmToRadPerSec(fieldRpm);
    rotorAngle.current += delta * rpmToRadPerSec(rotorRpm);
  });

  const slip = fieldRpm > 0 ? ((fieldRpm - rotorRpm) / fieldRpm) * 100 : 0;

  return (
    <group>
      {/*
       * The two markers are the whole lesson: the stator field runs at
       * synchronous speed, the rotor lags it, and the widening gap between
       * them is slip.
       */}
      <RadialMarker angleRef={fieldAngle} radius={rGap + 0.5} color="#38bdf8" label="Stator field (Ns)" x={planeX} />
      <RadialMarker angleRef={rotorAngle} radius={rGap - 0.35} color="#f59e0b" label="Rotor (Nr)" x={planeX} />

      <Html center distanceFactor={11} position={[planeX, -rGap - 1.4, 0]} zIndexRange={[15, 0]}>
        <div className="px-2 py-1 rounded bg-slate-900/90 border border-sky-400/40 text-[11px] text-sky-100 whitespace-nowrap pointer-events-none select-none">
          Slip = (Ns − Nr) / Ns = <span className="font-bold text-sky-300">{slip.toFixed(1)}%</span>
        </div>
      </Html>
    </group>
  );
}

function TransformerFieldOverlay({ flux, current }: { flux: number; current: number }) {
  /*
   * One closed flux path around the core window. Drawn just in front of the
   * iron (+Z) so it is not buried inside the limbs.
   */
  const z = 0.62;
  const curve = useMemo(() => {
    const xL = -1.5;
    const xR = 1.5;
    const yTop = 1.42;
    const yBot = -1.42;
    const pts = [
      new THREE.Vector3(xL, yBot, z),
      new THREE.Vector3(xL, 0, z),
      new THREE.Vector3(xL, yTop, z),
      new THREE.Vector3(0, yTop, z),
      new THREE.Vector3(xR, yTop, z),
      new THREE.Vector3(xR, 0, z),
      new THREE.Vector3(xR, yBot, z),
      new THREE.Vector3(0, yBot, z),
    ];
    return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.05);
  }, []);

  return (
    <group>
      <FlowLine
        curve={curve}
        color="#22d3ee"
        count={14}
        speed={0.1 + flux * 0.3}
        opacity={0.35}
        markerSize={0.07}
      />
      <Html center distanceFactor={11} position={[0, -2.35, z]} zIndexRange={[15, 0]}>
        <div className="px-2 py-1 rounded bg-slate-900/90 border border-cyan-400/40 text-[11px] text-cyan-100 whitespace-nowrap pointer-events-none select-none">
          Mutual flux Φ links both windings — load current {current.toFixed(1)} A
        </div>
      </Html>
    </group>
  );
}

export interface FieldOverlayProps {
  machineType: MachineType;
  rotorRpm: number;
  fieldRpm: number;
  flux: number;
  current: number;
}

export function FieldOverlay({ machineType, rotorRpm, fieldRpm, flux, current }: FieldOverlayProps) {
  switch (machineType) {
    case 'dc-motor':
      return (
        <DCFieldOverlay
          poleAngles={[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]}
          rGap={1.28}
          rArm={0.5}
          rYoke={1.67}
          rotorRpm={rotorRpm}
          isMotor
          planeX={1.75}
          torqueX={3.0}
        />
      );
    case 'dc-generator':
      return (
        <DCFieldOverlay
          poleAngles={[Math.PI / 2, (3 * Math.PI) / 2]}
          rGap={1.28}
          rArm={0.5}
          rYoke={1.67}
          rotorRpm={rotorRpm}
          isMotor={false}
          planeX={1.75}
          torqueX={3.4}
        />
      );
    case 'induction-motor':
      return <InductionFieldOverlay fieldRpm={fieldRpm} rotorRpm={rotorRpm} rGap={1.3} planeX={2.35} />;
    case 'transformer':
      return <TransformerFieldOverlay flux={flux} current={current} />;
    default:
      return null;
  }
}
