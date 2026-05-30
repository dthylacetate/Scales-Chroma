import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../App";
import { MusicTheoryGuide } from "../../pages/MusicTheoryGuide";
import { SkillTreePage } from "../../pages/SkillTreePage";

describe("learning pages", () => {
  afterEach(() => {
    window.history.replaceState(null, "", window.location.pathname);
    window.localStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("navigates from the sandbox to skill tree and theory guide sections", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
    window.localStorage.setItem("scales-chroma-auth-token", "token-123");
    vi.stubGlobal("fetch", createAppFetchMock());

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "视觉沙盘" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "技能树" }));
    expect(screen.getByRole("heading", { name: "练习会改变你的舞台能力" })).toBeInTheDocument();
    expect(screen.getByText(/怎么解锁/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "基础乐理" }));
    expect(screen.getByRole("heading", { name: "从“会听见颜色”开始理解乐理" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "音高、半音与音程" })).toBeInTheDocument();
  });

  it("renders a beginner-friendly theory guide for modes, tuning material, chords and progressions", () => {
    render(<MusicTheoryGuide />);

    expect(screen.getByText(/音高是声音的高低/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "音律：为什么 12 个半音能组成一个八度" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "调式：同一批音的不同重心" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "和弦：把多个音堆成一个情绪块" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "和弦进行：情绪如何往前走" })).toBeInTheDocument();
    expect(screen.getByText(/读完后，你应该能更顺利地看懂常见乐理教材/)).toBeInTheDocument();
  });

  it("loads authenticated skill tree data and explains unlock routes", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/skill-tree")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user_id: 77,
            branches: [
              {
                direction: "Metal",
                nodes: [
                  { id: "palm-mute", label: "Palm Mute", level: 2, unlocked: true },
                  { id: "sweep-picking", label: "Sweep Picking", level: 0, unlocked: false }
                ]
              },
              {
                direction: "Fusion",
                nodes: [{ id: "legato", label: "Legato", level: 1, unlocked: true }]
              }
            ]
          })
        });
      }

      if (url.endsWith("/unlocked-effects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user_id: 77,
            effects: [
              {
                id: 1,
                effect_name: "fracture_burst",
                unlocked_at: "2026-06-01T12:00:00",
                trigger_condition: "Metal practice over 300 minutes"
              }
            ]
          })
        });
      }

      return Promise.reject(new Error(`Unexpected request ${url}`));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<SkillTreePage apiBaseUrl="http://api.test" authToken="token-123" />);

    await waitFor(() => {
      expect(screen.getByText("2/3")).toBeInTheDocument();
    });

    expect(screen.getByText("Palm Mute")).toBeInTheDocument();
    expect(screen.getByText("下拨")).toBeInTheDocument();
    expect(screen.getByText("融合")).toBeInTheDocument();
    expect(screen.getByText(/达到阈值后，视觉能力会永久解锁/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/skill-tree",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        })
      })
    );
  });
});

function createAppFetchMock() {
  return vi.fn().mockImplementation((url: string) => {
    if (url.endsWith("/auth/me")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 77,
          username: "player-one",
          email: "player@example.com",
          created_at: "2026-05-29T12:00:00",
          level: 1,
          total_exp: 0
        })
      });
    }

    if (url.endsWith("/skill-tree")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user_id: 77,
          branches: []
        })
      });
    }

    if (url.endsWith("/unlocked-effects")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user_id: 77,
          effects: []
        })
      });
    }

    if (url.includes("/heatmap/yearly")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user_id: 77,
          year: 2026,
          days: []
        })
      });
    }

    if (url.includes("/practice-records?")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          records: []
        })
      });
    }

    if (url.endsWith("/compositions")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          compositions: []
        })
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({
        color: "#ffb45c",
        glow: 0.86,
        particles: {
          density: 0.52,
          trail: false
        },
        geometry: "soft-orb",
        animation_state: "flowing"
      })
    });
  });
}
