from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.services.heatmap import get_yearly_heatmap as get_yearly_heatmap_service
from app.services.skill_tree import get_skill_tree as get_skill_tree_service
from app.services.user_effects import get_unlocked_effects as get_unlocked_effects_service

router = APIRouter(tags=["progression"])


class HeatmapDay(BaseModel):
    date: str
    duration_minutes: int
    exp: int


class YearlyHeatmapResponse(BaseModel):
    user_id: int
    year: int
    days: list[HeatmapDay]


class SkillNode(BaseModel):
    id: str
    label: str
    level: int
    unlocked: bool


class SkillBranch(BaseModel):
    direction: str
    nodes: list[SkillNode]


class SkillTreeResponse(BaseModel):
    user_id: int
    branches: list[SkillBranch]


class UnlockedEffectItem(BaseModel):
    id: int
    effect_name: str
    unlocked_at: datetime
    trigger_condition: str


class UnlockedEffectsResponse(BaseModel):
    user_id: int
    effects: list[UnlockedEffectItem]


@router.get("/heatmap/yearly", response_model=YearlyHeatmapResponse)
def get_yearly_heatmap(
    user_id: int = Query(gt=0),
    year: int = Query(ge=1970, le=9999),
    session: Session = Depends(get_session),
) -> YearlyHeatmapResponse:
    result = get_yearly_heatmap_service(session=session, user_id=user_id, year=year)
    return YearlyHeatmapResponse(
        user_id=result.user_id,
        year=result.year,
        days=[
            HeatmapDay(
                date=day.date,
                duration_minutes=day.duration_minutes,
                exp=day.exp,
            )
            for day in result.days
        ],
    )


@router.get("/unlocked-effects", response_model=UnlockedEffectsResponse)
def get_unlocked_effects(
    user_id: int = Query(gt=0),
    session: Session = Depends(get_session),
) -> UnlockedEffectsResponse:
    effects = get_unlocked_effects_service(session=session, user_id=user_id)
    return UnlockedEffectsResponse(
        user_id=user_id,
        effects=[
            UnlockedEffectItem(
                id=effect.id,
                effect_name=effect.effect_name,
                unlocked_at=effect.unlocked_at,
                trigger_condition=effect.trigger_condition,
            )
            for effect in effects
        ],
    )


@router.get("/skill-tree", response_model=SkillTreeResponse)
def get_skill_tree(
    user_id: int = Query(gt=0),
    session: Session = Depends(get_session),
) -> SkillTreeResponse:
    result = get_skill_tree_service(session=session, user_id=user_id)
    return SkillTreeResponse(
        user_id=result.user_id,
        branches=[
            SkillBranch(
                direction=branch.direction,
                nodes=[
                    SkillNode(
                        id=node.id,
                        label=node.label,
                        level=node.level,
                        unlocked=node.unlocked,
                    )
                    for node in branch.nodes
                ],
            )
            for branch in result.branches
        ],
    )
