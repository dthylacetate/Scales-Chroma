from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class TensionProfile:
    level: int
    intensity: float
    label: Literal["low", "medium", "high"]


@dataclass(frozen=True)
class ColorProfile:
    hex: str
    secondary_hex: str
    background_hex: str
    temperature: Literal["warm", "cool", "dark"]


@dataclass(frozen=True)
class ParticleProfile:
    density: float
    trail: bool
    size: float
    speed: float
    spread: float


@dataclass(frozen=True)
class GeometryProfile:
    shape: Literal["soft-orb", "fracture", "wave", "lattice"]
    orb: float
    wave: float
    fracture: float
    lattice: float


@dataclass(frozen=True)
class AnimationProfile:
    state: Literal["calm", "flowing", "tense", "explosive"]
    energy: float
    motion_speed: float
