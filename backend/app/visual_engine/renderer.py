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
    openness: float
    attack: float
    swing: float
    gravity: float
    synergy_resonance: float
    cadence_pull: float
    modal_tension: float
    blend_cohesion: float
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
    growth_imprint: str
    growth_imprint_intensity: float
    phrase_trajectory: str
    phrase_trajectory_intensity: float
    phrase_hooks: list[str]
    phrase_hook_energy: float
    phrase_variation: str
    phrase_variation_intensity: float
    voiceprints: list[str]
    voiceprint_intensity: float
    scene_cascade: str
    scene_cascade_intensity: float
    active_bonuses: list[str]
    active_synergies: list[str]


@dataclass(frozen=True)
class TheoryTraitProfile:
    openness: float
    attack: float
    swing: float
    gravity: float


TRAIT_LIBRARY: dict[str, TheoryTraitProfile] = {
    "major": TheoryTraitProfile(openness=0.78, attack=0.24, swing=0.36, gravity=0.54),
    "minor": TheoryTraitProfile(openness=0.42, attack=0.38, swing=0.4, gravity=0.52),
    "pentatonic": TheoryTraitProfile(openness=0.64, attack=0.46, swing=0.58, gravity=0.36),
    "harmonic minor": TheoryTraitProfile(openness=0.18, attack=0.8, swing=0.24, gravity=0.76),
    "melodic minor": TheoryTraitProfile(openness=0.52, attack=0.62, swing=0.56, gravity=0.58),
    "ionian": TheoryTraitProfile(openness=0.8, attack=0.22, swing=0.3, gravity=0.5),
    "dorian": TheoryTraitProfile(openness=0.58, attack=0.34, swing=0.72, gravity=0.4),
    "phrygian": TheoryTraitProfile(openness=0.22, attack=0.68, swing=0.28, gravity=0.72),
    "lydian": TheoryTraitProfile(openness=0.92, attack=0.26, swing=0.38, gravity=0.22),
    "mixolydian": TheoryTraitProfile(openness=0.54, attack=0.56, swing=0.78, gravity=0.42),
    "maj7": TheoryTraitProfile(openness=0.88, attack=0.18, swing=0.34, gravity=0.28),
    "min7": TheoryTraitProfile(openness=0.62, attack=0.24, swing=0.56, gravity=0.36),
    "dominant7": TheoryTraitProfile(openness=0.34, attack=0.76, swing=0.52, gravity=0.8),
    "dim7": TheoryTraitProfile(openness=0.12, attack=0.92, swing=0.18, gravity=0.82),
    "aug": TheoryTraitProfile(openness=0.44, attack=0.88, swing=0.48, gravity=0.62),
    "ii-v-i": TheoryTraitProfile(openness=0.56, attack=0.42, swing=0.66, gravity=0.94),
    "i-v-vi-iv": TheoryTraitProfile(openness=0.68, attack=0.28, swing=0.54, gravity=0.58),
}


COMBO_RULES: tuple[tuple[set[str], str, dict[str, float | str]], ...] = (
    ({"lydian", "maj7"}, "Celestial Bloom", {"glow": 0.12, "orb": 0.18, "beam_strength": 0.16, "ripple_strength": 0.12, "depth": 0.16, "symmetry": 0.12, "valence": 0.12, "luminosity": 0.18, "arousal": 0.04, "grit": -0.08, "openness": 0.18, "gravity": -0.12, "signature": "Celestial Bloom", "secondary_color": "#8fdcff"}),
    ({"lydian", "major"}, "Sunwake Atlas", {"glow": 0.1, "orb": 0.14, "beam_strength": 0.14, "energy": 0.08, "temperature": 0.12, "symmetry": 0.1, "valence": 0.1, "luminosity": 0.16, "arousal": 0.04, "grit": -0.06, "signature": "Sunwake Atlas", "secondary_color": "#bfe6ff"}),
    ({"dorian", "min7"}, "Midnight Current", {"wave": 0.22, "ripple_strength": 0.2, "complexity": 0.12, "depth": 0.1, "pulse_density": 0.08, "valence": 0.04, "luminosity": 0.02, "arousal": 0.06, "grit": 0.04, "signature": "Midnight Current", "secondary_color": "#9af0dd"}),
    ({"dorian", "ii-v-i"}, "Blue Hour Run", {"wave": 0.18, "lattice": 0.14, "ripple_strength": 0.18, "beam_strength": 0.1, "depth": 0.1, "pulse_density": 0.12, "valence": 0.04, "luminosity": 0.06, "arousal": 0.08, "grit": 0.02, "swing": 0.18, "gravity": 0.08, "signature": "Blue Hour Run", "secondary_color": "#7fe0c8"}),
    ({"phrygian", "dominant7"}, "Desert Voltage", {"fracture": 0.22, "contrast": 0.14, "beam_strength": 0.18, "energy": 0.1, "pulse_density": 0.14, "temperature": 0.12, "valence": -0.04, "luminosity": 0.02, "arousal": 0.14, "grit": 0.12, "signature": "Desert Voltage", "secondary_color": "#ff9b35"}),
    ({"harmonic minor", "dim7"}, "Occult Fracture", {"fracture": 0.24, "grain": 0.18, "complexity": 0.14, "glow": 0.1, "depth": 0.18, "pulse_density": 0.12, "symmetry": -0.12, "valence": -0.1, "luminosity": -0.08, "arousal": 0.12, "grit": 0.18, "attack": 0.12, "gravity": 0.14, "openness": -0.12, "swing": -0.08, "signature": "Occult Fracture", "background_color": "#05060d"}),
    ({"melodic minor", "dominant7"}, "Chrome Meridian", {"wave": 0.16, "fracture": 0.12, "complexity": 0.16, "energy": 0.12, "depth": 0.14, "pulse_density": 0.1, "symmetry": 0.08, "valence": 0.04, "luminosity": 0.08, "arousal": 0.14, "grit": 0.08, "attack": 0.1, "swing": 0.14, "blend_cohesion": 0.06, "signature": "Chrome Meridian", "secondary_color": "#73f0d5"}),
    ({"ii-v-i", "maj7"}, "Cadence Aurora", {"lattice": 0.2, "ripple_strength": 0.16, "beam_strength": 0.18, "depth": 0.12, "symmetry": 0.14, "valence": 0.1, "luminosity": 0.14, "arousal": 0.06, "grit": -0.04, "gravity": 0.18, "openness": 0.08, "signature": "Cadence Aurora", "secondary_color": "#c2b8ff"}),
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
    ({"lydian", "maj7", "ii-v-i"}, "Aurora Choir", {"orb": 0.12, "lattice": 0.16, "glow": 0.14, "beam_strength": 0.22, "ripple_strength": 0.14, "depth": 0.18, "symmetry": 0.18, "valence": 0.12, "luminosity": 0.16, "arousal": 0.08, "grit": -0.08, "openness": 0.12, "cadence_pull": 0.14, "blend_cohesion": 0.08, "signature": "Aurora Choir", "secondary_color": "#d7d0ff"}),
    ({"dorian", "min7", "ii-v-i"}, "Blue Velvet Arcade", {"wave": 0.2, "lattice": 0.14, "glow": 0.08, "ripple_strength": 0.18, "beam_strength": 0.16, "depth": 0.18, "symmetry": 0.08, "valence": 0.06, "luminosity": 0.08, "arousal": 0.1, "grit": 0.02, "swing": 0.16, "gravity": 0.12, "cadence_pull": 0.08, "blend_cohesion": 0.12, "signature": "Blue Velvet Arcade", "secondary_color": "#9cefe2"}),
    ({"harmonic minor", "dim7", "dominant7"}, "Ritual Crucible", {"fracture": 0.24, "grain": 0.22, "contrast": 0.18, "glow": 0.08, "depth": 0.18, "pulse_density": 0.16, "symmetry": -0.18, "valence": -0.12, "luminosity": -0.1, "arousal": 0.16, "grit": 0.2, "attack": 0.16, "gravity": 0.18, "modal_tension": 0.14, "signature": "Ritual Crucible", "background_color": "#04040b"}),
    ({"melodic minor", "dominant7", "aug"}, "Prism Engine", {"wave": 0.14, "fracture": 0.14, "lattice": 0.18, "complexity": 0.2, "energy": 0.16, "depth": 0.18, "pulse_density": 0.16, "symmetry": 0.12, "valence": 0.08, "luminosity": 0.12, "arousal": 0.16, "grit": 0.08, "attack": 0.12, "swing": 0.14, "beam_strength": 0.18, "blend_cohesion": 0.12, "signature": "Prism Engine", "secondary_color": "#80dfff"}),
    ({"pentatonic", "mixolydian", "dominant7"}, "Voltage Causeway", {"lattice": 0.18, "fracture": 0.12, "beam_strength": 0.22, "contrast": 0.14, "energy": 0.18, "pulse_density": 0.18, "motion_speed": 0.12, "temperature": 0.1, "valence": 0.06, "luminosity": 0.08, "arousal": 0.18, "grit": 0.1, "swing": 0.14, "attack": 0.08, "signature": "Voltage Causeway", "secondary_color": "#ffd06b"}),
)

