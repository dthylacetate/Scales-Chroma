from fastapi.testclient import TestClient

from app.main import app


def test_sandbox_render_maps_theory_elements_to_visual_parameters() -> None:
    client = TestClient(app)

    response = client.post(
        "/sandbox/render",
        json={
            "elements": [
                {"id": "c-maj7", "type": "chord", "name": "Maj7"},
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["color"].startswith("#")
    assert payload["glow"] > 0.7
    assert payload["geometry"] == "soft-orb"
    assert payload["animation_state"] == "flowing"


def test_sandbox_render_rejects_empty_theory_elements() -> None:
    client = TestClient(app)

    response = client.post("/sandbox/render", json={"elements": []})

    assert response.status_code == 422
