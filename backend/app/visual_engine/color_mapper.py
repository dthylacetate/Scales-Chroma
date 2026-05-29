from app.schemas.theory import TheoryElement
from app.visual_engine.types import ColorProfile

COLOR_MAP: dict[str, ColorProfile] = {
    "major": ColorProfile(hex="#f6e27f", temperature="warm"),
    "minor": ColorProfile(hex="#7b8cff", temperature="cool"),
    "pentatonic": ColorProfile(hex="#00d4ff", temperature="cool"),
    "harmonic minor": ColorProfile(hex="#d6457a", temperature="dark"),
    "melodic minor": ColorProfile(hex="#47c9af", temperature="cool"),
    "ionian": ColorProfile(hex="#f8d66d", temperature="warm"),
    "dorian": ColorProfile(hex="#62d2a2", temperature="cool"),
    "phrygian": ColorProfile(hex="#394052", temperature="dark"),
    "lydian": ColorProfile(hex="#ffe66d", temperature="warm"),
    "mixolydian": ColorProfile(hex="#ff9f1c", temperature="warm"),
    "maj7": ColorProfile(hex="#ffb45c", temperature="warm"),
    "min7": ColorProfile(hex="#7bdff2", temperature="cool"),
    "dominant7": ColorProfile(hex="#f25f5c", temperature="warm"),
    "dim7": ColorProfile(hex="#d7f7ff", temperature="cool"),
    "aug": ColorProfile(hex="#ff6bcb", temperature="warm"),
    "ii-v-i": ColorProfile(hex="#b8f2e6", temperature="cool"),
    "i-v-vi-iv": ColorProfile(hex="#ffcf6e", temperature="warm"),
}

DEFAULT_COLOR = ColorProfile(hex="#7bdff2", temperature="cool")


def map_color(element: TheoryElement) -> ColorProfile:
    return COLOR_MAP.get(element.name.lower(), DEFAULT_COLOR)
