"""MDE MISchoolData - chronic absenteeism by district.

Not yet implemented. MISchoolData exposes bulk CSV downloads at
https://www.mischooldata.org/bulk-downloads/. Next step:

  1. Register for an MDE data key if bulk downloads require it (they did
     as of the last check).
  2. Pull the chronic absenteeism file for the latest school year.
  3. Roll district -> county via the ISD/district crosswalk, weight by
     enrollment.
  4. Normalize to [county_fips, school_year, chronic_absent_pct,
     enrollment].

Integrity label VERIFIED for district-grain rows; the county rollup is
enrollment-weighted so remains VERIFIED (loss-free aggregation).
"""
from pathlib import Path


def refresh() -> Path:
    raise NotImplementedError(
        "MDE absenteeism fetcher pending: bulk CSV + district->county rollup."
    )
