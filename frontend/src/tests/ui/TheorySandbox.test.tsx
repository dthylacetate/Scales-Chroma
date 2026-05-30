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
        growth_imprint: "jazz-lattice",
        growth_imprint_intensity: 0.84,
        phrase_trajectory: "velvet-drift",
        phrase_trajectory_intensity: 0.74,
        phrase_hooks: ["Velvet Link"],
        phrase_hook_energy: 0.68,
        phrase_variation: "silk-orbit",
        phrase_variation_intensity: 0.81,
        voiceprints: ["Tide Braid", "Velvet Halo"],
        voiceprint_intensity: 0.78,
        element_roles: ["Tide Lens", "Halo Core"],
        element_role_intensity: 0.74,
        scene_cascade: "velvet-arcade",
        scene_cascade_intensity: 0.79,
        openness: 0.76,
        attack: 0.38,
        swing: 0.7,
        gravity: 0.42,
        synergy_resonance: 0.74,
        cadence_pull: 0.68,
        modal_tension: 0.24,
        blend_cohesion: 0.7,
        active_synergies: ["Cadential Lift", "Groove Pocket"],
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
    expect(screen.getAllByText("Velvet Arcade").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Silk Orbit").length).toBeGreaterThan(0);
    expect(screen.getByText("Element Voiceprints")).toBeInTheDocument();
    expect(screen.getAllByText("Tide Braid").length).toBeGreaterThan(0);
    expect(screen.getByText("Element Roles")).toBeInTheDocument();
    expect(screen.getAllByText("Tide Lens").length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/sandbox/render",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        })
      })
    );
  });

  it("lets users preview a different growth lens without changing saved progression", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      visualResponses: [
        {
          color: "#62d2a2",
          secondary_color: "#9af0dd",
          background_color: "#081018",
          glow: 0.72,
          growth_imprint: "neutral",
          growth_imprint_intensity: 0,
          particles: {
            density: 0.58,
            trail: false
          },
          geometry: "wave",
          animation_state: "flowing"
        },
        {
          color: "#ffd1f0",
          secondary_color: "#ff9fc9",
          background_color: "#170b13",
          glow: 0.94,
          growth_imprint: "neo-soul-veil",
          growth_imprint_intensity: 0.92,
          scene_cascade: "aurora-dais",
          scene_cascade_intensity: 0.91,
          particles: {
            density: 0.74,
            trail: false
          },
          geometry: "soft-orb",
          animation_state: "flowing"
        }
      ]
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Growth Lens Preview")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Neo Soul/ }));

    await waitFor(() => {
      expect(screen.getByText("预览镜头：Neo Soul 幕纱")).toBeInTheDocument();
    });

    const sandboxBodies = fetchMock.mock.calls
      .filter(([url]) => url === "http://api.test/sandbox/render")
      .map(([, init]) => JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>);

    expect(sandboxBodies.some((body) => body.preview_growth_imprint === "neo-soul-veil")).toBe(true);
  });

  it("shows a dedicated stage setpiece reading when the visual has a large split-stage identity", async () => {
    const fetchMock = createAuthenticatedFetchMock({
      visualResponse: {
        color: "#ffd166",
        secondary_color: "#c2b8ff",
        background_color: "#081018",
        glow: 0.9,
        energy: 0.74,
        complexity: 0.72,
        motion_speed: 0.68,
        ring_count: 5,
        ripple_strength: 0.76,
        beam_strength: 0.72,
        grain: 0.18,
        signature: "Aurora Choir",
        growth_imprint: "jazz-lattice",
        growth_imprint_intensity: 0.91,
        phrase_trajectory: "lift-arc",
        phrase_trajectory_intensity: 0.88,
        phrase_hooks: ["Skyline Rise", "Cadence Sweep"],
        phrase_hook_energy: 0.79,
        phrase_variation: "choir-step",
        phrase_variation_intensity: 0.91,
        voiceprints: ["Sky Fan", "Velvet Halo", "Cadence Stairs"],
        voiceprint_intensity: 0.94,
        element_roles: ["Sky Lens", "Halo Core", "Cadence Rail"],
        element_role_intensity: 0.88,
        scene_cascade: "aurora-dais",
        scene_cascade_intensity: 0.95,
        openness: 0.84,
        attack: 0.32,
        swing: 0.66,
        gravity: 0.48,
        synergy_resonance: 0.8,
        cadence_pull: 0.74,
        modal_tension: 0.24,
        blend_cohesion: 0.82,
        active_synergies: ["Cadential Lift", "Color Convergence", "Horizon Bloom"],
        active_bonuses: ["Aurora Choir", "Choir Vault"],
        particles: {
          density: 0.76,
          trail: false,
          size: 2.4,
          speed: 1.18,
          spread: 0.58
        },
        geometry: "lattice",
        animation_state: "flowing"
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Stage Setpiece")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Choir Vault").length).toBeGreaterThan(0);
    expect(screen.getByText("Stage Director Cue")).toBeInTheDocument();
    expect(screen.getByText("Stage Projection Script")).toBeInTheDocument();
    expect(screen.getByText("Stage Motion Rig")).toBeInTheDocument();
    expect(screen.getByText("Stage Takeover")).toBeInTheDocument();
    expect(screen.getByText("Synergy Glyph")).toBeInTheDocument();
    expect(screen.getByText("Stage Climate")).toBeInTheDocument();
    expect(screen.getByText("Phrase Trajectory")).toBeInTheDocument();
    expect(screen.getByText("Phrase Hooks")).toBeInTheDocument();
    expect(screen.getByText("Phrase Variation")).toBeInTheDocument();
    expect(screen.getByText("Element Voiceprints")).toBeInTheDocument();
    expect(screen.getByText("Element Roles")).toBeInTheDocument();
    expect(screen.getAllByText("Cathedral Descent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lift Arc").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Skyline Rise").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Choir Step").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sky Fan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cadence Stairs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sky Lens").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cadence Rail").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aisle Lattice").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Choir Crowns").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cathedral Iris").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Horizon Bloom").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bloom Haze").length).toBeGreaterThan(0);
    expect(screen.getByText(/顶部吊架、纵向窗格、拱形合唱廊/)).toBeInTheDocument();
    expect(screen.getByText(/顶部冷色吊灯和下压式礼堂光柱会持续往中心汇聚/)).toBeInTheDocument();
    expect(screen.getByText(/Setpiece: Choir Vault/)).toBeInTheDocument();
    expect(screen.getByText(/Cue: Cathedral Descent/)).toBeInTheDocument();
    expect(screen.getByText(/Projection: Aisle Lattice/)).toBeInTheDocument();
    expect(screen.getByText(/Motion: Choir Crowns/)).toBeInTheDocument();
    expect(screen.getByText(/Takeover: Cathedral Iris/)).toBeInTheDocument();
    expect(screen.getByText(/Glyph: Horizon Bloom/)).toBeInTheDocument();
    expect(screen.getByText(/Climate: Bloom Haze/)).toBeInTheDocument();
    expect(screen.getByText(/Trajectory: Lift Arc/)).toBeInTheDocument();
    expect(screen.getByText(/Hooks: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Variation: Choir Step/)).toBeInTheDocument();
    expect(screen.getByText(/Voices: 3/)).toBeInTheDocument();
    expect(screen.getByText(/Roles: 3/)).toBeInTheDocument();
    expect(screen.getByText(/成组下压，像礼堂灯柱一层层往中心落/)).toBeInTheDocument();
    expect(screen.getByText(/从前场两翼往上拱，再在舞台上方收成一个高点/)).toBeInTheDocument();
    expect(screen.getByText(/明亮开放的起点会先抬一小段/)).toBeInTheDocument();
    expect(screen.getByText(/柔亮和弦会顺着弧线扫向进行终点/)).toBeInTheDocument();
    expect(screen.getByText(/Jazz 的成长印记已经把上扬弧线改写成分级托举的礼台踏步/)).toBeInTheDocument();
    expect(screen.getByText(/扇面光束会从中心向上张开/)).toBeInTheDocument();
    expect(screen.getByText(/层层踏步会沿中心轴逐级递进/)).toBeInTheDocument();
    expect(screen.getByText(/作为透镜，会把高位空间拉开/)).toBeInTheDocument();
    expect(screen.getByText(/作为轨道，会沿前后轴拉出终止导轨/)).toBeInTheDocument();
    expect(screen.getByText(/地面会长出合唱席一样的纵深 aisle 与圆形 choir mark/)).toBeInTheDocument();
    expect(screen.getByText(/前景会出现成组的拱冠、吊环和合唱席式悬挂边框/)).toBeInTheDocument();
    expect(screen.getByText(/舞台会像穹顶开闸一样往中心收束再打开/)).toBeInTheDocument();
    expect(screen.getByText(/会在中轴和地平线之间长出放射式日冕与拱形开叶/)).toBeInTheDocument();
    expect(screen.getByText(/空气里会额外带一层被日冕点亮的暖雾和亮粉/)).toBeInTheDocument();
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
    expect(screen.getAllByText("Jazz").length).toBeGreaterThan(0);
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
        growth_imprint: "jazz-lattice",
        growth_imprint_intensity: 0.88,
        scene_cascade: "aurora-dais",
        scene_cascade_intensity: 0.93,
        openness: 0.84,
        attack: 0.28,
        swing: 0.62,
        gravity: 0.38,
        synergy_resonance: 0.78,
        cadence_pull: 0.72,
        modal_tension: 0.18,
        blend_cohesion: 0.76,
        active_synergies: ["Cadential Lift", "Radiant Voicing"],
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
    expect(screen.getByText("成长染色：")).toBeInTheDocument();
    expect(screen.getByText(/当前级联又被 Jazz Lattice 染得更有和声窗格/)).toBeInTheDocument();
  });

  it("shows a dedicated growth imprint reading when unlock styles are active", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        visualResponse: {
          color: "#ffb45c",
          secondary_color: "#ff9fc9",
          background_color: "#170b13",
          glow: 0.94,
          energy: 0.7,
          complexity: 0.62,
          temperature: 0.66,
          symmetry: 0.82,
          depth: 0.86,
          pulse_density: 0.54,
          motion_speed: 0.58,
          ring_count: 5,
          ripple_strength: 0.72,
          beam_strength: 0.52,
          grain: 0.08,
          signature: "Velvet Tide",
          growth_imprint: "neo-soul-veil",
          growth_imprint_intensity: 0.94,
          openness: 0.82,
          attack: 0.24,
          swing: 0.64,
          gravity: 0.36,
          synergy_resonance: 0.64,
          cadence_pull: 0.48,
          modal_tension: 0.22,
          blend_cohesion: 0.7,
          active_synergies: ["Silken Resolve"],
          active_bonuses: ["Velvet Tide"],
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
      expect(screen.getByText("Growth Imprint")).toBeInTheDocument();
    });
    expect(screen.getByText("Neo Soul 幕纱")).toBeInTheDocument();
    expect(screen.getByText(/Growth 已经把当前舞台往丝绒/)).toBeInTheDocument();
  });

  it("shows harmonic trait readouts for the current theory stack", async () => {
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
          growth_imprint: "jazz-lattice",
          growth_imprint_intensity: 0.88,
          openness: 0.86,
          attack: 0.26,
          swing: 0.58,
          gravity: 0.34,
          synergy_resonance: 0.8,
          cadence_pull: 0.72,
          modal_tension: 0.16,
          blend_cohesion: 0.78,
          active_synergies: ["Cadential Lift", "Radiant Voicing"],
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
      expect(screen.getByText("Harmonic Traits")).toBeInTheDocument();
    });
    expect(screen.getByText("Openness")).toBeInTheDocument();
    expect(screen.getByText("Attack")).toBeInTheDocument();
    expect(screen.getByText("Swing")).toBeInTheDocument();
    expect(screen.getByText("Gravity")).toBeInTheDocument();
  });

  it("shows a theory synergy panel when the stack has strong interaction", async () => {
    vi.stubGlobal(
      "fetch",
      createAuthenticatedFetchMock({
        visualResponse: {
          color: "#cfd9ff",
          secondary_color: "#8fdcff",
          background_color: "#081018",
          glow: 0.9,
          energy: 0.78,
          complexity: 0.66,
          temperature: 0.48,
          symmetry: 0.82,
          depth: 0.82,
          pulse_density: 0.72,
          motion_speed: 0.66,
          ring_count: 5,
          ripple_strength: 0.76,
          beam_strength: 0.62,
          grain: 0.16,
          growth_imprint: "jazz-lattice",
          growth_imprint_intensity: 0.88,
          openness: 0.82,
          attack: 0.32,
          swing: 0.68,
          gravity: 0.72,
          synergy_resonance: 0.84,
          cadence_pull: 0.88,
          modal_tension: 0.18,
          blend_cohesion: 0.76,
          active_synergies: ["Cadential Lift", "Radiant Voicing", "Color Convergence"],
          signature: "Cadence Aurora",
          active_bonuses: ["Cadence Aurora"],
          particles: {
            density: 0.76,
            trail: false,
            size: 2.3,
            speed: 1.18,
            spread: 0.54
          },
          geometry: "lattice",
          animation_state: "flowing"
        }
      })
    );

    render(<TheorySandbox {...AUTH_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Theory Synergy")).toBeInTheDocument();
    });
    expect(screen.getByText("Resonance")).toBeInTheDocument();
    expect(screen.getByText("Cadence Pull")).toBeInTheDocument();
    expect(screen.getByText("Modal Tension")).toBeInTheDocument();
    expect(screen.getByText("Blend Cohesion")).toBeInTheDocument();
    expect(screen.getByText("Cadential Lift")).toBeInTheDocument();
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
    growth_imprint?: string;
    growth_imprint_intensity?: number;
    scene_cascade?: string;
    scene_cascade_intensity?: number;
    openness?: number;
    attack?: number;
    swing?: number;
    gravity?: number;
    synergy_resonance?: number;
    cadence_pull?: number;
    modal_tension?: number;
    blend_cohesion?: number;
    active_synergies?: string[];
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
    growth_imprint?: string;
    growth_imprint_intensity?: number;
    scene_cascade?: string;
    scene_cascade_intensity?: number;
    openness?: number;
    attack?: number;
    swing?: number;
    gravity?: number;
    synergy_resonance?: number;
    cadence_pull?: number;
    modal_tension?: number;
    blend_cohesion?: number;
    active_synergies?: string[];
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
          growth_imprint: "neutral",
          growth_imprint_intensity: 0,
          openness: 0.62,
          attack: 0.36,
          swing: 0.42,
          gravity: 0.44,
          synergy_resonance: 0.48,
          cadence_pull: 0.42,
          modal_tension: 0.32,
          blend_cohesion: 0.56,
          active_synergies: [],
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
        growth_imprint: "neutral",
        growth_imprint_intensity: 0,
        openness: 0.62,
        attack: 0.36,
        swing: 0.42,
        gravity: 0.44,
        synergy_resonance: 0.48,
        cadence_pull: 0.42,
        modal_tension: 0.32,
        blend_cohesion: 0.56,
        active_synergies: [],
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
