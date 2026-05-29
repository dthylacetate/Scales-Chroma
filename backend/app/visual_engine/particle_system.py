from app.visual_engine.types import ParticleProfile


def configure_particles(tension_level: int, unlocked_effects: list[str]) -> ParticleProfile:
    density = min(0.95, round(0.2 + tension_level * 0.06, 2))
    trail = "particle_trail" in unlocked_effects

    if trail:
        density = min(0.98, round(density + 0.16, 2))

    return ParticleProfile(density=density, trail=trail)
