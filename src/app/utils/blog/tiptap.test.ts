import { describe, expect, it } from 'vitest';
import {
  ancora,
  contarPalavras,
  cortar,
  resumoDoConteudo,
  titulosDoArtigo,
} from './tiptap';

const p = (texto: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text: texto }],
});
const h = (nivel: number, texto: string) => ({
  type: 'heading',
  attrs: { level: nivel },
  content: [{ type: 'text', text: texto }],
});
const doc = (...content: unknown[]) => ({ type: 'doc', content });

describe('titulosDoArtigo', () => {
  // O `h1` é da página: o artigo que usa h1 e h3 não pode pular níveis.
  it('o menor nível usado vira h2, o seguinte h3', () => {
    const titulos = titulosDoArtigo(
      doc(h(1, 'Primeira parte'), h(3, 'Um detalhe'), h(1, 'Segunda parte'))
    );
    expect(titulos.map((t) => t.nivel)).toEqual([2, 3, 2]);
  });

  it('um nível que aparece uma vez só no topo se junta ao seguinte', () => {
    const titulos = titulosDoArtigo(
      doc(
        h(2, 'Capítulo I'),
        h(3, 'Um detalhe'),
        h(2, 'Capítulo II'),
        h(1, 'Conclusão')
      )
    );
    expect(titulos.map((t) => t.nivel)).toEqual([2, 3, 2, 2]);
  });

  it('ids sem acento e sem repetir', () => {
    const titulos = titulosDoArtigo(
      doc(h(2, 'Introdução'), h(2, 'Introdução'))
    );
    expect(titulos.map((t) => t.id)).toEqual(['introducao', 'introducao-2']);
  });

  it('título vazio não entra', () => {
    expect(
      titulosDoArtigo(doc({ type: 'heading', attrs: { level: 2 } }))
    ).toEqual([]);
  });

  it('conteúdo que não é documento vira lista vazia', () => {
    expect(titulosDoArtigo(null)).toEqual([]);
    expect(titulosDoArtigo('texto')).toEqual([]);
  });
});

describe('resumoDoConteudo', () => {
  it('pula parágrafo curto e corta numa palavra inteira', () => {
    const resumo = resumoDoConteudo(
      doc(
        p('Curto.'),
        p(
          'Na noite de 7 de maio de 1747, Johann Sebastian Bach chegou a Potsdam depois de dias de viagem.'
        )
      ),
      60
    );
    expect(resumo.length).toBeLessThanOrEqual(60);
    expect(resumo.endsWith('…')).toBe(true);
    expect(resumo.startsWith('Na noite')).toBe(true);
  });

  it('sem parágrafo, nada', () => {
    expect(resumoDoConteudo(doc(h(2, 'Só título')))).toBe('');
  });
});

describe('contarPalavras', () => {
  it('conta texto de parágrafo, título, lista e citação, não de mídia', () => {
    const total = contarPalavras(
      doc(
        h(2, 'Dois termos'),
        p('três palavras aqui'),
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [p('um item')] }],
        },
        { type: 'quoteMusical', attrs: { quote: 'música é tudo' } },
        { type: 'image', attrs: { src: '/x.jpg', alt: 'não conta' } }
      )
    );
    expect(total).toBe(2 + 3 + 2 + 3);
  });
});

describe('cortar e ancora', () => {
  it('texto curto fica inteiro', () => {
    expect(cortar('Bach', 10)).toBe('Bach');
  });
  it('âncora de texto só com símbolos tem nome', () => {
    expect(ancora('—')).toBe('secao');
  });
});
