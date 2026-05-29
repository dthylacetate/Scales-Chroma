from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.unlocked_effect import UnlockedEffect


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
