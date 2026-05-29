from dataclasses import dataclass
from math import floor

from app.schemas.sandbox import VisualParameters
from app.schemas.theory import TheoryElement
from app.visual_engine.animation_controller import select_animation_state
from app.visual_engine.color_mapper import map_color
from app.visual_engine.geometry_generator import generate_geometry
from app.visual_engine.particle_system import configure_particles
from app.visual_engine.profile_library import DEFAULT_MOOD, DEFAULT_PROFILE, MOOD_LIBRARY, PROFILE_LIBRARY
from app.visual_engine.tension_analyzer import analyze_tension


@dataclass
class AggregateVisualState:
    primary_color: str
    secondary_color: str
    background_color: str
    glow: float
    contrast: float
    energy: float
    complexity: float
    temperature: float
    valence: float
    arousal: float
    luminosity: float
    grit: float
    symmetry: float
    depth: float
    pulse_density: float
    motion_speed: float
    ripple_strength: float
    beam_strength: float
    grain: float
    particle_density: float
    orb: float
    wave: float
    fracture: float
    lattice: float
    tension_intensity: float
    tension_level: int
    signature: str
    scene_family: str
    active_bonuses: list[str]


COMBO_RULES: tuple[tuple[set[str], str, dict[str, float | str]], ...] = (
    ({"lydian", "maj7"}, "Celestial Bloom", {"glow": 0.12, "orb": 0.18, "beam_strength": 0.16, "ripple_strength": 0.12, "depth": 0.16, "symmetry": 0.12, "valence": 0.12, "luminosity": 0.18, "arousal": 0.04, "grit": -0.08, "signature": "Celestial Bloom", "secondary_color": "#8fdcff"}),
    ({"lydian", "major"}, "Sunwake Atlas", {"glow": 0.1, "orb": 0.14, "beam_strength": 0.14, "energy": 0.08, "temperature": 0.12, "symmetry": 0.1, "valence": 0.1, "luminosity": 0.16, "arousal": 0.04, "grit": -0.06, "signature": "Sunwake Atlas", "secondary_color": "#bfe6ff"}),
    ({"dorian", "min7"}, "Midnight Current", {"wave": 0.22, "ripple_strength": 0.2, "complexity": 0.12, "depth": 0.1, "pulse_density": 0.08, "valence": 0.04, "luminosity": 0.02, "arousal": 0.06, "grit": 0.04, "signature": "Midnight Current", "secondary_color": "#9af0dd"}),
    ({"dorian", "ii-v-i"}, "Blue Hour Run", {"wave": 0.18, "lattice": 0.14, "ripple_strength": 0.18, "beam_strength": 0.1, "depth": 0.1, "pulse_density": 0.12, "valence": 0.04, "luminosity": 0.06, "arousal": 0.08, "grit": 0.02, "signature": "Blue Hour Run", "secondary_color": "#7fe0c8"}),
    ({"phrygian", "dominant7"}, "Desert Voltage", {"fracture": 0.22, "contrast": 0.14, "beam_strength": 0.18, "energy": 0.1, "pulse_density": 0.14, "temperature": 0.12, "valence": -0.04, "luminosity": 0.02, "arousal": 0.14, "grit": 0.12, "signature": "Desert Voltage", "secondary_color": "#ff9b35"}),
    ({"harmonic minor", "dim7"}, "Occult Fracture", {"fracture": 0.24, "grain": 0.18, "complexity": 0.14, "glow": 0.1, "depth": 0.18, "pulse_density": 0.12, "symmetry": -0.12, "valence": -0.1, "luminosity": -0.08, "arousal": 0.12, "grit": 0.18, "signature": "Occult Fracture", "background_color": "#05060d"}),
    ({"melodic minor", "dominant7"}, "Chrome Meridian", {"wave": 0.16, "fracture": 0.12, "complexity": 0.16, "energy": 0.12, "depth": 0.14, "pulse_density": 0.1, "symmetry": 0.08, "valence": 0.04, "luminosity": 0.08, "arousal": 0.14, "grit": 0.08, "signature": "Chrome Meridian", "secondary_color": "#73f0d5"}),
    ({"ii-v-i", "maj7"}, "Cadence Aurora", {"lattice": 0.2, "ripple_strength": 0.16, "beam_strength": 0.18, "depth": 0.12, "symmetry": 0.14, "valence": 0.1, "luminosity": 0.14, "arousal": 0.06, "grit": -0.04, "signature": "Cadence Aurora", "secondary_color": "#c2b8ff"}),
    ({"i-v-vi-iv", "major"}, "Anthem Lift", {"orb": 0.22, "glow": 0.1, "energy": 0.12, "beam_strength": 0.12, "temperature": 0.1, "pulse_density": 0.12, "valence": 0.12, "luminosity": 0.14, "arousal": 0.1, "grit": -0.04, "signature": "Anthem Lift"}),
    ({"ionian", "i-v-vi-iv"}, "Daybreak Parade", {"orb": 0.18, "glow": 0.12, "beam_strength": 0.14, "ripple_strength": 0.08, "temperature": 0.14, "symmetry": 0.12, "valence": 0.16, "luminosity": 0.18, "arousal": 0.06, "grit": -0.08, "signature": "Daybreak Parade", "secondary_color": "#ffe5a8"}),
    ({"pentatonic", "mixolydian"}, "Roadhouse Neon", {"lattice": 0.18, "beam_strength": 0.2, "contrast": 0.12, "energy": 0.12, "pulse_density": 0.14, "temperature": 0.08, "valence": 0.06, "luminosity": 0.08, "arousal": 0.14, "grit": 0.06, "signature": "Roadhouse Neon"}),
    ({"minor", "pentatonic"}, "Midnight Run", {"wave": 0.16, "contrast": 0.12, "ripple_strength": 0.18, "depth": 0.12, "pulse_density": 0.12, "valence": -0.04, "luminosity": -0.04, "arousal": 0.08, "grit": 0.08, "signature": "Midnight Run", "background_color": "#08111e"}),
    ({"mixolydian", "dominant7"}, "Brass Overdrive", {"lattice": 0.16, "fracture": 0.12, "beam_strength": 0.18, "energy": 0.14, "pulse_density": 0.14, "temperature": 0.14, "valence": 0.04, "luminosity": 0.04, "arousal": 0.16, "grit": 0.1, "signature": "Brass Overdrive", "secondary_color": "#ffc145"}),
    ({"aug", "lydian"}, "Prism Flare", {"fracture": 0.16, "orb": 0.14, "glow": 0.12, "beam_strength": 0.18, "symmetry": 0.08, "depth": 0.1, "valence": 0.08, "luminosity": 0.12, "arousal": 0.16, "grit": 0.08, "signature": "Prism Flare", "secondary_color": "#ff9be8"}),
    ({"lydian", "ii-v-i"}, "Skyline Halo", {"lattice": 0.18, "beam_strength": 0.16, "depth": 0.14, "symmetry": 0.12, "glow": 0.08, "valence": 0.12, "luminosity": 0.16, "arousal": 0.08, "grit": -0.06, "signature": "Skyline Halo", "secondary_color": "#a9d9ff"}),
    ({"phrygian", "dim7"}, "Ashen Rite", {"fracture": 0.22, "grain": 0.2, "contrast": 0.16, "depth": 0.12, "valence": -0.12, "luminosity": -0.08, "arousal": 0.14, "grit": 0.2, "signature": "Ashen Rite", "background_color": "#05040a"}),
    ({"dorian", "maj7"}, "Glass Current", {"wave": 0.18, "orb": 0.1, "glow": 0.12, "ripple_strength": 0.14, "valence": 0.08, "luminosity": 0.12, "arousal": 0.06, "grit": -0.02, "signature": "Glass Current", "secondary_color": "#b3f7ea"}),
    ({"pentatonic", "maj7"}, "Neon Lantern", {"lattice": 0.18, "orb": 0.12, "glow": 0.12, "beam_strength": 0.12, "valence": 0.12, "luminosity": 0.14, "arousal": 0.08, "grit": 0.02, "signature": "Neon Lantern", "secondary_color": "#9cf7ff"}),
    ({"melodic minor", "maj7"}, "Liquid Aurora", {"wave": 0.18, "orb": 0.12, "glow": 0.12, "complexity": 0.14, "valence": 0.08, "luminosity": 0.12, "arousal": 0.1, "grit": 0.02, "signature": "Liquid Aurora", "secondary_color": "#79d8ff"}),
    ({"mixolydian", "ii-v-i"}, "Copper Skyline", {"lattice": 0.18, "beam_strength": 0.18, "energy": 0.12, "contrast": 0.1, "valence": 0.04, "luminosity": 0.06, "arousal": 0.14, "grit": 0.08, "signature": "Copper Skyline", "secondary_color": "#ffbd72"}),
)

