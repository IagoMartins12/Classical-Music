import type { Metadata } from 'next';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import type {
  ArtigoCompleto,
  CategoriaDoBlog,
  PerfilDeAutor,
  ResumoDeArtigo,
  TagDoBlog,
} from '@/app/requests/blog/leitura';
import { SITE_URL } from '@/app/utils/seoAlternates';
import { absoluto, rotasDoBlog } from './rotas';
import {
  contarPalavras,
  cortar,
  imagensDoArtigo,
  linksDoArtigo,
  resumoDoConteudo,
  tiposDeBloco,
  titulosDoArtigo,
} from './tiptap';
import { duracaoIso } from './formatos';

/**
 * O SEO do blog, por padrão.
 *
 * **Todo artigo sai com um bom SEO sem ninguém mexer.** Cada campo tem uma
 * cadeia de escolhas: o que o autor escreveu para SEO, senão o que escreveu
 * para o card, senão o que dá para tirar do próprio artigo. O editor mostra
 * as mesmas regras como dicas (`avaliarSeo`), para quem quiser fazer melhor
 * que o padrão.
 */

const IMAGEM_PADRAO = `${SITE_URL}/logo-opus-atlas.jpeg`;
const LOCALE_OG = { pt: 'pt_BR', en: 'en_US' } as const;

/** Os limites que o Google mostra sem cortar. */
export const LIMITES = {
  titulo: { min: 30, max: 60 },
  descricao: { min: 120, max: 160 },
  slug: 60,
  palavras: 600,
} as const;

// ---------------------------------------------------------------------------
// Os padrões
// ---------------------------------------------------------------------------

/** Título para o buscador: o de SEO, senão o do artigo. */
export const tituloDeSeo = (a: Pick<ArtigoCompleto, 'metaTitulo' | 'titulo'>) =>
  (a.metaTitulo?.trim() || a.titulo).trim();

/**
 * Descrição para o buscador: a de SEO, senão o resumo do card, senão o
 * primeiro parágrafo do artigo — sempre cortada numa palavra inteira.
 */
export function descricaoDeSeo(
  a: Pick<ArtigoCompleto, 'metaDescricao' | 'resumo' | 'conteudo' | 'titulo'>
): string {
  const escolhida =
    a.metaDescricao?.trim() ||
    a.resumo?.trim() ||
    resumoDoConteudo(a.conteudo, LIMITES.descricao.max) ||
    a.titulo;
  return cortar(escolhida, LIMITES.descricao.max);
}

/**
 * Palavras-chave: as do autor, as tags e as categorias, sem repetir. O
 * Google não usa `keywords`, mas outros buscadores e as redes leem.
 */
export function palavrasDeSeo(
  a: Pick<ArtigoCompleto, 'palavrasChave' | 'tags' | 'categorias'>
): string[] {
  const vistas = new Set<string>();
  return [
    ...a.palavrasChave,
    ...a.tags.map((t) => t.nome),
    ...a.categorias.map((c) => c.nome),
  ]
    .map((p) => p.trim())
    .filter((p) => {
      const chave = p.toLowerCase();
      if (!p || vistas.has(chave)) return false;
      vistas.add(chave);
      return true;
    })
    .slice(0, 12);
}

const imagemDe = (a: Pick<ArtigoCompleto, 'capa' | 'capaAlt' | 'titulo'>) =>
  a.capa
    ? { url: absoluto(a.capa), alt: a.capaAlt || a.titulo }
    : { url: IMAGEM_PADRAO, alt: 'Opus Atlas', width: 1200, height: 630 };

// ---------------------------------------------------------------------------
// Metadados por página
// ---------------------------------------------------------------------------

/**
 * Os endereços alternativos de uma página do blog que existe nos dois
 * idiomas (a interface muda; a lista é a mesma).
 */
export function alternativasDoBlog(
  caminhoPt: string,
  caminhoEn: string,
  idioma: Idioma
): Metadata['alternates'] {
  const pt = absoluto(caminhoPt);
  const en = absoluto(caminhoEn);
  return {
    canonical: idioma === 'en' ? en : pt,
    languages: { 'pt-BR': pt, en: en, 'x-default': pt },
    types: {
      'application/rss+xml': [
        { url: absoluto(rotasDoBlog.rss()), title: BLOG[idioma].nome },
      ],
    },
  };
}

