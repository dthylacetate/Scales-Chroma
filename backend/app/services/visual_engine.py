from app.schemas.sandbox import VisualParameters
from app.schemas.theory import TheoryElement


def map_theory_to_visuals(elements: list[TheoryElement]) -> VisualParameters:
    primary = elements[0].name.lower()

    if primary == "maj7":
        return VisualParameters(
            color="#ffb45c",
            glow=0.86,
            particles={"density": 0.52, "trail": False},
            geometry="soft-orb",
            animation_state="flowing",
        )

    if primary == "dim7":
        return VisualParameters(
            color="#d7f7ff",
            glow=0.62,
            particles={"density": 0.88, "trail": False},
            geometry="fracture",
            animation_state="tense",
        )

    if primary == "phrygian":
        return VisualParameters(
            color="#394052",
            glow=0.42,
            particles={"density": 0.45, "trail": False},
            geometry="wave",
            animation_state="calm",
        )

    return VisualParameters(
        color="#7bdff2",
        glow=0.55,
        particles={"density": 0.4, "trail": False},
        geometry="lattice",
        animation_state="flowing",
    )
