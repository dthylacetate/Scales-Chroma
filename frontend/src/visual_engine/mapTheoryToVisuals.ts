import type { TheoryElement, VisualParameters } from "../types/theory";

interface ElementVisualProfile {
  color: string;
  secondaryColor: string;
  backgroundColor: string;
  glow: number;
  contrast: number;
  energy: number;
  complexity: number;
  motionSpeed: number;
  rippleStrength: number;
  beamStrength: number;
  grain: number;
  particleDensity: number;
  geometryWeights: {
    softOrb: number;
    wave: number;
    fracture: number;
    lattice: number;
  };
}

const DEFAULT_VISUALS: VisualParameters = {
  color: "#7bdff2",
  secondaryColor: "#8d99ff",
  backgroundColor: "#091018",
  glow: 0.58,
  contrast: 0.44,
  energy: 0.58,
  complexity: 0.46,
  temperature: 0.5,
  symmetry: 0.52,
  depth: 0.56,
  pulseDensity: 0.48,
  motionSpeed: 0.5,
  ringCount: 3,
  rippleStrength: 0.42,
  beamStrength: 0.34,
  grain: 0.18,
  signature: "Pulse Field",
  activeBonuses: [],
  particles: {
    density: 0.42,
    trail: false,
    size: 1.8,
    speed: 0.92,
    spread: 0.42
  },
  geometry: "lattice",
  animationState: "flowing"
};

const PROFILE_LIBRARY: Record<string, ElementVisualProfile> = {
  major: profile("#f7d56b", "#ffd8a8", "#130f10", 0.62, 0.34, 0.58, 0.28, 0.46, 0.32, 0.22, 0.16, 0.34, {
    softOrb: 0.86,
    wave: 0.34,
    fracture: 0.12,
    lattice: 0.18
  }),
  minor: profile("#7488ff", "#99b0ff", "#0e1020", 0.48, 0.48, 0.42, 0.44, 0.36, 0.62, 0.26, 0.24, 0.42, {
    softOrb: 0.24,
    wave: 0.78,
    fracture: 0.18,
    lattice: 0.22
  }),
  pentatonic: profile("#00d7ff", "#7a7bff", "#081521", 0.64, 0.56, 0.66, 0.52, 0.62, 0.36, 0.48, 0.22, 0.48, {
    softOrb: 0.22,
    wave: 0.38,
    fracture: 0.14,
    lattice: 0.82
  }),
  "harmonic minor": profile("#df4f74", "#7d1f4e", "#15060d", 0.7, 0.78, 0.78, 0.72, 0.72, 0.52, 0.58, 0.44, 0.72, {
    softOrb: 0.14,
    wave: 0.44,
    fracture: 0.86,
    lattice: 0.26
  }),
  "melodic minor": profile("#42c6b0", "#ff8a5b", "#081314", 0.68, 0.58, 0.72, 0.62, 0.66, 0.68, 0.42, 0.22, 0.58, {
    softOrb: 0.24,
    wave: 0.74,
    fracture: 0.24,
    lattice: 0.3
  }),
  ionian: profile("#f8d66d", "#fff3bf", "#120f10", 0.58, 0.3, 0.56, 0.24, 0.42, 0.28, 0.2, 0.16, 0.3, {
    softOrb: 0.88,
    wave: 0.3,
    fracture: 0.1,
    lattice: 0.18
  }),
  dorian: profile("#59d1a4", "#9af0dd", "#071516", 0.66, 0.5, 0.64, 0.52, 0.58, 0.76, 0.34, 0.18, 0.5, {
    softOrb: 0.22,
    wave: 0.82,
    fracture: 0.12,
    lattice: 0.34
  }),
  phrygian: profile("#574062", "#d95f43", "#09070f", 0.46, 0.74, 0.68, 0.64, 0.54, 0.58, 0.48, 0.42, 0.46, {
    softOrb: 0.12,
    wave: 0.68,
    fracture: 0.42,
    lattice: 0.18
  }),
  lydian: profile("#ffe56d", "#8fdcff", "#0f1117", 0.78, 0.42, 0.74, 0.46, 0.58, 0.62, 0.42, 0.16, 0.46, {
    softOrb: 0.82,
    wave: 0.42,
    fracture: 0.12,
    lattice: 0.24
  }),
  mixolydian: profile("#ff9b35", "#ffd36b", "#171008", 0.68, 0.58, 0.7, 0.54, 0.62, 0.38, 0.52, 0.24, 0.56, {
    softOrb: 0.26,
    wave: 0.42,
    fracture: 0.18,
    lattice: 0.74
  }),
  maj7: profile("#ffb45c", "#ff89b5", "#160e0d", 0.86, 0.4, 0.64, 0.34, 0.48, 0.34, 0.3, 0.14, 0.4, {
    softOrb: 0.9,
    wave: 0.34,
    fracture: 0.1,
    lattice: 0.18
  }),
  min7: profile("#7bdff2", "#85a8ff", "#081018", 0.62, 0.46, 0.46, 0.4, 0.4, 0.62, 0.28, 0.16, 0.46, {
    softOrb: 0.24,
    wave: 0.78,
    fracture: 0.1,
    lattice: 0.26
  }),
  dominant7: profile("#f25f5c", "#ffc145", "#16090b", 0.74, 0.72, 0.78, 0.68, 0.68, 0.44, 0.58, 0.34, 0.64, {
    softOrb: 0.16,
    wave: 0.4,
    fracture: 0.78,
    lattice: 0.22
  }),
  dim7: profile("#d8f6ff", "#a6d0ff", "#06080c", 0.72, 0.88, 0.84, 0.84, 0.78, 0.4, 0.72, 0.5, 0.82, {
    softOrb: 0.08,
    wave: 0.32,
    fracture: 0.92,
    lattice: 0.28
  }),
  aug: profile("#ff6bcb", "#ff8a5b", "#160611", 0.8, 0.86, 0.92, 0.8, 0.88, 0.46, 0.74, 0.36, 0.76, {
    softOrb: 0.12,
    wave: 0.36,
    fracture: 0.88,
    lattice: 0.24
  }),
  "ii-v-i": profile("#b8f2e6", "#b8c4ff", "#091115", 0.68, 0.46, 0.62, 0.6, 0.52, 0.58, 0.54, 0.18, 0.5, {
    softOrb: 0.34,
    wave: 0.66,
    fracture: 0.18,
    lattice: 0.58
  }),
  "i-v-vi-iv": profile("#ffcf6e", "#ff9d8c", "#160f09", 0.7, 0.34, 0.68, 0.46, 0.54, 0.34, 0.36, 0.18, 0.42, {
    softOrb: 0.82,
    wave: 0.42,
    fracture: 0.1,
    lattice: 0.22
  })
};

