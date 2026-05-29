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
  dorian: {
    color: "#62d2a2",
    glow: 0.64,
    particles: {
      density: 0.58,
      trail: false
    },
    geometry: "wave",
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
