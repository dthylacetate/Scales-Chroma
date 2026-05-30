from __future__ import annotations


TOPIC_ALIAS_GROUPS: dict[str, tuple[str, ...]] = {
    "pentatonic": ("pentatonic", "五声音阶", "五声", "五声音", "penta"),
    "jazz": ("jazz", "爵士", "ii-v-i", "251", "2-5-1", "二五一", "voice leading", "shell voicing"),
    "metal": ("metal", "金属", "下拨", "down picking", "downpicking", "riff", "palm mute", "闷音", "棕榈制音", "sweep", "速弹"),
    "neo_soul": ("neo soul", "neosoul", "neo-soul", "新灵魂", "neo soul", "maj7", "maj9", "双音", "double stop"),
    "fusion": ("fusion", "融合", "legato", "连奏", "滑音", "outside", "hybrid", "混合拨弦", "fusion interval"),
}


def topic_matches(topic: str, keywords: tuple[str, ...]) -> bool:
    normalized_topic = _normalize_topic(topic)
    expanded_keywords = _expand_keywords(keywords)
    return any(_normalize_topic(keyword) in normalized_topic for keyword in expanded_keywords)


def _expand_keywords(keywords: tuple[str, ...]) -> set[str]:
    expanded = set(keywords)
    normalized_keywords = {_normalize_topic(keyword) for keyword in keywords}

    for aliases in TOPIC_ALIAS_GROUPS.values():
        normalized_aliases = {_normalize_topic(alias) for alias in aliases}
        if normalized_keywords & normalized_aliases:
            expanded.update(aliases)

    return expanded


def _normalize_topic(value: str) -> str:
    return (
        value.casefold()
        .replace(" ", "")
        .replace("-", "")
        .replace("_", "")
        .replace("/", "")
        .replace("－", "")
        .replace("—", "")
        .replace("–", "")
    )
