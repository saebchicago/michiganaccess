import pytest

from mi_state.common.integrity import IntegrityLabel, Provenance


CFG = {
    "source_org": "EGLE",
    "source_url": "https://example.org",
    "access": "public_api",
    "api_endpoint": "https://example.org/rest",
    "integrity_default": "VERIFIED",
}


def test_stamp_defaults_to_manifest_label():
    p = Provenance.stamp(
        dataset_id="x", cfg=CFG, publisher_vintage="2026-06", row_count=10,
    )
    assert p.integrity is IntegrityLabel.VERIFIED
    d = p.to_dict()
    assert d["integrity"] == "VERIFIED"          # enum serializes to str
    assert d["dataset_id"] == "x"
    assert d["row_count"] == 10
    assert d["source_org"] == "EGLE"
    assert d["fetched_at"].endswith("+00:00")     # UTC ISO


def test_stamp_pending_override():
    p = Provenance.stamp(
        dataset_id="x", cfg=CFG, publisher_vintage=None, row_count=0,
        integrity="PENDING", notes="fetch failed",
    )
    assert p.integrity is IntegrityLabel.PENDING
    assert p.to_dict()["notes"] == "fetch failed"


def test_stamp_rejects_unknown_label():
    with pytest.raises(ValueError):
        Provenance.stamp(
            dataset_id="x", cfg=CFG, publisher_vintage=None, row_count=0,
            integrity="BOGUS",
        )
