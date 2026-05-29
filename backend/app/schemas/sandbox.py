from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.theory import TheoryElement


class VisualParameters(BaseModel):
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")
    glow: float = Field(ge=0.0, le=1.0)
    particles: dict[str, float | bool]
    geometry: Literal["soft-orb", "fracture", "wave", "lattice"]
    animation_state: Literal["calm", "flowing", "tense", "explosive"]


class SandboxRenderRequest(BaseModel):
    elements: list[TheoryElement] = Field(min_length=1)
