import type { TheoryElement, VisualParameters } from "../types/theory";

interface ElementVisualProfile {
  color: string;
  secondaryColor: string;
  backgroundColor: string;
  glow: number;
  contrast: number;
  energy: number;
  complexity: number;
  motionSpeed: number;
  rippleStrength: number;
  beamStrength: number;
  grain: number;
  particleDensity: number;
  geometryWeights: {
    softOrb: number;
    wave: number;
    fracture: number;
    lattice: number;
  };
}

interface MoodAxes {
  valence: number;
  arousal: number;
  luminosity: number;
  grit: number;
}

interface HarmonicTraits {
  openness: number;
  attack: number;
  swing: number;
  gravity: number;
}

const DEFAULT_VISUALS: VisualParameters = {
  color: "#7bdff2",
  secondaryColor: "#8d99ff",
  backgroundColor: "#091018",
  glow: 0.58,
  contrast: 0.44,
  energy: 0.58,
  complexity: 0.46,
  temperature: 0.5,
  valence: 0.56,
  arousal: 0.58,
  luminosity: 0.56,
  grit: 0.28,
  openness: 0.56,
  attack: 0.32,
  swing: 0.42,
  gravity: 0.48,
  synergyResonance: 0.48,
  cadencePull: 0.42,
  modalTension: 0.32,
  blendCohesion: 0.56,
  symmetry: 0.52,
  depth: 0.56,
  pulseDensity: 0.48,
  motionSpeed: 0.5,
  ringCount: 3,
  rippleStrength: 0.42,
  beamStrength: 0.34,
  grain: 0.18,
  signature: "Pulse Field",
  sceneFamily: "neon-grid",
  growthImprint: "neutral",
  growthImprintIntensity: 0,
  phraseTrajectory: "neutral",
  phraseTrajectoryIntensity: 0,
  phraseHooks: [],
  phraseHookEnergy: 0,
  phraseVariation: "neutral",
  phraseVariationIntensity: 0,
  voiceprints: [],
  voiceprintIntensity: 0,
  elementRoles: [],
  elementRoleIntensity: 0,
  sceneCascade: "neutral",
  sceneCascadeIntensity: 0,
  activeBonuses: [],
  activeSynergies: [],
  particles: {
    density: 0.42,
    trail: false,
    size: 1.8,
    speed: 0.92,
    spread: 0.42
  },
  geometry: "lattice",
  animationState: "flowing"
};

const PROFILE_LIBRARY: Record<string, ElementVisualProfile> = {
  major: profile("#f7d56b", "#ffd8a8", "#130f10", 0.62, 0.34, 0.58, 0.28, 0.46, 0.32, 0.22, 0.16, 0.34, {
    softOrb: 0.86,
    wave: 0.34,
    fracture: 0.12,
    lattice: 0.18
  }),
  minor: profile("#7488ff", "#99b0ff", "#0e1020", 0.48, 0.48, 0.42, 0.44, 0.36, 0.62, 0.26, 0.24, 0.42, {
    softOrb: 0.24,
    wave: 0.78,
    fracture: 0.18,
    lattice: 0.22
  }),
  pentatonic: profile("#00d7ff", "#7a7bff", "#081521", 0.64, 0.56, 0.66, 0.52, 0.62, 0.36, 0.48, 0.22, 0.48, {
    softOrb: 0.22,
    wave: 0.38,
    fracture: 0.14,
    lattice: 0.82
  }),
  "harmonic minor": profile("#df4f74", "#7d1f4e", "#15060d", 0.7, 0.78, 0.78, 0.72, 0.72, 0.52, 0.58, 0.44, 0.72, {
    softOrb: 0.14,
    wave: 0.44,
    fracture: 0.86,
    lattice: 0.26
  }),
  "melodic minor": profile("#42c6b0", "#ff8a5b", "#081314", 0.68, 0.58, 0.72, 0.62, 0.66, 0.68, 0.42, 0.22, 0.58, {
    softOrb: 0.24,
    wave: 0.74,
    fracture: 0.24,
    lattice: 0.3
  }),
  ionian: profile("#f8d66d", "#fff3bf", "#120f10", 0.58, 0.3, 0.56, 0.24, 0.42, 0.28, 0.2, 0.16, 0.3, {
    softOrb: 0.88,
    wave: 0.3,
    fracture: 0.1,
    lattice: 0.18
  }),
  dorian: profile("#59d1a4", "#9af0dd", "#071516", 0.66, 0.5, 0.64, 0.52, 0.58, 0.76, 0.34, 0.18, 0.5, {
    softOrb: 0.22,
    wave: 0.82,
    fracture: 0.12,
    lattice: 0.34
  }),
  phrygian: profile("#574062", "#d95f43", "#09070f", 0.46, 0.74, 0.68, 0.64, 0.54, 0.58, 0.48, 0.42, 0.46, {
    softOrb: 0.12,
    wave: 0.68,
    fracture: 0.42,
    lattice: 0.18
  }),
  lydian: profile("#ffe56d", "#8fdcff", "#0f1117", 0.78, 0.42, 0.74, 0.46, 0.58, 0.62, 0.42, 0.16, 0.46, {
    softOrb: 0.82,
    wave: 0.42,
    fracture: 0.12,
    lattice: 0.24
  }),
  mixolydian: profile("#ff9b35", "#ffd36b", "#171008", 0.68, 0.58, 0.7, 0.54, 0.62, 0.38, 0.52, 0.24, 0.56, {
    softOrb: 0.26,
    wave: 0.42,
    fracture: 0.18,
    lattice: 0.74
  }),
  maj7: profile("#ffb45c", "#ff89b5", "#160e0d", 0.86, 0.4, 0.64, 0.34, 0.48, 0.34, 0.3, 0.14, 0.4, {
    softOrb: 0.9,
    wave: 0.34,
    fracture: 0.1,
    lattice: 0.18
  }),
  min7: profile("#7bdff2", "#85a8ff", "#081018", 0.62, 0.46, 0.46, 0.4, 0.4, 0.62, 0.28, 0.16, 0.46, {
    softOrb: 0.24,
    wave: 0.78,
    fracture: 0.1,
    lattice: 0.26
  }),
  dominant7: profile("#f25f5c", "#ffc145", "#16090b", 0.74, 0.72, 0.78, 0.68, 0.68, 0.44, 0.58, 0.34, 0.64, {
    softOrb: 0.16,
    wave: 0.4,
    fracture: 0.78,
    lattice: 0.22
  }),
  dim7: profile("#d8f6ff", "#a6d0ff", "#06080c", 0.72, 0.88, 0.84, 0.84, 0.78, 0.4, 0.72, 0.5, 0.82, {
    softOrb: 0.08,
    wave: 0.32,
    fracture: 0.92,
    lattice: 0.28
  }),
  aug: profile("#ff6bcb", "#ff8a5b", "#160611", 0.8, 0.86, 0.92, 0.8, 0.88, 0.46, 0.74, 0.36, 0.76, {
    softOrb: 0.12,
    wave: 0.36,
    fracture: 0.88,
    lattice: 0.24
  }),
  "ii-v-i": profile("#b8f2e6", "#b8c4ff", "#091115", 0.68, 0.46, 0.62, 0.6, 0.52, 0.58, 0.54, 0.18, 0.5, {
    softOrb: 0.34,
    wave: 0.66,
    fracture: 0.18,
    lattice: 0.58
  }),
  "i-v-vi-iv": profile("#ffcf6e", "#ff9d8c", "#160f09", 0.7, 0.34, 0.68, 0.46, 0.54, 0.34, 0.36, 0.18, 0.42, {
    softOrb: 0.82,
    wave: 0.42,
    fracture: 0.1,
    lattice: 0.22
  })
};

