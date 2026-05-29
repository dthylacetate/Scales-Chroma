import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

const canvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  quadraticCurveTo: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
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

HTMLCanvasElement.prototype.getContext = function getContext() {
  return canvasContext as unknown as CanvasRenderingContext2D;
};

window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return window.setTimeout(() => callback(Date.now()), 16);
};

window.cancelAnimationFrame = (handle: number): void => {
  window.clearTimeout(handle);
};
