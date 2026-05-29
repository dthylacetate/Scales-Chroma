from typing import Literal

from app.schemas.theory import TheoryElement
from app.visual_engine.types import GeometryProfile

GeometryShape = Literal["soft-orb", "fracture", "wave", "lattice"]

GEOMETRY_MAP: dict[str, GeometryShape] = {
    "maj7": "soft-orb",
    "dim7": "fracture",
    "phrygian": "wave",
    "dorian": "wave",
    "pentatonic": "lattice",
}


def generate_geometry(element: TheoryElement) -> GeometryProfile:
    shape = GEOMETRY_MAP.get(element.name.lower(), "lattice")
    return GeometryProfile(shape=shape)
