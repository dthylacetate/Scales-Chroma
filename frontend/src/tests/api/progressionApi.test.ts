import { afterEach, describe, expect, it, vi } from "vitest";

import { getSkillTree, getYearlyHeatmap } from "../../services/progressionApi";

describe("progression API service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads a yearly heatmap and normalizes day fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user_id: 77,
        year: 2026,
        days: [
          {
            date: "2026-05-29",
            duration_minutes: 45,
            exp: 54
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const heatmap = await getYearlyHeatmap({
      apiBaseUrl: "http://localhost:8000",
      userId: 77,
      year: 2026
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/heatmap/yearly?user_id=77&year=2026");
    expect(heatmap.userId).toBe(77);
    expect(heatmap.days[0]).toEqual({
      date: "2026-05-29",
      durationMinutes: 45,
      exp: 54
    });
  });

  it("loads skill tree branches with node levels", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user_id: 77,
        branches: [
          {
            direction: "Jazz",
            nodes: [
              {
                id: "ii-v-i",
                label: "II-V-I",
                level: 2,
                unlocked: true
              }
            ]
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const skillTree = await getSkillTree({
      apiBaseUrl: "http://localhost:8000",
      userId: 77
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/skill-tree?user_id=77");
    expect(skillTree.userId).toBe(77);
    expect(skillTree.branches[0].nodes[0].level).toBe(2);
  });

  it("throws readable errors when progression requests fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })
    );

    await expect(
      getYearlyHeatmap({
        apiBaseUrl: "http://localhost:8000",
        userId: 77,
        year: 2026
      })
    ).rejects.toThrow("Yearly heatmap request failed with status 500");
  });
});
