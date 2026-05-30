import { describe, expect, it } from "vitest";

import type { VisualParameters } from "../../types/theory";
import { getStagePhraseVariation } from "../../visual_engine/stagePhraseVariations";

const baseVisual: VisualParameters = {
  color: "#ffd166",
  secondaryColor: "#c2b8ff",
  backgroundColor: "#081018",
  glow: 0.82,
  contrast: 0.54,
  energy: 0.72,
  complexity: 0.68,
  temperature: 0.62,
  valence: 0.8,
  arousal: 0.74,
  luminosity: 0.82,
  grit: 0.24,
  openness: 0.82,
  attack: 0.32,
  swing: 0.64,
  gravity: 0.46,
  synergyResonance: 0.76,
  cadencePull: 0.7,
  modalTension: 0.28,
  blendCohesion: 0.78,
  symmetry: 0.78,
  depth: 0.82,
  pulseDensity: 0.72,
  motionSpeed: 0.68,
  ringCount: 5,
  rippleStrength: 0.72,
  beamStrength: 0.66,
  grain: 0.2,
  signature: "Aurora Choir",
  sceneFamily: "solar-garden",
  growthImprint: "jazz-lattice",
  growthImprintIntensity: 0.88,
  phraseTrajectory: "lift-arc",
  phraseTrajectoryIntensity: 0.86,
  phraseHooks: ["Skyline Rise", "Cadence Sweep"],
  phraseHookEnergy: 0.78,
  phraseVariation: "choir-step",
  phraseVariationIntensity: 0.9,
  sceneCascade: "aurora-dais",
  sceneCascadeIntensity: 0.94,
  activeBonuses: ["Aurora Choir", "Choir Step"],
  activeSynergies: ["Cadential Lift"],
  particles: {
    density: 0.7,
    trail: false,
    size: 2.2,
    speed: 1.1,
    spread: 0.56
  },
  geometry: "lattice",
  animationState: "flowing"
};

describe("stage phrase variations", () => {
  it("returns a named phrase variation when growth rewrites the phrase system", () => {
    const variation = getStagePhraseVariation(baseVisual);

    expect(variation?.label).toBe("Choir Step");
    expect(variation?.rewrite).toContain("合唱席");
  });

  it("resolves fusion phrase spirals for prismatic growth rewrites", () => {
    const variation = getStagePhraseVariation({
      ...baseVisual,
      phraseVariation: "phase-spiral",
      phraseVariationIntensity: 0.84
    });

    expect(variation?.label).toBe("Phase Spiral");
    expect(variation?.impact).toContain("自旋");
  });

  it("returns null when no phrase rewrite is active", () => {
    const variation = getStagePhraseVariation({
      ...baseVisual,
      phraseVariation: "neutral",
      phraseVariationIntensity: 0
    });

    expect(variation).toBeNull();
  });
});
