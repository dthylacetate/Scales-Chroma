import { afterEach, describe, expect, it, vi } from "vitest";

import { createPracticeRecord } from "../../services/practiceRecordsApi";

describe("practice records API service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a practice record and normalizes the earned exp response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 12,
        user_id: 77,
        practice_date: "2026-05-29",
        duration_minutes: 45,
        bpm: 150,
        topic: "Pentatonic speed run",
        notes: "Clean triplets",
        exp_earned: 54,
        total_exp: 125,
        level: 2
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const record = await createPracticeRecord({
      apiBaseUrl: "http://localhost:8000",
      userId: 77,
      practiceDate: "2026-05-29",
      durationMinutes: 45,
      bpm: 150,
      topic: "Pentatonic speed run",
      notes: "Clean triplets"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/practice-records", {
      body: JSON.stringify({
        user_id: 77,
        practice_date: "2026-05-29",
        duration_minutes: 45,
        bpm: 150,
        topic: "Pentatonic speed run",
        notes: "Clean triplets"
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    expect(record.expEarned).toBe(54);
    expect(record.totalExp).toBe(125);
    expect(record.level).toBe(2);
    expect(record.durationMinutes).toBe(45);
  });

  it("throws a readable error when practice record creation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422
      })
    );

    await expect(
      createPracticeRecord({
        apiBaseUrl: "http://localhost:8000",
        userId: 77,
        practiceDate: "2026-05-29",
        durationMinutes: 0,
        bpm: 120,
        topic: "Dorian phrasing"
      })
    ).rejects.toThrow("Practice record request failed with status 422");
  });
});
