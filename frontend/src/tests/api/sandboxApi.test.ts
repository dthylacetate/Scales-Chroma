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
        openness: 0.81,
        attack: 0.32,
        swing: 0.66,
        gravity: 0.41,
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
      elements
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/sandbox/render", {
      body: JSON.stringify({
        elements
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
    expect(visual.openness).toBe(0.81);
    expect(visual.attack).toBe(0.32);
    expect(visual.swing).toBe(0.66);
    expect(visual.gravity).toBe(0.41);
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
