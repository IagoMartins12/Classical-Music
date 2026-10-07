/**
 * Os textos de um documento do editor (TipTap), para traduzir sem tocar na
 * estrutura.
 *
 * A tradução automática recebe só a lista de textos (ver
 * `BlogTranslationService` na API): os nós de texto, na ordem, e os
 * atributos de bloco que o leitor mostra como texto (a citação, a legenda da
 * imagem, os momentos da linha do tempo…). `aplicar` devolve uma cópia do
 * documento com os textos trocados — títulos, listas, links, negritos e
 * blocos continuam exatamente onde estavam.
 */

type No = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: No[];
};

/** Atributos de texto que o leitor mostra, por tipo de bloco. */
const ATRIBUTOS: Record<string, string[]> = {
  image: ['alt', 'title'],
  quoteMusical: ['quote'],
  audioPlayer: ['title'],
  videoComparison: ['title'],
  composerCard: ['composerBio'],
  scoreViewer: ['scoreTitle'],
};

interface Ponto {
  ler: () => string;
  gravar: (texto: string) => void;
}

function pontosDe(raiz: No): Ponto[] {
  const pontos: Ponto[] = [];
  const visitar = (no: No) => {
    if (no.type === 'text' && typeof no.text === 'string') {
      pontos.push({
        ler: () => no.text as string,
        gravar: (t) => (no.text = t),
      });
    }
    const attrs = no.attrs;
    if (attrs && no.type) {
      for (const chave of ATRIBUTOS[no.type] ?? []) {
        if (
          typeof attrs[chave] === 'string' &&
          (attrs[chave] as string).trim()
        ) {
          pontos.push({
            ler: () => attrs[chave] as string,
            gravar: (t) => (attrs[chave] = t),
          });
        }
      }
      if (no.type === 'videoComparison') {
        for (const v of ['video1', 'video2']) {
          const video = attrs[v] as Record<string, unknown> | undefined;
          for (const chave of ['title', 'description']) {
            if (
              video &&
              typeof video[chave] === 'string' &&
              (video[chave] as string).trim()
            ) {
              pontos.push({
                ler: () => video[chave] as string,
                gravar: (t) => (video[chave] = t),
              });
            }
          }
        }
      }
      if (no.type === 'timeline' && Array.isArray(attrs.events)) {
        for (const evento of attrs.events as Array<Record<string, unknown>>) {
          for (const chave of ['title', 'description']) {
            if (
              typeof evento[chave] === 'string' &&
              (evento[chave] as string).trim()
            ) {
              pontos.push({
                ler: () => evento[chave] as string,
                gravar: (t) => (evento[chave] = t),
              });
            }
          }
        }
      }
    }
    no.content?.forEach(visitar);
  };
  visitar(raiz);
  return pontos;
}

export function textosDoDocumento(documento: unknown): {
  textos: string[];
  aplicar: (traduzidos: string[]) => unknown;
} {
  const copia: No = structuredClone(
    documento && typeof documento === 'object'
      ? (documento as No)
      : { type: 'doc', content: [] }
  );
  const pontos = pontosDe(copia);
  return {
    textos: pontos.map((p) => p.ler()),
    aplicar: (traduzidos) => {
      if (traduzidos.length !== pontos.length) {
        throw new Error('A tradução voltou com outro número de trechos.');
      }
      pontos.forEach((p, i) => p.gravar(traduzidos[i]));
      return copia;
    },
  };
}