STYLE_AURA_RULES: tuple[tuple[set[str], str, dict[str, float | str]], ...] = (
    ({"particle_trail", "neon_glow", "dynamic_ripple"}, "Neon Trail", {"lattice": 0.22, "beam_strength": 0.18, "ripple_strength": 0.18, "contrast": 0.1, "pulse_density": 0.18, "symmetry": 0.08, "valence": 0.04, "luminosity": 0.1, "arousal": 0.14, "grit": 0.04, "background_color": "#061420", "secondary_color": "#59fff5"}),
    ({"harmonic_lattice", "cadence_bloom"}, "Jazz Skyline", {"lattice": 0.26, "wave": 0.12, "beam_strength": 0.16, "ripple_strength": 0.14, "complexity": 0.12, "depth": 0.18, "symmetry": 0.18, "valence": 0.1, "luminosity": 0.14, "arousal": 0.08, "grit": -0.06, "background_color": "#07121a", "secondary_color": "#b8c8ff"}),
    ({"fracture_burst", "ember_strobe"}, "Metal Shrapnel", {"fracture": 0.24, "beam_strength": 0.2, "grain": 0.18, "energy": 0.1, "pulse_density": 0.22, "symmetry": -0.18, "valence": -0.08, "luminosity": -0.02, "arousal": 0.18, "grit": 0.2, "background_color": "#120407", "secondary_color": "#ff7b3d"}),
    ({"velvet_glow", "silk_motion"}, "Velvet Tide", {"orb": 0.18, "wave": 0.16, "glow": 0.14, "ripple_strength": 0.12, "depth": 0.18, "symmetry": 0.14, "pulse_density": -0.06, "valence": 0.12, "luminosity": 0.08, "arousal": -0.02, "grit": -0.12, "background_color": "#170b13", "secondary_color": "#ff9fc9"}),
    ({"prismatic_motion", "phase_rings"}, "Fusion Prism", {"wave": 0.18, "lattice": 0.2, "complexity": 0.16, "ripple_strength": 0.18, "beam_strength": 0.12, "depth": 0.16, "pulse_density": 0.16, "symmetry": 0.12, "valence": 0.08, "luminosity": 0.14, "arousal": 0.14, "grit": 0.02, "background_color": "#08131e", "secondary_color": "#8db8ff"}),
)

GROWTH_IMPRINT_RULES: dict[str, dict[str, set[str]]] = {
    "pentatonic-drive": {
        "effects": {"particle_trail", "neon_glow", "dynamic_ripple"},
        "elements": {"pentatonic", "mixolydian", "minor", "major", "i-v-vi-iv"},
        "bonus_keywords": {"Neon", "Roadhouse", "Lantern", "Run"},
    },
    "jazz-lattice": {
        "effects": {"harmonic_lattice", "cadence_bloom"},
        "elements": {"ii-v-i", "dorian", "maj7", "min7", "ionian", "lydian"},
        "bonus_keywords": {"Jazz", "Cadence", "Aurora", "Lattice", "Skyline", "Blue Hour"},
    },
    "metal-forge": {
        "effects": {"fracture_burst", "ember_strobe"},
        "elements": {"harmonic minor", "dim7", "phrygian", "dominant7", "aug"},
        "bonus_keywords": {"Metal", "Fracture", "Voltage", "Shrapnel", "Ashen", "Occult"},
    },
    "neo-soul-veil": {
        "effects": {"velvet_glow", "silk_motion"},
        "elements": {"maj7", "min7", "dorian", "major", "ii-v-i"},
        "bonus_keywords": {"Velvet", "Silk", "Glass", "Current", "Tide"},
    },
    "fusion-phase": {
        "effects": {"prismatic_motion", "phase_rings"},
        "elements": {"melodic minor", "dominant7", "lydian", "mixolydian", "aug"},
        "bonus_keywords": {"Prism", "Chrome", "Meridian", "Fusion", "Liquid"},
    },
}

