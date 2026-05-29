import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../App";

describe("App runtime config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("passes Vite API config into the sandbox experience", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
    vi.stubEnv("VITE_DEMO_USER_ID", "77");
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/skill-tree?user_id=77")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user_id: 77,
            branches: []
          })
        });
      }

      if (url.endsWith("/heatmap/yearly?user_id=77&year=2026")) {
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
        "http://api.test/sandbox/render",
        expect.objectContaining({
          body: expect.stringContaining('"user_id":77')
        })
      );
    });
  });
});