STYLE_AURA_RULES: tuple[tuple[set[str], str, dict[str, float | str]], ...] = (
    ({"particle_trail", "neon_glow", "dynamic_ripple"}, "Neon Trail", {"lattice": 0.22, "beam_strength": 0.18, "ripple_strength": 0.18, "contrast": 0.1, "pulse_density": 0.18, "symmetry": 0.08, "valence": 0.04, "luminosity": 0.1, "arousal": 0.14, "grit": 0.04, "background_color": "#061420", "secondary_color": "#59fff5"}),
    ({"harmonic_lattice", "cadence_bloom"}, "Jazz Skyline", {"lattice": 0.26, "wave": 0.12, "beam_strength": 0.16, "ripple_strength": 0.14, "complexity": 0.12, "depth": 0.18, "symmetry": 0.18, "valence": 0.1, "luminosity": 0.14, "arousal": 0.08, "grit": -0.06, "background_color": "#07121a", "secondary_color": "#b8c8ff"}),
    ({"fracture_burst", "ember_strobe"}, "Metal Shrapnel", {"fracture": 0.24, "beam_strength": 0.2, "grain": 0.18, "energy": 0.1, "pulse_density": 0.22, "symmetry": -0.18, "valence": -0.08, "luminosity": -0.02, "arousal": 0.18, "grit": 0.2, "background_color": "#120407", "secondary_color": "#ff7b3d"}),
    ({"velvet_glow", "silk_motion"}, "Velvet Tide", {"orb": 0.18, "wave": 0.16, "glow": 0.14, "ripple_strength": 0.12, "depth": 0.18, "symmetry": 0.14, "pulse_density": -0.06, "valence": 0.12, "luminosity": 0.08, "arousal": -0.02, "grit": -0.12, "background_color": "#170b13", "secondary_color": "#ff9fc9"}),
    ({"prismatic_motion", "phase_rings"}, "Fusion Prism", {"wave": 0.18, "lattice": 0.2, "complexity": 0.16, "ripple_strength": 0.18, "beam_strength": 0.12, "depth": 0.16, "pulse_density": 0.16, "symmetry": 0.12, "valence": 0.08, "luminosity": 0.14, "arousal": 0.14, "grit": 0.02, "background_color": "#08131e", "secondary_color": "#8db8ff"}),
)