const COMBO_BONUSES = [
  combo(["lydian", "maj7"], "Celestial Bloom", {
    glow: 0.12,
    softOrb: 0.18,
    beamStrength: 0.16,
    rippleStrength: 0.12,
    depth: 0.16,
    symmetry: 0.12,
    valence: 0.12,
    luminosity: 0.18,
    arousal: 0.04,
    grit: -0.08,
    openness: 0.18,
    gravity: -0.12,
    secondaryColor: "#8fdcff"
  }),
  combo(["lydian", "major"], "Sunwake Atlas", {
    glow: 0.1,
    softOrb: 0.14,
    beamStrength: 0.14,
    energy: 0.08,
    temperature: 0.12,
    symmetry: 0.1,
    valence: 0.1,
    luminosity: 0.16,
    arousal: 0.04,
    grit: -0.06,
    secondaryColor: "#bfe6ff"
  }),
  combo(["dorian", "min7"], "Midnight Current", {
    wave: 0.22,
    rippleStrength: 0.2,
    complexity: 0.12,
    depth: 0.1,
    pulseDensity: 0.08,
    valence: 0.04,
    luminosity: 0.02,
    arousal: 0.06,
    grit: 0.04,
    secondaryColor: "#9af0dd"
  }),
  combo(["dorian", "ii-v-i"], "Blue Hour Run", {
    wave: 0.18,
    lattice: 0.14,
    rippleStrength: 0.18,
    beamStrength: 0.1,
    depth: 0.1,
    pulseDensity: 0.12,
    valence: 0.04,
    luminosity: 0.06,
    arousal: 0.08,
    grit: 0.02,
    swing: 0.18,
    gravity: 0.08,
    secondaryColor: "#7fe0c8"
  }),
  combo(["phrygian", "dominant7"], "Desert Voltage", {
    fracture: 0.22,
    contrast: 0.14,
    beamStrength: 0.18,
    energy: 0.1,
    pulseDensity: 0.14,
    temperature: 0.12,
    valence: -0.04,
    luminosity: 0.02,
    arousal: 0.14,
    grit: 0.12,
    secondaryColor: "#ff9b35"
  }),
  combo(["harmonic minor", "dim7"], "Occult Fracture", {
    fracture: 0.24,
    grain: 0.18,
    complexity: 0.14,
    glow: 0.1,
    depth: 0.18,
    pulseDensity: 0.12,
    symmetry: -0.12,
    valence: -0.1,
    luminosity: -0.08,
    arousal: 0.12,
    grit: 0.18,
    attack: 0.12,
    gravity: 0.14,
    openness: -0.12,
    swing: -0.08,
    backgroundColor: "#05060d"
  }),
  combo(["melodic minor", "dominant7"], "Chrome Meridian", {
    wave: 0.16,
    fracture: 0.12,
    complexity: 0.16,
    energy: 0.12,
    depth: 0.14,
    pulseDensity: 0.1,
    symmetry: 0.08,
    valence: 0.04,
    luminosity: 0.08,
    arousal: 0.14,
    grit: 0.08,
    attack: 0.1,
    swing: 0.14,
    blendCohesion: 0.06,
    secondaryColor: "#73f0d5"
  }),
  combo(["ii-v-i", "maj7"], "Cadence Aurora", {
    lattice: 0.2,
    rippleStrength: 0.16,
    beamStrength: 0.18,
    depth: 0.12,
    symmetry: 0.14,
    valence: 0.1,
    luminosity: 0.14,
    arousal: 0.06,
    grit: -0.04,
    gravity: 0.18,
    openness: 0.08,
    secondaryColor: "#c2b8ff"
  }),
  combo(["i-v-vi-iv", "major"], "Anthem Lift", {
    softOrb: 0.22,
    glow: 0.1,
    energy: 0.12,
    beamStrength: 0.12,
    temperature: 0.1,
    pulseDensity: 0.12
    ,
    valence: 0.12,
    luminosity: 0.14,
    arousal: 0.1,
    grit: -0.04
  }),
  combo(["ionian", "i-v-vi-iv"], "Daybreak Parade", {
    softOrb: 0.18,
    glow: 0.12,
    beamStrength: 0.14,
    rippleStrength: 0.08,
    temperature: 0.14,
    symmetry: 0.12,
    valence: 0.16,
    luminosity: 0.18,
    arousal: 0.06,
    grit: -0.08,
    secondaryColor: "#ffe5a8"
  }),
  combo(["pentatonic", "mixolydian"], "Roadhouse Neon", {
    lattice: 0.18,
    beamStrength: 0.2,
    contrast: 0.12,
    energy: 0.12,
    pulseDensity: 0.14,
    temperature: 0.08,
    valence: 0.06,
    luminosity: 0.08,
    arousal: 0.14,
    grit: 0.06
  }),
  combo(["minor", "pentatonic"], "Midnight Run", {
    wave: 0.16,
    contrast: 0.12,
    rippleStrength: 0.18,
    depth: 0.12,
    pulseDensity: 0.12,
    valence: -0.04,
    luminosity: -0.04,
    arousal: 0.08,
    grit: 0.08,
    backgroundColor: "#08111e"
  }),
  combo(["mixolydian", "dominant7"], "Brass Overdrive", {
    lattice: 0.16,
    fracture: 0.12,
    beamStrength: 0.18,
    energy: 0.14,
    pulseDensity: 0.14,
    temperature: 0.14,
    valence: 0.04,
    luminosity: 0.04,
    arousal: 0.16,
    grit: 0.1,
    secondaryColor: "#ffc145"
  }),
  combo(["aug", "lydian"], "Prism Flare", {
    fracture: 0.16,
    softOrb: 0.14,
    glow: 0.12,
    beamStrength: 0.18,
    symmetry: 0.08,
    depth: 0.1,
    valence: 0.08,
    luminosity: 0.12,
    arousal: 0.16,
    grit: 0.08,
    secondaryColor: "#ff9be8"
  }),
  combo(["lydian", "ii-v-i"], "Skyline Halo", {
    lattice: 0.18,
    beamStrength: 0.16,
    depth: 0.14,
    symmetry: 0.12,
    glow: 0.08,
    valence: 0.12,
    luminosity: 0.16,
    arousal: 0.08,
    grit: -0.06,
    secondaryColor: "#a9d9ff"
  }),
  combo(["phrygian", "dim7"], "Ashen Rite", {
    fracture: 0.22,
    grain: 0.2,
    contrast: 0.16,
    depth: 0.12,
    valence: -0.12,
    luminosity: -0.08,
    arousal: 0.14,
    grit: 0.2,
    backgroundColor: "#05040a"
  }),
  combo(["dorian", "maj7"], "Glass Current", {
    wave: 0.18,
    softOrb: 0.1,
    glow: 0.12,
    rippleStrength: 0.14,
    valence: 0.08,
    luminosity: 0.12,
    arousal: 0.06,
    grit: -0.02,
    secondaryColor: "#b3f7ea"
  }),
  combo(["pentatonic", "maj7"], "Neon Lantern", {
    lattice: 0.18,
    softOrb: 0.12,
    glow: 0.12,
    beamStrength: 0.12,
    valence: 0.12,
    luminosity: 0.14,
    arousal: 0.08,
    grit: 0.02,
    secondaryColor: "#9cf7ff"
  }),
  combo(["melodic minor", "maj7"], "Liquid Aurora", {
    wave: 0.18,
    softOrb: 0.12,
    glow: 0.12,
    complexity: 0.14,
    valence: 0.08,
    luminosity: 0.12,
    arousal: 0.1,
    grit: 0.02,
    secondaryColor: "#79d8ff"
  }),
  combo(["mixolydian", "ii-v-i"], "Copper Skyline", {
    lattice: 0.18,
    beamStrength: 0.18,
    energy: 0.12,
    contrast: 0.1,
    valence: 0.04,
    luminosity: 0.06,
    arousal: 0.14,
    grit: 0.08,
    secondaryColor: "#ffbd72"
  }),
  combo(["lydian", "maj7", "ii-v-i"], "Aurora Choir", {
    softOrb: 0.12,
    lattice: 0.16,
    glow: 0.14,
    beamStrength: 0.22,
    rippleStrength: 0.14,
    depth: 0.18,
    symmetry: 0.18,
    valence: 0.12,
    luminosity: 0.16,
    arousal: 0.08,
    grit: -0.08,
    openness: 0.12,
    cadencePull: 0.14,
    blendCohesion: 0.08,
    secondaryColor: "#d7d0ff"
  }),
  combo(["dorian", "min7", "ii-v-i"], "Blue Velvet Arcade", {
    wave: 0.2,
    lattice: 0.14,
    glow: 0.08,
    rippleStrength: 0.18,
    beamStrength: 0.16,
    depth: 0.18,
    symmetry: 0.08,
    valence: 0.06,
    luminosity: 0.08,
    arousal: 0.1,
    grit: 0.02,
    swing: 0.16,
    gravity: 0.12,
    cadencePull: 0.08,
    blendCohesion: 0.12,
    secondaryColor: "#9cefe2"
  }),
  combo(["harmonic minor", "dim7", "dominant7"], "Ritual Crucible", {
    fracture: 0.24,
    grain: 0.22,
    contrast: 0.18,
    glow: 0.08,
    depth: 0.18,
    pulseDensity: 0.16,
    symmetry: -0.18,
    valence: -0.12,
    luminosity: -0.1,
    arousal: 0.16,
    grit: 0.2,
    attack: 0.16,
    gravity: 0.18,
    modalTension: 0.14,
    backgroundColor: "#04040b"
  }),
  combo(["melodic minor", "dominant7", "aug"], "Prism Engine", {
    wave: 0.14,
    fracture: 0.14,
    lattice: 0.18,
    complexity: 0.2,
    energy: 0.16,
    depth: 0.18,
    pulseDensity: 0.16,
    symmetry: 0.12,
    valence: 0.08,
    luminosity: 0.12,
    arousal: 0.16,
    grit: 0.08,
    attack: 0.12,
    swing: 0.14,
    beamStrength: 0.18,
    blendCohesion: 0.12,
    secondaryColor: "#80dfff"
  }),
  combo(["pentatonic", "mixolydian", "dominant7"], "Voltage Causeway", {
    lattice: 0.18,
    fracture: 0.12,
    beamStrength: 0.22,
    contrast: 0.14,
    energy: 0.18,
    pulseDensity: 0.18,
    motionSpeed: 0.12,
    temperature: 0.1,
    valence: 0.06,
    luminosity: 0.08,
    arousal: 0.18,
    grit: 0.1,
    swing: 0.14,
    attack: 0.08,
    secondaryColor: "#ffd06b"
  })
];

