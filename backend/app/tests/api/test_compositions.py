from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base


def test_create_and_list_saved_compositions_for_a_user() -> None:
    session = create_test_session()

    def override_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = override_session

    try:
        client = TestClient(app)
        create_response = client.post(
            "/compositions",
            json={
                "user_id": 77,
                "name": "Dim tension sketch",
                "elements": [
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                    {"id": "dim7", "type": "chord", "name": "Dim7"},
                ],
            },
        )
        list_response = client.get("/compositions", params={"user_id": 77})
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["name"] == "Dim tension sketch"
    assert created["elements"][1]["name"] == "Dim7"

    assert list_response.status_code == 200
    compositions = list_response.json()["compositions"]
    assert len(compositions) == 1
    assert compositions[0]["id"] == created["id"]
    assert compositions[0]["elements"][0]["name"] == "Maj7"


def test_create_saved_composition_rejects_empty_elements() -> None:
    client = TestClient(app)

    response = client.post(
        "/compositions",
        json={"user_id": 77, "name": "Empty", "elements": []},
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
