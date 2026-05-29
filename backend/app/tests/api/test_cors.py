from fastapi.testclient import TestClient

from app.main import app


def test_local_frontend_can_preflight_practice_record_requests() -> None:
    client = TestClient(app)

    response = client.options(
        "/practice-records",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
    assert "POST" in response.headers["access-control-allow-methods"]