const MOOD_LIBRARY: Record<string, MoodAxes> = {
  major: { valence: 0.78, arousal: 0.52, luminosity: 0.8, grit: 0.16 },
  minor: { valence: 0.36, arousal: 0.34, luminosity: 0.38, grit: 0.28 },
  pentatonic: { valence: 0.64, arousal: 0.72, luminosity: 0.62, grit: 0.24 },
  "harmonic minor": { valence: 0.18, arousal: 0.74, luminosity: 0.28, grit: 0.78 },
  "melodic minor": { valence: 0.58, arousal: 0.68, luminosity: 0.56, grit: 0.42 },
  ionian: { valence: 0.82, arousal: 0.48, luminosity: 0.82, grit: 0.14 },
  dorian: { valence: 0.52, arousal: 0.56, luminosity: 0.48, grit: 0.22 },
  phrygian: { valence: 0.14, arousal: 0.66, luminosity: 0.22, grit: 0.72 },
  lydian: { valence: 0.86, arousal: 0.62, luminosity: 0.88, grit: 0.12 },
  mixolydian: { valence: 0.68, arousal: 0.72, luminosity: 0.68, grit: 0.28 },
  maj7: { valence: 0.8, arousal: 0.44, luminosity: 0.78, grit: 0.1 },
  min7: { valence: 0.48, arousal: 0.34, luminosity: 0.46, grit: 0.18 },
  dominant7: { valence: 0.42, arousal: 0.78, luminosity: 0.56, grit: 0.58 },
  dim7: { valence: 0.08, arousal: 0.88, luminosity: 0.34, grit: 0.86 },
  aug: { valence: 0.32, arousal: 0.92, luminosity: 0.62, grit: 0.74 },
  "ii-v-i": { valence: 0.58, arousal: 0.54, luminosity: 0.6, grit: 0.26 },
  "i-v-vi-iv": { valence: 0.76, arousal: 0.64, luminosity: 0.74, grit: 0.18 }
};

const TRAIT_LIBRARY: Record<string, HarmonicTraits> = {
  major: { openness: 0.78, attack: 0.24, swing: 0.36, gravity: 0.54 },
  minor: { openness: 0.42, attack: 0.38, swing: 0.4, gravity: 0.52 },
  pentatonic: { openness: 0.64, attack: 0.46, swing: 0.58, gravity: 0.36 },
  "harmonic minor": { openness: 0.18, attack: 0.8, swing: 0.24, gravity: 0.76 },
  "melodic minor": { openness: 0.52, attack: 0.62, swing: 0.56, gravity: 0.58 },
  ionian: { openness: 0.8, attack: 0.22, swing: 0.3, gravity: 0.5 },
  dorian: { openness: 0.58, attack: 0.34, swing: 0.72, gravity: 0.4 },
  phrygian: { openness: 0.22, attack: 0.68, swing: 0.28, gravity: 0.72 },
  lydian: { openness: 0.92, attack: 0.26, swing: 0.38, gravity: 0.22 },
  mixolydian: { openness: 0.54, attack: 0.56, swing: 0.78, gravity: 0.42 },
  maj7: { openness: 0.88, attack: 0.18, swing: 0.34, gravity: 0.28 },
  min7: { openness: 0.62, attack: 0.24, swing: 0.56, gravity: 0.36 },
  dominant7: { openness: 0.34, attack: 0.76, swing: 0.52, gravity: 0.8 },
  dim7: { openness: 0.12, attack: 0.92, swing: 0.18, gravity: 0.82 },
  aug: { openness: 0.44, attack: 0.88, swing: 0.48, gravity: 0.62 },
  "ii-v-i": { openness: 0.56, attack: 0.42, swing: 0.66, gravity: 0.94 },
  "i-v-vi-iv": { openness: 0.68, attack: 0.28, swing: 0.54, gravity: 0.58 }
};

