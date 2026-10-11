/**
 * Lists arrive as lists, as "A, B; C" text or as null, depending on where
 * the record came from (thousands of imported composers carry text).
 */
export function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string') {
    return value
      .split(/[;,|]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}
