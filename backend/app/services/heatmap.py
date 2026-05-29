from dataclasses import dataclass
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.practice_record import PracticeRecord
from app.services.exp_system import calculate_exp


@dataclass(frozen=True)
class HeatmapDayResult:
    date: str
    duration_minutes: int
    exp: int


@dataclass(frozen=True)
class YearlyHeatmapResult:
    user_id: int
    year: int
    days: list[HeatmapDayResult]


def get_yearly_heatmap(session: Session, user_id: int, year: int) -> YearlyHeatmapResult:
    start_date = date(year, 1, 1)
    end_date = date(year + 1, 1, 1)
    records = session.scalars(
        select(PracticeRecord)
        .where(PracticeRecord.user_id == user_id)
        .where(PracticeRecord.practice_date >= start_date)
        .where(PracticeRecord.practice_date < end_date)
        .order_by(PracticeRecord.practice_date.asc(), PracticeRecord.id.asc())
    ).all()

    daily_totals: dict[str, HeatmapDayResult] = {}
    for record in records:
        day_key = record.practice_date.isoformat()
        current = daily_totals.get(
            day_key,
            HeatmapDayResult(date=day_key, duration_minutes=0, exp=0),
        )
        exp = calculate_exp(record.duration_minutes, record.bpm, streak_days=1)
        daily_totals[day_key] = HeatmapDayResult(
            date=day_key,
            duration_minutes=current.duration_minutes + record.duration_minutes,
            exp=current.exp + exp,
        )

    return YearlyHeatmapResult(
        user_id=user_id,
        year=year,
        days=list(daily_totals.values()),
    )
