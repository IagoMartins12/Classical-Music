import type { Idioma } from '@/app/conteudo/legal/tipos';

/**
 * Os preços dos planos pagos como a página usa: mensal e, quando existir, o
 * anual com o total, o equivalente por mês, a economia e o desconto.
 *
 * O desconto é **calculado** (economia ÷ doze mensalidades), não lido do
 * campo `discount` da tabela: aquele é digitado à parte no painel e pode não
 * bater com os valores. O que se anuncia tem de ser a conta dos preços.
 */
export type PlanoPago = 'PLUS' | 'MENTOR' | 'MAESTRO';

export type PrecoPlano = {
  /** Dias de teste grátis (0: sem teste), como a tabela de preços diz. */
  teste: number;
  mensal: number;
  anual: {
    total: number;
    porMes: number;
    economia: number;
    pct: number;
  } | null;
};

export type Precos = Record<PlanoPago, PrecoPlano | null>;

type DaApi = Record<
  string,
  | { monthly: number; yearly?: { price: number } | null; trialDays?: number }
  | undefined
>;

export const PLANOS_PAGOS: PlanoPago[] = ['PLUS', 'MENTOR', 'MAESTRO'];

export function normalizarPrecos(dados: DaApi): Precos {
  const um = (p: PlanoPago): PrecoPlano | null => {
    const d = dados[p];
    if (!d || !(d.monthly > 0)) return null;
    const total = d.yearly?.price ?? 0;
    const cheio = d.monthly * 12;
    return {
      teste: Math.max(0, Math.floor(d.trialDays ?? 0)),
      mensal: d.monthly,
      anual:
        total > 0 && total < cheio
          ? {
              total,
              porMes: total / 12,
              economia: cheio - total,
              // Para baixo: anunciar 21% quando a conta dá 20,7% é exagerar.
              pct: Math.floor(((cheio - total) / cheio) * 100),
            }
          : null,
    };
  };
  return { PLUS: um('PLUS'), MENTOR: um('MENTOR'), MAESTRO: um('MAESTRO') };
}

/** O maior desconto anual entre os planos, para "até X% menos". */
export function maiorDesconto(precos: Precos): number | null {
  const pcts = PLANOS_PAGOS.map((p) => precos[p]?.anual?.pct ?? 0);
  const maior = Math.max(...pcts);
  return maior > 0 ? maior : null;
}

const local = (idioma: Idioma) => (idioma === 'pt' ? 'pt-BR' : 'en-US');

/** "R$ 29" ou "R$ 29,90": centavos só quando existem. */
export function formatarPreco(valor: number, idioma: Idioma): string {
  const inteiro = Math.abs(valor - Math.round(valor)) < 0.005;
  return new Intl.NumberFormat(local(idioma), {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: inteiro ? 0 : 2,
    maximumFractionDigits: inteiro ? 0 : 2,
  }).format(inteiro ? Math.round(valor) : valor);
}

/** O preço em partes, para o número grande com símbolo e centavos pequenos. */
export function partesDoPreco(valor: number, idioma: Idioma) {
  const inteiro = Math.abs(valor - Math.round(valor)) < 0.005;
  const partes = new Intl.NumberFormat(local(idioma), {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: inteiro ? 0 : 2,
    maximumFractionDigits: inteiro ? 0 : 2,
  }).formatToParts(inteiro ? Math.round(valor) : valor);
  const pega = (tipos: string[]) =>
    partes
      .filter((p) => tipos.includes(p.type))
      .map((p) => p.value)
      .join('');
  return {
    simbolo: pega(['currency']),
    inteiro: pega(['integer', 'group']),
    centavos: inteiro ? '' : pega(['decimal', 'fraction']),
  };
}