/** Metadados de uma página de lista do blog (início, categoria, tag…). */
export function metadadosDePagina({
  idioma,
  titulo,
  descricao,
  caminhoPt,
  caminhoEn,
  imagem,
  indexar = true,
}: {
  idioma: Idioma;
  titulo: string;
  descricao: string;
  caminhoPt: string;
  caminhoEn: string;
  imagem?: string | null;
  indexar?: boolean;
}): Metadata {
  const url = absoluto(idioma === 'en' ? caminhoEn : caminhoPt);
  const imagens = [
    imagem
      ? { url: absoluto(imagem), alt: titulo }
      : { url: IMAGEM_PADRAO, width: 1200, height: 630, alt: 'Opus Atlas' },
  ];
  return {
    title: titulo,
    description: cortar(descricao, LIMITES.descricao.max),
    alternates: alternativasDoBlog(caminhoPt, caminhoEn, idioma),
    openGraph: {
      type: 'website',
      url,
      siteName: 'Opus Atlas',
      locale: LOCALE_OG[idioma],
      title: titulo,
      description: cortar(descricao, LIMITES.descricao.max),
      images: imagens,
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: cortar(descricao, LIMITES.descricao.max),
      images: imagens.map((i) => i.url),
    },
    robots: indexar
      ? { index: true, follow: true, 'max-image-preview': 'large' }
      : { index: false, follow: true },
  };
}

/**
 * Metadados do artigo.
 *
 * **O canônico é sempre o endereço em português**, nos dois idiomas: o texto
 * do artigo só existe em português, e `/en/blog/x` com o mesmo texto seria
 * conteúdo duplicado. A versão em inglês existe para quem navega em inglês
 * (a interface muda); para o buscador, a página é uma só.
 */
export function metadadosDoArtigo(
  a: ArtigoCompleto,
  idioma: Idioma,
  opcoes: { previa?: boolean } = {}
): Metadata {
  const titulo = tituloDeSeo(a);
  const descricao = descricaoDeSeo(a);
  // O endereço canônico é o do idioma do texto que a página mostra: sem
  // tradução, `/en/blog/<slug>` mostra o original e aponta para ele. Com
  // tradução, cada idioma é canônico de si e os dois se citam (hreflang).
  const url = absoluto(rotasDoBlog.artigo(a.slug, a.idiomaDoTexto));
  const idiomas = a.temTraducao
    ? {
        'pt-BR': absoluto(rotasDoBlog.artigo(a.slug, 'pt')),
        en: absoluto(rotasDoBlog.artigo(a.slug, 'en')),
        'x-default': absoluto(rotasDoBlog.artigo(a.slug, a.idiomaOriginal)),
      }
    : undefined;
  const imagem = imagemDe(a);
  const autorUrl = absoluto(rotasDoBlog.autor(a.autor.usuario));

  return {
    title: titulo,
    description: descricao,
    keywords: palavrasDeSeo(a),
    authors: [{ name: a.autor.nome, url: autorUrl }],
    creator: a.autor.nome,
    publisher: 'Opus Atlas',
    category: a.categoria?.nome,
    alternates: {
      canonical: url,
      languages: idiomas,
      types: {
        'application/rss+xml': [
          { url: absoluto(rotasDoBlog.rss()), title: BLOG[idioma].nome },
        ],
      },
    },
    openGraph: {
      type: 'article',
      url,
      siteName: 'Opus Atlas',
      locale: a.idiomaDoTexto === 'en' ? 'en_US' : 'pt_BR',
      title: titulo,
      description: descricao,
      images: [imagem],
      publishedTime: a.publicadoEm ?? undefined,
      modifiedTime: a.atualizadoEm,
      authors: [autorUrl],
      section: a.categoria?.nome,
      tags: a.tags.map((t) => t.nome),
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: [imagem.url],
    },
    robots: opcoes.previa
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

// ---------------------------------------------------------------------------
// Dado estruturado (JSON-LD)
// ---------------------------------------------------------------------------

const ORGANIZACAO = { '@id': `${SITE_URL}/#organization` };

export function jsonLdDoArtigo(a: ArtigoCompleto) {
  const url = absoluto(rotasDoBlog.artigo(a.slug, a.idiomaDoTexto));
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#artigo`,
    mainEntityOfPage: url,
    url,
    headline: cortar(tituloDeSeo(a), 110),
    name: a.titulo,
    description: descricaoDeSeo(a),
    image: [imagemDe(a).url],
    datePublished: a.publicadoEm ?? undefined,
    dateModified: a.atualizadoEm,
    inLanguage: a.idiomaDoTexto === 'en' ? 'en' : 'pt-BR',
    isAccessibleForFree: true,
    wordCount: contarPalavras(a.conteudo) || undefined,
    timeRequired: duracaoIso(a.minutos),
    articleSection: a.categoria?.nome,
    keywords: palavrasDeSeo(a).join(', ') || undefined,
    author: {
      '@type': 'Person',
      name: a.autor.nome,
      url: absoluto(rotasDoBlog.autor(a.autor.usuario)),
      image: a.autor.imagem ?? undefined,
    },
    publisher: ORGANIZACAO,
    isPartOf: { '@type': 'Blog', '@id': `${SITE_URL}/blog#blog` },
    about: a.compositores.map((c) => ({
      '@type': 'Person',
      name: c.nome,
      url: absoluto(`/composer/${c.id}`),
    })),
    mentions: a.obras.map((o) => ({
      '@type': 'MusicComposition',
      name: o.titulo,
      url: absoluto(`/works/${o.id}`),
      composer: { '@type': 'Person', name: o.compositor.nome },
    })),
    ...(a.narracao
      ? {
          audio: {
            '@type': 'AudioObject',
            contentUrl: a.narracao,
            encodingFormat: 'audio/mpeg',
            name: a.titulo,
          },
        }
      : {}),
  };
}

/** A trilha (`Blog › Categoria › Artigo`) para o buscador. */
export function jsonLdDaTrilha(
  passos: Array<{ nome: string; caminho: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: passos.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.nome,
      item: absoluto(p.caminho),
    })),
  };
}

