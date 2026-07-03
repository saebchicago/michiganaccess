from mi_state.common import fips


def test_registry_has_83_counties():
    assert len(fips._registry()) == 83
    assert len(fips.all_fips()) == 83


def test_lookup_bare_name():
    assert fips.lookup("Wayne") == "26163"
    assert fips.lookup("Kent") == "26081"


def test_lookup_with_county_suffix():
    assert fips.lookup("Wayne County") == "26163"
    assert fips.lookup("Kent County ") == "26081"       # trailing whitespace
    assert fips.lookup("crawford county") == "26039"    # case insensitive


def test_lookup_alias_saint_clair():
    assert fips.lookup("Saint Clair County") == "26147"
    assert fips.lookup("Saint Joseph") == "26149"


def test_lookup_unknown():
    assert fips.lookup(None) is None
    assert fips.lookup("") is None
    assert fips.lookup("Nonesuch") is None


def test_lookup_all_multi_county_and():
    assert fips.lookup_all("Wayne and Washtenaw County") == ["26163", "26161"]


def test_lookup_all_multi_county_ampersand():
    assert fips.lookup_all("Oceana & Newaygo County") == ["26127", "26123"]


def test_lookup_all_multi_county_comma():
    assert fips.lookup_all("Crawford, Otsego Counties") == ["26039", "26137"]


def test_lookup_all_single_returns_one():
    assert fips.lookup_all("Wayne County") == ["26163"]


def test_lookup_all_none_or_empty():
    assert fips.lookup_all(None) == []
    assert fips.lookup_all("") == []
