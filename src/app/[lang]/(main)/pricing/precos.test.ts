import { describe, expect, it } from 'vitest';
import {
  formatarPreco,
  maiorDesconto,
  normalizarPrecos,
  partesDoPreco,
} from './precos';

/**
 * O que a página de planos anuncia é conta destes preços. Errar aqui é
 * anunciar um desconto que a cobrança não dá.
 */
const api = {
  FREE: { monthly: 0 },
  PLUS: { monthly: 29, yearly: { price: 276 } },
  MENTOR: { monthly: 79, yearly: { price: 756 } },
  MAESTRO: { monthly: 149, yearly: { price: 0 } },
};

describe('normalizarPrecos', () => {
  it('calcula o anual a partir dos preços, arredondando o desconto para baixo', () => {
    const p = normalizarPrecos(api);
    // 348 − 276 = 72 → 20,69% — anuncia 20, não 21.
    expect(p.PLUS?.anual).toEqual({
      total: 276,
      porMes: 23,
      economia: 72,
      pct: 20,
    });
  });

  it('sem preço anual (ou anual que não economiza), o plano é só mensal', () => {
    const p = normalizarPrecos({
      ...api,
      MENTOR: { monthly: 79, yearly: { price: 948 } },
    });
    expect(p.MAESTRO?.anual).toBeNull();
    expect(p.MENTOR?.anual).toBeNull();
  });

  it('plano ausente ou sem preço fica nulo, nunca com valor inventado', () => {
    const p = normalizarPrecos({ PLUS: { monthly: 0 } });
    expect(p).toEqual({ PLUS: null, MENTOR: null, MAESTRO: null });
    expect(maiorDesconto(p)).toBeNull();
  });

  it('o maior desconto é o dos planos que têm anual', () => {
    expect(maiorDesconto(normalizarPrecos(api))).toBe(20);
  });
});

describe('teste grátis', () => {
  // A página anuncia os dias que a tabela de preços tem — e só esses.
  it('lê os dias da tabela; sem o campo, não há teste para anunciar', () => {
    const p = normalizarPrecos({
      PLUS: { monthly: 29, trialDays: 7 },
      MENTOR: { monthly: 79, trialDays: 7 },
      MAESTRO: { monthly: 149 },
    });
    expect(p.PLUS?.teste).toBe(7);
    expect(p.MENTOR?.teste).toBe(7);
    expect(p.MAESTRO?.teste).toBe(0);
  });

  it('número quebrado ou negativo não vira anúncio', () => {
    const p = normalizarPrecos({
      PLUS: { monthly: 29, trialDays: -3 },
      MENTOR: { monthly: 79, trialDays: 7.9 },
    });
    expect(p.PLUS?.teste).toBe(0);
    expect(p.MENTOR?.teste).toBe(7);
  });
});

describe('formatarPreco', () => {
  it('mostra centavos só quando existem', () => {
    expect(formatarPreco(29, 'pt').replace(/\s/g, ' ')).toBe('R$ 29');
    expect(formatarPreco(29.9, 'pt').replace(/\s/g, ' ')).toBe('R$ 29,90');
  });

  it('separa símbolo, inteiro e centavos', () => {
    expect(partesDoPreco(1428, 'pt')).toEqual({
      simbolo: 'R$',
      inteiro: '1.428',
      centavos: '',
    });
    expect(partesDoPreco(23.9, 'pt').centavos).toBe(',90');
  });
});