def render_visual_parameters(
    elements: list[TheoryElement],
    unlocked_effects: list[str] | None = None,
) -> VisualParameters:
    unlocks = set(unlocked_effects or [])
    aggregate_state = _aggregate_visual_state(elements)
    _apply_combo_bonuses(elements, aggregate_state)
    _apply_unlock_effects(aggregate_state, unlocks)
    particles = configure_particles(
        density_seed=aggregate_state.particle_density,
        energy=aggregate_state.energy,
        complexity=aggregate_state.complexity,
        unlocked_effects=list(unlocks),
    )
    geometry_shape = _resolve_geometry_shape(aggregate_state)
    animation_state = _resolve_animation_state(aggregate_state)
    ring_count = _ring_count_from_state(aggregate_state)

    return VisualParameters(
        color=aggregate_state.primary_color,
        secondary_color=aggregate_state.secondary_color,
        background_color=aggregate_state.background_color,
        glow=round(aggregate_state.glow, 2),
        contrast=round(aggregate_state.contrast, 2),
        energy=round(aggregate_state.energy, 2),
        complexity=round(aggregate_state.complexity, 2),
        temperature=round(aggregate_state.temperature, 2),
        valence=round(aggregate_state.valence, 2),
        arousal=round(aggregate_state.arousal, 2),
        luminosity=round(aggregate_state.luminosity, 2),
        grit=round(aggregate_state.grit, 2),
        symmetry=round(aggregate_state.symmetry, 2),
        depth=round(aggregate_state.depth, 2),
        pulse_density=round(aggregate_state.pulse_density, 2),
        motion_speed=round(aggregate_state.motion_speed, 2),
        ring_count=ring_count,
        ripple_strength=round(aggregate_state.ripple_strength, 2),
        beam_strength=round(aggregate_state.beam_strength, 2),
        grain=round(aggregate_state.grain, 2),
        signature=aggregate_state.signature,
        scene_family=aggregate_state.scene_family,
        active_bonuses=aggregate_state.active_bonuses,
        geometry=geometry_shape,
        animation_state=animation_state,
        particles={
            "density": particles.density,
            "trail": particles.trail,
            "size": particles.size,
            "speed": particles.speed,
            "spread": particles.spread,
        },
    )


