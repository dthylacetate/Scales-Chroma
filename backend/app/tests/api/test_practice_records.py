from collections.abc import Generator
from datetime import date

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base
from app.models.practice_record import PracticeRecord


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
    assert payload["current_streak"] >= 1
    assert payload["longest_streak"] >= payload["current_streak"]
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


def test_list_practice_records_returns_recent_records_for_user() -> None:
    session = create_test_session()
    session.add_all(
        [
            PracticeRecord(
                user_id=77,
                practice_date=date(2026, 5, 28),
                duration_minutes=20,
                bpm=120,
                topic="Dorian phrasing",
            ),
            PracticeRecord(
                user_id=77,
                practice_date=date(2026, 5, 29),
                duration_minutes=45,
                bpm=150,
                topic="Pentatonic speed run",
            ),
            PracticeRecord(
                user_id=88,
                practice_date=date(2026, 5, 29),
                duration_minutes=60,
                bpm=180,
                topic="Sweep picking",
            ),
        ]
    )
    session.commit()

    def override_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = override_session

    try:
        client = TestClient(app)
        response = client.get("/practice-records", params={"user_id": 77, "limit": 1})
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["records"]) == 1
    assert payload["records"][0]["topic"] == "Pentatonic speed run"


def test_list_practice_records_filters_by_topic_and_date_range() -> None:
    session = create_test_session()
    session.add_all(
        [
            PracticeRecord(
                user_id=77,
                practice_date=date(2026, 5, 27),
                duration_minutes=20,
                bpm=118,
                topic="Jazz warmup",
            ),
            PracticeRecord(
                user_id=77,
                practice_date=date(2026, 5, 28),
                duration_minutes=45,
                bpm=128,
                topic="II-V-I jazz voice leading",
            ),
            PracticeRecord(
                user_id=77,
                practice_date=date(2026, 5, 29),
                duration_minutes=30,
                bpm=150,
                topic="Pentatonic speed run",
            ),
        ]
    )
    session.commit()

    def override_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = override_session

    try:
        client = TestClient(app)
        response = client.get(
            "/practice-records",
            params={
                "user_id": 77,
                "topic": "jazz",
                "date_from": "2026-05-28",
                "date_to": "2026-05-29",
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert [record["topic"] for record in payload["records"]] == ["II-V-I jazz voice leading"]


def test_practice_records_require_authentication() -> None:
    client = TestClient(app)

    response = client.get("/practice-records")

    assert response.status_code == 401


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()
