from datetime import date

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.schemas.practice_record import PracticeRecordCreate
from app.services.exp_system import calculate_exp

router = APIRouter(prefix="/practice-records", tags=["practice-records"])


class PracticeRecordCreateRequest(PracticeRecordCreate):
    user_id: int = Field(gt=0)


class PracticeRecordCreateResponse(BaseModel):
    id: int
    user_id: int
    practice_date: date
    duration_minutes: int
    bpm: int
    topic: str
    notes: str | None
    exp_earned: int


@router.post("", response_model=PracticeRecordCreateResponse, status_code=status.HTTP_201_CREATED)
def create_practice_record(payload: PracticeRecordCreateRequest) -> PracticeRecordCreateResponse:
    exp_earned = calculate_exp(
        duration_minutes=payload.duration_minutes,
        bpm=payload.bpm,
        streak_days=1,
    )

    return PracticeRecordCreateResponse(
        id=1,
        user_id=payload.user_id,
        practice_date=payload.practice_date,
        duration_minutes=payload.duration_minutes,
        bpm=payload.bpm,
        topic=payload.topic,
        notes=payload.notes,
        exp_earned=exp_earned,
    )
