from typing import Literal

from app.schemas.theory import TheoryElement
from app.visual_engine.types import GeometryProfile

GeometryShape = Literal["soft-orb", "fracture", "wave", "lattice"]

GEOMETRY_MAP: dict[str, GeometryShape] = {
    "major": "soft-orb",
    "minor": "wave",
    "pentatonic": "lattice",
    "harmonic minor": "fracture",
    "melodic minor": "wave",
    "ionian": "soft-orb",
    "dorian": "wave",
    "phrygian": "wave",
    "lydian": "soft-orb",
    "mixolydian": "lattice",
    "maj7": "soft-orb",
    "min7": "wave",
    "dominant7": "fracture",
    "dim7": "fracture",
    "aug": "fracture",
    "ii-v-i": "wave",
    "i-v-vi-iv": "soft-orb",
}


def generate_geometry(element: TheoryElement) -> GeometryProfile:
    shape = GEOMETRY_MAP.get(element.name.lower(), "lattice")
    return GeometryProfile(shape=shape)
