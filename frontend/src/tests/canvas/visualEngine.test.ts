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
  });

  it("maps Dim7 to sharp high-tension fracture visuals", () => {
    const element: TheoryElement = { id: "dim7-c", type: "chord", name: "Dim7" };

    const visual = mapTheoryToVisuals([element]);

    expect(visual.glow).toBeGreaterThan(0.4);
    expect(visual.particles.density).toBeGreaterThan(0.75);
    expect(visual.geometry).toBe("fracture");
    expect(visual.animationState).toBe("tense");
  });
});
