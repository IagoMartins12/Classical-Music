import { describe, expect, it } from 'vitest';
import type { RetroCard } from '@/app/requests/retrospective';
import { desenhoDo, textoDo } from './pranchaRetro';

const cartao = (over: Partial<RetroCard>): RetroCard => ({
  kind: 'learned',
  eyebrow: 'Já aprendi',
  title: '7 obras aprendidas',
  value: '7',
  detail: 'maestria média de 60%',
  ...over,
});
const texto = (c: RetroCard) => textoDo(c, desenhoDo(c, 'pt'));

describe('textoDo', () => {
  it('com o número no centro, o detalhe começa com maiúscula', () => {
    expect(texto(cartao({})).detalhe).toBe('Maestria média de 60%');
  });

  it('quando o centro é a época, o número abre a frase', () => {
    const c = cartao({
      kind: 'epoch',
      value: '41%',
      detail: 'das suas obras são do período Barroco',
      art: { epoch: 'Barroco' },
    });
    expect(texto(c).detalhe).toBe('41% das suas obras são do período Barroco');
    expect(desenhoDo(c, 'en').centro).toEqual({
      tipo: 'palavra',
      texto: 'Baroque',
      legenda: '1600–1750',
    });
  });

  it('cartão salvo antes dos desenhos continua com o número no centro', () => {
    const c = cartao({ kind: 'composer', detail: 'obras de Chopin' });
    expect(desenhoDo(c, 'pt').centro).toEqual({ tipo: 'numero', valor: '7' });
    expect(texto(c).detalhe).toBe('Obras de Chopin');
  });

  it('o mês fica no centro e a contagem no seu traço', () => {
    const d = desenhoDo(
      cartao({ kind: 'month', art: { month: 2 }, detail: 'obras no mês' }),
      'pt'
    );
    expect(d.centro).toEqual({ tipo: 'palavra', texto: 'Março' });
    expect(d.corpos[0]).toMatchObject({ texto: '7', deg: -30, fixo: true });
  });
});
