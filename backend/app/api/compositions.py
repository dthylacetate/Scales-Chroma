from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_session
from app.models.saved_composition import SavedComposition
from app.models.user import User
from app.schemas.theory import TheoryElement

router = APIRouter(prefix="/compositions", tags=["compositions"])


class CompositionCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    elements: list[TheoryElement] = Field(min_length=1)


class CompositionResponse(BaseModel):
    id: int
    user_id: int
    name: str
    elements: list[TheoryElement]
    created_at: datetime


class CompositionListResponse(BaseModel):
    compositions: list[CompositionResponse]


@router.post("", response_model=CompositionResponse, status_code=status.HTTP_201_CREATED)
def create_composition(
    payload: CompositionCreateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CompositionResponse:
    composition = SavedComposition(
        user_id=current_user.id,
        name=payload.name,
        elements=[element.model_dump() for element in payload.elements],
    )
    session.add(composition)
    session.commit()
    session.refresh(composition)

    return _to_response(composition)


@router.get("", response_model=CompositionListResponse)
def list_compositions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CompositionListResponse:
    compositions = session.scalars(
        select(SavedComposition)
        .where(SavedComposition.user_id == current_user.id)
        .order_by(SavedComposition.created_at.desc(), SavedComposition.id.desc())
    ).all()
    return CompositionListResponse(compositions=[_to_response(composition) for composition in compositions])


@router.put("/{composition_id}", response_model=CompositionResponse)
def update_composition(
    composition_id: int,
    payload: CompositionCreateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CompositionResponse:
    composition = session.get(SavedComposition, composition_id)

    if composition is None or composition.user_id != current_user.id:
        return _raise_not_found()

    composition.name = payload.name
    composition.elements = [element.model_dump() for element in payload.elements]
    session.commit()
    session.refresh(composition)

    return _to_response(composition)


def _raise_not_found() -> None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Composition not found")


def _to_response(composition: SavedComposition) -> CompositionResponse:
    return CompositionResponse(
        id=composition.id,
        user_id=composition.user_id,
        name=composition.name,
        elements=[TheoryElement(**element) for element in composition.elements],
        created_at=composition.created_at,
    )
