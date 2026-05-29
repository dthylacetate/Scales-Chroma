from app.schemas.theory import TheoryElement
from app.visual_engine.animation_controller import select_animation_state
from app.visual_engine.color_mapper import map_color
from app.visual_engine.geometry_generator import generate_geometry
from app.visual_engine.particle_system import configure_particles
from app.visual_engine.renderer import render_visual_parameters
from app.visual_engine.tension_analyzer import analyze_tension


def test_tension_analyzer_scores_music_theory_elements() -> None:
    assert analyze_tension(TheoryElement(id="c-maj7", type="chord", name="Maj7")).level == 3
    assert analyze_tension(TheoryElement(id="c-dim7", type="chord", name="Dim7")).level == 9
    assert analyze_tension(TheoryElement(id="e-phrygian", type="mode", name="Phrygian")).level == 7


def test_color_mapper_uses_theory_emotion_not_generic_palette() -> None:
    assert map_color(TheoryElement(id="c-maj7", type="chord", name="Maj7")).hex == "#ffb45c"
    assert map_color(TheoryElement(id="c-dim7", type="chord", name="Dim7")).hex == "#d7f7ff"
    assert map_color(TheoryElement(id="e-phrygian", type="mode", name="Phrygian")).hex == "#394052"


def test_particle_system_reacts_to_tension_and_unlocks() -> None:
    base_particles = configure_particles(tension_level=3, unlocked_effects=[])
    unlocked_particles = configure_particles(tension_level=7, unlocked_effects=["particle_trail"])

    assert base_particles.density == 0.38
    assert not base_particles.trail
    assert unlocked_particles.density > base_particles.density
    assert unlocked_particles.trail


def test_geometry_and_animation_reflect_theory_identity() -> None:
    maj7 = TheoryElement(id="c-maj7", type="chord", name="Maj7")
    dim7 = TheoryElement(id="c-dim7", type="chord", name="Dim7")

    assert generate_geometry(maj7).shape == "soft-orb"
    assert select_animation_state(maj7).state == "flowing"
    assert generate_geometry(dim7).shape == "fracture"
    assert select_animation_state(dim7).state == "tense"


def test_renderer_composes_visual_parameters_from_engine_components() -> None:
    visual = render_visual_parameters(
        elements=[TheoryElement(id="c-dim7", type="chord", name="Dim7")],
        unlocked_effects=["particle_trail"],
    )

    assert visual.color == "#d7f7ff"
    assert visual.glow > 0.6
    assert visual.particles["density"] > 0.75
    assert visual.particles["trail"] is True
    assert visual.geometry == "fracture"
    assert visual.animation_state == "tense"
