// components/Portal/format.ts — datas e números do portal (04/10/2026)
//
// O vocabulário dos esboços ("qui, 8 out", "15h30", "1h05", "amanhã"), agora
// sobre instantes de verdade. Tudo no fuso do navegador de quem lê: a API
// devolve instantes (UTC) e o dia local de cada coluna da semana, e é o
// navegador que sabe onde a pessoa está.
//
// Dia "ISO" aqui é sempre `AAAA-MM-DD` local, nunca `toISOString()` (que é
// UTC e troca de dia às 21h em Brasília).

const DIAS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];
const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** O dia local (`AAAA-MM-DD`) de um instante. */
export function dayOf(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "AAAA-MM-DD" → meia-noite local daquele dia. */
export function startOfDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const today = () => dayOf(new Date());

export function addDays(day: string, n: number): string {
  const d = startOfDay(day);
  d.setDate(d.getDate() + n);
  return dayOf(d);
}

export const weekday = (day: string) => startOfDay(day).getDay();

export function daysBetween(from: string, to: string): number {
  // Pelo meio-dia: o horário de verão não tira nem põe um dia.
  const a = startOfDay(from).getTime() + 432e5;
  const b = startOfDay(to).getTime() + 432e5;
  return Math.round((b - a) / 864e5);
}

/** Domingo da semana do dia — a mesma regra da API (`weekStartOf`). */
export const weekStart = (day: string) => addDays(day, -weekday(day));

export const weekOf = (day: string) => {
  const start = weekStart(day);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/** As semanas (domingo a sábado) que cobrem o mês do dia. */
export function monthWeeks(day: string): string[][] {
  const month = day.slice(0, 7);
  const weeks: string[][] = [];
  let cursor = weekStart(`${month}-01`);
  do {
    weeks.push(weekOf(cursor));
    cursor = addDays(cursor, 7);
  } while (cursor.slice(0, 7) === month);
  return weeks;
}

export const sameMonth = (a: string, b: string) =>
  a.slice(0, 7) === b.slice(0, 7);

export const dayName = (day: string) => DIAS[weekday(day)];
export const dayShort = (day: string) => DIAS_CURTOS[weekday(day)];
export const dayOfMonth = (day: string) => Number(day.slice(8, 10));
export const monthName = (day: string) => MESES[Number(day.slice(5, 7)) - 1];

/** "quinta, 1 de outubro" */
export const longDate = (day: string) =>
  `${dayName(day)}, ${dayOfMonth(day)} de ${monthName(day)}`;

/** "1 out" */
export const shortDate = (day: string) =>
  `${dayOfMonth(day)} ${monthName(day).slice(0, 3)}`;

/** "1 out 2025" quando não é deste ano. */
export function shortDateYear(day: string) {
  return day.slice(0, 4) === today().slice(0, 4)
    ? shortDate(day)
    : `${shortDate(day)} ${day.slice(0, 4)}`;
}

/** "hoje", "amanhã", "ontem" ou "qui, 8 out" */
export function when(day: string) {
  const n = daysBetween(today(), day);
  if (n === 0) return 'hoje';
  if (n === 1) return 'amanhã';
  if (n === -1) return 'ontem';
  return `${dayShort(day)}, ${shortDate(day)}`;
}

/** "15:30" de um instante. */
export function clock(value: Date | string) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "15h", "17h30" */
export function spokenTime(value: Date | string) {
  const [h, m] = clock(value).split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/** "15:00–16:00" */
export function timeRange(start: string, minutes: number) {
  return `${clock(start)}–${clock(new Date(new Date(start).getTime() + minutes * 60_000))}`;
}

/** Minutos desde a meia-noite local. */
export function minuteOfDay(value: Date | string) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.getHours() * 60 + d.getMinutes();
}

/** "AAAA-MM-DD" + "HH:MM" locais → instante ISO (UTC) para a API. */
export function toInstant(day: string, time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = startOfDay(day);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** 185 → "3h05"; 45 → "45 min" */
export function duration(min: number) {
  const total = Math.round(min);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h${pad(m)}` : `${h}h`;
}

/** "há 3 dias", "há 2 h", "agora" */
export function ago(value: Date | string) {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  return shortDateYear(dayOf(value));
}

export const hasPassed = (start: string, minutes = 0) =>
  new Date(start).getTime() + minutes * 60_000 <= Date.now();

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Boa noite';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

/** "uma", "duas", "três" … para frases; número a partir de dez. */
export function countWord(n: number, feminine = true) {
  const f = [
    'nenhuma',
    'uma',
    'duas',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
  ];
  const m = [
    'nenhum',
    'um',
    'dois',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
  ];
  return n < 10 ? (feminine ? f : m)[n] : String(n);
}

export const plural = (n: number, one: string, many: string) =>
  n === 1 ? one : many;

/** Lista em português: "Ana", "Ana e Bia", "Ana, Bia e Caio". */
export function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}
