from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.practice_record import PracticeRecord


@dataclass(frozen=True)
class SkillNodeResult:
    id: str
    label: str
    level: int
    unlocked: bool


@dataclass(frozen=True)
class SkillBranchResult:
    direction: str
    nodes: list[SkillNodeResult]


@dataclass(frozen=True)
class SkillTreeResult:
    user_id: int
    branches: list[SkillBranchResult]


SKILL_TREE_DEFINITION: dict[str, list[tuple[str, str, tuple[str, ...]]]] = {
    "Metal": [
        ("palm-mute", "Palm Mute", ("metal", "palm mute", "riff")),
        ("sweep-picking", "Sweep Picking", ("sweep", "sweep picking")),
    ],
    "Jazz": [
        ("ii-v-i", "II-V-I", ("ii-v-i", "251", "jazz")),
        ("altered-dominants", "Altered Dominants", ("altered", "dominant")),
    ],
    "Fusion": [
        ("legato", "Legato", ("legato", "fusion")),
        ("hybrid-picking", "Hybrid Picking", ("hybrid", "outside")),
    ],
    "Neo Soul": [
        ("maj7-voicings", "Maj7 Voicings", ("maj7", "neo soul")),
        ("double-stops", "Double Stops", ("double stop", "double stops")),
    ],
}


def get_skill_tree(session: Session, user_id: int) -> SkillTreeResult:
    records = session.scalars(select(PracticeRecord).where(PracticeRecord.user_id == user_id)).all()
    branches = [
        SkillBranchResult(
            direction=direction,
            nodes=[_node_from_records(node_id, label, keywords, records) for node_id, label, keywords in nodes],
        )
        for direction, nodes in SKILL_TREE_DEFINITION.items()
    ]

    return SkillTreeResult(user_id=user_id, branches=branches)


def _node_from_records(
    node_id: str,
    label: str,
    keywords: tuple[str, ...],
    records: list[PracticeRecord],
) -> SkillNodeResult:
    matched_minutes = sum(
        record.duration_minutes
        for record in records
        if any(keyword in record.topic.casefold() for keyword in keywords)
    )
    level = _level_from_minutes(matched_minutes)
    return SkillNodeResult(id=node_id, label=label, level=level, unlocked=level > 0)


def _level_from_minutes(minutes: int) -> int:
    if minutes <= 0:
        return 0

    return min(5, max(1, minutes // 60))
