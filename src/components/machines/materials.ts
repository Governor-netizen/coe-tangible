import * as THREE from 'three';

/**
 * Shared PBR material presets for every machine model.
 *
 * These are plain prop objects, not THREE.Material instances, so each
 * `<meshStandardMaterial {...MAT.copper} />` element creates its own material.
 * That matters: MachinePartMesh mutates `emissive` / `opacity` on the materials
 * it owns, and shared instances would leak highlight state between parts.
 */
type Std = THREE.MeshStandardMaterialParameters;

export const MAT = {
  /** Cast-iron motor frame / end shields — matte, slightly rough. */
  castIron: { color: '#8d97a3', metalness: 0.35, roughness: 0.62 } as Std,
  castIronDark: { color: '#6f7885', metalness: 0.4, roughness: 0.58 } as Std,

  /** Painted machine housing (the "shop floor" look). */
  paintedShell: { color: '#2f6f7e', metalness: 0.25, roughness: 0.5 } as Std,

  /** Laminated electrical steel — cores, yokes, pole shoes. */
  laminatedSteel: { color: '#5b6577', metalness: 0.85, roughness: 0.38 } as Std,

  /** Machined / polished steel — shafts, keys. */
  shaftSteel: { color: '#dde2e9', metalness: 1.0, roughness: 0.09 } as Std,
  boltSteel: { color: '#9aa1ab', metalness: 0.8, roughness: 0.28 } as Std,

  /** Bare copper — commutator segments, bus bars. */
  copper: { color: '#b5702f', metalness: 0.92, roughness: 0.26 } as Std,
  copperWorn: { color: '#9c5f28', metalness: 0.88, roughness: 0.34 } as Std,

  /** Enamelled magnet wire — windings. Less metallic than bare copper. */
  magnetWire: { color: '#a8481c', metalness: 0.55, roughness: 0.35 } as Std,

  /** Cast aluminium — squirrel-cage bars, end rings, fan. */
  aluminium: { color: '#c6ced7', metalness: 0.93, roughness: 0.2 } as Std,

  /** Carbon brush — near-black, completely non-metallic. */
  carbon: { color: '#232630', metalness: 0.03, roughness: 0.95 } as Std,

  /** Brass brush holders / terminals. */
  brass: { color: '#b8912f', metalness: 0.9, roughness: 0.3 } as Std,

  /** Mica / pressboard / varnish insulation. */
  insulation: { color: '#e7d6a6', metalness: 0.0, roughness: 0.85 } as Std,

  /** Porcelain HV bushing. */
  porcelain: { color: '#cfa06b', metalness: 0.1, roughness: 0.45 } as Std,

  /** Terminal-box plastic / rubber gland. */
  bakelite: { color: '#1c2027', metalness: 0.1, roughness: 0.8 } as Std,

  /** Transformer tank oil (translucent). */
  oil: {
    color: '#1d3a2e',
    metalness: 0.1,
    roughness: 0.15,
    transparent: true,
    opacity: 0.28,
  } as Std,
} satisfies Record<string, Std>;

/** Darker tone used for lamination grooves and slot shadowing. */
export const LAMINATION_LINE: Std = { color: '#2c3340', metalness: 0.6, roughness: 0.55 };

/** Machine axis convention: every machine is built with its shaft along +X. */
export const AXIS = {
  /** Rotate a Y-aligned primitive (cylinder, cone) onto the X axis. */
  fromY: [0, 0, Math.PI / 2] as [number, number, number],
  /** Rotate a Z-aligned primitive (torus, extrusion depth) onto the X axis. */
  fromZ: [0, Math.PI / 2, 0] as [number, number, number],
};

/**
 * Convert a machine speed in RPM to a viewer-friendly angular velocity.
 * A real 1500 RPM would be an unreadable blur, so the viewer runs at a fixed
 * fraction of real speed while staying strictly proportional — the whole point
 * is that doubling the computed RPM visibly doubles the spin.
 */
export const RPM_TO_VIEW_RAD = (2 * Math.PI) / 60 * 0.025;

export function rpmToRadPerSec(rpm: number): number {
  return rpm * RPM_TO_VIEW_RAD;
}
