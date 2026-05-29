import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TheorySandbox } from "../../pages/TheorySandbox";

const AUTH_PROPS = {
  apiBaseUrl: "http://api.test",
  authToken: "token-123",
  currentUsername: "player-one"
} as const;

describe("TheorySandbox", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a visual-first music theory sandbox", () => {
    render(<TheorySandbox />);

    expect(screen.getByRole("heading", { name: "Scales & Chroma" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Maj7/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Phrygian/ })).toBeInTheDocument();
    expect(screen.getByLabelText("实时音乐视觉舞台")).toBeInTheDocument();
    expect(screen.getByText("Mood Axes")).toBeInTheDocument();
    expect(screen.getAllByText("Valence").length).toBeGreaterThan(0);
  });

  it("renders the complete planned theory element library", () => {
    render(<TheorySandbox />);

    [
      "Major scale",
      "Minor scale",
      "Pentatonic scale",
      "Harmonic Minor scale",
      "Melodic Minor scale",
      "Ionian mode",
      "Dorian mode",
      "Phrygian mode",
      "Lydian mode",
      "Mixolydian mode",
      "Maj7 chord",
      "Min7 chord",
      "Dominant7 chord",
      "Dim7 chord",
      "Aug chord",
      "II-V-I progression",
      "I-V-vi-IV progression"
    ].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
  });

  it("updates visual readout when a theory element is selected", () => {
    render(<TheorySandbox />);

    fireEvent.click(screen.getByRole("button", { name: /Dim7/ }));

    expect(screen.getAllByText("Dim7").length).toBeGreaterThan(0);
    expect(screen.getByText("fracture")).toBeInTheDocument();
    expect(screen.getByText("tense")).toBeInTheDocument();
  });

  it("applies backend-enhanced visuals when an authenticated api session is provided", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      visualResponse: {
        color: "#62d2a2",
        secondary_color: "#9af0dd",
        background_color: "#081018",
        glow: 0.8,
        energy: 0.7,
        complexity: 0.62,
        motion_speed: 0.64,
        ring_count: 4,
        ripple_strength: 0.72,
        beam_strength: 0.48,
        grain: 0.22,
        signature: "Blue Hour Run",
        active_bonuses: ["Blue Hour Run"],
        particles: {
          density: 0.78,
          trail: true,
          size: 2.3,
          speed: 1.25,
          spread: 0.56
        },
        geometry: "wave",
        animation_state: "flowing"
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Trail")).toBeInTheDocument();
    });

    expect(screen.getByText("On")).toBeInTheDocument();
    expect(screen.getAllByText("Blue Hour Run").length).toBeGreaterThan(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/sandbox/render",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        })
      })
    );
  });

  it("records a practice session and shows earned exp", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      practiceHistory: [
        {
          id: 3,
          user_id: 77,
          practice_date: "2026-05-28",
          duration_minutes: 30,
          bpm: 120,
          topic: "Dorian phrasing",
          notes: null,
          created_at: "2026-05-28T12:00:00"
        }
      ],
      practiceResult: {
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
        unlocked_effects: []
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Dorian phrasing")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("练习日期"), { target: { value: "2026-05-29" } });
    fireEvent.change(screen.getByLabelText("练习时长"), { target: { value: "45" } });
    fireEvent.change(screen.getByLabelText("BPM"), { target: { value: "150" } });
    fireEvent.change(screen.getByLabelText("练习主题"), { target: { value: "Pentatonic speed run" } });
    fireEvent.change(screen.getByLabelText("备注"), { target: { value: "Clean triplets" } });
    fireEvent.click(screen.getByRole("button", { name: "记录练习" }));

    await waitFor(() => {
      expect(screen.getByText("+54 EXP")).toBeInTheDocument();
    });
    expect(screen.getByText("Total 125 EXP")).toBeInTheDocument();
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getByText("Streak 3 days")).toBeInTheDocument();
    expect(screen.getByText("Best 7 days")).toBeInTheDocument();
    expect(screen.getByText("Pentatonic speed run")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/practice-records",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        })
      })
    );
  });

  it("filters practice history by topic and date range", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      filteredPracticeHistory: [
        {
          id: 24,
          user_id: 77,
          practice_date: "2026-05-28",
          duration_minutes: 45,
          bpm: 128,
          topic: "II-V-I jazz voice leading",
          notes: null,
          created_at: "2026-05-28T12:00:00"
        }
      ]
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    fireEvent.change(screen.getByLabelText("历史主题"), { target: { value: "jazz" } });
    fireEvent.change(screen.getByLabelText("开始日期"), { target: { value: "2026-05-01" } });
    fireEvent.change(screen.getByLabelText("结束日期"), { target: { value: "2026-05-31" } });
    fireEvent.click(screen.getByRole("button", { name: "筛选历史" }));

    await waitFor(() => {
      expect(screen.getByText("II-V-I jazz voice leading")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/practice-records?limit=5&topic=jazz&date_from=2026-05-01&date_to=2026-05-31",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        })
      })
    );
  });

  it("refreshes sandbox visuals after practice unlocks a new effect", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      visualResponses: [
        {
          color: "#62d2a2",
          glow: 0.8,
          particles: {
            density: 0.58,
            trail: false
          },
          geometry: "wave",
          animation_state: "flowing"
        },
        {
          color: "#62d2a2",
          glow: 0.8,
          particles: {
            density: 0.9,
            trail: true
          },
          geometry: "wave",
          animation_state: "flowing"
        }
      ],
      practiceResult: {
        id: 13,
        user_id: 77,
        practice_date: "2026-05-29",
        duration_minutes: 610,
        bpm: 150,
        topic: "Pentatonic speed run",
        notes: null,
        exp_earned: 732,
        total_exp: 732,
        level: 8,
        current_streak: 1,
        longest_streak: 1,
        unlocked_effects: ["particle_trail", "neon_glow", "dynamic_ripple"]
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Off")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("练习时长"), { target: { value: "610" } });
    fireEvent.change(screen.getByLabelText("BPM"), { target: { value: "150" } });
    fireEvent.change(screen.getByLabelText("练习主题"), { target: { value: "Pentatonic speed run" } });
    fireEvent.click(screen.getByRole("button", { name: "记录练习" }));

    await waitFor(() => {
      expect(screen.getByText("On")).toBeInTheDocument();
    });
    expect(screen.getByText("Unlocked particle_trail")).toBeInTheDocument();
    expect(screen.getByText("Unlocked neon_glow")).toBeInTheDocument();
    expect(screen.getByText("Unlocked dynamic_ripple")).toBeInTheDocument();
  });

  it("loads and displays skill tree progression", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        skillTree: {
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
        }
      })
    );

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Growth")).toBeInTheDocument();
    });
    expect(screen.getByText("Jazz")).toBeInTheDocument();
    expect(screen.getAllByText("II-V-I").length).toBeGreaterThan(1);
    expect(screen.getByText("Lv 2")).toBeInTheDocument();
  });

  it("loads and displays unlocked visual effects", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        unlockedEffects: [
          {
            id: 9,
            effect_name: "particle_trail",
            unlocked_at: "2026-05-29T12:00:00",
            trigger_condition: "五声音阶累计练习达到 10 小时"
          }
        ]
      })
    );

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Unlocked Effects")).toBeInTheDocument();
    });
    expect(screen.getByText("粒子拖尾")).toBeInTheDocument();
    expect(screen.getByText("拖尾粒子会延长动作残影，让速度感更明显。")).toBeInTheDocument();
    expect(screen.getByText("五声音阶累计练习达到 10 小时")).toBeInTheDocument();
  });

  it("shows readable bonus notes when the backend returns a signature bonus", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        visualResponse: {
          color: "#ffe56d",
          secondary_color: "#8fdcff",
          background_color: "#0f1117",
          glow: 0.92,
          energy: 0.78,
          complexity: 0.58,
          motion_speed: 0.62,
          ring_count: 5,
          ripple_strength: 0.74,
          beam_strength: 0.62,
          grain: 0.18,
          signature: "Celestial Bloom",
          active_bonuses: ["Celestial Bloom"],
          particles: {
            density: 0.72,
            trail: false,
            size: 2.4,
            speed: 1.2,
            spread: 0.58
          },
          geometry: "soft-orb",
          animation_state: "flowing"
        }
      })
    );

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getAllByText("Celestial Bloom").length).toBeGreaterThan(1);
    });
    expect(screen.getByText("Lydian 与 Maj7 叠出更明亮、更抬升的和声光晕。")).toBeInTheDocument();
  });

  it("renders a readable stage interpretation from visual parameters", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        visualResponse: {
          color: "#ffe56d",
          secondary_color: "#8fdcff",
          background_color: "#0f1117",
          glow: 0.92,
          energy: 0.78,
          complexity: 0.58,
          temperature: 0.82,
          symmetry: 0.88,
          depth: 0.81,
          pulse_density: 0.64,
          motion_speed: 0.62,
          ring_count: 5,
          ripple_strength: 0.74,
          beam_strength: 0.62,
          grain: 0.18,
          signature: "Celestial Bloom",
          active_bonuses: ["Celestial Bloom"],
          particles: {
            density: 0.72,
            trail: false,
            size: 2.4,
            speed: 1.2,
            spread: 0.58
          },
          geometry: "soft-orb",
          animation_state: "flowing"
        }
      })
    );

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Stage Reading")).toBeInTheDocument();
    });
    expect(screen.getByText(/当前舞台由 Ionian 主导/)).toBeInTheDocument();
    expect(screen.getByText("偏暖，情绪保持暧昧，柔亮扩散。")).toBeInTheDocument();
    expect(screen.getByText(/层次很深/)).toBeInTheDocument();
    expect(screen.getByText("日光穹庭")).toBeInTheDocument();
  });

  it("loads and displays yearly practice heatmap entries", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        heatmap: {
          user_id: 77,
          year: 2026,
          days: [
            {
              date: "2026-01-01",
              duration_minutes: 0,
              exp: 0
            },
            {
              date: "2026-05-29",
              duration_minutes: 45,
              exp: 54
            },
            {
              date: "2026-12-31",
              duration_minutes: 0,
              exp: 0
            }
          ]
        }
      })
    );

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Heatmap")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("年度练习热力图").children).toHaveLength(3);
    expect(screen.getByText("2026-05-29")).toBeInTheDocument();
    expect(screen.getByText("54 EXP")).toBeInTheDocument();
  });

  it("saves and reloads sandbox compositions", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        savedCompositions: [
          {
            id: 4,
            user_id: 77,
            name: "Saved Dim7",
            elements: [{ id: "dim7", type: "chord", name: "Dim7" }],
            created_at: "2026-05-29T12:00:00"
          }
        ],
        saveCompositionResponse: {
          id: 5,
          user_id: 77,
          name: "Maj7",
          elements: [{ id: "maj7", type: "chord", name: "Maj7" }],
          created_at: "2026-05-29T12:01:00"
        }
      })
    );

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Saved Dim7")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "保存组合" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Maj7")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Saved Dim7" }));

    expect(screen.getAllByText("Dim7").length).toBeGreaterThan(1);
    expect(screen.getByText("fracture")).toBeInTheDocument();
  });

  it("supports naming and overwriting a saved composition", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      savedCompositions: [
        {
          id: 4,
          user_id: 77,
          name: "Saved Dim7",
          elements: [{ id: "dim7", type: "chord", name: "Dim7" }],
          created_at: "2026-05-29T12:00:00"
        }
      ],
      saveCompositionResponse: {
        id: 5,
        user_id: 77,
        name: "Custom Stack",
        elements: [{ id: "maj7", type: "chord", name: "Maj7" }],
        created_at: "2026-05-29T12:01:00"
      },
      updateCompositionResponse: {
        id: 4,
        user_id: 77,
        name: "Dim7 Reloaded",
        elements: [{ id: "maj7", type: "chord", name: "Maj7" }],
        created_at: "2026-05-29T12:00:00"
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Saved Dim7")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("组合名称"), { target: { value: "Custom Stack" } });
    fireEvent.click(screen.getByRole("button", { name: "保存组合" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Custom Stack")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Saved Dim7" }));
    fireEvent.change(screen.getByLabelText("组合名称"), { target: { value: "Dim7 Reloaded" } });
    fireEvent.click(screen.getByRole("button", { name: "覆盖当前组合" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dim7 Reloaded")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/compositions/4",
      expect.objectContaining({
        method: "PUT"
      })
    );
  });

  it("deletes a saved composition from the list", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      savedCompositions: [
        {
          id: 4,
          user_id: 77,
          name: "Saved Dim7",
          elements: [{ id: "dim7", type: "chord", name: "Dim7" }],
          created_at: "2026-05-29T12:00:00"
        }
      ]
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Saved Dim7")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "删除组合 Saved Dim7" }));

    await waitFor(() => {
      expect(screen.queryByText("Saved Dim7")).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/compositions/4",
      expect.objectContaining({
        method: "DELETE"
      })
    );
  });
});

