from datetime import date

import pytest

from app.services.exp_system import calculate_exp, streak_multiplier


@pytest.mark.parametrize(
    ("duration_minutes", "bpm", "streak_days", "expected_exp"),
    [
        (30, 90, 1, 30),
        (30, 120, 1, 36),
        (30, 180, 1, 45),
        (30, 120, 7, 46),
        (30, 180, 30, 90),
    ],
)
def test_calculate_exp_uses_bpm_and_streak_weights(
    duration_minutes: int,
    bpm: int,
    streak_days: int,
    expected_exp: int,
) -> None:
    assert calculate_exp(duration_minutes, bpm, streak_days) == expected_exp


@pytest.mark.parametrize(
    ("duration_minutes", "bpm", "streak_days"),
    [
        (-1, 120, 1),
        (30, -120, 1),
        (30, 120, -1),
        (0, 120, 1),
    ],
)
def test_calculate_exp_rejects_invalid_inputs(
    duration_minutes: int,
    bpm: int,
    streak_days: int,
) -> None:
    with pytest.raises(ValueError):
        calculate_exp(duration_minutes, bpm, streak_days)


@pytest.mark.parametrize(
    ("streak_days", "expected_multiplier"),
    [
        (1, 1.0),
        (3, 1.1),
        (7, 1.3),
        (30, 2.0),
    ],
)
def test_streak_multiplier_thresholds(streak_days: int, expected_multiplier: float) -> None:
    assert streak_multiplier(streak_days) == expected_multiplier


def test_streak_logic_must_support_leap_day_boundaries() -> None:
    from app.services.exp_system import is_consecutive_practice_day

    assert is_consecutive_practice_day(date(2024, 2, 28), date(2024, 2, 29))
    assert is_consecutive_practice_day(date(2024, 2, 29), date(2024, 3, 1))
