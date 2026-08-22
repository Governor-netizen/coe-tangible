import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { AXIS, LAMINATION_LINE, MAT } from './materials';
import { CoilOptions, arcSectorGeometry, coilGeometry } from './geometry';

/* ------------------------------------------------------------------ *
 * Reusable part components
 * ------------------------------------------------------------------ */

export function Coil({
  radius,
  turns,
  length,
  wireRadius = 0.045,
  axis = 'x',
  phase = 0,
  material = MAT.magnetWire,
  position,
}: CoilOptions & {
  material?: THREE.MeshStandardMaterialParameters;
  position?: [number, number, number];
}) {
  const geometry = useMemo(
    () => coilGeometry({ radius, turns, length, wireRadius, axis, phase }),
    [radius, turns, length, wireRadius, axis, phase],
  );
  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshStandardMaterial {...material} />
    </mesh>
  );
}

/** Thin dark grooves on a core OD that sell the "stack of laminations" read. */
export function LaminationLines({
  radius,
  length,
  count = 14,
  thickness = 0.006,
}: {
  radius: number;
  length: number;
  count?: number;
  thickness?: number;
}) {
  const xs = useMemo(
    () => Array.from({ length: count }, (_, i) => -length / 2 + (length * (i + 0.5)) / count),
    [count, length],
  );
  return (
    <Instances limit={count} range={count}>
      <torusGeometry args={[radius, thickness, 6, 48]} />
      <meshStandardMaterial {...LAMINATION_LINE} />
      {xs.map((x) => (
        <Instance key={x} position={[x, 0, 0]} rotation={AXIS.fromZ} />
      ))}
    </Instances>
  );
}

/** Radial cooling fins around a housing. */
export function CoolingFins({
  count = 20,
  radius,
  length,
  height = 0.16,
  thickness = 0.035,
}: {
  count?: number;
  radius: number;
  length: number;
  height?: number;
  thickness?: number;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return {
          key: i,
          position: [0, Math.cos(a) * (radius + height / 2), Math.sin(a) * (radius + height / 2)] as [
            number,
            number,
            number,
          ],
          rotation: [a, 0, 0] as [number, number, number],
        };
      }),
    [count, radius, height],
  );
  return (
    <Instances limit={count} range={count} castShadow receiveShadow>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial {...MAT.castIronDark} />
      {items.map((it) => (
        <Instance key={it.key} position={it.position} rotation={it.rotation} />
      ))}
    </Instances>
  );
}

/** Hex-head bolts on a bolt circle. */
export function BoltCircle({
  count = 4,
  radius,
  x,
  headRadius = 0.07,
  headLength = 0.09,
}: {
  count?: number;
  radius: number;
  x: number;
  headRadius?: number;
  headLength?: number;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.PI / count;
        return {
          key: i,
          position: [x, Math.cos(a) * radius, Math.sin(a) * radius] as [number, number, number],
        };
      }),
    [count, radius, x],
  );
  return (
    <Instances limit={count} range={count} castShadow>
      <cylinderGeometry args={[headRadius, headRadius, headLength, 6]} />
      <meshStandardMaterial {...MAT.boltSteel} />
      {items.map((it) => (
        <Instance key={it.key} position={it.position} rotation={AXIS.fromY} />
      ))}
    </Instances>
  );
}

