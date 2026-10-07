import type { Idioma } from '@/app/conteudo/blog';

/**
 * Datas e números do blog.
 *
 * **Sempre com o fuso fixado.** O servidor do Next roda em UTC; o navegador,
 * no fuso de quem lê. Sem fuso explícito, um artigo publicado às 22h saía com
 * uma data no HTML e outra depois da hidratação — e o React reclamava da
 * diferença. O blog é brasileiro: `America/Sao_Paulo`, a não ser que o
 * evento diga o próprio fuso.
 */

const FUSO = 'America/Sao_Paulo';
const LOCALE = { pt: 'pt-BR', en: 'en-US' } as const;

type Entrada = string | number | Date | null | undefined;

const comoData = (valor: Entrada) =>
  valor === null || valor === undefined || valor === ''
    ? null
    : valor instanceof Date
      ? valor
      : new Date(valor);

function formatar(
  valor: Entrada,
  idioma: Idioma,
  opcoes: Intl.DateTimeFormatOptions,
  fuso = FUSO
): string {
  const data = comoData(valor);
  if (!data || Number.isNaN(data.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[idioma], {
    timeZone: fuso,
    ...opcoes,
  }).format(data);
}

/** "28 set 2026" · "Sep 28, 2026". */
export const dataCurta = (valor: Entrada, idioma: Idioma = 'pt') =>
  formatar(valor, idioma, { day: 'numeric', month: 'short', year: 'numeric' })
    .replace(/\./g, '')
    .replace(/ de /g, ' ');

/** "28 de setembro de 2026" · "September 28, 2026". */
export const dataLonga = (valor: Entrada, idioma: Idioma = 'pt') =>
  formatar(valor, idioma, { day: 'numeric', month: 'long', year: 'numeric' });

/** "setembro de 2026" · "September 2026". */
export const mesEAno = (valor: Entrada, idioma: Idioma = 'pt') =>
  formatar(valor, idioma, { month: 'long', year: 'numeric' });

/** "Setembro de 2026", com a inicial maiúscula (título). */
export const mesEAnoTitulo = (valor: Entrada, idioma: Idioma = 'pt') => {
  const texto = mesEAno(valor, idioma);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/** "02" — o dia com dois algarismos. */
export const diaDoMes = (valor: Entrada, fuso = FUSO) =>
  formatar(valor, 'pt', { day: '2-digit' }, fuso);

/** "out" · "Oct". */
export const mesCurto = (valor: Entrada, idioma: Idioma = 'pt', fuso = FUSO) =>
  formatar(valor, idioma, { month: 'short' }, fuso).replace('.', '');

/** "sexta-feira" · "Friday". */
export const diaDaSemana = (
  valor: Entrada,
  idioma: Idioma = 'pt',
  fuso = FUSO
) => formatar(valor, idioma, { weekday: 'long' }, fuso);

/** "20h30" · "8:30 PM". */
export function hora(valor: Entrada, idioma: Idioma = 'pt', fuso = FUSO) {
  if (idioma === 'en') {
    return formatar(valor, 'en', { hour: 'numeric', minute: '2-digit' }, fuso);
  }
  const texto = formatar(
    valor,
    'pt',
    { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
    fuso
  );
  const [h, m] = texto.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/**
 * A hora de um evento da agenda, ou nada. Os robôs das casas gravam meia-noite
 * quando a página não diz a hora: "0h" na tela seria uma hora inventada.
 */
export function horaDoEvento(
  inicio: Entrada,
  idioma: Idioma = 'pt',
  fuso = FUSO,
  diaInteiro = false
): string {
  if (diaInteiro) return '';
  const meiaNoite =
    formatar(
      inicio,
      'pt',
      { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
      fuso
    ) === '00:00';
  return meiaNoite ? '' : hora(inicio, idioma, fuso);
}

/** A data local de um instante, no formato "2026-10-02" (chave de dia). */
export function chaveDoDia(valor: Entrada, fuso = FUSO): string {
  const data = comoData(valor);
  if (!data || Number.isNaN(data.getTime())) return '';
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(data);
  return partes;
}

/** "1.234" · "1,234". */
export const numero = (n: number, idioma: Idioma = 'pt') =>
  n.toLocaleString(LOCALE[idioma]);

/** "PT9M": a duração do ISO 8601, para o dado estruturado. */
export const duracaoIso = (minutos: number) => `PT${Math.max(1, minutos)}M`;
