import { describe, expect, it } from "vitest";

import { mapTheoryToVisuals } from "../../visual_engine/mapTheoryToVisuals";
import type { TheoryElement } from "../../types/theory";

describe("visual engine theory mapping", () => {
  it("maps Maj7 to warm glow and soft expansion", () => {
    const element: TheoryElement = { id: "maj7-c", type: "chord", name: "Maj7" };

    const visual = mapTheoryToVisuals([element]);

    expect(visual.color).toMatch(/^#/);
    expect(visual.glow).toBeGreaterThan(0.7);
    expect(visual.geometry).toBe("soft-orb");
    expect(visual.animationState).toBe("flowing");
    expect(visual.sceneFamily).toBe("solar-garden");
  });

  it("maps Dim7 to sharp high-tension fracture visuals", () => {
    const element: TheoryElement = { id: "dim7-c", type: "chord", name: "Dim7" };

    const visual = mapTheoryToVisuals([element]);

    expect(visual.glow).toBeGreaterThan(0.4);
    expect(visual.particles.density).toBeGreaterThan(0.75);
    expect(visual.geometry).toBe("fracture");
    expect(visual.animationState).toBe("tense");
    expect(visual.sceneFamily).toBe("metal-foundry");
  });

  it("stacks multiple theory blocks into combo bonuses and richer signatures", () => {
    const visual = mapTheoryToVisuals([
      { id: "lydian-c", type: "mode", name: "Lydian" },
      { id: "maj7-c", type: "chord", name: "Maj7" }
    ]);

    expect(visual.signature).toBe("Celestial Bloom");
    expect(visual.activeBonuses).toContain("Celestial Bloom");
    expect(visual.glow).toBeGreaterThan(0.9);
    expect(visual.beamStrength).toBeGreaterThan(0.45);
    expect(visual.symmetry).toBeGreaterThan(0.6);
    expect(visual.depth).toBeGreaterThan(0.6);
    expect(visual.sceneFamily).toBe("solar-garden");
  });

  it("pushes high-energy tension combinations toward explosive fracture states", () => {
    const visual = mapTheoryToVisuals([
      { id: "harmonic-minor-c", type: "scale", name: "Harmonic Minor" },
      { id: "dim7-c", type: "chord", name: "Dim7" }
    ]);

    expect(visual.signature).toBe("Occult Fracture");
    expect(visual.activeBonuses).toContain("Occult Fracture");
    expect(visual.geometry).toBe("fracture");
    expect(["tense", "explosive"]).toContain(visual.animationState);
    expect(visual.complexity).toBeGreaterThan(0.85);
    expect(visual.sceneFamily).toBe("shadow-sanctum");
  });

  it("supports expanded combo signatures for melodic-minor dominant blends", () => {
    const visual = mapTheoryToVisuals([
      { id: "melodic-minor", type: "scale", name: "Melodic Minor" },
      { id: "dominant7", type: "chord", name: "Dominant7" }
    ]);

    expect(visual.signature).toBe("Chrome Meridian");
    expect(visual.activeBonuses).toContain("Chrome Meridian");
    expect(visual.energy).toBeGreaterThan(0.85);
    expect(visual.beamStrength).toBeGreaterThan(0.45);
    expect(visual.pulseDensity).toBeGreaterThan(0.7);
    expect(visual.sceneFamily).toBe("prism-array");
  });
});
