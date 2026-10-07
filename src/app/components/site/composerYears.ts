/** The year in a stored date: "16 December 1770", "1770-12-16" or "c. 1770". */
const yearOf = (date: string | null | undefined) =>
  date?.match(/\b(\d{3,4})\b/)?.[1];

/** "1810–1849", "n. 1932" (b. 1932) or "". */
export function composerYears(
  birth: string | null | undefined,
  death: string | null | undefined,
  bornLabel: string
) {
  const from = yearOf(birth);
  const to = yearOf(death);
  if (from && to) return `${from}–${to}`;
  if (from) return `${bornLabel} ${from}`;
  return '';
}
