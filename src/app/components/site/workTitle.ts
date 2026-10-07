/**
 * "Ballade No.1, Op.23" from a title and its catalog number. Many titles
 * already carry the number (IMSLP style), so it is only appended when missing.
 */
export function workTitle(title: string, catalog?: string | null) {
  if (!catalog) return title;
  const normalize = (s: string) => s.toLowerCase().replace(/[\s.]/g, '');
  return normalize(title).includes(normalize(catalog))
    ? title
    : `${title}, ${catalog}`;
}
