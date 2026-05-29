from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.theory import TheoryElement


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
    active_bonuses: list[str]
    particles: dict[str, float | bool]
    geometry: Literal["soft-orb", "fracture", "wave", "lattice"]
    animation_state: Literal["calm", "flowing", "tense", "explosive"]


class SandboxRenderRequest(BaseModel):
    elements: list[TheoryElement] = Field(min_length=1)
