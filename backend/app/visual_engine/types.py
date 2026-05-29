from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class TensionProfile:
    level: int
    label: Literal["low", "medium", "high"]


@dataclass(frozen=True)
class ColorProfile:
    hex: str
    temperature: Literal["warm", "cool", "dark"]


@dataclass(frozen=True)
class ParticleProfile:
    density: float
    trail: bool


@dataclass(frozen=True)
class GeometryProfile:
    shape: Literal["soft-orb", "fracture", "wave", "lattice"]


@dataclass(frozen=True)
class AnimationProfile:
    state: Literal["calm", "flowing", "tense", "explosive"]
