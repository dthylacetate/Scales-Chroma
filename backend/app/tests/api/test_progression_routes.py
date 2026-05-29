from fastapi.testclient import TestClient

from app.main import app


def test_yearly_heatmap_returns_year_and_daily_entries() -> None:
    client = TestClient(app)

    response = client.get("/heatmap/yearly", params={"user_id": 1, "year": 2026})

    assert response.status_code == 200
    payload = response.json()
    assert payload["user_id"] == 1
    assert payload["year"] == 2026
    assert isinstance(payload["days"], list)


def test_skill_tree_returns_music_direction_nodes() -> None:
    client = TestClient(app)

    response = client.get("/skill-tree", params={"user_id": 1})

    assert response.status_code == 200
    payload = response.json()
    directions = {branch["direction"] for branch in payload["branches"]}
    assert directions == {"Metal", "Jazz", "Fusion", "Neo Soul"}