const COMBO_BONUSES = [
  combo(["lydian", "maj7"], "Celestial Bloom", {
    glow: 0.12,
    softOrb: 0.18,
    beamStrength: 0.16,
    rippleStrength: 0.12,
    depth: 0.16,
    symmetry: 0.12,
    secondaryColor: "#8fdcff"
  }),
  combo(["lydian", "major"], "Sunwake Atlas", {
    glow: 0.1,
    softOrb: 0.14,
    beamStrength: 0.14,
    energy: 0.08,
    temperature: 0.12,
    symmetry: 0.1,
    secondaryColor: "#bfe6ff"
  }),
  combo(["dorian", "min7"], "Midnight Current", {
    wave: 0.22,
    rippleStrength: 0.2,
    complexity: 0.12,
    depth: 0.1,
    pulseDensity: 0.08,
    secondaryColor: "#9af0dd"
  }),
  combo(["dorian", "ii-v-i"], "Blue Hour Run", {
    wave: 0.18,
    lattice: 0.14,
    rippleStrength: 0.18,
    beamStrength: 0.1,
    depth: 0.1,
    pulseDensity: 0.12,
    secondaryColor: "#7fe0c8"
  }),
  combo(["phrygian", "dominant7"], "Desert Voltage", {
    fracture: 0.22,
    contrast: 0.14,
    beamStrength: 0.18,
    energy: 0.1,
    pulseDensity: 0.14,
    temperature: 0.12,
    secondaryColor: "#ff9b35"
  }),
  combo(["harmonic minor", "dim7"], "Occult Fracture", {
    fracture: 0.24,
    grain: 0.18,
    complexity: 0.14,
    glow: 0.1,
    depth: 0.18,
    pulseDensity: 0.12,
    symmetry: -0.12,
    backgroundColor: "#05060d"
  }),
  combo(["melodic minor", "dominant7"], "Chrome Meridian", {
    wave: 0.16,
    fracture: 0.12,
    complexity: 0.16,
    energy: 0.12,
    depth: 0.14,
    pulseDensity: 0.1,
    symmetry: 0.08,
    secondaryColor: "#73f0d5"
  }),
  combo(["ii-v-i", "maj7"], "Cadence Aurora", {
    lattice: 0.2,
    rippleStrength: 0.16,
    beamStrength: 0.18,
    depth: 0.12,
    symmetry: 0.14,
    secondaryColor: "#c2b8ff"
  }),
  combo(["i-v-vi-iv", "major"], "Anthem Lift", {
    softOrb: 0.22,
    glow: 0.1,
    energy: 0.12,
    beamStrength: 0.12,
    temperature: 0.1,
    pulseDensity: 0.12
  }),
  combo(["ionian", "i-v-vi-iv"], "Daybreak Parade", {
    softOrb: 0.18,
    glow: 0.12,
    beamStrength: 0.14,
    rippleStrength: 0.08,
    temperature: 0.14,
    symmetry: 0.12,
    secondaryColor: "#ffe5a8"
  }),
  combo(["pentatonic", "mixolydian"], "Roadhouse Neon", {
    lattice: 0.18,
    beamStrength: 0.2,
    contrast: 0.12,
    energy: 0.12,
    pulseDensity: 0.14,
    temperature: 0.08
  }),
  combo(["minor", "pentatonic"], "Midnight Run", {
    wave: 0.16,
    contrast: 0.12,
    rippleStrength: 0.18,
    depth: 0.12,
    pulseDensity: 0.12,
    backgroundColor: "#08111e"
  }),
  combo(["mixolydian", "dominant7"], "Brass Overdrive", {
    lattice: 0.16,
    fracture: 0.12,
    beamStrength: 0.18,
    energy: 0.14,
    pulseDensity: 0.14,
    temperature: 0.14,
    secondaryColor: "#ffc145"
  }),
  combo(["aug", "lydian"], "Prism Flare", {
    fracture: 0.16,
    softOrb: 0.14,
    glow: 0.12,
    beamStrength: 0.18,
    symmetry: 0.08,
    depth: 0.1,
    secondaryColor: "#ff9be8"
  })
];

