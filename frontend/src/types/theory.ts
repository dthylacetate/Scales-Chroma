export type TheoryType = "scale" | "mode" | "chord" | "progression";

export interface TheoryElement {
  id: string;
  type: TheoryType;
  name: string;
}

export interface VisualParameters {
  color: string;
  glow: number;
  particles: {
    density: number;
    trail: boolean;
  };
  geometry: "soft-orb" | "fracture" | "wave" | "lattice";
  animationState: "calm" | "flowing" | "tense" | "explosive";
}
