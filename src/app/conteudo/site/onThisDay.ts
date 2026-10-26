import type { Idioma } from '../legal/tipos';

/** Copy and calendar helpers for "born on a day like today". */
const pt = {
  menuTitle: 'Nasceu num dia como hoje',
  title: (date: string) => date,
  today: 'Hoje',
  text: 'Quem nasceu e quem morreu neste dia, entre os compositores do Opus Atlas.',
  born: 'Nasceram',
  died: 'Morreram',
  bornIn: (year: number) => `Nasceu em ${year}`,
  diedIn: (year: number) => `Morreu em ${year}`,
  aged: (n: number) => `aos ${n} anos`,
  otherDays: 'Outros dias',
  pick: 'Escolher um dia',
  prevMonth: 'Mês anterior',
  nextMonth: 'Próximo mês',
  goToday: 'Ir para hoje',
  nobodyBorn:
    'Nenhum compositor do acervo nasceu neste dia, que a gente saiba.',
  nobodyDied:
    'Nenhum compositor do acervo morreu neste dia, que a gente saiba.',
  callout: (name: string, year: number) =>
    `${name} nasceu num dia como hoje, em ${year}.`,
  calloutMore: 'Ver quem mais faz data hoje',
  menuEntry: 'Quem faz aniversário hoje',
  menuDetail: (name: string, year: number) =>
    `${name} nasceu num dia como hoje, em ${year}`,
  menuFallback: 'Quem nasceu e quem morreu em cada dia',
  metaTitle: (date: string) => `Compositores nascidos em ${date}`,
  metaDescription: (date: string) =>
    `Os compositores de música erudita que nasceram e que morreram em ${date}, com retratos, épocas e obras.`,
};

const en: typeof pt = {
  menuTitle: 'Born on a day like today',
  title: (date: string) => date,
  today: 'Today',
  text: 'Who was born and who died on this day, among the composers on Opus Atlas.',
  born: 'Born',
  died: 'Died',
  bornIn: (year: number) => `Born in ${year}`,
  diedIn: (year: number) => `Died in ${year}`,
  aged: (n: number) => `aged ${n}`,
  otherDays: 'Other days',
  pick: 'Pick a day',
  prevMonth: 'Previous month',
  nextMonth: 'Next month',
  goToday: 'Go to today',
  nobodyBorn:
    'No composer in the archive was born on this day, as far as we know.',
  nobodyDied: 'No composer in the archive died on this day, as far as we know.',
  callout: (name: string, year: number) =>
    `${name} was born on a day like today, in ${year}.`,
  calloutMore: 'See who else has a date today',
  menuEntry: 'Born on this day',
  menuDetail: (name: string, year: number) =>
    `${name} was born on a day like today, in ${year}`,
  menuFallback: 'Who was born and who died on each day',
  metaTitle: (date: string) => `Composers born on ${date}`,
  metaDescription: (date: string) =>
    `Classical composers born and who died on ${date}, with portraits, eras and works.`,
};

export const ON_THIS_DAY: Record<Idioma, typeof pt> = { pt, en };

/** The site's calendar runs on Brazilian time. */
const TIME_ZONE = 'America/Sao_Paulo';
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export interface CalendarDay {
  month: number;
  day: number;
}

export function today(now = new Date()): CalendarDay {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { month: get('month'), day: get('day') };
}

/** Days in a month, counting 29 February: the calendar has no year. */
export const daysInMonth = (month: number) => DAYS_IN_MONTH[month - 1];

/** "10-08" in the URL. */
export const daySlug = ({ month, day }: CalendarDay) =>
  `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export function parseDaySlug(slug: string): CalendarDay | null {
  const match = /^(\d{2})-(\d{2})$/.exec(slug);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  return month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= DAYS_IN_MONTH[month - 1]
    ? { month, day }
    : null;
}

/** The day before or after, wrapping around the year (29 Feb included). */
export function shiftDay({ month, day }: CalendarDay, by: 1 | -1): CalendarDay {
  if (by === 1) {
    return day < DAYS_IN_MONTH[month - 1]
      ? { month, day: day + 1 }
      : { month: (month % 12) + 1, day: 1 };
  }
  if (day > 1) return { month, day: day - 1 };
  const prev = month === 1 ? 12 : month - 1;
  return { month: prev, day: DAYS_IN_MONTH[prev - 1] };
}

/** "8 de outubro" / "October 8". A leap year keeps 29 Feb printable. */
export const formatDay = ({ month, day }: CalendarDay, language: Idioma) =>
  new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
  }).format(new Date(Date.UTC(2024, month - 1, day)));
