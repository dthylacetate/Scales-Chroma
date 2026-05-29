import { afterEach, describe, expect, it, vi } from "vitest";

import { RealtimeCanvasRenderer } from "../../canvas/RealtimeCanvasRenderer";
import type { VisualParameters } from "../../types/theory";

const visual: VisualParameters = {
  color: "#ffb45c",
  glow: 0.86,
  particles: {
    density: 0.52,
    trail: false
  },
  geometry: "soft-orb",
  animationState: "flowing"
};

describe("RealtimeCanvasRenderer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts a requestAnimationFrame loop and renders a frame", () => {
    const canvas = createCanvas();
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(16);
      return 7;
    });
    const cancelFrame = vi.fn();

    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame,
      cancelFrame
    });

    renderer.start(visual);

    expect(requestFrame).toHaveBeenCalled();
    expect(canvas.getContext("2d")?.fillRect).toHaveBeenCalled();
    expect(renderer.isRunning()).toBe(true);
  });

  it("cancels animation frame and releases runtime state on stop", () => {
    const canvas = createCanvas();
    const requestFrame = vi.fn(() => 42);
    const cancelFrame = vi.fn();
    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame,
      cancelFrame
    });

    renderer.start(visual);
    renderer.stop();

    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(renderer.isRunning()).toBe(false);
  });

  it("resizes backing canvas with device pixel ratio", () => {
    const canvas = createCanvas();
    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame: vi.fn(() => 1),
      cancelFrame: vi.fn(),
      devicePixelRatio: 2
    });

    renderer.resize(320, 180);

    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(360);
    expect(canvas.style.width).toBe("320px");
    expect(canvas.style.height).toBe("180px");
  });
});

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const context = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    fillStyle: "",
    globalAlpha: 1
  };

  vi.spyOn(canvas, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);

  return canvas;
}
