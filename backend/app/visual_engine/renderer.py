from app.schemas.sandbox import VisualParameters
from app.schemas.theory import TheoryElement
from app.visual_engine.animation_controller import select_animation_state
from app.visual_engine.color_mapper import map_color
from app.visual_engine.geometry_generator import generate_geometry
from app.visual_engine.particle_system import configure_particles
from app.visual_engine.tension_analyzer import analyze_tension


def render_visual_parameters(
    elements: list[TheoryElement],
    unlocked_effects: list[str] | None = None,
) -> VisualParameters:
    primary = elements[0]
    unlocks = unlocked_effects or []

    tension = analyze_tension(primary)
    color = map_color(primary)
    particles = configure_particles(tension.level, unlocks)
    geometry = generate_geometry(primary)
    animation = select_animation_state(primary)

    return VisualParameters(
        color=color.hex,
        glow=_glow_for_element(primary, tension.level),
        particles={"density": particles.density, "trail": particles.trail},
        geometry=geometry.shape,
        animation_state=animation.state,
    )


def _glow_for_element(element: TheoryElement, tension_level: int) -> float:
    glow_overrides = {
        "maj7": 0.86,
        "dim7": 0.62,
        "phrygian": 0.42,
    }
    return glow_overrides.get(element.name.lower(), _glow_from_tension(tension_level))


def _glow_from_tension(tension_level: int) -> float:
    return min(1.0, round(0.35 + tension_level * 0.05, 2))
