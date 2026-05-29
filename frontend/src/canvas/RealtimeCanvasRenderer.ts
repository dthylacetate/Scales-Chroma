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
    this.context.fillStyle = "rgba(18, 15, 18, 0.94)";
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, width, height);

    this.context.save();
    this.context.globalAlpha = Math.max(0.2, Math.min(1, visual.glow));
    this.context.fillStyle = visual.color;
    this.context.strokeStyle = visual.color;
    this.context.lineWidth = Math.max(1, visual.glow * 4);
    this.context.shadowBlur = visual.glow * 42;
    this.context.shadowColor = visual.color;

    this.drawGeometry(visual, timestamp, centerX, centerY, radius);
    this.drawParticles(visual, timestamp, centerX, centerY, radius);

    this.context.restore();
  }

  private drawGeometry(
    visual: VisualParameters,
    timestamp: number,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    if (visual.geometry === "fracture") {
      this.drawFracture(timestamp, centerX, centerY, radius);
      return;
    }

    if (visual.geometry === "wave") {
      this.drawWave(timestamp, centerX, centerY, radius);
      return;
    }

    if (visual.geometry === "lattice") {
      this.drawLattice(timestamp, centerX, centerY, radius);
      return;
    }

    this.context.beginPath();
    this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.context.fill();
  }

  private drawFracture(timestamp: number, centerX: number, centerY: number, radius: number): void {
    const shardCount = 7;
    const rotation = timestamp / 900;

    this.context.beginPath();
    for (let index = 0; index < shardCount; index += 1) {
      const angle = rotation + (Math.PI * 2 * index) / shardCount;
      const innerRadius = radius * (0.28 + (index % 2) * 0.12);
      const outerRadius = radius * (0.82 + (index % 3) * 0.08);

      this.context.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
      this.context.lineTo(centerX + Math.cos(angle + 0.18) * outerRadius, centerY + Math.sin(angle + 0.18) * outerRadius);
      this.context.lineTo(centerX + Math.cos(angle + 0.48) * innerRadius, centerY + Math.sin(angle + 0.48) * innerRadius);
      this.context.closePath();
    }
    this.context.fill();
    this.context.stroke();
  }

  private drawWave(timestamp: number, centerX: number, centerY: number, radius: number): void {
    const waveWidth = radius * 2.8;
    const startX = centerX - waveWidth / 2;
    const amplitude = radius * 0.3;

    this.context.beginPath();
    for (let step = 0; step <= 32; step += 1) {
      const progress = step / 32;
      const x = startX + waveWidth * progress;
      const y = centerY + Math.sin(progress * Math.PI * 4 + timestamp / 360) * amplitude;

      if (step === 0) {
        this.context.moveTo(x, y);
      } else {
        this.context.lineTo(x, y);
      }
    }
    this.context.stroke();
  }

  private drawLattice(timestamp: number, centerX: number, centerY: number, radius: number): void {
    const lines = 6;
    const span = radius * 1.4;
    const drift = Math.sin(timestamp / 620) * 4;

    this.context.beginPath();
    for (let index = 0; index < lines; index += 1) {
      const offset = -span / 2 + (span * index) / (lines - 1);

      this.context.moveTo(centerX - span / 2 + drift, centerY + offset);
      this.context.lineTo(centerX + span / 2 + drift, centerY + offset);
      this.context.moveTo(centerX + offset, centerY - span / 2 - drift);
      this.context.lineTo(centerX + offset, centerY + span / 2 - drift);
    }
    this.context.stroke();
  }

  private drawParticles(
    visual: VisualParameters,
    timestamp: number,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    if (!visual.particles.trail) {
      return;
    }

    const particleCount = Math.max(4, Math.round(visual.particles.density * 20));
    this.context.globalAlpha = Math.min(0.85, visual.glow);

    for (let index = 0; index < particleCount; index += 1) {
      const orbit = radius * (1.05 + (index % 4) * 0.14);
      const angle = timestamp / 700 + (Math.PI * 2 * index) / particleCount;
      const particleRadius = 1.8 + (index % 3) * 0.8;

      this.context.beginPath();
      this.context.arc(
        centerX + Math.cos(angle) * orbit,
        centerY + Math.sin(angle) * orbit,
        particleRadius,
        0,
        Math.PI * 2
      );
      this.context.fill();
    }
  }
}
