from app.schemas.theory import TheoryElement
from app.visual_engine.types import ColorProfile

COLOR_MAP: dict[str, ColorProfile] = {
    "maj7": ColorProfile(hex="#ffb45c", temperature="warm"),
    "min7": ColorProfile(hex="#7bdff2", temperature="cool"),
    "dominant7": ColorProfile(hex="#f25f5c", temperature="warm"),
    "dim7": ColorProfile(hex="#d7f7ff", temperature="cool"),
    "aug": ColorProfile(hex="#ff6bcb", temperature="warm"),
    "phrygian": ColorProfile(hex="#394052", temperature="dark"),
    "dorian": ColorProfile(hex="#62d2a2", temperature="cool"),
    "lydian": ColorProfile(hex="#f6e27f", temperature="warm"),
    "mixolydian": ColorProfile(hex="#ff9f1c", temperature="warm"),
    "pentatonic": ColorProfile(hex="#00d4ff", temperature="cool"),
}

DEFAULT_COLOR = ColorProfile(hex="#7bdff2", temperature="cool")


def map_color(element: TheoryElement) -> ColorProfile:
    return COLOR_MAP.get(element.name.lower(), DEFAULT_COLOR)
