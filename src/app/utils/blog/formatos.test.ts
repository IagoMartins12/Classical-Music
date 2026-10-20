import { describe, expect, it } from 'vitest';
import { chaveDoDia, dataCurta, hora } from './formatos';

describe('datas do blog', () => {
  // 01:30 em UTC ainda é dia 2 à noite em Brasília: a data não pode virar.
  it('usam o fuso de Brasília, igual no servidor e no navegador', () => {
    expect(chaveDoDia('2026-10-03T01:30:00Z')).toBe('2026-10-02');
    expect(dataCurta('2026-10-03T01:30:00Z')).toBe('2 out 2026');
  });

  it('hora no formato brasileiro', () => {
    expect(hora('2026-10-02T23:30:00Z')).toBe('20h30');
    expect(hora('2026-10-02T23:00:00Z')).toBe('20h');
  });

  it('respeitam o fuso da casa', () => {
    expect(hora('2026-10-02T23:00:00Z', 'pt', 'America/Manaus')).toBe('19h');
  });
});