interface TheorySandboxFetchOptions {
  visualResponse?: {
    color: string;
    secondary_color?: string;
    background_color?: string;
    glow: number;
    energy?: number;
    complexity?: number;
    temperature?: number;
    symmetry?: number;
    depth?: number;
    pulse_density?: number;
    motion_speed?: number;
    ring_count?: number;
    ripple_strength?: number;
    beam_strength?: number;
    grain?: number;
    signature?: string;
    active_bonuses?: string[];
    particles: {
      density: number;
      trail: boolean;
      size?: number;
      speed?: number;
      spread?: number;
    };
    geometry: string;
    animation_state: string;
  };
  visualResponses?: Array<{
    color: string;
    secondary_color?: string;
    background_color?: string;
    glow: number;
    energy?: number;
    complexity?: number;
    temperature?: number;
    symmetry?: number;
    depth?: number;
    pulse_density?: number;
    motion_speed?: number;
    ring_count?: number;
    ripple_strength?: number;
    beam_strength?: number;
    grain?: number;
    signature?: string;
    active_bonuses?: string[];
    particles: {
      density: number;
      trail: boolean;
      size?: number;
      speed?: number;
      spread?: number;
    };
    geometry: string;
    animation_state: string;
  }>;
  practiceHistory?: Array<Record<string, unknown>>;
  filteredPracticeHistory?: Array<Record<string, unknown>>;
  practiceResult?: Record<string, unknown>;
  skillTree?: {
    user_id: number;
    branches: Array<Record<string, unknown>>;
  };
  unlockedEffects?: Array<Record<string, unknown>>;
  heatmap?: {
    user_id: number;
    year: number;
    days: Array<Record<string, unknown>>;
  };
  savedCompositions?: Array<Record<string, unknown>>;
  saveCompositionResponse?: Record<string, unknown>;
  updateCompositionResponse?: Record<string, unknown>;
  deleteCompositionStatus?: number;
}

