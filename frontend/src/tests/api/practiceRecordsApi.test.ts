import { afterEach, describe, expect, it, vi } from "vitest";

import { createPracticeRecord, getPracticeRecords } from "../../services/practiceRecordsApi";

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
        level: 2,
        current_streak: 3,
        longest_streak: 7,
        unlocked_effects: ["particle_trail", "neon_glow"]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const record = await createPracticeRecord({
      apiBaseUrl: "http://localhost:8000",
      authToken: "token-123",
      practiceDate: "2026-05-29",
      durationMinutes: 45,
      bpm: 150,
      topic: "Pentatonic speed run",
      notes: "Clean triplets"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/practice-records", {
      body: JSON.stringify({
        practice_date: "2026-05-29",
        duration_minutes: 45,
        bpm: 150,
        topic: "Pentatonic speed run",
        notes: "Clean triplets"
      }),
      headers: {
        Authorization: "Bearer token-123",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    expect(record.expEarned).toBe(54);
    expect(record.totalExp).toBe(125);
    expect(record.level).toBe(2);
    expect(record.currentStreak).toBe(3);
    expect(record.longestStreak).toBe(7);
    expect(record.unlockedEffects).toEqual(["particle_trail", "neon_glow"]);
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
        authToken: "token-123",
        practiceDate: "2026-05-29",
        durationMinutes: 0,
        bpm: 120,
        topic: "Dorian phrasing"
      })
    ).rejects.toThrow("Practice record request failed with status 422");
  });

  it("loads recent practice records for a user", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        records: [
          {
            id: 12,
            user_id: 77,
            practice_date: "2026-05-29",
            duration_minutes: 45,
            bpm: 150,
            topic: "Pentatonic speed run",
            notes: "Clean triplets",
            created_at: "2026-05-29T12:00:00"
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const records = await getPracticeRecords({
      apiBaseUrl: "http://localhost:8000",
      authToken: "token-123",
      limit: 5
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/practice-records?limit=5", {
      headers: {
        Authorization: "Bearer token-123"
      }
    });
    expect(records[0].topic).toBe("Pentatonic speed run");
    expect(records[0].durationMinutes).toBe(45);
  });

  it("loads filtered practice records with topic and date range query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        records: []
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    await getPracticeRecords({
      apiBaseUrl: "http://localhost:8000",
      authToken: "token-123",
      limit: 20,
      topic: "jazz",
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/practice-records?limit=20&topic=jazz&date_from=2026-05-01&date_to=2026-05-31",
      {
        headers: {
          Authorization: "Bearer token-123"
        }
      }
    );
  });
});