SCENE_CASCADE_RULES: tuple[tuple[set[str], str, float, dict[str, float]], ...] = (
    ({"lydian", "maj7", "ii-v-i"}, "aurora-dais", 0.98, {"depth": 0.18, "beam_strength": 0.18, "symmetry": 0.16, "glow": 0.12, "luminosity": 0.14, "openness": 0.1, "blend_cohesion": 0.12}),
    ({"dorian", "min7", "ii-v-i"}, "velvet-arcade", 0.92, {"depth": 0.16, "ripple_strength": 0.18, "beam_strength": 0.12, "wave": 0.14, "swing": 0.14, "blend_cohesion": 0.14, "gravity": 0.08}),
    ({"harmonic minor", "dim7", "dominant7"}, "eclipse-altar", 0.96, {"fracture": 0.16, "contrast": 0.16, "grain": 0.18, "depth": 0.16, "modal_tension": 0.14, "gravity": 0.12, "grit": 0.14}),
    ({"melodic minor", "dominant7", "aug"}, "prism-vortex", 0.94, {"wave": 0.12, "lattice": 0.16, "complexity": 0.16, "depth": 0.16, "beam_strength": 0.14, "motion_speed": 0.12, "blend_cohesion": 0.12}),
    ({"pentatonic", "mixolydian", "dominant7"}, "tide-runway", 0.9, {"wave": 0.12, "lattice": 0.14, "energy": 0.14, "ripple_strength": 0.16, "pulse_density": 0.14, "motion_speed": 0.12, "swing": 0.12}),
)

GROWTH_CASCADE_RULES: tuple[tuple[str, str, str, float, dict[str, float]], ...] = (
    ("aurora-dais", "jazz-lattice", "Choir Vault", 0.08, {"lattice": 0.12, "symmetry": 0.12, "beam_strength": 0.14, "depth": 0.12, "blend_cohesion": 0.1}),
    ("aurora-dais", "neo-soul-veil", "Silken Halo", 0.06, {"orb": 0.12, "wave": 0.1, "glow": 0.12, "depth": 0.1, "valence": 0.08, "grit": -0.06}),
    ("velvet-arcade", "neo-soul-veil", "Rose Arcade", 0.08, {"wave": 0.12, "glow": 0.12, "depth": 0.12, "blend_cohesion": 0.1, "symmetry": 0.08}),
    ("velvet-arcade", "jazz-lattice", "Blue Cloister", 0.06, {"lattice": 0.1, "beam_strength": 0.08, "depth": 0.1, "symmetry": 0.1}),
    ("eclipse-altar", "metal-forge", "Forge Throne", 0.08, {"fracture": 0.12, "grain": 0.12, "contrast": 0.12, "attack": 0.12, "gravity": 0.1}),
    ("prism-vortex", "fusion-phase", "Phase Cloister", 0.08, {"lattice": 0.12, "wave": 0.1, "complexity": 0.12, "motion_speed": 0.12, "beam_strength": 0.1}),
    ("tide-runway", "pentatonic-drive", "Neon Causeway", 0.08, {"beam_strength": 0.12, "energy": 0.12, "pulse_density": 0.12, "motion_speed": 0.12, "swing": 0.1}),
)

PHRASE_HOOK_RULES: tuple[tuple[tuple[str, str], str, dict[str, float]], ...] = (
    (("lydian", "maj7"), "Skyline Rise", {"beam_strength": 0.08, "glow": 0.06, "openness": 0.08, "symmetry": 0.06}),
    (("maj7", "ii-v-i"), "Cadence Sweep", {"beam_strength": 0.08, "cadence_pull": 0.1, "gravity": 0.06, "depth": 0.06}),
    (("dorian", "min7"), "Velvet Link", {"wave": 0.1, "ripple_strength": 0.08, "swing": 0.1, "blend_cohesion": 0.08}),
    (("pentatonic", "mixolydian"), "Runway Spark", {"motion_speed": 0.1, "energy": 0.08, "beam_strength": 0.08, "pulse_density": 0.08}),
    (("dominant7", "harmonic minor"), "Collapse Gate", {"fracture": 0.1, "modal_tension": 0.1, "gravity": 0.08, "contrast": 0.06}),
    (("harmonic minor", "dim7"), "Ritual Notch", {"grain": 0.1, "contrast": 0.08, "depth": 0.08, "grit": 0.08}),
    (("melodic minor", "aug"), "Prism Ladder", {"lattice": 0.1, "complexity": 0.08, "attack": 0.08, "motion_speed": 0.06}),
)

PHRASE_VARIATION_RULES: tuple[tuple[str, str, str, float, dict[str, float]], ...] = (
    ("jazz-lattice", "lift-arc", "Choir Step", 0.82, {"beam_strength": 0.1, "symmetry": 0.1, "depth": 0.08, "blend_cohesion": 0.08}),
    ("neo-soul-veil", "velvet-drift", "Silk Orbit", 0.8, {"wave": 0.1, "glow": 0.1, "depth": 0.08, "grit": -0.06}),
    ("metal-forge", "forge-drop", "Hammer Fall", 0.84, {"fracture": 0.1, "attack": 0.1, "gravity": 0.08, "contrast": 0.08}),
    ("metal-forge", "shadow-sink", "Hammer Fall", 0.78, {"fracture": 0.08, "grain": 0.1, "gravity": 0.1, "depth": 0.08}),
    ("fusion-phase", "prism-climb", "Phase Spiral", 0.82, {"lattice": 0.1, "motion_speed": 0.08, "complexity": 0.1, "beam_strength": 0.08}),
    ("pentatonic-drive", "runway-drive", "Spark Chase", 0.8, {"energy": 0.1, "motion_speed": 0.1, "pulse_density": 0.1, "beam_strength": 0.08}),
)

