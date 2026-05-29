import type { TheoryElement, VisualParameters } from "../types/theory";
import { createAuthHeaders } from "./authHeaders";

interface SandboxRenderResponse {
  color: string;
  secondary_color?: string;
  background_color?: string;
  glow: number;
  contrast?: number;
  energy?: number;
  complexity?: number;
  temperature?: number;
  valence?: number;
  arousal?: number;
  luminosity?: number;
  grit?: number;
  symmetry?: number;
  depth?: number;
  pulse_density?: number;
  motion_speed?: number;
  ring_count?: number;
  ripple_strength?: number;
  beam_strength?: number;
  grain?: number;
  signature?: string;
  scene_family?: VisualParameters["sceneFamily"];
  growth_imprint?: VisualParameters["growthImprint"];
  growth_imprint_intensity?: number;
  active_bonuses?: string[];
  particles: {
    density: number;
    trail: boolean;
    size?: number;
    speed?: number;
    spread?: number;
  };
  geometry: VisualParameters["geometry"];
  animation_state: VisualParameters["animationState"];
}

interface RenderSandboxVisualInput {
  elements: TheoryElement[];
  authToken?: string;
  apiBaseUrl?: string;
}

export async function renderSandboxVisual({
  elements,
  authToken,
  apiBaseUrl = ""
}: RenderSandboxVisualInput): Promise<VisualParameters> {
  const response = await fetch(`${apiBaseUrl}/sandbox/render`, {
    body: JSON.stringify({
      elements
    }),
    headers: createAuthHeaders(authToken, true),
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Sandbox render request failed with status ${response.status}`);
  }

  return normalizeVisualResponse((await response.json()) as SandboxRenderResponse);
}

function normalizeVisualResponse(response: SandboxRenderResponse): VisualParameters {
  return {
    color: response.color,
    secondaryColor: response.secondary_color ?? response.color,
    backgroundColor: response.background_color ?? "#090809",
    glow: response.glow,
    contrast: response.contrast ?? 0.5,
    energy: response.energy ?? 0.55,
    complexity: response.complexity ?? 0.45,
    temperature: response.temperature ?? 0.5,
    valence: response.valence ?? 0.56,
    arousal: response.arousal ?? 0.58,
    luminosity: response.luminosity ?? 0.56,
    grit: response.grit ?? 0.28,
    symmetry: response.symmetry ?? 0.52,
    depth: response.depth ?? 0.56,
    pulseDensity: response.pulse_density ?? 0.48,
    motionSpeed: response.motion_speed ?? 0.5,
    ringCount: response.ring_count ?? 3,
    rippleStrength: response.ripple_strength ?? 0.4,
    beamStrength: response.beam_strength ?? 0.35,
    grain: response.grain ?? 0.18,
    signature: response.signature ?? "Pulse Field",
    sceneFamily:
      response.scene_family ??
      inferSceneFamily(
        response.signature ?? "Pulse Field",
        response.active_bonuses ?? [],
        response.geometry,
        response.temperature ?? 0.5,
        response.contrast ?? 0.5,
        response.valence ?? 0.56,
        response.luminosity ?? 0.56,
        response.grit ?? 0.28
      ),
    growthImprint:
      response.growth_imprint ??
      inferGrowthImprint(response.signature ?? "Pulse Field", response.active_bonuses ?? []),
    growthImprintIntensity:
      response.growth_imprint_intensity ??
      inferGrowthImprintIntensity(response.signature ?? "Pulse Field", response.active_bonuses ?? []),
    activeBonuses: response.active_bonuses ?? [],
    particles: {
      density: response.particles.density,
      trail: response.particles.trail,
      size: response.particles.size ?? 1.8,
      speed: response.particles.speed ?? 0.9,
      spread: response.particles.spread ?? 0.42
    },
    geometry: response.geometry,
    animationState: response.animation_state
  };
}

function inferSceneFamily(
  signature: string,
  activeBonuses: string[],
  geometry: VisualParameters["geometry"],
  temperature: number,
  contrast: number,
  valence: number,
  luminosity: number,
  grit: number
): VisualParameters["sceneFamily"] {
  const text = [signature, ...activeBonuses].join(" ");

  if (containsAny(text, ["Velvet", "Silk", "Tide"])) {
    return "velvet-chamber";
  }

  if (containsAny(text, ["Metal", "Shrapnel", "Fracture", "Voltage"])) {
    return text.includes("Occult") ? "shadow-sanctum" : "metal-foundry";
  }

  if (containsAny(text, ["Jazz", "Aurora", "Cadence", "Lattice", "Skyline"])) {
    return "jazz-cathedral";
  }

  if (containsAny(text, ["Prism", "Chrome", "Fusion", "Flare", "Meridian"])) {
    return "prism-array";
  }

  if (containsAny(text, ["Neon", "Roadhouse"])) {
    return "neon-grid";
  }

  if (containsAny(text, ["Celestial", "Sunwake", "Daybreak", "Anthem"])) {
    return "solar-garden";
  }

  if (containsAny(text, ["Midnight", "Blue Hour", "Current", "Run"])) {
    return "nocturne-tide";
  }

  if (geometry === "fracture" && contrast > 0.72) {
    return "metal-foundry";
  }

  if (geometry === "lattice") {
    return "jazz-cathedral";
  }

  if (geometry === "wave") {
    return "nocturne-tide";
  }

  if (grit > 0.68 && valence < 0.28) {
    return "shadow-sanctum";
  }

  if (luminosity > 0.72 && valence > 0.7) {
    return "solar-garden";
  }

  return temperature >= 0.62 ? "solar-garden" : "velvet-chamber";
}

function containsAny(source: string, needles: string[]): boolean {
  return needles.some((needle) => source.includes(needle));
}

function inferGrowthImprint(
  signature: string,
  activeBonuses: string[]
): VisualParameters["growthImprint"] {
  const text = [signature, ...activeBonuses].join(" ");

  if (containsAny(text, ["Velvet", "Silk", "Glass", "Current", "Tide"])) {
    return "neo-soul-veil";
  }

  if (containsAny(text, ["Fracture", "Voltage", "Shrapnel", "Ashen", "Occult"])) {
    return "metal-forge";
  }

  if (containsAny(text, ["Jazz", "Cadence", "Aurora", "Lattice", "Skyline", "Blue Hour"])) {
    return "jazz-lattice";
  }

  if (containsAny(text, ["Prism", "Chrome", "Meridian", "Fusion", "Liquid"])) {
    return "fusion-phase";
  }

  if (containsAny(text, ["Neon", "Roadhouse", "Lantern", "Run"])) {
    return "pentatonic-drive";
  }

  return "neutral";
}

function inferGrowthImprintIntensity(signature: string, activeBonuses: string[]): number {
  const imprint = inferGrowthImprint(signature, activeBonuses);

  if (imprint === "neutral") {
    return 0;
  }

  return activeBonuses.length > 0 ? 0.78 : 0.62;
}
