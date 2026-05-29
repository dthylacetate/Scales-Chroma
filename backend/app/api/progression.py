from fastapi import APIRouter, Query
from pydantic import BaseModel

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


@router.get("/heatmap/yearly", response_model=YearlyHeatmapResponse)
def get_yearly_heatmap(
    user_id: int = Query(gt=0),
    year: int = Query(ge=1970, le=9999),
) -> YearlyHeatmapResponse:
    return YearlyHeatmapResponse(user_id=user_id, year=year, days=[])


@router.get("/skill-tree", response_model=SkillTreeResponse)
def get_skill_tree(user_id: int = Query(gt=0)) -> SkillTreeResponse:
    branches = [
        _branch("Metal", "palm-mute", "Sweep Picking"),
        _branch("Jazz", "ii-v-i", "Altered Dominants"),
        _branch("Fusion", "legato", "Hybrid Picking"),
        _branch("Neo Soul", "maj7-voicings", "Double Stops"),
    ]
    return SkillTreeResponse(user_id=user_id, branches=branches)


def _branch(direction: str, first_id: str, second_label: str) -> SkillBranch:
    return SkillBranch(
        direction=direction,
        nodes=[
            SkillNode(id=first_id, label=first_id.replace("-", " ").title(), level=1, unlocked=True),
            SkillNode(id=second_label.lower().replace(" ", "-"), label=second_label, level=0, unlocked=False),
        ],
    )
