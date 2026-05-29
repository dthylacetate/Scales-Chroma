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
    assert map_color(TheoryElement(id="c-dim7", type="chord", name="Dim7")).hex == "#d8f6ff"
    assert map_color(TheoryElement(id="e-phrygian", type="mode", name="Phrygian")).hex == "#574062"


def test_visual_engine_covers_full_planned_theory_library() -> None:
    expected_visuals = [
        ("major", "scale", "Major", "#f7d56b", "soft-orb", "flowing"),
        ("minor", "scale", "Minor", "#7488ff", "wave", "calm"),
        ("pentatonic", "scale", "Pentatonic", "#00d7ff", "lattice", "flowing"),
        ("harmonic-minor", "scale", "Harmonic Minor", "#df4f74", "fracture", "tense"),
        ("melodic-minor", "scale", "Melodic Minor", "#42c6b0", "wave", "flowing"),
        ("ionian", "mode", "Ionian", "#f8d66d", "soft-orb", "flowing"),
        ("dorian", "mode", "Dorian", "#59d1a4", "wave", "flowing"),
        ("phrygian", "mode", "Phrygian", "#574062", "wave", "tense"),
        ("lydian", "mode", "Lydian", "#ffe56d", "soft-orb", "flowing"),
        ("mixolydian", "mode", "Mixolydian", "#ff9b35", "lattice", "flowing"),
        ("maj7", "chord", "Maj7", "#ffb45c", "soft-orb", "flowing"),
        ("min7", "chord", "Min7", "#7bdff2", "wave", "calm"),
        ("dominant7", "chord", "Dominant7", "#f25f5c", "fracture", "tense"),
        ("dim7", "chord", "Dim7", "#d8f6ff", "fracture", "tense"),
        ("aug", "chord", "Aug", "#ff6bcb", "fracture", "explosive"),
        ("ii-v-i", "progression", "II-V-I", "#b8f2e6", "wave", "flowing"),
        ("i-v-vi-iv", "progression", "I-V-vi-IV", "#ffcf6e", "soft-orb", "flowing"),
    ]

    for element_id, theory_type, name, color, geometry, animation in expected_visuals:
        element = TheoryElement(id=element_id, type=theory_type, name=name)

        assert map_color(element).hex == color
        assert generate_geometry(element).shape == geometry
        assert select_animation_state(element).state == animation


def test_particle_system_reacts_to_energy_complexity_and_unlocks() -> None:
    base_particles = configure_particles(
        density_seed=0.4,
        energy=0.46,
        complexity=0.34,
        unlocked_effects=[],
    )
    unlocked_particles = configure_particles(
        density_seed=0.7,
        energy=0.9,
        complexity=0.86,
        unlocked_effects=["particle_trail", "fracture_burst"],
    )

    assert base_particles.density == 0.49
    assert base_particles.size == 1.88
    assert not base_particles.trail
    assert unlocked_particles.density > base_particles.density
    assert unlocked_particles.trail
    assert unlocked_particles.speed > base_particles.speed


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

    assert visual.color == "#d8f6ff"
    assert visual.secondary_color == "#a6d0ff"
    assert visual.glow > 0.7
    assert visual.particles["density"] > 0.95
    assert visual.particles["trail"] is True
    assert visual.geometry == "fracture"
    assert visual.animation_state == "tense"


def test_renderer_uses_combo_rules_to_amplify_stage_signature() -> None:
    visual = render_visual_parameters(
        elements=[
            TheoryElement(id="lydian", type="mode", name="Lydian"),
            TheoryElement(id="maj7", type="chord", name="Maj7"),
        ],
        unlocked_effects=[],
    )

    assert visual.signature == "Celestial Bloom"
    assert "Celestial Bloom" in visual.active_bonuses
    assert visual.glow > 0.9
    assert visual.beam_strength > 0.5
    assert visual.geometry == "soft-orb"


def test_renderer_applies_metal_style_unlocks_to_visual_parameters() -> None:
    visual = render_visual_parameters(
        elements=[TheoryElement(id="c-maj7", type="chord", name="Maj7")],
        unlocked_effects=["fracture_burst", "ember_strobe"],
    )

    assert visual.geometry == "fracture"
    assert visual.animation_state == "explosive"
    assert visual.signature == "Fracture Burst"
    assert visual.beam_strength > 0.75
    assert visual.secondary_color == "#ff7b3d"


def test_renderer_applies_neo_soul_style_unlocks_to_visual_parameters() -> None:
    visual = render_visual_parameters(
        elements=[TheoryElement(id="c-min7", type="chord", name="Min7")],
        unlocked_effects=["velvet_glow", "silk_motion"],
    )

    assert visual.geometry == "soft-orb"
    assert visual.signature == "Velvet Glow"
    assert visual.glow > 0.8
    assert visual.motion_speed > 0.45
