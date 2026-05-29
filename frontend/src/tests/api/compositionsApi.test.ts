import { afterEach, describe, expect, it, vi } from "vitest";

import { getSavedCompositions, saveComposition, updateComposition } from "../../services/compositionsApi";
import type { TheoryElement } from "../../types/theory";

describe("compositions API service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves a composition and normalizes returned theory elements", async () => {
    const elements: TheoryElement[] = [
      { id: "maj7", type: "chord", name: "Maj7" },
      { id: "dim7", type: "chord", name: "Dim7" }
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 4,
        user_id: 77,
        name: "Maj7 - Dim7",
        elements,
        created_at: "2026-05-29T12:00:00"
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const composition = await saveComposition({
      apiBaseUrl: "http://localhost:8000",
      authToken: "token-123",
      name: "Maj7 - Dim7",
      elements
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/compositions", {
      body: JSON.stringify({
        name: "Maj7 - Dim7",
        elements
      }),
      headers: {
        Authorization: "Bearer token-123",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    expect(composition.id).toBe(4);
    expect(composition.elements[1].name).toBe("Dim7");
  });

  it("loads saved compositions for a user", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        compositions: [
          {
            id: 4,
            user_id: 77,
            name: "Maj7 - Dim7",
            elements: [{ id: "dim7", type: "chord", name: "Dim7" }],
            created_at: "2026-05-29T12:00:00"
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const compositions = await getSavedCompositions({
      apiBaseUrl: "http://localhost:8000",
      authToken: "token-123"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/compositions", {
      headers: {
        Authorization: "Bearer token-123"
      }
    });
    expect(compositions[0].name).toBe("Maj7 - Dim7");
  });

  it("updates an existing composition and normalizes returned elements", async () => {
    const elements: TheoryElement[] = [
      { id: "dim7", type: "chord", name: "Dim7" },
      { id: "ii-v-i", type: "progression", name: "II-V-I" }
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 4,
        user_id: 77,
        name: "Updated Sketch",
        elements,
        created_at: "2026-05-29T12:00:00"
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const composition = await updateComposition({
      apiBaseUrl: "http://localhost:8000",
      compositionId: 4,
      authToken: "token-123",
      name: "Updated Sketch",
      elements
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/compositions/4", {
      body: JSON.stringify({
        name: "Updated Sketch",
        elements
      }),
      headers: {
        Authorization: "Bearer token-123",
        "Content-Type": "application/json"
      },
      method: "PUT"
    });
    expect(composition.name).toBe("Updated Sketch");
    expect(composition.elements[1].name).toBe("II-V-I");
  });
});