export function mapTheoryToVisuals(elements: TheoryElement[]): VisualParameters {
  if (elements.length === 0) {
    return DEFAULT_VISUALS;
  }

  const weightedElements = elements.map((element, index) => ({
    element,
    weight: elementWeight(element, index, elements.length)
  }));
  const totalWeight = weightedElements.reduce((sum, item) => sum + item.weight, 0);

  const visual = {
    color: blendHexes(weightedElements.map(({ element, weight }) => [profileFor(element).color, weight])),
    secondaryColor: blendHexes(weightedElements.map(({ element, weight }) => [profileFor(element).secondaryColor, weight])),
    backgroundColor: blendHexes(weightedElements.map(({ element, weight }) => [profileFor(element).backgroundColor, weight])),
    glow: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).glow),
    contrast: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).contrast),
    energy: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).energy),
    complexity: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).complexity),
    motionSpeed: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).motionSpeed),
    rippleStrength: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).rippleStrength),
    beamStrength: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).beamStrength),
    grain: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).grain),
    particleDensity: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).particleDensity),
    geometryWeights: {
      softOrb: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.softOrb),
      wave: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.wave),
      fracture: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.fracture),
      lattice: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.lattice)
    },
    temperature: weightedAverage(weightedElements, totalWeight, (profileItem) => moodTemperature(profileItem.name)),
    valence: weightedAverage(weightedElements, totalWeight, (profileItem) => moodFor(profileItem.name).valence),
    arousal: weightedAverage(weightedElements, totalWeight, (profileItem) => moodFor(profileItem.name).arousal),
    luminosity: weightedAverage(weightedElements, totalWeight, (profileItem) => moodFor(profileItem.name).luminosity),
    grit: weightedAverage(weightedElements, totalWeight, (profileItem) => moodFor(profileItem.name).grit),
    openness: weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).openness),
    attack: weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).attack),
    swing: weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).swing),
    gravity: weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).gravity),
    synergyResonance: 0,
    cadencePull: 0,
    modalTension: 0,
    blendCohesion: 0,
    symmetry: 0,
    depth: 0,
    pulseDensity: 0,
    signature: elements.length > 1 ? "Composite Pulse" : elements[0].name,
    sceneFamily: "neon-grid" as VisualParameters["sceneFamily"],
    growthImprint: "neutral" as VisualParameters["growthImprint"],
    growthImprintIntensity: 0,
    phraseTrajectory: "neutral" as VisualParameters["phraseTrajectory"],
    phraseTrajectoryIntensity: 0,
    phraseHooks: [] as string[],
    phraseHookEnergy: 0,
    phraseVariation: "neutral" as VisualParameters["phraseVariation"],
    phraseVariationIntensity: 0,
    voiceprints: [] as string[],
    voiceprintIntensity: 0,
    sceneCascade: "neutral" as VisualParameters["sceneCascade"],
    sceneCascadeIntensity: 0,
    activeBonuses: [] as string[],
    activeSynergies: [] as string[]
  };
  visual.symmetry = resolveSymmetry(visual.geometryWeights);
  visual.depth = resolveDepth(visual);
  visual.pulseDensity = resolvePulseDensity(visual);

  const stackBonus = Math.max(0, elements.length - 1) * 0.05;
  visual.glow = clamp01(visual.glow + stackBonus * 0.25);
  visual.contrast = clamp01(visual.contrast + stackBonus * 0.35);
  visual.energy = clamp01(visual.energy + stackBonus * 0.4);
  visual.complexity = clamp01(visual.complexity + stackBonus * 0.6);
  visual.temperature = clamp01(visual.temperature + stackBonus * 0.18);
  visual.valence = clamp01(visual.valence + stackBonus * 0.08);
  visual.arousal = clamp01(visual.arousal + stackBonus * 0.16);
  visual.luminosity = clamp01(visual.luminosity + stackBonus * 0.1);
  visual.grit = clamp01(visual.grit + stackBonus * 0.12);
  visual.openness = clamp01(weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).openness) + stackBonus * 0.06);
  visual.attack = clamp01(weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).attack) + stackBonus * 0.08);
  visual.swing = clamp01(weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).swing) + stackBonus * 0.08);
  visual.gravity = clamp01(weightedAverage(weightedElements, totalWeight, (profileItem) => traitFor(profileItem.name).gravity) + stackBonus * 0.08);
  visual.synergyResonance = clamp01(0.26 + visual.openness * 0.22 + (1 - visual.grit) * 0.16 + visual.depth * 0.18 + stackBonus * 0.1);
  visual.cadencePull = clamp01(0.18 + visual.gravity * 0.32 + stackBonus * 0.08);
  visual.modalTension = clamp01(0.14 + visual.attack * 0.24 + visual.grit * 0.26 + (1 - visual.openness) * 0.12 + stackBonus * 0.06);
  visual.blendCohesion = clamp01(0.24 + visual.openness * 0.16 + visual.depth * 0.14 + (1 - visual.contrast) * 0.08 + stackBonus * 0.08);
  visual.symmetry = clamp01(visual.symmetry + stackBonus * 0.12);
  visual.depth = clamp01(visual.depth + stackBonus * 0.2);
  visual.pulseDensity = clamp01(visual.pulseDensity + stackBonus * 0.22);
  visual.motionSpeed = clamp01(visual.motionSpeed + stackBonus * 0.45);
  visual.rippleStrength = clamp01(visual.rippleStrength + stackBonus * 0.3);
  visual.beamStrength = clamp01(visual.beamStrength + stackBonus * 0.35);
  visual.grain = clamp01(visual.grain + stackBonus * 0.25);
  visual.particleDensity = Math.min(0.95, visual.particleDensity + stackBonus * 0.12);
  visual.geometryWeights.softOrb = clamp01(visual.geometryWeights.softOrb + stackBonus * 0.18);
  visual.geometryWeights.wave = clamp01(visual.geometryWeights.wave + stackBonus * 0.18);
  visual.geometryWeights.fracture = clamp01(visual.geometryWeights.fracture + stackBonus * 0.18);
  visual.geometryWeights.lattice = clamp01(visual.geometryWeights.lattice + stackBonus * 0.18);

  const names = new Set(elements.map((element) => element.name.toLowerCase()));
  for (const comboItem of COMBO_BONUSES) {
    if (comboItem.requires.every((name) => names.has(name))) {
      visual.activeBonuses.push(comboItem.name);
      applyComboEffects(visual, comboItem.effects);
      visual.signature = comboItem.name;
    }
  }

  applyTheorySynergies(elements, names, visual);

  const geometry = dominantGeometry(visual.geometryWeights);
  visual.sceneFamily = inferSceneFamily(
    visual.signature,
    visual.activeBonuses,
    geometry,
    visual.temperature,
    visual.contrast,
    visual.valence,
    visual.luminosity,
    visual.grit
  );
  const sceneCascade = inferSceneCascade(elements, names, visual);
  visual.sceneCascade = sceneCascade.cascade;
  visual.sceneCascadeIntensity = sceneCascade.intensity;
  const phraseTrajectory = inferPhraseTrajectory(elements, visual);
  visual.phraseTrajectory = phraseTrajectory.trajectory;
  visual.phraseTrajectoryIntensity = phraseTrajectory.intensity;
  applyPhraseHooks(elements, visual);
  const voiceprints = resolveVoiceprints(elements, visual);
  const elementRoles = resolveElementRoles(elements);
  const animationState = dominantAnimationState(visual);
  const ringCount = Math.max(2, Math.min(8, Math.floor(2 + visual.rippleStrength * 3 + visual.complexity * 2)));
  const particles = {
    density: Math.min(0.98, round(visual.particleDensity + visual.complexity * 0.16 + visual.energy * 0.08)),
    trail: false,
    size: round(1.0 + visual.complexity * 2.6),
    speed: round(0.4 + visual.energy * 1.35),
    spread: round(0.28 + visual.complexity * 0.34 + visual.energy * 0.18)
  };

  return {
    color: visual.color,
    secondaryColor: visual.secondaryColor,
    backgroundColor: visual.backgroundColor,
    glow: round(visual.glow),
    contrast: round(visual.contrast),
    energy: round(visual.energy),
    complexity: round(visual.complexity),
    temperature: round(visual.temperature),
    valence: round(visual.valence),
    arousal: round(visual.arousal),
    luminosity: round(visual.luminosity),
    grit: round(visual.grit),
    openness: round(visual.openness),
    attack: round(visual.attack),
    swing: round(visual.swing),
    gravity: round(visual.gravity),
    synergyResonance: round(visual.synergyResonance),
    cadencePull: round(visual.cadencePull),
    modalTension: round(visual.modalTension),
    blendCohesion: round(visual.blendCohesion),
    symmetry: round(visual.symmetry),
    depth: round(visual.depth),
    pulseDensity: round(visual.pulseDensity),
    motionSpeed: round(visual.motionSpeed),
    ringCount,
    rippleStrength: round(visual.rippleStrength),
    beamStrength: round(visual.beamStrength),
    grain: round(visual.grain),
    signature: visual.signature,
    sceneFamily: visual.sceneFamily,
    growthImprint: "neutral",
    growthImprintIntensity: 0,
    phraseTrajectory: visual.phraseTrajectory,
    phraseTrajectoryIntensity: round(visual.phraseTrajectoryIntensity),
    phraseHooks: visual.phraseHooks,
    phraseHookEnergy: round(visual.phraseHookEnergy),
    phraseVariation: "neutral",
    phraseVariationIntensity: 0,
    voiceprints,
    voiceprintIntensity: round(resolveVoiceprintIntensity(voiceprints, visual)),
    elementRoles,
    elementRoleIntensity: round(resolveElementRoleIntensity(elementRoles, visual)),
    sceneCascade: visual.sceneCascade,
    sceneCascadeIntensity: round(visual.sceneCascadeIntensity),
    activeBonuses: visual.activeBonuses,
    activeSynergies: visual.activeSynergies,
    particles,
    geometry,
    animationState
  };
}

