from typing import Literal

from app.schemas.theory import TheoryElement
from app.visual_engine.types import AnimationProfile

AnimationState = Literal["calm", "flowing", "tense", "explosive"]

ANIMATION_MAP: dict[str, AnimationState] = {
    "maj7": "flowing",
    "dim7": "tense",
    "phrygian": "calm",
    "aug": "explosive",
}


def select_animation_state(element: TheoryElement) -> AnimationProfile:
    state = ANIMATION_MAP.get(element.name.lower(), "flowing")
    return AnimationProfile(state=state)
