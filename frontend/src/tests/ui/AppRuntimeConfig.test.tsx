import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../App";

describe("App runtime config", () => {
  afterEach(() => {
    window.history.replaceState(null, "", window.location.pathname);
    window.localStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("shows auth screen before login when API mode is enabled", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn());

    render(<App />);

    expect(screen.getByRole("heading", { name: "Scales & Chroma" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
  });

  it("restores a token and enters the sandbox experience", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
    window.localStorage.setItem("scales-chroma-auth-token", "token-123");
    const fetchMock = createAppFetchMock({
      currentUser: {
        id: 77,
        username: "player-one",
        email: "player@example.com",
        created_at: "2026-05-29T12:00:00",
        level: 1,
        total_exp: 0
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test/auth/me",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token-123"
          })
        })
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("player-one").length).toBeGreaterThan(0);
    });
  });

  it("submits login credentials and enters the sandbox after success", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
    const fetchMock = createAppFetchMock({
      loginSession: {
        token: "token-123",
        user: {
          id: 77,
          username: "player-one",
          email: "player@example.com",
          created_at: "2026-05-29T12:00:00",
          level: 1,
          total_exp: 0
        }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    fireEvent.change(screen.getByLabelText("用户名"), { target: { value: "player-one" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "plain-secret" } });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test/auth/login",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("player-one").length).toBeGreaterThan(0);
    });
    expect(window.localStorage.getItem("scales-chroma-auth-token")).toBe("token-123");
  });
});

interface AppFetchMockOptions {
  currentUser?: {
    id: number;
    username: string;
    email: string;
    created_at: string;
    level: number;
    total_exp: number;
  };
  loginSession?: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      created_at: string;
      level: number;
      total_exp: number;
    };
  };
}

function createAppFetchMock(options: AppFetchMockOptions = {}) {
  const currentUser =
    options.currentUser ??
    options.loginSession?.user ?? {
      id: 77,
      username: "player-one",
      email: "player@example.com",
      created_at: "2026-05-29T12:00:00",
      level: 1,
      total_exp: 0
    };

  return vi.fn().mockImplementation((url: string) => {
    if (url.endsWith("/auth/me")) {
      return Promise.resolve({
        ok: true,
        json: async () => currentUser
      });
    }

    if (url.endsWith("/auth/login")) {
      return Promise.resolve({
        ok: true,
        json: async () =>
          options.loginSession ?? {
            token: "token-123",
            user: currentUser
          }
      });
    }

    if (url.endsWith("/skill-tree")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user_id: currentUser.id,
          branches: []
        })
      });
    }

    if (url.includes("/heatmap/yearly")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user_id: currentUser.id,
          year: 2026,
          days: []
        })
      });
    }

    if (url.endsWith("/unlocked-effects")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user_id: currentUser.id,
          effects: []
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