function profile(
  color: string,
  secondaryColor: string,
  backgroundColor: string,
  glow: number,
  contrast: number,
  energy: number,
  complexity: number,
  motionSpeed: number,
  rippleStrength: number,
  beamStrength: number,
  grain: number,
  particleDensity: number,
  geometryWeights: ElementVisualProfile["geometryWeights"]
): ElementVisualProfile {
  return {
    color,
    secondaryColor,
    backgroundColor,
    glow,
    contrast,
    energy,
    complexity,
    motionSpeed,
    rippleStrength,
    beamStrength,
    grain,
    particleDensity,
    geometryWeights
  };
}

function combo(requires: string[], name: string, effects: Record<string, number | string>) {
  return { requires, name, effects };
}

function profileFor(element: TheoryElement): ElementVisualProfile {
  return PROFILE_LIBRARY[element.name.toLowerCase()] ?? {
    color: DEFAULT_VISUALS.color,
    secondaryColor: DEFAULT_VISUALS.secondaryColor,
    backgroundColor: DEFAULT_VISUALS.backgroundColor,
    glow: DEFAULT_VISUALS.glow,
    contrast: DEFAULT_VISUALS.contrast,
    energy: DEFAULT_VISUALS.energy,
    complexity: DEFAULT_VISUALS.complexity,
    motionSpeed: DEFAULT_VISUALS.motionSpeed,
    rippleStrength: DEFAULT_VISUALS.rippleStrength,
    beamStrength: DEFAULT_VISUALS.beamStrength,
    grain: DEFAULT_VISUALS.grain,
    particleDensity: DEFAULT_VISUALS.particles.density,
    geometryWeights: {
      softOrb: 0.28,
      wave: 0.42,
      fracture: 0.24,
      lattice: 0.6
    }
  };
}

function moodFor(elementName: string): MoodAxes {
  return MOOD_LIBRARY[elementName.toLowerCase()] ?? {
    valence: DEFAULT_VISUALS.valence,
    arousal: DEFAULT_VISUALS.arousal,
    luminosity: DEFAULT_VISUALS.luminosity,
    grit: DEFAULT_VISUALS.grit
  };
}

function traitFor(elementName: string): HarmonicTraits {
  return TRAIT_LIBRARY[elementName.toLowerCase()] ?? {
    openness: DEFAULT_VISUALS.openness,
    attack: DEFAULT_VISUALS.attack,
    swing: DEFAULT_VISUALS.swing,
    gravity: DEFAULT_VISUALS.gravity
  };
}

function elementWeight(element: TheoryElement, index: number, total: number): number {
  const typeWeight: Record<TheoryElement["type"], number> = {
    scale: 0.95,
    mode: 1,
    chord: 1.18,
    progression: 1.34
  };
  const positionalLift = total > 1 ? 1 + (index / Math.max(1, total - 1)) * 0.12 : 1;
  return typeWeight[element.type] * positionalLift;
}

function weightedAverage(
  weightedElements: Array<{ element: TheoryElement; weight: number }>,
  totalWeight: number,
  selector: (element: TheoryElement) => number
): number {
  return weightedElements.reduce((sum, item) => sum + selector(item.element) * item.weight, 0) / totalWeight;
}

function applyComboEffects(
  visual: {
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
    rippleStrength: number;
    beamStrength: number;
    grain: number;
    particleDensity: number;
    geometryWeights: ElementVisualProfile["geometryWeights"];
    signature: string;
    sceneFamily: VisualParameters["sceneFamily"];
    activeBonuses: string[];
    activeSynergies: string[];
  },
  effects: Record<string, number | string>
): void {
  for (const [key, value] of Object.entries(effects)) {
    if (typeof value === "string") {
      if (key === "secondaryColor") {
        visual.secondaryColor = value;
      } else if (key === "backgroundColor") {
        visual.backgroundColor = value;
      }
      continue;
    }

    if (key in visual.geometryWeights) {
      const geometryKey = key as keyof ElementVisualProfile["geometryWeights"];
      visual.geometryWeights[geometryKey] = clamp01(visual.geometryWeights[geometryKey] + value);
      continue;
    }

    const currentValue = visual[key as keyof typeof visual];
    if (typeof currentValue === "number") {
      visual[key as keyof typeof visual] = clamp01(currentValue + value) as never;
    }
  }
}