/** O blog e os artigos da página, como lista. */
export function jsonLdDoBlog(idioma: Idioma, artigos: ResumoDeArtigo[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: absoluto(rotasDoBlog.inicio()),
    name: BLOG[idioma].nome,
    description: BLOG[idioma].meta.descricao,
    inLanguage: 'pt-BR',
    publisher: ORGANIZACAO,
    blogPost: artigos.map((a) => ({
      '@type': 'BlogPosting',
      headline: cortar(a.titulo, 110),
      url: absoluto(rotasDoBlog.artigo(a.slug)),
      datePublished: a.publicadoEm ?? undefined,
      image: a.capa ? absoluto(a.capa) : undefined,
      author: { '@type': 'Person', name: a.autor.nome },
    })),
  };
}

/** Uma lista de artigos (categoria, tag): `CollectionPage` com os itens. */
export function jsonLdDaColecao(
  nome: string,
  caminho: string,
  artigos: ResumoDeArtigo[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: nome,
    url: absoluto(caminho),
    isPartOf: { '@id': `${SITE_URL}/blog#blog` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: artigos.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluto(rotasDoBlog.artigo(a.slug)),
        name: a.titulo,
      })),
    },
  };
}

export function jsonLdDoAutor(perfil: PerfilDeAutor) {
  const url = absoluto(rotasDoBlog.autor(perfil.autor.usuario));
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      '@id': `${url}#pessoa`,
      name: perfil.autor.nome,
      alternateName: perfil.autor.usuario,
      description: perfil.autor.bio ?? undefined,
      image: perfil.autor.imagem ?? undefined,
      url,
      knowsAbout: perfil.categorias.map((c) => c.nome),
      worksFor: ORGANIZACAO,
    },
  };
}

export interface EventoParaSeo {
  id: string;
  titulo: string;
  inicio: string;
  fim: string | null;
  descricao: string | null;
  imagem: string | null;
  ingresso: string | null;
  gratuito: boolean;
  casa: string;
  cidade: string;
  estado: string;
  compositores: Array<{ nome: string }>;
}

/**
 * Os concertos do mês como `MusicEvent`: é o que faz o Google mostrar a
 * agenda no resultado da busca, com data e local.
 */