def _aggregate_visual_state(elements: list[TheoryElement]) -> AggregateVisualState:
    if not elements:
        base_profile = DEFAULT_PROFILE
        return AggregateVisualState(
            primary_color=base_profile.colors.hex,
            secondary_color=base_profile.colors.secondary_hex,
            background_color=base_profile.colors.background_hex,
            glow=base_profile.glow,
            contrast=base_profile.contrast,
            energy=base_profile.animation.energy,
            complexity=base_profile.complexity,
            temperature=_temperature_from_mood(base_profile.colors.temperature),
            valence=DEFAULT_MOOD.valence,
            arousal=DEFAULT_MOOD.arousal,
            luminosity=DEFAULT_MOOD.luminosity,
            grit=DEFAULT_MOOD.grit,
            symmetry=_resolve_symmetry(
                orb=base_profile.geometry.orb,
                wave=base_profile.geometry.wave,
                fracture=base_profile.geometry.fracture,
                lattice=base_profile.geometry.lattice,
            ),
            depth=_resolve_depth(
                glow=base_profile.glow,
                contrast=base_profile.contrast,
                complexity=base_profile.complexity,
                ripple_strength=base_profile.ripple_strength,
                beam_strength=base_profile.beam_strength,
                luminosity=DEFAULT_MOOD.luminosity,
                valence=DEFAULT_MOOD.valence,
            ),
            pulse_density=_resolve_pulse_density(
                energy=base_profile.animation.energy,
                motion_speed=base_profile.animation.motion_speed,
                ripple_strength=base_profile.ripple_strength,
                tension_intensity=base_profile.tension.intensity,
                arousal=DEFAULT_MOOD.arousal,
                grit=DEFAULT_MOOD.grit,
            ),
            motion_speed=base_profile.animation.motion_speed,
            ripple_strength=base_profile.ripple_strength,
            beam_strength=base_profile.beam_strength,
            grain=base_profile.grain,
            particle_density=base_profile.particle_density,
            orb=base_profile.geometry.orb,
            wave=base_profile.geometry.wave,
            fracture=base_profile.geometry.fracture,
            lattice=base_profile.geometry.lattice,
            tension_intensity=base_profile.tension.intensity,
            tension_level=base_profile.tension.level,
            signature="Default Pulse",
            scene_family="neon-grid",
            active_bonuses=[],
        )

    weighted_profiles: list[tuple[float, TheoryElement]] = []
    total_weight = 0.0

    for index, element in enumerate(elements):
        weight = _element_weight(element, index=index, total=len(elements))
        weighted_profiles.append((weight, element))
        total_weight += weight

    primary_color = _blend_hexes(
        [(map_color(element).hex, weight) for weight, element in weighted_profiles]
    )
    secondary_color = _blend_hexes(
        [(map_color(element).secondary_hex, weight) for weight, element in weighted_profiles]
    )
    background_color = _blend_hexes(
        [(map_color(element).background_hex, weight) for weight, element in weighted_profiles]
    )
    tension_snapshots = [analyze_tension(element) for _, element in weighted_profiles]

    geometry_profiles = [generate_geometry(element) for _, element in weighted_profiles]
    animation_profiles = [select_animation_state(element) for _, element in weighted_profiles]

    orb = sum(profile.orb * weight for profile, (weight, _) in zip(geometry_profiles, weighted_profiles)) / total_weight
    wave = sum(profile.wave * weight for profile, (weight, _) in zip(geometry_profiles, weighted_profiles)) / total_weight
    fracture = sum(profile.fracture * weight for profile, (weight, _) in zip(geometry_profiles, weighted_profiles)) / total_weight
    lattice = sum(profile.lattice * weight for profile, (weight, _) in zip(geometry_profiles, weighted_profiles)) / total_weight
    glow = sum(
        PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).glow * weight for weight, element in weighted_profiles
    ) / total_weight
    contrast = sum(
        PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).contrast * weight for weight, element in weighted_profiles
    ) / total_weight
    complexity = sum(
        PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).complexity * weight for weight, element in weighted_profiles
    ) / total_weight
    ripple_strength = sum(
        PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).ripple_strength * weight for weight, element in weighted_profiles
    ) / total_weight
    beam_strength = sum(
        PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).beam_strength * weight for weight, element in weighted_profiles
    ) / total_weight
    grain = sum(
        PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).grain * weight for weight, element in weighted_profiles
    ) / total_weight
    particle_density = sum(
        PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).particle_density * weight
        for weight, element in weighted_profiles
    ) / total_weight
    energy = sum(profile.energy * weight for profile, (weight, _) in zip(animation_profiles, weighted_profiles)) / total_weight
    motion_speed = sum(
        profile.motion_speed * weight for profile, (weight, _) in zip(animation_profiles, weighted_profiles)
    ) / total_weight
    temperature = sum(
        _temperature_from_mood(map_color(element).temperature) * weight for weight, element in weighted_profiles
    ) / total_weight
    valence = sum(
        MOOD_LIBRARY.get(element.name.lower(), DEFAULT_MOOD).valence * weight for weight, element in weighted_profiles
    ) / total_weight
    arousal = sum(
        MOOD_LIBRARY.get(element.name.lower(), DEFAULT_MOOD).arousal * weight for weight, element in weighted_profiles
    ) / total_weight
    luminosity = sum(
        MOOD_LIBRARY.get(element.name.lower(), DEFAULT_MOOD).luminosity * weight for weight, element in weighted_profiles
    ) / total_weight
    grit = sum(
        MOOD_LIBRARY.get(element.name.lower(), DEFAULT_MOOD).grit * weight for weight, element in weighted_profiles
    ) / total_weight
    tension_intensity = sum(profile.intensity * weight for profile, (weight, _) in zip(tension_snapshots, weighted_profiles)) / total_weight
    tension_level = max(snapshot.level for snapshot in tension_snapshots)

    stack_bonus = max(0.0, len(elements) - 1) * 0.05
    symmetry = _resolve_symmetry(orb=orb, wave=wave, fracture=fracture, lattice=lattice)
    depth = _resolve_depth(
        glow=glow,
        contrast=contrast,
        complexity=complexity,
        ripple_strength=ripple_strength,
        beam_strength=beam_strength,
        luminosity=luminosity,
        valence=valence,
    )
    pulse_density = _resolve_pulse_density(
        energy=energy,
        motion_speed=motion_speed,
        ripple_strength=ripple_strength,
        tension_intensity=tension_intensity,
        arousal=arousal,
        grit=grit,
    )

    return AggregateVisualState(
        primary_color=primary_color,
        secondary_color=secondary_color,
        background_color=background_color,
        glow=min(1.0, glow + stack_bonus * 0.25),
        contrast=min(1.0, contrast + stack_bonus * 0.35),
        energy=min(1.0, energy + stack_bonus * 0.4),
        complexity=min(1.0, complexity + stack_bonus * 0.6),
        temperature=min(1.0, temperature + stack_bonus * 0.18),
        valence=min(1.0, valence + stack_bonus * 0.08),
        arousal=min(1.0, arousal + stack_bonus * 0.16),
        luminosity=min(1.0, luminosity + stack_bonus * 0.1),
        grit=min(1.0, grit + stack_bonus * 0.12),
        symmetry=min(1.0, symmetry + stack_bonus * 0.12),
        depth=min(1.0, depth + stack_bonus * 0.2),
        pulse_density=min(1.0, pulse_density + stack_bonus * 0.22),
        motion_speed=min(1.0, motion_speed + stack_bonus * 0.45),
        ripple_strength=min(1.0, ripple_strength + stack_bonus * 0.3),
        beam_strength=min(1.0, beam_strength + stack_bonus * 0.35),
        grain=min(1.0, grain + stack_bonus * 0.25),
        particle_density=min(0.95, particle_density + stack_bonus * 0.12),
        orb=min(1.0, orb + stack_bonus * 0.18),
        wave=min(1.0, wave + stack_bonus * 0.18),
        fracture=min(1.0, fracture + stack_bonus * 0.18),
        lattice=min(1.0, lattice + stack_bonus * 0.18),
        tension_intensity=tension_intensity,
        tension_level=tension_level,
        signature="Composite Pulse" if len(elements) > 1 else elements[0].name,
        scene_family=_resolve_scene_family(
            signature="Composite Pulse" if len(elements) > 1 else elements[0].name,
            active_bonuses=[],
            geometry_shape=_resolve_geometry_shape_from_weights(orb=orb, wave=wave, fracture=fracture, lattice=lattice),
            temperature=min(1.0, temperature + stack_bonus * 0.18),
            contrast=min(1.0, contrast + stack_bonus * 0.35),
            valence=min(1.0, valence + stack_bonus * 0.08),
            luminosity=min(1.0, luminosity + stack_bonus * 0.1),
            grit=min(1.0, grit + stack_bonus * 0.12),
        ),
        active_bonuses=[],
    )


