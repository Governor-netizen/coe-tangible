export type MachineType = 'dc-motor' | 'dc-generator' | 'transformer' | 'induction-motor' | 'custom';

export interface MachinePart {
  id: string;
  name: string;
  color: string;
  description: string;
  function: string;
  concepts: string[];
  assemblyOrder: number;
  explodeOffset: [number, number, number];
}

export interface MachineFormula {
  name: string;
  formula: string;
  variables: { symbol: string; name: string; unit: string }[];
}

export interface LabParameter {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface LabOutput {
  id: string;
  name: string;
  unit: string;
  compute: (params: Record<string, number>) => number;
}

export interface MachineData {
  id: MachineType;
  name: string;
  description: string;
  parts: MachinePart[];
  formulas: MachineFormula[];
  labParameters: LabParameter[];
  labOutputs: LabOutput[];
  operationDescription: string;
}

// Quiz helper
export interface QuizQuestion {
  targetPartId: string;
  targetPartName: string;
  hint: string;
}

export function generateQuizQuestions(machine: MachineData): QuizQuestion[] {
  return machine.parts.map((p) => ({
    targetPartId: p.id,
    targetPartName: p.name,
    hint: p.function.slice(0, 80) + '...',
  }));
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const machineDatabase: Record<string, MachineData> = {
  'dc-motor': {
    id: 'dc-motor',
    name: 'DC Motor',
    description: 'A DC motor converts direct current electrical energy into mechanical rotational energy using electromagnetic principles.',
    parts: [
      {
        id: 'stator',
        name: 'Stator (Field Winding)',
        color: '#2D5F6E',
        description: 'The stationary outer frame that houses the field windings. Creates the main magnetic field.',
        function: 'Produces a stationary magnetic field that interacts with the armature current to produce torque.',
        concepts: ['Magnetic Field', 'Electromagnet', 'Field Excitation'],
        assemblyOrder: 1,
        explodeOffset: [0, 0, -1.5],
      },
      {
        id: 'rotor',
        name: 'Rotor (Armature)',
        color: '#E05A2A',
        description: 'The rotating inner cylinder that carries the armature windings. Experiences torque due to current-carrying conductors in a magnetic field.',
        function: 'Carries current through conductors that interact with the stator field to produce rotational torque (Lorentz Force).',
        concepts: ['Lorentz Force', 'Torque', 'Back EMF'],
        assemblyOrder: 3,
        explodeOffset: [0, 0, 0],
      },
      {
        id: 'commutator',
        name: 'Commutator',
        color: '#B8860B',
        description: 'A segmented copper cylinder that reverses current direction in the armature coils as they rotate.',
        function: 'Acts as a mechanical rectifier, switching current direction every half-turn to maintain continuous rotation.',
        concepts: ['Current Reversal', 'Mechanical Rectification', 'Commutation'],
        assemblyOrder: 4,
        explodeOffset: [2, 0, 0],
      },
      {
        id: 'brushes',
        name: 'Carbon Brushes',
        color: '#444444',
        description: 'Carbon blocks that press against the commutator to transfer electrical current to the rotating armature.',
        function: 'Provide sliding electrical contact between the stationary circuit and the rotating commutator.',
        concepts: ['Sliding Contact', 'Current Transfer', 'Brush Friction'],
        assemblyOrder: 5,
        explodeOffset: [2.5, 1, 0],
      },
      {
        id: 'shaft',
        name: 'Shaft',
        color: '#C0C0C0',
        description: 'The central rotating axis that transfers mechanical power from the rotor to the external load.',
        function: 'Transmits rotational mechanical energy to the connected load or machinery.',
        concepts: ['Mechanical Power', 'Torque Transmission', 'RPM'],
        assemblyOrder: 2,
        explodeOffset: [0, 0, 2],
      },
      {
        id: 'windings',
        name: 'Armature Windings',
        color: '#D4442A',
        description: 'Coils of insulated copper wire wound around the armature core. Current through these produces the driving force.',
        function: 'Carry armature current that interacts with the magnetic field to generate torque via the Lorentz force (F = BIL).',
        concepts: ['Electromagnetic Induction', 'F = BIL', 'Coil Turns'],
        assemblyOrder: 3,
        explodeOffset: [0, 2, 0],
      },
    ],
    formulas: [
      {
        name: 'Speed Equation',
        formula: 'N = (V - Iₐ·Rₐ) / (K·φ)',
        variables: [
          { symbol: 'N', name: 'Speed', unit: 'RPM' },
          { symbol: 'V', name: 'Supply Voltage', unit: 'V' },
          { symbol: 'Iₐ', name: 'Armature Current', unit: 'A' },
          { symbol: 'Rₐ', name: 'Armature Resistance', unit: 'Ω' },
          { symbol: 'K·φ', name: 'Motor Constant × Flux', unit: 'V·s/rad' },
        ],
      },
      {
        name: 'Torque Equation',
        formula: 'T = K·φ·Iₐ',
        variables: [
          { symbol: 'T', name: 'Torque', unit: 'N·m' },
          { symbol: 'K·φ', name: 'Motor Constant × Flux', unit: '' },
          { symbol: 'Iₐ', name: 'Armature Current', unit: 'A' },
        ],
      },
    ],
    labParameters: [
      { id: 'voltage', name: 'Supply Voltage', unit: 'V', min: 0, max: 240, step: 5, defaultValue: 120 },
      { id: 'load', name: 'Load Torque', unit: 'N·m', min: 0, max: 50, step: 1, defaultValue: 10 },
      { id: 'fieldCurrent', name: 'Field Current', unit: 'A', min: 0.5, max: 5, step: 0.1, defaultValue: 2 },
    ],
    labOutputs: [
      {
        id: 'speed',
        name: 'Speed',
        unit: 'RPM',
        compute: (p) => {
          const Ra = 0.5;
          const Kphi = 0.1 * p.fieldCurrent;
          const Ia = p.load / (Kphi || 0.01);
          const backEmf = p.voltage - Ia * Ra;
          return Math.max(0, Math.round((backEmf / (Kphi || 0.01)) * (60 / (2 * Math.PI))));
        },
      },
      {
        id: 'armatureCurrent',
        name: 'Armature Current',
        unit: 'A',
        compute: (p) => {
          const Kphi = 0.1 * p.fieldCurrent;
          return Math.round((p.load / (Kphi || 0.01)) * 10) / 10;
        },
      },
      {
        id: 'power',
        name: 'Mechanical Power',
        unit: 'W',
        compute: (p) => {
          const Ra = 0.5;
          const Kphi = 0.1 * p.fieldCurrent;
          const Ia = p.load / (Kphi || 0.01);
          const backEmf = p.voltage - Ia * Ra;
          const speed = Math.max(0, backEmf / (Kphi || 0.01));
          return Math.max(0, Math.round(p.load * speed));
        },
      },
    ],
    operationDescription: 'When voltage is applied, current flows through the armature windings via the brushes and commutator. The interaction between the current-carrying conductors and the stator magnetic field produces a Lorentz force, causing the rotor to spin.',
  },
  'dc-generator': {
    id: 'dc-generator',
    name: 'DC Generator',
    description: 'A DC generator converts mechanical rotational energy into direct current electrical energy through electromagnetic induction.',
    parts: [
      {
        id: 'stator',
        name: 'Stator (Field Poles)',
        color: '#2D5F6E',
        description: 'Stationary poles with field windings that create a strong magnetic field in the air gap.',
        function: 'Provides the magnetic field in which the armature rotates, enabling electromagnetic induction.',
        concepts: ['Magnetic Field', 'Permanent Magnets vs Electromagnets'],
        assemblyOrder: 1,
        explodeOffset: [0, 0, -1.5],
      },
      {
        id: 'rotor',
        name: 'Armature Core',
        color: '#E05A2A',
        description: 'Laminated iron core that carries the armature windings and rotates within the magnetic field.',
        function: 'Provides a low-reluctance path for magnetic flux and supports the armature windings.',
        concepts: ['Magnetic Reluctance', 'Eddy Currents', 'Lamination'],
        assemblyOrder: 3,
        explodeOffset: [0, 0, 0],
      },
      {
        id: 'commutator',
        name: 'Commutator',
        color: '#B8860B',
        description: 'Converts the alternating EMF generated in the armature coils into unidirectional DC output.',
        function: 'Acts as a mechanical rectifier to produce DC output from the AC generated in rotating coils.',
        concepts: ['Rectification', 'EMF Generation', 'AC to DC'],
        assemblyOrder: 4,
        explodeOffset: [2, 0, 0],
      },
      {
        id: 'brushes',
        name: 'Carbon Brushes',
        color: '#444444',
        description: 'Collect the generated current from the rotating commutator and deliver it to the external circuit.',
        function: 'Provide electrical connection between the rotating armature and the stationary external load circuit.',
        concepts: ['Current Collection', 'Contact Resistance'],
        assemblyOrder: 5,
        explodeOffset: [2.5, 1, 0],
      },
      {
        id: 'shaft',
        name: 'Shaft',
        color: '#C0C0C0',
        description: 'Connected to the prime mover (turbine, engine) that provides the mechanical input energy.',
        function: 'Receives rotational mechanical energy from the prime mover and transfers it to the armature.',
        concepts: ['Prime Mover', 'Mechanical Input', 'RPM'],
        assemblyOrder: 2,
        explodeOffset: [0, 0, 2],
      },
    ],
    formulas: [
      {
        name: 'Generated EMF',
        formula: 'E = (P·φ·N·Z) / (60·A)',
        variables: [
          { symbol: 'E', name: 'Generated EMF', unit: 'V' },
          { symbol: 'P', name: 'Number of Poles', unit: '' },
          { symbol: 'φ', name: 'Flux per Pole', unit: 'Wb' },
          { symbol: 'N', name: 'Speed', unit: 'RPM' },
          { symbol: 'Z', name: 'Number of Conductors', unit: '' },
          { symbol: 'A', name: 'Parallel Paths', unit: '' },
        ],
      },
    ],
    labParameters: [
      { id: 'speed', name: 'Prime Mover Speed', unit: 'RPM', min: 0, max: 3000, step: 50, defaultValue: 1500 },
      { id: 'fieldCurrent', name: 'Field Current', unit: 'A', min: 0.5, max: 5, step: 0.1, defaultValue: 2 },
      { id: 'loadResistance', name: 'Load Resistance', unit: 'Ω', min: 5, max: 200, step: 5, defaultValue: 50 },
    ],
    labOutputs: [
      {
        id: 'emf',
        name: 'Generated EMF',
        unit: 'V',
        compute: (p) => Math.round(0.08 * p.fieldCurrent * p.speed) / 10,
      },
      {
        id: 'loadCurrent',
        name: 'Load Current',
        unit: 'A',
        compute: (p) => {
          const emf = 0.08 * p.fieldCurrent * p.speed / 10;
          return Math.round((emf / p.loadResistance) * 100) / 100;
        },
      },
      {
        id: 'outputPower',
        name: 'Output Power',
        unit: 'W',
        compute: (p) => {
          const emf = 0.08 * p.fieldCurrent * p.speed / 10;
          const I = emf / p.loadResistance;
          return Math.round(emf * I);
        },
      },
    ],
    operationDescription: 'The prime mover rotates the armature in the magnetic field. By Faraday\'s law, an EMF is induced in the armature coils. The commutator rectifies this into DC, which flows to the load through the brushes.',
  },
  'transformer': {
    id: 'transformer',
    name: 'Transformer',
    description: 'A transformer transfers electrical energy between circuits through electromagnetic induction, changing voltage and current levels.',
    parts: [
      {
        id: 'core',
        name: 'Laminated Iron Core',
        color: '#607D8B',
        description: 'E-I shaped laminated silicon steel core that provides a low-reluctance path for magnetic flux.',
        function: 'Channels magnetic flux between primary and secondary windings with minimal losses. Lamination reduces eddy currents.',
        concepts: ['Magnetic Circuit', 'Reluctance', 'Eddy Current Losses', 'Hysteresis'],
        assemblyOrder: 1,
        explodeOffset: [0, 0, 0],
      },
      {
        id: 'primaryWinding',
        name: 'Primary Winding',
        color: '#C94040',
        description: 'Coil connected to the AC input supply. The number of turns determines the voltage transformation ratio.',
        function: 'Receives input AC power and creates an alternating magnetic flux in the core via Ampere\'s law.',
        concepts: ['Ampere\'s Law', 'Magnetizing Current', 'Primary Impedance'],
        assemblyOrder: 2,
        explodeOffset: [-2, 0, 0],
      },
      {
        id: 'secondaryWinding',
        name: 'Secondary Winding',
        color: '#4A90A4',
        description: 'Coil connected to the output/load. EMF is induced in this winding by the changing flux in the core.',
        function: 'Delivers transformed voltage to the load. Output voltage depends on the turns ratio (V₂/V₁ = N₂/N₁).',
        concepts: ['Faraday\'s Law', 'Mutual Induction', 'Turns Ratio'],
        assemblyOrder: 3,
        explodeOffset: [2, 0, 0],
      },
      {
        id: 'insulation',
        name: 'Insulation Layers',
        color: '#F5E6CC',
        description: 'Insulating material between windings and between windings and core to prevent electrical breakdown.',
        function: 'Provides electrical isolation between primary, secondary, and core. Rated for specific voltage levels.',
        concepts: ['Dielectric Strength', 'Voltage Isolation', 'BIL Rating'],
        assemblyOrder: 2,
        explodeOffset: [0, 2, 0],
      },
    ],
    formulas: [
      {
        name: 'Turns Ratio',
        formula: 'V₁/V₂ = N₁/N₂ = I₂/I₁',
        variables: [
          { symbol: 'V₁', name: 'Primary Voltage', unit: 'V' },
          { symbol: 'V₂', name: 'Secondary Voltage', unit: 'V' },
          { symbol: 'N₁', name: 'Primary Turns', unit: '' },
          { symbol: 'N₂', name: 'Secondary Turns', unit: '' },
        ],
      },
      {
        name: 'Power Conservation',
        formula: 'V₁·I₁ ≈ V₂·I₂',
        variables: [
          { symbol: 'V₁·I₁', name: 'Input Power', unit: 'VA' },
          { symbol: 'V₂·I₂', name: 'Output Power', unit: 'VA' },
        ],
      },
    ],
    labParameters: [
      { id: 'primaryVoltage', name: 'Primary Voltage', unit: 'V', min: 0, max: 440, step: 10, defaultValue: 220 },
      { id: 'turnsRatio', name: 'Turns Ratio (N₁/N₂)', unit: '', min: 0.1, max: 10, step: 0.1, defaultValue: 2 },
      { id: 'loadCurrent', name: 'Load Current', unit: 'A', min: 0, max: 20, step: 0.5, defaultValue: 5 },
    ],
    labOutputs: [
      {
        id: 'secondaryVoltage',
        name: 'Secondary Voltage',
        unit: 'V',
        compute: (p) => Math.round((p.primaryVoltage / p.turnsRatio) * 10) / 10,
      },
      {
        id: 'primaryCurrent',
        name: 'Primary Current',
        unit: 'A',
        compute: (p) => Math.round((p.loadCurrent / p.turnsRatio) * 100) / 100,
      },
      {
        id: 'apparentPower',
        name: 'Apparent Power',
        unit: 'VA',
        compute: (p) => {
          const V2 = p.primaryVoltage / p.turnsRatio;
          return Math.round(V2 * p.loadCurrent);
        },
      },
    ],
    operationDescription: 'AC voltage applied to the primary winding creates an alternating magnetic flux in the core. This changing flux induces an EMF in the secondary winding (Faraday\'s Law). The voltage ratio equals the turns ratio.',
  },
  'induction-motor': {
    id: 'induction-motor',
    name: 'Three-Phase Induction Motor',
    description: 'The most widely used AC motor. A rotating magnetic field in the stator induces current in the rotor, producing torque.',
    parts: [
      {
        id: 'housing',
        name: 'Motor Housing',
        color: '#9ba8b5',
        description: 'The outer cast iron frame that protects all internal components and provides mounting points.',
        function: 'Protects internal components, provides structural support and mounting points for installation.',
        concepts: ['Cast Iron Frame', 'Cooling Fins', 'IP Rating'],
        assemblyOrder: 1,
        explodeOffset: [0, 0, -2],
      },
      {
        id: 'statorCore',
        name: 'Stator Core',
        color: '#4a5568',
        description: 'The stationary laminated steel core that houses the three-phase windings and creates a rotating magnetic field.',
        function: 'Provides a low-reluctance path for magnetic flux and houses the stator windings.',
        concepts: ['Laminated Core', 'Rotating Magnetic Field', 'Synchronous Speed'],
        assemblyOrder: 2,
        explodeOffset: [0, 0, -1],
      },
      {
        id: 'phaseR',
        name: 'Phase R Winding',
        color: '#dc2626',
        description: 'Carries one phase of the three-phase AC supply to produce the rotating magnetic field.',
        function: 'Contributes one-third of the rotating magnetic field at 0° phase angle.',
        concepts: ['Phase Angle', 'Balanced Three-Phase', 'MMF Distribution'],
        assemblyOrder: 3,
        explodeOffset: [-1.5, 1.5, 0],
      },
      {
        id: 'phaseY',
        name: 'Phase Y Winding',
        color: '#d97706',
        description: 'Carries one phase of the three-phase AC supply to produce the rotating magnetic field.',
        function: 'Contributes one-third of the rotating magnetic field, 120° displaced from Phase R.',
        concepts: ['Phase Displacement', '120° Separation'],
        assemblyOrder: 3,
        explodeOffset: [1.5, 1.5, 0],
      },
      {
        id: 'phaseB',
        name: 'Phase B Winding',
        color: '#2563eb',
        description: 'Carries one phase of the three-phase AC supply to produce the rotating magnetic field.',
        function: 'Completes the three-phase system, producing a smooth rotating magnetic field.',
        concepts: ['Complete Three-Phase', 'Smooth Rotation'],
        assemblyOrder: 3,
        explodeOffset: [0, 2, 0],
      },
      {
        id: 'rotor',
        name: 'Squirrel Cage Rotor',
        color: '#4a5568',
        description: 'The rotating part made of aluminum bars short-circuited by end rings. Current is induced by the stator\'s rotating magnetic field causing it to spin.',
        function: 'The rotating stator field induces current in the rotor bars, producing torque. The rotor always runs slower than the field (slip).',
        concepts: ['Induced Current', 'Slip', 'Rotor Torque', 'Lenz\'s Law'],
        assemblyOrder: 4,
        explodeOffset: [0, 0, 0],
      },
      {
        id: 'shaft',
        name: 'Shaft',
        color: '#d4d8e0',
        description: 'Transfers the rotational mechanical energy from the rotor to the connected load.',
        function: 'Delivers mechanical power output to the connected load.',
        concepts: ['Mechanical Output', 'Power Transmission'],
        assemblyOrder: 5,
        explodeOffset: [0, 0, 2],
      },
      {
        id: 'endShield',
        name: 'End Shield',
        color: '#9ba8b5',
        description: 'Closing plates at both ends of the motor that support the bearings and protect internal components.',
        function: 'Supports shaft bearings and seals the motor enclosure.',
        concepts: ['Bearing Support', 'Motor Enclosure'],
        assemblyOrder: 6,
        explodeOffset: [0, 3, 0],
      },
      {
        id: 'coolingFan',
        name: 'Cooling Fan',
        color: '#b8c4cc',
        description: 'Forces air through the motor to dissipate heat generated during operation.',
        function: 'Provides forced convection cooling to maintain safe operating temperature.',
        concepts: ['Thermal Management', 'Forced Convection'],
        assemblyOrder: 7,
        explodeOffset: [0, 4, 0],
      },
      {
        id: 'terminalBox',
        name: 'Terminal Box',
        color: '#9ba8b5',
        description: 'The connection point where the three-phase power supply connects to the motor windings.',
        function: 'Provides accessible terminals for star or delta connection of the three-phase supply.',
        concepts: ['Star-Delta Connection', 'Terminal Configuration'],
        assemblyOrder: 8,
        explodeOffset: [3, 0, 0],
      },
    ],
    formulas: [
      {
        name: 'Synchronous Speed',
        formula: 'Ns = 120·f / P',
        variables: [
          { symbol: 'Ns', name: 'Synchronous Speed', unit: 'RPM' },
          { symbol: 'f', name: 'Supply Frequency', unit: 'Hz' },
          { symbol: 'P', name: 'Number of Poles', unit: '' },
        ],
      },
      {
        name: 'Slip',
        formula: 's = (Ns - Nr) / Ns',
        variables: [
          { symbol: 's', name: 'Slip', unit: '' },
          { symbol: 'Ns', name: 'Synchronous Speed', unit: 'RPM' },
          { symbol: 'Nr', name: 'Rotor Speed', unit: 'RPM' },
        ],
      },
    ],
    labParameters: [
      { id: 'frequency', name: 'Supply Frequency', unit: 'Hz', min: 10, max: 60, step: 1, defaultValue: 50 },
      { id: 'poles', name: 'Number of Poles', unit: '', min: 2, max: 8, step: 2, defaultValue: 4 },
      { id: 'load', name: 'Load Torque', unit: 'N·m', min: 0, max: 50, step: 1, defaultValue: 10 },
    ],
    labOutputs: [
      {
        id: 'syncSpeed',
        name: 'Synchronous Speed',
        unit: 'RPM',
        compute: (p) => Math.round((120 * p.frequency) / p.poles),
      },
      {
        id: 'slip',
        name: 'Slip',
        unit: '%',
        compute: (p) => {
          const Ns = (120 * p.frequency) / p.poles;
          const slipPercent = Math.min(100, 2 + (p.load / 50) * 8);
          return Math.round(slipPercent * 10) / 10;
        },
      },
      {
        id: 'rotorSpeed',
        name: 'Rotor Speed',
        unit: 'RPM',
        compute: (p) => {
          const Ns = (120 * p.frequency) / p.poles;
          const slip = (2 + (p.load / 50) * 8) / 100;
          return Math.round(Ns * (1 - slip));
        },
      },
    ],
    operationDescription: 'Three-phase AC supply creates a rotating magnetic field in the stator. This field cuts the rotor conductors, inducing current (Faraday\'s Law). The interaction between induced rotor current and stator field produces torque (Lenz\'s Law), causing the rotor to chase the field.',
  },
};

import { Zap, Battery, Plug, Settings, LucideIcon } from "lucide-react";

export const machineList: { id: MachineType; name: string; icon: string; image?: string }[] = [
  { id: 'dc-motor', name: 'DC Motor', icon: 'Zap', image: 'dc-motor' },
  { id: 'dc-generator', name: 'DC Generator', icon: 'Battery', image: 'dc-generator' },
  { id: 'transformer', name: 'Transformer', icon: 'Plug', image: 'transformer' },
  { id: 'induction-motor', name: 'Induction Motor', icon: 'Settings', image: 'induction-motor' },
];

export function getMachineIcon(iconName: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    'Zap': Zap,
    'Battery': Battery,
    'Plug': Plug,
    'Settings': Settings,
  };
  return iconMap[iconName] || Zap;
}
