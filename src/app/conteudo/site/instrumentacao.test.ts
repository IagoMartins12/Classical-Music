import { describe, expect, it } from 'vitest';
import {
  escreverInstrumentacao,
  lerInstrumentacao,
  rotuloDoInstrumento,
} from './instrumentacao';

describe('lerInstrumentacao', () => {
  it('lê a forma mais comum do banco', () => {
    expect(lerInstrumentacao('Violino, Piano')).toEqual(['Violino', 'Piano']);
    expect(lerInstrumentacao('Voz, Baixo Contínuo')).toEqual([
      'Voz',
      'Baixo Contínuo',
    ]);
  });

  it('reconhece inglês, plural e qualificadores', () => {
    expect(lerInstrumentacao('Violins, Viola, Violoncelo')).toEqual([
      'Violino',
      'Viola',
      'Violoncelo',
    ]);
    expect(lerInstrumentacao('Clarinets b♭, Horns in f')).toEqual([
      'Clarinete',
      'Trompa',
    ]);
    expect(lerInstrumentacao('Mixed Coro satb')).toEqual(['Coro']);
    expect(lerInstrumentacao('Cellos')).toEqual(['Violoncelo']);
  });

  it('separa as alternativas e não repete', () => {
    expect(lerInstrumentacao('Cravo ou Piano')).toEqual(['Cravo', 'Piano']);
    expect(lerInstrumentacao('Voz, Piano; vozes, Piano')).toEqual([
      'Voz',
      'Piano',
    ]);
  });

  it('o que não reconhece fica como está', () => {
    expect(lerInstrumentacao('Piano 4-mãos')).toEqual(['Piano 4-mãos']);
    expect(lerInstrumentacao('C3, Piano')).toEqual(['C3', 'Piano']);
  });

  it('vazio é lista vazia', () => {
    expect(lerInstrumentacao(null)).toEqual([]);
    expect(lerInstrumentacao('')).toEqual([]);
  });
});

describe('escreverInstrumentacao e rótulos', () => {
  it('grava em português, mostra no idioma da tela', () => {
    expect(escreverInstrumentacao(['Violino', 'Piano'])).toBe('Violino, Piano');
    expect(rotuloDoInstrumento('Violoncelo', 'en')).toBe('Cello');
    expect(rotuloDoInstrumento('Piano 4-mãos', 'en')).toBe('Piano 4-mãos');
  });
});

describe('o que as fontes juntaram', () => {
  it('separa o que veio num trecho só', () => {
    expect(lerInstrumentacao('Orquestra: flutes')).toEqual([
      'Orquestra',
      'Flauta',
    ]);
    expect(lerInstrumentacao('Bassoons + horns')).toEqual(['Fagote', 'Trompa']);
  });

  it('tira o qualificador da frente', () => {
    expect(lerInstrumentacao('Contralto Saxofone')).toEqual(['Saxofone']);
    expect(lerInstrumentacao('Military Banda')).toEqual(['Banda']);
    expect(lerInstrumentacao('Violino ad lib.')).toEqual(['Violino']);
    expect(lerInstrumentacao('Vozes sattb')).toEqual(['Voz']);
  });
});
