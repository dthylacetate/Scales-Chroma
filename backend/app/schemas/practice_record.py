from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PracticeRecordCreate(BaseModel):
    practice_date: date
    duration_minutes: int = Field(gt=0)
    bpm: int = Field(gt=0)
    topic: str = Field(min_length=1, max_length=120)
    notes: str | None = None


class PracticeRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    practice_date: date
    duration_minutes: int
    bpm: int
    topic: str
    notes: str | None
    created_at: datetime
