/**
 * Como o painel escreve número, dinheiro e tempo. Um lugar só: "R$ 1.234,50"
 * e "há 3 h" iguais em todas as telas.
 */

const FUSO = 'America/Sao_Paulo';

export const numero = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : n.toLocaleString('pt-BR');

export const moeda = (n: number | null | undefined, casas = 2) =>
  n === null || n === undefined
    ? '—'
    : n.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      });

/** "1,2 mil", "3,4 mi": para eixo e número grande que não precisa de centavo. */
export const compacto = (n: number) =>
  n.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const porcento = (n: number | null | undefined, casas = 1) =>
  n === null || n === undefined
    ? '—'
    : `${n.toLocaleString('pt-BR', { maximumFractionDigits: casas })}%`;

/** Variação entre dois números, em pontos percentuais; `null` sem base. */
export function variacao(atual: number, anterior: number): number | null {
  if (!anterior) return null;
  return Math.round(((atual - anterior) / anterior) * 1000) / 10;
}

export const data = (valor: string | Date | null | undefined) =>
  valor
    ? new Date(valor).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: FUSO,
      })
    : '—';

/** "28/09/26": para coluna de tabela, onde a data longa em mono ocupa demais. */
export const dataCurta = (valor: string | Date | null | undefined) =>
  valor
    ? new Date(valor).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        timeZone: FUSO,
      })
    : '—';

export const dataHora = (valor: string | Date | null | undefined) =>
  valor
    ? new Date(valor).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: FUSO,
      })
    : '—';

/** "agora", "há 12 min", "há 3 h", "ontem", "há 5 dias", depois a data. */
export function relativo(valor: string | Date | null | undefined): string {
  if (!valor) return '—';
  const ms = Date.now() - new Date(valor).getTime();
  const min = Math.round(ms / 60_000);

  if (ms < 0) {
    const emMin = Math.round(-ms / 60_000);
    if (emMin < 60) return `em ${emMin} min`;
    if (emMin < 60 * 24) return `em ${Math.round(emMin / 60)} h`;
    return `em ${Math.round(emMin / 60 / 24)} dias`;
  }
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  if (min < 60 * 24) return `há ${Math.round(min / 60)} h`;
  const dias = Math.round(min / 60 / 24);
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  return data(valor);
}

export const bytes = (n: number | null | undefined) => {
  if (!n) return '—';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${u[i]}`;
};

export const PLANOS: Record<string, string> = {
  FREE: 'Free',
  PLUS: 'Plus',
  MENTOR: 'Mentor',
  MAESTRO: 'Maestro',
};

export const PERIODOS_COBRANCA: Record<string, string> = {
  MONTHLY: 'mensal',
  YEARLY: 'anual',
};
