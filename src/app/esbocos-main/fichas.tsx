'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiArrowRight,
  PiBookmarkSimple,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiCheckCircle,
  PiDownloadSimple,
  PiFilmSlate,
  PiHeart,
  PiLightbulb,
  PiMagnifyingGlass,
  PiPause,
  PiPencilSimpleLine,
  PiPlay,
  PiSparkle,
  PiSpotifyLogo,
  PiStar,
  PiUploadSimple,
  PiYoutubeLogo,
  PiUsers,
  PiWaveform,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import Image from '@/app/components/SmartImage';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { destino, formatar, rota, type EsbocoId } from './dados';
import {
  ADICOES,
  CURIOSIDADES,
  DESCOBERTAS,
  TIPOS,
  contar,
  totalDe,
  type Artigo,
  type FichaCompositor,
  type FichaObra,
  type Grupo,
  type Midia,
  type Partituras,
  type TipoPartitura,
} from './fichas-dados';
import { Retrato, linkTexto, useEsboco } from './pecas';

/**
 * As peças de compositor e obra que os três esboços compõem cada um a seu
 * modo. A regra de todas: **mostrar o que existe**. Seção sem dado não
 * aparece; o que falta vira um convite para completar (envio da comunidade,
 * com XP). Quase toda página do acervo é a "típica", não a do Chopin.
 */

// ---------------------------------------------------------------------------
// Carrossel
// ---------------------------------------------------------------------------

