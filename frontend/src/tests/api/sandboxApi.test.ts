import { afterEach, describe, expect, it, vi } from "vitest";

import { renderSandboxVisual } from "../../services/sandboxApi";
import type { TheoryElement } from "../../types/theory";

describe("sandbox API service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts theory elements with bearer auth and normalizes visual response fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        color: "#ffd166",
        glow: 0.92,
        scene_family: "solar-garden",
        growth_imprint: "jazz-lattice",
        growth_imprint_intensity: 0.86,
        phrase_trajectory: "lift-arc",
        phrase_trajectory_intensity: 0.84,
        phrase_hooks: ["Skyline Rise", "Cadence Sweep"],
        phrase_hook_energy: 0.79,
        phrase_variation: "choir-step",
        phrase_variation_intensity: 0.9,
        scene_cascade: "aurora-dais",
        scene_cascade_intensity: 0.91,
        openness: 0.81,
        attack: 0.32,
        swing: 0.66,
        gravity: 0.41,
        synergy_resonance: 0.74,
        cadence_pull: 0.68,
        modal_tension: 0.26,
        blend_cohesion: 0.72,
        active_synergies: ["Cadential Lift", "Radiant Voicing"],
        particles: {
          density: 0.74,
          trail: true
        },
        geometry: "soft-orb",
        animation_state: "flowing"
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const elements: TheoryElement[] = [{ id: "maj7", type: "chord", name: "Maj7" }];
    const visual = await renderSandboxVisual({
      apiBaseUrl: "http://localhost:8000",
      authToken: "token-123",
      elements,
      previewGrowthImprint: "jazz-lattice"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/sandbox/render", {
      body: JSON.stringify({
        elements,
        preview_growth_imprint: "jazz-lattice"
      }),
      headers: {
        Authorization: "Bearer token-123",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    expect(visual.animationState).toBe("flowing");
    expect(visual.particles.trail).toBe(true);
    expect(visual.temperature).toBe(0.5);
    expect(visual.pulseDensity).toBe(0.48);
    expect(visual.sceneFamily).toBe("solar-garden");
    expect(visual.growthImprint).toBe("jazz-lattice");
    expect(visual.growthImprintIntensity).toBe(0.86);
    expect(visual.phraseTrajectory).toBe("lift-arc");
    expect(visual.phraseTrajectoryIntensity).toBe(0.84);
    expect(visual.phraseHooks).toEqual(["Skyline Rise", "Cadence Sweep"]);
    expect(visual.phraseHookEnergy).toBe(0.79);
    expect(visual.phraseVariation).toBe("choir-step");
    expect(visual.phraseVariationIntensity).toBe(0.9);
    expect(visual.sceneCascade).toBe("aurora-dais");
    expect(visual.sceneCascadeIntensity).toBe(0.91);
    expect(visual.openness).toBe(0.81);
    expect(visual.attack).toBe(0.32);
    expect(visual.swing).toBe(0.66);
    expect(visual.gravity).toBe(0.41);
    expect(visual.synergyResonance).toBe(0.74);
    expect(visual.cadencePull).toBe(0.68);
    expect(visual.modalTension).toBe(0.26);
    expect(visual.blendCohesion).toBe(0.72);
    expect(visual.activeSynergies).toContain("Cadential Lift");
  });

  it("throws a readable error when sandbox rendering fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422
      })
    );

    await expect(
      renderSandboxVisual({
        apiBaseUrl: "http://localhost:8000",
        elements: [{ id: "empty", type: "scale", name: "Major" }]
      })
    ).rejects.toThrow("Sandbox render request failed with status 422");
  });
});
