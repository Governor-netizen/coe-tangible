import * as THREE from 'three';


/* ------------------------------------------------------------------ *
 * Geometry builders
 *
 * Everything here is built as a 2D cross-section in the XY plane and
 * extruded along +Z, then rotated onto the machine axis (+X) at use site
 * via AXIS.fromZ. Building real slot profiles rather than stacking boxes
 * around a cylinder is what makes the cores read as laminated iron.
 * ------------------------------------------------------------------ */

function polar(r: number, a: number): THREE.Vector2 {
  return new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
}

/**
 * A closed circular path of `slots` evenly spaced teeth/notches.
 *
 * `dir = +1` cuts the slots radially outward from `rBase` (a stator bore,
 * slots opening inward toward the airgap). `dir = -1` cuts them inward from
 * `rBase` (a rotor OD, slots opening outward). Slot walls stay parallel by
 * narrowing the angular half-width as the radius grows.
 */
function slottedProfile(
  rBase: number,
  slots: number,
  slotDepth: number,
  slotWidth: number,
  dir: 1 | -1,
  arcSegs = 6,
): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const step = (Math.PI * 2) / slots;
  const rTip = rBase + dir * slotDepth;
  const haBase = Math.min(step * 0.45, slotWidth / (2 * rBase));
  const haTip = Math.min(step * 0.45, slotWidth / (2 * Math.max(rTip, 0.05)));

  for (let i = 0; i < slots; i++) {
    const a = i * step;
    const landStart = a + haBase;
    const landEnd = a + step - haBase;

    // Tooth face along the base radius.
    for (let s = 0; s <= arcSegs; s++) {
      pts.push(polar(rBase, landStart + ((landEnd - landStart) * s) / arcSegs));
    }

    // Detour into the slot centred on the next tooth boundary.
    const c = a + step;
    pts.push(polar(rTip, c - haTip));
    pts.push(polar(rTip, c + haTip));
  }

  return pts;
}

function circleProfile(r: number, segs = 96): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < segs; i++) pts.push(polar(r, (i / segs) * Math.PI * 2));
  return pts;
}

function extrude(shape: THREE.Shape, depth: number): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

export interface SlottedCoreOptions {
  rOuter: number;
  rInner: number;
  slots: number;
  slotDepth: number;
  slotWidth: number;
  /** 'in' = stator (slots open at the bore); 'out' = rotor (slots open at the OD). */
  facing: 'in' | 'out';
  length: number;
}

/**
 * A single-piece laminated core with a real slot profile. One draw call,
 * and the slots are actual geometry rather than boxes floating on a cylinder.
 */
export function slottedCoreGeometry(o: SlottedCoreOptions): THREE.BufferGeometry {
  const shape =
    o.facing === 'out'
      ? new THREE.Shape(slottedProfile(o.rOuter, o.slots, o.slotDepth, o.slotWidth, -1))
      : new THREE.Shape(circleProfile(o.rOuter));

  const holePts =
    o.facing === 'in'
      ? slottedProfile(o.rInner, o.slots, o.slotDepth, o.slotWidth, 1)
      : circleProfile(o.rInner);

  shape.holes.push(new THREE.Path(holePts.slice().reverse()));
  return extrude(shape, o.length);
}

/** A plain annulus — yokes, spacers, end rings. */
export function ringGeometry(rInner: number, rOuter: number, length: number): THREE.BufferGeometry {
  const shape = new THREE.Shape(circleProfile(rOuter));
  shape.holes.push(new THREE.Path(circleProfile(rInner).slice().reverse()));
  return extrude(shape, length);
}

/**
 * An arc segment (ring sector) — used for salient pole shoes, which are
 * curved to hug the airgap rather than being flat blocks.
 */
export function arcSectorGeometry(
  rInner: number,
  rOuter: number,
  halfAngle: number,
  length: number,
  centerAngle = Math.PI / 2,
  segs = 24,
): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const a0 = centerAngle - halfAngle;
  const a1 = centerAngle + halfAngle;
  for (let i = 0; i <= segs; i++) pts.push(polar(rOuter, a0 + ((a1 - a0) * i) / segs));
  for (let i = segs; i >= 0; i--) pts.push(polar(rInner, a0 + ((a1 - a0) * i) / segs));
  return extrude(new THREE.Shape(pts), length);
}

/** Points along a helix, for tube-swept coil windings. */
function helixPoints(
  radius: number,
  turns: number,
  length: number,
  axis: 'x' | 'y' | 'z',
  phase = 0,
  perTurn = 24,
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const total = Math.max(2, Math.round(turns * perTurn));
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const a = phase + t * turns * Math.PI * 2;
    const along = -length / 2 + t * length;
    const u = Math.cos(a) * radius;
    const v = Math.sin(a) * radius;
    if (axis === 'x') pts.push(new THREE.Vector3(along, u, v));
    else if (axis === 'y') pts.push(new THREE.Vector3(u, along, v));
    else pts.push(new THREE.Vector3(u, v, along));
  }
  return pts;
}

export interface CoilOptions {
  radius: number;
  turns: number;
  length: number;
  wireRadius: number;
  axis?: 'x' | 'y' | 'z';
  phase?: number;
}

/**
 * A swept-tube helical coil. Replaces the stacked-torus approximation —
 * a real winding is one continuous conductor, and it shows.
 */
export function coilGeometry(o: CoilOptions): THREE.BufferGeometry {
  const pts = helixPoints(o.radius, o.turns, o.length, o.axis ?? 'x', o.phase ?? 0);
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  return new THREE.TubeGeometry(curve, pts.length, o.wireRadius, 8, false);
}

/** The curve itself, for animating charge carriers along a winding. */
export function coilCurve(o: CoilOptions): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    helixPoints(o.radius, o.turns, o.length, o.axis ?? 'x', o.phase ?? 0),
    false,
    'catmullrom',
    0.5,
  );
}
