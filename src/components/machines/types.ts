/** Props every built-in machine model receives from MachineViewer. */
export interface MachineModelProps {
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isAnimating: boolean;
  /** Manual speed multiplier, used when the lab link is off. */
  animationSpeed: number;
  isExploded: boolean;
  showLabels?: boolean;
  explodeSpread?: number;
  /** Quiz target to pulse, if any. */
  hintedPart?: string | null;
  /** Fade every part except the selected one. */
  focusMode?: boolean;
  /**
   * Rotor speed from the virtual lab, in RPM. When non-null the model spins at
   * a speed proportional to the simulated result rather than the slider.
   */
  rotorRpm?: number | null;
  /** Stator field speed in RPM — only meaningful for the induction motor. */
  fieldRpm?: number | null;
}
