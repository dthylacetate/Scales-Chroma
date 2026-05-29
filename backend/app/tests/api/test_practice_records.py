from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base


def test_create_practice_record_returns_exp_reward() -> None:
    client = TestClient(app)

    response = client.post(
        "/practice-records",
        json={
            "user_id": 1,
            "practice_date": "2026-05-29",
            "duration_minutes": 30,
            "bpm": 120,
            "topic": "Dorian alternate picking",
            "notes": "Clean sixteenth-note bursts",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["user_id"] == 1
    assert payload["topic"] == "Dorian alternate picking"
    assert payload["exp_earned"] == 36
    assert payload["total_exp"] >= 36
    assert payload["level"] >= 1
    assert payload["unlocked_effects"] == []


def test_create_practice_record_returns_new_unlocks_for_visual_growth() -> None:
    session = create_test_session()

    def override_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = override_session

    try:
        client = TestClient(app)
        response = client.post(
            "/practice-records",
            json={
                "user_id": 1701,
                "practice_date": "2026-05-29",
                "duration_minutes": 610,
                "bpm": 150,
                "topic": "Pentatonic speed run",
                "notes": None,
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 201
    assert sorted(response.json()["unlocked_effects"]) == ["dynamic_ripple", "neon_glow", "particle_trail"]


def test_create_practice_record_rejects_missing_required_fields() -> None:
    client = TestClient(app)

    response = client.post(
        "/practice-records",
        json={
            "user_id": 1,
            "practice_date": "2026-05-29",
            "bpm": 120,
            "topic": "Dorian alternate picking",
        },
    )

    assert response.status_code == 422


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()
