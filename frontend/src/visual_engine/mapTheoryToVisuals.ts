import type { TheoryElement, VisualParameters } from "../types/theory";

const DEFAULT_VISUALS: VisualParameters = {
  color: "#7bdff2",
  glow: 0.55,
  particles: {
    density: 0.4,
    trail: false
  },
  geometry: "lattice",
  animationState: "flowing"
};

const THEORY_VISUALS: Record<string, VisualParameters> = {
  major: {
    color: "#f6e27f",
    glow: 0.58,
    particles: {
      density: 0.38,
      trail: false
    },
    geometry: "soft-orb",
    animationState: "flowing"
  },
  minor: {
    color: "#7b8cff",
    glow: 0.48,
    particles: {
      density: 0.46,
      trail: false
    },
    geometry: "wave",
    animationState: "calm"
  },
  pentatonic: {
    color: "#00d4ff",
    glow: 0.6,
    particles: {
      density: 0.5,
      trail: false
    },
    geometry: "lattice",
    animationState: "flowing"
  },
  "harmonic minor": {
    color: "#d6457a",
    glow: 0.68,
    particles: {
      density: 0.72,
      trail: false
    },
    geometry: "fracture",
    animationState: "tense"
  },
  "melodic minor": {
    color: "#47c9af",
    glow: 0.62,
    particles: {
      density: 0.58,
      trail: false
    },
    geometry: "wave",
    animationState: "flowing"
  },
  ionian: {
    color: "#f8d66d",
    glow: 0.56,
    particles: {
      density: 0.36,
      trail: false
    },
    geometry: "soft-orb",
    animationState: "flowing"
  },
  dorian: {
    color: "#62d2a2",
    glow: 0.64,
    particles: {
      density: 0.58,
      trail: false
    },
    geometry: "wave",
    animationState: "flowing"
  },
  phrygian: {
    color: "#394052",
    glow: 0.42,
    particles: {
      density: 0.45,
      trail: false
    },
    geometry: "wave",
    animationState: "calm"
  },
  lydian: {
    color: "#ffe66d",
    glow: 0.7,
    particles: {
      density: 0.5,
      trail: false
    },
    geometry: "soft-orb",
    animationState: "flowing"
  },
  mixolydian: {
    color: "#ff9f1c",
    glow: 0.66,
    particles: {
      density: 0.6,
      trail: false
    },
    geometry: "lattice",
    animationState: "flowing"
  },
  maj7: {
    color: "#ffb45c",
    glow: 0.86,
    particles: {
      density: 0.52,
      trail: false
    },
    geometry: "soft-orb",
    animationState: "flowing"
  },
  min7: {
    color: "#7bdff2",
    glow: 0.62,
    particles: {
      density: 0.5,
      trail: false
    },
    geometry: "wave",
    animationState: "calm"
  },
  dominant7: {
    color: "#f25f5c",
    glow: 0.72,
    particles: {
      density: 0.68,
      trail: false
    },
    geometry: "fracture",
    animationState: "tense"
  },
  dim7: {
    color: "#d7f7ff",
    glow: 0.62,
    particles: {
      density: 0.88,
      trail: false
    },
    geometry: "fracture",
    animationState: "tense"
  },
  aug: {
    color: "#ff6bcb",
    glow: 0.76,
    particles: {
      density: 0.74,
      trail: false
    },
    geometry: "fracture",
    animationState: "explosive"
  },
  "ii-v-i": {
    color: "#b8f2e6",
    glow: 0.64,
    particles: {
      density: 0.62,
      trail: false
    },
    geometry: "wave",
    animationState: "flowing"
  },
  "i-v-vi-iv": {
    color: "#ffcf6e",
    glow: 0.66,
    particles: {
      density: 0.54,
      trail: false
    },
    geometry: "soft-orb",
    animationState: "flowing"
  }
};

export function mapTheoryToVisuals(elements: TheoryElement[]): VisualParameters {
  const primaryElement = elements[0];

  if (!primaryElement) {
    return DEFAULT_VISUALS;
  }

  return THEORY_VISUALS[primaryElement.name.toLowerCase()] ?? DEFAULT_VISUALS;
}
