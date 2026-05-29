from datetime import date, datetime

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_session
from app.models.practice_record import PracticeRecord
from app.models.user import User
from app.schemas.practice_record import PracticeRecordCreate
from app.services.practice_records import create_practice_record as create_practice_record_service

router = APIRouter(prefix="/practice-records", tags=["practice-records"])


class PracticeRecordCreateRequest(PracticeRecordCreate):
    pass


class PracticeRecordCreateResponse(BaseModel):
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


class PracticeRecordHistoryItem(BaseModel):
    id: int
    user_id: int
    practice_date: date
    duration_minutes: int
    bpm: int
    topic: str
    notes: str | None
    created_at: datetime


class PracticeRecordListResponse(BaseModel):
    records: list[PracticeRecordHistoryItem]


@router.post("", response_model=PracticeRecordCreateResponse, status_code=status.HTTP_201_CREATED)
def create_practice_record(
    payload: PracticeRecordCreateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> PracticeRecordCreateResponse:
    result = create_practice_record_service(
        session=session,
        user_id=current_user.id,
        payload=payload,
    )

    return PracticeRecordCreateResponse(
        id=result.id,
        user_id=result.user_id,
        practice_date=result.practice_date,
        duration_minutes=result.duration_minutes,
        bpm=result.bpm,
        topic=result.topic,
        notes=result.notes,
        exp_earned=result.exp_earned,
        total_exp=result.total_exp,
        level=result.level,
        current_streak=result.current_streak,
        longest_streak=result.longest_streak,
        unlocked_effects=result.unlocked_effects,
    )


@router.get("", response_model=PracticeRecordListResponse)
def list_practice_records(
    limit: int = Query(default=10, ge=1, le=50),
    topic: str | None = Query(default=None, min_length=1),
    date_from: date | None = None,
    date_to: date | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> PracticeRecordListResponse:
    statement = (
        select(PracticeRecord)
        .where(PracticeRecord.user_id == current_user.id)
    )

    if topic:
        statement = statement.where(PracticeRecord.topic.ilike(f"%{topic}%"))

    if date_from:
        statement = statement.where(PracticeRecord.practice_date >= date_from)

    if date_to:
        statement = statement.where(PracticeRecord.practice_date <= date_to)

    records = session.scalars(
        statement.order_by(PracticeRecord.practice_date.desc(), PracticeRecord.id.desc()).limit(limit)
    ).all()
    return PracticeRecordListResponse(
        records=[
            PracticeRecordHistoryItem(
                id=record.id,
                user_id=record.user_id,
                practice_date=record.practice_date,
                duration_minutes=record.duration_minutes,
                bpm=record.bpm,
                topic=record.topic,
                notes=record.notes,
                created_at=record.created_at,
            )
            for record in records
        ]
    )
