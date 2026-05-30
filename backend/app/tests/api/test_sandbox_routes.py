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
    assert payload["synergy_resonance"] > 0.5
    assert payload["blend_cohesion"] > 0.45
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


def test_sandbox_render_returns_scene_cascade_for_rich_three_part_stacks() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="cascade-player",
            email="cascade@example.com",
        )
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "lydian", "type": "mode", "name": "Lydian"},
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                    {"id": "ii-v-i", "type": "progression", "name": "II-V-I"},
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["signature"] == "Aurora Choir"
    assert payload["scene_cascade"] == "aurora-dais"
    assert payload["scene_cascade_intensity"] > 0.9
    assert payload["depth"] > 0.8
    assert payload["beam_strength"] > 0.7
    assert "Horizon Bloom" in payload["active_synergies"]


def test_sandbox_render_supports_non_persistent_growth_preview() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="preview-player",
            email="preview@example.com",
        )
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "lydian", "type": "mode", "name": "Lydian"},
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                    {"id": "ii-v-i", "type": "progression", "name": "II-V-I"},
                ],
                "preview_growth_imprint": "neo-soul-veil",
            },
        )
        unlocked_effect_count = session.query(UnlockedEffect).count()
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["growth_imprint"] == "neo-soul-veil"
    assert payload["growth_imprint_intensity"] >= 0.88
    assert payload["scene_cascade"] == "aurora-dais"
    assert "Silken Halo" in payload["active_bonuses"]
    assert unlocked_effect_count == 0


def test_sandbox_render_returns_growth_rewritten_phrase_variations() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="variation-player",
            email="variation@example.com",
        )
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "lydian", "type": "mode", "name": "Lydian"},
                    {"id": "maj7", "type": "chord", "name": "Maj7"},
                    {"id": "ii-v-i", "type": "progression", "name": "II-V-I"},
                ],
                "preview_growth_imprint": "jazz-lattice",
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["phrase_trajectory"] == "lift-arc"
    assert payload["phrase_variation"] == "choir-step"
    assert payload["phrase_variation_intensity"] > 0.8
    assert "Choir Step" in payload["active_bonuses"]


def test_sandbox_render_returns_phrase_trajectory_for_order_sensitive_stacks() -> None:
    session = create_test_session()

    try:
        client, headers = create_authenticated_client(
            session,
            username="trajectory-player",
            email="trajectory@example.com",
        )
        response = client.post(
            "/sandbox/render",
            headers=headers,
            json={
                "elements": [
                    {"id": "pentatonic", "type": "scale", "name": "Pentatonic"},
                    {"id": "mixolydian", "type": "mode", "name": "Mixolydian"},
                    {"id": "dominant7", "type": "chord", "name": "Dominant7"},
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()
        session.close()

    assert response.status_code == 200
    payload = response.json()
    assert payload["phrase_trajectory"] == "runway-drive"
    assert payload["phrase_trajectory_intensity"] > 0.75
    assert "Runway Spark" in payload["phrase_hooks"]
    assert payload["phrase_hook_energy"] > 0.45
    assert payload["motion_speed"] > 0.8


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
