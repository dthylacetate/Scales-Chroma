from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.schemas.practice_record import PracticeRecordCreate
from app.services.practice_records import create_practice_record as create_practice_record_service

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
def create_practice_record(
    payload: PracticeRecordCreateRequest,
    session: Session = Depends(get_session),
) -> PracticeRecordCreateResponse:
    result = create_practice_record_service(
        session=session,
        user_id=payload.user_id,
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
    )