export function mapTheoryToVisuals(elements: TheoryElement[]): VisualParameters {
  if (elements.length === 0) {
    return DEFAULT_VISUALS;
  }

  const weightedElements = elements.map((element, index) => ({
    element,
    weight: elementWeight(element, index, elements.length)
  }));
  const totalWeight = weightedElements.reduce((sum, item) => sum + item.weight, 0);

  const visual = {
    color: blendHexes(weightedElements.map(({ element, weight }) => [profileFor(element).color, weight])),
    secondaryColor: blendHexes(weightedElements.map(({ element, weight }) => [profileFor(element).secondaryColor, weight])),
    backgroundColor: blendHexes(weightedElements.map(({ element, weight }) => [profileFor(element).backgroundColor, weight])),
    glow: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).glow),
    contrast: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).contrast),
    energy: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).energy),
    complexity: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).complexity),
    motionSpeed: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).motionSpeed),
    rippleStrength: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).rippleStrength),
    beamStrength: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).beamStrength),
    grain: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).grain),
    particleDensity: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).particleDensity),
    geometryWeights: {
      softOrb: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.softOrb),
      wave: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.wave),
      fracture: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.fracture),
      lattice: weightedAverage(weightedElements, totalWeight, (profileItem) => profileFor(profileItem).geometryWeights.lattice)
    },
    temperature: weightedAverage(weightedElements, totalWeight, (profileItem) => moodTemperature(profileItem.name)),
    symmetry: 0,
    depth: 0,
    pulseDensity: 0,
    signature: elements.length > 1 ? "Composite Pulse" : elements[0].name,
    activeBonuses: [] as string[]
  };
  visual.symmetry = resolveSymmetry(visual.geometryWeights);
  visual.depth = resolveDepth(visual);
  visual.pulseDensity = resolvePulseDensity(visual);

  const stackBonus = Math.max(0, elements.length - 1) * 0.05;
  visual.glow = clamp01(visual.glow + stackBonus * 0.25);
  visual.contrast = clamp01(visual.contrast + stackBonus * 0.35);
  visual.energy = clamp01(visual.energy + stackBonus * 0.4);
  visual.complexity = clamp01(visual.complexity + stackBonus * 0.6);
  visual.temperature = clamp01(visual.temperature + stackBonus * 0.18);
  visual.symmetry = clamp01(visual.symmetry + stackBonus * 0.12);
  visual.depth = clamp01(visual.depth + stackBonus * 0.2);
  visual.pulseDensity = clamp01(visual.pulseDensity + stackBonus * 0.22);
  visual.motionSpeed = clamp01(visual.motionSpeed + stackBonus * 0.45);
  visual.rippleStrength = clamp01(visual.rippleStrength + stackBonus * 0.3);
  visual.beamStrength = clamp01(visual.beamStrength + stackBonus * 0.35);
  visual.grain = clamp01(visual.grain + stackBonus * 0.25);
  visual.particleDensity = Math.min(0.95, visual.particleDensity + stackBonus * 0.12);
  visual.geometryWeights.softOrb = clamp01(visual.geometryWeights.softOrb + stackBonus * 0.18);
  visual.geometryWeights.wave = clamp01(visual.geometryWeights.wave + stackBonus * 0.18);
  visual.geometryWeights.fracture = clamp01(visual.geometryWeights.fracture + stackBonus * 0.18);
  visual.geometryWeights.lattice = clamp01(visual.geometryWeights.lattice + stackBonus * 0.18);

  const names = new Set(elements.map((element) => element.name.toLowerCase()));
  for (const comboItem of COMBO_BONUSES) {
    if (comboItem.requires.every((name) => names.has(name))) {
      visual.activeBonuses.push(comboItem.name);
      applyComboEffects(visual, comboItem.effects);
      visual.signature = comboItem.name;
    }
  }

  const geometry = dominantGeometry(visual.geometryWeights);
  const animationState = dominantAnimationState(visual);
  const ringCount = Math.max(2, Math.min(8, Math.floor(2 + visual.rippleStrength * 3 + visual.complexity * 2)));
  const particles = {
    density: Math.min(0.98, round(visual.particleDensity + visual.complexity * 0.16 + visual.energy * 0.08)),
    trail: false,
    size: round(1.0 + visual.complexity * 2.6),
    speed: round(0.4 + visual.energy * 1.35),
    spread: round(0.28 + visual.complexity * 0.34 + visual.energy * 0.18)
  };

  return {
    color: visual.color,
    secondaryColor: visual.secondaryColor,
    backgroundColor: visual.backgroundColor,
    glow: round(visual.glow),
    contrast: round(visual.contrast),
    energy: round(visual.energy),
    complexity: round(visual.complexity),
    temperature: round(visual.temperature),
    symmetry: round(visual.symmetry),
    depth: round(visual.depth),
    pulseDensity: round(visual.pulseDensity),
    motionSpeed: round(visual.motionSpeed),
    ringCount,
    rippleStrength: round(visual.rippleStrength),
    beamStrength: round(visual.beamStrength),
    grain: round(visual.grain),
    signature: visual.signature,
    activeBonuses: visual.activeBonuses,
    particles,
    geometry,
    animationState
  };
}

