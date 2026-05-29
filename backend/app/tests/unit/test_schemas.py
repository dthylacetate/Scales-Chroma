from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.practice_record import PracticeRecordCreate
from app.schemas.sandbox import SandboxRenderRequest
from app.schemas.theory import TheoryElement
from app.schemas.user import UserCreate


def test_user_create_requires_valid_identity_fields() -> None:
    user = UserCreate(username="player-one", email="player@example.com", password="plain-secret")

    assert user.username == "player-one"
    assert user.email == "player@example.com"
    assert user.password == "plain-secret"


def test_user_create_rejects_empty_username() -> None:
    with pytest.raises(ValidationError):
        UserCreate(username="", email="player@example.com", password="plain-secret")


def test_practice_record_create_validates_positive_duration_and_bpm() -> None:
    record = PracticeRecordCreate(
        practice_date=date(2026, 5, 29),
        duration_minutes=45,
        bpm=140,
        topic="Dorian alternate picking",
        notes="Clean sixteenth-note bursts",
    )

    assert record.duration_minutes == 45
    assert record.bpm == 140


@pytest.mark.parametrize(
    ("duration_minutes", "bpm"),
    [
        (0, 120),
        (-10, 120),
        (30, 0),
        (30, -160),
    ],
)
def test_practice_record_create_rejects_invalid_practice_numbers(
    duration_minutes: int,
    bpm: int,
) -> None:
    with pytest.raises(ValidationError):
        PracticeRecordCreate(
            practice_date=date(2026, 5, 29),
            duration_minutes=duration_minutes,
            bpm=bpm,
            topic="Pentatonic speed run",
        )


def test_sandbox_render_request_requires_at_least_one_theory_element() -> None:
    element = TheoryElement(id="c-maj7", type="chord", name="Maj7")
    request = SandboxRenderRequest(elements=[element])

    assert request.elements[0].name == "Maj7"


def test_sandbox_render_request_rejects_empty_elements() -> None:
    with pytest.raises(ValidationError):
        SandboxRenderRequest(elements=[])
