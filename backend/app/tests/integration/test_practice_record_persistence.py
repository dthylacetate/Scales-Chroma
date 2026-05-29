from datetime import date

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import Base
from app.models.exp_statistics import ExpStatistics
from app.models.practice_record import PracticeRecord
from app.models.user import User
from app.schemas.practice_record import PracticeRecordCreate
from app.services.practice_records import create_practice_record


def test_create_practice_record_persists_record_and_updates_exp() -> None:
    session = create_test_session()
    user = User(username="player-one", email="player@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    result = create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=30,
            bpm=120,
            topic="Dorian alternate picking",
            notes="Clean sixteenth-note bursts",
        ),
    )

    records = session.scalars(select(PracticeRecord).where(PracticeRecord.user_id == user.id)).all()
    statistics = session.scalar(select(ExpStatistics).where(ExpStatistics.user_id == user.id))
    refreshed_user = session.get(User, user.id)

    assert result.exp_earned == 36
    assert len(records) == 1
    assert records[0].topic == "Dorian alternate picking"
    assert statistics is not None
    assert statistics.total_exp == 36
    assert statistics.current_streak == 1
    assert statistics.longest_streak == 1
    assert refreshed_user is not None
    assert refreshed_user.total_exp == 36


def test_create_practice_record_accumulates_exp_for_existing_statistics() -> None:
    session = create_test_session()
    user = User(username="player-two", email="player-two@example.com", total_exp=10)
    session.add(user)
    session.flush()
    session.add(ExpStatistics(user_id=user.id, total_exp=10, current_streak=2, longest_streak=4))
    session.commit()
    session.refresh(user)

    result = create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=20,
            bpm=180,
            topic="Pentatonic speed run",
            notes=None,
        ),
    )

    statistics = session.scalar(select(ExpStatistics).where(ExpStatistics.user_id == user.id))
    refreshed_user = session.get(User, user.id)

    assert result.exp_earned == 30
    assert statistics is not None
    assert statistics.total_exp == 40
    assert refreshed_user is not None
    assert refreshed_user.total_exp == 40


def test_create_practice_record_returns_total_exp_and_updates_user_level() -> None:
    session = create_test_session()
    user = User(username="level-player", email="level@example.com", total_exp=95, level=1)
    session.add(user)
    session.flush()
    session.add(ExpStatistics(user_id=user.id, total_exp=95, current_streak=1, longest_streak=1))
    session.commit()
    session.refresh(user)

    result = create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=20,
            bpm=180,
            topic="Pentatonic speed run",
            notes=None,
        ),
    )

    refreshed_user = session.get(User, user.id)

    assert result.exp_earned == 30
    assert result.total_exp == 125
    assert result.level == 2
    assert refreshed_user is not None
    assert refreshed_user.level == 2


def test_create_practice_record_returns_newly_unlocked_visual_effects() -> None:
    session = create_test_session()
    user = User(username="unlock-player", email="unlock@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    result = create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=610,
            bpm=150,
            topic="Pentatonic speed run",
            notes=None,
        ),
    )

    assert sorted(result.unlocked_effects) == ["dynamic_ripple", "neon_glow", "particle_trail"]


def test_create_practice_record_advances_streak_and_applies_bonus_exp() -> None:
    session = create_test_session()
    user = User(username="streak-player", email="streak@example.com", total_exp=0)
    session.add(user)
    session.flush()
    session.add(ExpStatistics(user_id=user.id, total_exp=0, current_streak=2, longest_streak=2))
    session.add(
        PracticeRecord(
            user_id=user.id,
            practice_date=date(2026, 5, 28),
            duration_minutes=20,
            bpm=120,
            topic="Dorian phrasing",
        )
    )
    session.commit()

    result = create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=30,
            bpm=120,
            topic="Dorian phrasing",
            notes=None,
        ),
    )

    statistics = session.scalar(select(ExpStatistics).where(ExpStatistics.user_id == user.id))

    assert result.exp_earned == 39
    assert statistics is not None
    assert statistics.current_streak == 3
    assert statistics.longest_streak == 3


def test_create_practice_record_resets_streak_after_a_gap() -> None:
    session = create_test_session()
    user = User(username="gap-player", email="gap@example.com", total_exp=0)
    session.add(user)
    session.flush()
    session.add(ExpStatistics(user_id=user.id, total_exp=0, current_streak=8, longest_streak=8))
    session.add(
        PracticeRecord(
            user_id=user.id,
            practice_date=date(2026, 5, 20),
            duration_minutes=20,
            bpm=120,
            topic="Dorian phrasing",
        )
    )
    session.commit()

    result = create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=30,
            bpm=120,
            topic="Dorian phrasing",
            notes=None,
        ),
    )

    statistics = session.scalar(select(ExpStatistics).where(ExpStatistics.user_id == user.id))

    assert result.exp_earned == 36
    assert statistics is not None
    assert statistics.current_streak == 1
    assert statistics.longest_streak == 8


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()
