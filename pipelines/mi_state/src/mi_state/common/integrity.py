"""Provenance + integrity labels.

Mirrors the four labels used by the React IntegrityBadge component so the
Python data plane and the UI use identical vocabulary.
"""
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from enum import Enum


class IntegrityLabel(str, Enum):
    VERIFIED  = "VERIFIED"    # direct publisher value, no aggregation
    MODELED   = "MODELED"     # publisher-modeled small-area estimate
    PROJECTED = "PROJECTED"   # forecast, not observation
    PENDING   = "PENDING"     # ingest failed, no value shipped


@dataclass
class Provenance:
    dataset_id: str
    source_org: str
    source_url: str
    access_mechanism: str
    api_endpoint: str | None
    fetched_at: str
    publisher_vintage: str | None
    integrity: IntegrityLabel
    row_count: int
    notes: str | None = None

    @classmethod
    def stamp(
        cls,
        *,
        dataset_id: str,
        cfg: dict,
        publisher_vintage: str | None,
        row_count: int,
        integrity: str | None = None,
        notes: str | None = None,
    ) -> "Provenance":
        return cls(
            dataset_id=dataset_id,
            source_org=cfg["source_org"],
            source_url=cfg["source_url"],
            access_mechanism=cfg["access"],
            api_endpoint=cfg.get("api_endpoint"),
            fetched_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
            publisher_vintage=publisher_vintage,
            integrity=IntegrityLabel(integrity or cfg["integrity_default"]),
            row_count=row_count,
            notes=notes,
        )

    def to_dict(self) -> dict:
        d = asdict(self)
        d["integrity"] = self.integrity.value
        return d
