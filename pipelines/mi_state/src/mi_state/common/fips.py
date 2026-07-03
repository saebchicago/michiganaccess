"""MI county FIPS registry, parsed from the TS SSOT at import time.

The 83-county partition is authoritative in
artifacts/access-mi/src/data/census-geographies.ts. Duplicating the table
here would create two SSOTs; instead we read the TS file once so any
edit to the registry propagates to Python without a code change.
"""
import re
from functools import lru_cache

from .paths import FIPS_TS_PATH

MI_STATE_FIPS = "26"

# Publisher spellings that differ from the TS SSOT. Add here rather than
# in the TS registry - the TS names are what the React app displays.
_ALIASES = {
    "saint clair": "St. Clair",
    "saint joseph": "St. Joseph",
    "grand traverse ": "Grand Traverse",
    "van buren ": "Van Buren",
    "presque isle ": "Presque Isle",
}

_ENTRY = re.compile(r'(?:"([^"]+)"|(\b[A-Z][\w. ]*))\s*:\s*"(\d{3})"')


@lru_cache(maxsize=1)
def _registry() -> dict[str, str]:
    src = FIPS_TS_PATH.read_text(encoding="utf-8")
    start = src.index("MI_COUNTY_FIPS")
    body = src[src.index("{", start) + 1 : src.index("}", start)]
    out: dict[str, str] = {}
    for m in _ENTRY.finditer(body):
        name = (m.group(1) or m.group(2)).strip()
        out[name] = MI_STATE_FIPS + m.group(3)
    if len(out) != 83:
        raise RuntimeError(f"expected 83 MI counties in TS SSOT, got {len(out)}")
    return out


def all_fips() -> set[str]:
    return set(_registry().values())


def _canonical(n: str) -> str:
    n = n.strip()
    low = n.lower()
    if low.endswith(" county"):
        n = n[:-7].strip()
        low = n.lower()
    if low.endswith(" counties"):
        n = n[:-9].strip()
        low = n.lower()
    return _ALIASES.get(low, n)


def lookup(county_name: str | None) -> str | None:
    """Normalize a single county string to a 5-char FIPS or None."""
    if not county_name:
        return None
    n = _canonical(county_name)
    reg = _registry()
    if n in reg:
        return reg[n]
    return {k.lower(): v for k, v in reg.items()}.get(n.lower())


def lookup_all(county_field: str | None) -> list[str]:
    """Extract every FIPS mentioned in a possibly-multi-county string.

    Handles publisher patterns like 'Wayne and Washtenaw County',
    'Oceana & Newaygo County', 'Crawford, Otsego Counties'. Returns a
    de-duplicated list preserving publisher order.
    """
    if not county_field:
        return []
    parts = re.split(r"\s*(?:,|&|\band\b)\s*", county_field, flags=re.IGNORECASE)
    seen: list[str] = []
    for part in parts:
        fips = lookup(part)
        if fips and fips not in seen:
            seen.append(fips)
    return seen
