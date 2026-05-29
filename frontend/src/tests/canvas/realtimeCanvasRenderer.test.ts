import { afterEach, describe, expect, it, vi } from "vitest";

import { RealtimeCanvasRenderer } from "../../canvas/RealtimeCanvasRenderer";
import type { VisualParameters } from "../../types/theory";

const visual: VisualParameters = {
  color: "#ffb45c",
  secondaryColor: "#8fdcff",
  backgroundColor: "#091018",
  glow: 0.86,
  contrast: 0.54,
  energy: 0.78,
  complexity: 0.62,
  temperature: 0.72,
  valence: 0.82,
  arousal: 0.76,
  luminosity: 0.84,
  grit: 0.24,
  symmetry: 0.76,
  depth: 0.7,
  pulseDensity: 0.68,
  motionSpeed: 0.68,
  ringCount: 5,
  rippleStrength: 0.74,
  beamStrength: 0.58,
  grain: 0.32,
  signature: "Cadence Aurora",
  sceneFamily: "jazz-cathedral",
  activeBonuses: ["Cadence Aurora"],
  particles: {
    density: 0.72,
    trail: false,
    size: 2.3,
    speed: 1.14,
    spread: 0.58
  },
  geometry: "soft-orb",
  animationState: "flowing"
};

describe("RealtimeCanvasRenderer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts a requestAnimationFrame loop and paints layered stage backgrounds", () => {
    const canvas = createCanvas();
    let shouldRenderImmediately = true;
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      if (shouldRenderImmediately) {
        shouldRenderImmediately = false;
        callback(16);
      }
      return 7;
    });
    const cancelFrame = vi.fn();

    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame,
      cancelFrame
    });

    renderer.resize(320, 180);
    renderer.start(visual);

    const context = canvas.getContext("2d");
    expect(requestFrame).toHaveBeenCalled();
    expect(context?.fillRect).toHaveBeenCalled();
    expect(context?.createLinearGradient).toHaveBeenCalled();
    expect(context?.createRadialGradient).toHaveBeenCalled();
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

  it("draws fracture geometry with rotating shards and beam bursts", () => {
    const canvas = createCanvas();
    let shouldRenderImmediately = true;
    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame: (callback) => {
        if (shouldRenderImmediately) {
          shouldRenderImmediately = false;
          callback(16);
        }
        return 1;
      },
      cancelFrame: vi.fn()
    });

    renderer.resize(320, 180);
    renderer.start({
      ...visual,
      geometry: "fracture",
      animationState: "explosive",
      beamStrength: 0.9
    });

    const context = canvas.getContext("2d");
    expect(context?.lineTo).toHaveBeenCalled();
    expect(context?.stroke).toHaveBeenCalled();
    expect(context?.translate).toHaveBeenCalled();
  });

  it("draws particle trails when the visual has unlocked trail effects", () => {
    const canvas = createCanvas();
    let shouldRenderImmediately = true;
    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame: (callback) => {
        if (shouldRenderImmediately) {
          shouldRenderImmediately = false;
          callback(16);
        }
        return 1;
      },
      cancelFrame: vi.fn()
    });

    renderer.resize(320, 180);
    renderer.start({
      ...visual,
      particles: {
        density: 0.9,
        trail: true,
        size: 2.5,
        speed: 1.4,
        spread: 0.66
      }
    });

    const context = canvas.getContext("2d");
    expect(context?.arc).toHaveBeenCalled();
    expect(context?.moveTo).toHaveBeenCalled();
    expect(context?.lineTo).toHaveBeenCalled();
  });
});

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const context = createMockContext();

  vi.spyOn(canvas, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);

  return canvas;
}

function createMockContext() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    quadraticCurveTo: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    fillStyle: "",
    strokeStyle: "",
    shadowBlur: 0,
    shadowColor: "",
    lineWidth: 1,
    lineCap: "round",
    globalAlpha: 1
  };
}
