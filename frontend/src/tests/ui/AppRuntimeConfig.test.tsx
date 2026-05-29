import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../App";

describe("App runtime config", () => {
  afterEach(() => {
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
    const fetchMock = vi.fn().mockImplementation((url: string) => {
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

      if (url.endsWith("/heatmap/yearly?year=2026")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user_id: 77,
            year: 2026,
            days: []
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
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test/sandbox/render",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token-123"
          })
        })
      );
    });
  });

  it("submits login credentials and enters the sandbox after success", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/auth/login")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            token: "token-123",
            user: {
              id: 77,
              username: "player-one",
              email: "player@example.com",
              created_at: "2026-05-29T12:00:00",
              level: 1,
              total_exp: 0
            }
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

      if (url.endsWith("/heatmap/yearly?year=2026")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user_id: 77,
            year: 2026,
            days: []
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
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    fireEvent.change(screen.getByLabelText("用户名"), { target: { value: "player-one" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "plain-secret" } });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://api.test/auth/login", expect.any(Object));
    });
  });
});
