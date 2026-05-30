from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.practice_record import PracticeRecord
from app.models.unlocked_effect import UnlockedEffect
from app.services.topic_matching import topic_matches


PENTATONIC_THRESHOLD_MINUTES = 600
PENTATONIC_KEYWORDS = ("pentatonic", "五声音阶", "五声")
JAZZ_II_V_I_THRESHOLD_MINUTES = 300
JAZZ_II_V_I_KEYWORDS = ("ii-v-i", "251", "jazz voice leading", "爵士")
METAL_SWEEP_THRESHOLD_MINUTES = 300
METAL_SWEEP_KEYWORDS = ("sweep", "sweep picking", "metal burst", "metal", "金属", "下拨")
NEO_SOUL_MAJ7_THRESHOLD_MINUTES = 240
NEO_SOUL_MAJ7_KEYWORDS = ("maj7", "neo soul", "新灵魂")
FUSION_THRESHOLD_MINUTES = 240
FUSION_KEYWORDS = ("fusion", "legato", "hybrid", "融合")


@dataclass(frozen=True)
class UnlockRule:
    effect_name: str
    trigger_condition: str


@dataclass(frozen=True)
class UnlockTrack:
    threshold_minutes: int
    keywords: tuple[str, ...]
    rules: tuple[UnlockRule, ...]


PENTATONIC_UNLOCKS: tuple[UnlockRule, ...] = (
    UnlockRule("particle_trail", "五声音阶累计练习达到 10 小时"),
    UnlockRule("neon_glow", "五声音阶累计练习达到 10 小时"),
    UnlockRule("dynamic_ripple", "五声音阶累计练习达到 10 小时"),
)

JAZZ_II_V_I_UNLOCKS: tuple[UnlockRule, ...] = (
    UnlockRule("harmonic_lattice", "II-V-I / Jazz 累计练习达到 5 小时"),
    UnlockRule("cadence_bloom", "II-V-I / Jazz 累计练习达到 5 小时"),
)

METAL_SWEEP_UNLOCKS: tuple[UnlockRule, ...] = (
    UnlockRule("fracture_burst", "Metal / Sweep Picking 累计练习达到 5 小时"),
    UnlockRule("ember_strobe", "Metal / Sweep Picking 累计练习达到 5 小时"),
)

NEO_SOUL_MAJ7_UNLOCKS: tuple[UnlockRule, ...] = (
    UnlockRule("velvet_glow", "Maj7 / Neo Soul 累计练习达到 4 小时"),
    UnlockRule("silk_motion", "Maj7 / Neo Soul 累计练习达到 4 小时"),
)

FUSION_UNLOCKS: tuple[UnlockRule, ...] = (
    UnlockRule("prismatic_motion", "Fusion / Legato 累计练习达到 4 小时"),
    UnlockRule("phase_rings", "Fusion / Legato 累计练习达到 4 小时"),
)

UNLOCK_TRACKS: tuple[UnlockTrack, ...] = (
    UnlockTrack(PENTATONIC_THRESHOLD_MINUTES, PENTATONIC_KEYWORDS, PENTATONIC_UNLOCKS),
    UnlockTrack(JAZZ_II_V_I_THRESHOLD_MINUTES, JAZZ_II_V_I_KEYWORDS, JAZZ_II_V_I_UNLOCKS),
    UnlockTrack(METAL_SWEEP_THRESHOLD_MINUTES, METAL_SWEEP_KEYWORDS, METAL_SWEEP_UNLOCKS),
    UnlockTrack(NEO_SOUL_MAJ7_THRESHOLD_MINUTES, NEO_SOUL_MAJ7_KEYWORDS, NEO_SOUL_MAJ7_UNLOCKS),
    UnlockTrack(FUSION_THRESHOLD_MINUTES, FUSION_KEYWORDS, FUSION_UNLOCKS),
)


def apply_practice_unlocks(session: Session, user_id: int) -> list[UnlockedEffect]:
    unlocked_effects: list[UnlockedEffect] = []

    for track in UNLOCK_TRACKS:
        if _total_minutes_for_keywords(session=session, user_id=user_id, keywords=track.keywords) >= track.threshold_minutes:
            unlocked_effects.extend(
                _unlock_missing_effects(
                    session=session,
                    user_id=user_id,
                    rules=track.rules,
                )
            )

    return unlocked_effects


def _total_minutes_for_keywords(session: Session, user_id: int, keywords: tuple[str, ...]) -> int:
    records = session.scalars(select(PracticeRecord).where(PracticeRecord.user_id == user_id)).all()
    return sum(record.duration_minutes for record in records if _topic_matches(record.topic, keywords))


def _topic_matches(topic: str, keywords: tuple[str, ...]) -> bool:
    return topic_matches(topic, keywords)


def _unlock_missing_effects(
    session: Session,
    user_id: int,
    rules: tuple[UnlockRule, ...],
) -> list[UnlockedEffect]:
    existing_effects = set(
        session.scalars(
            select(UnlockedEffect.effect_name).where(UnlockedEffect.user_id == user_id)
        ).all()
    )
    new_effects = [
        UnlockedEffect(
            user_id=user_id,
            effect_name=rule.effect_name,
            trigger_condition=rule.trigger_condition,
        )
        for rule in rules
        if rule.effect_name not in existing_effects
    ]

    session.add_all(new_effects)
    return new_effects
