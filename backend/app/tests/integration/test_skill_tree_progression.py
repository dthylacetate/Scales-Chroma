from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import Base
from app.models.user import User
from app.schemas.practice_record import PracticeRecordCreate
from app.services.practice_records import create_practice_record
from app.services.skill_tree import get_skill_tree


def test_skill_tree_unlocks_nodes_from_practice_topics() -> None:
    session = create_test_session()
    user = User(username="skill-player", email="skill@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=40,
            bpm=170,
            topic="Sweep Picking metal burst",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 30),
            duration_minutes=30,
            bpm=130,
            topic="II-V-I jazz voice leading",
        ),
    )

    tree = get_skill_tree(session=session, user_id=user.id)
    branches = {branch.direction: branch for branch in tree.branches}

    assert branches["Metal"].nodes[0].unlocked
    assert branches["Metal"].nodes[0].level == 1
    assert branches["Metal"].nodes[1].unlocked
    assert branches["Metal"].nodes[1].level == 1
    assert branches["Jazz"].nodes[0].unlocked
    assert branches["Jazz"].nodes[0].level == 1
    assert not branches["Neo Soul"].nodes[1].unlocked
    assert branches["Neo Soul"].nodes[1].level == 0


def test_skill_tree_levels_scale_with_accumulated_practice_minutes() -> None:
    session = create_test_session()
    user = User(username="duration-skill-player", email="duration-skill@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 6, 1),
            duration_minutes=150,
            bpm=120,
            topic="II-V-I jazz voice leading",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 6, 2),
            duration_minutes=90,
            bpm=132,
            topic="251 shell voicings",
        ),
    )

    tree = get_skill_tree(session=session, user_id=user.id)
    jazz_branch = next(branch for branch in tree.branches if branch.direction == "Jazz")
    ii_v_i_node = next(node for node in jazz_branch.nodes if node.id == "ii-v-i")

    assert ii_v_i_node.unlocked
    assert ii_v_i_node.level == 4


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()
