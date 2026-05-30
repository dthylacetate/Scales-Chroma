import type { VisualParameters } from "../types/theory";
import { getStageClimateProfile } from "../visual_engine/stageClimateProfiles";
import { getStageDirectorCue } from "../visual_engine/stageDirectorCues";
import { getStageElementRoles } from "../visual_engine/stageElementRoles";
import { getStageMotionRig } from "../visual_engine/stageMotionRigs";
import { getStagePhraseHooks } from "../visual_engine/stagePhraseHooks";
import { getStagePhraseTrajectory } from "../visual_engine/stagePhraseTrajectories";
import { getStagePhraseVariation } from "../visual_engine/stagePhraseVariations";
import { getStageProjectionScript } from "../visual_engine/stageProjectionScripts";
import { getStageSetpiece } from "../visual_engine/stageSetpieces";
import { getStageSynergyGlyph } from "../visual_engine/stageSynergyGlyphs";
import { getStageTakeoverMode } from "../visual_engine/stageTakeoverModes";
import { getStageVoiceprints } from "../visual_engine/stageVoiceprints";

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
  private targetVisual: VisualParameters | null = null;
  private transitionStartMs: number | null = null;
  private lastTimestamp = 0;
  private transitionImpact = 0;
  private transitionImpactStartMs: number | null = null;
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
    if (!this.currentVisual) {
      this.currentVisual = visual;
      this.targetVisual = visual;
    } else if (this.running) {
      const fromVisual = this.resolveVisualAtTimestamp(this.lastTimestamp || 0);
      this.transitionImpact = this.computeTransitionImpact(fromVisual, visual);
      this.transitionImpactStartMs = this.lastTimestamp || 0;
      this.currentVisual = fromVisual;
      this.targetVisual = visual;
      this.transitionStartMs = this.lastTimestamp || 0;
    } else {
      this.currentVisual = visual;
      this.targetVisual = visual;
    }

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
    this.targetVisual = null;
    this.transitionStartMs = null;
    this.lastTimestamp = 0;
    this.transitionImpact = 0;
    this.transitionImpactStartMs = null;
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

    this.lastTimestamp = timestamp;
    const resolvedVisual = this.resolveVisualAtTimestamp(timestamp);
    this.draw(resolvedVisual, timestamp);
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
    const radius = Math.max(
      44,
      Math.min(width, height) * (0.14 + visual.energy * 0.06 + visual.luminosity * 0.04) * pulse
    );

    this.context.clearRect(0, 0, width, height);
    this.drawBackground(visual, width, height, centerX, centerY, radius, time);
    this.drawAtmosphereLayers(visual, width, height, centerX, centerY, radius, time);
    this.drawStageClimateLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStageElementRolesLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStageVoiceprintsLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStagePhraseTrajectoryLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStagePhraseHooksLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStagePhraseVariationLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStageArchitecture(visual, width, height, centerX, centerY, radius, time);
    this.drawSceneFamilyAccent(visual, width, height, centerX, centerY, radius, time);
    this.drawGrowthImprintLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawTheoryTraitLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawTheorySynergyLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawSynergyGlyphLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawSceneCascadeLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStageSetpieceLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStageLightingCueLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStageDirectorCueLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawStageProjectionScriptLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawBeamField(visual, centerX, centerY, radius, time);
    this.drawRingField(visual, centerX, centerY, radius, time);
    this.drawGeometry(visual, centerX, centerY, radius, time);
    this.drawStageMotionRigLayer(visual, width, height, centerX, centerY, radius, time);
    this.drawBonusMotifs(visual, centerX, centerY, radius, time);
    this.drawPulseConstellation(visual, centerX, centerY, radius, time);
    this.drawTransitionImpact(visual, width, height, centerX, centerY, radius, time);
    this.drawParticles(visual, centerX, centerY, radius, time);
    this.drawGrain(visual, width, height, time);
  }

  private resolveVisualAtTimestamp(timestamp: number): VisualParameters {
    if (!this.currentVisual) {
      throw new Error("Renderer visual state is unavailable");
    }

    if (!this.targetVisual || this.targetVisual === this.currentVisual || this.transitionStartMs === null) {
      return this.currentVisual;
    }

    const progress = Math.max(0, Math.min(1, (timestamp - this.transitionStartMs) / 900));
    const eased = 1 - Math.pow(1 - progress, 3);
    const interpolated = interpolateVisuals(this.currentVisual, this.targetVisual, eased);

    if (progress >= 1) {
      this.currentVisual = this.targetVisual;
      this.targetVisual = this.targetVisual;
      this.transitionStartMs = null;
      return this.currentVisual;
    }

    return interpolated;
  }

  private computeTransitionImpact(fromVisual: VisualParameters, toVisual: VisualParameters): number {
    const sceneShift = fromVisual.sceneFamily !== toVisual.sceneFamily ? 0.26 : 0;
    const signatureShift = fromVisual.signature !== toVisual.signature ? 0.2 : 0;
    const growthShift = fromVisual.growthImprint !== toVisual.growthImprint ? 0.18 : 0;
    const cascadeShift = fromVisual.sceneCascade !== toVisual.sceneCascade ? 0.26 : 0;
    const setpieceShift = getStageSetpiece(fromVisual)?.kind !== getStageSetpiece(toVisual)?.kind ? 0.18 : 0;
    const trajectoryShift = getStagePhraseTrajectory(fromVisual)?.kind !== getStagePhraseTrajectory(toVisual)?.kind ? 0.14 : 0;
    const hookShift =
      Math.abs(fromVisual.phraseHooks.length - toVisual.phraseHooks.length) > 0 ||
      Math.abs(fromVisual.phraseHookEnergy - toVisual.phraseHookEnergy) > 0.04
        ? 0.1
        : 0;
    const voiceprintShift =
      Math.abs((fromVisual.voiceprints ?? []).length - (toVisual.voiceprints ?? []).length) > 0 ||
      Math.abs((fromVisual.voiceprintIntensity ?? 0) - (toVisual.voiceprintIntensity ?? 0)) > 0.04
        ? 0.08
        : 0;
    const roleShift =
      Math.abs((fromVisual.elementRoles ?? []).length - (toVisual.elementRoles ?? []).length) > 0 ||
      Math.abs((fromVisual.elementRoleIntensity ?? 0) - (toVisual.elementRoleIntensity ?? 0)) > 0.04
        ? 0.08
        : 0;
    const variationShift = getStagePhraseVariation(fromVisual)?.kind !== getStagePhraseVariation(toVisual)?.kind ? 0.12 : 0;
    const motionShift = getStageMotionRig(fromVisual)?.kind !== getStageMotionRig(toVisual)?.kind ? 0.12 : 0;
    const projectionShift = getStageProjectionScript(fromVisual)?.kind !== getStageProjectionScript(toVisual)?.kind ? 0.12 : 0;
    const takeoverShift = getStageTakeoverMode(fromVisual)?.kind !== getStageTakeoverMode(toVisual)?.kind ? 0.12 : 0;
    const energyShift = Math.abs(fromVisual.energy - toVisual.energy) * 0.22;
    const tensionShift = Math.abs(fromVisual.modalTension - toVisual.modalTension) * 0.18;
    return Math.max(
      0,
      Math.min(
        1,
        0.12 +
          sceneShift +
          signatureShift +
          growthShift +
          cascadeShift +
          setpieceShift +
          trajectoryShift +
          hookShift +
          voiceprintShift +
          roleShift +
          variationShift +
          motionShift +
          projectionShift +
          takeoverShift +
          energyShift +
          tensionShift
      )
    );
  }

  private drawTransitionImpact(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    if (this.transitionImpact <= 0.02 || this.transitionImpactStartMs === null) {
      return;
    }

    const elapsed = Math.max(0, this.lastTimestamp - this.transitionImpactStartMs);
    const progress = Math.max(0, Math.min(1, elapsed / 1100));
    if (progress >= 1) {
      this.transitionImpact = 0;
      this.transitionImpactStartMs = null;
      return;
    }

    const fade = 1 - progress;
    const waveRadius = radius * (0.8 + progress * (2.4 + this.transitionImpact));
    const wash = this.context.createRadialGradient(centerX, centerY, radius * 0.18, centerX, centerY, waveRadius);
    wash.addColorStop(0, alphaHex(visual.secondaryColor, 0.08 * fade + this.transitionImpact * 0.08));
    wash.addColorStop(0.45, alphaHex(visual.color, 0.05 * fade + this.transitionImpact * 0.06));
    wash.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = wash;
    this.context.fillRect(0, 0, width, height);

    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + this.transitionImpact * 4 * fade);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.2 * fade + this.transitionImpact * 0.1);
    for (let index = 0; index < 3; index += 1) {
      this.context.beginPath();
      this.context.arc(
        centerX,
        centerY + Math.sin(time * 0.8 + index) * radius * 0.04,
        waveRadius * (0.7 + index * 0.16),
        0,
        Math.PI * 2
      );
      this.context.stroke();
    }

    this.drawTakeoverTransitionLayer(visual, width, height, centerX, centerY, radius, progress, fade);
    this.context.restore();
  }

  private drawTakeoverTransitionLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    fade: number
  ): void {
    const takeover = getStageTakeoverMode(visual);

    if (!takeover) {
      return;
    }

    switch (takeover.kind) {
      case "cathedral-iris":
        this.drawCathedralIrisTakeover(visual, width, height, centerX, centerY, radius, progress, fade);
        break;
      case "velvet-drape":
        this.drawVelvetDrapeTakeover(visual, width, height, centerX, centerY, radius, progress, fade);
        break;
      case "forge-slam":
        this.drawForgeSlamTakeover(visual, width, height, centerX, centerY, radius, progress, fade);
        break;
      case "prism-scanline":
        this.drawPrismScanlineTakeover(visual, width, height, centerX, centerY, radius, progress, fade);
        break;
      case "runway-rush":
        this.drawRunwayRushTakeover(visual, width, height, centerX, centerY, radius, progress, fade);
        break;
      case "eclipse-veil":
        this.drawEclipseVeilTakeover(visual, width, height, centerX, centerY, radius, progress, fade);
        break;
    }
  }

  private drawCathedralIrisTakeover(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    fade: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 * fade + this.transitionImpact * 0.08);
    this.context.lineWidth = Math.max(1.2, radius * 0.012);
    for (let index = 0; index < 4; index += 1) {
      const archRadius = radius * (1 + index * 0.2 + progress * 0.24);
      this.context.beginPath();
      this.context.arc(centerX, centerY - radius * 0.18, archRadius, Math.PI * 1.04, Math.PI * 1.96);
      this.context.stroke();
    }
  }

  private drawVelvetDrapeTakeover(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    fade: number
  ): void {
    const drapeWidth = radius * (0.34 + progress * 0.42);
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.08 * fade + this.transitionImpact * 0.06);
    this.context.fillRect(0, 0, drapeWidth, height);
    this.context.fillRect(width - drapeWidth, 0, drapeWidth, height);
  }

  private drawForgeSlamTakeover(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    fade: number
  ): void {
    const slamHeight = height * (0.12 + progress * 0.36);
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.1 * fade + this.transitionImpact * 0.08);
    this.context.fillRect(0, 0, width, slamHeight);
    this.context.fillStyle = alphaHex(visual.color, 0.08 * fade + this.transitionImpact * 0.08);
    this.context.fillRect(centerX - radius * 0.76, centerY + radius * 0.82, radius * 1.52, radius * 0.08);
  }

  private drawPrismScanlineTakeover(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    fade: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 * fade + this.transitionImpact * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.01);
    for (let index = 0; index < 6; index += 1) {
      const offset = -radius * 1.18 + (progress + index / 6) * radius * 2.36;
      this.context.beginPath();
      this.context.moveTo(centerX + offset, 0);
      this.context.lineTo(centerX + offset + radius * 0.24, height);
      this.context.stroke();
    }
  }

  private drawRunwayRushTakeover(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    fade: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 * fade + this.transitionImpact * 0.08);
    this.context.lineWidth = Math.max(1.4, radius * 0.012);
    for (let index = 0; index < 5; index += 1) {
      const y = centerY + radius * (0.86 - (progress + index * 0.12) * 1.22);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * (1.18 - index * 0.12), y);
      this.context.lineTo(centerX - radius * 0.08, y - radius * 0.08);
      this.context.moveTo(centerX + radius * (1.18 - index * 0.12), y);
      this.context.lineTo(centerX + radius * 0.08, y - radius * 0.08);
      this.context.stroke();
    }
  }

  private drawEclipseVeilTakeover(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    fade: number
  ): void {
    const veilWidth = radius * (0.3 + progress * 0.24);
    this.context.fillStyle = alphaHex(visual.backgroundColor, 0.12 * fade + this.transitionImpact * 0.08);
    this.context.fillRect(0, 0, veilWidth, height);
    this.context.fillRect(width - veilWidth, 0, veilWidth, height);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 * fade + this.transitionImpact * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.01);
    this.context.beginPath();
    this.context.arc(centerX, centerY + radius * 0.04, radius * (0.82 + progress * 0.24), Math.PI * 0.14, Math.PI * 0.86);
    this.context.stroke();
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
    backgroundGradient.addColorStop(
      0.38,
      mixHex(visual.backgroundColor, visual.secondaryColor, 0.14 + visual.depth * 0.16 + visual.luminosity * 0.08)
    );
    backgroundGradient.addColorStop(
      1,
      mixHex(visual.backgroundColor, visual.color, 0.1 + visual.temperature * 0.12 + visual.valence * 0.08)
    );

    this.context.globalAlpha = 1;
    this.context.fillStyle = backgroundGradient;
    this.context.fillRect(0, 0, width, height);

    const halo = this.context.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius * 3.1);
    halo.addColorStop(0, alphaHex(visual.color, 0.18 + visual.glow * 0.22 + visual.luminosity * 0.1));
    halo.addColorStop(0.42, alphaHex(visual.secondaryColor, 0.08 + visual.beamStrength * 0.1 + visual.valence * 0.08));
    halo.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = halo;
    this.context.fillRect(0, 0, width, height);

    const driftCount = Math.max(
      2,
      Math.min(8, Math.round(2 + visual.energy * 2 + visual.depth * 2 + visual.luminosity * 4))
    );
    for (let index = 0; index < driftCount; index += 1) {
      const orbit = radius * (1.2 + index * 0.34);
      const angle = time * (0.22 + visual.motionSpeed * 0.18) + index * 1.7;
      const glowX = centerX + Math.cos(angle) * orbit * 0.7;
      const glowY = centerY + Math.sin(angle * (1.04 + visual.symmetry * 0.18)) * orbit * (0.34 + visual.depth * 0.16);
      const glowRadius = radius * (0.7 + index * 0.18 + visual.luminosity * 0.2);
      const accent = this.context.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      accent.addColorStop(
        0,
        alphaHex(index % 2 === 0 ? visual.color : visual.secondaryColor, 0.04 + visual.temperature * 0.04 + visual.valence * 0.06)
      );
      accent.addColorStop(1, alphaHex(visual.backgroundColor, 0));
      this.context.fillStyle = accent;
      this.context.fillRect(0, 0, width, height);
    }
  }

  private drawAtmosphereLayers(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();

    if (visual.luminosity > 0.54) {
      const canopyCount = Math.max(2, Math.round(2 + visual.luminosity * 4));
      for (let index = 0; index < canopyCount; index += 1) {
        const canopyY = centerY - radius * (1.1 + index * 0.18);
        this.context.beginPath();
        this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.08 + visual.luminosity * 0.08);
        this.context.lineWidth = Math.max(1, 1 + visual.luminosity * 2.4 - index * 0.2);
        this.context.arc(centerX, canopyY, radius * (0.92 + index * 0.18), Math.PI * 0.98, Math.PI * 2.02);
        this.context.stroke();
      }
    }

    if (visual.grit > 0.4) {
      const hazeCount = Math.max(3, Math.round(3 + visual.grit * 7));
      for (let index = 0; index < hazeCount; index += 1) {
        const y = centerY + radius * (0.3 + (index / hazeCount) * 0.8);
        this.context.beginPath();
        this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.04 + visual.grit * 0.08);
        this.context.lineWidth = Math.max(1, 0.8 + visual.grit * 2.2);
        for (let step = 0; step <= 10; step += 1) {
          const progress = step / 10;
          const x = progress * width;
          const waveY = y + Math.sin(progress * Math.PI * 3 + time * (0.6 + index * 0.08)) * radius * (0.015 + visual.grit * 0.02);
          if (step === 0) {
            this.context.moveTo(x, waveY);
          } else {
            this.context.lineTo(x, waveY);
          }
        }
        this.context.stroke();
      }
    }

    this.context.restore();
  }

  private drawStageClimateLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const climate = getStageClimateProfile(visual);

    this.context.save();

    switch (climate.kind) {
      case "solar-haze":
        this.drawSolarHazeClimate(visual, width, height, centerX, centerY, radius, time);
        break;
      case "velvet-mist":
        this.drawVelvetMistClimate(visual, width, height, centerX, centerY, radius, time);
        break;
      case "ember-ash":
        this.drawEmberAshClimate(visual, width, height, centerX, centerY, radius, time);
        break;
      case "choir-dust":
        this.drawChoirDustClimate(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-fog":
        this.drawPrismFogClimate(visual, width, height, centerX, centerY, radius, time);
        break;
      case "tide-vapor":
        this.drawTideVaporClimate(visual, width, height, centerX, centerY, radius, time);
        break;
      case "neon-smog":
        this.drawNeonSmogClimate(visual, width, height, centerX, centerY, radius, time);
        break;
      case "sanctum-smoke":
        this.drawSanctumSmokeClimate(visual, width, height, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawSolarHazeClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const gradient = this.context.createRadialGradient(centerX, centerY - radius * 0.4, radius * 0.12, centerX, centerY, radius * 1.8);
    gradient.addColorStop(0, alphaHex(visual.secondaryColor, 0.08));
    gradient.addColorStop(0.6, alphaHex(visual.color, 0.05));
    gradient.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, width, height);
  }

  private drawVelvetMistClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.04 + visual.glow * 0.03);
    for (let index = 0; index < 4; index += 1) {
      const y = centerY + radius * (0.12 + index * 0.22) + Math.sin(time * 0.42 + index) * radius * 0.04;
      this.context.beginPath();
      this.context.ellipse(centerX, y, radius * (1.12 + index * 0.08), radius * 0.12, 0, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawEmberAshClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.08 + visual.grit * 0.08);
    this.context.lineWidth = Math.max(1, radius * 0.008);
    for (let index = 0; index < 18; index += 1) {
      const x = ((index + 1) / 19) * width;
      const y = centerY + radius * 0.46 + ((index % 5) - 2) * radius * 0.08;
      this.context.beginPath();
      this.context.moveTo(x, y);
      this.context.lineTo(x + radius * 0.04, y - radius * (0.06 + Math.sin(time + index) * 0.02));
      this.context.stroke();
    }
  }

  private drawChoirDustClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.04 + visual.depth * 0.03);
    for (let index = 0; index < 12; index += 1) {
      const x = centerX + Math.cos(time * 0.2 + index) * radius * (0.24 + (index % 4) * 0.16);
      const y = centerY - radius * 0.62 + ((index % 6) * radius) / 4;
      this.context.beginPath();
      this.context.arc(x, y, radius * 0.02, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawPrismFogClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.06 + visual.beamStrength * 0.08);
    this.context.lineWidth = Math.max(1, radius * 0.007);
    for (let index = 0; index < 8; index += 1) {
      const offset = -radius * 1.1 + index * radius * 0.3 + ((time * 18) % (radius * 0.3));
      this.context.beginPath();
      this.context.moveTo(centerX + offset, 0);
      this.context.lineTo(centerX + offset + radius * 0.16, height);
      this.context.stroke();
    }
  }

  private drawTideVaporClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.06 + visual.rippleStrength * 0.06);
    this.context.lineWidth = Math.max(1, radius * 0.008);
    for (let index = 0; index < 4; index += 1) {
      const y = centerY + radius * (0.28 + index * 0.16);
      this.context.beginPath();
      for (let step = 0; step <= 14; step += 1) {
        const progress = step / 14;
        const x = progress * width;
        const waveY = y + Math.sin(progress * Math.PI * 4 + time * (0.6 + index * 0.08)) * radius * 0.03;
        if (step === 0) {
          this.context.moveTo(x, waveY);
        } else {
          this.context.lineTo(x, waveY);
        }
      }
      this.context.stroke();
    }
  }

  private drawNeonSmogClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.03 + visual.energy * 0.04);
    this.context.fillRect(0, centerY + radius * 0.18, width, radius * 0.92);
    this.context.strokeStyle = alphaHex(visual.color, 0.06 + visual.motionSpeed * 0.06);
    this.context.lineWidth = Math.max(1, radius * 0.007);
    for (let index = 0; index < 6; index += 1) {
      const y = centerY + radius * (0.22 + index * 0.14);
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(width, y - radius * 0.06);
      this.context.stroke();
    }
  }

  private drawSanctumSmokeClimate(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.fillStyle = alphaHex(visual.backgroundColor, 0.06 + visual.grit * 0.05);
    for (let index = 0; index < 4; index += 1) {
      const x = centerX + Math.cos(time * 0.18 + index) * radius * 0.38;
      const y = centerY + radius * 0.18 + Math.sin(time * 0.24 + index) * radius * 0.22;
      this.context.beginPath();
      this.context.ellipse(x, y, radius * 0.46, radius * 0.14, 0, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawStagePhraseTrajectoryLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const trajectory = getStagePhraseTrajectory(visual);

    if (!trajectory) {
      return;
    }

    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + visual.phraseTrajectoryIntensity * 2.2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.phraseTrajectoryIntensity * 0.12);
    this.context.fillStyle = alphaHex(visual.color, 0.05 + visual.phraseTrajectoryIntensity * 0.04);

    switch (trajectory.kind) {
      case "lift-arc":
        this.drawLiftArcTrajectory(centerX, centerY, radius);
        break;
      case "velvet-drift":
        this.drawVelvetDriftTrajectory(width, centerX, centerY, radius, time);
        break;
      case "forge-drop":
        this.drawForgeDropTrajectory(width, centerX, centerY, radius, time);
        break;
      case "prism-climb":
        this.drawPrismClimbTrajectory(centerX, centerY, radius, time);
        break;
      case "runway-drive":
        this.drawRunwayDriveTrajectory(width, height, centerX, centerY, radius, time);
        break;
      case "shadow-sink":
        this.drawShadowSinkTrajectory(centerX, centerY, radius);
        break;
    }

    this.context.restore();
  }

  private drawStageVoiceprintsLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const voiceprints = getStageVoiceprints(visual);
    const intensity = visual.voiceprintIntensity ?? 0;

    if (voiceprints.length === 0 || intensity <= 0.05) {
      return;
    }

    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + intensity * 2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + intensity * 0.14);
    this.context.fillStyle = alphaHex(visual.color, 0.08 + intensity * 0.08);

    voiceprints.forEach((voiceprint, index) => {
      const angle = -Math.PI * 0.85 + (index / Math.max(1, voiceprints.length)) * Math.PI * 1.7;
      const anchorX = centerX + Math.cos(angle) * radius * 1.04;
      const anchorY = centerY + Math.sin(angle) * radius * 0.74;

      switch (voiceprint.kind) {
        case "sky-fan":
        case "day-arch":
        case "sun-ribbon":
          this.context.beginPath();
          for (let fan = -1; fan <= 1; fan += 1) {
            this.context.moveTo(anchorX, anchorY + radius * 0.04);
            this.context.lineTo(
              anchorX + Math.cos(angle + fan * 0.22) * radius * 0.2,
              anchorY - radius * 0.18 + Math.sin(angle + fan * 0.22) * radius * 0.06
            );
          }
          this.context.stroke();
          break;
        case "velvet-halo":
        case "dusk-orbit":
          this.context.beginPath();
          this.context.ellipse(anchorX, anchorY, radius * 0.12, radius * 0.05, time * 0.25 + index * 0.3, 0, Math.PI * 2);
          this.context.stroke();
          break;
        case "cadence-stairs":
        case "anthem-lane":
          for (let step = 0; step < 3; step += 1) {
            const stepX = anchorX - radius * 0.12 + step * radius * 0.08;
            const stepY = anchorY + radius * 0.12 - step * radius * 0.06;
            this.context.beginPath();
            this.context.moveTo(stepX, stepY);
            this.context.lineTo(stepX + radius * 0.08, stepY);
            this.context.lineTo(stepX + radius * 0.08, stepY - radius * 0.05);
            this.context.stroke();
          }
          break;
        case "voltage-spear":
        case "prism-spike":
          this.context.beginPath();
          this.context.moveTo(anchorX, anchorY + radius * 0.12);
          this.context.lineTo(anchorX + radius * 0.03, anchorY - radius * 0.14);
          this.context.lineTo(anchorX - radius * 0.05, anchorY - radius * 0.02);
          this.context.stroke();
          break;
        case "fracture-crown":
        case "altar-teeth":
          for (let spike = 0; spike < 4; spike += 1) {
            const spikeAngle = angle - 0.3 + spike * 0.2;
            this.context.beginPath();
            this.context.moveTo(anchorX + Math.cos(spikeAngle) * radius * 0.06, anchorY + Math.sin(spikeAngle) * radius * 0.04);
            this.context.lineTo(anchorX + Math.cos(spikeAngle) * radius * 0.16, anchorY - radius * 0.1 + Math.sin(spikeAngle) * radius * 0.04);
            this.context.stroke();
          }
          break;
        case "neon-ticks":
        case "brass-rails":
          for (let tick = 0; tick < 3; tick += 1) {
            const tickX = anchorX - radius * 0.08 + tick * radius * 0.08;
            this.context.beginPath();
            this.context.moveTo(tickX, anchorY - radius * 0.08);
            this.context.lineTo(tickX, anchorY + radius * 0.08);
            this.context.stroke();
          }
          break;
        case "tide-braid":
        case "chrome-flow":
        case "night-ribbon":
        case "ember-veil":
          this.context.beginPath();
          this.context.moveTo(anchorX - radius * 0.14, anchorY);
          this.context.bezierCurveTo(
            anchorX - radius * 0.06,
            anchorY - radius * 0.12,
            anchorX + radius * 0.06,
            anchorY + radius * 0.12,
            anchorX + radius * 0.14,
            anchorY
          );
          this.context.stroke();
          break;
      }
    });

    this.context.restore();
  }

  private drawStageElementRolesLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const roles = getStageElementRoles(visual);
    const intensity = visual.elementRoleIntensity ?? 0;

    if (roles.length === 0 || intensity <= 0.05) {
      return;
    }

    const anchors = roles.map((role, index) => {
      const angle = -Math.PI * 0.7 + (index / Math.max(1, roles.length - 1 || 1)) * Math.PI * 1.4;
      return {
        role,
        x: centerX + Math.cos(angle + Math.sin(time * 0.2 + index) * 0.04) * radius * (0.92 + index * 0.05),
        y: centerY + Math.sin(angle) * radius * (0.58 + index * 0.02)
      };
    });

    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + intensity * 1.8);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + intensity * 0.14);
    this.context.fillStyle = alphaHex(visual.color, 0.1 + intensity * 0.08);

    for (let index = 0; index < anchors.length - 1; index += 1) {
      const current = anchors[index];
      const next = anchors[index + 1];
      this.context.beginPath();
      this.context.moveTo(current.x, current.y);
      this.context.quadraticCurveTo(centerX, centerY - radius * 0.16, next.x, next.y);
      this.context.stroke();
    }

    anchors.forEach(({ role, x, y }) => {
      switch (role.kind) {
        case "deck":
          this.context.fillRect(x - radius * 0.06, y - radius * 0.025, radius * 0.12, radius * 0.05);
          break;
        case "lens":
          this.context.beginPath();
          this.context.ellipse(x, y, radius * 0.08, radius * 0.04, time * 0.2, 0, Math.PI * 2);
          this.context.stroke();
          break;
        case "core":
          this.context.beginPath();
          this.context.arc(x, y, radius * 0.045, 0, Math.PI * 2);
          this.context.fill();
          break;
        case "rail":
          this.context.beginPath();
          this.context.moveTo(x - radius * 0.08, y);
          this.context.lineTo(x + radius * 0.08, y);
          this.context.stroke();
          break;
      }
    });

    this.context.restore();
  }

  private drawStagePhraseHooksLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const hooks = getStagePhraseHooks(visual);

    if (hooks.length === 0 || visual.phraseHookEnergy <= 0.04) {
      return;
    }

    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + visual.phraseHookEnergy * 2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.phraseHookEnergy * 0.14);
    this.context.fillStyle = alphaHex(visual.color, 0.08 + visual.phraseHookEnergy * 0.08);

    hooks.forEach((hook, index) => {
      const offset = (index - (hooks.length - 1) / 2) * radius * 0.22;
      const anchorX = centerX + offset;
      const anchorY = centerY + radius * (-0.18 + index * 0.1);

      switch (hook.kind) {
        case "skyline-rise":
          this.context.beginPath();
          this.context.moveTo(anchorX - radius * 0.18, anchorY + radius * 0.18);
          this.context.quadraticCurveTo(anchorX, anchorY - radius * 0.28, anchorX + radius * 0.18, anchorY + radius * 0.02);
          this.context.stroke();
          break;
        case "cadence-sweep":
          this.context.beginPath();
          this.context.moveTo(anchorX - radius * 0.22, anchorY - radius * 0.08);
          this.context.quadraticCurveTo(anchorX + radius * 0.08, anchorY - radius * 0.16, anchorX + radius * 0.26, anchorY + radius * 0.06);
          this.context.stroke();
          break;
        case "velvet-link":
          this.context.beginPath();
          this.context.ellipse(anchorX, anchorY, radius * 0.14, radius * 0.05, 0, 0, Math.PI * 2);
          this.context.stroke();
          break;
        case "runway-spark":
          this.context.beginPath();
          this.context.moveTo(anchorX - radius * 0.18, anchorY + radius * 0.12);
          this.context.lineTo(anchorX + radius * 0.04, anchorY - radius * 0.08);
          this.context.lineTo(anchorX + radius * 0.18, anchorY + radius * 0.08);
          this.context.stroke();
          break;
        case "collapse-gate":
          this.context.beginPath();
          this.context.moveTo(anchorX - radius * 0.14, anchorY - radius * 0.16);
          this.context.lineTo(anchorX - radius * 0.14, anchorY + radius * 0.16);
          this.context.lineTo(anchorX + radius * 0.14, anchorY + radius * 0.16);
          this.context.lineTo(anchorX + radius * 0.14, anchorY - radius * 0.16);
          this.context.stroke();
          break;
        case "ritual-notch":
          this.context.fillRect(anchorX - radius * 0.08, anchorY - radius * 0.08, radius * 0.16, radius * 0.16);
          break;
        case "prism-ladder":
          for (let step = 0; step < 3; step += 1) {
            const stepX = anchorX - radius * 0.1 + step * radius * 0.08;
            const stepY = anchorY + radius * 0.1 - step * radius * 0.1;
            this.context.beginPath();
            this.context.moveTo(stepX, stepY);
            this.context.lineTo(stepX + radius * 0.08, stepY - radius * 0.06);
            this.context.stroke();
          }
          break;
      }
    });

    this.context.restore();
  }

  private drawStagePhraseVariationLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const variation = getStagePhraseVariation(visual);

    if (!variation || visual.phraseVariationIntensity <= 0.05) {
      return;
    }

    const intensity = visual.phraseVariationIntensity;
    this.context.save();
    this.context.lineWidth = Math.max(1.2, 1 + intensity * 2.4);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + intensity * 0.16);
    this.context.fillStyle = alphaHex(visual.color, 0.06 + intensity * 0.08);

    switch (variation.kind) {
      case "choir-step":
        for (let step = 0; step < 4; step += 1) {
          const stepWidth = radius * (0.18 + step * 0.1);
          const stepY = centerY + radius * (0.34 - step * 0.16);
          this.context.beginPath();
          this.context.moveTo(centerX - stepWidth, stepY);
          this.context.lineTo(centerX + stepWidth, stepY);
          this.context.lineTo(centerX + stepWidth * 0.76, stepY - radius * 0.08);
          this.context.lineTo(centerX - stepWidth * 0.76, stepY - radius * 0.08);
          this.context.closePath();
          this.context.stroke();
        }
        break;
      case "silk-orbit":
        for (let ring = 0; ring < 3; ring += 1) {
          const orbitRadiusX = radius * (0.34 + ring * 0.1);
          const orbitRadiusY = radius * (0.12 + ring * 0.06);
          this.context.beginPath();
          this.context.ellipse(
            centerX + Math.sin(time * 0.5 + ring) * radius * 0.06,
            centerY - radius * 0.06 + ring * radius * 0.04,
            orbitRadiusX,
            orbitRadiusY,
            time * 0.12 + ring * 0.24,
            0,
            Math.PI * 2
          );
          this.context.stroke();
        }
        break;
      case "hammer-fall":
        for (let index = 0; index < 3; index += 1) {
          const x = centerX + (index - 1) * radius * 0.28;
          this.context.beginPath();
          this.context.moveTo(x, centerY - radius * (0.92 - index * 0.08));
          this.context.lineTo(x, centerY + radius * 0.34);
          this.context.stroke();
          this.context.fillRect(x - radius * 0.08, centerY + radius * 0.24, radius * 0.16, radius * 0.16);
        }
        break;
      case "phase-spiral":
        this.context.beginPath();
        for (let index = 0; index <= 56; index += 1) {
          const t = index / 56;
          const angle = t * Math.PI * 3.2 + time * 0.4;
          const spiralRadius = radius * (0.16 + t * 0.54);
          const x = centerX + Math.cos(angle) * spiralRadius;
          const y = centerY + Math.sin(angle) * spiralRadius * 0.68 - radius * 0.18;
          if (index === 0) {
            this.context.moveTo(x, y);
          } else {
            this.context.lineTo(x, y);
          }
        }
        this.context.stroke();
        break;
      case "spark-chase":
        for (let index = 0; index < 5; index += 1) {
          const anchorX = centerX - radius * 0.56 + index * radius * 0.28;
          const anchorY = centerY + radius * 0.42 - index * radius * 0.06;
          this.context.beginPath();
          this.context.moveTo(anchorX - radius * 0.08, anchorY + radius * 0.04);
          this.context.lineTo(anchorX + radius * 0.05, anchorY - radius * 0.08);
          this.context.lineTo(anchorX + radius * 0.12, anchorY + radius * 0.04);
          this.context.stroke();
        }
        break;
    }

    this.context.restore();
  }

  private drawLiftArcTrajectory(centerX: number, centerY: number, radius: number): void {
    for (let index = 0; index < 3; index += 1) {
      const lift = radius * (1.06 + index * 0.12);
      this.context.beginPath();
      this.context.moveTo(centerX - lift, centerY + radius * 0.7);
      this.context.bezierCurveTo(
        centerX - radius * 0.82,
        centerY - radius * (0.22 + index * 0.06),
        centerX - radius * 0.18,
        centerY - radius * (0.96 + index * 0.04),
        centerX,
        centerY - radius * 1.12
      );
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(centerX + lift, centerY + radius * 0.7);
      this.context.bezierCurveTo(
        centerX + radius * 0.82,
        centerY - radius * (0.22 + index * 0.06),
        centerX + radius * 0.18,
        centerY - radius * (0.96 + index * 0.04),
        centerX,
        centerY - radius * 1.12
      );
      this.context.stroke();
    }

    this.context.fillRect(centerX - radius * 0.06, centerY - radius * 1.04, radius * 0.12, radius * 0.24);
  }

  private drawVelvetDriftTrajectory(width: number, centerX: number, centerY: number, radius: number, time: number): void {
    for (let index = 0; index < 4; index += 1) {
      const y = centerY - radius * 0.48 + index * radius * 0.34;
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.22, y);
      this.context.bezierCurveTo(
        centerX - radius * 0.64,
        y - radius * (0.18 + Math.sin(time * 0.3 + index) * 0.06),
        centerX + radius * 0.24,
        y + radius * (0.22 + Math.cos(time * 0.28 + index) * 0.06),
        width - radius * 0.18,
        y - radius * 0.06
      );
      this.context.stroke();
    }
  }

  private drawForgeDropTrajectory(width: number, centerX: number, centerY: number, radius: number, time: number): void {
    for (let index = 0; index < 5; index += 1) {
      const x = centerX - radius * 0.92 + index * radius * 0.46;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 1.08);
      this.context.lineTo(x + Math.sin(time * 0.4 + index) * radius * 0.06, centerY + radius * 0.56);
      this.context.stroke();
    }
    this.context.fillRect(centerX - radius * 0.36, centerY + radius * 0.46, radius * 0.72, radius * 0.12);
  }

  private drawPrismClimbTrajectory(centerX: number, centerY: number, radius: number, time: number): void {
    for (let index = 0; index < 5; index += 1) {
      const startX = centerX - radius * 0.94 + index * radius * 0.24;
      const startY = centerY + radius * 0.82 - index * radius * 0.26;
      this.context.beginPath();
      this.context.moveTo(startX, startY);
      this.context.lineTo(startX + radius * 0.26, startY - radius * 0.2);
      this.context.lineTo(startX + radius * 0.38, startY - radius * 0.44);
      this.context.lineTo(startX + radius * 0.62, startY - radius * 0.64);
      this.context.stroke();
    }
    this.context.beginPath();
    this.context.arc(centerX + Math.sin(time * 0.3) * radius * 0.08, centerY - radius * 0.82, radius * 0.08, 0, Math.PI * 2);
    this.context.fill();
  }

  private drawRunwayDriveTrajectory(
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    for (let index = 0; index < 7; index += 1) {
      const progress = index / 6;
      const x = progress * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(centerX + (x - centerX) * 0.1, centerY - radius * 0.18);
      this.context.stroke();
    }
    this.context.beginPath();
    this.context.moveTo(centerX, height);
    this.context.lineTo(centerX, centerY - radius * 0.32);
    this.context.stroke();
  }

  private drawShadowSinkTrajectory(centerX: number, centerY: number, radius: number): void {
    for (let index = 0; index < 4; index += 1) {
      this.context.beginPath();
      this.context.ellipse(
        centerX,
        centerY + radius * (0.18 + index * 0.12),
        radius * (0.96 - index * 0.14),
        radius * 0.18,
        0,
        0,
        Math.PI * 2
      );
      this.context.stroke();
    }
    for (let index = 0; index < 5; index += 1) {
      const x = centerX - radius * 0.82 + index * radius * 0.4;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 0.74);
      this.context.lineTo(centerX + (x - centerX) * 0.16, centerY + radius * 0.72);
      this.context.stroke();
    }
    this.context.fillRect(centerX - radius * 0.08, centerY + radius * 0.56, radius * 0.16, radius * 0.22);
  }

  private drawStageArchitecture(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const horizonY = centerY + radius * (0.72 - visual.depth * 0.16);
    const floorGradient = this.context.createLinearGradient(0, horizonY, 0, height);
    floorGradient.addColorStop(0, alphaHex(visual.secondaryColor, 0.02 + visual.depth * 0.06));
    floorGradient.addColorStop(1, alphaHex(visual.color, 0.18 + visual.depth * 0.1));
    this.context.fillStyle = floorGradient;
    this.context.fillRect(0, horizonY, width, height - horizonY);

    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + visual.symmetry * 2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.1 + visual.depth * 0.08);
    this.context.beginPath();
    this.context.moveTo(0, horizonY);
    this.context.lineTo(width, horizonY);
    this.context.stroke();

    const laneCount = Math.max(2, Math.round(2 + visual.symmetry * 5));
    for (let index = 0; index < laneCount; index += 1) {
      const offset = ((index + 1) / (laneCount + 1) - 0.5) * radius * (1.8 + visual.symmetry * 0.8);
      const baseX = centerX + offset;
      this.context.beginPath();
      this.context.moveTo(baseX, horizonY);
      this.context.lineTo(centerX + offset * (0.18 + visual.symmetry * 0.18), centerY + radius * 0.08);
      this.context.stroke();
    }

    const columnCount = Math.max(0, Math.round(visual.symmetry * 4));
    for (let index = 0; index < columnCount; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const tier = Math.floor(index / 2) + 1;
      const columnX = centerX + side * radius * (0.7 + tier * 0.24);
      const columnTop = centerY - radius * (0.92 + Math.sin(time * 0.4 + tier) * 0.04);
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.color : visual.secondaryColor, 0.08 + visual.depth * 0.12);
      this.context.moveTo(columnX, horizonY);
      this.context.lineTo(columnX, columnTop);
      this.context.stroke();
    }

    this.drawSceneFamilyArchitecture(visual, width, height, centerX, centerY, radius, horizonY, time);
    this.context.restore();
  }

  private drawSceneFamilyArchitecture(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    horizonY: number,
    time: number
  ): void {
    switch (visual.sceneFamily) {
      case "solar-garden":
        this.drawSolarGardenArchitecture(visual, centerX, centerY, radius, horizonY, time);
        break;
      case "velvet-chamber":
        this.drawVelvetChamberArchitecture(visual, width, height, centerX, centerY, radius);
        break;
      case "metal-foundry":
        this.drawMetalFoundryArchitecture(visual, width, centerX, centerY, radius, horizonY);
        break;
      case "jazz-cathedral":
        this.drawJazzCathedralArchitecture(visual, centerX, centerY, radius, horizonY, time);
        break;
      case "prism-array":
        this.drawPrismArrayArchitecture(visual, centerX, centerY, radius, horizonY, time);
        break;
      case "nocturne-tide":
        this.drawNocturneTideArchitecture(visual, width, centerX, centerY, radius, horizonY, time);
        break;
      case "shadow-sanctum":
        this.drawShadowSanctumArchitecture(visual, centerX, centerY, radius, horizonY, time);
        break;
      default:
        this.drawNeonGridArchitecture(visual, width, height, centerX, radius, horizonY);
        break;
    }
  }

  private drawSolarGardenArchitecture(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    horizonY: number,
    time: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.color, 0.14 + visual.luminosity * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.luminosity * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const terraceY = horizonY - radius * (0.1 + index * 0.14);
      const terraceWidth = radius * (1.8 - index * 0.22);
      this.context.beginPath();
      this.context.moveTo(centerX - terraceWidth / 2, terraceY);
      this.context.lineTo(centerX + terraceWidth / 2, terraceY);
      this.context.stroke();
    }
    for (let index = 0; index < 3; index += 1) {
      const angle = time * 0.2 + index * 0.7;
      this.context.beginPath();
      this.context.moveTo(centerX, horizonY);
      this.context.lineTo(centerX + Math.cos(angle) * radius * 1.18, centerY - radius * (0.8 + index * 0.08));
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawVelvetChamberArchitecture(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    this.context.save();
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.05 + visual.glow * 0.06);
    this.context.beginPath();
    this.context.ellipse(centerX, centerY + radius * 0.92, radius * 1.26, radius * 0.24, 0, 0, Math.PI * 2);
    this.context.fill();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.glow * 1.6);
    this.context.beginPath();
    this.context.moveTo(radius * 0.18, height * 0.08);
    this.context.lineTo(radius * 0.18, height * 0.86);
    this.context.moveTo(width - radius * 0.18, height * 0.08);
    this.context.lineTo(width - radius * 0.18, height * 0.86);
    this.context.stroke();
    this.context.restore();
  }

  private drawMetalFoundryArchitecture(
    visual: VisualParameters,
    width: number,
    centerX: number,
    centerY: number,
    radius: number,
    horizonY: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.grit * 0.08);
    this.context.lineWidth = Math.max(1.2, 1.2 + visual.grit * 1.8);
    const gantryY = centerY - radius * 0.86;
    this.context.beginPath();
    this.context.moveTo(centerX - radius * 1.26, gantryY);
    this.context.lineTo(centerX + radius * 1.26, gantryY);
    this.context.stroke();
    for (let index = 0; index < 5; index += 1) {
      const progress = index / 4;
      const x = centerX - radius * 1.12 + progress * radius * 2.24;
      this.context.beginPath();
      this.context.moveTo(x, gantryY);
      this.context.lineTo(x, horizonY - radius * 0.08);
      this.context.stroke();
    }
    for (let index = 0; index < 7; index += 1) {
      const x = ((index + 1) / 8) * width;
      this.context.beginPath();
      this.context.moveTo(x - radius * 0.04, horizonY + radius * 0.12);
      this.context.lineTo(x + radius * 0.04, horizonY + radius * 0.2);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawJazzCathedralArchitecture(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    horizonY: number,
    time: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.symmetry * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.symmetry * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const span = radius * (0.94 + index * 0.14);
      this.context.beginPath();
      this.context.moveTo(centerX - span, horizonY);
      this.context.quadraticCurveTo(centerX, centerY - radius * (1 + index * 0.08) + Math.sin(time * 0.4 + index) * radius * 0.03, centerX + span, horizonY);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawPrismArrayArchitecture(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    horizonY: number,
    time: number
  ): void {
    this.context.save();
    this.context.translate(centerX, centerY + radius * 0.12);
    this.context.rotate(Math.sin(time * 0.5) * 0.05);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.luminosity * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const topY = -radius * (1.02 - index * 0.1);
      const baseY = horizonY - (centerY + radius * 0.12) + index * radius * 0.08;
      const halfWidth = radius * (0.18 + index * 0.12);
      this.context.beginPath();
      this.context.moveTo(0, topY);
      this.context.lineTo(-halfWidth, baseY);
      this.context.lineTo(halfWidth, baseY);
      this.context.closePath();
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawNocturneTideArchitecture(
    visual: VisualParameters,
    width: number,
    centerX: number,
    centerY: number,
    radius: number,
    horizonY: number,
    time: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.rippleStrength * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.rippleStrength * 1.8);
    for (let index = 0; index < 3; index += 1) {
      const y = horizonY + radius * (0.08 + index * 0.12);
      this.context.beginPath();
      for (let step = 0; step <= 14; step += 1) {
        const progress = step / 14;
        const x = progress * width;
        const waveY = y + Math.sin(progress * Math.PI * 5 + time * (0.8 + index * 0.12)) * radius * 0.02;
        if (step === 0) {
          this.context.moveTo(x, waveY);
        } else {
          this.context.lineTo(x, waveY);
        }
      }
      this.context.stroke();
    }
    this.context.beginPath();
    this.context.moveTo(centerX, horizonY);
    this.context.lineTo(centerX, centerY - radius * 0.76);
    this.context.stroke();
    this.context.restore();
  }

  private drawShadowSanctumArchitecture(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    horizonY: number,
    time: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.grit * 0.1);
    this.context.lineWidth = Math.max(1, 1 + visual.grit * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const angle = time * 0.04 + index * (Math.PI / 2);
      const outerX = centerX + Math.cos(angle) * radius * 1.24;
      const outerY = centerY + Math.sin(angle) * radius * 0.96;
      this.context.beginPath();
      this.context.moveTo(centerX, horizonY - radius * 0.12);
      this.context.lineTo(outerX, outerY);
      this.context.stroke();
    }
    for (let index = 0; index < 3; index += 1) {
      const ringRadius = radius * (0.9 + index * 0.18);
      this.context.beginPath();
      this.context.arc(centerX, centerY + radius * 0.06, ringRadius, 0, Math.PI * 2);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawNeonGridArchitecture(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    radius: number,
    horizonY: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.beamStrength * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 1.4);
    const lineCount = 9;
    for (let index = 0; index < lineCount; index += 1) {
      const progress = index / (lineCount - 1);
      const x = progress * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(centerX + (x - centerX) * 0.08, horizonY);
      this.context.stroke();
    }
    for (let index = 0; index < 6; index += 1) {
      const y = horizonY + index * radius * 0.1;
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(width, y);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawSceneFamilyAccent(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    switch (visual.sceneFamily) {
      case "solar-garden":
        this.drawSolarGardenAccent(visual, centerX, centerY, radius, time);
        break;
      case "velvet-chamber":
        this.drawVelvetChamberAccent(visual, width, height, centerX, centerY, radius, time);
        break;
      case "metal-foundry":
        this.drawMetalFoundryAccent(visual, width, height, centerX, centerY, radius, time);
        break;
      case "jazz-cathedral":
        this.drawJazzCathedralAccent(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-array":
        this.drawPrismArrayAccent(visual, centerX, centerY, radius, time);
        break;
      case "nocturne-tide":
        this.drawNocturneTideAccent(visual, width, centerX, centerY, radius, time);
        break;
      case "shadow-sanctum":
        this.drawShadowSanctumAccent(visual, centerX, centerY, radius, time);
        break;
      default:
        this.drawNeonGridAccent(visual, width, height, centerX, centerY, radius, time);
        break;
    }
  }

  private drawGrowthImprintLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    if (visual.growthImprint === "neutral" || visual.growthImprintIntensity <= 0.08) {
      return;
    }

    switch (visual.growthImprint) {
      case "pentatonic-drive":
        this.drawPentatonicDriveImprint(visual, width, height, centerX, centerY, radius, time);
        break;
      case "jazz-lattice":
        this.drawJazzLatticeImprint(visual, width, height, centerX, centerY, radius, time);
        break;
      case "metal-forge":
        this.drawMetalForgeImprint(visual, width, height, centerX, centerY, radius, time);
        break;
      case "neo-soul-veil":
        this.drawNeoSoulVeilImprint(visual, width, height, centerX, centerY, radius, time);
        break;
      case "fusion-phase":
        this.drawFusionPhaseImprint(visual, width, height, centerX, centerY, radius, time);
        break;
    }
  }

  private drawTheoryTraitLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();

    if (visual.openness > 0.44) {
      this.drawOpennessFans(visual, centerX, centerY, radius, time);
    }

    if (visual.attack > 0.38) {
      this.drawAttackSpikes(visual, centerX, centerY, radius, time);
    }

    if (visual.swing > 0.42) {
      this.drawSwingLilt(visual, width, centerX, centerY, radius, time);
    }

    if (visual.gravity > 0.4) {
      this.drawGravityTethers(visual, width, height, centerX, centerY, radius, time);
    }

    this.context.restore();
  }

  private drawTheorySynergyLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();

    if (visual.synergyResonance > 0.44) {
      this.drawSynergyResonanceMesh(visual, centerX, centerY, radius, time);
    }

    if (visual.cadencePull > 0.44) {
      this.drawCadenceConvergence(visual, width, height, centerX, centerY, radius, time);
    }

    if (visual.modalTension > 0.42) {
      this.drawModalTensionCrossings(visual, centerX, centerY, radius, time);
    }

    if (visual.blendCohesion > 0.44) {
      this.drawBlendCohesionBraids(visual, centerX, centerY, radius, time);
    }

    this.context.restore();
  }

  private drawSynergyGlyphLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const glyph = getStageSynergyGlyph(visual);

    if (!glyph) {
      return;
    }

    this.context.save();

    switch (glyph.kind) {
      case "horizon-bloom":
        this.drawHorizonBloomGlyph(visual, centerX, centerY, radius, time);
        break;
      case "abyss-pressure":
        this.drawAbyssPressureGlyph(visual, centerX, centerY, radius, time);
        break;
      case "slipstream-pocket":
        this.drawSlipstreamPocketGlyph(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-surge":
        this.drawPrismSurgeGlyph(visual, centerX, centerY, radius, time);
        break;
      case "cadence-spine":
        this.drawCadenceSpineGlyph(visual, width, height, centerX, centerY, radius, time);
        break;
      case "radiant-fan":
        this.drawRadiantFanGlyph(visual, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawHorizonBloomGlyph(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.synergyResonance * 0.1);
    this.context.lineWidth = Math.max(1.4, radius * 0.012);
    for (let index = 0; index < 6; index += 1) {
      const angle = Math.PI * (1.08 + index * 0.14);
      this.context.beginPath();
      this.context.moveTo(centerX, centerY + radius * 0.08);
      this.context.lineTo(
        centerX + Math.cos(angle + time * 0.04) * radius * 1.12,
        centerY + Math.sin(angle + time * 0.04) * radius * 0.82
      );
      this.context.stroke();
    }
    this.context.beginPath();
    this.context.arc(centerX, centerY + radius * 0.06, radius * 0.78, Math.PI * 1.04, Math.PI * 1.96);
    this.context.stroke();
  }

  private drawAbyssPressureGlyph(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.modalTension * 0.1);
    this.context.lineWidth = Math.max(1.3, radius * 0.011);
    for (let index = 0; index < 4; index += 1) {
      const ringRadius = radius * (0.46 + index * 0.14);
      this.context.beginPath();
      this.context.arc(centerX, centerY + radius * 0.08, ringRadius, 0, Math.PI * 2);
      this.context.stroke();
    }
    for (let index = 0; index < 5; index += 1) {
      const angle = time * 0.05 + index * ((Math.PI * 2) / 5);
      this.context.beginPath();
      this.context.moveTo(centerX + Math.cos(angle) * radius * 0.24, centerY + radius * 0.08 + Math.sin(angle) * radius * 0.24);
      this.context.lineTo(centerX + Math.cos(angle) * radius * 0.86, centerY + radius * 0.08 + Math.sin(angle) * radius * 0.86);
      this.context.stroke();
    }
  }

  private drawSlipstreamPocketGlyph(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.swing * 0.1);
    this.context.lineWidth = Math.max(1.4, radius * 0.012);
    for (let index = 0; index < 4; index += 1) {
      const y = centerY + radius * (0.16 + index * 0.18);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.08, y);
      this.context.quadraticCurveTo(centerX, y - radius * (0.12 + Math.sin(time * 0.8 + index) * 0.03), centerX + radius * 1.08, y);
      this.context.stroke();
    }
  }

  private drawPrismSurgeGlyph(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.beamStrength * 0.1);
    this.context.lineWidth = Math.max(1.3, radius * 0.011);
    for (let index = 0; index < 3; index += 1) {
      const scale = 0.48 + index * 0.18;
      this.context.save();
      this.context.translate(centerX, centerY + radius * 0.02);
      this.context.rotate(time * 0.08 + index * 0.18);
      this.context.beginPath();
      this.context.moveTo(0, -radius * scale);
      this.context.lineTo(radius * scale * 0.86, radius * scale * 0.52);
      this.context.lineTo(-radius * scale * 0.86, radius * scale * 0.52);
      this.context.closePath();
      this.context.stroke();
      this.context.restore();
    }
  }

  private drawCadenceSpineGlyph(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.color, 0.12 + visual.cadencePull * 0.12);
    this.context.lineWidth = Math.max(1.3, radius * 0.011);
    for (let index = 0; index < 5; index += 1) {
      const x = centerX - radius * 0.82 + index * radius * 0.41;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(centerX, centerY + radius * 0.14);
      this.context.stroke();
    }
  }

  private drawRadiantFanGlyph(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.glow * 0.1);
    this.context.lineWidth = Math.max(1.4, radius * 0.012);
    for (let index = 0; index < 5; index += 1) {
      const angle = Math.PI * (1.18 + index * 0.08);
      this.context.beginPath();
      this.context.moveTo(centerX, centerY + radius * 0.12);
      this.context.lineTo(
        centerX + Math.cos(angle - time * 0.03) * radius * 1.04,
        centerY + Math.sin(angle - time * 0.03) * radius * 0.76
      );
      this.context.stroke();
    }
  }

  private drawSceneCascadeLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    if (visual.sceneCascade === "neutral" || visual.sceneCascadeIntensity <= 0.08) {
      return;
    }

    this.context.save();

    switch (visual.sceneCascade) {
      case "aurora-dais":
        this.drawAuroraDaisCascade(visual, width, height, centerX, centerY, radius, time);
        break;
      case "velvet-arcade":
        this.drawVelvetArcadeCascade(visual, width, height, centerX, centerY, radius, time);
        break;
      case "forge-ritual":
        this.drawForgeRitualCascade(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-vortex":
        this.drawPrismVortexCascade(visual, width, height, centerX, centerY, radius, time);
        break;
      case "tide-runway":
        this.drawTideRunwayCascade(visual, width, height, centerX, centerY, radius, time);
        break;
      case "eclipse-altar":
        this.drawEclipseAltarCascade(visual, width, height, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawStageSetpieceLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const setpiece = getStageSetpiece(visual);

    if (!setpiece) {
      return;
    }

    this.context.save();

    switch (setpiece.kind) {
      case "choir-vault":
        this.drawChoirVaultSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "silken-halo":
        this.drawSilkenHaloSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "rose-arcade":
        this.drawRoseArcadeSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "blue-cloister":
        this.drawBlueCloisterSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "forge-throne":
        this.drawForgeThroneSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "phase-cloister":
        this.drawPhaseCloisterSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "neon-causeway":
        this.drawNeonCausewaySetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "aurora-dais":
        this.drawAuroraDaisSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "velvet-arcade":
        this.drawVelvetArcadeSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "eclipse-altar":
        this.drawEclipseAltarSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-vortex":
        this.drawPrismVortexSetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
      case "tide-runway":
        this.drawTideRunwaySetpiece(visual, width, height, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawStageLightingCueLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const setpiece = getStageSetpiece(visual);

    if (!setpiece) {
      return;
    }

    this.context.save();

    switch (setpiece.kind) {
      case "choir-vault":
      case "aurora-dais":
      case "blue-cloister":
        this.drawOverheadChoirLights(visual, width, height, centerX, centerY, radius, time);
        break;
      case "silken-halo":
      case "rose-arcade":
      case "velvet-arcade":
        this.drawVelvetWashLights(visual, width, height, centerX, centerY, radius, time);
        break;
      case "forge-throne":
      case "eclipse-altar":
        this.drawForgePressureLights(visual, width, height, centerX, centerY, radius, time);
        break;
      case "phase-cloister":
      case "prism-vortex":
        this.drawPrismSweepLights(visual, width, height, centerX, centerY, radius, time);
        break;
      case "neon-causeway":
      case "tide-runway":
        this.drawRunwayCueLights(visual, width, height, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawStageDirectorCueLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const cue = getStageDirectorCue(visual);

    if (!cue) {
      return;
    }

    this.context.save();

    switch (cue.kind) {
      case "cathedral-descent":
        this.drawCathedralDescentCue(visual, width, height, centerX, centerY, radius, time);
        break;
      case "silk-breath":
        this.drawSilkBreathCue(visual, width, height, centerX, centerY, radius, time);
        break;
      case "arcade-sway":
        this.drawArcadeSwayCue(visual, width, height, centerX, centerY, radius, time);
        break;
      case "forge-hammer":
        this.drawForgeHammerCue(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-scan":
        this.drawPrismScanCue(visual, width, height, centerX, centerY, radius, time);
        break;
      case "runway-chase":
        this.drawRunwayChaseCue(visual, width, height, centerX, centerY, radius, time);
        break;
      case "altar-eclipse":
        this.drawAltarEclipseCue(visual, width, height, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawCathedralDescentCue(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const groupPulse = 0.5 + 0.5 * Math.sin(time * (0.8 + visual.motionSpeed * 0.4));

    for (let index = 0; index < 6; index += 1) {
      const progress = index / 5;
      const beamHeight = height * (0.26 + progress * 0.32 + groupPulse * 0.04);
      const beamWidth = radius * (0.05 + progress * 0.02);
      const x = centerX - radius * 0.92 + progress * radius * 1.84;
      const alpha = 0.06 + visual.glow * 0.08 + progress * 0.05 + groupPulse * 0.04;
      const gradient = this.context.createLinearGradient(x, 0, x, beamHeight);

      gradient.addColorStop(0, alphaHex(visual.secondaryColor, alpha * 0.9));
      gradient.addColorStop(0.55, alphaHex(visual.color, alpha));
      gradient.addColorStop(1, alphaHex(visual.secondaryColor, 0));
      this.context.fillStyle = gradient;
      this.context.fillRect(x - beamWidth / 2, 0, beamWidth, beamHeight);
    }

    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.01);
    for (let index = 0; index < 3; index += 1) {
      const ringRadius = radius * (0.42 + index * 0.22 + groupPulse * 0.02);
      this.context.beginPath();
      this.context.arc(centerX, centerY - radius * 0.92 + index * radius * 0.16, ringRadius, Math.PI * 1.05, Math.PI * 1.95);
      this.context.stroke();
    }
  }

  private drawSilkBreathCue(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const breath = 0.5 + 0.5 * Math.sin(time * (1.2 + visual.motionSpeed * 0.6));

    for (const direction of [-1, 1]) {
      const veilGradient = this.context.createLinearGradient(
        centerX + direction * radius * 0.6,
        centerY - radius * 1.2,
        centerX + direction * radius * 1.18,
        centerY + radius * 1.16
      );
      veilGradient.addColorStop(0, alphaHex(visual.secondaryColor, 0));
      veilGradient.addColorStop(0.4, alphaHex(visual.secondaryColor, 0.08 + breath * 0.06));
      veilGradient.addColorStop(1, alphaHex(visual.color, 0.18 + visual.glow * 0.08));
      this.context.fillStyle = veilGradient;
      this.context.beginPath();
      this.context.moveTo(centerX + direction * radius * 0.28, centerY - radius * 1.08);
      this.context.bezierCurveTo(
        centerX + direction * radius * (0.72 + breath * 0.08),
        centerY - radius * 0.44,
        centerX + direction * radius * (0.98 + breath * 0.06),
        centerY + radius * 0.42,
        centerX + direction * radius * 0.44,
        centerY + radius * 1.18
      );
      this.context.lineTo(centerX + direction * radius * 0.18, centerY + radius * 1.18);
      this.context.closePath();
      this.context.fill();
    }

    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + breath * 0.08);
    this.context.lineWidth = Math.max(1.2, radius * 0.012);
    this.context.beginPath();
    this.context.ellipse(centerX, centerY + radius * 0.06, radius * (0.74 + breath * 0.05), radius * (0.5 + breath * 0.04), 0, 0, Math.PI * 2);
    this.context.stroke();
  }

  private drawArcadeSwayCue(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const sway = Math.sin(time * (1.1 + visual.swing * 1.6));
    this.context.strokeStyle = alphaHex(visual.color, 0.14 + visual.swing * 0.1);
    this.context.lineWidth = Math.max(1.4, radius * 0.013);

    for (let index = 0; index < 5; index += 1) {
      const progress = index / 4;
      const y = centerY + radius * (0.68 + progress * 0.12);
      const waveOffset = sway * radius * (0.08 + progress * 0.02);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.12, y);
      this.context.quadraticCurveTo(centerX, y - waveOffset, centerX + radius * 1.12, y);
      this.context.stroke();
    }

    for (let index = 0; index < 9; index += 1) {
      const progress = index / 8;
      const x = centerX - radius * 1.04 + progress * radius * 2.08;
      const flare = 0.2 + 0.8 * Math.max(0, Math.sin(time * 1.3 + progress * Math.PI));
      this.context.fillStyle = alphaHex(visual.secondaryColor, 0.12 + flare * 0.08);
      this.context.beginPath();
      this.context.arc(x, centerY + radius * 0.84 + sway * radius * 0.03, radius * (0.02 + flare * 0.014), 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawForgeHammerCue(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const strike = Math.pow(Math.max(0, Math.sin(time * (1.6 + visual.attack * 2.1))), 3);
    const laneWidth = radius * 0.16;

    for (const x of [centerX - radius * 0.38, centerX, centerX + radius * 0.38]) {
      const beamGradient = this.context.createLinearGradient(x, centerY - radius * 1.3, x, centerY + radius * 0.48);
      beamGradient.addColorStop(0, alphaHex(visual.secondaryColor, 0));
      beamGradient.addColorStop(0.45, alphaHex(visual.secondaryColor, 0.08 + strike * 0.12));
      beamGradient.addColorStop(1, alphaHex(visual.color, 0.18 + strike * 0.2));
      this.context.fillStyle = beamGradient;
      this.context.fillRect(x - laneWidth / 2, centerY - radius * 1.2, laneWidth, radius * (1.52 + strike * 0.14));
    }

    this.context.fillStyle = alphaHex(visual.color, 0.18 + strike * 0.18);
    this.context.fillRect(centerX - radius * 0.88, centerY + radius * 0.82, radius * 1.76, radius * (0.06 + strike * 0.04));
  }

  private drawPrismScanCue(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const scan = (time * (0.24 + visual.motionSpeed * 0.08)) % 1;
    const sweepX = centerX - radius * 1.2 + scan * radius * 2.4;
    const setLineDash = this.context.setLineDash?.bind(this.context);

    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.01);
    setLineDash?.([radius * 0.06, radius * 0.04]);
    for (let index = 0; index < 5; index += 1) {
      const offset = index * radius * 0.16;
      this.context.beginPath();
      this.context.moveTo(sweepX - radius * 0.42, centerY - radius * 1.18 + offset);
      this.context.lineTo(sweepX + radius * 0.22, centerY + radius * 1.06 - offset * 0.42);
      this.context.stroke();
    }
    setLineDash?.([]);
  }

  private drawRunwayChaseCue(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const progress = (time * (0.44 + visual.motionSpeed * 0.14)) % 1;

    for (const direction of [-1, 1]) {
      for (let index = 0; index < 8; index += 1) {
        const step = (progress + index / 8) % 1;
        const x = centerX + direction * radius * (0.2 + step * 0.94);
        const y = centerY + radius * (0.88 - step * 1.08);
        const size = radius * (0.018 + (1 - step) * 0.018);
        this.context.fillStyle = alphaHex(visual.secondaryColor, 0.08 + (1 - step) * 0.14);
        this.context.beginPath();
        this.context.arc(x, y, size, 0, Math.PI * 2);
        this.context.fill();
      }
    }

    this.context.strokeStyle = alphaHex(visual.color, 0.12 + visual.energy * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.009);
    this.context.beginPath();
    this.context.moveTo(centerX - radius * 1.18, centerY + radius * 0.92);
    this.context.lineTo(centerX - radius * 0.14, centerY - radius * 1.04);
    this.context.moveTo(centerX + radius * 1.18, centerY + radius * 0.92);
    this.context.lineTo(centerX + radius * 0.14, centerY - radius * 1.04);
    this.context.stroke();
  }

  private drawAltarEclipseCue(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const sweep = (time * (0.16 + visual.motionSpeed * 0.08)) % 1;
    const startAngle = sweep * Math.PI * 2;
    const endAngle = startAngle + Math.PI * (0.44 + visual.gravity * 0.18);

    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + visual.grit * 0.1);
    this.context.lineWidth = Math.max(1.6, radius * 0.015);
    this.context.beginPath();
    this.context.arc(centerX, centerY + radius * 0.02, radius * 1.04, startAngle, endAngle);
    this.context.stroke();

    this.context.fillStyle = alphaHex(visual.backgroundColor, 0.08 + visual.grit * 0.08);
    this.context.beginPath();
    this.context.arc(centerX, centerY + radius * 0.02, radius * (0.58 + visual.gravity * 0.14), 0, Math.PI * 2);
    this.context.fill();
  }

  private drawStageProjectionScriptLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const script = getStageProjectionScript(visual);

    if (!script) {
      return;
    }

    this.context.save();

    switch (script.kind) {
      case "aisle-lattice":
        this.drawAisleLatticeProjection(visual, width, height, centerX, centerY, radius, time);
        break;
      case "velvet-bloom":
        this.drawVelvetBloomProjection(visual, width, height, centerX, centerY, radius, time);
        break;
      case "ember-grid":
        this.drawEmberGridProjection(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-circuit":
        this.drawPrismCircuitProjection(visual, width, height, centerX, centerY, radius, time);
        break;
      case "velocity-markers":
        this.drawVelocityMarkersProjection(visual, width, height, centerX, centerY, radius, time);
        break;
      case "eclipse-seal":
        this.drawEclipseSealProjection(visual, width, height, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawAisleLatticeProjection(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const travel = 0.5 + 0.5 * Math.sin(time * (0.76 + visual.motionSpeed * 0.3));
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.1 + visual.depth * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.008);

    for (let index = 0; index < 7; index += 1) {
      const progress = index / 6;
      const laneOffset = radius * (0.18 + progress * 1.02);
      this.context.beginPath();
      this.context.moveTo(centerX - laneOffset, centerY + radius * 0.24);
      this.context.lineTo(centerX - radius * (1.08 + progress * 0.18), height);
      this.context.moveTo(centerX + laneOffset, centerY + radius * 0.24);
      this.context.lineTo(centerX + radius * (1.08 + progress * 0.18), height);
      this.context.stroke();
    }

    for (let index = 0; index < 5; index += 1) {
      const step = index / 4;
      const y = centerY + radius * (0.28 + step * 0.8);
      this.context.beginPath();
      this.context.ellipse(centerX, y, radius * (0.28 + step * 0.44), radius * (0.06 + travel * 0.018), 0, 0, Math.PI * 2);
      this.context.stroke();
    }
  }

  private drawVelvetBloomProjection(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const bloom = 0.5 + 0.5 * Math.sin(time * (1.12 + visual.motionSpeed * 0.52));
    this.context.strokeStyle = alphaHex(visual.color, 0.12 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.2, radius * 0.01);

    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6 + time * 0.08;
      const petalX = centerX + Math.cos(angle) * radius * 0.38;
      const petalY = centerY + radius * 0.52 + Math.sin(angle) * radius * 0.12;
      this.context.beginPath();
      this.context.ellipse(
        petalX,
        petalY,
        radius * (0.14 + bloom * 0.02),
        radius * (0.05 + bloom * 0.012),
        angle,
        0,
        Math.PI * 2
      );
      this.context.stroke();
    }

    for (const direction of [-1, 1]) {
      this.context.beginPath();
      this.context.moveTo(centerX + direction * radius * 0.18, centerY + radius * 0.22);
      this.context.bezierCurveTo(
        centerX + direction * radius * 0.64,
        centerY + radius * 0.42,
        centerX + direction * radius * 0.92,
        centerY + radius * 0.72,
        centerX + direction * radius * 0.38,
        centerY + radius * 1.08
      );
      this.context.stroke();
    }
  }

  private drawEmberGridProjection(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const pulse = Math.pow(Math.max(0, Math.sin(time * (1.2 + visual.attack * 1.8))), 2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.grit * 0.12);
    this.context.lineWidth = Math.max(1.4, radius * 0.012);

    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        const x = centerX - radius * 0.72 + column * radius * 0.36;
        const y = centerY + radius * 0.42 + row * radius * 0.18;
        const size = radius * (0.08 + (row + column) * 0.004 + pulse * 0.01);
        this.context.beginPath();
        this.context.moveTo(x, y - size);
        this.context.lineTo(x + size, y);
        this.context.lineTo(x, y + size);
        this.context.lineTo(x - size, y);
        this.context.closePath();
        this.context.stroke();
      }
    }

    this.context.fillStyle = alphaHex(visual.color, 0.08 + pulse * 0.14);
    this.context.fillRect(centerX - radius * 0.64, centerY + radius * 0.88, radius * 1.28, radius * 0.08);
  }

  private drawPrismCircuitProjection(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const sweep = (time * (0.34 + visual.motionSpeed * 0.1)) % 1;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.009);

    for (let index = 0; index < 6; index += 1) {
      const offset = -radius * 0.8 + index * radius * 0.32;
      this.context.beginPath();
      this.context.moveTo(centerX + offset, centerY + radius * 0.3);
      this.context.lineTo(centerX + offset + radius * 0.26, centerY + radius * 0.98);
      this.context.lineTo(centerX + offset + radius * 0.6, centerY + radius * 0.72);
      this.context.stroke();
    }

    for (let index = 0; index < 5; index += 1) {
      const progress = (sweep + index / 5) % 1;
      const x = centerX - radius * 0.84 + progress * radius * 1.68;
      const y = centerY + radius * (0.44 + (index % 2) * 0.18);
      this.context.fillStyle = alphaHex(visual.color, 0.08 + (1 - progress) * 0.12);
      this.context.beginPath();
      this.context.arc(x, y, radius * 0.024, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawVelocityMarkersProjection(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const chase = (time * (0.5 + visual.motionSpeed * 0.16)) % 1;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.energy * 0.08);
    this.context.lineWidth = Math.max(1.1, radius * 0.009);

    for (let index = 0; index < 7; index += 1) {
      const step = (chase + index / 7) % 1;
      const y = centerY + radius * (0.92 - step * 1.02);
      const halfWidth = radius * (0.92 - step * 0.66);
      this.context.beginPath();
      this.context.moveTo(centerX - halfWidth, y);
      this.context.lineTo(centerX - halfWidth * 0.72, y - radius * 0.06);
      this.context.moveTo(centerX + halfWidth, y);
      this.context.lineTo(centerX + halfWidth * 0.72, y - radius * 0.06);
      this.context.stroke();
    }

    for (let index = 0; index < 4; index += 1) {
      const y = centerY + radius * (0.78 - index * 0.22);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 0.08, y);
      this.context.lineTo(centerX, y - radius * 0.06);
      this.context.lineTo(centerX + radius * 0.08, y);
      this.context.stroke();
    }
  }

  private drawEclipseSealProjection(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const ringShift = 0.5 + 0.5 * Math.sin(time * (0.58 + visual.gravity * 0.22));
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.1 + visual.grit * 0.12);
    this.context.lineWidth = Math.max(1.1, radius * 0.01);

    for (let index = 0; index < 4; index += 1) {
      const ringRadius = radius * (0.26 + index * 0.14 + ringShift * 0.018);
      this.context.beginPath();
      this.context.arc(centerX, centerY + radius * 0.56, ringRadius, 0, Math.PI * 2);
      this.context.stroke();
    }

    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8 + time * 0.05;
      this.context.beginPath();
      this.context.moveTo(centerX + Math.cos(angle) * radius * 0.18, centerY + radius * 0.56 + Math.sin(angle) * radius * 0.18);
      this.context.lineTo(centerX + Math.cos(angle) * radius * 0.68, centerY + radius * 0.56 + Math.sin(angle) * radius * 0.68);
      this.context.stroke();
    }
  }

  private drawStageMotionRigLayer(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const rig = getStageMotionRig(visual);

    if (!rig) {
      return;
    }

    this.context.save();

    switch (rig.kind) {
      case "choir-crowns":
        this.drawChoirCrownsRig(visual, width, height, centerX, centerY, radius, time);
        break;
      case "ribbon-veils":
        this.drawRibbonVeilsRig(visual, width, height, centerX, centerY, radius, time);
        break;
      case "piston-frames":
        this.drawPistonFramesRig(visual, width, height, centerX, centerY, radius, time);
        break;
      case "prism-gates":
        this.drawPrismGatesRig(visual, width, height, centerX, centerY, radius, time);
        break;
      case "runway-drones":
        this.drawRunwayDronesRig(visual, width, height, centerX, centerY, radius, time);
        break;
      case "eclipse-curtains":
        this.drawEclipseCurtainsRig(visual, width, height, centerX, centerY, radius, time);
        break;
    }

    this.context.restore();
  }

  private drawChoirCrownsRig(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const descent = 0.5 + 0.5 * Math.sin(time * (0.84 + visual.motionSpeed * 0.28));
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.4, radius * 0.012);

    for (let index = 0; index < 3; index += 1) {
      const archRadius = radius * (1.08 + index * 0.16);
      const drop = radius * (0.12 + index * 0.08 + descent * 0.05);
      this.context.beginPath();
      this.context.arc(centerX, centerY - radius * 0.44 + drop, archRadius, Math.PI * 1.08, Math.PI * 1.92);
      this.context.stroke();
    }

    for (const direction of [-1, 1]) {
      this.context.beginPath();
      this.context.moveTo(centerX + direction * radius * 0.92, 0);
      this.context.lineTo(centerX + direction * radius * (1.02 + descent * 0.04), centerY + radius * 0.08);
      this.context.stroke();
    }
  }

  private drawRibbonVeilsRig(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const sway = Math.sin(time * (1.04 + visual.swing * 1.2));
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.6, radius * 0.014);

    for (const direction of [-1, 1]) {
      this.context.beginPath();
      this.context.moveTo(centerX + direction * radius * 1.12, 0);
      this.context.bezierCurveTo(
        centerX + direction * radius * (0.84 + sway * 0.08),
        centerY - radius * 0.36,
        centerX + direction * radius * (0.92 - sway * 0.06),
        centerY + radius * 0.22,
        centerX + direction * radius * (0.48 + sway * 0.04),
        height
      );
      this.context.stroke();
    }

    this.context.fillStyle = alphaHex(visual.color, 0.04 + visual.glow * 0.06);
    this.context.fillRect(centerX - radius * 1.24, 0, radius * 0.16, height);
    this.context.fillRect(centerX + radius * 1.08, 0, radius * 0.16, height);
  }

  private drawPistonFramesRig(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const strike = Math.pow(Math.max(0, Math.sin(time * (1.36 + visual.attack * 1.8))), 3);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.grit * 0.12);
    this.context.lineWidth = Math.max(2, radius * 0.018);

    for (const direction of [-1, 1]) {
      const x = centerX + direction * radius * 1.02;
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, centerY + radius * (0.42 + strike * 0.18));
      this.context.stroke();
      this.context.fillStyle = alphaHex(visual.color, 0.1 + strike * 0.18);
      this.context.fillRect(x - radius * 0.08, centerY + radius * (0.3 + strike * 0.18), radius * 0.16, radius * 0.22);
    }

    this.context.beginPath();
    this.context.moveTo(centerX - radius * 1.18, centerY + radius * 0.58);
    this.context.lineTo(centerX + radius * 1.18, centerY + radius * 0.58);
    this.context.lineTo(centerX + radius * 1.18, centerY + radius * 1);
    this.context.lineTo(centerX - radius * 1.18, centerY + radius * 1);
    this.context.closePath();
    this.context.stroke();
  }

  private drawPrismGatesRig(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const shift = Math.sin(time * (0.98 + visual.motionSpeed * 0.44));
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.4, radius * 0.012);

    for (let index = 0; index < 3; index += 1) {
      const offset = radius * (0.16 + index * 0.22);
      this.context.save();
      this.context.translate(centerX + shift * radius * 0.08 * (index % 2 === 0 ? 1 : -1), centerY + radius * 0.1);
      this.context.rotate((index - 1) * 0.12);
      this.context.beginPath();
      this.context.moveTo(-offset, -radius * 0.86);
      this.context.lineTo(offset, -radius * 0.86);
      this.context.lineTo(offset, radius * 0.84);
      this.context.lineTo(-offset, radius * 0.84);
      this.context.closePath();
      this.context.stroke();
      this.context.restore();
    }
  }

  private drawRunwayDronesRig(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const chase = (time * (0.42 + visual.motionSpeed * 0.16)) % 1;
    for (const direction of [-1, 1]) {
      for (let index = 0; index < 5; index += 1) {
        const progress = (chase + index / 5) % 1;
        const x = centerX + direction * radius * (1.18 - progress * 0.68);
        const y = centerY + radius * (0.92 - progress * 1.32);
        this.context.fillStyle = alphaHex(visual.secondaryColor, 0.08 + (1 - progress) * 0.16);
        this.context.beginPath();
        this.context.arc(x, y, radius * (0.024 + (1 - progress) * 0.012), 0, Math.PI * 2);
        this.context.fill();
      }
    }

    this.context.strokeStyle = alphaHex(visual.color, 0.12 + visual.energy * 0.08);
    this.context.lineWidth = Math.max(1.2, radius * 0.01);
    this.context.beginPath();
    this.context.moveTo(centerX - radius * 1.22, centerY + radius * 0.72);
    this.context.lineTo(centerX - radius * 0.94, centerY + radius * 0.18);
    this.context.moveTo(centerX + radius * 1.22, centerY + radius * 0.72);
    this.context.lineTo(centerX + radius * 0.94, centerY + radius * 0.18);
    this.context.stroke();
  }

  private drawEclipseCurtainsRig(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const close = 0.5 + 0.5 * Math.sin(time * (0.62 + visual.gravity * 0.18));
    this.context.fillStyle = alphaHex(visual.backgroundColor, 0.08 + visual.grit * 0.08);
    const curtainWidth = radius * (0.24 + close * 0.08);
    this.context.fillRect(0, 0, curtainWidth, height);
    this.context.fillRect(width - curtainWidth, 0, curtainWidth, height);

    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.glow * 0.06);
    this.context.lineWidth = Math.max(1.2, radius * 0.01);
    this.context.beginPath();
    this.context.arc(centerX, centerY + radius * 0.02, radius * (1 + close * 0.05), Math.PI * 0.1, Math.PI * 0.9);
    this.context.stroke();
  }

  private drawAuroraDaisCascade(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.sceneCascadeIntensity;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + intensity * 0.12);
    this.context.lineWidth = Math.max(1.2, 1.2 + intensity * 2.2);
    for (let index = 0; index < 5; index += 1) {
      const archRadius = radius * (0.92 + index * 0.14);
      this.context.beginPath();
      this.context.arc(centerX, centerY - radius * 0.16, archRadius, Math.PI * 1.04, Math.PI * 1.96);
      this.context.stroke();
    }
    for (let index = 0; index < 6; index += 1) {
      const progress = index / 5;
      const x = centerX - radius * 1.1 + progress * radius * 2.2;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.quadraticCurveTo(
        centerX + Math.sin(time * 0.7 + index) * radius * 0.12,
        centerY + radius * 0.1,
        centerX + (x - centerX) * 0.16,
        centerY - radius * 1.02
      );
      this.context.stroke();
    }

    if (visual.growthImprint === "jazz-lattice") {
      this.context.save();
      this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + intensity * 0.1);
      this.context.lineWidth = Math.max(1, 1 + intensity * 1.4);
      for (let index = 0; index < 4; index += 1) {
        const progress = (index + 1) / 5;
        const x = centerX - radius * 0.86 + progress * radius * 1.72;
        this.context.beginPath();
        this.context.moveTo(x, centerY - radius * 0.92);
        this.context.lineTo(x, centerY + radius * 0.88);
        this.context.stroke();
      }
      this.context.restore();
    }

    if (visual.growthImprint === "neo-soul-veil") {
      this.context.save();
      this.context.fillStyle = alphaHex(visual.secondaryColor, 0.08 + intensity * 0.06);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.22, centerY - radius * 1.04);
      this.context.quadraticCurveTo(centerX - radius * 0.4, centerY - radius * 0.1, centerX - radius * 0.92, height);
      this.context.lineTo(centerX - radius * 1.26, height);
      this.context.closePath();
      this.context.fill();
      this.context.beginPath();
      this.context.moveTo(centerX + radius * 1.22, centerY - radius * 1.04);
      this.context.quadraticCurveTo(centerX + radius * 0.4, centerY - radius * 0.1, centerX + radius * 0.92, height);
      this.context.lineTo(centerX + radius * 1.26, height);
      this.context.closePath();
      this.context.fill();
      this.context.restore();
    }
  }

  private drawVelvetArcadeCascade(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.sceneCascadeIntensity;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + intensity * 0.12);
    this.context.lineWidth = Math.max(1, 1 + intensity * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const y = centerY - radius * (0.64 - index * 0.16);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.24, y);
      this.context.quadraticCurveTo(
        centerX,
        y - radius * (0.18 + Math.sin(time * 0.8 + index) * 0.04),
        centerX + radius * 1.24,
        y
      );
      this.context.stroke();
    }
    for (let index = 0; index < 7; index += 1) {
      const x = ((index + 1) / 8) * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(x + Math.sin(time * 0.6 + index) * radius * 0.06, centerY - radius * 0.92);
      this.context.stroke();
    }

    if (visual.growthImprint === "jazz-lattice") {
      this.context.save();
      this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + intensity * 0.08);
      for (let index = 0; index < 5; index += 1) {
        const x = centerX - radius * 0.92 + (index / 4) * radius * 1.84;
        this.context.beginPath();
        this.context.moveTo(x, centerY - radius * 0.82);
        this.context.lineTo(x, centerY + radius * 0.92);
        this.context.stroke();
      }
      this.context.restore();
    }
  }

  private drawForgeRitualCascade(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.sceneCascadeIntensity;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + intensity * 0.14);
    this.context.lineWidth = Math.max(1.4, 1.4 + intensity * 2);
    this.context.beginPath();
    this.context.moveTo(centerX - radius * 1.28, centerY - radius * 0.92);
    this.context.lineTo(centerX + radius * 1.28, centerY - radius * 0.92);
    this.context.lineTo(centerX + radius * 0.88, centerY - radius * 0.44);
    this.context.lineTo(centerX - radius * 0.88, centerY - radius * 0.44);
    this.context.closePath();
    this.context.stroke();
    for (let index = 0; index < 6; index += 1) {
      const x = centerX - radius * 1.06 + (index / 5) * radius * 2.12;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 0.92);
      this.context.lineTo(x + Math.sin(time * 0.8 + index) * radius * 0.08, centerY + radius * 0.86);
      this.context.stroke();
    }
    for (let index = 0; index < 9; index += 1) {
      const sparkX = centerX + Math.sin(time * 1.1 + index * 0.9) * radius * 1.18;
      const sparkY = centerY + radius * (0.12 + ((index % 4) / 4) * 0.84);
      this.context.fillStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.22);
      this.context.fillRect(sparkX, sparkY, 3, 10 + intensity * 12);
    }

    if (visual.growthImprint === "metal-forge") {
      this.context.save();
      this.context.strokeStyle = alphaHex(visual.color, 0.18 + intensity * 0.1);
      this.context.lineWidth = Math.max(1.2, 1.2 + intensity * 1.4);
      for (let index = 0; index < 5; index += 1) {
        const angle = time * 0.12 + index * (Math.PI / 2.5);
        this.context.beginPath();
        this.context.moveTo(centerX, centerY + radius * 0.18);
        this.context.lineTo(centerX + Math.cos(angle) * radius * 1.14, centerY + Math.sin(angle) * radius * 0.88);
        this.context.stroke();
      }
      this.context.restore();
    }
  }

  private drawPrismVortexCascade(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.sceneCascadeIntensity;
    this.context.translate(centerX, centerY);
    this.context.rotate(time * (0.12 + intensity * 0.12));
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + intensity * 0.12);
    this.context.lineWidth = Math.max(1, 1 + intensity * 1.8);
    for (let index = 0; index < 5; index += 1) {
      const triRadius = radius * (0.44 + index * 0.18);
      this.context.beginPath();
      for (let corner = 0; corner < 3; corner += 1) {
        const angle = -Math.PI / 2 + (corner / 3) * Math.PI * 2;
        const x = Math.cos(angle) * triRadius;
        const y = Math.sin(angle) * triRadius;
        if (corner === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      }
      this.context.closePath();
      this.context.stroke();
    }
    this.context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
    this.context.strokeStyle = alphaHex(visual.color, 0.12 + intensity * 0.08);
    for (let index = 0; index < 6; index += 1) {
      const y = centerY - radius * 0.86 + index * radius * 0.26;
      this.context.beginPath();
      this.context.moveTo(radius * 0.2, y);
      this.context.lineTo(width - radius * 0.2, y + Math.sin(time * 0.6 + index) * radius * 0.06);
      this.context.stroke();
    }

    if (visual.growthImprint === "fusion-phase") {
      this.context.save();
      this.context.translate(centerX, centerY);
      this.context.rotate(-time * (0.18 + intensity * 0.1));
      this.context.strokeStyle = alphaHex(visual.color, 0.16 + intensity * 0.08);
      for (let index = 0; index < 3; index += 1) {
        this.context.beginPath();
        this.context.arc(0, 0, radius * (0.56 + index * 0.18), 0, Math.PI * 2);
        this.context.stroke();
      }
      this.context.restore();
    }
  }

  private drawTideRunwayCascade(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.sceneCascadeIntensity;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + intensity * 0.12);
    this.context.lineWidth = Math.max(1, 1 + intensity * 1.8);
    for (let index = 0; index < 10; index += 1) {
      const progress = index / 9;
      const x = progress * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(centerX + (x - centerX) * 0.12, centerY + radius * 0.06);
      this.context.stroke();
    }
    for (let index = 0; index < 5; index += 1) {
      const y = centerY + radius * (0.18 + index * 0.14);
      this.context.beginPath();
      for (let step = 0; step <= 16; step += 1) {
        const progress = step / 16;
        const x = progress * width;
        const waveY = y + Math.sin(progress * Math.PI * 6 + time * (1 + index * 0.08)) * radius * 0.024;
        if (step === 0) {
          this.context.moveTo(x, waveY);
        } else {
          this.context.lineTo(x, waveY);
        }
      }
      this.context.stroke();
    }

    if (visual.growthImprint === "pentatonic-drive") {
      this.context.save();
      this.context.strokeStyle = alphaHex(visual.color, 0.18 + intensity * 0.1);
      this.context.lineWidth = Math.max(1, 1 + intensity * 1.4);
      for (let index = 0; index < 6; index += 1) {
        const x = centerX - radius * 1.24 + (index / 5) * radius * 2.48;
        this.context.beginPath();
        this.context.moveTo(x, height);
        this.context.lineTo(x + radius * 0.08, centerY - radius * 0.46);
        this.context.stroke();
      }
      this.context.restore();
    }
  }

  private drawEclipseAltarCascade(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.sceneCascadeIntensity;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + intensity * 0.14);
    this.context.lineWidth = Math.max(1.2, 1.2 + intensity * 2);
    for (let index = 0; index < 4; index += 1) {
      const ringRadius = radius * (0.72 + index * 0.2);
      this.context.beginPath();
      this.context.arc(centerX, centerY - radius * 0.18, ringRadius, 0, Math.PI * 2);
      this.context.stroke();
    }
    for (let index = 0; index < 8; index += 1) {
      const angle = time * 0.12 + index * (Math.PI / 4);
      this.context.beginPath();
      this.context.moveTo(centerX, centerY + radius * 0.12);
      this.context.lineTo(centerX + Math.cos(angle) * radius * 1.28, centerY + Math.sin(angle) * radius * 1.02);
      this.context.stroke();
    }
    this.context.fillStyle = alphaHex(visual.backgroundColor, 0.28 + intensity * 0.14);
    this.context.fillRect(centerX - radius * 0.34, centerY + radius * 0.64, radius * 0.68, height * 0.1);

    if (visual.growthImprint === "metal-forge") {
      this.context.save();
      this.context.strokeStyle = alphaHex(visual.color, 0.18 + intensity * 0.12);
      this.context.lineWidth = Math.max(1, 1 + intensity * 1.6);
      for (let index = 0; index < 3; index += 1) {
        const y = centerY + radius * (0.32 + index * 0.14);
        this.context.beginPath();
        this.context.moveTo(centerX - radius * 0.94, y);
        this.context.lineTo(centerX + radius * 0.94, y);
        this.context.stroke();
      }
      this.context.restore();
    }
  }

  private drawChoirVaultSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const panelCount = Math.max(4, Math.round(4 + visual.depth * 4));
    this.context.lineWidth = Math.max(1, 1 + visual.symmetry * 1.8);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.depth * 0.08);
    for (let index = 0; index < panelCount; index += 1) {
      const progress = (index + 1) / (panelCount + 1);
      const x = centerX - radius * 1.04 + progress * radius * 2.08;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 1.02);
      this.context.lineTo(x, height);
      this.context.stroke();
      this.context.beginPath();
      this.context.arc(x, centerY - radius * 0.98, radius * 0.08, Math.PI, 0);
      this.context.stroke();
    }
  }

  private drawSilkenHaloSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const veil = this.context.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, alphaHex(visual.secondaryColor, 0.12 + visual.glow * 0.06));
    veil.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = veil;
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.quadraticCurveTo(centerX - radius * 0.42, centerY, radius * 0.42, height);
    this.context.lineTo(0, height);
    this.context.closePath();
    this.context.fill();
    this.context.beginPath();
    this.context.moveTo(width, 0);
    this.context.quadraticCurveTo(centerX + radius * 0.42, centerY, width - radius * 0.42, height);
    this.context.lineTo(width, height);
    this.context.closePath();
    this.context.fill();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.2, 1 + visual.glow * 1.8);
    for (let index = 0; index < 3; index += 1) {
      this.context.beginPath();
      this.context.ellipse(centerX, centerY, radius * (1 + index * 0.16), radius * (0.38 + index * 0.08), 0, 0, Math.PI * 2);
      this.context.stroke();
    }
  }

  private drawRoseArcadeSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + visual.glow * 0.08);
    this.context.lineWidth = Math.max(1.2, 1 + visual.glow * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const y = centerY - radius * (0.68 - index * 0.18);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.12, y);
      this.context.quadraticCurveTo(centerX, y - radius * 0.26, centerX + radius * 1.12, y);
      this.context.stroke();
    }
    for (let index = 0; index < 5; index += 1) {
      const x = centerX - radius * 0.98 + (index / 4) * radius * 1.96;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 0.82);
      this.context.lineTo(x, height);
      this.context.stroke();
    }
  }

  private drawBlueCloisterSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.depth * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.symmetry * 1.8);
    for (let index = 0; index < 6; index += 1) {
      const x = centerX - radius * 1.08 + (index / 5) * radius * 2.16;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 0.94);
      this.context.lineTo(x, height);
      this.context.stroke();
    }
    for (let index = 0; index < 4; index += 1) {
      const y = centerY - radius * (0.72 - index * 0.18);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.12, y);
      this.context.lineTo(centerX + radius * 1.12, y);
      this.context.stroke();
    }
  }

  private drawForgeThroneSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.2 + visual.grit * 0.08);
    this.context.lineWidth = Math.max(1.4, 1.2 + visual.grit * 2.2);
    this.context.beginPath();
    this.context.moveTo(centerX - radius * 0.42, centerY + radius * 0.64);
    this.context.lineTo(centerX - radius * 0.32, centerY - radius * 0.28);
    this.context.lineTo(centerX + radius * 0.32, centerY - radius * 0.28);
    this.context.lineTo(centerX + radius * 0.42, centerY + radius * 0.64);
    this.context.closePath();
    this.context.stroke();
    for (let index = 0; index < 4; index += 1) {
      const x = centerX - radius * 1.02 + (index / 3) * radius * 2.04;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 0.9);
      this.context.lineTo(x, height);
      this.context.stroke();
    }
  }

  private drawPhaseCloisterSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.translate(centerX, centerY);
    this.context.rotate(time * 0.1);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.beamStrength * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const halfWidth = radius * (0.18 + index * 0.14);
      const topY = -radius * (1 - index * 0.1);
      const bottomY = radius * (0.2 + index * 0.14);
      this.context.beginPath();
      this.context.moveTo(0, topY);
      this.context.lineTo(-halfWidth, bottomY);
      this.context.lineTo(halfWidth, bottomY);
      this.context.closePath();
      this.context.stroke();
    }
  }

  private drawNeonCausewaySetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + visual.energy * 0.08);
    this.context.lineWidth = Math.max(1.2, 1 + visual.energy * 1.8);
    const horizonY = centerY + radius * 0.74;
    for (let index = 0; index < 8; index += 1) {
      const progress = index / 7;
      const x = progress * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(centerX + (x - centerX) * 0.12, horizonY);
      this.context.stroke();
    }
    for (let index = 0; index < 6; index += 1) {
      const y = horizonY + index * radius * 0.11;
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(width, y);
      this.context.stroke();
    }
  }

  private drawAuroraDaisSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.luminosity * 0.08);
    this.context.lineWidth = Math.max(1.2, 1 + visual.luminosity * 1.8);
    for (let index = 0; index < 4; index += 1) {
      const y = centerY + radius * (0.48 + index * 0.08);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * (0.72 - index * 0.1), y);
      this.context.lineTo(centerX + radius * (0.72 - index * 0.1), y);
      this.context.stroke();
    }
  }

  private drawVelvetArcadeSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.depth * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.depth * 1.6);
    for (let index = 0; index < 5; index += 1) {
      const progress = index / 4;
      const x = centerX - radius * 1.08 + progress * radius * 2.16;
      this.context.beginPath();
      this.context.moveTo(x, centerY - radius * 0.82);
      this.context.lineTo(x, height);
      this.context.stroke();
    }
  }

  private drawEclipseAltarSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.translate(centerX, centerY + radius * 0.04);
    this.context.rotate(time * 0.05);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + visual.contrast * 0.08);
    this.context.lineWidth = Math.max(1.2, 1 + visual.contrast * 1.8);
    for (let index = 0; index < 4; index += 1) {
      this.context.beginPath();
      this.context.arc(0, 0, radius * (0.88 + index * 0.16), 0, Math.PI * 2);
      this.context.stroke();
    }
  }

  private drawPrismVortexSetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.translate(centerX, centerY);
    this.context.rotate(time * 0.12);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.beamStrength * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 1.8);
    for (let index = 0; index < 5; index += 1) {
      const size = radius * (0.24 + index * 0.14);
      this.context.beginPath();
      this.context.moveTo(0, -size);
      this.context.lineTo(-size * 0.82, size);
      this.context.lineTo(size * 0.82, size);
      this.context.closePath();
      this.context.stroke();
    }
  }

  private drawTideRunwaySetpiece(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const horizonY = centerY + radius * 0.78;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.rippleStrength * 0.08);
    this.context.lineWidth = Math.max(1, 1 + visual.rippleStrength * 1.8);
    for (let index = 0; index < 6; index += 1) {
      const x = ((index + 1) / 7) * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(centerX + (x - centerX) * 0.08, horizonY);
      this.context.stroke();
    }
  }

  private drawOverheadChoirLights(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const lightCount = Math.max(3, Math.round(3 + visual.depth * 3));
    for (let index = 0; index < lightCount; index += 1) {
      const progress = (index + 1) / (lightCount + 1);
      const topX = progress * width;
      const targetX = centerX - radius * 0.4 + progress * radius * 0.8 + Math.sin(time * 0.6 + index) * radius * 0.05;
      const targetY = centerY + radius * 0.16;
      const cone = this.context.createLinearGradient(topX, 0, targetX, targetY);
      cone.addColorStop(0, alphaHex(visual.secondaryColor, 0.16 + visual.glow * 0.06));
      cone.addColorStop(1, alphaHex(visual.backgroundColor, 0));
      this.context.fillStyle = cone;
      this.context.beginPath();
      this.context.moveTo(topX - radius * 0.08, 0);
      this.context.lineTo(topX + radius * 0.08, 0);
      this.context.lineTo(targetX + radius * 0.2, targetY);
      this.context.lineTo(targetX - radius * 0.2, targetY);
      this.context.closePath();
      this.context.fill();
    }
  }

  private drawVelvetWashLights(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const leftWash = this.context.createLinearGradient(0, 0, centerX, height);
    leftWash.addColorStop(0, alphaHex(visual.secondaryColor, 0.14 + visual.glow * 0.05));
    leftWash.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = leftWash;
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(radius * 0.24, 0);
    this.context.lineTo(centerX - radius * 0.1, height);
    this.context.lineTo(0, height);
    this.context.closePath();
    this.context.fill();

    const rightWash = this.context.createLinearGradient(width, 0, centerX, height);
    rightWash.addColorStop(0, alphaHex(visual.secondaryColor, 0.14 + visual.glow * 0.05));
    rightWash.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = rightWash;
    this.context.beginPath();
    this.context.moveTo(width, 0);
    this.context.lineTo(width - radius * 0.24, 0);
    this.context.lineTo(centerX + radius * 0.1, height);
    this.context.lineTo(width, height);
    this.context.closePath();
    this.context.fill();

    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + visual.glow * 0.06);
    this.context.lineWidth = Math.max(1, 1 + visual.glow * 1.4);
    const footY = centerY + radius * 0.94;
    for (let index = 0; index < 5; index += 1) {
      const x = centerX - radius * 1.02 + (index / 4) * radius * 2.04;
      this.context.beginPath();
      this.context.moveTo(x, footY);
      this.context.lineTo(x + Math.sin(time * 0.8 + index) * radius * 0.04, footY - radius * 0.14);
      this.context.stroke();
    }
  }

  private drawForgePressureLights(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const sideCount = 3;
    for (let index = 0; index < sideCount; index += 1) {
      const leftX = radius * (0.2 + index * 0.18);
      const rightX = width - leftX;
      const targetY = centerY + radius * (0.16 + index * 0.08);
      this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.2 + visual.contrast * 0.06);
      this.context.lineWidth = Math.max(1.4, 1.2 + visual.contrast * 1.8);
      this.context.beginPath();
      this.context.moveTo(leftX, radius * 0.08);
      this.context.lineTo(centerX - radius * 0.2, targetY);
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(rightX, radius * 0.08);
      this.context.lineTo(centerX + radius * 0.2, targetY);
      this.context.stroke();
    }

    const underGlow = this.context.createRadialGradient(centerX, height, radius * 0.2, centerX, height, radius * 1.2);
    underGlow.addColorStop(0, alphaHex(visual.color, 0.2 + visual.energy * 0.06));
    underGlow.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = underGlow;
    this.context.fillRect(0, centerY + radius * 0.42, width, height - (centerY + radius * 0.42));
  }

  private drawPrismSweepLights(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.translate(centerX, centerY);
    const sweepCount = 4;
    for (let index = 0; index < sweepCount; index += 1) {
      const angle = time * 0.4 + index * (Math.PI / 2);
      const targetX = Math.cos(angle) * radius * 1.3;
      const targetY = Math.sin(angle) * radius * 0.96;
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.18 + visual.beamStrength * 0.06);
      this.context.lineWidth = Math.max(1.2, 1 + visual.beamStrength * 1.8);
      this.context.beginPath();
      this.context.moveTo(0, 0);
      this.context.lineTo(targetX, targetY);
      this.context.stroke();
    }
  }

  private drawRunwayCueLights(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const horizonY = centerY + radius * 0.76;
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + visual.energy * 0.06);
    this.context.lineWidth = Math.max(1, 1 + visual.energy * 1.4);
    for (let index = 0; index < 6; index += 1) {
      const x = ((index + 1) / 7) * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(x + Math.sin(time * 1 + index) * radius * 0.03, horizonY);
      this.context.stroke();
    }
    for (let index = 0; index < 8; index += 1) {
      const x = centerX - radius * 1.1 + (index / 7) * radius * 2.2;
      this.context.beginPath();
      this.context.fillStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.18 + visual.energy * 0.06);
      this.context.arc(x, horizonY + radius * 0.06, 1.6 + visual.energy * 2.2, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawSolarGardenAccent(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + visual.symmetry * 2.4);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + visual.glow * 0.16);
    this.context.shadowBlur = 14 + visual.glow * 22;
    this.context.shadowColor = visual.secondaryColor;
    for (let index = 0; index < 4; index += 1) {
      const archRadius = radius * (0.82 + index * 0.16);
      this.context.beginPath();
      this.context.arc(centerX, centerY - radius * 0.12, archRadius, Math.PI * 1.02, Math.PI * 1.98);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawVelvetChamberAccent(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    const curtainGradient = this.context.createLinearGradient(0, 0, 0, height);
    curtainGradient.addColorStop(0, alphaHex(visual.secondaryColor, 0.16));
    curtainGradient.addColorStop(1, alphaHex(visual.backgroundColor, 0));
    this.context.fillStyle = curtainGradient;
    for (let index = 0; index < 3; index += 1) {
      const wave = Math.sin(time * 0.6 + index) * radius * 0.06;
      this.context.beginPath();
      this.context.moveTo(index === 0 ? 0 : width, 0);
      this.context.quadraticCurveTo(centerX + wave, centerY * 0.44, index === 0 ? radius * 0.42 : width - radius * 0.42, height);
      this.context.lineTo(index === 0 ? 0 : width, height);
      this.context.closePath();
      this.context.fill();
    }
    this.context.restore();
  }

  private drawMetalFoundryAccent(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.16 + visual.contrast * 0.16);
    this.context.lineWidth = Math.max(1.2, 1.2 + visual.contrast * 2.2);
    const baseY = centerY + radius * 0.86;
    for (let index = 0; index < 9; index += 1) {
      const progress = index / 8;
      const x = centerX - radius * 1.26 + progress * radius * 2.52;
      this.context.beginPath();
      this.context.moveTo(x, baseY);
      this.context.lineTo(x + radius * 0.04, baseY - radius * (0.1 + ((index + 1) % 3) * 0.18));
      this.context.lineTo(x + radius * 0.1, baseY);
      this.context.stroke();
    }
    for (let index = 0; index < 5; index += 1) {
      const emberX = centerX + Math.sin(time * 0.9 + index * 1.7) * radius * 1.18;
      const emberY = centerY + radius * (0.38 + index * 0.1);
      this.context.fillStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.24);
      this.context.fillRect(emberX, emberY, 3, 10 + visual.energy * 14);
    }
    this.context.restore();
  }

  private drawJazzCathedralAccent(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    const windowCount = Math.max(3, Math.round(3 + visual.symmetry * 4));
    for (let index = 0; index < windowCount; index += 1) {
      const progress = (index + 1) / (windowCount + 1);
      const x = centerX - radius * 1.08 + progress * radius * 2.16;
      const topY = centerY - radius * 1.08;
      const panelHeight = radius * (0.82 + Math.sin(time * 0.4 + index) * 0.06);
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.16 + visual.depth * 0.12);
      this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 1.8);
      this.context.beginPath();
      this.context.moveTo(x, topY + panelHeight);
      this.context.lineTo(x, topY + radius * 0.18);
      this.context.quadraticCurveTo(x, topY - radius * 0.08, x + radius * 0.08, topY - radius * 0.08);
      this.context.stroke();
    }
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.06 + visual.depth * 0.08);
    this.context.fillRect(0, height - radius * 0.16, width, radius * 0.16);
    this.context.restore();
  }

  private drawPrismArrayAccent(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    this.context.translate(centerX, centerY - radius * 0.12);
    this.context.rotate(Math.sin(time * 0.6) * 0.08);
    for (let index = 0; index < 6; index += 1) {
      const topY = -radius * (1.08 - index * 0.07);
      const baseWidth = radius * (0.14 + index * 0.08);
      const baseY = radius * (0.06 + index * 0.1);
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.14 + visual.depth * 0.1);
      this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 1.6);
      this.context.moveTo(0, topY);
      this.context.lineTo(-baseWidth, baseY);
      this.context.lineTo(baseWidth, baseY);
      this.context.closePath();
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawNocturneTideAccent(
    visual: VisualParameters,
    width: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    this.context.lineWidth = Math.max(1.2, 1 + visual.rippleStrength * 2.2);
    for (let index = 0; index < 4; index += 1) {
      const y = centerY + radius * (0.44 + index * 0.16);
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.16 + visual.depth * 0.08);
      for (let step = 0; step <= 16; step += 1) {
        const progress = step / 16;
        const x = progress * width;
        const waveY = y + Math.sin(progress * Math.PI * 4 + time * (0.9 + index * 0.14)) * radius * (0.04 + index * 0.01);
        if (step === 0) {
          this.context.moveTo(x, waveY);
        } else {
          this.context.lineTo(x, waveY);
        }
      }
      this.context.stroke();
    }
    const moonX = centerX + radius * 0.78;
    const moonY = centerY - radius * 0.76;
    this.context.beginPath();
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.2 + visual.glow * 0.1);
    this.context.arc(moonX, moonY, radius * 0.14, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }

  private drawNeonGridAccent(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.14 + visual.beamStrength * 0.1);
    this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 1.4);
    const horizonY = centerY + radius * 0.82;
    const lineCount = 7;
    for (let index = 0; index < lineCount; index += 1) {
      const progress = index / (lineCount - 1);
      const x = progress * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.lineTo(centerX + (x - centerX) * 0.12, horizonY);
      this.context.stroke();
    }
    for (let index = 0; index < 5; index += 1) {
      const y = horizonY + index * radius * 0.14 + Math.sin(time * 0.8 + index) * radius * 0.01;
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(width, y);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawShadowSanctumAccent(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.rotate(time * 0.06);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + visual.contrast * 0.1);
    this.context.lineWidth = Math.max(1, 1 + visual.contrast * 1.8);
    for (let index = 0; index < 3; index += 1) {
      const runeRadius = radius * (0.86 + index * 0.16);
      this.context.beginPath();
      this.context.arc(0, 0, runeRadius, 0, Math.PI * 2);
      this.context.stroke();
    }
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6 + time * 0.12;
      this.context.beginPath();
      this.context.moveTo(Math.cos(angle) * radius * 0.26, Math.sin(angle) * radius * 0.26);
      this.context.lineTo(Math.cos(angle) * radius * 1.06, Math.sin(angle) * radius * 1.06);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawPentatonicDriveImprint(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.growthImprintIntensity;
    const neon = mixHex(visual.secondaryColor, "#59fff5", 0.48);
    this.context.save();
    this.context.lineWidth = Math.max(1.6, 1.2 + intensity * 3);
    this.context.strokeStyle = alphaHex(neon, 0.16 + intensity * 0.16);
    const stripeCount = Math.max(3, Math.round(3 + intensity * 4));
    for (let index = 0; index < stripeCount; index += 1) {
      const offset = radius * (0.22 + index * 0.16);
      this.context.beginPath();
      this.context.moveTo(centerX - radius * 1.4 + Math.sin(time * 0.8 + index) * radius * 0.08, height);
      this.context.lineTo(centerX - offset, centerY + radius * 0.2);
      this.context.lineTo(centerX + offset * 0.18, centerY - radius * 0.68);
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(centerX + radius * 1.4 - Math.sin(time * 0.8 + index) * radius * 0.08, height);
      this.context.lineTo(centerX + offset, centerY + radius * 0.2);
      this.context.lineTo(centerX - offset * 0.18, centerY - radius * 0.68);
      this.context.stroke();
    }
    const nodeCount = Math.max(4, Math.round(4 + intensity * 5));
    for (let index = 0; index < nodeCount; index += 1) {
      const angle = time * 0.7 + index * (Math.PI * 2 / nodeCount);
      const x = centerX + Math.cos(angle) * radius * (0.92 + (index % 3) * 0.12);
      const y = centerY + Math.sin(angle * 1.2) * radius * 0.52;
      this.context.beginPath();
      this.context.fillStyle = alphaHex(index % 2 === 0 ? neon : visual.color, 0.2 + intensity * 0.22);
      this.context.arc(x, y, 2 + intensity * 4, 0, Math.PI * 2);
      this.context.fill();
    }
    this.context.restore();
  }

  private drawJazzLatticeImprint(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.growthImprintIntensity;
    const cathedral = mixHex(visual.secondaryColor, "#d6d0ff", 0.38);
    this.context.save();
    this.context.lineWidth = Math.max(1.2, 1 + intensity * 2.2);
    const chandelierCount = Math.max(3, Math.round(3 + intensity * 3));
    for (let index = 0; index < chandelierCount; index += 1) {
      const x = centerX - radius * 0.78 + (index / Math.max(1, chandelierCount - 1)) * radius * 1.56;
      const sway = Math.sin(time * 0.7 + index) * radius * 0.04;
      const topY = height * 0.08;
      const bodyY = centerY - radius * (0.62 - index * 0.05);
      this.context.strokeStyle = alphaHex(cathedral, 0.16 + intensity * 0.16);
      this.context.beginPath();
      this.context.moveTo(x, topY);
      this.context.lineTo(x + sway, bodyY);
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(x - radius * 0.16, bodyY);
      this.context.lineTo(x + sway, bodyY - radius * 0.12);
      this.context.lineTo(x + radius * 0.16, bodyY);
      this.context.stroke();
    }
    const bandCount = Math.max(3, Math.round(3 + intensity * 4));
    for (let index = 0; index < bandCount; index += 1) {
      const y = centerY - radius * (0.22 + index * 0.14);
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? cathedral : visual.color, 0.12 + intensity * 0.12);
      for (let step = 0; step <= 12; step += 1) {
        const progress = step / 12;
        const x = centerX - radius * 1.22 + progress * radius * 2.44;
        const waveY = y + Math.sin(progress * Math.PI * 4 + time * 0.8 + index) * radius * 0.018;
        if (step === 0) {
          this.context.moveTo(x, waveY);
        } else {
          this.context.lineTo(x, waveY);
        }
      }
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawMetalForgeImprint(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.growthImprintIntensity;
    const ember = mixHex(visual.secondaryColor, "#ff7b3d", 0.4);
    this.context.save();
    this.context.lineWidth = Math.max(1.4, 1.2 + intensity * 2.8);
    this.context.strokeStyle = alphaHex(ember, 0.18 + intensity * 0.18);
    const shardRainCount = Math.max(5, Math.round(5 + intensity * 7));
    for (let index = 0; index < shardRainCount; index += 1) {
      const progress = index / shardRainCount;
      const x = progress * width;
      const topY = height * 0.06 + Math.sin(time * 1.2 + index) * radius * 0.04;
      const midY = centerY - radius * 0.18 + (index % 3) * radius * 0.08;
      this.context.beginPath();
      this.context.moveTo(x, topY);
      this.context.lineTo(x + radius * 0.08, midY);
      this.context.lineTo(x - radius * 0.06, midY + radius * 0.22);
      this.context.stroke();
    }
    const ventY = centerY + radius * 0.96;
    for (let index = 0; index < 6; index += 1) {
      const x = centerX - radius * 1.12 + (index / 5) * radius * 2.24;
      this.context.fillStyle = alphaHex(index % 2 === 0 ? ember : visual.color, 0.12 + intensity * 0.14);
      this.context.fillRect(x, ventY - radius * 0.18, radius * 0.12, radius * 0.18);
      this.context.beginPath();
      this.context.moveTo(x, ventY - radius * 0.18);
      this.context.lineTo(x + radius * 0.06, ventY - radius * (0.28 + (index % 3) * 0.08));
      this.context.lineTo(x + radius * 0.12, ventY - radius * 0.18);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawNeoSoulVeilImprint(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.growthImprintIntensity;
    const blush = mixHex(visual.secondaryColor, "#ffb7d6", 0.44);
    this.context.save();
    const veilCount = Math.max(3, Math.round(3 + intensity * 3));
    for (let index = 0; index < veilCount; index += 1) {
      const veilGradient = this.context.createLinearGradient(0, 0, 0, height);
      veilGradient.addColorStop(0, alphaHex(blush, 0.14 + intensity * 0.08));
      veilGradient.addColorStop(1, alphaHex(visual.backgroundColor, 0));
      this.context.fillStyle = veilGradient;
      this.context.beginPath();
      this.context.moveTo(index % 2 === 0 ? 0 : width, 0);
      this.context.quadraticCurveTo(
        centerX + Math.sin(time * 0.5 + index) * radius * 0.14,
        centerY * (0.38 + index * 0.06),
        index % 2 === 0 ? radius * 0.52 : width - radius * 0.52,
        height
      );
      this.context.lineTo(index % 2 === 0 ? 0 : width, height);
      this.context.closePath();
      this.context.fill();
    }
    const haloCount = Math.max(2, Math.round(2 + intensity * 3));
    for (let index = 0; index < haloCount; index += 1) {
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? blush : visual.color, 0.2 + intensity * 0.12);
      this.context.lineWidth = Math.max(1.2, 1 + intensity * 2);
      this.context.ellipse(
        centerX,
        centerY + Math.sin(time * 0.9 + index) * radius * 0.05,
        radius * (0.82 + index * 0.18),
        radius * (0.34 + index * 0.08),
        0,
        Math.PI * 0.12,
        Math.PI * 0.88
      );
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawFusionPhaseImprint(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const intensity = visual.growthImprintIntensity;
    const prism = mixHex(visual.secondaryColor, "#9fc8ff", 0.36);
    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.rotate(time * (0.08 + intensity * 0.1));
    const corridorCount = Math.max(3, Math.round(3 + intensity * 4));
    for (let index = 0; index < corridorCount; index += 1) {
      const offset = radius * (0.18 + index * 0.18);
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? prism : visual.color, 0.18 + intensity * 0.14);
      this.context.lineWidth = Math.max(1, 1 + intensity * 2);
      this.context.moveTo(0, -radius * (1.02 - index * 0.08));
      this.context.lineTo(-offset, radius * (0.12 + index * 0.14));
      this.context.lineTo(offset, radius * (0.12 + index * 0.14));
      this.context.closePath();
      this.context.stroke();
    }
    const phaseRingCount = Math.max(2, Math.round(2 + intensity * 3));
    for (let index = 0; index < phaseRingCount; index += 1) {
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(prism, 0.14 + intensity * 0.12);
      this.context.arc(0, 0, radius * (0.76 + index * 0.2), time * 0.6 + index * 0.7, time * 0.6 + index * 0.7 + Math.PI * 1.2);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawOpennessFans(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const openness = visual.openness;
    const fanCount = Math.max(2, Math.round(2 + openness * 4));
    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + openness * 2.2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.08 + openness * 0.12);
    for (let index = 0; index < fanCount; index += 1) {
      const angle = -Math.PI * (0.58 - openness * 0.08) + (index / Math.max(1, fanCount - 1)) * Math.PI * (1.16 + openness * 0.1);
      const length = radius * (1.02 + openness * 0.54);
      this.context.beginPath();
      this.context.moveTo(centerX, centerY + radius * 0.08);
      this.context.lineTo(
        centerX + Math.cos(angle + Math.sin(time * 0.7 + index) * 0.03) * length,
        centerY + Math.sin(angle) * length * 0.82
      );
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawAttackSpikes(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const attack = visual.attack;
    const spikeCount = Math.max(4, Math.round(4 + attack * 8));
    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.lineWidth = Math.max(1, 1 + attack * 2.2);
    this.context.strokeStyle = alphaHex(visual.color, 0.1 + attack * 0.18);
    for (let index = 0; index < spikeCount; index += 1) {
      const angle = time * (0.6 + attack * 0.6) + index * ((Math.PI * 2) / spikeCount);
      const inner = radius * (0.26 + (index % 3) * 0.06);
      const outer = radius * (0.92 + attack * 0.42 + ((index + 1) % 4) * 0.04);
      this.context.beginPath();
      this.context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      this.context.lineTo(Math.cos(angle + 0.03) * outer, Math.sin(angle + 0.03) * outer);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawSwingLilt(
    visual: VisualParameters,
    width: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const swing = visual.swing;
    const laneCount = Math.max(2, Math.round(2 + swing * 4));
    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + swing * 2);
    for (let index = 0; index < laneCount; index += 1) {
      const baseY = centerY + radius * (0.16 + index * 0.14);
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.08 + swing * 0.12);
      for (let step = 0; step <= 16; step += 1) {
        const progress = step / 16;
        const x = progress * width;
        const sway = Math.sin(progress * Math.PI * 4 + time * (1 + swing * 0.8) + index * 0.7) * radius * (0.02 + swing * 0.03);
        const y = baseY + sway + (step % 2 === 0 ? -radius * swing * 0.01 : radius * swing * 0.01);
        if (step === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      }
      this.context.stroke();
    }
    this.context.beginPath();
    this.context.fillStyle = alphaHex(visual.secondaryColor, 0.12 + swing * 0.14);
    this.context.arc(centerX + Math.sin(time * 1.2) * radius * 0.4, centerY + radius * 0.12, 2 + swing * 4, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }

  private drawGravityTethers(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const gravity = visual.gravity;
    const tetherCount = Math.max(3, Math.round(3 + gravity * 5));
    const anchorY = centerY + radius * (0.9 + gravity * 0.18);
    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + gravity * 2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.08 + gravity * 0.12);
    for (let index = 0; index < tetherCount; index += 1) {
      const progress = (index + 1) / (tetherCount + 1);
      const x = progress * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.quadraticCurveTo(
        centerX + Math.sin(time * 0.6 + index) * radius * 0.08,
        anchorY - radius * (0.2 + gravity * 0.16),
        centerX + (x - centerX) * (0.12 - gravity * 0.04),
        centerY + radius * 0.14
      );
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawSynergyResonanceMesh(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const strength = visual.synergyResonance;
    const nodeCount = Math.max(4, Math.round(4 + strength * 6));
    const points: Array<{ x: number; y: number }> = [];
    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + strength * 1.8);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.08 + strength * 0.1);
    for (let index = 0; index < nodeCount; index += 1) {
      const angle = time * 0.4 + index * ((Math.PI * 2) / nodeCount);
      const orbit = radius * (0.64 + (index % 3) * 0.12);
      points.push({
        x: centerX + Math.cos(angle) * orbit,
        y: centerY + Math.sin(angle * (0.9 + strength * 0.22)) * orbit * 0.72
      });
    }
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      this.context.beginPath();
      this.context.moveTo(current.x, current.y);
      this.context.lineTo(next.x, next.y);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawCadenceConvergence(
    visual: VisualParameters,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const strength = visual.cadencePull;
    const laneCount = Math.max(3, Math.round(3 + strength * 4));
    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + strength * 2);
    this.context.strokeStyle = alphaHex(visual.color, 0.08 + strength * 0.12);
    for (let index = 0; index < laneCount; index += 1) {
      const progress = (index + 1) / (laneCount + 1);
      const x = progress * width;
      this.context.beginPath();
      this.context.moveTo(x, height);
      this.context.quadraticCurveTo(
        centerX + Math.sin(time * 0.5 + index) * radius * 0.06,
        centerY + radius * (0.58 + strength * 0.12),
        centerX,
        centerY + radius * 0.18
      );
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawModalTensionCrossings(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const strength = visual.modalTension;
    const lineCount = Math.max(3, Math.round(3 + strength * 5));
    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.lineWidth = Math.max(1, 1 + strength * 2.2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.1 + strength * 0.14);
    for (let index = 0; index < lineCount; index += 1) {
      const angle = time * (0.3 + strength * 0.2) + index * (Math.PI / lineCount);
      this.context.beginPath();
      this.context.moveTo(Math.cos(angle) * radius * 1.08, Math.sin(angle) * radius * 0.84);
      this.context.lineTo(Math.cos(angle + Math.PI) * radius * 1.08, Math.sin(angle + Math.PI) * radius * 0.84);
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawBlendCohesionBraids(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const strength = visual.blendCohesion;
    const braidCount = Math.max(2, Math.round(2 + strength * 3));
    this.context.save();
    this.context.lineWidth = Math.max(1, 1 + strength * 1.8);
    for (let index = 0; index < braidCount; index += 1) {
      this.context.beginPath();
      this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.color : visual.secondaryColor, 0.08 + strength * 0.12);
      for (let step = 0; step <= 20; step += 1) {
        const progress = step / 20;
        const angle = progress * Math.PI * 2 + time * 0.6 + index * 0.8;
        const orbit = radius * (0.46 + index * 0.12 + Math.sin(progress * Math.PI * 4 + time) * 0.04);
        const x = centerX + Math.cos(angle) * orbit;
        const y = centerY + Math.sin(angle * 0.86) * orbit * 0.72;
        if (step === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      }
      this.context.stroke();
    }
    this.context.restore();
  }

  private drawBeamField(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const beamCount = Math.max(3, Math.round(4 + visual.beamStrength * 8 + visual.energy * 2 + visual.arousal * 4));
    const beamLength = radius * (1.6 + visual.energy * 0.9 + visual.arousal * 0.6);
    const beamWidth = Math.max(1.5, 1 + visual.beamStrength * 6);

    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.lineWidth = beamWidth;
    this.context.lineCap = "round";
    this.context.shadowBlur = 18 + visual.glow * 34;
    this.context.shadowColor = visual.secondaryColor;
    this.context.globalAlpha = 0.07 + visual.beamStrength * 0.14 + visual.luminosity * 0.06;

    for (let index = 0; index < beamCount; index += 1) {
      const angle = (Math.PI * 2 * index) / beamCount + time * (0.18 + visual.motionSpeed * 0.3 + visual.arousal * 0.18);
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
    const ringBaseAlpha = 0.1 + visual.rippleStrength * 0.18 + visual.luminosity * 0.08;

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
    const particleCount = Math.max(10, Math.round(10 + visual.particles.density * 32 + visual.arousal * 10 + visual.grit * 6));
    const orbitSpread = radius * (1.1 + visual.particles.spread);

    this.context.save();
    this.context.shadowBlur = 8 + visual.glow * 20;
    this.context.shadowColor = visual.secondaryColor;

    for (let index = 0; index < particleCount; index += 1) {
      const progress = index / particleCount;
      const angle = progress * Math.PI * 2 + time * (0.55 + visual.particles.speed * 0.6);
      const orbit =
        orbitSpread * (0.64 + ((index % 7) / 6) * 0.52 + Math.sin(time + index * 0.7) * visual.particles.spread * 0.08);
      const particleRadius = Math.max(0.9, visual.particles.size * (0.38 + (index % 3) * 0.14 + visual.luminosity * 0.08));
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

    if (containsAny(activeText, ["Celestial", "Sunwake", "Daybreak", "Bloom"])) {
      this.context.save();
      this.context.lineWidth = Math.max(1.2, 1.2 + visual.symmetry * 2.4);
      this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.18 + visual.glow * 0.14);
      this.context.shadowBlur = 14 + visual.glow * 24;
      this.context.shadowColor = visual.secondaryColor;
      for (let index = 0; index < 3; index += 1) {
        const archRadius = radius * (0.94 + index * 0.18);
        this.context.beginPath();
        this.context.arc(centerX, centerY - radius * 0.06, archRadius, Math.PI * 1.04, Math.PI * 1.96);
        this.context.stroke();
      }
      for (let index = 0; index < 4; index += 1) {
        const angle = -Math.PI * 0.75 + index * 0.48 + Math.sin(time + index) * 0.08;
        const nodeX = centerX + Math.cos(angle) * radius * 1.18;
        const nodeY = centerY + Math.sin(angle) * radius * 0.9;
        this.context.beginPath();
        this.context.fillStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.34);
        this.context.arc(nodeX, nodeY, 3 + visual.glow * 4, 0, Math.PI * 2);
        this.context.fill();
      }
      this.context.restore();
    }

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

    if (containsAny(activeText, ["Skyline", "Aurora", "Cadence", "Lattice"])) {
      this.context.save();
      const baseY = centerY + radius * 0.8;
      const barCount = Math.max(4, Math.round(4 + visual.symmetry * 6));
      for (let index = 0; index < barCount; index += 1) {
        const progress = index / Math.max(1, barCount - 1);
        const barX = centerX - radius * 1.18 + progress * radius * 2.36;
        const barHeight = radius * (0.12 + ((index + 2) % 4) * 0.12 + visual.depth * 0.18);
        this.context.fillStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.1 + visual.depth * 0.1);
        this.context.fillRect(barX, baseY - barHeight, radius * 0.1, barHeight);
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

    if (containsAny(activeText, ["Prism", "Chrome", "Meridian", "Fusion"])) {
      this.context.save();
      this.context.translate(centerX, centerY - radius * 0.12);
      this.context.rotate(Math.sin(time * 0.6) * 0.08);
      this.context.lineWidth = Math.max(1, 1 + visual.beamStrength * 2);
      for (let index = 0; index < 5; index += 1) {
        const topY = -radius * (1.1 - index * 0.08);
        const baseWidth = radius * (0.16 + index * 0.08);
        const depthY = radius * (0.12 + index * 0.12);
        this.context.beginPath();
        this.context.strokeStyle = alphaHex(index % 2 === 0 ? visual.secondaryColor : visual.color, 0.14 + visual.depth * 0.1);
        this.context.moveTo(0, topY);
        this.context.lineTo(-baseWidth, depthY);
        this.context.lineTo(baseWidth, depthY);
        this.context.closePath();
        this.context.stroke();
      }
      this.context.restore();
    }
  }

  private drawPulseConstellation(
    visual: VisualParameters,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ): void {
    const nodeCount = Math.max(3, Math.round(3 + visual.pulseDensity * 7 + visual.arousal * 5));
    const travel = radius * (0.44 + visual.pulseDensity * 0.42);

    this.context.save();
    this.context.lineWidth = Math.max(1, 0.8 + visual.pulseDensity * 2);
    this.context.strokeStyle = alphaHex(visual.secondaryColor, 0.12 + visual.pulseDensity * 0.14);
    this.context.fillStyle = alphaHex(visual.color, 0.2 + visual.pulseDensity * 0.16);
    for (let index = 0; index < nodeCount; index += 1) {
      const angle = time * (0.5 + visual.motionSpeed * 0.4) + (Math.PI * 2 * index) / nodeCount;
      const orbit = travel * (0.68 + ((index + 2) % 4) * 0.08);
      const x = centerX + Math.cos(angle) * orbit;
      const y = centerY + Math.sin(angle * (0.9 + visual.symmetry * 0.3)) * orbit * (0.54 + visual.depth * 0.22);

      if (index > 0) {
        const previousAngle = time * (0.5 + visual.motionSpeed * 0.4) + (Math.PI * 2 * (index - 1)) / nodeCount;
        const previousOrbit = travel * (0.68 + (((index - 1) + 2) % 4) * 0.08);
        const previousX = centerX + Math.cos(previousAngle) * previousOrbit;
        const previousY =
          centerY + Math.sin(previousAngle * (0.9 + visual.symmetry * 0.3)) * previousOrbit * (0.54 + visual.depth * 0.22);
        this.context.beginPath();
        this.context.moveTo(previousX, previousY);
        this.context.lineTo(x, y);
        this.context.stroke();
      }

      this.context.beginPath();
      this.context.arc(x, y, 1.8 + visual.pulseDensity * 3.2, 0, Math.PI * 2);
      this.context.fill();
    }
    this.context.restore();
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

function interpolateVisuals(
  fromVisual: VisualParameters,
  toVisual: VisualParameters,
  progress: number
): VisualParameters {
  const numeric = (from: number, to: number) => from + (to - from) * progress;
  const discrete = <T,>(from: T, to: T, threshold = 0.5): T => (progress >= threshold ? to : from);
  const mergedBonuses = progress >= 0.45 ? toVisual.activeBonuses : fromVisual.activeBonuses;
  const mergedSynergies = progress >= 0.45 ? toVisual.activeSynergies : fromVisual.activeSynergies;
  const mergedPhraseHooks = progress >= 0.45 ? toVisual.phraseHooks : fromVisual.phraseHooks;
  const mergedVoiceprints = progress >= 0.45 ? toVisual.voiceprints ?? [] : fromVisual.voiceprints ?? [];
  const mergedElementRoles = progress >= 0.45 ? toVisual.elementRoles ?? [] : fromVisual.elementRoles ?? [];

  return {
    color: mixHex(fromVisual.color, toVisual.color, progress),
    secondaryColor: mixHex(fromVisual.secondaryColor, toVisual.secondaryColor, progress),
    backgroundColor: mixHex(fromVisual.backgroundColor, toVisual.backgroundColor, progress),
    glow: numeric(fromVisual.glow, toVisual.glow),
    contrast: numeric(fromVisual.contrast, toVisual.contrast),
    energy: numeric(fromVisual.energy, toVisual.energy),
    complexity: numeric(fromVisual.complexity, toVisual.complexity),
    temperature: numeric(fromVisual.temperature, toVisual.temperature),
    valence: numeric(fromVisual.valence, toVisual.valence),
    arousal: numeric(fromVisual.arousal, toVisual.arousal),
    luminosity: numeric(fromVisual.luminosity, toVisual.luminosity),
    grit: numeric(fromVisual.grit, toVisual.grit),
    openness: numeric(fromVisual.openness, toVisual.openness),
    attack: numeric(fromVisual.attack, toVisual.attack),
    swing: numeric(fromVisual.swing, toVisual.swing),
    gravity: numeric(fromVisual.gravity, toVisual.gravity),
    synergyResonance: numeric(fromVisual.synergyResonance, toVisual.synergyResonance),
    cadencePull: numeric(fromVisual.cadencePull, toVisual.cadencePull),
    modalTension: numeric(fromVisual.modalTension, toVisual.modalTension),
    blendCohesion: numeric(fromVisual.blendCohesion, toVisual.blendCohesion),
    symmetry: numeric(fromVisual.symmetry, toVisual.symmetry),
    depth: numeric(fromVisual.depth, toVisual.depth),
    pulseDensity: numeric(fromVisual.pulseDensity, toVisual.pulseDensity),
    motionSpeed: numeric(fromVisual.motionSpeed, toVisual.motionSpeed),
    ringCount: Math.round(numeric(fromVisual.ringCount, toVisual.ringCount)),
    rippleStrength: numeric(fromVisual.rippleStrength, toVisual.rippleStrength),
    beamStrength: numeric(fromVisual.beamStrength, toVisual.beamStrength),
    grain: numeric(fromVisual.grain, toVisual.grain),
    signature: discrete(fromVisual.signature, toVisual.signature, 0.42),
    sceneFamily: discrete(fromVisual.sceneFamily, toVisual.sceneFamily, 0.48),
    growthImprint: discrete(fromVisual.growthImprint, toVisual.growthImprint, 0.48),
    growthImprintIntensity: numeric(fromVisual.growthImprintIntensity, toVisual.growthImprintIntensity),
    phraseTrajectory: discrete(fromVisual.phraseTrajectory, toVisual.phraseTrajectory, 0.48),
    phraseTrajectoryIntensity: numeric(fromVisual.phraseTrajectoryIntensity, toVisual.phraseTrajectoryIntensity),
    phraseHooks: mergedPhraseHooks,
    phraseHookEnergy: numeric(fromVisual.phraseHookEnergy, toVisual.phraseHookEnergy),
    phraseVariation: discrete(fromVisual.phraseVariation, toVisual.phraseVariation, 0.48),
    phraseVariationIntensity: numeric(fromVisual.phraseVariationIntensity, toVisual.phraseVariationIntensity),
    voiceprints: mergedVoiceprints,
    voiceprintIntensity: numeric(fromVisual.voiceprintIntensity ?? 0, toVisual.voiceprintIntensity ?? 0),
    elementRoles: mergedElementRoles,
    elementRoleIntensity: numeric(fromVisual.elementRoleIntensity ?? 0, toVisual.elementRoleIntensity ?? 0),
    sceneCascade: discrete(fromVisual.sceneCascade, toVisual.sceneCascade, 0.48),
    sceneCascadeIntensity: numeric(fromVisual.sceneCascadeIntensity, toVisual.sceneCascadeIntensity),
    activeBonuses: mergedBonuses,
    activeSynergies: mergedSynergies,
    particles: {
      density: numeric(fromVisual.particles.density, toVisual.particles.density),
      trail: discrete(fromVisual.particles.trail, toVisual.particles.trail, 0.55),
      size: numeric(fromVisual.particles.size, toVisual.particles.size),
      speed: numeric(fromVisual.particles.speed, toVisual.particles.speed),
      spread: numeric(fromVisual.particles.spread, toVisual.particles.spread)
    },
    geometry: discrete(fromVisual.geometry, toVisual.geometry, 0.52),
    animationState: discrete(fromVisual.animationState, toVisual.animationState, 0.52)
  };
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
