from typing import Literal

from app.schemas.theory import TheoryElement
from app.visual_engine.types import AnimationProfile

AnimationState = Literal["calm", "flowing", "tense", "explosive"]

ANIMATION_MAP: dict[str, AnimationState] = {
    "minor": "calm",
    "harmonic minor": "tense",
    "phrygian": "calm",
    "maj7": "flowing",
    "min7": "calm",
    "dominant7": "tense",
    "dim7": "tense",
    "aug": "explosive",
}


def select_animation_state(element: TheoryElement) -> AnimationProfile:
    state = ANIMATION_MAP.get(element.name.lower(), "flowing")
    return AnimationProfile(state=state)