/** A rolling-element bearing: races plus balls. */
export function Bearing({
  x,
  rInner,
  rOuter,
  width = 0.22,
  balls = 9,
}: {
  x: number;
  rInner: number;
  rOuter: number;
  width?: number;
  balls?: number;
}) {
  const rMid = (rInner + rOuter) / 2;
  const ballR = Math.max(0.02, (rOuter - rInner) * 0.28);
  const items = useMemo(
    () =>
      Array.from({ length: balls }, (_, i) => {
        const a = (i / balls) * Math.PI * 2;
        return {
          key: i,
          position: [x, Math.cos(a) * rMid, Math.sin(a) * rMid] as [number, number, number],
        };
      }),
    [balls, rMid, x],
  );
  return (
    <group>
      <mesh position={[x, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
        <cylinderGeometry args={[rOuter, rOuter, width, 32, 1, true]} />
        <meshStandardMaterial {...MAT.shaftSteel} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[x, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
        <cylinderGeometry args={[rInner, rInner, width, 32, 1, true]} />
        <meshStandardMaterial {...MAT.shaftSteel} side={THREE.DoubleSide} />
      </mesh>
      <Instances limit={balls} range={balls} castShadow>
        <sphereGeometry args={[ballR, 12, 10]} />
        <meshStandardMaterial {...MAT.shaftSteel} />
        {items.map((it) => (
          <Instance key={it.key} position={it.position} />
        ))}
      </Instances>
    </group>
  );
}

/** Pitched, tapered cooling-fan blades on a hub. */
export function FanBlades({
  x,
  hubRadius = 0.32,
  bladeLength = 0.62,
  count = 9,
  pitch = 0.55,
}: {
  x: number;
  hubRadius?: number;
  bladeLength?: number;
  count?: number;
  pitch?: number;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const r = hubRadius + bladeLength / 2;
        return {
          key: i,
          position: [x, Math.cos(a) * r, Math.sin(a) * r] as [number, number, number],
          rotation: [a, 0, pitch] as [number, number, number],
        };
      }),
    [count, hubRadius, bladeLength, pitch, x],
  );
  return (
    <group>
      <mesh position={[x, 0, 0]} rotation={AXIS.fromY} castShadow receiveShadow>
        <cylinderGeometry args={[hubRadius, hubRadius, 0.3, 24]} />
        <meshStandardMaterial {...MAT.aluminium} />
      </mesh>
      <Instances limit={count} range={count} castShadow>
        <boxGeometry args={[0.22, bladeLength, 0.045]} />
        <meshStandardMaterial {...MAT.aluminium} />
        {items.map((it) => (
          <Instance key={it.key} position={it.position} rotation={it.rotation} />
        ))}
      </Instances>
    </group>
  );
}

/** Squirrel-cage bars sitting in the rotor slots. */
export function CageBars({
  count,
  radius,
  length,
  barRadius = 0.05,
}: {
  count: number;
  radius: number;
  length: number;
  barRadius?: number;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return {
          key: i,
          position: [0, Math.cos(a) * radius, Math.sin(a) * radius] as [number, number, number],
        };
      }),
    [count, radius],
  );
  return (
    <Instances limit={count} range={count} castShadow receiveShadow>
      <cylinderGeometry args={[barRadius, barRadius, length, 10]} />
      <meshStandardMaterial {...MAT.aluminium} />
      {items.map((it) => (
        <Instance key={it.key} position={it.position} rotation={AXIS.fromY} />
      ))}
    </Instances>
  );
}

/**
 * A salient field pole: curved shoe on the airgap, a radial core, and a
 * field coil wound around that core. Placed by rotating the whole assembly
 * about the machine axis.
 */
export function SalientPole({
  angle,
  rShoeInner,
  rShoeOuter,
  rYoke,
  length,
  halfAngle = 0.52,
  coreWidth = 0.52,
  coilTurns = 7,
}: {
  angle: number;
  rShoeInner: number;
  rShoeOuter: number;
  rYoke: number;
  length: number;
  halfAngle?: number;
  coreWidth?: number;
  coilTurns?: number;
}) {
  const shoe = useMemo(
    () => arcSectorGeometry(rShoeInner, rShoeOuter, halfAngle, length),
    [rShoeInner, rShoeOuter, halfAngle, length],
  );
  const coreLen = rYoke - rShoeOuter;
  const coreMid = rShoeOuter + coreLen / 2;

  return (
    <group rotation={[angle, 0, 0]}>
      <mesh geometry={shoe} rotation={AXIS.fromZ} castShadow receiveShadow>
        <meshStandardMaterial {...MAT.laminatedSteel} />
      </mesh>
      <mesh position={[0, coreMid, 0]} castShadow receiveShadow>
        <boxGeometry args={[length * 0.82, Math.max(coreLen, 0.05), coreWidth]} />
        <meshStandardMaterial {...MAT.laminatedSteel} />
      </mesh>
      <Coil
        radius={coreWidth * 0.72}
        turns={coilTurns}
        length={Math.max(coreLen * 0.78, 0.12)}
        wireRadius={0.05}
        axis="y"
        position={[0, coreMid, 0]}
      />
    </group>
  );
}

/**
 * Overhanging end-turns of a distributed winding — the copper "crown" you
 * actually see at each end of a wound stator.
 */
