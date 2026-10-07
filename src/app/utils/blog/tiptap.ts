/**
 * Leitura do conteúdo do artigo (o JSON do TipTap) sem DOM.
 *
 * O leitor antigo montava o texto no navegador, com `innerHTML`: o robô de
 * busca recebia o título e a capa e nenhuma palavra do artigo. Tudo que
 * precisa do texto — o corpo renderizado no servidor, o sumário, a
 * descrição padrão de SEO, a contagem de palavras, as dicas do editor — sai
 * daqui, sem depender de navegador.
 */

export interface NoTipTap {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: NoTipTap[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

/** O documento, ou um documento vazio quando o conteúdo não é um. */
export function documento(conteudo: unknown): NoTipTap {
  if (conteudo && typeof conteudo === 'object' && !Array.isArray(conteudo)) {
    const doc = conteudo as NoTipTap;
    if (Array.isArray(doc.content)) return doc;
  }
  return { type: 'doc', content: [] };
}

/** O texto corrido de um nó, com os filhos. */
export function textoDoNo(no: NoTipTap | undefined): string {
  if (!no) return '';
  if (no.type === 'text') return no.text ?? '';
  if (no.type === 'hardBreak') return ' ';
  return (no.content ?? []).map(textoDoNo).join('');
}

/** Blocos cujo texto conta como texto do artigo. */
const BLOCOS_DE_TEXTO = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
]);

/** O texto do artigo, bloco a bloco, sem os blocos de mídia. */
export function blocosDeTexto(conteudo: unknown): string[] {
  const saida: string[] = [];

  const visitar = (no: NoTipTap) => {
    if (no.type === 'paragraph' || no.type === 'heading') {
      const texto = textoDoNo(no).replace(/\s+/g, ' ').trim();
      if (texto) saida.push(texto);
      return;
    }
    if (no.type === 'quoteMusical') {
      const citacao = String(no.attrs?.quote ?? '').trim();
      if (citacao) saida.push(citacao);
      return;
    }
    if (no.type === 'doc' || BLOCOS_DE_TEXTO.has(no.type ?? '')) {
      (no.content ?? []).forEach(visitar);
    }
  };

  visitar(documento(conteudo));
  return saida;
}

export function textoDoArtigo(conteudo: unknown): string {
  return blocosDeTexto(conteudo).join(' ');
}

export function contarPalavras(conteudo: unknown): number {
  const texto = textoDoArtigo(conteudo);
  return texto ? texto.split(/\s+/).filter(Boolean).length : 0;
}

/**
 * O primeiro parágrafo de verdade, cortado numa palavra inteira. É a
 * descrição de SEO quando o autor não escreveu nenhuma.
 */
export function resumoDoConteudo(conteudo: unknown, limite = 155): string {
  const doc = documento(conteudo);
  const paragrafo = (doc.content ?? [])
    .filter((no) => no.type === 'paragraph')
    .map((no) => textoDoNo(no).replace(/\s+/g, ' ').trim())
    .find((texto) => texto.length >= 40);

  return paragrafo ? cortar(paragrafo, limite) : '';
}

/** Corta na última palavra que cabe, com reticências. */
export function cortar(texto: string, limite: number): string {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;
  const corte = limpo.slice(0, limite - 1);
  const espaco = corte.lastIndexOf(' ');
  return `${(espaco > limite * 0.6 ? corte.slice(0, espaco) : corte).replace(/[\s,;:.–-]+$/, '')}…`;
}

/** "Um tema feito para não dar certo" → "um-tema-feito-para-nao-dar-certo". */
export function ancora(texto: string): string {
  return (
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'secao'
  );
}

export interface TituloDoArtigo {
  /** O id do título na página (e a âncora do sumário). */
  id: string;
  texto: string;
  /** O nível na página, já normalizado: 2, 3 ou 4. */
  nivel: 2 | 3 | 4;
}

