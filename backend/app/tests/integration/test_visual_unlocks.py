from datetime import date

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import Base
from app.models.unlocked_effect import UnlockedEffect
from app.models.user import User
from app.schemas.practice_record import PracticeRecordCreate
from app.services.practice_records import create_practice_record


def test_pentatonic_practice_unlocks_visual_effects_after_ten_hours() -> None:
    session = create_test_session()
    user = User(username="visual-player", email="visual@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=420,
            bpm=140,
            topic="Pentatonic alternate picking",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 30),
            duration_minutes=190,
            bpm=150,
            topic="五声音阶速弹",
        ),
    )

    effects = session.scalars(select(UnlockedEffect).where(UnlockedEffect.user_id == user.id)).all()
    effect_names = {effect.effect_name for effect in effects}

    assert {"particle_trail", "neon_glow", "dynamic_ripple"} <= effect_names
    assert all("五声音阶" in effect.trigger_condition for effect in effects)


def test_visual_unlocks_are_not_duplicated_after_more_qualified_practice() -> None:
    session = create_test_session()
    user = User(username="visual-repeat-player", email="visual-repeat@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=610,
            bpm=150,
            topic="Pentatonic speed run",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 5, 31),
            duration_minutes=90,
            bpm=160,
            topic="Pentatonic legato cleanup",
        ),
    )

    effects = session.scalars(select(UnlockedEffect).where(UnlockedEffect.user_id == user.id)).all()
    effect_names = [effect.effect_name for effect in effects]

    assert sorted(effect_names) == ["dynamic_ripple", "neon_glow", "particle_trail"]


def test_jazz_ii_v_i_practice_unlocks_harmonic_lattice_after_five_hours() -> None:
    session = create_test_session()
    user = User(username="jazz-visual-player", email="jazz-visual@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 6, 1),
            duration_minutes=180,
            bpm=120,
            topic="II-V-I jazz voice leading",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 6, 2),
            duration_minutes=130,
            bpm=132,
            topic="251 shell voicings",
        ),
    )

    effects = session.scalars(select(UnlockedEffect).where(UnlockedEffect.user_id == user.id)).all()
    effect_names = {effect.effect_name for effect in effects}

    assert "harmonic_lattice" in effect_names
    assert any("II-V-I" in effect.trigger_condition for effect in effects)


def test_metal_and_neo_soul_practice_unlock_distinct_visual_rewards() -> None:
    session = create_test_session()
    user = User(username="style-visual-player", email="style-visual@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 6, 3),
            duration_minutes=320,
            bpm=170,
            topic="Sweep Picking metal burst",
        ),
    )
    create_practice_record(
        session=session,
        user_id=user.id,
        payload=PracticeRecordCreate(
            practice_date=date(2026, 6, 4),
            duration_minutes=250,
            bpm=96,
            topic="Maj7 Neo Soul voicings",
        ),
    )

    effects = session.scalars(select(UnlockedEffect).where(UnlockedEffect.user_id == user.id)).all()
    effect_names = {effect.effect_name for effect in effects}

    assert {"fracture_burst", "velvet_glow"} <= effect_names


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()