export function jsonLdDaAgenda(eventos: EventoParaSeo[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': eventos.slice(0, 60).map((e) => ({
      '@type': 'MusicEvent',
      '@id': `${SITE_URL}/blog/calendar#${e.id}`,
      name: e.titulo,
      startDate: e.inicio,
      endDate: e.fim ?? undefined,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      description: e.descricao ? cortar(e.descricao, 300) : undefined,
      image: e.imagem ? [e.imagem] : undefined,
      location: {
        '@type': 'Place',
        name: e.casa,
        address: {
          '@type': 'PostalAddress',
          addressLocality: e.cidade,
          addressRegion: e.estado,
          addressCountry: 'BR',
        },
      },
      offers: e.ingresso
        ? {
            '@type': 'Offer',
            url: e.ingresso,
            availability: 'https://schema.org/InStock',
            ...(e.gratuito ? { price: 0, priceCurrency: 'BRL' } : {}),
          }
        : undefined,
      isAccessibleForFree: e.gratuito || undefined,
      workPerformed: e.compositores.length
        ? e.compositores.map((c) => ({
            '@type': 'CreativeWork',
            author: { '@type': 'Person', name: c.nome },
          }))
        : undefined,
    })),
  };
}

export const descricaoDaCategoria = (c: CategoriaDoBlog, idioma: Idioma) =>
  c.metaDescricao || c.descricao || BLOG[idioma].lista.tagDescricao(c.nome);

export const descricaoDaTag = (t: TagDoBlog, idioma: Idioma) =>
  t.descricao || BLOG[idioma].lista.tagDescricao(t.nome);

// ---------------------------------------------------------------------------
// As dicas do editor
// ---------------------------------------------------------------------------

export type NivelDaDica = 'ok' | 'atencao' | 'erro';

export interface Dica {
  id: string;
  nivel: NivelDaDica;
  titulo: string;
  detalhe: string;
}

export interface ArtigoEmEdicao {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: unknown;
  capa: string;
  capaAlt: string;
  metaTitulo: string;
  metaDescricao: string;
  palavrasChave: string[];
  categorias: number;
  tags: number;
}

/**
 * As regras de SEO, uma a uma, sobre o artigo como está no editor.
 *
 * Nada aqui impede de salvar: o artigo sai bom mesmo sem mexer (os padrões
 * acima cobrem). As dicas dizem o que o padrão escolheu e como fazer melhor.
 */
