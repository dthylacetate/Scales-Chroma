from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base
from app.models.unlocked_effect import UnlockedEffect


def test_yearly_heatmap_returns_year_and_daily_entries() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        response = client.get("/heatmap/yearly", headers=headers, params={"year": 2026})
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["user_id"] == 1
    assert payload["year"] == 2026
    assert isinstance(payload["days"], list)


def test_skill_tree_returns_music_direction_nodes() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        response = client.get("/skill-tree", headers=headers)
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    directions = {branch["direction"] for branch in payload["branches"]}
    assert directions == {"Metal", "Jazz", "Fusion", "Neo Soul"}


def test_unlocked_effects_returns_user_visual_rewards() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="effect-player",
            email="effect@example.com",
        )
        session.add_all(
            [
                UnlockedEffect(
                    user_id=1,
                    effect_name="particle_trail",
                    trigger_condition="五声音阶累计练习达到 10 小时",
                ),
                UnlockedEffect(
                    user_id=1,
                    effect_name="dynamic_ripple",
                    trigger_condition="五声音阶累计练习达到 10 小时",
                ),
            ]
        )
        session.commit()
        response = client.get("/unlocked-effects", headers=headers)
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["user_id"] == 1
    assert payload["effects"][0]["effect_name"] == "dynamic_ripple"
    assert payload["effects"][0]["trigger_condition"] == "五声音阶累计练习达到 10 小时"


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
