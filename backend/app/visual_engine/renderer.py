from dataclasses import dataclass
from math import floor

from app.schemas.sandbox import VisualParameters
from app.schemas.theory import TheoryElement
from app.visual_engine.animation_controller import select_animation_state
from app.visual_engine.color_mapper import map_color
from app.visual_engine.geometry_generator import generate_geometry
from app.visual_engine.particle_system import configure_particles
from app.visual_engine.profile_library import DEFAULT_PROFILE, PROFILE_LIBRARY
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
    active_bonuses: list[str]


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
        motion_speed=round(aggregate_state.motion_speed, 2),
        ring_count=ring_count,
        ripple_strength=round(aggregate_state.ripple_strength, 2),
        beam_strength=round(aggregate_state.beam_strength, 2),
        grain=round(aggregate_state.grain, 2),
        signature=aggregate_state.signature,
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
    tension_intensity = sum(profile.intensity * weight for profile, (weight, _) in zip(tension_snapshots, weighted_profiles)) / total_weight
    tension_level = max(snapshot.level for snapshot in tension_snapshots)

    stack_bonus = max(0.0, len(elements) - 1) * 0.05

    return AggregateVisualState(
        primary_color=primary_color,
        secondary_color=secondary_color,
        background_color=background_color,
        glow=min(1.0, glow + stack_bonus * 0.25),
        contrast=min(1.0, contrast + stack_bonus * 0.35),
        energy=min(1.0, energy + stack_bonus * 0.4),
        complexity=min(1.0, complexity + stack_bonus * 0.6),
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

    combo_rules = (
        ({"lydian", "maj7"}, "Celestial Bloom", {"glow": 0.12, "orb": 0.18, "beam_strength": 0.16, "ripple_strength": 0.12, "signature": "Celestial Bloom", "secondary_color": "#8fdcff"}),
        ({"dorian", "min7"}, "Midnight Current", {"wave": 0.22, "ripple_strength": 0.2, "complexity": 0.12, "signature": "Midnight Current", "secondary_color": "#9af0dd"}),
        ({"phrygian", "dominant7"}, "Desert Voltage", {"fracture": 0.22, "contrast": 0.14, "beam_strength": 0.18, "energy": 0.1, "signature": "Desert Voltage", "secondary_color": "#ff9b35"}),
        ({"harmonic minor", "dim7"}, "Occult Fracture", {"fracture": 0.24, "grain": 0.18, "complexity": 0.14, "glow": 0.1, "signature": "Occult Fracture", "background_color": "#05060d"}),
        ({"ii-v-i", "maj7"}, "Cadence Aurora", {"lattice": 0.2, "ripple_strength": 0.16, "beam_strength": 0.18, "signature": "Cadence Aurora", "secondary_color": "#c2b8ff"}),
        ({"i-v-vi-iv", "major"}, "Anthem Lift", {"orb": 0.22, "glow": 0.1, "energy": 0.12, "beam_strength": 0.12, "signature": "Anthem Lift"}),
        ({"pentatonic", "mixolydian"}, "Roadhouse Neon", {"lattice": 0.18, "beam_strength": 0.2, "contrast": 0.12, "energy": 0.12, "signature": "Roadhouse Neon"}),
    )

    for required, label, bonus in combo_rules:
        if required <= element_names:
            state.active_bonuses.append(label)
            _apply_state_bonus(state, bonus)


def _apply_unlock_effects(state: AggregateVisualState, unlocked_effects: set[str]) -> None:
    if "particle_trail" in unlocked_effects:
        state.particle_density = min(0.99, state.particle_density + 0.14)
        state.complexity = min(1.0, state.complexity + 0.08)

    if "neon_glow" in unlocked_effects:
        state.glow = min(1.0, state.glow + 0.18)
        state.contrast = min(1.0, state.contrast + 0.12)
        state.secondary_color = "#6efff2"

    if "dynamic_ripple" in unlocked_effects:
        state.ripple_strength = min(1.0, state.ripple_strength + 0.28)
        state.motion_speed = min(1.0, state.motion_speed + 0.12)
        state.energy = min(1.0, state.energy + 0.08)

    if "harmonic_lattice" in unlocked_effects:
        state.lattice = max(0.92, min(1.0, state.lattice + 0.34))
        state.orb = min(state.orb, 0.42)
        state.beam_strength = min(1.0, state.beam_strength + 0.24)
        state.complexity = min(1.0, state.complexity + 0.16)
        state.glow = min(1.0, state.glow + 0.06)
        state.signature = "Harmonic Lattice"

    if "cadence_bloom" in unlocked_effects:
        state.ripple_strength = min(1.0, state.ripple_strength + 0.18)
        state.orb = max(0.78, min(1.0, state.orb + 0.12))
        state.secondary_color = "#d5c2ff"

    if "fracture_burst" in unlocked_effects:
        state.fracture = max(0.94, min(1.0, state.fracture + 0.34))
        state.orb = min(state.orb, 0.34)
        state.wave = min(state.wave, 0.44)
        state.beam_strength = min(1.0, state.beam_strength + 0.3)
        state.energy = min(1.0, state.energy + 0.16)
        state.motion_speed = min(1.0, state.motion_speed + 0.18)
        state.contrast = min(1.0, state.contrast + 0.16)
        state.grain = min(1.0, state.grain + 0.12)
        state.signature = "Fracture Burst"

    if "ember_strobe" in unlocked_effects:
        state.secondary_color = "#ff7b3d"
        state.grain = min(1.0, state.grain + 0.18)
        state.beam_strength = min(1.0, state.beam_strength + 0.16)

    if "velvet_glow" in unlocked_effects:
        state.glow = min(1.0, state.glow + 0.2)
        state.orb = max(0.94, min(1.0, state.orb + 0.2))
        state.fracture = min(state.fracture, 0.4)
        state.secondary_color = "#ff9fc9"
        state.signature = "Velvet Glow"

    if "silk_motion" in unlocked_effects:
        state.motion_speed = min(1.0, state.motion_speed + 0.1)
        state.ripple_strength = min(1.0, state.ripple_strength + 0.14)
        state.beam_strength = min(1.0, state.beam_strength + 0.12)
        state.wave = max(0.74, state.wave)

    if "prismatic_motion" in unlocked_effects:
        state.secondary_color = "#8db8ff"
        state.complexity = min(1.0, state.complexity + 0.18)
        state.energy = min(1.0, state.energy + 0.12)
        state.lattice = max(0.72, state.lattice)
        state.wave = max(0.68, state.wave)
        state.signature = "Prismatic Motion"

    if "phase_rings" in unlocked_effects:
        state.ripple_strength = max(0.92, min(1.0, state.ripple_strength + 0.22))
        state.beam_strength = min(1.0, state.beam_strength + 0.14)
        state.glow = min(1.0, state.glow + 0.08)


def _resolve_geometry_shape(state: AggregateVisualState) -> str:
    weights = {
        "soft-orb": state.orb,
        "wave": state.wave,
        "fracture": state.fracture,
        "lattice": state.lattice,
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
        setattr(state, key, min(1.0, current_value + float(value)))


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
