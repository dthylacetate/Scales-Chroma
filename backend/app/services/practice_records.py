from dataclasses import dataclass
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.exp_statistics import ExpStatistics
from app.models.practice_record import PracticeRecord
from app.models.user import User
from app.schemas.practice_record import PracticeRecordCreate
from app.services.exp_system import calculate_exp, is_consecutive_practice_day
from app.services.leveling import level_from_total_exp
from app.services.unlocks import apply_practice_unlocks


@dataclass(frozen=True)
class PracticeRecordResult:
    id: int
    user_id: int
    practice_date: date
    duration_minutes: int
    bpm: int
    topic: str
    notes: str | None
    exp_earned: int
    total_exp: int
    level: int
    current_streak: int
    longest_streak: int
    unlocked_effects: list[str]


def create_practice_record(
    session: Session,
    user_id: int,
    payload: PracticeRecordCreate,
) -> PracticeRecordResult:
    user = session.get(User, user_id)

    if user is None:
        user = User(
            id=user_id,
            username=f"player-{user_id}",
            email=f"player-{user_id}@local.scales-chroma",
        )
        session.add(user)
        session.flush()

    previous_practice_date = _latest_practice_date_on_or_before(
        session=session,
        user_id=user.id,
        practice_date=payload.practice_date,
    )
    record = PracticeRecord(
        user_id=user.id,
        practice_date=payload.practice_date,
        duration_minutes=payload.duration_minutes,
        bpm=payload.bpm,
        topic=payload.topic,
        notes=payload.notes,
    )
    session.add(record)

    statistics = user.exp_statistics
    if statistics is None:
        statistics = ExpStatistics(
            user_id=user.id,
            total_exp=0,
            current_streak=0,
            longest_streak=0,
        )
        session.add(statistics)

    next_streak = _next_streak_days(
        current_streak=statistics.current_streak,
        previous_practice_date=previous_practice_date,
        practice_date=payload.practice_date,
    )
    exp_earned = calculate_exp(
        duration_minutes=payload.duration_minutes,
        bpm=payload.bpm,
        streak_days=next_streak,
    )
    statistics.total_exp += exp_earned
    statistics.current_streak = next_streak
    statistics.longest_streak = max(statistics.longest_streak, statistics.current_streak)
    user.total_exp = statistics.total_exp
    user.level = level_from_total_exp(user.total_exp)

    session.flush()
    unlocked_effects = apply_practice_unlocks(session=session, user_id=user.id)

    session.commit()
    session.refresh(record)

    return PracticeRecordResult(
        id=record.id,
        user_id=record.user_id,
        practice_date=record.practice_date,
        duration_minutes=record.duration_minutes,
        bpm=record.bpm,
        topic=record.topic,
        notes=record.notes,
        exp_earned=exp_earned,
        total_exp=user.total_exp,
        level=user.level,
        current_streak=statistics.current_streak,
        longest_streak=statistics.longest_streak,
        unlocked_effects=[effect.effect_name for effect in unlocked_effects],
    )


def _latest_practice_date_on_or_before(
    session: Session,
    user_id: int,
    practice_date: date,
) -> date | None:
    return session.scalar(
        select(func.max(PracticeRecord.practice_date))
        .where(PracticeRecord.user_id == user_id)
        .where(PracticeRecord.practice_date <= practice_date)
    )


def _next_streak_days(
    current_streak: int,
    previous_practice_date: date | None,
    practice_date: date,
) -> int:
    if previous_practice_date is None:
        return 1

    if previous_practice_date == practice_date:
        return max(1, current_streak)

    if is_consecutive_practice_day(previous_practice_date, practice_date):
        return max(1, current_streak) + 1

    return 1