def _element_weight(element: TheoryElement, index: int, total: int) -> float:
    type_weights = {
        "scale": 0.95,
        "mode": 1.0,
        "chord": 1.18,
        "progression": 1.34,
    }
    positional_lift = 1.0 + (index / max(1, total - 1)) * 0.12 if total > 1 else 1.0
    return type_weights.get(element.type, 1.0) * positional_lift


def _apply_combo_bonuses(elements: list[TheoryElement], state: AggregateVisualState) -> None:
    element_names = {element.name.casefold() for element in elements}

    for required, label, bonus in COMBO_RULES:
        if required <= element_names:
            state.active_bonuses.append(label)
            _apply_state_bonus(state, bonus)

    state.scene_family = _resolve_scene_family(
        signature=state.signature,
        active_bonuses=state.active_bonuses,
        geometry_shape=_resolve_geometry_shape(state),
        temperature=state.temperature,
        contrast=state.contrast,
        valence=state.valence,
        luminosity=state.luminosity,
        grit=state.grit,
    )


def _apply_unlock_effects(state: AggregateVisualState, unlocked_effects: set[str]) -> None:
    if "particle_trail" in unlocked_effects:
        state.particle_density = min(0.99, state.particle_density + 0.14)
        state.complexity = min(1.0, state.complexity + 0.08)
        state.arousal = min(1.0, state.arousal + 0.08)

    if "neon_glow" in unlocked_effects:
        state.glow = min(1.0, state.glow + 0.18)
        state.contrast = min(1.0, state.contrast + 0.12)
        state.secondary_color = "#6efff2"
        state.luminosity = min(1.0, state.luminosity + 0.12)

    if "dynamic_ripple" in unlocked_effects:
        state.ripple_strength = min(1.0, state.ripple_strength + 0.28)
        state.motion_speed = min(1.0, state.motion_speed + 0.12)
        state.energy = min(1.0, state.energy + 0.08)
        state.pulse_density = min(1.0, state.pulse_density + 0.16)
        state.depth = min(1.0, state.depth + 0.08)
        state.arousal = min(1.0, state.arousal + 0.12)

    if "harmonic_lattice" in unlocked_effects:
        state.lattice = max(0.92, min(1.0, state.lattice + 0.34))
        state.orb = min(state.orb, 0.42)
        state.beam_strength = min(1.0, state.beam_strength + 0.24)
        state.complexity = min(1.0, state.complexity + 0.16)
        state.glow = min(1.0, state.glow + 0.06)
        state.symmetry = min(1.0, state.symmetry + 0.18)
        state.depth = min(1.0, state.depth + 0.1)
        state.luminosity = min(1.0, state.luminosity + 0.12)
        state.signature = "Harmonic Lattice"

    if "cadence_bloom" in unlocked_effects:
        state.ripple_strength = min(1.0, state.ripple_strength + 0.18)
        state.orb = max(0.78, min(1.0, state.orb + 0.12))
        state.secondary_color = "#d5c2ff"
        state.depth = min(1.0, state.depth + 0.12)
        state.symmetry = min(1.0, state.symmetry + 0.08)
        state.valence = min(1.0, state.valence + 0.08)

    if "fracture_burst" in unlocked_effects:
        state.fracture = max(0.94, min(1.0, state.fracture + 0.34))
        state.orb = min(state.orb, 0.34)
        state.wave = min(state.wave, 0.44)
        state.beam_strength = min(1.0, state.beam_strength + 0.3)
        state.energy = min(1.0, state.energy + 0.16)
        state.motion_speed = min(1.0, state.motion_speed + 0.18)
        state.contrast = min(1.0, state.contrast + 0.16)
        state.grain = min(1.0, state.grain + 0.12)
        state.pulse_density = min(1.0, state.pulse_density + 0.2)
        state.symmetry = max(0.0, state.symmetry - 0.18)
        state.grit = min(1.0, state.grit + 0.18)
        state.arousal = min(1.0, state.arousal + 0.16)
        state.signature = "Fracture Burst"

    if "ember_strobe" in unlocked_effects:
        state.secondary_color = "#ff7b3d"
        state.grain = min(1.0, state.grain + 0.18)
        state.beam_strength = min(1.0, state.beam_strength + 0.16)
        state.luminosity = min(1.0, state.luminosity + 0.04)

    if "velvet_glow" in unlocked_effects:
        state.glow = min(1.0, state.glow + 0.2)
        state.orb = max(0.94, min(1.0, state.orb + 0.2))
        state.fracture = min(state.fracture, 0.4)
        state.secondary_color = "#ff9fc9"
        state.depth = min(1.0, state.depth + 0.16)
        state.symmetry = min(1.0, state.symmetry + 0.14)
        state.valence = min(1.0, state.valence + 0.12)
        state.grit = max(0.0, state.grit - 0.08)
        state.signature = "Velvet Glow"

    if "silk_motion" in unlocked_effects:
        state.motion_speed = min(1.0, state.motion_speed + 0.1)
        state.ripple_strength = min(1.0, state.ripple_strength + 0.14)
        state.beam_strength = min(1.0, state.beam_strength + 0.12)
        state.wave = max(0.74, state.wave)
        state.pulse_density = max(0.0, state.pulse_density - 0.04)
        state.arousal = max(0.0, state.arousal - 0.04)

    if "prismatic_motion" in unlocked_effects:
        state.secondary_color = "#8db8ff"
        state.complexity = min(1.0, state.complexity + 0.18)
        state.energy = min(1.0, state.energy + 0.12)
        state.lattice = max(0.72, state.lattice)
        state.wave = max(0.68, state.wave)
        state.depth = min(1.0, state.depth + 0.12)
        state.symmetry = min(1.0, state.symmetry + 0.1)
        state.luminosity = min(1.0, state.luminosity + 0.12)
        state.arousal = min(1.0, state.arousal + 0.1)
        state.signature = "Prismatic Motion"

    if "phase_rings" in unlocked_effects:
        state.ripple_strength = max(0.92, min(1.0, state.ripple_strength + 0.22))
        state.beam_strength = min(1.0, state.beam_strength + 0.14)
        state.glow = min(1.0, state.glow + 0.08)
        state.pulse_density = min(1.0, state.pulse_density + 0.16)
        state.grit = max(0.0, state.grit - 0.02)

    _apply_style_auras(state, unlocked_effects)


