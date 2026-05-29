from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.practice_record import PracticeRecord
from app.models.unlocked_effect import UnlockedEffect


PENTATONIC_THRESHOLD_MINUTES = 600
PENTATONIC_KEYWORDS = ("pentatonic", "五声音阶")


@dataclass(frozen=True)
class UnlockRule:
    effect_name: str
    trigger_condition: str


PENTATONIC_UNLOCKS: tuple[UnlockRule, ...] = (
    UnlockRule("particle_trail", "五声音阶累计练习达到 10 小时"),
    UnlockRule("neon_glow", "五声音阶累计练习达到 10 小时"),
    UnlockRule("dynamic_ripple", "五声音阶累计练习达到 10 小时"),
)


def apply_practice_unlocks(session: Session, user_id: int) -> list[UnlockedEffect]:
    unlocked_effects: list[UnlockedEffect] = []

    if _total_pentatonic_minutes(session=session, user_id=user_id) >= PENTATONIC_THRESHOLD_MINUTES:
        unlocked_effects.extend(
            _unlock_missing_effects(
                session=session,
                user_id=user_id,
                rules=PENTATONIC_UNLOCKS,
            )
        )

    return unlocked_effects


def _total_pentatonic_minutes(session: Session, user_id: int) -> int:
    records = session.scalars(select(PracticeRecord).where(PracticeRecord.user_id == user_id)).all()
    return sum(record.duration_minutes for record in records if _is_pentatonic_topic(record.topic))


def _is_pentatonic_topic(topic: str) -> bool:
    normalized_topic = topic.lower()
    return any(keyword in normalized_topic for keyword in PENTATONIC_KEYWORDS)


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
