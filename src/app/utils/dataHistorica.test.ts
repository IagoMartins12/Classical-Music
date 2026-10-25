import { describe, expect, it } from 'vitest';
import { escreverData, lerData, mostrarData } from './dataHistorica';

describe('lerData', () => {
  it('lê dia, mês e ano no formato das fontes', () => {
    expect(lerData('15 August 1921')).toEqual({
      data: { ano: 1921, mes: 8, dia: 15, aproximada: false },
      inexata: false,
    });
    expect(lerData('2 October 1835').data).toMatchObject({ dia: 2, mes: 10 });
  });

  it('lê mês e ano, só o ano e a data com barras', () => {
    expect(lerData('September 1752').data).toMatchObject({
      ano: 1752,
      mes: 9,
      dia: null,
    });
    expect(lerData('1830').data).toMatchObject({ ano: 1830, mes: null });
    expect(lerData('22/11/1913').data).toMatchObject({
      ano: 1913,
      mes: 11,
      dia: 22,
    });
  });

  it('marca como aproximada o "ca." e o "?"', () => {
    expect(lerData('ca.1845')).toEqual({
      data: { ano: 1845, mes: null, dia: null, aproximada: true },
      inexata: false,
    });
    expect(lerData('1835?').data?.aproximada).toBe(true);
  });

  it('o que o seletor não guarda vira o primeiro ano, avisando', () => {
    expect(lerData('fl. 1852')).toEqual({
      data: { ano: 1852, mes: null, dia: null, aproximada: true },
      inexata: true,
    });
    expect(lerData('1917 or 1918').data?.ano).toBe(1917);
    expect(lerData('?')).toEqual({ data: null, inexata: true });
  });

  it('vazio é vazio', () => {
    expect(lerData(null)).toEqual({ data: null, inexata: false });
    expect(lerData('  ')).toEqual({ data: null, inexata: false });
  });

  it('dia que o mês não tem não passa', () => {
    expect(lerData('31 February 1900').inexata).toBe(true);
  });
});

describe('escreverData', () => {
  it('devolve no formato do banco', () => {
    expect(
      escreverData({ ano: 1921, mes: 8, dia: 15, aproximada: false })
    ).toBe('15 August 1921');
    expect(
      escreverData({ ano: 1752, mes: 9, dia: null, aproximada: false })
    ).toBe('September 1752');
    expect(
      escreverData({ ano: 1845, mes: null, dia: null, aproximada: true })
    ).toBe('ca.1845');
  });

  it('ida e volta não muda o que já estava gravado', () => {
    for (const t of ['15 August 1921', 'September 1752', '1830', 'ca.1845'])
      expect(escreverData(lerData(t).data!)).toBe(t);
  });
});

describe('mostrarData', () => {
  it('escreve no idioma da tela', () => {
    const d = { ano: 1921, mes: 8, dia: 15, aproximada: false };
    expect(mostrarData(d, 'pt')).toBe('15 de agosto de 1921');
    expect(mostrarData(d, 'en')).toBe('15 August 1921');
    expect(
      mostrarData({ ano: 1845, mes: null, dia: null, aproximada: true }, 'pt')
    ).toBe('c. 1845');
  });
});
