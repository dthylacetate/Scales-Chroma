from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app


def test_serves_built_frontend_from_backend_root(tmp_path: Path) -> None:
    (tmp_path / "index.html").write_text(
        "<!doctype html><html><body><div id='root'>Scales & Chroma</div></body></html>",
        encoding="utf-8",
    )

    client = TestClient(create_app(frontend_dist_dir=tmp_path))
    response = client.get("/")

    assert response.status_code == 200
    assert "Scales & Chroma" in response.text