def _apply_style_auras(state: AggregateVisualState, unlocked_effects: set[str]) -> None:
    has_signature_bonus = bool(state.active_bonuses)

    for required, label, bonus in STYLE_AURA_RULES:
        if required <= unlocked_effects:
            state.active_bonuses.append(label)
            _apply_state_bonus(state, bonus)
            if not has_signature_bonus:
                state.signature = label

    state.scene_family = _resolve_scene_family(
        signature=state.signature,
        active_bonuses=state.active_bonuses,
        geometry_shape=_resolve_geometry_shape(state),
        temperature=state.temperature,
        contrast=state.contrast,
        valence=state.valence,
        luminosity=state.luminosity,
        grit=state.grit,
    )


def _resolve_geometry_shape(state: AggregateVisualState) -> str:
    return _resolve_geometry_shape_from_weights(
        orb=state.orb,
        wave=state.wave,
        fracture=state.fracture,
        lattice=state.lattice,
    )


def _resolve_geometry_shape_from_weights(*, orb: float, wave: float, fracture: float, lattice: float) -> str:
    weights = {
        "soft-orb": orb,
        "wave": wave,
        "fracture": fracture,
        "lattice": lattice,
    }
    return max(weights.items(), key=lambda item: item[1])[0]


def _resolve_animation_state(state: AggregateVisualState) -> str:
    if (
        state.energy > 0.86
        or (state.fracture > 0.78 and state.motion_speed > 0.78)
        or (state.fracture > 0.88 and state.beam_strength > 0.72 and state.energy > 0.72)
    ):
        return "explosive"

    if state.tension_intensity > 0.7 or state.contrast > 0.74:
        return "tense"

    if state.energy < 0.48 and state.wave > 0.56 and state.glow < 0.68:
        return "calm"

    return "flowing"


