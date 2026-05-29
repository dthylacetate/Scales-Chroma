from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base


def test_register_login_me_and_logout_flow() -> None:
    session = create_test_session()

    def override_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = override_session

    try:
        client = TestClient(app)
        register_response = client.post(
            "/auth/register",
            json={
                "username": "player-one",
                "email": "player@example.com",
                "password": "plain-secret",
            },
        )
        token = register_response.json()["token"]
        me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        logout_response = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
        after_logout_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert register_response.status_code == 201
    payload = register_response.json()
    assert payload["user"]["username"] == "player-one"
    assert payload["token"]

    assert me_response.status_code == 200
    assert me_response.json()["username"] == "player-one"

    assert logout_response.status_code == 200
    assert logout_response.json()["status"] == "ok"

    assert after_logout_response.status_code == 401


def test_login_rejects_invalid_password() -> None:
    session = create_test_session()

    def override_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = override_session

    try:
        client = TestClient(app)
        client.post(
            "/auth/register",
            json={
                "username": "player-two",
                "email": "player-two@example.com",
                "password": "plain-secret",
            },
        )
        login_response = client.post(
            "/auth/login",
            json={
                "username": "player-two",
                "password": "wrong-secret",
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert login_response.status_code == 401


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()
