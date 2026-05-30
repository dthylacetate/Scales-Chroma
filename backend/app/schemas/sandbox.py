from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.theory import TheoryElement


GrowthImprintName = Literal[
    "neutral",
    "pentatonic-drive",
    "jazz-lattice",
    "metal-forge",
    "neo-soul-veil",
    "fusion-phase",
]

PhraseTrajectoryName = Literal[
    "neutral",
    "lift-arc",
    "velvet-drift",
    "forge-drop",
    "prism-climb",
    "runway-drive",
    "shadow-sink",
]

PhraseVariationName = Literal[
    "neutral",
    "choir-step",
    "silk-orbit",
    "hammer-fall",
    "phase-spiral",
    "spark-chase",
]


class VisualParameters(BaseModel):
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")
    secondary_color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")
    background_color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")
    glow: float = Field(ge=0.0, le=1.0)
    contrast: float = Field(ge=0.0, le=1.0)
    energy: float = Field(ge=0.0, le=1.0)
    complexity: float = Field(ge=0.0, le=1.0)
    temperature: float = Field(ge=0.0, le=1.0)
    valence: float = Field(ge=0.0, le=1.0)
    arousal: float = Field(ge=0.0, le=1.0)
    luminosity: float = Field(ge=0.0, le=1.0)
    grit: float = Field(ge=0.0, le=1.0)
    openness: float = Field(ge=0.0, le=1.0)
    attack: float = Field(ge=0.0, le=1.0)
    swing: float = Field(ge=0.0, le=1.0)
    gravity: float = Field(ge=0.0, le=1.0)
    synergy_resonance: float = Field(ge=0.0, le=1.0)
    cadence_pull: float = Field(ge=0.0, le=1.0)
    modal_tension: float = Field(ge=0.0, le=1.0)
    blend_cohesion: float = Field(ge=0.0, le=1.0)
    symmetry: float = Field(ge=0.0, le=1.0)
    depth: float = Field(ge=0.0, le=1.0)
    pulse_density: float = Field(ge=0.0, le=1.0)
    motion_speed: float = Field(ge=0.0, le=1.5)
    ring_count: int = Field(ge=0, le=12)
    ripple_strength: float = Field(ge=0.0, le=1.0)
    beam_strength: float = Field(ge=0.0, le=1.0)
    grain: float = Field(ge=0.0, le=1.0)
    signature: str = Field(min_length=1, max_length=120)
    scene_family: Literal[
        "solar-garden",
        "velvet-chamber",
        "metal-foundry",
        "jazz-cathedral",
        "prism-array",
        "nocturne-tide",
        "neon-grid",
        "shadow-sanctum",
    ]
    growth_imprint: GrowthImprintName
    growth_imprint_intensity: float = Field(ge=0.0, le=1.0)
    phrase_trajectory: PhraseTrajectoryName
    phrase_trajectory_intensity: float = Field(ge=0.0, le=1.0)
    phrase_hooks: list[str]
    phrase_hook_energy: float = Field(ge=0.0, le=1.0)
    phrase_variation: PhraseVariationName
    phrase_variation_intensity: float = Field(ge=0.0, le=1.0)
    scene_cascade: Literal[
        "neutral",
        "aurora-dais",
        "velvet-arcade",
        "forge-ritual",
        "prism-vortex",
        "tide-runway",
        "eclipse-altar",
    ]
    scene_cascade_intensity: float = Field(ge=0.0, le=1.0)
    active_bonuses: list[str]
    active_synergies: list[str]
    particles: dict[str, float | bool]
    geometry: Literal["soft-orb", "fracture", "wave", "lattice"]
    animation_state: Literal["calm", "flowing", "tense", "explosive"]


class SandboxRenderRequest(BaseModel):
    elements: list[TheoryElement] = Field(min_length=1)
    preview_growth_imprint: GrowthImprintName | None = None
