import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TheorySandbox } from "../../pages/TheorySandbox";

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

  it("applies backend-enhanced visuals when an api base url is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        color: "#62d2a2",
        glow: 0.8,
        particles: {
          density: 0.78,
          trail: true
        },
        geometry: "wave",
        animation_state: "flowing"
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox apiBaseUrl="http://api.test" userId={77} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(screen.getByText("Trail")).toBeInTheDocument();
    expect(screen.getByText("On")).toBeInTheDocument();
  });

  it("records a practice session and shows earned exp", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/practice-records")) {
        return Promise.resolve({
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

    render(<TheorySandbox apiBaseUrl="http://api.test" userId={77} />);

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
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/practice-records", expect.any(Object));
  });

  it("refreshes sandbox visuals after practice unlocks a new effect", async () => {
    let sandboxRenderCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/practice-records")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 13,
            user_id: 77,
            practice_date: "2026-05-29",
            duration_minutes: 610,
            bpm: 150,
            topic: "Pentatonic speed run",
            notes: null,
            exp_earned: 732
          })
        });
      }

      sandboxRenderCount += 1;
      return Promise.resolve({
        ok: true,
        json: async () => ({
          color: "#62d2a2",
          glow: 0.8,
          particles: {
            density: sandboxRenderCount > 1 ? 0.9 : 0.58,
            trail: sandboxRenderCount > 1
          },
          geometry: "wave",
          animation_state: "flowing"
        })
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TheorySandbox apiBaseUrl="http://api.test" userId={77} />);

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
    expect(sandboxRenderCount).toBeGreaterThan(1);
  });

  it("loads and displays skill tree progression", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/skill-tree?user_id=77")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
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

    render(<TheorySandbox apiBaseUrl="http://api.test" userId={77} />);

    await waitFor(() => {
      expect(screen.getByText("Growth")).toBeInTheDocument();
    });
    expect(screen.getByText("Jazz")).toBeInTheDocument();
    expect(screen.getAllByText("II-V-I").length).toBeGreaterThan(1);
    expect(screen.getByText("Lv 2")).toBeInTheDocument();
  });

  it("loads and displays yearly practice heatmap entries", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/heatmap/yearly?user_id=77&year=2026")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user_id: 77,
            year: 2026,
            days: [
              {
                date: "2026-05-29",
                duration_minutes: 45,
                exp: 54
              }
            ]
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

    render(<TheorySandbox apiBaseUrl="http://api.test" userId={77} />);

    await waitFor(() => {
      expect(screen.getByText("Heatmap")).toBeInTheDocument();
    });
    expect(screen.getByText("2026-05-29")).toBeInTheDocument();
    expect(screen.getByText("54 EXP")).toBeInTheDocument();
  });
});
