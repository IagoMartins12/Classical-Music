/** "há 3 h" / "3 hours ago", then the date after a month. */
export function relativeTime(value: string | Date, language: 'pt' | 'en') {
  const locale = language === 'pt' ? 'pt-BR' : 'en-US';
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000);
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (minutes < 60) return relative.format(-Math.max(minutes, 0), 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 24) return relative.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 30) return relative.format(-days, 'day');
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
