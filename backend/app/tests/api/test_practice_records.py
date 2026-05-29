from fastapi.testclient import TestClient

from app.main import app


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
