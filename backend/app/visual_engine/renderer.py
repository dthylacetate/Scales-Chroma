from app.schemas.sandbox import VisualParameters
from app.schemas.theory import TheoryElement
from app.visual_engine.animation_controller import select_animation_state
from app.visual_engine.color_mapper import map_color
from app.visual_engine.geometry_generator import generate_geometry
from app.visual_engine.particle_system import configure_particles
from app.visual_engine.tension_analyzer import analyze_tension
from app.visual_engine.types import TensionProfile


def render_visual_parameters(
    elements: list[TheoryElement],
    unlocked_effects: list[str] | None = None,
) -> VisualParameters:
    unlocks = set(unlocked_effects or [])
    dominant_element, tension = _dominant_tension_element(elements)

    color = map_color(dominant_element)
    particles = configure_particles(tension.level, list(unlocks))
    geometry_shape = _geometry_with_unlocks(generate_geometry(dominant_element).shape, unlocks)
    animation_state = _animation_with_unlocks(select_animation_state(dominant_element).state, unlocks)
    glow = _glow_with_unlocks(_glow_for_element(dominant_element, tension.level), unlocks)

    return VisualParameters(
        color=color.hex,
        glow=glow,
        particles={"density": particles.density, "trail": particles.trail},
        geometry=geometry_shape,
        animation_state=animation_state,
    )


def _dominant_tension_element(elements: list[TheoryElement]) -> tuple[TheoryElement, TensionProfile]:
    return max(((element, analyze_tension(element)) for element in elements), key=lambda item: item[1].level)


def _glow_for_element(element: TheoryElement, tension_level: int) -> float:
    glow_overrides = {
        "maj7": 0.86,
        "dim7": 0.8,
        "phrygian": 0.42,
    }
    return glow_overrides.get(element.name.lower(), _glow_from_tension(tension_level))


def _glow_from_tension(tension_level: int) -> float:
    return min(1.0, round(0.35 + tension_level * 0.05, 2))


def _geometry_with_unlocks(base_geometry: str, unlocked_effects: set[str]) -> str:
    if "fracture_burst" in unlocked_effects:
        return "fracture"

    if "harmonic_lattice" in unlocked_effects:
        return "lattice"

    return base_geometry


def _animation_with_unlocks(base_animation: str, unlocked_effects: set[str]) -> str:
    if "fracture_burst" in unlocked_effects:
        return "explosive"

    if "dynamic_ripple" in unlocked_effects and base_animation == "calm":
        return "flowing"

    return base_animation


def _glow_with_unlocks(base_glow: float, unlocked_effects: set[str]) -> float:
    glow_bonus = 0.0

    if "neon_glow" in unlocked_effects:
        glow_bonus += 0.1

    if "velvet_glow" in unlocked_effects:
        glow_bonus += 0.16

    return min(1.0, round(base_glow + glow_bonus, 2))
