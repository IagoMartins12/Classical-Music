import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { PiArrowRight, PiDownloadSimple } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import {
  documento,
  titulosDoArtigo,
  type NoTipTap,
} from '@/app/utils/blog/tiptap';
import { idDoYoutube } from './useFonteDeAudio';
import {
  AudioNoTexto,
  PartituraNoTexto,
  VideoDoYoutube,
} from './blocosInterativos';
import { Capa } from './Capa';
import { LINK } from './pecas';

/**
 * O corpo do artigo: o JSON do editor (TipTap) virando HTML.
 *
 * **Renderizado no servidor.** O leitor antigo (`ArticleContent`) montava o
 * texto no navegador, num `useEffect`, com `innerHTML`. Dois problemas: o
 * robô de busca recebia a página sem uma palavra do artigo, e qualquer `<`
 * guardado num campo virava HTML na página do leitor (XSS armazenado — a API
 * passou a recusar `<` e `>` por causa disso). Aqui cada bloco vira um
 * elemento React: o texto sai no HTML e o React escapa tudo.
 *
 * Também funciona no navegador (a prévia do editor usa o mesmo componente):
 * nada aqui é só de servidor; o que precisa de clique mora em
 * `blocosInterativos`.
 *
 * Cobre todos os nós e marcas que a política de conteúdo da API aceita
 * (`article-content.policy.ts`). Nó desconhecido some sem derrubar a página.
 *
 * **O que fica de fora de propósito:** a cor de texto (`textStyle.color`). O
 * editor deixava pintar palavras; o blog segue a paleta contida, e a ênfase
 * vem do negrito e do itálico.
 */

type Texto = (typeof BLOG)[Idioma];

interface Contexto {
  t: Texto;
  /** Os ids dos títulos de primeiro nível, na ordem. */
  ids: string[];
  /** O nível de cada título de primeiro nível, já normalizado. */
  niveis: Array<2 | 3 | 4>;
  /** Contador de títulos já desenhados. */
  proximoTitulo: { i: number };
}

const SITE = /^(\/(?!\/)|https?:\/\/(www\.)?opusatlas\.com\.br)/;

function aplicarMarcas(
  no: NoTipTap,
  conteudo: ReactNode,
  ctx: Contexto,
  chave: string
) {
  let saida = conteudo;
  for (const marca of no.marks ?? []) {
    switch (marca.type) {
      case 'bold':
        saida = <strong>{saida}</strong>;
        break;
      case 'italic':
        saida = <em>{saida}</em>;
        break;
      case 'underline':
        saida = <u>{saida}</u>;
        break;
      case 'strike':
        saida = <s>{saida}</s>;
        break;
      case 'code':
        saida = <code>{saida}</code>;
        break;
      case 'link': {
        const href = String(marca.attrs?.href ?? '');
        if (!href) break;
        if (SITE.test(href) || href.startsWith('#')) {
          saida = (
            <Link
              href={
                href.replace(/^https?:\/\/(www\.)?opusatlas\.com\.br/, '') ||
                '/'
              }
            >
              {saida}
            </Link>
          );
        } else {
          saida = (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {saida}
              <span className="sr-only"> {ctx.t.corpo.abreEmNovaAba}</span>
            </a>
          );
        }
        break;
      }
      // `textStyle` (cor): ignorada — ver o comentário do componente.
      default:
        break;
    }
  }
  return <span key={chave}>{saida}</span>;
}

function inline(
  nos: NoTipTap[] | undefined,
  ctx: Contexto,
  prefixo: string
): ReactNode[] {
  return (nos ?? []).map((no, i) => {
    const chave = `${prefixo}-${i}`;
    if (no.type === 'hardBreak') return <br key={chave} />;
    if (no.type === 'text') {
      return no.marks?.length ? (
        aplicarMarcas(no, no.text ?? '', ctx, chave)
      ) : (
        <span key={chave}>{no.text}</span>
      );
    }
    return null;
  });
}