function applyTheorySynergies(
  elements: TheoryElement[],
  names: Set<string>,
  visual: {
    glow: number;
    contrast: number;
    depth: number;
    rippleStrength: number;
    motionSpeed: number;
    beamStrength: number;
    openness: number;
    attack: number;
    swing: number;
    gravity: number;
    synergyResonance: number;
    cadencePull: number;
    modalTension: number;
    blendCohesion: number;
    symmetry: number;
    secondaryColor: string;
    color: string;
    backgroundColor: string;
    activeSynergies: string[];
  }
): void {
  const types = new Set(elements.map((element) => element.type));

  if ((names.has("lydian") || names.has("ionian") || names.has("major")) && (names.has("maj7") || names.has("major"))) {
    visual.activeSynergies.push("Radiant Voicing");
    visual.synergyResonance = clamp01(visual.synergyResonance + 0.16);
    visual.blendCohesion = clamp01(visual.blendCohesion + 0.12);
    visual.openness = clamp01(visual.openness + 0.08);
    visual.glow = clamp01(visual.glow + 0.06);
    visual.symmetry = clamp01(visual.symmetry + 0.06);
  }

  if (types.has("progression") && types.has("chord")) {
    visual.activeSynergies.push("Cadential Lift");
    visual.cadencePull = clamp01(visual.cadencePull + 0.38);
    visual.synergyResonance = clamp01(visual.synergyResonance + 0.08);
    visual.depth = clamp01(visual.depth + 0.08);
    visual.beamStrength = clamp01(visual.beamStrength + 0.08);
    visual.gravity = clamp01(visual.gravity + 0.08);
  }

  if ((names.has("dorian") || names.has("mixolydian") || names.has("ii-v-i")) && (names.has("min7") || names.has("dominant7"))) {
    visual.activeSynergies.push("Groove Pocket");
    visual.swing = clamp01(visual.swing + 0.16);
    visual.rippleStrength = clamp01(visual.rippleStrength + 0.08);
    visual.motionSpeed = clamp01(visual.motionSpeed + 0.06);
    visual.synergyResonance = clamp01(visual.synergyResonance + 0.1);
  }

  if ((names.has("harmonic minor") || names.has("phrygian")) && (names.has("dim7") || names.has("dominant7") || names.has("aug"))) {
    visual.activeSynergies.push("Shadow Magnet");
    visual.modalTension = clamp01(visual.modalTension + 0.22);
    visual.attack = clamp01(visual.attack + 0.12);
    visual.gravity = clamp01(visual.gravity + 0.1);
    visual.contrast = clamp01(visual.contrast + 0.08);
  }

  if (types.size >= 3) {
    visual.activeSynergies.push("Color Convergence");
    visual.blendCohesion = clamp01(visual.blendCohesion + 0.22);
    visual.depth = clamp01(visual.depth + 0.06);
    visual.secondaryColor = blendHexes([
      [visual.color, 0.45],
      [visual.secondaryColor, 0.35],
      [visual.backgroundColor, 0.2]
    ]);
  }

  if (visual.activeSynergies.length > 1) {
    visual.synergyResonance = clamp01(visual.synergyResonance + 0.08);
    visual.blendCohesion = clamp01(visual.blendCohesion + 0.08);
  }
}

function inferSceneCascade(
  elements: TheoryElement[],
  names: Set<string>,
  visual: {
    signature: string;
    sceneFamily: VisualParameters["sceneFamily"];
    activeBonuses: string[];
    activeSynergies: string[];
    growthImprint: VisualParameters["growthImprint"];
    growthImprintIntensity: number;
    glow: number;
    contrast: number;
    energy: number;
    complexity: number;
    depth: number;
    pulseDensity: number;
    motionSpeed: number;
    rippleStrength: number;
    beamStrength: number;
    grain: number;
    openness: number;
    attack: number;
    swing: number;
    gravity: number;
    modalTension: number;
    blendCohesion: number;
    symmetry: number;
    geometryWeights: ElementVisualProfile["geometryWeights"];
  }
): { cascade: VisualParameters["sceneCascade"]; intensity: number } {
  const text = [visual.signature, ...visual.activeBonuses, ...visual.activeSynergies].join(" ");
  const elementCount = elements.length;
  let cascade: VisualParameters["sceneCascade"] = "neutral";
  let intensity = 0;
  let enhancements: Record<string, number> | null = null;

  if (names.has("lydian") && names.has("maj7") && names.has("ii-v-i")) {
    cascade = "aurora-dais";
    intensity = 0.98;
    enhancements = {
      depth: 0.18,
      beamStrength: 0.18,
      symmetry: 0.16,
      glow: 0.12,
      luminosity: 0.14,
      openness: 0.1,
      blendCohesion: 0.12
    };
  } else if (names.has("dorian") && names.has("min7") && names.has("ii-v-i")) {
    cascade = "velvet-arcade";
    intensity = 0.92;
    enhancements = {
      depth: 0.16,
      rippleStrength: 0.18,
      beamStrength: 0.12,
      wave: 0.14,
      swing: 0.14,
      blendCohesion: 0.14,
      gravity: 0.08
    };
  } else if (names.has("harmonic minor") && names.has("dim7") && names.has("dominant7")) {
    cascade = "eclipse-altar";
    intensity = 0.96;
    enhancements = {
      fracture: 0.16,
      contrast: 0.16,
      grain: 0.18,
      depth: 0.16,
      modalTension: 0.14,
      gravity: 0.12,
      grit: 0.14
    };
  } else if (names.has("melodic minor") && names.has("dominant7") && names.has("aug")) {
    cascade = "prism-vortex";
    intensity = 0.94;
    enhancements = {
      wave: 0.12,
      lattice: 0.16,
      complexity: 0.16,
      depth: 0.16,
      beamStrength: 0.14,
      motionSpeed: 0.12,
      blendCohesion: 0.12
    };
  } else if (names.has("pentatonic") && names.has("mixolydian") && names.has("dominant7")) {
    cascade = "tide-runway";
    intensity = 0.9;
    enhancements = {
      wave: 0.12,
      lattice: 0.14,
      energy: 0.14,
      rippleStrength: 0.16,
      pulseDensity: 0.14,
      motionSpeed: 0.12,
      swing: 0.12
    };
  } else if (containsAny(text, ["Shadow Magnet", "Fracture", "Voltage"]) && visual.growthImprint === "metal-forge") {
    cascade = "forge-ritual";
    intensity = 0.82;
    enhancements = {
      fracture: 0.14,
      beamStrength: 0.12,
      grain: 0.14,
      contrast: 0.1,
      attack: 0.12,
      gravity: 0.08
    };
  } else if (containsAny(text, ["Velvet", "Glass", "Current"]) && visual.growthImprint === "neo-soul-veil") {
    cascade = "velvet-arcade";
    intensity = 0.76;
    enhancements = {
      wave: 0.1,
      glow: 0.1,
      depth: 0.12,
      symmetry: 0.08,
      blendCohesion: 0.1
    };
  } else if (containsAny(text, ["Aurora", "Cadence", "Lattice", "Skyline"]) && elementCount >= 3) {
    cascade = "aurora-dais";
    intensity = 0.78;
    enhancements = {
      beamStrength: 0.12,
      depth: 0.12,
      symmetry: 0.12,
      blendCohesion: 0.1
    };
  } else if (containsAny(text, ["Prism", "Chrome", "Meridian", "Engine"]) && elementCount >= 3) {
    cascade = "prism-vortex";
    intensity = 0.78;
    enhancements = {
      depth: 0.12,
      beamStrength: 0.1,
      motionSpeed: 0.1,
      blendCohesion: 0.1
    };
  } else if (containsAny(text, ["Roadhouse", "Neon", "Run"]) && elementCount >= 3) {
    cascade = "tide-runway";
    intensity = 0.74;
    enhancements = {
      energy: 0.1,
      rippleStrength: 0.12,
      pulseDensity: 0.12,
      motionSpeed: 0.1,
      swing: 0.1
    };
  }

  if (enhancements) {
    const scale = 0.22 + intensity * 0.48;
    applySceneCascadeEnhancements(visual, enhancements, scale);
  }

  return {
    cascade,
    intensity: round(intensity)
  };
}

