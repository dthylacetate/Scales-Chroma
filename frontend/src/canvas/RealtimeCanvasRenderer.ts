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
    const time = timestamp / 1000;
    const motionFactor = 0.72 + visual.motionSpeed * 1.2;
    const pulse = 1 + Math.sin(time * (1.8 + motionFactor)) * (0.04 + visual.glow * 0.08);
    const radius = Math.max(44, Math.min(width, height) * (0.16 + visual.energy * 0.07) * pulse);

    this.context.clearRect(0, 0, width, height);
    this.drawBackground(visual, width, height, centerX, centerY, radius, time);
    this.drawBeamField(visual, centerX, centerY, radius, time);
    this.drawRingField(visual, centerX, centerY, radius, time);
    this.drawGeometry(visual, centerX, centerY, radius, time);
    this.drawBonusMotifs(visual, centerX, centerY, radius, time);
    this.drawParticles(visual, centerX, centerY, radius, time);
    this.drawGrain(visual, width, height, time);
  }

  private drawBackground(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const backgroundGradient = this.context.createLinearGradient(0, 0, width, height);
    backgroundGradient.addColorStop(0, visual.backgroundColor);
    backgroundGradient.addColorStop(0.45, mixHex(visual.backgroundColor, visual.secondaryColor, 0.26));
    backgroundGradient.addColorStop(1, mixHex(visual.backgroundColor, visual.color, 0.18));

    this.context.globalAlpha = 1;
    this.context.fillStyle = backgroundGradient;
    this.context.fillRect(0, 0, width, height);

    const halo = this.context.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius * 2.8);
    halo.addColorStop(0, alphaHex(visual.color, 0.2 + visual.glow * 0.26));
    halo.addColorStop(0.42, alphaHex(visual.secondaryColor, 0.08 + visual.beamStrength * 0.16));
    halo.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = halo;
    this.context.fillRect(0, 0, width, height);

    const driftCount = Math.max(2, Math.min(6, Math.round(2 + visual.energy * 4)));
    for (let index = 0; index < driftCount; index += 1) {
      const orbit = radius * (1.2 + index * 0.34);
      const angle = time * (0.22 + visual.motionSpeed * 0.18) + index * 1.7;
      const glowX = centerX + Math.cos(angle) * orbit * 0.7;
      const glowY = centerY + Math.sin(angle * 1.12) * orbit * 0.45;
      const glowRadius = radius * (0.8 + index * 0.22);
      const accent = this.context.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      accent.addColorStop(0, alphaHex(index % 2 === 0 ? visual.color : visual.secondaryColor, 0.08));
      accent.addColorStop(1, alphaHex(visual.backgroundColor, 0));
      this.context.fillStyle = accent;
      this.context.fillRect(0, 0, width, height);
    }
  }

  private drawBeamField(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const beamCount = Math.max(3, Math.round(4 + visual.beamStrength * 10 + visual.energy * 3));
    const beamLength = radius * (1.7 + visual.energy * 1.2);
    const beamWidth = Math.max(1.5, 1 + visual.beamStrength * 6);

    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.lineWidth = beamWidth;
    this.context.lineCap = "round";
    this.context.shadowBlur = 18 + visual.glow * 34;
    this.context.shadowColor = visual.secondaryColor;
    this.context.globalAlpha = 0.08 + visual.beamStrength * 0.18;

    for (let index = 0; index < beamCount; index += 1) {
      const angle = (Math.PI * 2 * index) / beamCount + time * (0.18 + visual.motionSpeed * 0.42);
      const beamGradient = this.context.createLinearGradient(0, 0, Math.cos(angle) * beamLength, Math.sin(angle) * beamLength);
      beamGradient.addColorStop(0, alphaHex(visual.secondaryColor, 0.52));
      beamGradient.addColorStop(1, alphaHex(visual.color, 0));
      this.context.strokeStyle = beamGradient;
      this.context.beginPath();
      this.context.moveTo(0, 0);
      this.context.lineTo(Math.cos(angle) * beamLength, Math.sin(angle) * beamLength);
      this.context.stroke();
    }

    if (visual.animationState === "explosive" || visual.geometry === "fracture") {
      this.context.globalAlpha = 0.16 + visual.contrast * 0.12;
      this.context.strokeStyle = alphaHex(visual.color, 0.7);
      for (let index = 0; index < 4; index += 1) {
        const angle = time * (0.9 + visual.motionSpeed) + index * (Math.PI / 2);
        this.context.beginPath();
        this.context.moveTo(Math.cos(angle) * radius * 0.22, Math.sin(angle) * radius * 0.22);
        this.context.lineTo(Math.cos(angle) * beamLength * 1.12, Math.sin(angle) * beamLength * 1.12);
        this.context.stroke();
      }
    }

    this.context.restore();
  }

  private drawRingField(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const ringCount = Math.max(2, visual.ringCount);
    const ringBaseAlpha = 0.12 + visual.rippleStrength * 0.22;

    this.context.save();
    this.context.shadowBlur = 10 + visual.glow * 20;
    this.context.shadowColor = visual.color;

    for (let index = 0; index < ringCount; index += 1) {
      const drift = ((time * (0.4 + visual.motionSpeed * 0.5) + index * 0.42) % 1 + 1) % 1;
      const ringRadius = radius * (0.72 + index * 0.2 + drift * (0.22 + visual.rippleStrength * 0.34));
      const ringAlpha = ringBaseAlpha * (1 - drift * 0.7);
      this.context.beginPath();
      this.context.strokeStyle = index % 2 === 0 ? alphaHex(visual.secondaryColor, ringAlpha) : alphaHex(visual.color, ringAlpha);
      this.context.lineWidth = Math.max(1, 1.2 + visual.rippleStrength * 4 - index * 0.22);
      this.context.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      this.context.stroke();
    }

    this.context.restore();
  }

  private drawGeometry(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    this.context.shadowBlur = 14 + visual.glow * 32;
    this.context.shadowColor = visual.color;

    switch (visual.geometry) {
      case "fracture":
        this.drawFracture(visual, centerX, centerY, radius, time);
        break;
      case "wave":
        this.drawWave(visual, centerX, centerY, radius, time);
        break;
      case "lattice":
        this.drawLattice(visual, centerX, centerY, radius, time);
        break;
      default:
        this.drawSoftOrb(visual, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawSoftOrb(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const orbGradient = this.context.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius * 1.2);
    orbGradient.addColorStop(0, alphaHex(visual.secondaryColor, 0.82));
    orbGradient.addColorStop(0.55, alphaHex(visual.color, 0.74));
    orbGradient.addColorStop(1, alphaHex(visual.color, 0.12));

    this.context.fillStyle = orbGradient;
    this.context.beginPath();
    this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.context.fill();

    const shellCount = Math.max(2, Math.round(2 + visual.glow * 3));
    for (let index = 0; index < shellCount; index += 1) {
      const shellRadius = radius * (0.58 + index * 0.16 + Math.sin(time * 1.1 + index) * 0.04);
      this.context.beginPath();
      this.context.lineWidth = Math.max(1, 1.4 + visual.glow * 3 - index * 0.45);
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.color : visual.secondaryColor, 0.18 + visual.glow * 0.12);
      this.context.arc(centerX, centerY, shellRadius, 0, Math.PI * 2);
      this.context.stroke();
    }
  }

  private drawWave(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const ribbonCount = Math.max(2, Math.round(2 + visual.complexity * 4));
    const span = radius * (2.6 + visual.rippleStrength * 0.8);

    this.context.lineCap = "round";
    for (let ribbon = 0; ribbon < ribbonCount; ribbon += 1) {
      const amplitude = radius * (0.2 + ribbon * 0.06 + visual.rippleStrength * 0.24);
      const offsetY = centerY + (ribbon - (ribbonCount - 1) / 2) * radius * 0.2;
      this.context.beginPath();
      this.context.lineWidth = Math.max(1.5, 2.8 - ribbon * 0.22 + visual.glow * 1.8);
      this.context.strokeStyle =
        ribbon % 2 === 0
          ? alphaHex(visual.color, 0.28 + visual.glow * 0.2)
          : alphaHex(visual.secondaryColor, 0.22 + visual.beamStrength * 0.18);

      for (let step = 0; step <= 20; step += 1) {
        const progress = step / 20;
        const x = centerX - span / 2 + span * progress;
        const phase = progress * Math.PI * (2.5 + visual.complexity * 2) + time * (1.6 + visual.motionSpeed);
        const y = offsetY + Math.sin(phase + ribbon * 0.55) * amplitude;

        if (step === 0) {
          this.context.moveTo(x, y);
          continue;
        }

        const previousProgress = (step - 1) / 20;
        const previousX = centerX - span / 2 + span * previousProgress;
        const previousPhase =
          previousProgress * Math.PI * (2.5 + visual.complexity * 2) + time * (1.6 + visual.motionSpeed);
        const previousY = offsetY + Math.sin(previousPhase + ribbon * 0.55) * amplitude;
        const controlX = (previousX + x) / 2;
        const controlY = (previousY + y) / 2;
        this.context.quadraticCurveTo(controlX, controlY, x, y);
      }

      this.context.stroke();
    }
  }

  private drawLattice(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const lineCount = Math.max(4, Math.round(4 + visual.complexity * 6));
    const span = radius * (1.8 + visual.beamStrength * 0.7);
    const drift = Math.sin(time * (0.9 + visual.motionSpeed * 0.5)) * radius * 0.14;

    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.rotate(time * (0.08 + visual.motionSpeed * 0.18));
    this.context.lineCap = "round";

    for (let index = 0; index < lineCount; index += 1) {
      const offset = -span / 2 + (span * index) / Math.max(1, lineCount - 1);
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.18 + visual.glow * 0.16);
      this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 3 - index * 0.06);
      this.context.moveTo(-span / 2 + drift, offset);
      this.context.lineTo(span / 2 + drift, offset);
      this.context.moveTo(offset, -span / 2 - drift);
      this.context.lineTo(offset, span / 2 - drift);
      this.context.stroke();
    }

    this.context.restore();
  }

  private drawFracture(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const shardCount = Math.max(7, Math.round(7 + visual.complexity * 7));
    const rotation = time * (0.4 + visual.motionSpeed * 0.8);

    this.context.fillStyle = alphaHex(visual.color, 0.22 + visual.glow * 0.18);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.36 + visual.contrast * 0.2);
    this.context.lineWidth = Math.max(1.5, 1.4 + visual.contrast * 3);

    for (let index = 0; index < shardCount; index += 1) {
      const angle = rotation + (Math.PI * 2 * index) / shardCount;
      const innerRadius = radius * (0.18 + (index % 3) * 0.08);
      const midRadius = radius * (0.52 + ((index + 1) % 4) * 0.09);
      const outerRadius = radius * (0.88 + (index % 4) * 0.06);

      this.context.beginPath();
      this.context.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
      this.context.lineTo(centerX + Math.cos(angle + 0.08) * midRadius, centerY + Math.sin(angle + 0.08) * midRadius);
      this.context.lineTo(centerX + Math.cos(angle + 0.18) * outerRadius, centerY + Math.sin(angle + 0.18) * outerRadius);
      this.context.lineTo(centerX + Math.cos(angle + 0.34) * midRadius, centerY + Math.sin(angle + 0.34) * midRadius);
      this.context.closePath();
      this.context.fill();
      this.context.stroke();
    }
  }

  private drawParticles(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const particleCount = Math.max(10, Math.round(10 + visual.particles.density * 42));
    const orbitSpread = radius * (1.1 + visual.particles.spread);

    this.context.save();
    this.context.shadowBlur = 8 + visual.glow * 20;
    this.context.shadowColor = visual.secondaryColor;

    for (let index = 0; index < particleCount; index += 1) {
      const progress = index / particleCount;
      const angle = progress * Math.PI * 2 + time * (0.55 + visual.particles.speed * 0.6);
      const orbit =
        orbitSpread * (0.64 + ((index % 7) / 6) * 0.52 + Math.sin(time + index * 0.7) * visual.particles.spread * 0.08);
      const particleRadius = Math.max(0.9, visual.particles.size * (0.42 + (index % 3) * 0.16));
      const particleX = centerX + Math.cos(angle) * orbit;
      const particleY = centerY + Math.sin(angle * (visual.geometry === "wave" ? 1.35 : 1)) * orbit * 0.76;

      if (visual.particles.trail) {
        const tailX = centerX + Math.cos(angle - 0.18) * (orbit - radius * 0.12);
        const tailY = centerY + Math.sin((angle - 0.18) * (visual.geometry === "wave" ? 1.35 : 1)) * (orbit - radius * 0.12) * 0.76;
        this.context.beginPath();
        this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.color : visual.secondaryColor, 0.22 + visual.glow * 0.18);
        this.context.lineWidth = Math.max(0.8, particleRadius * 0.55);
        this.context.moveTo(tailX, tailY);
        this.context.lineTo(particleX, particleY);
        this.context.stroke();
      }

      this.context.beginPath();
      this.context.fillStyle =
        index % 2 === 0
          ? alphaHex(visual.color, 0.56 + visual.glow * 0.18)
          : alphaHex(visual.secondaryColor, 0.48 + visual.beamStrength * 0.2);
      this.context.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
      this.context.fill();
    }

    this.context.restore();
  }

  private drawBonusMotifs(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    if (visual.activeBonuses.length === 0) {
      return;
    }

    const activeText = visual.activeBonuses.join(" ");

    if (containsAny(activeText, ["Velvet", "Silk"])) {
      this.context.save();
      this.context.lineWidth = Math.max(1.2, 1.2 + visual.glow * 2.2);
      this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.24 + visual.glow * 0.16);
      this.context.shadowBlur = 12 + visual.glow * 20;
      this.context.shadowColor = visual.secondaryColor;
      for (let index = 0; index < 2; index += 1) {
        const ellipseRadius = radius * (1 + index * 0.16);
        const yOffset = Math.sin(time * 1.1 + index) * radius * 0.04;
        this.context.beginPath();
        this.context.arc(centerX, centerY + yOffset, ellipseRadius, Math.PI * 0.15, Math.PI * 0.85);
        this.context.stroke();
      }
      this.context.restore();
    }

    if (containsAny(activeText, ["Fracture", "Voltage", "Shrapnel"])) {
      this.context.save();
      this.context.translate(centerX, centerY);
      this.context.lineWidth = Math.max(1.4, 1.4 + visual.contrast * 2.4);
      this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.3 + visual.contrast * 0.16);
      for (let index = 0; index < 7; index += 1) {
        const angle = time * (0.8 + visual.motionSpeed * 0.7) + index * ((Math.PI * 2) / 7);
        this.context.beginPath();
        this.context.moveTo(Math.cos(angle) * radius * 0.9, Math.sin(angle) * radius * 0.9);
        this.context.lineTo(Math.cos(angle + 0.08) * radius * 1.18, Math.sin(angle + 0.08) * radius * 1.18);
        this.context.lineTo(Math.cos(angle - 0.06) * radius * 1.28, Math.sin(angle - 0.06) * radius * 1.28);
        this.context.stroke();
      }
      this.context.restore();
    }

    if (containsAny(activeText, ["Lattice", "Aurora", "Skyline", "Prism"])) {
      this.context.save();
      this.context.translate(centerX, centerY);
      this.context.rotate(-time * (0.1 + visual.motionSpeed * 0.18));
      this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 2.2);
      this.context.strokeStyle = alphaHex(visual.color, 0.2 + visual.beamStrength * 0.16);
      const span = radius * 1.28;
      for (let index = 0; index < 4; index += 1) {
        const offset = -span / 2 + (span * index) / 3;
        this.context.beginPath();
        this.context.moveTo(-span / 2, offset);
        this.context.lineTo(span / 2, offset);
        this.context.moveTo(offset, -span / 2);
        this.context.lineTo(offset, span / 2);
        this.context.stroke();
      }
      this.context.restore();
    }

    if (containsAny(activeText, ["Current", "Run", "Phase", "Tide"])) {
      this.context.save();
      this.context.lineWidth = Math.max(1.2, 1 + visual.rippleStrength * 2.8);
      this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.2 + visual.rippleStrength * 0.14);
      for (let index = 0; index < 3; index += 1) {
        const arcRadius = radius * (0.82 + index * 0.16);
        this.context.beginPath();
        this.context.arc(
          centerX + Math.cos(time * 0.8 + index) * radius * 0.08,
          centerY + Math.sin(time * 0.7 + index) * radius * 0.08,
          arcRadius,
          time * 0.4 + index * 0.7,
          time * 0.4 + index * 0.7 + Math.PI * 0.8
        );
        this.context.stroke();
      }
      this.context.restore();
    }
  }

  private drawGrain(visual: VisualParameters, width: number, height: number, time: number): void {
    const speckleCount = Math.max(8, Math.round(8 + visual.grain * 28));

    this.context.save();
    this.context.globalAlpha = 0.03 + visual.grain * 0.09;
    this.context.fillStyle = visual.secondaryColor;

    for (let index = 0; index < speckleCount; index += 1) {
      const x = ((Math.sin(index * 12.93 + time * 0.8) + 1) / 2) * width;
      const y = ((Math.cos(index * 9.17 + time * 0.6) + 1) / 2) * height;
      const size = 0.8 + (index % 3) * 0.7;
      this.context.fillRect(x, y, size, size);
    }

    this.context.restore();
  }
}

function mixHex(base: string, accent: string, ratio: number): string {
  const baseRgb = hexToRgb(base);
  const accentRgb = hexToRgb(accent);
  const mix = (left: number, right: number) => Math.round(left + (right - left) * ratio);
  return rgbToHex(mix(baseRgb[0], accentRgb[0]), mix(baseRgb[1], accentRgb[1]), mix(baseRgb[2], accentRgb[2]));
}

function alphaHex(hex: string, alpha: number): string {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue
    .toString(16)
    .padStart(2, "0")}`;
}

function containsAny(source: string, needles: string[]): boolean {
  return needles.some((needle) => source.includes(needle));
}
