import type { VisualParameters } from "../types/theory";

export interface CanvasFrameScheduler {
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (handle: number) => void;
  devicePixelRatio?: number;
}

export class RealtimeCanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly requestFrame: (callback: FrameRequestCallback) => number;
  private readonly cancelFrame: (handle: number) => void;
  private readonly devicePixelRatio: number;
  private frameHandle: number | null = null;
  private currentVisual: VisualParameters | null = null;
  private running = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    scheduler: CanvasFrameScheduler = {
      requestFrame: window.requestAnimationFrame.bind(window),
      cancelFrame: window.cancelAnimationFrame.bind(window),
      devicePixelRatio: window.devicePixelRatio
    }
  ) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("2D canvas context is unavailable");
    }

    this.context = context;
    this.requestFrame = scheduler.requestFrame;
    this.cancelFrame = scheduler.cancelFrame;
    this.devicePixelRatio = scheduler.devicePixelRatio ?? 1;
  }

  start(visual: VisualParameters): void {
    this.currentVisual = visual;

    if (this.running) {
      return;
    }

    this.running = true;
    this.frameHandle = this.requestFrame(this.renderFrame);
  }

  stop(): void {
    if (this.frameHandle !== null) {
      this.cancelFrame(this.frameHandle);
    }

    this.frameHandle = null;
    this.currentVisual = null;
    this.running = false;
  }

  resize(width: number, height: number): void {
    const scaledWidth = Math.max(1, Math.round(width * this.devicePixelRatio));
    const scaledHeight = Math.max(1, Math.round(height * this.devicePixelRatio));

    this.canvas.width = scaledWidth;
    this.canvas.height = scaledHeight;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
  }

  isRunning(): boolean {
    return this.running;
  }

  private readonly renderFrame = (timestamp: number): void => {
    if (!this.running || !this.currentVisual) {
      return;
    }

    this.draw(this.currentVisual, timestamp);
    this.frameHandle = this.requestFrame(this.renderFrame);
  };

  private draw(visual: VisualParameters, timestamp: number): void {
    const width = this.canvas.width / this.devicePixelRatio;
    const height = this.canvas.height / this.devicePixelRatio;
    const centerX = width / 2;
    const centerY = height / 2;
    const pulse = 1 + Math.sin(timestamp / 480) * 0.08;
    const radius = Math.max(24, Math.min(width, height) * 0.18 * pulse);

    this.context.clearRect(0, 0, width, height);
    this.context.fillStyle = "rgba(6, 10, 18, 0.92)";
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, width, height);

    this.context.save();
    this.context.globalAlpha = Math.max(0.2, Math.min(1, visual.glow));
    this.context.fillStyle = visual.color;

    if (visual.geometry === "fracture") {
      this.context.fillRect(centerX - radius / 2, centerY - radius / 2, radius, radius);
    } else {
      this.context.beginPath();
      this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.context.fill();
    }

    this.context.restore();
  }
}
