import { afterEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, login, logout, register } from "../../services/authApi";

describe("auth API service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("registers a user and normalizes token plus user fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
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
    vi.stubGlobal("fetch", fetchMock);

    const payload = await register({
      apiBaseUrl: "http://localhost:8000",
      username: "player-one",
      email: "player@example.com",
      password: "plain-secret"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/auth/register", expect.any(Object));
    expect(payload.token).toBe("token-123");
    expect(payload.user.username).toBe("player-one");
  });

  it("logs in and sends plain password credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
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
    vi.stubGlobal("fetch", fetchMock);

    await login({
      apiBaseUrl: "http://localhost:8000",
      username: "player-one",
      password: "plain-secret"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/auth/login", {
      body: JSON.stringify({
        username: "player-one",
        password: "plain-secret"
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  });

  it("loads current user and logs out with bearer token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 77,
          username: "player-one",
          email: "player@example.com",
          created_at: "2026-05-29T12:00:00",
          level: 2,
          total_exp: 120
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "ok"
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    const user = await getCurrentUser({
      apiBaseUrl: "http://localhost:8000",
      token: "token-123"
    });
    await logout({
      apiBaseUrl: "http://localhost:8000",
      token: "token-123"
    });

    expect(user.totalExp).toBe(120);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/auth/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        })
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/auth/logout",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        }),
        method: "POST"
      })
    );
  });
});
