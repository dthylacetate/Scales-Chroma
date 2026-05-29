from app.visual_engine.types import ParticleProfile


def configure_particles(
    density_seed: float,
    energy: float,
    complexity: float,
    unlocked_effects: list[str],
) -> ParticleProfile:
    density = min(0.98, round(density_seed + complexity * 0.16 + energy * 0.08, 2))
    trail = "particle_trail" in unlocked_effects
    size = round(1.0 + complexity * 2.6, 2)
    speed = round(0.4 + energy * 1.35, 2)
    spread = round(0.28 + complexity * 0.34 + energy * 0.18, 2)

    if trail:
        density = min(0.99, round(density + 0.12, 2))
        speed = round(speed + 0.36, 2)
        spread = round(spread + 0.08, 2)

    if "fracture_burst" in unlocked_effects:
        speed = round(speed + 0.28, 2)
        size = round(size + 0.24, 2)

    if "silk_motion" in unlocked_effects:
        spread = round(spread + 0.1, 2)

    return ParticleProfile(density=density, trail=trail, size=size, speed=speed, spread=spread)
