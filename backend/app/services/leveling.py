EXP_PER_LEVEL = 100


def level_from_total_exp(total_exp: int) -> int:
    return max(1, total_exp // EXP_PER_LEVEL + 1)
