from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import Base
from app.models.user import User
from app.schemas.practice_record import PracticeRecordCreate
from app.services.heatmap import get_yearly_heatmap
from app.services.practice_records import create_practice_record


def test_yearly_heatmap_aggregates_duration_and_exp_by_date() -> None:
    session = create_test_session()
    user = User(username="heatmap-player", email="heatmap@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=30,
            bpm=120,
            topic="Dorian alternate picking",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=20,
            bpm=90,
            topic="Warmup chromatic run",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2027, 1, 1),
            duration_minutes=60,
            bpm=180,
            topic="Sweep picking",
        ),
    )

    heatmap = get_yearly_heatmap(session=session, user_id=user.id, year=2026)

    assert heatmap.user_id == user.id
    assert heatmap.year == 2026
    assert len(heatmap.days) == 365
    assert heatmap.days[0].date == "2026-01-01"
    assert heatmap.days[-1].date == "2026-12-31"

    practiced_day = next(day for day in heatmap.days if day.date == "2026-05-29")
    assert practiced_day.duration_minutes == 50
    assert practiced_day.exp == 56


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()
