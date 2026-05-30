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
  openness: number;
  attack: number;
  swing: number;
  gravity: number;
  synergyResonance: number;
  cadencePull: number;
  modalTension: number;
  blendCohesion: number;
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
  growthImprint: "neutral" | "pentatonic-drive" | "jazz-lattice" | "metal-forge" | "neo-soul-veil" | "fusion-phase";
  growthImprintIntensity: number;
  phraseTrajectory: "neutral" | "lift-arc" | "velvet-drift" | "forge-drop" | "prism-climb" | "runway-drive" | "shadow-sink";
  phraseTrajectoryIntensity: number;
  phraseHooks: string[];
  phraseHookEnergy: number;
  phraseVariation: "neutral" | "choir-step" | "silk-orbit" | "hammer-fall" | "phase-spiral" | "spark-chase";
  phraseVariationIntensity: number;
  voiceprints?: string[];
  voiceprintIntensity?: number;
  elementRoles?: string[];
  elementRoleIntensity?: number;
  sceneCascade:
    | "neutral"
    | "aurora-dais"
    | "velvet-arcade"
    | "forge-ritual"
    | "prism-vortex"
    | "tide-runway"
    | "eclipse-altar";
  sceneCascadeIntensity: number;
  activeBonuses: string[];
  activeSynergies: string[];
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