export function avaliarSeo(a: ArtigoEmEdicao): {
  dicas: Dica[];
  nota: number;
  titulo: string;
  descricao: string;
} {
  const dicas: Dica[] = [];
  const add = (
    id: string,
    nivel: NivelDaDica,
    titulo: string,
    detalhe: string
  ) => dicas.push({ id, nivel, titulo, detalhe });

  const titulo = (a.metaTitulo.trim() || a.titulo).trim();
  const descricao =
    a.metaDescricao.trim() ||
    a.resumo.trim() ||
    resumoDoConteudo(a.conteudo, LIMITES.descricao.max);
  const palavras = contarPalavras(a.conteudo);
  const titulos = titulosDoArtigo(a.conteudo);
  const tipos = tiposDeBloco(a.conteudo);
  const imagens = imagensDoArtigo(a.conteudo);
  const internos = linksDoArtigo(a.conteudo).filter(
    (h) => h.startsWith('/') || h.includes('opusatlas.com.br')
  );

  // Título
  if (!titulo) {
    add(
      'titulo',
      'erro',
      'Falta o título',
      'O título é o que aparece no Google.'
    );
  } else if (titulo.length > LIMITES.titulo.max) {
    add(
      'titulo',
      'atencao',
      `Título com ${titulo.length} caracteres`,
      `O Google corta depois de uns ${LIMITES.titulo.max}. Escreva um título de SEO mais curto (o do artigo continua o mesmo).`
    );
  } else if (titulo.length < LIMITES.titulo.min) {
    add(
      'titulo',
      'atencao',
      `Título com ${titulo.length} caracteres`,
      `Títulos entre ${LIMITES.titulo.min} e ${LIMITES.titulo.max} caracteres aproveitam o espaço do resultado da busca.`
    );
  } else {
    add(
      'titulo',
      'ok',
      'Título no tamanho certo',
      `${titulo.length} caracteres.`
    );
  }

  // Descrição
  if (!descricao) {
    add(
      'descricao',
      'erro',
      'Sem descrição',
      'Escreva o resumo do card ou a descrição de SEO: é o texto embaixo do título no Google.'
    );
  } else if (!a.metaDescricao.trim() && !a.resumo.trim()) {
    add(
      'descricao',
      'atencao',
      'Descrição tirada do primeiro parágrafo',
      'Funciona, mas uma descrição escrita para a busca convence mais quem decide se clica.'
    );
  } else if (descricao.length > LIMITES.descricao.max) {
    add(
      'descricao',
      'atencao',
      `Descrição com ${descricao.length} caracteres`,
      `O Google mostra cerca de ${LIMITES.descricao.max}; o resto é cortado com reticências.`
    );
  } else if (descricao.length < LIMITES.descricao.min) {
    add(
      'descricao',
      'atencao',
      `Descrição com ${descricao.length} caracteres`,
      `Entre ${LIMITES.descricao.min} e ${LIMITES.descricao.max} caracteres dá para dizer do que o artigo trata e por que ler.`
    );
  } else {
    add(
      'descricao',
      'ok',
      'Descrição no tamanho certo',
      `${descricao.length} caracteres.`
    );
  }

  // Endereço
  if (!a.slug) {
    add(
      'slug',
      'erro',
      'Falta o endereço',
      'O endereço sai do título; confira antes de publicar.'
    );
  } else if (a.slug.length > LIMITES.slug) {
    add(
      'slug',
      'atencao',
      'Endereço longo',
      'Endereços curtos, com as palavras principais, são mais fáceis de compartilhar e de ler no resultado.'
    );
  } else {
    add('slug', 'ok', 'Endereço curto', `/blog/${a.slug}`);
  }

  // Capa
  if (!a.capa) {
    add(
      'capa',
      'atencao',
      'Sem capa',
      'O artigo aparece com a capa de reserva e, nas redes, com o logo. Uma imagem própria rende mais cliques.'
    );
  } else if (!a.capaAlt.trim()) {
    add(
      'capa-alt',
      'erro',
      'A capa não tem texto alternativo',
      'Descreva a imagem em uma frase: é o que o leitor de tela lê e o que o Google Imagens indexa.'
    );
  } else {
    add('capa', 'ok', 'Capa com texto alternativo', a.capaAlt);
  }

  // Texto
  if (palavras < LIMITES.palavras) {
    add(
      'palavras',
      'atencao',
      `Texto com ${palavras} palavras`,
      `Artigos com mais de ${LIMITES.palavras} palavras costumam ser os que a busca entende como completos.`
    );
  } else {
    add(
      'palavras',
      'ok',
      `Texto com ${palavras} palavras`,
      'Bom tamanho para a busca.'
    );
  }

  if (titulos.length === 0 && palavras >= 300) {
    add(
      'subtitulos',
      'atencao',
      'Sem subtítulos',
      'Divida o texto em seções: o sumário nasce delas, e o Google pode mostrar link direto para cada uma.'
    );
  } else if (titulos.length > 0) {
    add(
      'subtitulos',
      'ok',
      `${titulos.length} ${titulos.length === 1 ? 'subtítulo' : 'subtítulos'}`,
      'O sumário do artigo é montado a partir deles.'
    );
  }

  const semAlt = imagens.filter((i) => !i.alt.trim()).length;
  if (semAlt > 0) {
    add(
      'imagens-alt',
      'erro',
      `${semAlt} ${semAlt === 1 ? 'imagem sem' : 'imagens sem'} texto alternativo`,
      'Abra a imagem no editor e descreva o que ela mostra.'
    );
  }

  if (
    internos.length === 0 &&
    !tipos.has('composerCard') &&
    !tipos.has('workCard')
  ) {
    add(
      'links',
      'atencao',
      'Nenhum link para o acervo',
      'Um link para o compositor ou a obra (ou um cartão deles) ajuda o leitor e a busca a ligar o artigo à enciclopédia.'
    );
  } else {
    add(
      'links',
      'ok',
      'Ligado ao acervo',
      'O artigo leva o leitor a outras páginas do site.'
    );
  }

  if (a.categorias === 0) {
    add(
      'categoria',
      'erro',
      'Sem categoria',
      'Toda página de artigo mostra a categoria na trilha.'
    );
  }

  if (a.tags === 0 && a.palavrasChave.length === 0) {
    add(
      'tags',
      'atencao',
      'Sem assuntos',
      'Tags viram páginas de assunto, que o Google também indexa. Use duas ou três.'
    );
  }

  const pesos = { ok: 1, atencao: 0.5, erro: 0 } as const;
  const nota = dicas.length
    ? Math.round(
        (dicas.reduce((soma, d) => soma + pesos[d.nivel], 0) / dicas.length) *
          100
      )
    : 0;

  return {
    dicas,
    nota,
    titulo,
    descricao: cortar(descricao, LIMITES.descricao.max),
  };
}