VOICEPRINT_RULES: dict[str, tuple[str, dict[str, float]]] = {
    "major": ("Sun Ribbon", {"glow": 0.02, "luminosity": 0.02}),
    "minor": ("Night Ribbon", {"depth": 0.02, "grit": 0.02}),
    "pentatonic": ("Neon Ticks", {"pulse_density": 0.03, "motion_speed": 0.02}),
    "harmonic minor": ("Altar Teeth", {"grain": 0.03, "modal_tension": 0.03}),
    "melodic minor": ("Chrome Flow", {"complexity": 0.03, "blend_cohesion": 0.02}),
    "ionian": ("Day Arch", {"symmetry": 0.02, "valence": 0.02}),
    "dorian": ("Tide Braid", {"swing": 0.03, "ripple_strength": 0.02}),
    "phrygian": ("Ember Veil", {"contrast": 0.02, "attack": 0.03}),
    "lydian": ("Sky Fan", {"openness": 0.03, "beam_strength": 0.02}),
    "mixolydian": ("Brass Rails", {"energy": 0.02, "attack": 0.02}),
    "maj7": ("Velvet Halo", {"glow": 0.03, "depth": 0.02}),
    "min7": ("Dusk Orbit", {"wave": 0.03, "blend_cohesion": 0.02}),
    "dominant7": ("Voltage Spear", {"beam_strength": 0.03, "gravity": 0.03}),
    "dim7": ("Fracture Crown", {"fracture": 0.03, "grain": 0.02}),
    "aug": ("Prism Spike", {"complexity": 0.03, "attack": 0.02}),
    "ii-v-i": ("Cadence Stairs", {"cadence_pull": 0.03, "gravity": 0.03}),
    "i-v-vi-iv": ("Anthem Lane", {"motion_speed": 0.02, "valence": 0.02}),
}


