import { describe, expect, it } from 'vitest';
import { textosDoDocumento } from './traducao';

const doc = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Os anos de espera' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'A sombra de ' },
        { type: 'text', text: 'Beethoven', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' pesava.' },
      ],
    },
    {
      type: 'quoteMusical',
      attrs: { quote: 'Todos os homens', author: 'Schiller' },
    },
    {
      type: 'timeline',
      attrs: { events: [{ date: '1824', title: 'Estreia', description: '' }] },
    },
  ],
};

describe('textosDoDocumento', () => {
  it('lista os textos na ordem, com os atributos de bloco que o leitor mostra', () => {
    const { textos } = textosDoDocumento(doc);
    expect(textos).toEqual([
      'Os anos de espera',
      'A sombra de ',
      'Beethoven',
      ' pesava.',
      'Todos os homens',
      'Estreia',
    ]);
  });

  it('remonta uma cópia com os textos trocados, sem mexer na estrutura nem no original', () => {
    const { textos, aplicar } = textosDoDocumento(doc);
    const novo = aplicar(textos.map((t) => t.toUpperCase())) as typeof doc;
    const paragrafo = novo.content[1] as {
      content: Array<{ text: string; marks?: unknown[] }>;
    };
    expect(paragrafo.content[1]).toEqual({
      type: 'text',
      text: 'BEETHOVEN',
      marks: [{ type: 'bold' }],
    });
    expect(
      (novo.content[2] as unknown as { attrs: Record<string, string> }).attrs
    ).toEqual({ quote: 'TODOS OS HOMENS', author: 'Schiller' });
    expect(
      (doc.content[0] as { content: Array<{ text: string }> }).content[0].text
    ).toBe('Os anos de espera');
  });

  it('recusa uma resposta com outro número de trechos', () => {
    const { aplicar } = textosDoDocumento(doc);
    expect(() => aplicar(['só um'])).toThrow();
  });
});
