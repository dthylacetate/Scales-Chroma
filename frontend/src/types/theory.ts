export type TheoryType = "scale" | "mode" | "chord" | "progression";

export interface TheoryElement {
  id: string;
  type: TheoryType;
  name: string;
}

export interface VisualParameters {
  color: string;
  secondaryColor: string;
  backgroundColor: string;
  glow: number;
  contrast: number;
  energy: number;
  complexity: number;
  temperature: number;
  valence: number;
  arousal: number;
  luminosity: number;
  grit: number;
  symmetry: number;
  depth: number;
  pulseDensity: number;
  motionSpeed: number;
  ringCount: number;
  rippleStrength: number;
  beamStrength: number;
  grain: number;
  signature: string;
  sceneFamily:
    | "solar-garden"
    | "velvet-chamber"
    | "metal-foundry"
    | "jazz-cathedral"
    | "prism-array"
    | "nocturne-tide"
    | "neon-grid"
    | "shadow-sanctum";
  activeBonuses: string[];
  particles: {
    density: number;
    trail: boolean;
    size: number;
    speed: number;
    spread: number;
  };
  geometry: "soft-orb" | "fracture" | "wave" | "lattice";
  animationState: "calm" | "flowing" | "tense" | "explosive";
}
