import { describe, expect, it } from "vitest";

import type { VisualParameters } from "../../types/theory";
import { getStageSetpiece } from "../../visual_engine/stageSetpieces";

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
  phraseHooks: ["Skyline Rise"],
  phraseHookEnergy: 0.6,
  sceneCascade: "aurora-dais",
  sceneCascadeIntensity: 0.94,
  activeBonuses: ["Aurora Choir"],
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

describe("stage setpieces", () => {
  it("returns a growth-split setpiece before falling back to cascade defaults", () => {
    const setpiece = getStageSetpiece({
      ...baseVisual,
      activeBonuses: ["Aurora Choir", "Choir Vault"]
    });

    expect(setpiece?.label).toBe("Choir Vault");
    expect(setpiece?.rig).toContain("窗格");
    expect(setpiece?.lighting).toContain("光柱");
  });

  it("falls back to the cascade setpiece when no growth-specific branch is active", () => {
    const setpiece = getStageSetpiece(baseVisual);

    expect(setpiece?.label).toBe("Aurora Dais");
    expect(setpiece?.impact).toContain("礼台");
  });

  it("returns null when neither a cascade nor a split branch is active", () => {
    const setpiece = getStageSetpiece({
      ...baseVisual,
      sceneCascade: "neutral",
      sceneCascadeIntensity: 0,
      activeBonuses: []
    });

    expect(setpiece).toBeNull();
  });
});
