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
  motion_speed?: number;
  ring_count?: number;
  ripple_strength?: number;
  beam_strength?: number;
  grain?: number;
  signature?: string;
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
    motionSpeed: response.motion_speed ?? 0.5,
    ringCount: response.ring_count ?? 3,
    rippleStrength: response.ripple_strength ?? 0.4,
    beamStrength: response.beam_strength ?? 0.35,
    grain: response.grain ?? 0.18,
    signature: response.signature ?? "Pulse Field",
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
