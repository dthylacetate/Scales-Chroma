from dataclasses import dataclass
from datetime import date

from sqlalchemy.orm import Session

from app.models.exp_statistics import ExpStatistics
from app.models.practice_record import PracticeRecord
from app.models.user import User
from app.schemas.practice_record import PracticeRecordCreate
from app.services.exp_system import calculate_exp


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

    exp_earned = calculate_exp(
        duration_minutes=payload.duration_minutes,
        bpm=payload.bpm,
        streak_days=1,
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

    statistics.total_exp += exp_earned
    statistics.current_streak = max(1, statistics.current_streak)
    statistics.longest_streak = max(statistics.longest_streak, statistics.current_streak)
    user.total_exp = statistics.total_exp

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
    )