def _ring_count_from_state(state: AggregateVisualState) -> int:
    return max(2, min(8, floor(2 + state.ripple_strength * 3 + state.complexity * 2)))


def _apply_state_bonus(state: AggregateVisualState, bonus: dict[str, float | str]) -> None:
    for key, value in bonus.items():
        if key.endswith("_color") or key == "signature":
            setattr(state, key, value)
            continue

        current_value = getattr(state, key)
        setattr(state, key, max(0.0, min(1.0, current_value + float(value))))


def _temperature_from_mood(mood: str) -> float:
    return {
        "warm": 0.82,
        "cool": 0.28,
        "dark": 0.46,
    }.get(mood, 0.5)


def _resolve_symmetry(*, orb: float, wave: float, fracture: float, lattice: float) -> float:
    return max(0.0, min(1.0, orb * 0.36 + wave * 0.18 + lattice * 0.42 + (1.0 - fracture) * 0.22))


def _resolve_depth(
    *,
    glow: float,
    contrast: float,
    complexity: float,
    ripple_strength: float,
    beam_strength: float,
    luminosity: float = 0.5,
    valence: float = 0.5,
) -> float:
    return max(
        0.0,
        min(
            1.0,
            0.12
            + glow * 0.18
            + contrast * 0.08
            + complexity * 0.22
            + ripple_strength * 0.16
            + beam_strength * 0.14
            + luminosity * 0.12
            + valence * 0.08,
        ),
    )


