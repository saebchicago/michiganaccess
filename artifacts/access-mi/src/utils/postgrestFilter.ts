/**
 * Sanitizes user text before it is interpolated into a PostgREST `.or()` filter
 * string.
 *
 * PostgREST parses the `.or()` argument as a comma-separated list of
 * `column.operator.value` clauses, so raw user input containing commas, periods,
 * parentheses, or quotes can inject or override filter clauses the developer
 * never intended (for example dropping an `is_active` restriction). Stripping the
 * structurally significant characters keeps the value a plain substring match.
 *
 * Also caps length so a pathological query cannot build a huge filter string.
 */
export function sanitizeOrFilterValue(input: string, maxLength = 60): string {
  return input
    .replace(/[,().*"'\\%]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** True when the sanitized value still has enough signal to search on. */
export function isUsableSearchValue(value: string): boolean {
  return value.length >= 2;
}