function createAuthenticatedFetchMock(options: TheorySandboxFetchOptions = {}) {
  let renderIndex = 0;

  return vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const requestUrl = new URL(url);
    const method = init?.method ?? "GET";

    if (requestUrl.pathname === "/sandbox/render") {
      const payload =
        options.visualResponses?.[Math.min(renderIndex++, options.visualResponses.length - 1)] ??
        options.visualResponse ?? {
          color: "#ffb45c",
          secondary_color: "#ff89b5",
          background_color: "#160e0d",
          glow: 0.86,
          energy: 0.64,
          complexity: 0.34,
          motion_speed: 0.48,
          ring_count: 3,
          ripple_strength: 0.34,
          beam_strength: 0.3,
          grain: 0.14,
          signature: "Maj7",
          active_bonuses: [],
          particles: {
            density: 0.52,
            trail: false,
            size: 2.1,
            speed: 1.1,
            spread: 0.46
          },
          geometry: "soft-orb",
          animation_state: "flowing"
        };

      return Promise.resolve(okJson(payload));
    }

    if (requestUrl.pathname === "/practice-records" && method === "POST") {
      return Promise.resolve(
        okJson(
          options.practiceResult ?? {
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
            unlocked_effects: []
          }
        )
      );
    }

    if (requestUrl.pathname === "/practice-records" && method === "GET") {
      const records =
        requestUrl.searchParams.get("topic") || requestUrl.searchParams.get("date_from") || requestUrl.searchParams.get("date_to")
          ? options.filteredPracticeHistory ?? []
          : options.practiceHistory ?? [];
      return Promise.resolve(okJson({ records }));
    }

    if (requestUrl.pathname === "/skill-tree") {
      return Promise.resolve(
        okJson(
          options.skillTree ?? {
            user_id: 77,
            branches: []
          }
        )
      );
    }

    if (requestUrl.pathname === "/unlocked-effects") {
      return Promise.resolve(
        okJson({
          user_id: 77,
          effects: options.unlockedEffects ?? []
        })
      );
    }

    if (requestUrl.pathname === "/heatmap/yearly") {
      return Promise.resolve(
        okJson(
          options.heatmap ?? {
            user_id: 77,
            year: 2026,
            days: []
          }
        )
      );
    }

    if (requestUrl.pathname === "/compositions" && method === "GET") {
      return Promise.resolve(
        okJson({
          compositions: options.savedCompositions ?? []
        })
      );
    }

    if (requestUrl.pathname === "/compositions" && method === "POST") {
      return Promise.resolve(
        okJson(
          options.saveCompositionResponse ?? {
            id: 5,
            user_id: 77,
            name: "Maj7",
            elements: [{ id: "maj7", type: "chord", name: "Maj7" }],
            created_at: "2026-05-29T12:01:00"
          }
        )
      );
    }

    if (requestUrl.pathname === "/compositions/4") {
      if (method === "PUT") {
        return Promise.resolve(
          okJson(
            options.updateCompositionResponse ?? {
              id: 4,
              user_id: 77,
              name: "Updated Sketch",
              elements: [{ id: "maj7", type: "chord", name: "Maj7" }],
              created_at: "2026-05-29T12:00:00"
            }
          )
        );
      }

      if (method === "DELETE") {
        return Promise.resolve({
          ok: (options.deleteCompositionStatus ?? 204) < 400,
          status: options.deleteCompositionStatus ?? 204,
          json: async () => ({})
        });
      }
    }

    return Promise.resolve(
      okJson({
        color: "#ffb45c",
        secondary_color: "#ff89b5",
        background_color: "#160e0d",
        glow: 0.86,
        energy: 0.64,
        complexity: 0.34,
        motion_speed: 0.48,
        ring_count: 3,
        ripple_strength: 0.34,
        beam_strength: 0.3,
        grain: 0.14,
        signature: "Maj7",
        active_bonuses: [],
        particles: {
          density: 0.52,
          trail: false,
          size: 2.1,
          speed: 1.1,
          spread: 0.46
        },
        geometry: "soft-orb",
        animation_state: "flowing"
      })
    );
  });
}

function okJson(payload: unknown) {
  return {
    ok: true,
    json: async () => payload
  };
}
