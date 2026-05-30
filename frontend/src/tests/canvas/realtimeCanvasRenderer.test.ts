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
  growthImprint: "jazz-lattice",
  growthImprintIntensity: 0.82,
  phraseTrajectory: "lift-arc",
  phraseTrajectoryIntensity: 0.84,
  phraseHooks: ["Skyline Rise", "Cadence Sweep"],
  phraseHookEnergy: 0.78,
  sceneCascade: "aurora-dais",
  sceneCascadeIntensity: 0.88,
  openness: 0.82,
  attack: 0.34,
  swing: 0.68,
  gravity: 0.44,
  synergyResonance: 0.72,
  cadencePull: 0.66,
  modalTension: 0.28,
  blendCohesion: 0.74,
  activeBonuses: ["Cadence Aurora"],
  activeSynergies: ["Cadential Lift"],
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

  it("keeps a single render loop while morphing toward new visual states", () => {
    const canvas = createCanvas();
    const callbacks: FrameRequestCallback[] = [];
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame,
      cancelFrame: vi.fn()
    });

    renderer.resize(320, 180);
    renderer.start(visual);
    renderer.start({
      ...visual,
      signature: "Aurora Choir",
      sceneCascade: "aurora-dais",
      sceneCascadeIntensity: 0.96,
      sceneFamily: "solar-garden",
      color: "#ffe56d"
    });

    expect(requestFrame).toHaveBeenCalledTimes(1);
    callbacks[0]?.(16);
    const context = canvas.getContext("2d");
    expect(context?.fillRect).toHaveBeenCalled();
    expect(renderer.isRunning()).toBe(true);
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

  it("draws a dedicated growth imprint layer when a style track is active", () => {
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
      growthImprint: "metal-forge",
      growthImprintIntensity: 0.94
    });

    const context = canvas.getContext("2d");
    expect(context?.fillRect).toHaveBeenCalled();
    expect(context?.lineTo).toHaveBeenCalled();
    expect(context?.stroke).toHaveBeenCalled();
  });

  it("draws systemic theory synergy overlays for strong harmonic interaction", () => {
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
      synergyResonance: 0.84,
      cadencePull: 0.78,
      modalTension: 0.22,
      blendCohesion: 0.8
    });

    const context = canvas.getContext("2d");
    expect(context?.arc).toHaveBeenCalled();
    expect(context?.lineTo).toHaveBeenCalled();
    expect(context?.quadraticCurveTo).toHaveBeenCalled();
  });

  it("draws a dedicated scene cascade layer for large-scale triadic stage events", () => {
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
      sceneCascade: "prism-vortex",
      sceneCascadeIntensity: 0.94
    });

    const context = canvas.getContext("2d");
    expect(context?.rotate).toHaveBeenCalled();
    expect(context?.lineTo).toHaveBeenCalled();
    expect(context?.stroke).toHaveBeenCalled();
  });

  it("draws stage projection scripts for setpiece-driven floor identities", () => {
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
      activeBonuses: ["Aurora Choir", "Choir Vault"],
      sceneCascade: "aurora-dais",
      sceneCascadeIntensity: 0.95
    });

    const context = canvas.getContext("2d");
    expect(context?.ellipse).toHaveBeenCalled();
    expect(context?.lineTo).toHaveBeenCalled();
    expect(context?.stroke).toHaveBeenCalled();
  });

  it("draws synergy glyphs when emergent backend synergies are active", () => {
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
      activeSynergies: ["Cadential Lift", "Horizon Bloom"]
    });

    const context = canvas.getContext("2d");
    expect(context?.arc).toHaveBeenCalled();
    expect(context?.lineTo).toHaveBeenCalled();
    expect(context?.stroke).toHaveBeenCalled();
  });

  it("draws a stage climate layer that responds to scene family and synergy mood", () => {
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
      sceneFamily: "solar-garden",
      activeSynergies: ["Cadential Lift", "Horizon Bloom"]
    });

    const context = canvas.getContext("2d");
    expect(context?.createRadialGradient).toHaveBeenCalled();
    expect(context?.fillRect).toHaveBeenCalled();
  });

  it("draws a phrase trajectory layer when the module order has locked a path", () => {
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
      phraseTrajectory: "lift-arc",
      phraseTrajectoryIntensity: 0.88
    });

    const context = canvas.getContext("2d");
    expect(context?.bezierCurveTo).toHaveBeenCalled();
    expect(context?.fillRect).toHaveBeenCalled();
  });

  it("draws phrase hook bridge motifs when adjacent modules have bridge hooks", () => {
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
      phraseHooks: ["Skyline Rise", "Cadence Sweep"],
      phraseHookEnergy: 0.8
    });

    const context = canvas.getContext("2d");
    expect(context?.quadraticCurveTo).toHaveBeenCalled();
  });

  it("draws foreground motion rigs for stage personalities with near-camera machinery", () => {
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
      activeBonuses: ["Aurora Choir", "Choir Vault"],
      sceneCascade: "aurora-dais",
      sceneCascadeIntensity: 0.95
    });

    const context = canvas.getContext("2d");
    expect(context?.arc).toHaveBeenCalled();
    expect(context?.lineTo).toHaveBeenCalled();
    expect(context?.fillRect).toHaveBeenCalled();
  });

  it("amplifies transition takeovers when a new stage personality takes control", () => {
    const canvas = createCanvas();
    const callbacks: FrameRequestCallback[] = [];
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const renderer = new RealtimeCanvasRenderer(canvas, {
      requestFrame,
      cancelFrame: vi.fn()
    });

    renderer.resize(320, 180);
    renderer.start(visual);
    renderer.start({
      ...visual,
      signature: "Aurora Choir",
      sceneFamily: "solar-garden",
      sceneCascade: "aurora-dais",
      sceneCascadeIntensity: 0.95,
      activeBonuses: ["Aurora Choir", "Choir Vault"]
    });

    callbacks[0]?.(220);

    const context = canvas.getContext("2d");
    expect(context?.fillRect).toHaveBeenCalled();
    expect(context?.arc).toHaveBeenCalled();
    expect(context?.stroke).toHaveBeenCalled();
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
    bezierCurveTo: vi.fn(),
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
