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
});
