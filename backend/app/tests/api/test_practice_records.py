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
    assert payload["total_exp"] >= 36
    assert payload["level"] >= 1
    assert payload["unlocked_effects"] == []


def test_create_practice_record_returns_new_unlocks_for_visual_growth() -> None:
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
