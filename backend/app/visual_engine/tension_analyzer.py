from app.schemas.theory import TheoryElement
from app.visual_engine.types import TensionProfile

TENSION_LEVELS: dict[str, int] = {
    "maj7": 3,
    "min7": 4,
    "dominant7": 6,
    "dim7": 9,
    "aug": 8,
    "ionian": 2,
    "dorian": 5,
    "phrygian": 7,
    "lydian": 4,
    "mixolydian": 5,
    "major": 2,
    "minor": 5,
    "pentatonic": 3,
    "harmonic minor": 8,
    "melodic minor": 6,
}


def analyze_tension(element: TheoryElement) -> TensionProfile:
    level = TENSION_LEVELS.get(element.name.lower(), 5)
    if level >= 7:
        label = "high"
    elif level >= 4:
        label = "medium"
    else:
        label = "low"
    return TensionProfile(level=level, label=label)
