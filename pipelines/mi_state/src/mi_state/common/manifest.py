from functools import lru_cache

import yaml

from .paths import MANIFEST


@lru_cache(maxsize=1)
def _load() -> dict:
    return yaml.safe_load(MANIFEST.read_text(encoding="utf-8"))


def get(dataset_id: str) -> dict:
    cfg = _load()["datasets"].get(dataset_id)
    if cfg is None:
        raise KeyError(f"dataset '{dataset_id}' not in manifest.yaml")
    return cfg


def all_dataset_ids() -> list[str]:
    return list(_load()["datasets"].keys())
