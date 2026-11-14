/**
 * Single source for the ACS 5-year vintage that live-API callers request.
 * ACS5_YEAR is the end year used in the API path
 * (api.census.gov/data/{ACS5_YEAR}/acs/acs5); ACS5_PERIOD is the label.
 * Static datasets carry their own true period, written as a range.
 */
export const ACS5_PERIOD = "2020-2024";
export const ACS5_YEAR = 2024;
/** Display label, always a range, never a single year. */
export const ACS5_LABEL = `ACS 5-year ${ACS5_PERIOD}`;