function inferPhraseTrajectory(
  elements: TheoryElement[],
  visual: {
    cadencePull: number;
    luminosity: number;
    blendCohesion: number;
    swing: number;
    motionSpeed: number;
    energy: number;
    complexity: number;
    attack: number;
    modalTension: number;
    gravity: number;
    depth: number;
  }
): { trajectory: VisualParameters["phraseTrajectory"]; intensity: number } {
  if (elements.length < 2) {
    return { trajectory: "neutral", intensity: 0 };
  }

  const names = elements.map((element) => element.name.toLowerCase());
  const firstName = names[0];
  const lastName = names[names.length - 1];
  const firstType = elements[0]?.type;
  const lastType = elements[elements.length - 1]?.type;

  if (["lydian", "ionian", "major", "maj7"].includes(firstName) && ["ii-v-i", "maj7", "major", "dominant7"].includes(lastName) && visual.cadencePull > 0.72) {
    return { trajectory: "lift-arc", intensity: round(Math.min(1, 0.72 + visual.cadencePull * 0.18 + visual.luminosity * 0.08)) };
  }

  if (["dorian", "min7", "major", "ii-v-i"].includes(firstName) && ["maj7", "min7", "ii-v-i"].includes(lastName) && visual.blendCohesion > 0.62) {
    return { trajectory: "velvet-drift", intensity: round(Math.min(1, 0.68 + visual.blendCohesion * 0.16 + visual.swing * 0.12)) };
  }

  if (["pentatonic", "mixolydian", "major", "i-v-vi-iv"].includes(firstName) && ["dominant7", "ii-v-i", "i-v-vi-iv"].includes(lastName) && visual.motionSpeed > 0.66) {
    return { trajectory: "runway-drive", intensity: round(Math.min(1, 0.72 + visual.motionSpeed * 0.16 + visual.energy * 0.12)) };
  }

  if (["melodic minor", "lydian", "maj7", "dominant7"].includes(firstName) && ["aug", "dominant7", "lydian"].includes(lastName) && visual.complexity > 0.72) {
    return { trajectory: "prism-climb", intensity: round(Math.min(1, 0.7 + visual.complexity * 0.14 + visual.attack * 0.12)) };
  }

  if (["harmonic minor", "phrygian", "dim7", "minor"].includes(firstName) && ["dominant7", "dim7", "aug"].includes(lastName) && visual.modalTension > 0.72) {
    return { trajectory: "forge-drop", intensity: round(Math.min(1, 0.74 + visual.modalTension * 0.14 + visual.gravity * 0.1)) };
  }

  if ((firstType === "progression" || ["dominant7", "dim7", "aug"].includes(firstName)) && (["harmonic minor", "phrygian", "minor", "dim7"].includes(lastName) || lastType === "scale")) {
    return { trajectory: "shadow-sink", intensity: round(Math.min(1, 0.68 + visual.depth * 0.12 + visual.modalTension * 0.12 + visual.gravity * 0.1)) };
  }

  return { trajectory: "neutral", intensity: 0 };
}

function applyPhraseHooks(
  elements: TheoryElement[],
  visual: {
    phraseTrajectoryIntensity: number;
    phraseHooks: string[];
    phraseHookEnergy: number;
    beamStrength: number;
    glow: number;
    openness: number;
    symmetry: number;
    cadencePull: number;
    gravity: number;
    depth: number;
    rippleStrength: number;
    swing: number;
    blendCohesion: number;
    motionSpeed: number;
    energy: number;
    pulseDensity: number;
    modalTension: number;
    contrast: number;
    grain: number;
    grit: number;
    complexity: number;
    attack: number;
    geometryWeights: ElementVisualProfile["geometryWeights"];
  }
): void {
  const hookBonuses: Record<string, Record<string, number>> = {
    "Skyline Rise": { beamStrength: 0.08, glow: 0.06, openness: 0.08, symmetry: 0.06 },
    "Cadence Sweep": { beamStrength: 0.08, cadencePull: 0.1, gravity: 0.06, depth: 0.06 },
    "Velvet Link": { wave: 0.1, rippleStrength: 0.08, swing: 0.1, blendCohesion: 0.08 },
    "Runway Spark": { motionSpeed: 0.1, energy: 0.08, beamStrength: 0.08, pulseDensity: 0.08 },
    "Collapse Gate": { fracture: 0.1, modalTension: 0.1, gravity: 0.08, contrast: 0.06 },
    "Ritual Notch": { grain: 0.1, contrast: 0.08, depth: 0.08, grit: 0.08 },
    "Prism Ladder": { lattice: 0.1, complexity: 0.08, attack: 0.08, motionSpeed: 0.06 }
  };
  const pairLabels: Record<string, string> = {
    "lydian:maj7": "Skyline Rise",
    "maj7:ii-v-i": "Cadence Sweep",
    "dorian:min7": "Velvet Link",
    "pentatonic:mixolydian": "Runway Spark",
    "dominant7:harmonic minor": "Collapse Gate",
    "harmonic minor:dim7": "Ritual Notch",
    "melodic minor:aug": "Prism Ladder"
  };

  let hits = 0;
  for (let index = 0; index < elements.length - 1; index += 1) {
    const key = `${elements[index]?.name.toLowerCase()}:${elements[index + 1]?.name.toLowerCase()}`;
    const label = pairLabels[key];

    if (!label) {
      continue;
    }

    hits += 1;
    visual.phraseHooks.push(label);
    const scale = 0.24 + index * 0.04 + visual.phraseTrajectoryIntensity * 0.18;
    applySceneCascadeEnhancements(visual, hookBonuses[label] ?? {}, scale);
  }

  if (hits > 0) {
    visual.phraseHookEnergy = clamp01(0.22 + hits * 0.18 + visual.phraseTrajectoryIntensity * 0.22 + 0.16);
    visual.depth = clamp01(visual.depth + hits * 0.02);
    visual.motionSpeed = clamp01(visual.motionSpeed + hits * 0.02);
  }
}

function resolveVoiceprints(
  elements: TheoryElement[],
  visual: {
    blendCohesion: number;
    complexity: number;
    sceneCascadeIntensity: number;
    phraseVariationIntensity: number;
  }
): string[] {
  const voiceprintMap: Record<string, string> = {
    major: "Sun Ribbon",
    minor: "Night Ribbon",
    pentatonic: "Neon Ticks",
    "harmonic minor": "Altar Teeth",
    "melodic minor": "Chrome Flow",
    ionian: "Day Arch",
    dorian: "Tide Braid",
    phrygian: "Ember Veil",
    lydian: "Sky Fan",
    mixolydian: "Brass Rails",
    maj7: "Velvet Halo",
    min7: "Dusk Orbit",
    dominant7: "Voltage Spear",
    dim7: "Fracture Crown",
    aug: "Prism Spike",
    "ii-v-i": "Cadence Stairs",
    "i-v-vi-iv": "Anthem Lane"
  };
  const voiceprints: string[] = [];

  elements.forEach((element) => {
    const label = voiceprintMap[element.name.toLowerCase()];
    if (label && !voiceprints.includes(label)) {
      voiceprints.push(label);
    }
  });

  return voiceprints.slice(0, 4);
}

function resolveVoiceprintIntensity(
  voiceprints: string[],
  visual: {
    blendCohesion: number;
    complexity: number;
    sceneCascadeIntensity: number;
    phraseVariationIntensity: number;
  }
): number {
  if (voiceprints.length === 0) {
    return 0;
  }

  return clamp01(
    0.34 +
      voiceprints.length * 0.14 +
      visual.blendCohesion * 0.16 +
      visual.complexity * 0.14 +
      visual.sceneCascadeIntensity * 0.08 +
      visual.phraseVariationIntensity * 0.08
  );
}