function profile(
  color: string,
  secondaryColor: string,
  backgroundColor: string,
  glow: number,
  contrast: number,
  energy: number,
  complexity: number,
  motionSpeed: number,
  rippleStrength: number,
  beamStrength: number,
  grain: number,
  particleDensity: number,
  geometryWeights: ElementVisualProfile["geometryWeights"]
): ElementVisualProfile {
  return {
    color,
    secondaryColor,
    backgroundColor,
    glow,
    contrast,
    energy,
    complexity,
    motionSpeed,
    rippleStrength,
    beamStrength,
    grain,
    particleDensity,
    geometryWeights
  };
}

function combo(requires: string[], name: string, effects: Record<string, number | string>) {
  return { requires, name, effects };
}

function profileFor(element: TheoryElement): ElementVisualProfile {
  return PROFILE_LIBRARY[element.name.toLowerCase()] ?? {
    color: DEFAULT_VISUALS.color,
    secondaryColor: DEFAULT_VISUALS.secondaryColor,
    backgroundColor: DEFAULT_VISUALS.backgroundColor,
    glow: DEFAULT_VISUALS.glow,
    contrast: DEFAULT_VISUALS.contrast,
    energy: DEFAULT_VISUALS.energy,
    complexity: DEFAULT_VISUALS.complexity,
    motionSpeed: DEFAULT_VISUALS.motionSpeed,
    rippleStrength: DEFAULT_VISUALS.rippleStrength,
    beamStrength: DEFAULT_VISUALS.beamStrength,
    grain: DEFAULT_VISUALS.grain,
    particleDensity: DEFAULT_VISUALS.particles.density,
    geometryWeights: {
      softOrb: 0.28,
      wave: 0.42,
      fracture: 0.24,
      lattice: 0.6
    }
  };
}

function elementWeight(element: TheoryElement, index: number, total: number): number {
  const typeWeight: Record<TheoryElement["type"], number> = {
    scale: 0.95,
    mode: 1,
    chord: 1.18,
    progression: 1.34
  };
  const positionalLift = total > 1 ? 1 + (index / Math.max(1, total - 1)) * 0.12 : 1;
  return typeWeight[element.type] * positionalLift;
}

