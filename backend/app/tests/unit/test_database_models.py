from sqlalchemy.orm import DeclarativeBase

from app.models.base import Base
from app.models.auth_token import AuthToken
from app.models.exp_statistics import ExpStatistics
from app.models.practice_record import PracticeRecord
from app.models.saved_composition import SavedComposition
from app.models.theory_visual_mapping import TheoryVisualMapping
from app.models.unlocked_effect import UnlockedEffect
from app.models.user import User


def test_all_models_share_declarative_base() -> None:
    assert issubclass(Base, DeclarativeBase)


def test_user_model_columns_and_relationships() -> None:
    assert User.__tablename__ == "users"
    assert set(User.__table__.columns.keys()) == {
        "id",
        "username",
        "email",
        "password",
        "created_at",
        "level",
        "total_exp",
    }
    assert "practice_records" in User.__mapper__.relationships
    assert "exp_statistics" in User.__mapper__.relationships
    assert "unlocked_effects" in User.__mapper__.relationships
    assert "saved_compositions" in User.__mapper__.relationships
    assert "auth_tokens" in User.__mapper__.relationships


def test_practice_record_model_columns() -> None:
    assert PracticeRecord.__tablename__ == "practice_records"
    assert set(PracticeRecord.__table__.columns.keys()) == {
        "id",
        "user_id",
        "practice_date",
        "duration_minutes",
        "bpm",
        "topic",
        "notes",
        "created_at",
    }


def test_exp_statistics_model_columns() -> None:
    assert ExpStatistics.__tablename__ == "exp_statistics"
    assert set(ExpStatistics.__table__.columns.keys()) == {
        "id",
        "user_id",
        "total_exp",
        "current_streak",
        "longest_streak",
        "updated_at",
    }


def test_visual_mapping_and_unlock_models_columns() -> None:
    assert TheoryVisualMapping.__tablename__ == "theory_visual_mapping"
    assert set(TheoryVisualMapping.__table__.columns.keys()) == {
        "id",
        "theory_type",
        "theory_name",
        "tension_level",
        "color_hex",
        "visual_effect",
        "particle_density",
    }

    assert UnlockedEffect.__tablename__ == "unlocked_effects"
    assert set(UnlockedEffect.__table__.columns.keys()) == {
        "id",
        "user_id",
        "effect_name",
        "unlocked_at",
        "trigger_condition",
    }

    assert SavedComposition.__tablename__ == "saved_compositions"
    assert set(SavedComposition.__table__.columns.keys()) == {
        "id",
        "user_id",
        "name",
        "elements",
        "created_at",
    }

    assert AuthToken.__tablename__ == "auth_tokens"
    assert set(AuthToken.__table__.columns.keys()) == {
        "id",
        "user_id",
        "token",
        "created_at",
    }
