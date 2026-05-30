from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base
from app.models.unlocked_effect import UnlockedEffect


def test_sandbox_render_maps_theory_elements_to_visual_parameters() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "c-maj7", "type": "chord", "name": "Maj7"},
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["color"].startswith("#")
    assert payload["secondary_color"].startswith("#")
    assert payload["background_color"].startswith("#")
    assert payload["glow"] > 0.7
    assert payload["geometry"] == "soft-orb"
    assert payload["animation_state"] == "flowing"
    assert payload["signature"] == "Maj7"
    assert payload["scene_family"] == "solar-garden"
    assert payload["valence"] > 0.75
    assert payload["luminosity"] > 0.7
    assert payload["grit"] < 0.2
    assert payload["openness"] > 0.7
    assert payload["attack"] < 0.5
    assert payload["ring_count"] >= 2


def test_sandbox_render_rejects_empty_theory_elements() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(session)
        response = client.post("/sandbox/render", headers=headers, json={"elements": []})
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 422


def test_sandbox_render_applies_user_unlocked_effects() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="sandbox-player",
            email="sandbox@example.com",
        )
        session.add(
            UnlockedEffect(
                user_id=1,
                effect_name="particle_trail",
                trigger_condition="五声音阶累计练习达到 10 小时",
            )
        )
        session.commit()
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "a-minor-penta", "type": "scale", "name": "Pentatonic"},
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    assert response.json()["particles"]["trail"] is True


def test_sandbox_render_returns_combo_bonus_metadata_for_valid_compositions() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="combo-player",
            email="combo@example.com",
        )
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "lydian", "type": "mode", "name": "Lydian"},
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["signature"] == "Celestial Bloom"
    assert payload["scene_family"] == "solar-garden"
    assert "Celestial Bloom" in payload["active_bonuses"]
    assert payload["beam_strength"] > 0.5
    assert payload["valence"] > 0.9
    assert payload["luminosity"] > 0.9


def test_sandbox_render_returns_growth_aura_metadata_for_unlocked_style_tracks() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="growth-aura-player",
            email="growth-aura@example.com",
        )
        session.add_all(
            [
                UnlockedEffect(user_id=1, effect_name="velvet_glow", trigger_condition="Maj7 / Neo Soul 累计练习达到 4 小时"),
                UnlockedEffect(user_id=1, effect_name="silk_motion", trigger_condition="Maj7 / Neo Soul 累计练习达到 4 小时"),
            ]
        )
        session.commit()
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert "Velvet Tide" in payload["active_bonuses"]
    assert payload["scene_family"] == "velvet-chamber"
    assert payload["secondary_color"] == "#ff9fc9"
    assert payload["glow"] > 0.9
    assert payload["grit"] < 0.15
    assert payload["growth_imprint"] == "neo-soul-veil"
    assert payload["growth_imprint_intensity"] > 0.9


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