function weightedAverage(
  weightedElements: Array<{ element: TheoryElement; weight: number }>,
  totalWeight: number,
  selector: (element: TheoryElement) => number
): number {
  return weightedElements.reduce((sum, item) => sum + selector(item.element) * item.weight, 0) / totalWeight;
}

function applyComboEffects(
  visual: {
    color: string;
    secondaryColor: string;
    backgroundColor: string;
    glow: number;
    contrast: number;
    energy: number;
    complexity: number;
    temperature: number;
    symmetry: number;
    depth: number;
    pulseDensity: number;
    motionSpeed: number;
    rippleStrength: number;
    beamStrength: number;
    grain: number;
    particleDensity: number;
    geometryWeights: ElementVisualProfile["geometryWeights"];
    signature: string;
    activeBonuses: string[];
  },
  effects: Record<string, number | string>
): void {
  for (const [key, value] of Object.entries(effects)) {
    if (typeof value === "string") {
      if (key === "secondaryColor") {
        visual.secondaryColor = value;
      } else if (key === "backgroundColor") {
        visual.backgroundColor = value;
      }
      continue;
    }

    if (key in visual.geometryWeights) {
      const geometryKey = key as keyof ElementVisualProfile["geometryWeights"];
      visual.geometryWeights[geometryKey] = clamp01(visual.geometryWeights[geometryKey] + value);
      continue;
    }

    const currentValue = visual[key as keyof typeof visual];
    if (typeof currentValue === "number") {
      visual[key as keyof typeof visual] = clamp01(currentValue + value) as never;
    }
  }
}

function dominantGeometry(weights: ElementVisualProfile["geometryWeights"]): VisualParameters["geometry"] {
  const entries: Array<[VisualParameters["geometry"], number]> = [
    ["soft-orb", weights.softOrb],
    ["wave", weights.wave],
    ["fracture", weights.fracture],
    ["lattice", weights.lattice]
  ];
  return entries.sort((left, right) => right[1] - left[1])[0][0];
}

function dominantAnimationState(visual: {
  energy: number;
  contrast: number;
  glow: number;
  rippleStrength: number;
  motionSpeed: number;
  geometryWeights: ElementVisualProfile["geometryWeights"];
}): VisualParameters["animationState"] {
  if (visual.energy > 0.86 || (visual.geometryWeights.fracture > 0.78 && visual.motionSpeed > 0.78)) {
    return "explosive";
  }

  if (visual.contrast > 0.74 || visual.geometryWeights.fracture > 0.64) {
    return "tense";
  }

  if (visual.energy < 0.48 && visual.geometryWeights.wave > 0.56 && visual.glow < 0.68) {
    return "calm";
  }

  return "flowing";
}

function moodTemperature(elementName: string): number {
  const name = elementName.toLowerCase();

  if (["major", "ionian", "lydian", "mixolydian", "maj7", "dominant7", "aug", "i-v-vi-iv"].includes(name)) {
    return 0.82;
  }

  if (["minor", "pentatonic", "melodic minor", "dorian", "min7", "ii-v-i", "dim7"].includes(name)) {
    return 0.28;
  }

  return 0.46;
}

function resolveSymmetry(weights: ElementVisualProfile["geometryWeights"]): number {
  return clamp01(weights.softOrb * 0.36 + weights.wave * 0.18 + weights.lattice * 0.42 + (1 - weights.fracture) * 0.22);
}

function resolveDepth(visual: {
  glow: number;
  contrast: number;
  complexity: number;
  rippleStrength: number;
  beamStrength: number;
}): number {
  return clamp01(
    0.16 +
      visual.glow * 0.2 +
      visual.contrast * 0.08 +
      visual.complexity * 0.28 +
      visual.rippleStrength * 0.18 +
      visual.beamStrength * 0.16
  );
}

function resolvePulseDensity(visual: {
  energy: number;
  motionSpeed: number;
  rippleStrength: number;
  contrast: number;
}): number {
  return clamp01(
    0.14 + visual.energy * 0.34 + visual.motionSpeed * 0.16 + visual.rippleStrength * 0.14 + visual.contrast * 0.24
  );
}

function blendHexes(weightedHexes: Array<[string, number]>): string {
  const totals = weightedHexes.reduce(
    (sum, [hex, weight]) => {
      const [r, g, b] = hexToRgb(hex);
      sum.r += r * weight;
      sum.g += g * weight;
      sum.b += b * weight;
      sum.weight += weight;
      return sum;
    },
    { r: 0, g: 0, b: 0, weight: 0 }
  );

  return rgbToHex(
    Math.round(totals.r / totals.weight),
    Math.round(totals.g / totals.weight),
    Math.round(totals.b / totals.weight)
  );
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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