def _resolve_pulse_density(
    *,
    energy: float,
    motion_speed: float,
    ripple_strength: float,
    tension_intensity: float,
    arousal: float = 0.5,
    grit: float = 0.3,
) -> float:
    return max(
        0.0,
        min(
            1.0,
            0.1
            + energy * 0.28
            + motion_speed * 0.14
            + ripple_strength * 0.1
            + tension_intensity * 0.2
            + arousal * 0.16
            + grit * 0.12,
        ),
    )


def _resolve_scene_family(
    *,
    signature: str,
    active_bonuses: list[str],
    geometry_shape: str,
    temperature: float,
    contrast: float,
    valence: float,
    luminosity: float,
    grit: float,
) -> str:
    text = " ".join([signature, *active_bonuses])

    if _contains_any(text, ["Velvet", "Silk", "Tide"]):
        return "velvet-chamber"

    if _contains_any(text, ["Metal", "Shrapnel", "Fracture", "Voltage"]):
        return "metal-foundry" if "Occult" not in text else "shadow-sanctum"

    if _contains_any(text, ["Jazz", "Aurora", "Cadence", "Lattice", "Skyline"]):
        return "jazz-cathedral"

    if _contains_any(text, ["Prism", "Chrome", "Fusion", "Flare", "Meridian"]):
        return "prism-array"

    if _contains_any(text, ["Neon", "Roadhouse"]):
        return "neon-grid"

    if _contains_any(text, ["Celestial", "Sunwake", "Daybreak", "Anthem"]):
        return "solar-garden"

    if _contains_any(text, ["Midnight", "Blue Hour", "Current", "Run"]):
        return "nocturne-tide"

    if geometry_shape == "fracture" and contrast > 0.72:
        return "metal-foundry"

    if geometry_shape == "lattice":
        return "jazz-cathedral" if temperature < 0.45 else "neon-grid"

    if geometry_shape == "wave":
        return "nocturne-tide"

    if grit > 0.68 and valence < 0.28:
        return "shadow-sanctum"

    if luminosity > 0.72 and valence > 0.7:
        return "solar-garden"

    return "solar-garden" if temperature >= 0.62 else "velvet-chamber"


def _contains_any(source: str, needles: list[str]) -> bool:
    return any(needle in source for needle in needles)


def _blend_hexes(weighted_hexes: list[tuple[str, float]]) -> str:
    weighted_red = 0.0
    weighted_green = 0.0
    weighted_blue = 0.0
    total_weight = 0.0

    for hex_code, weight in weighted_hexes:
        red, green, blue = _hex_to_rgb(hex_code)
        weighted_red += red * weight
        weighted_green += green * weight
        weighted_blue += blue * weight
        total_weight += weight

    return _rgb_to_hex(
        int(round(weighted_red / total_weight)),
        int(round(weighted_green / total_weight)),
        int(round(weighted_blue / total_weight)),
    )


def _hex_to_rgb(hex_code: str) -> tuple[int, int, int]:
    stripped = hex_code.removeprefix("#")
    return int(stripped[0:2], 16), int(stripped[2:4], 16), int(stripped[4:6], 16)


def _rgb_to_hex(red: int, green: int, blue: int) -> str:
    return f"#{red:02x}{green:02x}{blue:02x}"
