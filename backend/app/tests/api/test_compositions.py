from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base
from app.models.saved_composition import SavedComposition


def test_create_and_list_saved_compositions_for_a_user() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        create_response = client.post(
            "/compositions",
            headers=headers,
            json={
                "name": "Dim tension sketch",
                "elements": [
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                    {"id": "dim7", "type": "chord", "name": "Dim7"},
                ],
            },
        )
        list_response = client.get("/compositions", headers=headers)
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
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        response = client.post(
            "/compositions",
            headers=headers,
            json={"name": "Empty", "elements": []},
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 422


def test_update_saved_composition_replaces_name_and_elements() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        create_response = client.post(
            "/compositions",
            headers=headers,
            json={
                "name": "Old Sketch",
                "elements": [
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                ],
            },
        )
        composition_id = create_response.json()["id"]
        update_response = client.put(
            f"/compositions/{composition_id}",
            headers=headers,
            json={
                "name": "Updated Sketch",
                "elements": [
                    {"id": "dim7", "type": "chord", "name": "Dim7"},
                    {"id": "ii-v-i", "type": "progression", "name": "II-V-I"},
                ],
            },
        )
        list_response = client.get("/compositions", headers=headers)
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["name"] == "Updated Sketch"
    assert updated["elements"][0]["name"] == "Dim7"
    assert updated["elements"][1]["name"] == "II-V-I"

    listed = list_response.json()["compositions"]
    assert len(listed) == 1
    assert listed[0]["id"] == composition_id
    assert listed[0]["name"] == "Updated Sketch"


def test_cannot_update_another_users_composition() -> None:
    session = create_test_session()

    try:
        client, owner_headers = create_authenticated_client(
            session,
            username="owner",
            email="owner@example.com",
        )
        create_response = client.post(
            "/compositions",
            headers=owner_headers,
            json={
                "name": "Owner Sketch",
                "elements": [
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                ],
            },
        )
        composition_id = create_response.json()["id"]
        intruder_response = client.post(
            "/auth/register",
            json={
                "username": "intruder",
                "email": "intruder@example.com",
                "password": "plain-secret",
            },
        )
        intruder_headers = {"Authorization": f"Bearer {intruder_response.json()['token']}"}
        update_response = client.put(
            f"/compositions/{composition_id}",
            headers=intruder_headers,
            json={
                "name": "Intruder Sketch",
                "elements": [
                    {"id": "dim7", "type": "chord", "name": "Dim7"},
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert update_response.status_code == 404


def test_list_compositions_only_returns_current_users_data() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        intruder_response = client.post(
            "/auth/register",
            json={
                "username": "other-user",
                "email": "other-user@example.com",
                "password": "plain-secret",
            },
        )
        other_user_id = intruder_response.json()["user"]["id"]
        session.add(
            SavedComposition(
                user_id=other_user_id,
                name="Other user",
                elements=[{"id": "dim7", "type": "chord", "name": "Dim7"}],
            )
        )
        session.commit()
        response = client.get("/compositions", headers=headers)
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    assert response.json()["compositions"] == []


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def create_authenticated_client(
    session: Session,
    username: str = "player-one",
    email: str = "player@example.com",
    password: str = "plain-secret",
) -> tuple[TestClient, dict[str, str]]:
    def override_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = override_session
    client = TestClient(app)
    response = client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": password,
        },
    )
    token = response.json()["token"]
    return client, {"Authorization": f"Bearer {token}"}
