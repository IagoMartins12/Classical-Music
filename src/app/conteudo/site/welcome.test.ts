import { describe, expect, it } from 'vitest';
import { STATUS } from './status';
import { TOKENS } from './tokens';
import { PRACTICE_MINUTES, WELCOME } from './welcome';

const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : typeof value === 'function'
      ? [String((value as (...a: unknown[]) => unknown)('Ana', 2))]
      : value && typeof value === 'object'
        ? Object.values(value).flatMap(strings)
        : [];

describe('welcome, token and status copy', () => {
  it.each(['pt', 'en'] as const)('has no em dashes (%s)', (language) => {
    for (const text of [WELCOME, TOKENS, STATUS].flatMap((c) =>
      strings(c[language])
    ))
      expect(text).not.toContain('—');
  });

  it('labels practice minutes as hours', () => {
    const label = PRACTICE_MINUTES.map(WELCOME.pt.study.minutes);
    expect(label).toEqual([
      'Não pratico',
      '1 hora',
      '2 horas',
      '5 horas',
      '10 horas',
      '15 horas',
      '20 horas ou mais',
    ]);
  });
});
