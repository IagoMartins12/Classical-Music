import { describe, expect, it } from 'vitest';
import { autorRef } from './leitura';

describe('autorRef', () => {
  it('conta excluída vira "Autor desconhecido", sem página', () => {
    expect(autorRef(null, 'pt')).toMatchObject({
      nome: 'Autor desconhecido',
      usuario: '',
      desconhecido: true,
    });
    expect(autorRef(null, 'en').nome).toBe('Unknown author');
  });

  it('autor com conta continua com nome e página', () => {
    expect(
      autorRef({
        id: 'u1',
        firstName: 'Helena',
        lastName: 'Prado',
        username: 'helena',
      })
    ).toMatchObject({
      nome: 'Helena Prado',
      usuario: 'helena',
      desconhecido: false,
    });
  });
});
