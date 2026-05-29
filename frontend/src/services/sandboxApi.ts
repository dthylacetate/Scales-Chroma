import type { TheoryElement, VisualParameters } from "../types/theory";

interface SandboxRenderResponse {
  color: string;
  glow: number;
  particles: {
    density: number;
    trail: boolean;
  };
  geometry: VisualParameters["geometry"];
  animation_state: VisualParameters["animationState"];
}

interface RenderSandboxVisualInput {
  elements: TheoryElement[];
  userId?: number;
  apiBaseUrl?: string;
}

export async function renderSandboxVisual({
  elements,
  userId,
  apiBaseUrl = ""
}: RenderSandboxVisualInput): Promise<VisualParameters> {
  const response = await fetch(`${apiBaseUrl}/sandbox/render`, {
    body: JSON.stringify({
      ...(userId ? { user_id: userId } : {}),
      elements
    }),
    headers: {
      "Content-Type": "application/json"
    },
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
    glow: response.glow,
    particles: response.particles,
    geometry: response.geometry,
    animationState: response.animation_state
  };
}