function resolveElementRoles(elements: TheoryElement[]): string[] {
  const roleMap: Record<string, string> = {
    major: "Sun Deck",
    minor: "Night Deck",
    pentatonic: "Neon Deck",
    "harmonic minor": "Ritual Deck",
    "melodic minor": "Chrome Deck",
    ionian: "Day Lens",
    dorian: "Tide Lens",
    phrygian: "Ember Lens",
    lydian: "Sky Lens",
    mixolydian: "Brass Lens",
    maj7: "Halo Core",
    min7: "Orbit Core",
    dominant7: "Voltage Core",
    dim7: "Fracture Core",
    aug: "Prism Core",
    "ii-v-i": "Cadence Rail",
    "i-v-vi-iv": "Anthem Rail"
  };

  return elements.map((element) => roleMap[element.name.toLowerCase()] ?? `${element.name} Role`).slice(0, 4);
}

function resolveElementRoleIntensity(
  elementRoles: string[],
  visual: {
    blendCohesion: number;
    sceneCascadeIntensity: number;
    voiceprintIntensity: number;
    phraseTrajectoryIntensity: number;
  }
): number {
  if (elementRoles.length === 0) {
    return 0;
  }

  return clamp01(
    0.3 +
      elementRoles.length * 0.12 +
      visual.blendCohesion * 0.14 +
      visual.sceneCascadeIntensity * 0.08 +
      visual.voiceprintIntensity * 0.08 +
      visual.phraseTrajectoryIntensity * 0.06
  );
}

function applySceneCascadeEnhancements(
  visual: {
    glow: number;
    contrast: number;
    energy: number;
    complexity: number;
    depth: number;
    pulseDensity: number;
    motionSpeed: number;
    rippleStrength: number;
    beamStrength: number;
    grain: number;
    openness: number;
    attack: number;
    swing: number;
    gravity: number;
    modalTension: number;
    blendCohesion: number;
    symmetry: number;
    geometryWeights: ElementVisualProfile["geometryWeights"];
  },
  enhancements: Record<string, number>,
  scale: number
): void {
  for (const [key, value] of Object.entries(enhancements)) {
    if (key in visual.geometryWeights) {
      const geometryKey = key as keyof ElementVisualProfile["geometryWeights"];
      visual.geometryWeights[geometryKey] = clamp01(visual.geometryWeights[geometryKey] + value * scale);
      continue;
    }

    const currentValue = visual[key as keyof typeof visual];
    if (typeof currentValue === "number") {
      visual[key as keyof typeof visual] = clamp01(currentValue + value * scale) as never;
    }
  }
}

function dominantGeometry(weights: ElementVisualProfile["geometryWeights"]): VisualParameters["geometry"] {
  const entries: Array<[VisualParameters["geometry"], number]> = [
    ["soft-orb", weights.softOrb],
    ["wave", weights.wave],
    ["fracture", weights.fracture],
    ["lattice", weights.lattice]
  ];
  return entries.sort((left, right) => right[1] - left[1])[0][0];
}

function dominantAnimationState(visual: {
  energy: number;
  contrast: number;
  glow: number;
  rippleStrength: number;
  motionSpeed: number;
  geometryWeights: ElementVisualProfile["geometryWeights"];
}): VisualParameters["animationState"] {
  if (visual.energy > 0.86 || (visual.geometryWeights.fracture > 0.78 && visual.motionSpeed > 0.78)) {
    return "explosive";
  }

  if (visual.contrast > 0.74 || visual.geometryWeights.fracture > 0.64) {
    return "tense";
  }

  if (visual.energy < 0.48 && visual.geometryWeights.wave > 0.56 && visual.glow < 0.68) {
    return "calm";
  }

  return "flowing";
}

function inferSceneFamily(
  signature: string,
  activeBonuses: string[],
  geometry: VisualParameters["geometry"],
  temperature: number,
  contrast: number,
  valence: number,
  luminosity: number,
  grit: number
): VisualParameters["sceneFamily"] {
  const text = [signature, ...activeBonuses].join(" ");

  if (containsAny(text, ["Velvet", "Silk", "Tide"])) {
    return "velvet-chamber";
  }

  if (containsAny(text, ["Metal", "Shrapnel", "Fracture", "Voltage"])) {
    return text.includes("Occult") ? "shadow-sanctum" : "metal-foundry";
  }

  if (containsAny(text, ["Jazz", "Aurora", "Cadence", "Lattice", "Skyline"])) {
    return "jazz-cathedral";
  }

  if (containsAny(text, ["Prism", "Chrome", "Fusion", "Flare", "Meridian"])) {
    return "prism-array";
  }

  if (containsAny(text, ["Neon", "Roadhouse"])) {
    return "neon-grid";
  }

  if (containsAny(text, ["Celestial", "Sunwake", "Daybreak", "Anthem"])) {
    return "solar-garden";
  }

  if (containsAny(text, ["Midnight", "Blue Hour", "Current", "Run"])) {
    return "nocturne-tide";
  }

  if (geometry === "fracture" && contrast > 0.72) {
    return "metal-foundry";
  }

  if (geometry === "lattice") {
    return temperature < 0.45 ? "jazz-cathedral" : "neon-grid";
  }

  if (geometry === "wave") {
    return "nocturne-tide";
  }

  if (grit > 0.68 && valence < 0.28) {
    return "shadow-sanctum";
  }

  if (luminosity > 0.72 && valence > 0.7) {
    return "solar-garden";
  }

  return temperature >= 0.62 ? "solar-garden" : "velvet-chamber";
}

function moodTemperature(elementName: string): number {
  const name = elementName.toLowerCase();

  if (["major", "ionian", "lydian", "mixolydian", "maj7", "dominant7", "aug", "i-v-vi-iv"].includes(name)) {
    return 0.82;
  }

  if (["minor", "pentatonic", "melodic minor", "dorian", "min7", "ii-v-i", "dim7"].includes(name)) {
    return 0.28;
  }

  return 0.46;
}

function resolveSymmetry(weights: ElementVisualProfile["geometryWeights"]): number {
  return clamp01(weights.softOrb * 0.36 + weights.wave * 0.18 + weights.lattice * 0.42 + (1 - weights.fracture) * 0.22);
}

function resolveDepth(visual: {
  glow: number;
  contrast: number;
  complexity: number;
  rippleStrength: number;
  beamStrength: number;
  luminosity: number;
  valence: number;
}): number {
  return clamp01(
    0.12 +
      visual.glow * 0.18 +
      visual.contrast * 0.08 +
      visual.complexity * 0.22 +
      visual.rippleStrength * 0.16 +
      visual.beamStrength * 0.14 +
      visual.luminosity * 0.12 +
      visual.valence * 0.08
  );
}

function resolvePulseDensity(visual: {
  energy: number;
  motionSpeed: number;
  rippleStrength: number;
  contrast: number;
  arousal: number;
  grit: number;
}): number {
  return clamp01(
    0.1 +
      visual.energy * 0.28 +
      visual.motionSpeed * 0.14 +
      visual.rippleStrength * 0.1 +
      visual.contrast * 0.2 +
      visual.arousal * 0.16 +
      visual.grit * 0.12
  );
}

function blendHexes(weightedHexes: Array<[string, number]>): string {
  const totals = weightedHexes.reduce(
    (sum, [hex, weight]) => {
      const [r, g, b] = hexToRgb(hex);
      sum.r += r * weight;
      sum.g += g * weight;
      sum.b += b * weight;
      sum.weight += weight;
      return sum;
    },
    { r: 0, g: 0, b: 0, weight: 0 }
  );

  return rgbToHex(
    Math.round(totals.r / totals.weight),
    Math.round(totals.g / totals.weight),
    Math.round(totals.b / totals.weight)
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue
    .toString(16)
    .padStart(2, "0")}`;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function containsAny(source: string, needles: string[]): boolean {
  return needles.some((needle) => source.includes(needle));
}