/** Faixa que rola de lado, com setas no computador (o carrossel de hoje, no sistema). */
export function Carrossel({
  rotulo,
  children,
  className,
}: {
  rotulo: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const passo = (dir: 1 | -1) =>
    ref.current?.scrollBy({
      left: dir * ref.current.clientWidth * 0.8,
      behavior: 'smooth',
    });
  return (
    <div className={cx('relative', className)}>
      <ul
        ref={ref}
        aria-label={rotulo}
        className="faixa-rola -mx-4 flex gap-5 overflow-x-auto scroll-smooth px-4 pb-2"
      >
        {children}
      </ul>
      <div className="mt-3 flex justify-end gap-2 max-md:hidden">
        <Button
          tamanho="p"
          variante="secundario"
          icone={PiCaretLeft}
          rotulo="Anteriores"
          onClick={() => passo(-1)}
        />
        <Button
          tamanho="p"
          variante="secundario"
          icone={PiCaretRight}
          rotulo="Próximos"
          onClick={() => passo(1)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Convite para completar
// ---------------------------------------------------------------------------

/** O que falta, dito como convite: completar dá XP e a página melhora para todos. */
export function CompletarFicha({
  falta,
  alvo,
}: {
  falta: string[];
  alvo: 'obra' | 'compositor';
}) {
  const { esboco, logado, abrirEntrar } = useEsboco();
  if (!falta.length) return null;
  return (
    <div className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
      <span className="flex items-start gap-3">
        <Icon
          de={PiPencilSimpleLine}
          tamanho="m"
          className="mt-0.5 shrink-0 text-ouro-texto"
        />
        <span className="flex flex-col gap-1">
          <span className="font-medium">
            Ajude a completar{' '}
            {alvo === 'obra' ? 'esta obra' : 'este compositor'}
          </span>
          <span className="t-rotulo text-texto-suave">
            Falta {falta.join(', ')}. Cada informação aceita vale XP e aparece
            para todo mundo.
          </span>
        </span>
      </span>
      {logado ? (
        <Link
          href={rota(esboco, 'envios')}
          className={cx('self-start t-rotulo text-ouro-texto', linkTexto)}
        >
          Completar agora
        </Link>
      ) : (
        <button
          type="button"
          onClick={abrirEntrar}
          className={cx('self-start t-rotulo text-ouro-texto', linkTexto)}
        >
          Entrar para completar
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ficha técnica
// ---------------------------------------------------------------------------

export function FichaTecnica({ obra }: { obra: FichaObra }) {
  const linhas = [
    ['Composição', obra.ano],
    ['Publicação', obra.publicacao],
    ['Dedicatória', obra.dedicatoria],
    ['Instrumentação', obra.instrumentacao],
    ['Catálogo', obra.catalogo],
    ['Nível estimado', obra.nivel],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col divide-y divide-[var(--linha)]">
        {linhas.map(([t, v]) => (
          <div
            key={t}
            className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-2.5"
          >
            <dt className="t-rotulo text-texto-suave">{t}</dt>
            <dd className="t-rotulo">{v}</dd>
          </div>
        ))}
      </dl>
      {obra.movimentos?.length ? (
        <div className="flex flex-col gap-2">
          <span className="t-legenda">Movimentos</span>
          <ol className="flex flex-col divide-y divide-[var(--linha)]">
            {obra.movimentos.map((m, i) => (
              <li key={m.titulo} className="flex items-baseline gap-3 py-2">
                <span className="t-dado w-5 text-texto-fraco">{i + 1}</span>
                <span>
                  {m.titulo}
                  {m.detalhe && (
                    <span className="text-texto-suave"> · {m.detalhe}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : obra.movimentosTexto ? (
        <p className="t-rotulo text-texto-suave">
          {obra.movimentosTexto[0].toUpperCase() +
            obra.movimentosTexto.slice(1)}
          .
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <span className="t-legenda">Gêneros e categorias</span>
        <div className="flex flex-wrap gap-2">
          {[...obra.generos, ...obra.categorias].map((c) => (
            <Link
              key={c}
              href="#"
              className="inline-flex min-h-8 items-center rounded-full bg-sup-2 px-3 text-[0.8125rem] text-texto-suave hover:text-ouro-texto"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Partituras agrupadas (como hoje: abas por tipo, grupos do IMSLP)
// ---------------------------------------------------------------------------

function ArquivoCartao({
  a,
  aoEstudar,
}: {
  a: Grupo['arquivos'][number];
  aoEstudar: () => void;
}) {
  const [fav, setFav] = useState(false);
  return (
    <li className="flex flex-col gap-2 rounded-card bg-sup-2 p-2.5">
      <span className="relative aspect-[1/1.25] overflow-hidden rounded-[8px] bg-sobre-foto">
        {a.miniatura && (
          <Image
            src={a.miniatura}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, 180px"
            className="object-contain"
          />
        )}
        {a.autor && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--veu-foto)] px-2 py-0.5 text-[0.6875rem] text-sobre-foto">
            {a.autor}
          </span>
        )}
      </span>
      <span className="flex flex-col px-1">
        <span className="truncate text-[0.875rem]">{a.titulo}</span>
        <span className="t-dado text-[0.6875rem] text-texto-fraco">
          PDF{a.paginas ? ` · ${a.paginas} pág.` : ''}
          {a.tamanho ? ` · ${a.tamanho}` : ''}
        </span>
      </span>
      <span className="flex items-center gap-1">
        <Button tamanho="p" icone={PiDownloadSimple} className="flex-1">
          PDF
        </Button>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiBookmarkSimple}
          rotulo="Estudar esta partitura"
          onClick={aoEstudar}
        />
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiHeart}
          rotulo="Favoritar partitura"
          aria-pressed={fav}
          onClick={() => setFav(!fav)}
          className={fav ? '!text-ouro-texto' : undefined}
        />
      </span>
    </li>
  );
}

function GrupoDePartituras({
  g,
  aberto: inicial,
  aoEstudar,
}: {
  g: Grupo;
  aberto: boolean;
  aoEstudar: (t: string) => void;
}) {
  const [aberto, setAberto] = useState(inicial);
  const [todos, setTodos] = useState(false);
  const visiveis = todos ? g.arquivos : g.arquivos.slice(0, 6);
  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
        className="flex min-h-[var(--alvo)] items-center justify-between gap-3 text-left"
      >
        <span className="flex items-baseline gap-2">
          <span
            className={cx(
              'font-display text-[1.1875rem]',
              g.comunidade && 'text-ouro-texto'
            )}
          >
            {g.titulo}
          </span>
          <span className="t-dado text-[0.75rem] text-texto-fraco">
            {g.arquivos.length}
          </span>
        </span>
        <Icon
          de={PiCaretDown}
          tamanho="p"
          className={cx(
            'text-texto-fraco transition-transform duration-[var(--t-resposta)]',
            aberto && 'rotate-180'
          )}
        />
      </button>
      {aberto && (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {visiveis.map((a) => (
              <ArquivoCartao
                key={a.id}
                a={a}
                aoEstudar={() => aoEstudar(`${g.titulo} · ${a.titulo}`)}
              />
            ))}
          </ul>
          {g.arquivos.length > 6 && !todos && (
            <Button
              variante="texto"
              className="self-start"
              onClick={() => setTodos(true)}
            >
              Ver os {g.arquivos.length} arquivos
            </Button>
          )}
        </>
      )}
    </section>
  );
}

export function PartiturasAgrupadas({
  obra,
  aoEstudar,
}: {
  obra: FichaObra;
  aoEstudar: (t: string) => void;
}) {
  const p: Partituras = obra.partituras;
  const tipos = TIPOS.filter((t) => contar(p, t.id) > 0);
  const [tipo, setTipo] = useState<TipoPartitura>(tipos[0]?.id ?? 'partituras');
  const { logado, abrirEntrar } = useEsboco();

  if (obra.imslp === 'pending') {
    return (
      <div className="flex flex-col items-start gap-4 rounded-card bg-sup-2 p-6">
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--fundo)]">
            <Icon
              de={PiMagnifyingGlass}
              tamanho="p"
              className="text-ouro-texto"
            />
          </span>
          <span className="flex flex-col">
            <span className="font-medium">Buscando as partituras no IMSLP</span>
            <span className="t-rotulo text-texto-suave">
              É a primeira visita a esta obra. Leva alguns segundos; a página se
              atualiza sozinha.
            </span>
          </span>
        </span>
        <div
          className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className="loading-skeleton aspect-[1/1.25] rounded-[8px]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (obra.imslp === 'none' || tipos.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-6">
        <span className="font-medium">
          O IMSLP não tem partitura desta obra
        </span>
        <span className="t-rotulo text-texto-suave">
          Tem uma de domínio público, ou uma digitação sua? Envie: entra no ar
          na hora, com o seu nome.
        </span>
        <Button
          icone={PiUploadSimple}
          onClick={() =>
            logado ? toast('Abre o envio de partitura') : abrirEntrar()
          }
        >
          Enviar partitura
        </Button>
      </div>
    );
  }

  const grupos = p[tipo] ?? [];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo="Tipo de partitura">
          {tipos.map((t) => (
            <Aba key={t.id} ativa={tipo === t.id} onClick={() => setTipo(t.id)}>
              {t.rotulo} · {contar(p, t.id)}
            </Aba>
          ))}
        </Abas>
        <span className="t-legenda">
          {totalDe(p)} arquivos · domínio público · grátis
        </span>
      </div>
      <div className="flex flex-col gap-6">
        {grupos.map((g, i) => (
          <GrupoDePartituras
            key={g.titulo}
            g={g}
            aberto={i < 2}
            aoEstudar={aoEstudar}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          logado ? toast('Abre o envio de partitura') : abrirEntrar()
        }
        className={cx(
          'inline-flex items-center gap-2 self-start t-rotulo text-texto-suave',
          linkTexto
        )}
      >
        <Icon de={PiUploadSimple} tamanho="p" /> Enviar uma partitura desta obra
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multimídia
// ---------------------------------------------------------------------------

type TipoMidia = 'audio' | 'spotify' | 'youtube' | 'videoaula';

/** O YouTube só carrega no clique: a miniatura no lugar do iframe (o iframe pesa ~1 MB). */
function YouTube({ id, titulo }: { id: string; titulo: string }) {
  const [tocar, setTocar] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-card bg-[#0c0d12]">
      {tocar ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={titulo}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setTocar(true)}
          className="group absolute inset-0"
        >
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover opacity-90"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-veu-foto to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full fill-ouro text-sobre-ouro shadow-[var(--sombra-2)]">
            <Icon de={PiPlay} tamanho="g" rotulo={`Assistir: ${titulo}`} />
          </span>
          <span className="absolute bottom-3 left-4 right-4 truncate text-left text-[0.875rem] text-sobre-foto">
            {titulo}
          </span>
        </button>
      )}
    </div>
  );
}

export function Multimidia({
  midia,
  compacta = false,
}: {
  midia: Midia;
  compacta?: boolean;
}) {
  const disponiveis = (
    ['audio', 'spotify', 'youtube', 'videoaula'] as TipoMidia[]
  ).filter((t) => midia[t]);
  const [tipo, setTipo] = useState<TipoMidia | undefined>(disponiveis[0]);
  const [tocando, setTocando] = useState(false);
  const [procurando, setProcurando] = useState(false);
  const { logado, abrirEntrar } = useEsboco();

  const rotulos: Record<TipoMidia, { r: string; i: typeof PiPlay }> = {
    audio: { r: 'Gravação', i: PiWaveform },
    spotify: { r: 'Spotify', i: PiSpotifyLogo },
    youtube: { r: 'YouTube', i: PiYoutubeLogo },
    videoaula: { r: 'Videoaula', i: PiFilmSlate },
  };

  if (!disponiveis.length) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-5">
        <span className="font-medium">Ainda não há gravação desta obra</span>
        <span className="t-rotulo text-texto-suave">
          O Opus Atlas procura no Spotify, no YouTube e no Wikimedia (gravações
          de domínio público). Ou envie uma videoaula sua.
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            icone={PiMagnifyingGlass}
            carregando={procurando}
            onClick={() => {
              setProcurando(true);
              setTimeout(() => {
                setProcurando(false);
                toast(
                  'Nenhuma gravação encontrada desta vez — tentamos de novo em uma semana'
                );
              }, 1400);
            }}
          >
            Procurar gravação
          </Button>
          <Button
            variante="fantasma"
            icone={PiUploadSimple}
            onClick={() =>
              logado
                ? toast('Videoaula é do plano Plus (4 no Free)')
                : abrirEntrar()
            }
          >
            Enviar videoaula
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {disponiveis.length > 1 && (
        <Abas rotulo="Ouvir e assistir">
          {disponiveis.map((t) => (
            <Aba
              key={t}
              ativa={tipo === t}
              onClick={() => setTipo(t)}
              className="inline-flex items-center gap-2"
            >
              <Icon de={rotulos[t].i} tamanho="p" /> {rotulos[t].r}
            </Aba>
          ))}
        </Abas>
      )}
      {tipo === 'audio' && midia.audio && (
        <div className="flex items-center gap-4 rounded-card bg-sup-2 p-3 pr-5">
          <button
            type="button"
            onClick={() => setTocando(!tocando)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full fill-ouro text-sobre-ouro"
          >
            <Icon
              de={tocando ? PiPause : PiPlay}
              tamanho="m"
              rotulo={tocando ? 'Pausar' : 'Ouvir'}
            />
          </button>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{midia.audio.titulo}</span>
            <span className="t-rotulo truncate text-texto-suave">
              {midia.audio.interprete} · {midia.audio.fonte}
            </span>
          </span>
          {midia.audio.duracao && (
            <span className="t-dado text-[0.8125rem] text-texto-fraco">
              {midia.audio.duracao}
            </span>
          )}
        </div>
      )}
      {tipo === 'spotify' && midia.spotify && (
        <div className="flex items-center gap-4 rounded-card bg-sup-2 p-3 pr-5">
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-controle">
            <Image
              src={midia.spotify.capa}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{midia.spotify.faixa}</span>
            <span className="t-rotulo truncate text-texto-suave">
              {midia.spotify.artista} · {midia.spotify.duracao}
            </span>
          </span>
          <Button tamanho="p" icone={PiSpotifyLogo}>
            Ouvir no Spotify
          </Button>
        </div>
      )}
      {tipo === 'youtube' && midia.youtube && !compacta && (
        <YouTube id={midia.youtube.id} titulo={midia.youtube.titulo} />
      )}
      {tipo === 'youtube' && midia.youtube && compacta && (
        <a
          href="#"
          className="flex items-center gap-3 rounded-card bg-sup-2 p-4"
        >
          <Icon de={PiYoutubeLogo} tamanho="m" />{' '}
          <span className="truncate">{midia.youtube.titulo}</span>
        </a>
      )}
      {!midia.videoaula && (
        <button
          type="button"
          onClick={() =>
            logado
              ? toast('Videoaula é do plano Plus (4 no Free)')
              : abrirEntrar()
          }
          className={cx(
            'inline-flex items-center gap-2 self-start t-rotulo text-texto-suave',
            linkTexto
          )}
        >
          <Icon de={PiFilmSlate} tamanho="p" /> Ainda sem videoaula — envie a
          sua
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quero estudar / já aprendi
// ---------------------------------------------------------------------------

type Estado = 'nada' | 'estudando' | 'aprendi';

export function useEstudoDaObra(obra: FichaObra) {
  const { logado, abrirEntrar, ganharConquista } = useEsboco();
  const [estado, setEstado] = useState<Estado>('nada');
  const [folha, setFolha] = useState<null | 'estudar' | 'aprendi'>(null);
  const [partitura, setPartitura] = useState<string | null>(null);
  const [estrelas, setEstrelas] = useState(3);

  const opcoes = TIPOS.flatMap((t) =>
    (obra.partituras[t.id] ?? []).map(
      (g) => `${g.titulo} · ${g.arquivos[0]?.titulo ?? ''}`
    )
  );

  const abrir = (q: 'estudar' | 'aprendi', escolhida?: string) => {
    if (!logado) return abrirEntrar();
    if (escolhida) setPartitura(escolhida);
    setFolha(q);
  };

  const folhas = (
    <>
      <Sheet
        aberto={folha === 'estudar'}
        aoFechar={() => setFolha(null)}
        titulo="Quero estudar"
        descricao={`${obra.titulo}${obra.catalogo ? `, ${obra.catalogo}` : ''} vai para a sua estante.`}
        largura="m"
        rodape={
          <div className="flex justify-end gap-2">
            <Button variante="fantasma" onClick={() => setFolha(null)}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={() => {
                setEstado('estudando');
                setFolha(null);
                toast.success('Na sua estante');
              }}
            >
              Começar a estudar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">
              Qual partitura você vai usar?
            </legend>
            {opcoes.length ? (
              opcoes.slice(0, 5).map((o) => (
                <label
                  key={o}
                  className={cx(
                    'flex min-h-[var(--alvo)] items-center gap-3 rounded-controle px-3',
                    partitura === o
                      ? 'tint-ouro text-ouro-na-tinta'
                      : 'bg-sup-2'
                  )}
                >
                  <input
                    type="radio"
                    name="partitura"
                    checked={partitura === o}
                    onChange={() => setPartitura(o)}
                    className="accent-[var(--ouro)]"
                  />
                  <span className="t-rotulo">{o}</span>
                </label>
              ))
            ) : (
              <span className="t-rotulo text-texto-suave">
                As partituras ainda estão chegando do IMSLP. Dá para escolher
                depois, na estante.
              </span>
            )}
          </fieldset>
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo">
              Para quando? <span className="text-texto-fraco">(opcional)</span>
            </span>
            <input
              className="input-classical min-h-[var(--alvo)] rounded-controle px-4 text-base"
              placeholder="Ex.: recital de dezembro"
            />
          </label>
        </div>
      </Sheet>
      <Sheet
        aberto={folha === 'aprendi'}
        aoFechar={() => setFolha(null)}
        titulo="Já aprendi"
        descricao="Conte como ficou. Só você vê, a não ser que publique o vídeo."
        largura="m"
        rodape={
          <div className="flex justify-end gap-2">
            <Button variante="fantasma" onClick={() => setFolha(null)}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={() => {
                setEstado('aprendi');
                setFolha(null);
                ganharConquista();
              }}
            >
              Marcar como aprendida
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="t-rotulo">Domínio</span>
            <span className="flex gap-1" role="radiogroup" aria-label="Domínio">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={estrelas === n}
                  aria-label={`${n} de 5`}
                  onClick={() => setEstrelas(n)}
                  className={cx(
                    'grid h-11 w-11 place-items-center rounded-controle',
                    n <= estrelas ? 'text-ouro-texto' : 'text-texto-fraco'
                  )}
                >
                  <Icon de={PiStar} tamanho="g" />
                </button>
              ))}
            </span>
            <span className="t-legenda">
              {
                [
                  '',
                  'Leio com dificuldade',
                  'Toco devagar',
                  'Toco com a partitura',
                  'Toco de cor',
                  'Pronta para palco',
                ][estrelas]
              }
            </span>
          </div>
          <Button icone={PiUploadSimple} className="self-start">
            Anexar um vídeo tocando (4 no Free)
          </Button>
        </div>
      </Sheet>
    </>
  );

  return { estado, abrir, folhas, partitura };
}

/** Os botões e o estado — cada esboço decide onde pôr. */
export function BotoesDeEstudo({
  estudo,
}: {
  estudo: ReturnType<typeof useEstudoDaObra>;
}) {
  if (estudo.estado === 'estudando') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-[var(--alvo)] items-center gap-2 rounded-controle tint-ouro px-4 text-ouro-na-tinta">
          <Icon de={PiBookmarkSimple} tamanho="p" /> Estudando
        </span>
        <Button icone={PiCheckCircle} onClick={() => estudo.abrir('aprendi')}>
          Já aprendi
        </Button>
      </div>
    );
  }
  if (estudo.estado === 'aprendi') {
    return (
      <span className="inline-flex min-h-[var(--alvo)] items-center gap-2 rounded-controle tint-ouro px-4 text-ouro-na-tinta">
        <Icon de={PiCheckCircle} tamanho="p" /> Você já aprendeu
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variante="primario"
        icone={PiBookmarkSimple}
        onClick={() => estudo.abrir('estudar')}
      >
        Quero estudar
      </Button>
      <Button icone={PiCheckCircle} onClick={() => estudo.abrir('aprendi')}>
        Já aprendi
      </Button>
    </div>
  );
}

export function QuemEstuda({ obra }: { obra: FichaObra }) {
  if (!obra.estudando && !obra.aprenderam) return null;
  return (
    <span className="inline-flex items-center gap-2 t-legenda">
      <Icon de={PiUsers} tamanho="pp" />
      {formatar(obra.estudando)} estudando · {formatar(obra.aprenderam)} já
      aprenderam
    </span>
  );
}

// ---------------------------------------------------------------------------
// Compositor: sobre, vídeo, curiosidades
// ---------------------------------------------------------------------------

export function SobreCompositor({
  c,
  capitular = false,
}: {
  c: FichaCompositor;
  capitular?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {c.bio ? (
        c.bio.map((p, i) => (
          <p
            key={i}
            className={cx(
              't-corpo max-w-[60ch]',
              capitular && i === 0 && 'a-capitular'
            )}
          >
            {p}
          </p>
        ))
      ) : (
        <>
          <p className="t-corpo max-w-[60ch]">{c.resumo}</p>
          <p className="t-rotulo text-texto-suave">
            Ainda não há biografia escrita.{' '}
            {c.wikipedia && (
              <>
                <a
                  href={c.wikipedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx('text-ouro-texto', linkTexto)}
                >
                  Ler na Wikipédia
                </a>
                {' · '}
              </>
            )}
            <Link href="#" className={cx('text-ouro-texto', linkTexto)}>
              Escrever uma
            </Link>
          </p>
        </>
      )}
      {(c.nascimento || c.falecimento) && (
        <p className="t-legenda">
          {c.nascimento && <>Nasceu em {c.nascimento}</>}
          {c.nascimento && c.falecimento && '; '}
          {c.falecimento && <>morreu em {c.falecimento}</>}.
        </p>
      )}
    </div>
  );
}

export function VideoDoCompositor({ c }: { c: FichaCompositor }) {
  if (!c.video) return null;
  return <YouTube id={c.video.id} titulo={c.video.titulo} />;
}

export function CuriosidadesDoCompositor({ c }: { c: FichaCompositor }) {
  if (!c.curiosidades.length) return null;
  return (
    <ul className="flex flex-col gap-3">
      {c.curiosidades.map((t) => (
        <li
          key={t}
          className="flex items-start gap-3 rounded-card bg-sup-2 p-4"
        >
          <Icon
            de={PiLightbulb}
            tamanho="m"
            className="mt-0.5 shrink-0 text-ouro-texto"
          />
          <span className="t-rotulo">{t}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Artigos ligados (blog: `composerIds` / `workIds` no artigo)
// ---------------------------------------------------------------------------

export function ArtigosLigados({
  artigos,
  esboco,
}: {
  artigos: Artigo[];
  esboco: EsbocoId;
}) {
  if (!artigos.length) return null;
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {artigos.map((a) => (
        <li key={a.slug}>
          <Link
            href={destino(esboco, 'blog')}
            className="group flex h-full items-center gap-4 rounded-card bg-sup-2 p-3 pr-4"
          >
            <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-controle bg-[var(--fundo)]">
              {a.capa ? (
                <Image
                  src={a.capa}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover object-top"
                />
              ) : (
                <Icon de={PiSparkle} tamanho="m" className="text-texto-fraco" />
              )}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="line-clamp-2 font-display text-[1.125rem] leading-snug group-hover:text-ouro-texto">
                {a.titulo}
              </span>
              <span className="t-legenda">
                Blog{a.leitura ? ` · ${a.leitura} min` : ''}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Home: curiosidades, descobertas, últimas adições
// ---------------------------------------------------------------------------

export function CuriosidadesMusicais({
  variante = 'cartoes',
}: {
  variante?: 'cartoes' | 'lista';
}) {
  if (variante === 'lista') {
    return (
      <ul className="flex flex-col divide-y divide-[var(--linha)]">
        {CURIOSIDADES.map((c) => (
          <li
            key={c.titulo}
            className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
          >
            <span className="t-rotulo text-texto-suave">{c.epoca}</span>
            <span className="flex flex-col gap-1">
              <span className="font-display text-[1.25rem]">{c.titulo}</span>
              <span className="t-rotulo text-texto-suave">{c.texto}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CURIOSIDADES.map((c) => (
        <li
          key={c.titulo}
          className="flex flex-col gap-3 rounded-card bg-sup-2 p-5"
        >
          <Icon
            de={c.tipo === 'inovação' ? PiSparkle : PiLightbulb}
            tamanho="m"
            className="text-ouro-texto"
          />
          <span className="font-display text-[1.25rem] leading-snug">
            {c.titulo}
          </span>
          <span className="t-rotulo text-texto-suave">{c.texto}</span>
          <span className="t-legenda mt-auto">{c.epoca}</span>
        </li>
      ))}
    </ul>
  );
}

export function DescobertasEAdicoes({
  esboco,
  so,
}: {
  esboco: EsbocoId;
  so?: 'descobertas' | 'adicoes';
}) {
  const blocos = [
    {
      id: 'descobertas',
      titulo: 'Descobertas',
      d: DESCOBERTAS,
      acao: 'Sortear outras',
    },
    { id: 'adicoes', titulo: 'Chegaram agora', d: ADICOES, acao: 'Ver todas' },
  ].filter((b) => !so || b.id === so);
  return (
    <div className={cx('grid grid-cols-1 gap-6', !so && 'lg:grid-cols-2')}>
      {blocos.map((b) => (
        <section
          key={b.id}
          className="flex flex-col gap-4 rounded-card bg-sup-2 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="t-subtitulo">{b.titulo}</h3>
            <button
              type="button"
              className={cx('t-rotulo text-ouro-texto', linkTexto)}
            >
              {b.acao}
            </button>
          </div>
          <ul className="flex flex-wrap gap-4">
            {b.d.compositores.map((c) => (
              <li key={c.nome}>
                <Link
                  href={rota(esboco, 'compositor-tipico')}
                  className="group flex items-center gap-3"
                >
                  <Retrato
                    nome={c.nome}
                    src={c.retrato}
                    sizes="44px"
                    className="h-11 w-11 rounded-full"
                  />
                  <span className="flex flex-col">
                    <span className="font-display text-[1.0625rem] group-hover:text-ouro-texto">
                      {c.nome}
                    </span>
                    <span className="t-legenda">{c.detalhe}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {b.d.obras.map((o) => (
              <li key={o.titulo}>
                <Link
                  href={rota(esboco, 'obra-tipica')}
                  className="group flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate group-hover:text-ouro-texto">
                      {o.titulo}
                    </span>
                    <span className="t-rotulo truncate text-texto-suave">
                      {o.compositor} · {o.detalhe}
                    </span>
                  </span>
                  <Icon
                    de={PiArrowRight}
                    tamanho="p"
                    className="shrink-0 text-texto-fraco"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