/**
 * Os títulos do corpo, com o nível que vão ter na página.
 *
 * **O `h1` é da página.** O editor deixa o autor usar os níveis 1 a 3, e o
 * leitor antigo escrevia `h1` dentro do artigo — dois `h1` na página, ou um
 * `h1` seguido de `h3`, que o leitor de tela e o buscador leem como um
 * buraco na hierarquia. Aqui o menor nível usado vira `h2`, o seguinte
 * `h3`, e assim por diante: a ordem que o autor escolheu fica, os números
 * passam a ser os da página.
 *
 * Ids repetidos ganham sufixo (`-2`, `-3`): dois títulos iguais não podem
 * ter a mesma âncora.
 */
export function titulosDoArtigo(conteudo: unknown): TituloDoArtigo[] {
  const brutos = (documento(conteudo).content ?? [])
    .filter((no) => no.type === 'heading')
    .map((no) => ({
      nivel: Number(no.attrs?.level ?? 2),
      texto: textoDoNo(no).replace(/\s+/g, ' ').trim(),
    }))
    .filter((t) => t.texto);

  // Um nível que aparece uma vez só no topo (o "h1" solto de uma conclusão,
  // num artigo de capítulos em h2) não é o nível principal: ele se junta ao
  // seguinte. Sem isso, os doze capítulos desciam para h3 e o sumário ficava
  // com um item.
  const contagem = new Map<number, number>();
  for (const t of brutos)
    contagem.set(t.nivel, (contagem.get(t.nivel) ?? 0) + 1);
  let niveis = [...contagem.keys()].sort((a, b) => a - b);
  while (niveis.length > 1 && contagem.get(niveis[0]) === 1) {
    const [solto, seguinte] = niveis;
    for (const t of brutos) if (t.nivel === solto) t.nivel = seguinte;
    niveis = niveis.slice(1);
  }
  const usados = new Map<string, number>();

  return brutos.map((t) => {
    const base = ancora(t.texto);
    const vezes = (usados.get(base) ?? 0) + 1;
    usados.set(base, vezes);
    return {
      id: vezes === 1 ? base : `${base}-${vezes}`,
      texto: t.texto,
      nivel: Math.min(2 + niveis.indexOf(t.nivel), 4) as 2 | 3 | 4,
    };
  });
}

/** Tempo de leitura: 200 palavras por minuto, nunca menos de 1. */
export function minutosDeLeitura(conteudo: unknown): number {
  return Math.max(1, Math.round(contarPalavras(conteudo) / 200));
}

/** Os tipos de bloco que o artigo usa — as dicas do editor olham para eles. */
export function tiposDeBloco(conteudo: unknown): Set<string> {
  const tipos = new Set<string>();
  const visitar = (no: NoTipTap) => {
    if (no.type) tipos.add(no.type);
    (no.content ?? []).forEach(visitar);
  };
  visitar(documento(conteudo));
  return tipos;
}

/** Os links do corpo, para saber quantos levam ao próprio site. */
export function linksDoArtigo(conteudo: unknown): string[] {
  const links: string[] = [];
  const visitar = (no: NoTipTap) => {
    for (const marca of no.marks ?? []) {
      if (marca.type === 'link' && typeof marca.attrs?.href === 'string') {
        links.push(marca.attrs.href);
      }
    }
    (no.content ?? []).forEach(visitar);
  };
  visitar(documento(conteudo));
  return links;
}

/** As imagens do corpo, com o texto alternativo de cada uma. */
export function imagensDoArtigo(
  conteudo: unknown
): Array<{ src: string; alt: string }> {
  const imagens: Array<{ src: string; alt: string }> = [];
  const visitar = (no: NoTipTap) => {
    if (no.type === 'image' && typeof no.attrs?.src === 'string') {
      imagens.push({ src: no.attrs.src, alt: String(no.attrs.alt ?? '') });
    }
    (no.content ?? []).forEach(visitar);
  };
  visitar(documento(conteudo));
  return imagens;
}
