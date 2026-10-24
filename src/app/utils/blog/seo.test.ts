import { describe, expect, it } from 'vitest';
import type { ArtigoCompleto } from '@/app/requests/blog/leitura';
import {
  avaliarSeo,
  descricaoDeSeo,
  jsonLdDoArtigo,
  metadadosDoArtigo,
  palavrasDeSeo,
  tituloDeSeo,
} from './seo';

const conteudo = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Na noite de 7 de maio de 1747, Johann Sebastian Bach chegou a Potsdam para visitar o filho, cravista da corte.',
        },
      ],
    },
  ],
};

const artigo = (mudar: Partial<ArtigoCompleto> = {}): ArtigoCompleto => ({
  id: 'a1',
  slug: 'oferenda-musical',
  titulo: 'O dia em que Frederico II desafiou Bach',
  resumo: null,
  capa: null,
  capaAlt: null,
  publicadoEm: '2026-09-28T12:00:00.000Z',
  atualizadoEm: '2026-09-29T12:00:00.000Z',
  minutos: 9,
  visitas: 10,
  autor: {
    id: 'u1',
    nome: 'Helena Prado',
    usuario: 'helena',
    imagem: null,
    bio: null,
  },
  categoria: { id: 'c1', nome: 'História', slug: 'historia' },
  categorias: [{ id: 'c1', nome: 'História', slug: 'historia' }],
  tags: [{ id: 't1', nome: 'Bach', slug: 'bach' }],
  curtidas: 0,
  comentarios: 0,
  destaque: false,
  ordemNoDestaque: null,
  idiomaOriginal: 'pt',
  idiomaDoTexto: 'pt',
  temTraducao: false,
  conteudo,
  status: 'PUBLISHED',
  creditoDaCapa: null,
  metaTitulo: null,
  metaDescricao: null,
  palavrasChave: ['bach'],
  tipos: [],
  narracao: null,
  musica: null,
  compositores: [],
  obras: [],
  partituras: [],
  relacionados: [],
  ...mudar,
});

describe('os padrões de SEO', () => {
  it('título: o de SEO, senão o do artigo', () => {
    expect(tituloDeSeo(artigo())).toBe(
      'O dia em que Frederico II desafiou Bach'
    );
    expect(tituloDeSeo(artigo({ metaTitulo: 'Oferenda Musical' }))).toBe(
      'Oferenda Musical'
    );
  });

  it('descrição: SEO, depois resumo, depois o primeiro parágrafo', () => {
    expect(descricaoDeSeo(artigo())).toMatch(/^Na noite de 7 de maio/);
    expect(descricaoDeSeo(artigo({ resumo: 'Resumo do card.' }))).toBe(
      'Resumo do card.'
    );
    expect(
      descricaoDeSeo(artigo({ resumo: 'x', metaDescricao: 'Para a busca.' }))
    ).toBe('Para a busca.');
  });

  it('palavras-chave sem repetir, ignorando maiúsculas', () => {
    expect(palavrasDeSeo(artigo())).toEqual(['bach', 'História']);
  });
});

describe('metadadosDoArtigo', () => {
  // Sem tradução, o inglês mostra o original e aponta para ele.
  it('sem tradução, o canônico é o endereço em português, também em inglês', () => {
    const meta = metadadosDoArtigo(artigo(), 'en');
    expect(meta.alternates?.canonical).toBe(
      'https://opusatlas.com.br/blog/oferenda-musical'
    );
    expect(meta.alternates?.languages).toBeUndefined();
  });

  it('com tradução, cada idioma é canônico de si e os dois se citam', () => {
    const meta = metadadosDoArtigo(
      { ...artigo(), idiomaDoTexto: 'en', temTraducao: true },
      'en'
    );
    expect(meta.alternates?.canonical).toBe(
      'https://opusatlas.com.br/en/blog/oferenda-musical'
    );
    expect(meta.alternates?.languages).toMatchObject({
      'pt-BR': 'https://opusatlas.com.br/blog/oferenda-musical',
      en: 'https://opusatlas.com.br/en/blog/oferenda-musical',
    });
  });

  it('sem capa, a imagem das redes é o logo', () => {
    const meta = metadadosDoArtigo(artigo(), 'pt');
    const imagens = meta.openGraph?.images as Array<{ url: string }>;
    expect(imagens[0].url).toContain('opus-atlas-og');
  });

  it('a prévia não é indexada', () => {
    expect(metadadosDoArtigo(artigo(), 'pt', { previa: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe('jsonLdDoArtigo', () => {
  it('é um BlogPosting com autor, data e idioma', () => {
    const ld = jsonLdDoArtigo(artigo());
    expect(ld['@type']).toBe('BlogPosting');
    expect(ld.author.url).toBe('https://opusatlas.com.br/blog/autor/helena');
    expect(ld.datePublished).toBe('2026-09-28T12:00:00.000Z');
    expect(ld.inLanguage).toBe('pt-BR');
    expect(ld.timeRequired).toBe('PT9M');
  });
});

describe('avaliarSeo', () => {
  const base = {
    titulo: 'O dia em que Frederico II desafiou Bach',
    slug: 'oferenda-musical',
    resumo: '',
    conteudo,
    capa: '',
    capaAlt: '',
    metaTitulo: '',
    metaDescricao: '',
    palavrasChave: [],
    categorias: 1,
    tags: 0,
  };

  it('aponta capa ausente, descrição tirada do texto e texto curto', () => {
    const { dicas } = avaliarSeo(base);
    const porId = Object.fromEntries(dicas.map((d) => [d.id, d.nivel]));
    expect(porId.capa).toBe('atencao');
    expect(porId.descricao).toBe('atencao');
    expect(porId.palavras).toBe('atencao');
    expect(porId.titulo).toBe('ok');
  });

  it('capa sem texto alternativo é erro', () => {
    const { dicas } = avaliarSeo({ ...base, capa: '/c.jpg' });
    expect(dicas.find((d) => d.id === 'capa-alt')?.nivel).toBe('erro');
  });

  it('a nota sobe quando as dicas são seguidas', () => {
    const fraco = avaliarSeo(base).nota;
    const melhor = avaliarSeo({
      ...base,
      capa: '/c.jpg',
      capaAlt: 'Frederico II toca flauta',
      metaDescricao:
        'Em maio de 1747, um rei flautista entregou a Bach um tema quase impossível. A resposta levou dois meses e virou a Oferenda Musical.',
      tags: 2,
    }).nota;
    expect(melhor).toBeGreaterThan(fraco);
  });
});