export function EndTurns({
  x,
  radius,
  count,
  color,
  span = 0.55,
  depth = 0.34,
  wireRadius = 0.035,
  phaseOffset = 0,
}: {
  x: number;
  radius: number;
  count: number;
  color: string;
  span?: number;
  depth?: number;
  wireRadius?: number;
  phaseOffset?: number;
}) {
  const geometry = useMemo(() => {
    const merged: THREE.BufferGeometry[] = [];
    for (let i = 0; i < count; i++) {
      const a0 = phaseOffset + (i / count) * Math.PI * 2;
      const a1 = a0 + span;
      const pts: THREE.Vector3[] = [];
      const segs = 12;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const a = a0 + (a1 - a0) * t;
        // Bulge out along the machine axis, peaking mid-span.
        const bulge = Math.sin(t * Math.PI) * depth;
        pts.push(new THREE.Vector3(x + Math.sign(x || 1) * bulge, Math.cos(a) * radius, Math.sin(a) * radius));
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
      merged.push(new THREE.TubeGeometry(curve, segs * 2, wireRadius, 6, false));
    }
    // Merge manually to keep this to a single draw call without pulling in
    // BufferGeometryUtils (which is not otherwise used in this project).
    return mergeGeometries(merged);
  }, [x, radius, count, span, depth, wireRadius, phaseOffset]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
    </mesh>
  );
}

/**
 * Minimal non-indexed geometry merge. All inputs here come from TubeGeometry
 * with identical attribute sets, so a straight concatenation is sufficient.
 */
function mergeGeometries(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry();
  if (list.length === 0) return out;

  const nonIndexed = list.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    return n;
  });

  for (const name of ['position', 'normal', 'uv'] as const) {
    const arrays = nonIndexed
      .map((g) => g.getAttribute(name) as THREE.BufferAttribute | undefined)
      .filter(Boolean) as THREE.BufferAttribute[];
    if (arrays.length !== nonIndexed.length) continue;

    const itemSize = arrays[0].itemSize;
    const total = arrays.reduce((sum, a) => sum + a.array.length, 0);
    const merged = new Float32Array(total);
    let offset = 0;
    for (const a of arrays) {
      merged.set(a.array as Float32Array, offset);
      offset += a.array.length;
    }
    out.setAttribute(name, new THREE.BufferAttribute(merged, itemSize));
  }

  nonIndexed.forEach((g) => g.dispose());
  out.computeBoundingSphere();
  return out;
}

/** A mounting foot / base rail. */
export function MountingFeet({
  length,
  radius,
  width = 0.55,
}: {
  length: number;
  radius: number;
  width?: number;
}) {
  return (
    <group>
      {[-length / 2 + width / 2 + 0.05, length / 2 - width / 2 - 0.05].map((x) => (
        <mesh key={x} position={[x, -radius - 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.14, radius * 1.7]} />
          <meshStandardMaterial {...MAT.castIron} />
        </mesh>
      ))}
      <mesh position={[0, -radius - 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[length * 0.9, 0.1, radius * 0.7]} />
        <meshStandardMaterial {...MAT.castIronDark} />
      </mesh>
    </group>
  );
}

/** Terminal box with gland and connection studs. */
export function TerminalBox({
  x = 0,
  radius,
  width = 0.95,
  height = 0.55,
  depth = 0.7,
  studs = 6,
}: {
  x?: number;
  radius: number;
  width?: number;
  height?: number;
  depth?: number;
  studs?: number;
}) {
  const y = radius + height / 2 - 0.02;
  const items = useMemo(
    () =>
      Array.from({ length: studs }, (_, i) => ({
        key: i,
        position: [
          x - width / 4 + ((i % 3) * width) / 4,
          y + height / 2 - 0.02,
          (i < 3 ? -1 : 1) * depth * 0.18,
        ] as [number, number, number],
      })),
    [studs, x, y, width, height, depth],
  );
  return (
    <group>
      <mesh position={[x, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial {...MAT.castIron} />
      </mesh>
      <mesh position={[x, y + height / 2 + 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.06, 0.06, depth * 1.06]} />
        <meshStandardMaterial {...MAT.castIronDark} />
      </mesh>
      <mesh position={[x - width / 2 - 0.08, y, 0]} rotation={AXIS.fromY} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.18, 12]} />
        <meshStandardMaterial {...MAT.bakelite} />
      </mesh>
      <Instances limit={studs} range={studs} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.1, 8]} />
        <meshStandardMaterial {...MAT.brass} />
        {items.map((it) => (
          <Instance key={it.key} position={it.position} />
        ))}
      </Instances>
    </group>
  );
}