const alinhamento = (no: NoTipTap): CSSProperties | undefined => {
  const valor = no.attrs?.textAlign;
  return valor === 'center' || valor === 'right'
    ? { textAlign: valor }
    : undefined;
};

const texto = (valor: unknown) =>
  typeof valor === 'string' ? valor.trim() : '';

function bloco(
  no: NoTipTap,
  ctx: Contexto,
  chave: string,
  raiz: boolean
): ReactNode {
  const a = no.attrs ?? {};
  const t = ctx.t;

  switch (no.type) {
    case 'paragraph': {
      if (!no.content?.length) return null;
      return (
        <p key={chave} style={alinhamento(no)}>
          {inline(no.content, ctx, chave)}
        </p>
      );
    }

    case 'heading': {
      const conteudo = inline(no.content, ctx, chave);
      if (raiz) {
        const i = ctx.proximoTitulo.i++;
        const nivel = ctx.niveis[i] ?? 2;
        const Tag = `h${nivel}` as 'h2' | 'h3' | 'h4';
        return (
          <Tag key={chave} id={ctx.ids[i]} style={alinhamento(no)}>
            {conteudo}
          </Tag>
        );
      }
      return <h4 key={chave}>{conteudo}</h4>;
    }

    case 'bulletList':
      return <ul key={chave}>{filhos(no, ctx, chave)}</ul>;

    case 'orderedList': {
      const inicio = Number(a.start ?? 1);
      return (
        <ol key={chave} start={inicio > 1 ? inicio : undefined}>
          {filhos(no, ctx, chave)}
        </ol>
      );
    }

    case 'listItem':
      return <li key={chave}>{filhos(no, ctx, chave)}</li>;

    case 'blockquote':
      return <blockquote key={chave}>{filhos(no, ctx, chave)}</blockquote>;

    case 'codeBlock':
      return (
        <pre key={chave}>
          <code>{(no.content ?? []).map((c) => c.text ?? '').join('')}</code>
        </pre>
      );

    case 'horizontalRule':
      return <hr key={chave} />;

    case 'image': {
      const src = texto(a.src);
      if (!src) return null;
      const legenda = texto(a.title);
      return (
        <figure key={chave}>
          <Image
            src={src}
            alt={texto(a.alt)}
            width={1440}
            height={960}
            sizes="(min-width: 768px) 720px, 100vw"
            className="h-auto w-full rounded-card"
          />
          {legenda && <figcaption>{legenda}</figcaption>}
        </figure>
      );
    }

    case 'youtube': {
      const src = texto(a.src);
      if (!src || !idDoYoutube(src)) return null;
      return (
        <div key={chave} className="blog-bloco">
          <VideoDoYoutube
            url={src}
            titulo={t.corpo.video}
            inicio={Number(a.start) || null}
            rotuloTocar={t.corpo.tocarVideo}
          />
        </div>
      );
    }

    case 'composerCard':
      return <CartaoDeCompositor key={chave} a={a} t={t} />;

    case 'workCard':
      return <CartaoDeObra key={chave} a={a} t={t} />;

    case 'scoreViewer':
      return <Partitura key={chave} a={a} t={t} />;

    case 'audioPlayer': {
      const url = texto(a.audioUrl);
      if (!url) return null;
      const tipo =
        a.audioType === 'youtube' || idDoYoutube(url) ? 'youtube' : 'arquivo';
      const titulo = texto(a.title) || t.corpo.ouvirMusica;
      return (
        <div
          key={chave}
          className="blog-bloco flex flex-col gap-3 rounded-card bg-sup-2 p-5"
        >
          <div className="flex flex-col gap-0.5">
            <p className="font-display text-xl leading-tight">{titulo}</p>
            {(texto(a.composerName) || texto(a.workTitle)) && (
              <p className="flex flex-wrap gap-x-3 text-[0.875rem] text-texto-suave">
                {texto(a.composerName) &&
                  (a.composerId ? (
                    <Link
                      href={`/composer/${a.composerId}`}
                      className="underline decoration-linha-forte underline-offset-4 hover:decoration-ouro"
                    >
                      {texto(a.composerName)}
                    </Link>
                  ) : (
                    <span>{texto(a.composerName)}</span>
                  ))}
                {texto(a.workTitle) &&
                  (a.workId ? (
                    <Link
                      href={`/works/${a.workId}`}
                      className="underline decoration-linha-forte underline-offset-4 hover:decoration-ouro"
                    >
                      {texto(a.workTitle)}
                    </Link>
                  ) : (
                    <span>{texto(a.workTitle)}</span>
                  ))}
              </p>
            )}
          </div>
          <AudioNoTexto
            url={url}
            tipo={tipo}
            titulo={titulo}
            rotulos={{
              tocar: t.corpo.tocar,
              pausar: t.corpo.pausar,
              posicao: t.corpo.posicao,
            }}
          />
        </div>
      );
    }

    case 'timeline':
      return <LinhaDoTempo key={chave} a={a} t={t} />;

    case 'videoComparison': {
      const videos = [a.video1, a.video2].filter(
        (v): v is { url: string; title?: string; description?: string } =>
          !!v &&
          typeof v === 'object' &&
          typeof (v as { url?: unknown }).url === 'string'
      );
      if (videos.length === 0) return null;
      return (
        <section key={chave} className="blog-bloco flex flex-col gap-4">
          <p className="font-display text-xl leading-tight">
            {texto(a.title) || t.corpo.comparacao}
          </p>
          <div
            className={cx(
              'grid gap-5',
              videos.length > 1 &&
                a.layout !== 'stacked' &&
                // O editor grava `top-bottom`; `stacked` é de artigos antigos.
                a.layout !== 'top-bottom' &&
                'sm:grid-cols-2'
            )}
          >
            {videos.map((v, i) => (
              <div key={i} className="flex flex-col gap-2">
                <VideoDoYoutube
                  url={v.url}
                  titulo={texto(v.title) || t.corpo.video}
                  rotuloTocar={t.corpo.tocarVideo}
                />
                {texto(v.title) && (
                  <p className="text-[0.9375rem] font-medium">
                    {texto(v.title)}
                  </p>
                )}
                {texto(v.description) && (
                  <p className="text-[0.875rem] text-texto-suave">
                    {texto(v.description)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'quoteMusical': {
      const citacao = texto(a.quote);
      if (!citacao) return null;
      const audio = texto(a.backgroundAudioUrl);
      return (
        <figure key={chave}>
          <blockquote>
            <p>{citacao}</p>
          </blockquote>
          {(texto(a.author) || audio) && (
            <figcaption className="flex flex-wrap items-center justify-between gap-3">
              {texto(a.author) && (
                <cite className="not-italic">{texto(a.author)}</cite>
              )}
              {audio && (
                <AudioNoTexto
                  compacto
                  url={audio}
                  tipo={
                    a.backgroundAudioType === 'youtube' || idDoYoutube(audio)
                      ? 'youtube'
                      : 'arquivo'
                  }
                  titulo={t.corpo.ouvirMusica}
                  rotulos={{
                    tocar: t.corpo.tocar,
                    pausar: t.corpo.pausar,
                    posicao: t.corpo.posicao,
                  }}
                />
              )}
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      return null;
  }
}

function filhos(no: NoTipTap, ctx: Contexto, chave: string): ReactNode[] {
  return (no.content ?? []).map((filho, i) =>
    bloco(filho, ctx, `${chave}-${i}`, false)
  );
}

// ---------------------------------------------------------------------------
// Os blocos próprios da plataforma
// ---------------------------------------------------------------------------

type Attrs = Record<string, unknown>;

function CartaoDeCompositor({ a, t }: { a: Attrs; t: Texto }) {
  const nome = texto(a.composerName);
  if (!nome) return null;
  const datas = [texto(a.composerBirthDate), texto(a.composerDeathDate)]
    .filter(Boolean)
    .join(' – ');
  const linha = [texto(a.composerEpoch), texto(a.composerNationality)]
    .filter(Boolean)
    .join(', ');
  const horizontal = a.layout !== 'vertical';

  return (
    <aside
      className={cx(
        'blog-bloco flex gap-5 rounded-card bg-sup-2 p-5',
        horizontal ? 'flex-row items-start' : 'flex-col'
      )}
    >
      <Capa
        src={texto(a.composerImage) || null}
        alt=""
        inicial={nome}
        sizes="112px"
        className={cx(
          'shrink-0 rounded-controle',
          horizontal ? 'aspect-[3/4] w-24 sm:w-28' : 'aspect-[4/3] w-full'
        )}
      />
      <div className="flex min-w-0 flex-col gap-2">
        <div>
          <p className="font-display text-[1.5rem] leading-tight">{nome}</p>
          {(datas || linha) && (
            <p className="flex flex-wrap gap-x-3 text-[0.8125rem] text-texto-fraco">
              {datas && <span className="t-dado">{datas}</span>}
              {linha && <span>{linha}</span>}
            </p>
          )}
        </div>
        {texto(a.composerInstrumentation) && (
          <p className="text-[0.875rem] text-texto-suave">
            {texto(a.composerInstrumentation)}
          </p>
        )}
        {texto(a.composerBio) && (
          <p className="line-clamp-4 text-[0.9375rem] leading-[1.55] text-texto-suave">
            {texto(a.composerBio)}
          </p>
        )}
        {typeof a.composerId === 'string' && a.composerId && (
          <p className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
            <Link href={`/composer/${a.composerId}`} className={LINK}>
              {t.corpo.verNoAcervo}
              <Icon de={PiArrowRight} tamanho="pp" />
            </Link>
            {a.showWorksButton !== false && (
              <Link href={`/composer/${a.composerId}#works`} className={LINK}>
                {t.corpo.verObras}
              </Link>
            )}
            {texto(a.composerWikipediaLink).startsWith('https://') && (
              <a
                href={texto(a.composerWikipediaLink)}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                Wikipedia
              </a>
            )}
          </p>
        )}
      </div>
    </aside>
  );
}

function CartaoDeObra({ a, t }: { a: Attrs; t: Texto }) {
  const titulo = texto(a.workTitle);
  if (!titulo) return null;
  const linha = [texto(a.composerName), texto(a.instrumentName)]
    .filter(Boolean)
    .join(', ');

  return (
    <aside className="blog-bloco flex flex-col gap-2 rounded-card bg-sup-2 p-5">
      <p className="font-display text-[1.5rem] leading-tight">{titulo}</p>
      {linha && <p className="text-[0.875rem] text-texto-suave">{linha}</p>}
      {typeof a.workId === 'string' && a.workId && (
        <p className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
          <Link href={`/works/${a.workId}`} className={LINK}>
            {t.corpo.verObra}
            <Icon de={PiArrowRight} tamanho="pp" />
          </Link>
          <Link href={`/works/${a.workId}#scores`} className={LINK}>
            {t.corpo.verPartituras}
          </Link>
        </p>
      )}
    </aside>
  );
}

function Partitura({ a, t }: { a: Attrs; t: Texto }) {
  const url = texto(a.scoreUrl);
  if (!url) return null;
  const titulo = texto(a.scoreTitle) || t.corpo.partitura;
  const linha = [texto(a.workTitle), texto(a.composerName)]
    .filter(Boolean)
    .join(', ');
  const pagina = Number(a.pageNumber) || 1;

  return (
    <section className="blog-bloco flex flex-col gap-3 rounded-card bg-sup-2 p-5">
      <div>
        <p className="font-display text-[1.5rem] leading-tight">{titulo}</p>
        {linha && <p className="text-[0.875rem] text-texto-suave">{linha}</p>}
        {pagina > 1 && <p className="t-legenda">{t.corpo.pagina(pagina)}</p>}
      </div>
      <PartituraNoTexto
        url={url}
        titulo={titulo}
        pagina={pagina}
        rotuloAbrir={t.corpo.abrirPartitura}
      />
      <p className="flex flex-wrap gap-x-5 gap-y-1">
        {a.allowDownload !== false && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            <Icon de={PiDownloadSimple} tamanho="pp" />
            {t.corpo.baixarPartitura}
            <span className="sr-only"> {t.corpo.abreEmNovaAba}</span>
          </a>
        )}
        {typeof a.workId === 'string' && a.workId && (
          <Link href={`/works/${a.workId}#scores`} className={LINK}>
            {t.corpo.verPartituras}
          </Link>
        )}
      </p>
    </section>
  );
}

function LinhaDoTempo({ a, t }: { a: Attrs; t: Texto }) {
  const eventos = Array.isArray(a.events)
    ? (a.events as Array<Record<string, unknown>>).filter((e) => texto(e.title))
    : [];
  if (eventos.length === 0) return null;
  const nome = texto(a.composerName);

  return (
    <section className="blog-bloco">
      <p className="font-display text-[1.375rem] leading-tight">
        {nome ? t.corpo.linhaDoTempo(nome) : t.corpo.linhaDoTempoSemNome}
      </p>
      <ol className="mt-3">
        {eventos.map((e, i) => (
          <li
            key={texto(e.id) || i}
            className="grid gap-x-6 gap-y-1 border-t border-linha py-4 sm:grid-cols-[8rem_minmax(0,1fr)]"
          >
            <span className="t-dado pt-0.5 text-[0.875rem] text-ouro-texto">
              {texto(e.date)}
            </span>
            <span className="flex flex-col gap-1.5">
              <span className="font-medium">{texto(e.title)}</span>
              {texto(e.description) && (
                <span className="text-[0.9375rem] leading-[1.55] text-texto-suave">
                  {texto(e.description)}
                </span>
              )}
              {texto(e.image) && (
                <Image
                  src={texto(e.image)}
                  alt={texto(e.title)}
                  width={640}
                  height={420}
                  sizes="(min-width: 640px) 520px, 100vw"
                  className="mt-1 h-auto w-full max-w-md rounded-controle"
                />
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function CorpoDoArtigo({
  conteudo,
  idioma,
  lang = 'pt-BR',
  className,
}: {
  conteudo: unknown;
  idioma: Idioma;
  /** O idioma do texto (o original, ou o da tradução). */
  lang?: string;
  className?: string;
}) {
  const doc = documento(conteudo);
  const titulos = titulosDoArtigo(conteudo);
  // Só os títulos de primeiro nível do documento entram no sumário; são os
  // mesmos que `titulosDoArtigo` lê, na mesma ordem.
  const ctx: Contexto = {
    t: BLOG[idioma],
    ids: titulos.map((t) => t.id),
    niveis: titulos.map((t) => t.nivel),
    proximoTitulo: { i: 0 },
  };

  return (
    <div lang={lang} className={cx('blog-corpo', className)}>
      {(doc.content ?? [])
        .filter(
          (no) =>
            no.type !== 'heading' ||
            (no.content ?? []).some((c) => (c.text ?? '').trim())
        )
        .map((no, i) => bloco(no, ctx, `b${i}`, true))}
    </div>
  );
}

/**
 * Um bloco só, desenhado como no artigo. É o que o editor mostra no lugar
 * dos blocos próprios (cartão de compositor, player, linha do tempo…): quem
 * escreve vê o bloco como o leitor vai ver, sem uma segunda versão dele para
 * manter.
 */
export function BlocoDoArtigo({
  no,
  idioma = 'pt',
}: {
  no: NoTipTap;
  idioma?: Idioma;
}) {
  const ctx: Contexto = {
    t: BLOG[idioma],
    ids: [],
    niveis: [],
    proximoTitulo: { i: 0 },
  };
  return <>{bloco(no, ctx, 'bloco', true)}</>;
}
