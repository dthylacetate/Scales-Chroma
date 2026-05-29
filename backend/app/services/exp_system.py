from datetime import date, timedelta


def bpm_multiplier(bpm: int) -> float:
    if bpm <= 0:
        raise ValueError("bpm must be positive")
    if bpm > 160:
        return 1.5
    if bpm >= 100:
        return 1.2
    return 1.0


def streak_multiplier(streak_days: int) -> float:
    if streak_days < 1:
        raise ValueError("streak_days must be at least 1")
    if streak_days >= 30:
        return 2.0
    if streak_days >= 7:
        return 1.3
    if streak_days >= 3:
        return 1.1
    return 1.0


def calculate_exp(duration_minutes: int, bpm: int, streak_days: int) -> int:
    if duration_minutes <= 0:
        raise ValueError("duration_minutes must be positive")

    exp = duration_minutes * bpm_multiplier(bpm) * streak_multiplier(streak_days)
    return int(exp)


def is_consecutive_practice_day(previous_date: date, current_date: date) -> bool:
    return current_date - previous_date == timedelta(days=1)