def render_visual_parameters(
    elements: list[TheoryElement],
    unlocked_effects: list[str] | None = None,
    preview_growth_imprint: str | None = None,
) -> VisualParameters:
    unlocks = set(unlocked_effects or [])
    unlocks.update(_preview_effects_for_growth_imprint(preview_growth_imprint))
    aggregate_state = _aggregate_visual_state(elements)
    _apply_combo_bonuses(elements, aggregate_state)
    _apply_theory_synergies(elements, aggregate_state)
    _apply_unlock_effects(aggregate_state, unlocks)
    _apply_emergent_synergies(elements, aggregate_state)
    growth_imprint, growth_imprint_intensity = _resolve_growth_imprint(elements, unlocks, aggregate_state.active_bonuses)
    aggregate_state.growth_imprint = growth_imprint
    aggregate_state.growth_imprint_intensity = growth_imprint_intensity
    _apply_preview_growth_imprint(aggregate_state, preview_growth_imprint)
    scene_cascade, scene_cascade_intensity = _resolve_scene_cascade(elements, aggregate_state)
    aggregate_state.scene_cascade = scene_cascade
    aggregate_state.scene_cascade_intensity = scene_cascade_intensity
    _apply_growth_cascade_resonance(aggregate_state)
    phrase_trajectory, phrase_trajectory_intensity = _resolve_phrase_trajectory(elements, aggregate_state)
    aggregate_state.phrase_trajectory = phrase_trajectory
    aggregate_state.phrase_trajectory_intensity = phrase_trajectory_intensity
    _apply_phrase_hooks(elements, aggregate_state)
    phrase_variation, phrase_variation_intensity = _resolve_phrase_variation(aggregate_state)
    aggregate_state.phrase_variation = phrase_variation
    aggregate_state.phrase_variation_intensity = phrase_variation_intensity
    voiceprints, voiceprint_intensity = _resolve_voiceprints(elements, aggregate_state)
    aggregate_state.voiceprints = voiceprints
    aggregate_state.voiceprint_intensity = voiceprint_intensity
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
        openness=round(aggregate_state.openness, 2),
        attack=round(aggregate_state.attack, 2),
        swing=round(aggregate_state.swing, 2),
        gravity=round(aggregate_state.gravity, 2),
        synergy_resonance=round(aggregate_state.synergy_resonance, 2),
        cadence_pull=round(aggregate_state.cadence_pull, 2),
        modal_tension=round(aggregate_state.modal_tension, 2),
        blend_cohesion=round(aggregate_state.blend_cohesion, 2),
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
        growth_imprint=aggregate_state.growth_imprint,
        growth_imprint_intensity=round(aggregate_state.growth_imprint_intensity, 2),
        phrase_trajectory=aggregate_state.phrase_trajectory,
        phrase_trajectory_intensity=round(aggregate_state.phrase_trajectory_intensity, 2),
        phrase_hooks=aggregate_state.phrase_hooks,
        phrase_hook_energy=round(aggregate_state.phrase_hook_energy, 2),
        phrase_variation=aggregate_state.phrase_variation,
        phrase_variation_intensity=round(aggregate_state.phrase_variation_intensity, 2),
        voiceprints=aggregate_state.voiceprints,
        voiceprint_intensity=round(aggregate_state.voiceprint_intensity, 2),
        scene_cascade=aggregate_state.scene_cascade,
        scene_cascade_intensity=round(aggregate_state.scene_cascade_intensity, 2),
        active_bonuses=aggregate_state.active_bonuses,
        active_synergies=aggregate_state.active_synergies,
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
            openness=0.56,
            attack=0.32,
            swing=0.42,
            gravity=0.48,
            synergy_resonance=0.48,
            cadence_pull=0.42,
            modal_tension=0.32,
            blend_cohesion=0.56,
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
            growth_imprint="neutral",
            growth_imprint_intensity=0.0,
            phrase_trajectory="neutral",
            phrase_trajectory_intensity=0.0,
            phrase_hooks=[],
            phrase_hook_energy=0.0,
            phrase_variation="neutral",
            phrase_variation_intensity=0.0,
            voiceprints=[],
            voiceprint_intensity=0.0,
            scene_cascade="neutral",
            scene_cascade_intensity=0.0,
            active_bonuses=[],
            active_synergies=[],
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
    openness = sum(
        TRAIT_LIBRARY.get(element.name.lower(), TheoryTraitProfile(0.56, 0.32, 0.42, 0.48)).openness * weight
        for weight, element in weighted_profiles
    ) / total_weight
    attack = sum(
        TRAIT_LIBRARY.get(element.name.lower(), TheoryTraitProfile(0.56, 0.32, 0.42, 0.48)).attack * weight
        for weight, element in weighted_profiles
    ) / total_weight
    swing = sum(
        TRAIT_LIBRARY.get(element.name.lower(), TheoryTraitProfile(0.56, 0.32, 0.42, 0.48)).swing * weight
        for weight, element in weighted_profiles
    ) / total_weight
    gravity = sum(
        TRAIT_LIBRARY.get(element.name.lower(), TheoryTraitProfile(0.56, 0.32, 0.42, 0.48)).gravity * weight
        for weight, element in weighted_profiles
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
        openness=max(0.0, min(1.0, openness + stack_bonus * 0.06)),
        attack=max(0.0, min(1.0, attack + stack_bonus * 0.08)),
        swing=max(0.0, min(1.0, swing + stack_bonus * 0.08)),
        gravity=max(0.0, min(1.0, gravity + stack_bonus * 0.08)),
        synergy_resonance=max(0.0, min(1.0, 0.26 + (openness * 0.22) + ((1.0 - grit) * 0.16) + (depth * 0.18) + stack_bonus * 0.1)),
        cadence_pull=max(0.0, min(1.0, 0.18 + (gravity * 0.32) + stack_bonus * 0.08)),
        modal_tension=max(0.0, min(1.0, 0.14 + (attack * 0.24) + (grit * 0.26) + ((1.0 - openness) * 0.12) + stack_bonus * 0.06)),
        blend_cohesion=max(0.0, min(1.0, 0.24 + (openness * 0.16) + (depth * 0.14) + ((1.0 - contrast) * 0.08) + stack_bonus * 0.08)),
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
        growth_imprint="neutral",
        growth_imprint_intensity=0.0,
        phrase_trajectory="neutral",
        phrase_trajectory_intensity=0.0,
        phrase_hooks=[],
        phrase_hook_energy=0.0,
        phrase_variation="neutral",
        phrase_variation_intensity=0.0,
        voiceprints=[],
        voiceprint_intensity=0.0,
        scene_cascade="neutral",
        scene_cascade_intensity=0.0,
        active_bonuses=[],
        active_synergies=[],
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


def _apply_theory_synergies(elements: list[TheoryElement], state: AggregateVisualState) -> None:
    if not elements:
        return

    element_names = {element.name.casefold() for element in elements}
    element_types = {element.type for element in elements}

    if {"lydian", "ionian", "major"} & element_names and {"maj7", "major"} & element_names:
        _append_unique(state.active_synergies, "Radiant Voicing")
        state.synergy_resonance = min(1.0, state.synergy_resonance + 0.16)
        state.blend_cohesion = min(1.0, state.blend_cohesion + 0.12)
        state.openness = min(1.0, state.openness + 0.08)
        state.glow = min(1.0, state.glow + 0.06)
        state.symmetry = min(1.0, state.symmetry + 0.06)

    if "progression" in element_types and "chord" in element_types:
        _append_unique(state.active_synergies, "Cadential Lift")
        state.cadence_pull = min(1.0, state.cadence_pull + 0.38)
        state.synergy_resonance = min(1.0, state.synergy_resonance + 0.08)
        state.depth = min(1.0, state.depth + 0.08)
        state.beam_strength = min(1.0, state.beam_strength + 0.08)
        state.gravity = min(1.0, state.gravity + 0.08)

    if {"dorian", "mixolydian", "ii-v-i"} & element_names and {"min7", "dominant7"} & element_names:
        _append_unique(state.active_synergies, "Groove Pocket")
        state.swing = min(1.0, state.swing + 0.16)
        state.ripple_strength = min(1.0, state.ripple_strength + 0.08)
        state.motion_speed = min(1.0, state.motion_speed + 0.06)
        state.synergy_resonance = min(1.0, state.synergy_resonance + 0.1)

    if {"harmonic minor", "phrygian"} & element_names and {"dim7", "dominant7", "aug"} & element_names:
        _append_unique(state.active_synergies, "Shadow Magnet")
        state.modal_tension = min(1.0, state.modal_tension + 0.22)
        state.attack = min(1.0, state.attack + 0.12)
        state.gravity = min(1.0, state.gravity + 0.1)
        state.contrast = min(1.0, state.contrast + 0.08)

    if len(element_types) >= 3:
        _append_unique(state.active_synergies, "Color Convergence")
        state.blend_cohesion = min(1.0, state.blend_cohesion + 0.22)
        state.depth = min(1.0, state.depth + 0.06)
        state.secondary_color = _blend_hexes(
            [
                (state.primary_color, 0.45),
                (state.secondary_color, 0.35),
                (state.background_color, 0.2),
            ]
        )

    if len(state.active_synergies) > 1:
        state.synergy_resonance = min(1.0, state.synergy_resonance + 0.08)
        state.blend_cohesion = min(1.0, state.blend_cohesion + 0.08)


def _apply_emergent_synergies(elements: list[TheoryElement], state: AggregateVisualState) -> None:
    if len(elements) < 2:
        return

    emergent_hits = 0

    if state.openness > 0.78 and state.cadence_pull > 0.72 and state.luminosity > 0.72:
        emergent_hits += 1
        _append_unique(state.active_synergies, "Horizon Bloom")
        state.beam_strength = min(1.0, state.beam_strength + 0.12)
        state.depth = min(1.0, state.depth + 0.1)
        state.symmetry = min(1.0, state.symmetry + 0.08)
        state.valence = min(1.0, state.valence + 0.08)
        state.blend_cohesion = min(1.0, state.blend_cohesion + 0.08)
        state.glow = min(1.0, state.glow + 0.06)

    if state.modal_tension > 0.76 and state.grit > 0.68 and state.gravity > 0.68:
        emergent_hits += 1
        _append_unique(state.active_synergies, "Abyss Pressure")
        state.fracture = min(1.0, state.fracture + 0.14)
        state.grain = min(1.0, state.grain + 0.14)
        state.contrast = min(1.0, state.contrast + 0.12)
        state.pulse_density = min(1.0, state.pulse_density + 0.12)
        state.energy = min(1.0, state.energy + 0.08)
        state.arousal = min(1.0, state.arousal + 0.1)

    if state.swing > 0.68 and state.motion_speed > 0.62 and state.energy > 0.68:
        emergent_hits += 1
        _append_unique(state.active_synergies, "Slipstream Pocket")
        state.wave = min(1.0, state.wave + 0.12)
        state.ripple_strength = min(1.0, state.ripple_strength + 0.14)
        state.motion_speed = min(1.0, state.motion_speed + 0.1)
        state.pulse_density = min(1.0, state.pulse_density + 0.1)
        state.arousal = min(1.0, state.arousal + 0.08)
        state.beam_strength = min(1.0, state.beam_strength + 0.06)

    if state.complexity > 0.78 and state.attack > 0.72 and state.beam_strength > 0.62 and (state.lattice > 0.5 or state.fracture > 0.5):
        emergent_hits += 1
        _append_unique(state.active_synergies, "Prism Surge")
        state.lattice = min(1.0, state.lattice + 0.12)
        state.complexity = min(1.0, state.complexity + 0.1)
        state.beam_strength = min(1.0, state.beam_strength + 0.1)
        state.energy = min(1.0, state.energy + 0.08)
        state.motion_speed = min(1.0, state.motion_speed + 0.08)

    if emergent_hits:
        state.synergy_resonance = min(1.0, state.synergy_resonance + emergent_hits * 0.06)
        state.blend_cohesion = min(1.0, state.blend_cohesion + emergent_hits * 0.04)
        state.depth = min(1.0, state.depth + emergent_hits * 0.03)


def _apply_unlock_effects(state: AggregateVisualState, unlocked_effects: set[str]) -> None:
    if "particle_trail" in unlocked_effects:
        state.particle_density = min(0.99, state.particle_density + 0.14)
        state.complexity = min(1.0, state.complexity + 0.08)
        state.arousal = min(1.0, state.arousal + 0.08)
        state.swing = min(1.0, state.swing + 0.08)

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
        state.swing = min(1.0, state.swing + 0.12)

    if "harmonic_lattice" in unlocked_effects:
        state.lattice = max(0.92, min(1.0, state.lattice + 0.34))
        state.orb = min(state.orb, 0.42)
        state.beam_strength = min(1.0, state.beam_strength + 0.24)
        state.complexity = min(1.0, state.complexity + 0.16)
        state.glow = min(1.0, state.glow + 0.06)
        state.symmetry = min(1.0, state.symmetry + 0.18)
        state.depth = min(1.0, state.depth + 0.1)
        state.luminosity = min(1.0, state.luminosity + 0.12)
        state.openness = min(1.0, state.openness + 0.08)
        state.signature = "Harmonic Lattice"

    if "cadence_bloom" in unlocked_effects:
        state.ripple_strength = min(1.0, state.ripple_strength + 0.18)
        state.orb = max(0.78, min(1.0, state.orb + 0.12))
        state.secondary_color = "#d5c2ff"
        state.depth = min(1.0, state.depth + 0.12)
        state.symmetry = min(1.0, state.symmetry + 0.08)
        state.valence = min(1.0, state.valence + 0.08)
        state.gravity = min(1.0, state.gravity + 0.12)

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
        state.attack = min(1.0, state.attack + 0.46)
        state.gravity = min(1.0, state.gravity + 0.08)
        state.signature = "Fracture Burst"

    if "ember_strobe" in unlocked_effects:
        state.secondary_color = "#ff7b3d"
        state.grain = min(1.0, state.grain + 0.18)
        state.beam_strength = min(1.0, state.beam_strength + 0.16)
        state.luminosity = min(1.0, state.luminosity + 0.04)
        state.attack = min(1.0, state.attack + 0.18)

    if "velvet_glow" in unlocked_effects:
        state.glow = min(1.0, state.glow + 0.2)
        state.orb = max(0.94, min(1.0, state.orb + 0.2))
        state.fracture = min(state.fracture, 0.4)
        state.secondary_color = "#ff9fc9"
        state.depth = min(1.0, state.depth + 0.16)
        state.symmetry = min(1.0, state.symmetry + 0.14)
        state.valence = min(1.0, state.valence + 0.12)
        state.grit = max(0.0, state.grit - 0.08)
        state.openness = min(1.0, state.openness + 0.1)
        state.attack = max(0.0, state.attack - 0.08)
        state.signature = "Velvet Glow"

    if "silk_motion" in unlocked_effects:
        state.motion_speed = min(1.0, state.motion_speed + 0.1)
        state.ripple_strength = min(1.0, state.ripple_strength + 0.14)
        state.beam_strength = min(1.0, state.beam_strength + 0.12)
        state.wave = max(0.74, state.wave)
        state.pulse_density = max(0.0, state.pulse_density - 0.04)
        state.arousal = max(0.0, state.arousal - 0.04)
        state.swing = min(1.0, state.swing + 0.12)

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
        state.openness = min(1.0, state.openness + 0.08)
        state.swing = min(1.0, state.swing + 0.08)
        state.signature = "Prismatic Motion"

    if "phase_rings" in unlocked_effects:
        state.ripple_strength = max(0.92, min(1.0, state.ripple_strength + 0.22))
        state.beam_strength = min(1.0, state.beam_strength + 0.14)
        state.glow = min(1.0, state.glow + 0.08)
        state.pulse_density = min(1.0, state.pulse_density + 0.16)
        state.grit = max(0.0, state.grit - 0.02)
        state.gravity = min(1.0, state.gravity + 0.06)

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


def _append_unique(values: list[str], value: str) -> None:
    if value not in values:
        values.append(value)


def _resolve_growth_imprint(
    elements: list[TheoryElement],
    unlocked_effects: set[str],
    active_bonuses: list[str],
) -> tuple[str, float]:
    if not unlocked_effects:
        return "neutral", 0.0

    element_names = {element.name.casefold() for element in elements}
    bonus_text = " ".join(active_bonuses)
    best_style = "neutral"
    best_score = 0.0

    for style, profile in GROWTH_IMPRINT_RULES.items():
        effect_overlap = len(profile["effects"] & unlocked_effects)
        if effect_overlap == 0:
            continue

        effect_ratio = effect_overlap / max(1, len(profile["effects"]))
        score = 0.34 + effect_ratio * 0.44
        element_hits = sum(1 for element_name in element_names if element_name in profile["elements"])
        score += min(0.18, element_hits * 0.06)
        bonus_hits = sum(1 for keyword in profile["bonus_keywords"] if keyword in bonus_text)
        score += min(0.16, bonus_hits * 0.05)

        if score > best_score:
            best_style = style
            best_score = score

    return best_style, round(max(0.0, min(1.0, best_score)), 2)


def _preview_effects_for_growth_imprint(preview_growth_imprint: str | None) -> set[str]:
    if not preview_growth_imprint or preview_growth_imprint == "neutral":
        return set()

    return set(GROWTH_IMPRINT_RULES.get(preview_growth_imprint, {}).get("effects", set()))


def _preview_aura_bonus(preview_growth_imprint: str) -> dict[str, float | str] | None:
    preview_effects = _preview_effects_for_growth_imprint(preview_growth_imprint)

    for effect_names, _, bonus_values in STYLE_AURA_RULES:
        if effect_names == preview_effects:
            return bonus_values

    return None


def _apply_preview_growth_imprint(state: AggregateVisualState, preview_growth_imprint: str | None) -> None:
    if not preview_growth_imprint or preview_growth_imprint == "neutral":
        return

    state.growth_imprint = preview_growth_imprint
    state.growth_imprint_intensity = max(state.growth_imprint_intensity, 0.88)
    bonus_values = _preview_aura_bonus(preview_growth_imprint)

    if bonus_values is None:
        return

    _apply_scaled_bonus(state, bonus_values, 0.72)


def _resolve_scene_cascade(
    elements: list[TheoryElement],
    state: AggregateVisualState,
) -> tuple[str, float]:
    if not elements:
        return "neutral", 0.0

    element_names = {element.name.casefold() for element in elements}
    bonus_text = " ".join([state.signature, *state.active_bonuses, *state.active_synergies])
    selected_cascade = "neutral"
    selected_intensity = 0.0
    selected_bonus: dict[str, float] | None = None

    for required, cascade, base_intensity, cascade_bonus in SCENE_CASCADE_RULES:
        if required <= element_names:
            selected_cascade = cascade
            selected_intensity = min(1.0, base_intensity + min(0.08, len(state.active_synergies) * 0.02))
            selected_bonus = cascade_bonus

    if selected_cascade == "neutral":
        if state.growth_imprint == "metal-forge" and "Shadow Magnet" in state.active_synergies:
            selected_cascade = "forge-ritual"
            selected_intensity = 0.82
            selected_bonus = {"fracture": 0.14, "beam_strength": 0.12, "grain": 0.14, "contrast": 0.1, "attack": 0.12, "gravity": 0.08}
        elif state.growth_imprint == "fusion-phase" and _contains_any(bonus_text, ["Prism", "Chrome", "Meridian", "Engine"]):
            selected_cascade = "prism-vortex"
            selected_intensity = 0.78
            selected_bonus = {"wave": 0.1, "lattice": 0.12, "depth": 0.12, "beam_strength": 0.1, "motion_speed": 0.1}
        elif state.growth_imprint == "neo-soul-veil" and _contains_any(bonus_text, ["Velvet", "Glass", "Current", "Choir"]):
            selected_cascade = "velvet-arcade"
            selected_intensity = 0.76
            selected_bonus = {"wave": 0.1, "glow": 0.1, "depth": 0.12, "symmetry": 0.08, "blend_cohesion": 0.1}
        elif state.growth_imprint == "jazz-lattice" and _contains_any(bonus_text, ["Aurora", "Cadence", "Lattice", "Skyline"]):
            selected_cascade = "aurora-dais"
            selected_intensity = 0.78
            selected_bonus = {"beam_strength": 0.12, "depth": 0.12, "symmetry": 0.12, "blend_cohesion": 0.1}
        elif state.growth_imprint == "pentatonic-drive" and _contains_any(bonus_text, ["Roadhouse", "Neon", "Voltage", "Run"]):
            selected_cascade = "tide-runway"
            selected_intensity = 0.74
            selected_bonus = {"energy": 0.1, "ripple_strength": 0.12, "pulse_density": 0.12, "motion_speed": 0.1, "swing": 0.1}
        elif state.scene_family == "shadow-sanctum" and state.modal_tension > 0.78:
            selected_cascade = "eclipse-altar"
            selected_intensity = 0.7
            selected_bonus = {"contrast": 0.1, "depth": 0.1, "gravity": 0.08, "grit": 0.08}

    if selected_bonus:
        scale = 0.22 + selected_intensity * 0.48
        _apply_scaled_bonus(state, selected_bonus, scale)

    return selected_cascade, round(max(0.0, min(1.0, selected_intensity)), 2)


def _apply_growth_cascade_resonance(state: AggregateVisualState) -> None:
    if state.scene_cascade == "neutral" or state.growth_imprint == "neutral":
        return

    for cascade, imprint, label, intensity_boost, bonus in GROWTH_CASCADE_RULES:
        if state.scene_cascade != cascade or state.growth_imprint != imprint:
            continue

        resonance_scale = 0.28 + state.growth_imprint_intensity * 0.42
        state.scene_cascade_intensity = min(1.0, state.scene_cascade_intensity + intensity_boost)
        state.active_bonuses.append(label)
        _apply_scaled_bonus(state, bonus, resonance_scale)
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
        return


def _resolve_phrase_trajectory(
    elements: list[TheoryElement],
    state: AggregateVisualState,
) -> tuple[str, float]:
    if len(elements) < 2:
        return "neutral", 0.0

    element_names = [element.name.casefold() for element in elements]
    first_name = element_names[0]
    last_name = element_names[-1]
    first_type = elements[0].type
    last_type = elements[-1].type

    bright_openers = {"lydian", "ionian", "major", "maj7"}
    groove_openers = {"dorian", "min7", "major", "ii-v-i"}
    dark_openers = {"harmonic minor", "phrygian", "dim7", "minor"}
    runway_openers = {"pentatonic", "mixolydian", "major", "i-v-vi-iv"}
    prism_openers = {"melodic minor", "lydian", "maj7", "dominant7"}
    cadential_endings = {"ii-v-i", "maj7", "major", "dominant7"}
    soft_endings = {"maj7", "min7", "ii-v-i"}
    impact_endings = {"dominant7", "dim7", "aug"}
    dark_endings = {"harmonic minor", "phrygian", "minor", "dim7"}

    if first_name in bright_openers and last_name in cadential_endings and state.cadence_pull > 0.72:
        intensity = min(1.0, 0.72 + state.cadence_pull * 0.18 + state.luminosity * 0.08)
        _apply_scaled_bonus(
            state,
            {"beam_strength": 0.12, "depth": 0.1, "openness": 0.1, "symmetry": 0.08, "valence": 0.06},
            0.38 + intensity * 0.24,
        )
        return "lift-arc", round(intensity, 2)

    if first_name in groove_openers and last_name in soft_endings and state.blend_cohesion > 0.62:
        intensity = min(1.0, 0.68 + state.blend_cohesion * 0.16 + state.swing * 0.12)
        _apply_scaled_bonus(
            state,
            {"wave": 0.12, "ripple_strength": 0.14, "depth": 0.08, "blend_cohesion": 0.08, "swing": 0.1},
            0.34 + intensity * 0.22,
        )
        return "velvet-drift", round(intensity, 2)

    if first_name in runway_openers and last_name in {"dominant7", "ii-v-i", "i-v-vi-iv"} and state.motion_speed > 0.66:
        intensity = min(1.0, 0.72 + state.motion_speed * 0.16 + state.energy * 0.12)
        _apply_scaled_bonus(
            state,
            {"beam_strength": 0.12, "ripple_strength": 0.12, "motion_speed": 0.1, "energy": 0.1, "swing": 0.08},
            0.36 + intensity * 0.22,
        )
        return "runway-drive", round(intensity, 2)

    if first_name in prism_openers and last_name in {"aug", "dominant7", "lydian"} and state.complexity > 0.72:
        intensity = min(1.0, 0.7 + state.complexity * 0.14 + state.attack * 0.12)
        _apply_scaled_bonus(
            state,
            {"lattice": 0.12, "beam_strength": 0.1, "complexity": 0.08, "motion_speed": 0.08, "openness": 0.06},
            0.34 + intensity * 0.24,
        )
        return "prism-climb", round(intensity, 2)

    if first_name in dark_openers and last_name in impact_endings and state.modal_tension > 0.72:
        intensity = min(1.0, 0.74 + state.modal_tension * 0.14 + state.gravity * 0.1)
        _apply_scaled_bonus(
            state,
            {"fracture": 0.12, "attack": 0.12, "gravity": 0.1, "contrast": 0.08, "motion_speed": 0.08},
            0.38 + intensity * 0.24,
        )
        return "forge-drop", round(intensity, 2)

    if (first_type == "progression" or first_name in impact_endings) and (last_name in dark_endings or last_type == "scale"):
        intensity = min(1.0, 0.68 + state.depth * 0.12 + state.modal_tension * 0.12 + state.gravity * 0.1)
        _apply_scaled_bonus(
            state,
            {"fracture": 0.08, "depth": 0.12, "gravity": 0.12, "grit": 0.08, "modal_tension": 0.08},
            0.34 + intensity * 0.22,
        )
        return "shadow-sink", round(intensity, 2)

    return "neutral", 0.0


def _apply_phrase_hooks(elements: list[TheoryElement], state: AggregateVisualState) -> None:
    if len(elements) < 2:
        return

    hits = 0

    for index, (left, right) in enumerate(zip(elements, elements[1:])):
        pair = (left.name.casefold(), right.name.casefold())
        for required_pair, label, bonus in PHRASE_HOOK_RULES:
            if pair != required_pair:
                continue

            hits += 1
            _append_unique(state.phrase_hooks, label)
            scale = 0.24 + index * 0.04 + state.phrase_trajectory_intensity * 0.18
            _apply_scaled_bonus(state, bonus, scale)
            break

    if hits == 0:
        return

    state.phrase_hook_energy = min(
        1.0,
        0.22 + hits * 0.18 + state.phrase_trajectory_intensity * 0.22 + state.synergy_resonance * 0.16,
    )
    state.depth = min(1.0, state.depth + hits * 0.02)
    state.motion_speed = min(1.0, state.motion_speed + hits * 0.02)


def _resolve_phrase_variation(state: AggregateVisualState) -> tuple[str, float]:
    if state.growth_imprint == "neutral" or state.phrase_trajectory == "neutral":
        return "neutral", 0.0

    for imprint, trajectory, label, base_intensity, bonus in PHRASE_VARIATION_RULES:
        if state.growth_imprint != imprint or state.phrase_trajectory != trajectory:
            continue

        hook_bonus = min(0.12, len(state.phrase_hooks) * 0.04)
        intensity = min(
            1.0,
            base_intensity
            + hook_bonus
            + state.growth_imprint_intensity * 0.08
            + state.phrase_hook_energy * 0.06,
        )
        scale = 0.28 + intensity * 0.22
        _apply_scaled_bonus(state, bonus, scale)
        _append_unique(state.active_bonuses, label)
        return label.casefold().replace(" ", "-"), round(intensity, 2)

    return "neutral", 0.0


def _resolve_voiceprints(elements: list[TheoryElement], state: AggregateVisualState) -> tuple[list[str], float]:
    if not elements:
        return [], 0.0

    voiceprints: list[str] = []
    for element in elements:
        voiceprint = VOICEPRINT_RULES.get(element.name.casefold())
        if not voiceprint:
            continue

        label, bonus = voiceprint
        _append_unique(voiceprints, label)
        _apply_scaled_bonus(state, bonus, 0.34)

    if not voiceprints:
        return [], 0.0

    intensity = min(
        1.0,
        0.34
        + len(voiceprints) * 0.14
        + state.blend_cohesion * 0.16
        + state.complexity * 0.14
        + state.scene_cascade_intensity * 0.08
        + state.phrase_variation_intensity * 0.08,
    )
    state.depth = min(1.0, state.depth + intensity * 0.03)
    state.pulse_density = min(1.0, state.pulse_density + intensity * 0.02)
    return voiceprints[:4], round(intensity, 2)


def _apply_scaled_bonus(
    state: AggregateVisualState,
    bonus: dict[str, float | str],
    scale: float,
) -> None:
    for key, value in bonus.items():
        if isinstance(value, str):
            setattr(state, key, value)
            continue

        current_value = getattr(state, key)
        setattr(state, key, max(0.0, min(1.0, current_value + value * scale)))


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
