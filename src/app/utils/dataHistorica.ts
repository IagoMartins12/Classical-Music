import type { Idioma } from '@/app/conteudo/legal/tipos';

/**
 * As datas de nascimento e morte dos compositores, como estão gravadas:
 * texto, no formato das fontes de onde vieram ("15 August 1921",
 * "September 1752", "1830", "ca.1845", "fl. 1852", "1917 or 1918", "?").
 *
 * O seletor de data (`SeletorDeData`) trabalha com a `DataHistorica`: ano,
 * e mês e dia quando se sabe, e se é aproximada. `lerData` traz o texto
 * gravado para ela, e `escreverData` a devolve no formato que o banco já usa,
 * para a página e os filtros lerem igual ao que veio das fontes.
 */
export interface DataHistorica {
  ano: number;
  /** 1 a 12. */
  mes: number | null;
  dia: number | null;
  /** "ca.": a fonte só sabe por volta de quando. */
  aproximada: boolean;
}

export interface Leitura {
  data: DataHistorica | null;
  /**
   * O texto gravado diz mais do que o seletor guarda ("fl. 1852", "1917 or
   * 1918"). A data lida é a melhor aproximação, e a tela mostra o original.
   */
  inexata: boolean;
}

const MESES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MES = `(${MESES_EN.join('|')})`;
const indiceDoMes = (nome: string) => MESES_EN.indexOf(nome) + 1;

/** Quantos dias tem o mês (fevereiro conta o bissexto do calendário atual). */
export const diasNoMes = (ano: number, mes: number) =>
  new Date(Date.UTC(ano, mes, 0)).getUTCDate();

function valida(d: DataHistorica): DataHistorica | null {
  if (d.mes !== null && (d.mes < 1 || d.mes > 12)) return null;
  if (d.dia !== null) {
    if (d.mes === null || d.dia < 1 || d.dia > diasNoMes(d.ano, d.mes))
      return null;
  }
  return d;
}

export function lerData(texto: string | null | undefined): Leitura {
  const t = (texto ?? '').trim();
  if (!t) return { data: null, inexata: false };

  const aproximada = /^(ca\.?|c\.)\s*/i.test(t);
  const resto = t.replace(/^(ca\.?|c\.)\s*/i, '').replace(/\?$/, '');
  const incerta = aproximada || t.endsWith('?');

  let m = resto.match(new RegExp(`^(\\d{1,2}) ${MES} (\\d{3,4})$`));
  if (m) {
    const d = valida({
      ano: +m[3],
      mes: indiceDoMes(m[2]),
      dia: +m[1],
      aproximada: incerta,
    });
    if (d) return { data: d, inexata: false };
  }
  m = resto.match(new RegExp(`^${MES} (\\d{3,4})$`));
  if (m)
    return {
      data: {
        ano: +m[2],
        mes: indiceDoMes(m[1]),
        dia: null,
        aproximada: incerta,
      },
      inexata: false,
    };
  m = resto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const d = valida({
      ano: +m[3],
      mes: +m[2],
      dia: +m[1],
      aproximada: incerta,
    });
    if (d) return { data: d, inexata: false };
  }
  m = resto.match(/^(\d{3,4})$/);
  if (m)
    return {
      data: { ano: +m[1], mes: null, dia: null, aproximada: incerta },
      inexata: false,
    };

  // "fl. 1852", "1917 or 1918", "after 1646": o primeiro ano que aparecer,
  // como aproximado, e a tela avisa que o original diz mais.
  const ano = t.match(/\d{3,4}/);
  if (ano)
    return {
      data: { ano: +ano[0], mes: null, dia: null, aproximada: true },
      inexata: true,
    };
  return { data: null, inexata: true };
}

/** No formato do banco: "15 August 1921", "August 1921", "1921", "ca.1845". */
export function escreverData(d: DataHistorica): string {
  const base =
    d.mes === null
      ? String(d.ano)
      : d.dia === null
        ? `${MESES_EN[d.mes - 1]} ${d.ano}`
        : `${d.dia} ${MESES_EN[d.mes - 1]} ${d.ano}`;
  return d.aproximada ? `ca.${base}` : base;
}

const LOCALE: Record<Idioma, string> = { pt: 'pt-BR', en: 'en-GB' };

/** O nome do mês no idioma da tela. */
export function nomeDoMes(mes: number, idioma: Idioma, curto = false) {
  const nome = new Intl.DateTimeFormat(LOCALE[idioma], {
    month: curto ? 'short' : 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, mes - 1, 1)));
  return nome.replace(/\.$/, '');
}

/** Para ler na tela: "15 de agosto de 1921", "c. 1845", "agosto de 1921". */
export function mostrarData(d: DataHistorica, idioma: Idioma): string {
  const mes = d.mes === null ? null : nomeDoMes(d.mes, idioma);
  const base =
    mes === null
      ? String(d.ano)
      : d.dia === null
        ? idioma === 'pt'
          ? `${mes} de ${d.ano}`
          : `${mes} ${d.ano}`
        : idioma === 'pt'
          ? `${d.dia} de ${mes} de ${d.ano}`
          : `${d.dia} ${mes} ${d.ano}`;
  return d.aproximada ? `${idioma === 'pt' ? 'c.' : 'ca.'} ${base}` : base;
}
