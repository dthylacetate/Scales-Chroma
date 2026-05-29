from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.unlocked_effect import UnlockedEffect


@dataclass(frozen=True)
class UserUnlockedEffect:
    id: int
    effect_name: str
    unlocked_at: datetime
    trigger_condition: str


def get_unlocked_effect_names(session: Session, user_id: int | None) -> list[str]:
    if user_id is None:
        return []

    return list(
        session.scalars(
            select(UnlockedEffect.effect_name)
            .where(UnlockedEffect.user_id == user_id)
            .order_by(UnlockedEffect.effect_name)
        ).all()
    )


def get_unlocked_effects(session: Session, user_id: int) -> list[UserUnlockedEffect]:
    effects = session.scalars(
        select(UnlockedEffect)
        .where(UnlockedEffect.user_id == user_id)
        .order_by(UnlockedEffect.effect_name)
    ).all()
    return [
        UserUnlockedEffect(
            id=effect.id,
            effect_name=effect.effect_name,
            unlocked_at=effect.unlocked_at,
            trigger_condition=effect.trigger_condition,
        )
        for effect in effects
    ]
