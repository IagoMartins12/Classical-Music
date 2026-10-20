'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiArrowRight,
  PiBookmarkSimple,
  PiBooks,
  PiCaretDown,
  PiDownloadSimple,
  PiHeart,
  PiHouse,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiShareNetwork,
  PiUser,
  PiUserCircle,
  PiNewspaper,
  PiCaretLeft,
  PiCaretRight,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { cx } from '@/app/components/ui/cx';
import {
  BUSCA_EXEMPLO,
  COLECAO_PIANO,
  COLECOES,
  DIA,
  HOJE,
  NOTURNO,
  TELAS_PESSOAIS,
  destino,
  rota,
  type Tela,
} from './dados';
import {
  AcoesDaConta,
  ITENS,
  LinkPlanos,
  ListaExplorar,
  MenuDoTelefone,
  NivelEXp,
  PESSOAIS,
  Rodape,
  Tema,
  useFechaFora,
} from './navegacao';
import {
  ArtigosLigados,
  BotoesDeEstudo,
  CompletarFicha,
  CuriosidadesDoCompositor,
  FichaTecnica,
  Multimidia,
  PartiturasAgrupadas,
  QuemEstuda,
  SobreCompositor,
  VideoDoCompositor,
  useEstudoDaObra,
} from './fichas';
import {
  MINIATURAS,
  TIPOS,
  fichaCompositor,
  fichaObra,
  type QualFicha,
} from './fichas-dados';
import { HomeFinal } from './home-final';
import { CompositoresC, HistoriaC, InstrumentosC, ObrasC } from './paginasC';
import { PaginaEstudar } from './paginas-comum';
import {
  Anotacoes,
  Conquistas,
  Envios,
  Estudo,
  Favoritos,
  Perfil,
} from './pessoais';
import {
  Ficha,
  Marca,
  Retrato,
  anos,
  linkTexto,
  retratoDe,
  useEsboco,
} from './pecas';
import { ConfirmarConta, ConviteDeProfessor, NovaSenha } from './sistema';
import { AcessoNegadoFinal, NaoEncontradaFinal } from './sistema-final';

/**
 * C — Estante.
 *
 * A busca é o produto. A home é um campo grande que já responde enquanto se
 * digita (compositor, obra, partitura, artigo), com atalhos do que mais se
 * procura; abaixo, prateleiras que rolam de lado. Para quem entrou, a
 * primeira prateleira é a dela. Compositor e obra são telas de aplicativo:
 * cabeçalho que encolhe, abas, a primeira página da partitura em destaque.
 * No telefone, abas embaixo — o que o aplicativo nativo herdaria.
 */

const C = 'c' as const;

// ---------------------------------------------------------------------------
// Busca que responde
// ---------------------------------------------------------------------------

function BuscaViva({
  grande = false,
  inicial = '',
}: {
  grande?: boolean;
  inicial?: string;
}) {
  const [termo, setTermo] = useState(inicial);
  const [foco, setFoco] = useState(false);
  const ref = useFechaFora<HTMLFormElement>(foco, () => setFoco(false));
  const mostra = foco && termo.trim().length >= 2;
  const b = BUSCA_EXEMPLO;

  return (
    <form
      ref={ref}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        location.assign(rota(C, 'busca'));
      }}
      className="relative w-full"
    >
      <div
        className={cx(
          'c-busca sup-1 flex items-center gap-3 !rounded-full transition-shadow duration-[var(--t-resposta)]',
          grande ? 'min-h-16 p-2 pl-6' : 'min-h-11 p-1 pl-4'
        )}
      >
        <Icon
          de={PiMagnifyingGlass}
          tamanho={grande ? 'g' : 'm'}
          className="shrink-0 text-texto-fraco"
        />
        <label
          htmlFor={grande ? 'c-busca-grande' : 'c-busca'}
          className="sr-only"
        >
          Buscar no Opus Atlas
        </label>
        <input
          id={grande ? 'c-busca-grande' : 'c-busca'}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => setFoco(true)}
          placeholder={
            grande
              ? 'Experimente “noturno”, “Bach” ou “Clair de lune”'
              : 'Buscar'
          }
          className={cx(
            'min-w-0 flex-1 bg-transparent outline-none placeholder:text-texto-fraco',
            grande ? 'text-[1.1875rem]' : 'text-base'
          )}
        />
        {grande && (
          <Button variante="primario" type="submit" className="shrink-0">
            Buscar
          </Button>
        )}
      </div>
      {mostra && (
        <div className="c-resultados sup-alta absolute inset-x-0 top-full z-menu mt-2 flex flex-col gap-1 !rounded-card p-2 text-left">
          <Link
            href={rota(C, 'compositor')}
            className="flex items-center gap-3 rounded-controle px-3 py-2 hover:bg-sup-2"
          >
            <Retrato
              nome="John Field"
              sizes="40px"
              className="h-10 w-10 rounded-full"
            />
            <span className="flex flex-1 flex-col">
              <span className="font-display text-[1.125rem]">John Field</span>
              <span className="t-rotulo text-texto-suave">
                {b.compositores[0].detalhe}
              </span>
            </span>
            <span className="t-legenda">Compositor</span>
          </Link>
          {b.obras.slice(0, 3).map((o) => (
            <Link
              key={o.titulo}
              href={rota(C, 'obra')}
              className="flex items-center gap-3 rounded-controle px-3 py-2 hover:bg-sup-2"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sup-2 text-texto-suave">
                <Icon de={PiMusicNotes} tamanho="p" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-display text-[1.125rem]">
                  {o.titulo}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {o.compositor} · {o.partituras} partituras
                </span>
              </span>
              <span className="t-legenda">Obra</span>
            </Link>
          ))}
          <Link
            href={destino(C, 'blog')}
            className="flex items-center gap-3 rounded-controle px-3 py-2 hover:bg-sup-2"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-sup-2 text-texto-suave">
              <Icon de={PiNewspaper} tamanho="p" />
            </span>
            <span className="min-w-0 flex-1 truncate">
              {b.artigos[0].titulo}
            </span>
            <span className="t-legenda">Artigo</span>
          </Link>
          <Link
            href={rota(C, 'busca')}
            className={cx(
              'mx-3 my-2 inline-flex items-center gap-1.5 self-start t-rotulo text-ouro-texto',
              linkTexto
            )}
          >
            Ver os 618 resultados <Icon de={PiArrowRight} tamanho="pp" />
          </Link>
        </div>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Casca
// ---------------------------------------------------------------------------

function Barra({ tela }: { tela: Tela }) {
  const [explorar, setExplorar] = useState(false);
  const ref = useFechaFora<HTMLDivElement>(explorar, () => setExplorar(false));
  return (
    <header ref={ref} className="navbar-classical sticky top-0 z-barra">
      <div className="section-wrap flex min-h-16 items-center gap-4">
        <Marca href={rota(C)} />
        <nav
          aria-label="Principal"
          className="flex items-center gap-1 max-lg:hidden"
        >
          <button
            type="button"
            aria-expanded={explorar}
            onClick={() => setExplorar(!explorar)}
            className="flex min-h-10 items-center gap-1.5 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:text-texto"
          >
            Explorar{' '}
            <Icon
              de={PiCaretDown}
              tamanho="pp"
              className={cx('transition-transform', explorar && 'rotate-180')}
            />
          </button>
          {ITENS.map((i) => (
            <Link
              key={i.chave}
              href={destino(C, i.chave)}
              className="flex min-h-10 items-center rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:text-texto"
            >
              {i.rotulo}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-2">
          {!['inicio', 'busca', 'obras', 'compositores'].includes(tela) && (
            <div className="w-full max-w-xs max-md:hidden">
              <BuscaViva />
            </div>
          )}
          <LinkPlanos esboco={C} className="max-lg:hidden" />
          <span className="max-lg:hidden">
            <Tema />
          </span>
          <AcoesDaConta esboco={C} compacta />
          <span className="max-lg:hidden">
            <MenuDoTelefone esboco={C} />
          </span>
        </div>
      </div>
      {explorar && (
        <div className="c-resultados absolute inset-x-0 top-full z-menu sup-alta !rounded-none !rounded-b-card">
          <div className="section-wrap py-6">
            <ListaExplorar esboco={C} aoEscolher={() => setExplorar(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

/** As abas do telefone: Início, Buscar, Estante, Menu. */
function AbasDoTelefone({ tela }: { tela: Tela }) {
  const { logado, abrirEntrar, conquistaNova } = useEsboco();
  const [menu, setMenu] = useState(false);
  const itens = [
    {
      rotulo: 'Início',
      icone: PiHouse,
      href: rota(C),
      ativo: tela === 'inicio',
    },
    {
      rotulo: 'Buscar',
      icone: PiMagnifyingGlass,
      href: rota(C, 'busca'),
      ativo: tela === 'busca',
    },
    {
      rotulo: 'Estante',
      icone: PiBooks,
      href: rota(C, 'estudo'),
      ativo: TELAS_PESSOAIS.includes(tela) && tela !== 'perfil',
    },
  ];
  return (
    <nav
      aria-label="Abas"
      className="sup-alta fixed inset-x-0 bottom-0 z-barra grid grid-cols-4 !rounded-none pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {itens.map((i) => (
        <Link
          key={i.rotulo}
          href={i.href}
          onClick={(e) => {
            if (i.rotulo === 'Estante' && !logado) {
              e.preventDefault();
              abrirEntrar();
            }
          }}
          aria-current={i.ativo ? 'page' : undefined}
          className={cx(
            'flex min-h-16 flex-col items-center justify-center gap-1 text-[0.75rem]',
            i.ativo ? 'text-ouro-texto' : 'text-texto-suave'
          )}
        >
          <Icon de={i.icone} tamanho="m" />
          {i.rotulo}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setMenu(true)}
        className="relative flex min-h-16 flex-col items-center justify-center gap-1 text-[0.75rem] text-texto-suave"
      >
        <Icon de={logado ? PiUserCircle : PiUser} tamanho="m" />
        {logado ? 'Você' : 'Menu'}
        {conquistaNova && (
          <span className="absolute right-[calc(50%-1rem)] top-3 h-2.5 w-2.5 rounded-full bg-[var(--ouro)]" />
        )}
      </button>
      <MenuDoTelefone esboco={C} semBotao aberto={menu} aoMudar={setMenu} />
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Compositor: tela de aplicativo; aba só aparece se tiver conteúdo
// ---------------------------------------------------------------------------

function Compositor({ q }: { q: QualFicha }) {
  const c = fichaCompositor(q);
  const { compartilhar } = useEsboco();
  const obraTela = q === 'completa' ? 'obra' : 'obra-tipica';
  const abas = [
    { id: 'visao', rotulo: 'Visão geral' },
    { id: 'obras', rotulo: `Obras · ${c.obras}` },
    ...(c.video ? [{ id: 'video', rotulo: 'Vídeo' }] : []),
    ...(c.artigos.length
      ? [{ id: 'ler', rotulo: `Para ler · ${c.artigos.length}` }]
      : []),
  ];
  const [aba, setAba] = useState('visao');

  return (
    <article className="flex flex-col">
      <header className="section-wrap flex flex-col gap-6 pt-8">
        <div className="flex flex-wrap items-center gap-5">
          <Retrato
            nome={c.nomeCompleto}
            src={c.retrato}
            prioridade
            sizes="112px"
            className="h-24 w-24 shrink-0 rounded-card text-[1.5rem] md:h-28 md:w-28"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1
              data-vira={`compositor-${c.id}`}
              className="flex items-center gap-2 font-display text-[clamp(2rem,4vw,3rem)] leading-tight"
            >
              {c.nomeCompleto}
              {c.verificado && (
                <SeloVerificada
                  desenhar
                  className="h-6 w-6 shrink-0 text-verificado"
                />
              )}
            </h1>
            <p className="t-rotulo text-texto-suave">
              {[anos(c.nasc, c.morte), c.pais, c.epoca, c.instrumentos]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button icone={PiHeart}>Favoritar</Button>
            <Button
              icone={PiShareNetwork}
              rotulo="Compartilhar"
              onClick={() =>
                compartilhar({
                  titulo: `${c.nomeCompleto} — ${c.obras} obras no Opus Atlas`,
                  url: `https://opusatlas.com.br/composer/${c.id}`,
                  imagem: c.retrato ?? undefined,
                })
              }
            />
          </div>
        </div>
        <Abas rotulo="Seções do compositor">
          {abas.map((a) => (
            <Aba key={a.id} ativa={aba === a.id} onClick={() => setAba(a.id)}>
              {a.rotulo}
            </Aba>
          ))}
        </Abas>
      </header>

      {aba === 'visao' && (
        <div className="section-wrap grid grid-cols-1 gap-10 py-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <h2 className="t-subtitulo">Por onde começar</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {c.destaques.slice(0, 6).map((o, i) => (
                  <li key={o.id}>
                    <Link
                      href={rota(C, obraTela)}
                      data-vira={`obra-${o.id}`}
                      className="group flex items-center gap-4 rounded-card bg-sup-2 p-3"
                    >
                      <span className="relative aspect-[1/1.3] w-12 shrink-0 overflow-hidden rounded-[6px] bg-sobre-foto">
                        {q === 'completa' && (
                          <Image
                            src={MINIATURAS[i % 8]}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-display text-[1.1875rem] group-hover:text-ouro-texto">
                          {o.titulo}
                        </span>
                        <span className="t-rotulo text-texto-suave">
                          {o.detalhe}
                          {o.partituras ? ` · ${o.partituras} partituras` : ''}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col gap-3">
              <h2 className="t-subtitulo">Sobre</h2>
              <SobreCompositor c={c} />
            </section>
            <CuriosidadesDoCompositor c={c} />
          </div>
          <aside className="flex flex-col gap-4">
            <dl className="flex flex-col divide-y divide-[var(--linha)] rounded-card bg-sup-2 px-5">
              {(
                [
                  ['Nasceu', c.nascimento],
                  ['Morreu', c.falecimento],
                  ['Obras no acervo', String(c.obras)],
                ].filter(([, v]) => v) as [string, string][]
              ).map(([t, v]) => (
                <div key={t} className="flex flex-col gap-0.5 py-3">
                  <dt className="t-legenda">{t}</dt>
                  <dd className="t-rotulo">{v}</dd>
                </div>
              ))}
            </dl>
            <CompletarFicha falta={c.falta} alvo="compositor" />
          </aside>
        </div>
      )}

      {aba === 'obras' && (
        <div className="section-wrap flex flex-col gap-5 py-8">
          <div className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4">
            {c.porGenero.map((g, i) => (
              <Ficha key={g.nome} ativa={i === 0}>
                {g.nome} · {g.n}
              </Ficha>
            ))}
          </div>
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {c.destaques.map((o) => (
              <li key={o.id}>
                <Link
                  href={rota(C, obraTela)}
                  className="group flex items-center gap-4 py-3"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-display text-[1.1875rem] group-hover:text-ouro-texto">
                      {o.titulo}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {o.detalhe}
                    </span>
                  </span>
                  <Icon
                    de={PiDownloadSimple}
                    tamanho="p"
                    className="text-texto-fraco"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {aba === 'video' && (
        <div className="section-wrap max-w-4xl py-8">
          <VideoDoCompositor c={c} />
        </div>
      )}

      {aba === 'ler' && (
        <div className="section-wrap py-8">
          <ArtigosLigados artigos={c.artigos} esboco={C} />
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Obra: a partitura em primeiro lugar
// ---------------------------------------------------------------------------

function Obra({ q }: { q: QualFicha }) {
  const o = fichaObra(q);
  const c = fichaCompositor(q);
  const { compartilhar } = useEsboco();
  const estudo = useEstudoDaObra(o);
  const primeiro =
    TIPOS.flatMap((t) => o.partituras[t.id] ?? []).find((g) => !g.comunidade) ??
    null;
  const [i, setI] = useState(0);
  const arquivo = primeiro?.arquivos[i % (primeiro?.arquivos.length || 1)];

  return (
    <article className="section-wrap grid grid-cols-1 gap-10 py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        {arquivo && primeiro ? (
          <>
            <div className="relative aspect-[1/1.3] w-full overflow-hidden rounded-card bg-sobre-foto shadow-[var(--sombra-2)]">
              {arquivo.miniatura && (
                <Image
                  key={arquivo.id}
                  src={arquivo.miniatura}
                  alt={`Primeira página — ${primeiro.titulo}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="boas-vindas-passo object-contain"
                />
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-veu-foto to-transparent p-4 pt-10 text-sobre-foto">
                <span className="flex flex-col">
                  <span className="font-display text-[1.125rem]">
                    {primeiro.titulo}
                  </span>
                  <span className="text-[0.8125rem] opacity-90">
                    Arquivo {(i % primeiro.arquivos.length) + 1} de{' '}
                    {primeiro.arquivos.length}
                    {arquivo.paginas ? ` · ${arquivo.paginas} páginas` : ''}
                  </span>
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setI(i + primeiro.arquivos.length - 1)}
                    className="grid h-10 w-10 place-items-center rounded-full bg-[var(--veu-foto)]"
                  >
                    <Icon
                      de={PiCaretLeft}
                      tamanho="p"
                      rotulo="Arquivo anterior"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setI(i + 1)}
                    className="grid h-10 w-10 place-items-center rounded-full bg-[var(--veu-foto)]"
                  >
                    <Icon
                      de={PiCaretRight}
                      tamanho="p"
                      rotulo="Próximo arquivo"
                    />
                  </button>
                </span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variante="primario" icone={PiDownloadSimple}>
                Baixar PDF
              </Button>
              <Button
                icone={PiBookmarkSimple}
                onClick={() =>
                  estudo.abrir(
                    'estudar',
                    `${primeiro.titulo} · ${arquivo.titulo}`
                  )
                }
              >
                Estudar esta
              </Button>
            </div>
          </>
        ) : (
          <PartiturasAgrupadas
            obra={o}
            aoEstudar={(t) => estudo.abrir('estudar', t)}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link
            href={rota(
              C,
              q === 'completa' ? 'compositor' : 'compositor-tipico'
            )}
            className={cx(
              'flex items-center gap-2 self-start t-rotulo text-texto-suave',
              linkTexto
            )}
          >
            <Retrato
              nome={o.compositor.nomeCompleto}
              src={o.compositor.retrato}
              sizes="32px"
              className="h-7 w-7 rounded-full"
            />
            {o.compositor.nomeCompleto}
          </Link>
          <h1
            data-vira={`obra-${o.id}`}
            className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight"
          >
            {o.titulo}
            {o.catalogo ? `, ${o.catalogo}` : ''}
          </h1>
          <p className="t-rotulo text-texto-suave">
            {[
              o.instrumentacao,
              o.ano,
              o.nivel && `nível ${o.nivel.toLowerCase()} (estimado)`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <BotoesDeEstudo estudo={estudo} />
            <Button icone={PiHeart} rotulo="Favoritar" />
            <Button
              icone={PiShareNetwork}
              rotulo="Compartilhar"
              onClick={() =>
                compartilhar({
                  titulo: `${o.titulo} — ${o.compositor.nomeCompleto}`,
                  url: `https://opusatlas.com.br/works/${o.id}`,
                  imagem: o.compositor.retrato ?? undefined,
                })
              }
            />
          </div>
          <QuemEstuda obra={o} />
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="t-subtitulo">Ouvir e assistir</h2>
          <Multimidia midia={o.midia} />
        </section>

        {arquivo && (
          <section className="flex flex-col gap-3">
            <h2 className="t-subtitulo">Todas as partituras</h2>
            <PartiturasAgrupadas
              obra={o}
              aoEstudar={(t) => estudo.abrir('estudar', t)}
            />
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="t-subtitulo">Ficha</h2>
          <FichaTecnica obra={o} />
        </section>

        <CompletarFicha falta={o.falta} alvo="obra" />

        {o.artigos.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="t-subtitulo">Para ler</h2>
            <ArtigosLigados artigos={o.artigos} esboco={C} />
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="t-subtitulo">Mais de {o.compositor.nome}</h2>
          <ul className="faixa-rola -mx-4 flex gap-3 overflow-x-auto px-4">
            {c.destaques
              .filter((d) => d.id !== o.id)
              .map((d) => (
                <li key={d.id} className="w-56 shrink-0">
                  <Link
                    href={rota(C, q === 'completa' ? 'obra' : 'obra-tipica')}
                    className="group flex h-full flex-col gap-1 rounded-card bg-sup-2 p-4"
                  >
                    <span className="font-display text-[1.125rem] leading-snug group-hover:text-ouro-texto">
                      {d.titulo}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {d.detalhe}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
      {estudo.folhas}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Busca, dia, coleção, ensino
// ---------------------------------------------------------------------------

function BuscaPagina() {
  const b = BUSCA_EXEMPLO;
  return (
    <div className="section-wrap flex flex-col gap-6 py-8">
      <h1 className="sr-only">Buscar</h1>
      <BuscaViva grande inicial={b.termo} />
      <div className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4">
        {[
          'Tudo · 618',
          'Obras · 612',
          'Compositores · 1',
          'Partituras · 2.140',
          'Artigos · 1',
        ].map((f, i) => (
          <Ficha key={f} ativa={i === 0}>
            {f}
          </Ficha>
        ))}
      </div>
      <ul className="flex flex-col divide-y divide-[var(--linha)]">
        <li>
          <Link
            href={rota(C, 'compositor')}
            className="group flex items-center gap-4 py-3"
          >
            <Retrato
              nome="John Field"
              sizes="48px"
              className="h-12 w-12 rounded-full"
            />
            <span className="flex flex-1 flex-col">
              <span className="font-display text-[1.25rem] group-hover:text-ouro-texto">
                John Field
              </span>
              <span className="t-rotulo text-texto-suave">
                Compositor · {b.compositores[0].detalhe}
              </span>
            </span>
          </Link>
        </li>
        {b.obras.map((o, i) => (
          <li key={o.titulo}>
            <Link
              href={rota(C, 'obra')}
              className="group flex items-center gap-4 py-3"
            >
              <span className="relative aspect-[1/1.3] w-12 shrink-0 overflow-hidden rounded-[6px] bg-sobre-foto">
                <Image
                  src={NOTURNO.partituras[i % 5].miniatura}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="font-display text-[1.25rem] group-hover:text-ouro-texto">
                  {o.titulo}
                </span>
                <span className="t-rotulo text-texto-suave">
                  Obra · {o.compositor} · {o.partituras} partituras
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dia() {
  return (
    <div className="section-wrap flex flex-col gap-8 py-8">
      <header className="flex items-center justify-between gap-4">
        <Button variante="fantasma" icone={PiCaretLeft} rotulo="Dia anterior" />
        <h1 className="text-center font-display text-[clamp(2rem,5vw,3.25rem)]">
          {HOJE.rotulo}
        </h1>
        <Button variante="fantasma" icone={PiCaretRight} rotulo="Próximo dia" />
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="t-subtitulo">Nasceram</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DIA.nasceram.map((p) => (
            <li key={p.id}>
              <Link
                href={rota(C, 'compositor')}
                className="group flex items-center gap-4 rounded-card bg-sup-2 p-4"
              >
                <Retrato
                  nome={p.nome}
                  src={p.retrato}
                  sizes="64px"
                  className="h-16 w-16 shrink-0 rounded-full"
                />
                <span className="flex flex-col">
                  <span className="font-display text-[1.25rem] leading-tight group-hover:text-ouro-texto">
                    {p.nome}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {p.ano} · {p.pais}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="t-subtitulo">Morreram</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DIA.morreram.map((p) => (
            <li key={p.id}>
              <Link
                href={rota(C, 'compositor')}
                className="group flex items-center gap-4 rounded-card bg-sup-2 p-4"
              >
                <Retrato
                  nome={p.nome}
                  src={p.retrato}
                  sizes="56px"
                  className="h-14 w-14 shrink-0 rounded-full"
                />
                <span className="flex flex-col">
                  <span className="font-display text-[1.1875rem] group-hover:text-ouro-texto">
                    {p.nome}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {p.nasc}–{p.ano}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Colecao() {
  const c = COLECOES[0];
  return (
    <div className="section-wrap flex flex-col gap-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-card bg-sup-2 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight">
            {c.titulo}
          </h1>
          <p className="t-rotulo max-w-[56ch] text-texto-suave">
            {c.descricao} · {c.obras} obras
          </p>
        </div>
        <Button icone={PiBookmarkSimple}>Salvar</Button>
      </header>
      <ul className="flex flex-col divide-y divide-[var(--linha)]">
        {COLECAO_PIANO.map((o) => (
          <li key={o.titulo}>
            <Link
              href={rota(C, 'obra')}
              className="group flex items-center gap-4 py-3"
            >
              <Retrato
                nome={o.compositor}
                src={retratoDe(o.compositor)}
                sizes="44px"
                className="h-11 w-11 rounded-full"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-display text-[1.1875rem] group-hover:text-ouro-texto">
                  {o.titulo}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {o.compositor}, {o.catalogo}
                </span>
              </span>
              <span className="t-dado text-[0.8125rem] text-texto-fraco">
                {o.min} min
              </span>
              <Icon
                de={PiDownloadSimple}
                tamanho="p"
                className="text-texto-fraco"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Ensino() {
  const [lado, setLado] = useState<'professor' | 'aluno'>('professor');
  const itens =
    lado === 'professor'
      ? [
          'Agenda com conflito avisado antes',
          'Fechar a aula em um minuto',
          'Repertório do aluno ligado às partituras',
          'Relatórios e diário de prática',
        ]
      : [
          'Pedir aula num horário livre',
          'Tarefas com a obra e a partitura',
          'Diário de prática',
          'Sua estante continua sua',
        ];
  return (
    <div className="section-wrap flex flex-col items-center gap-8 py-14 text-center">
      <h1 className="max-w-[18ch] font-display text-[clamp(2.25rem,5vw,4rem)] leading-tight">
        O portal de estudo do Opus Atlas
      </h1>
      <Abas rotulo="Para quem">
        <Aba ativa={lado === 'professor'} onClick={() => setLado('professor')}>
          Para quem ensina
        </Aba>
        <Aba ativa={lado === 'aluno'} onClick={() => setLado('aluno')}>
          Para quem estuda
        </Aba>
      </Abas>
      <ul
        key={lado}
        className="boas-vindas-passo grid grid-cols-1 w-full max-w-3xl gap-3 text-left sm:grid-cols-2"
      >
        {itens.map((t) => (
          <li
            key={t}
            className="flex items-center gap-3 rounded-card bg-sup-2 p-4"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--ouro)]" />
            {t}
          </li>
        ))}
      </ul>
      <Link
        href={destino(C, 'planos')}
        className={classesDeBotao('primario', 'm')}
      >
        {lado === 'professor'
          ? 'Ver planos Mentor e Maestro'
          : 'Criar conta grátis'}
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pessoais: a estante
// ---------------------------------------------------------------------------

function Pessoal({ tela }: { tela: Tela }) {
  const { logado, abrirEntrar } = useEsboco();
  const corpo = {
    estudo: <Estudo />,
    favoritos: <Favoritos />,
    anotacoes: <Anotacoes />,
    envios: <Envios />,
    conquistas: <Conquistas />,
    perfil: <Perfil />,
  }[tela as 'estudo'];

  if (!logado) {
    return (
      <div className="section-wrap flex flex-col items-center gap-4 py-24 text-center">
        <Icon
          de={PiBooks}
          tamanho="g"
          className="!h-10 !w-10 text-ouro-texto"
        />
        <h1 className="t-subtitulo">Sua estante aparece quando você entra</h1>
        <Button variante="primario" onClick={abrirEntrar}>
          Entrar ou criar conta
        </Button>
      </div>
    );
  }

  return (
    <div className="section-wrap flex flex-col gap-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="t-titulo">Estante</h1>
        <div className="w-full max-w-xs">
          <NivelEXp />
        </div>
      </header>
      <nav
        aria-label="Suas páginas"
        className="faixa-rola -mx-4 flex gap-1 overflow-x-auto px-4"
      >
        {PESSOAIS.map((p) => (
          <Link
            key={p.tela}
            href={rota(C, p.tela)}
            aria-current={p.tela === tela ? 'page' : undefined}
            className={cx(
              'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[0.9375rem]',
              p.tela === tela
                ? 'fill-ouro text-sobre-ouro'
                : 'bg-sup-2 text-texto-suave hover:text-texto'
            )}
          >
            <Icon de={p.icone} tamanho="p" />
            {p.rotulo}
          </Link>
        ))}
      </nav>
      {corpo}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EsbocoC({ tela }: { tela: Tela }) {
  const sistema: Partial<Record<Tela, ReactNode>> = {
    confirmar: <ConfirmarConta variante={C} />,
    redefinir: <NovaSenha variante={C} />,
    convite: <ConviteDeProfessor variante={C} />,
    '404': <NaoEncontradaFinal esboco={C} />,
    negado: <AcessoNegadoFinal esboco={C} />,
  };
  const publico: Partial<Record<Tela, ReactNode>> = {
    inicio: <HomeFinal esboco={C} heroi="globo" />,
    compositor: <Compositor q="completa" />,
    'compositor-tipico': <Compositor q="tipica" />,
    obra: <Obra q="completa" />,
    'obra-tipica': <Obra q="tipica" />,
    busca: <BuscaPagina />,
    dia: <Dia />,
    colecao: <Colecao />,
    ensino: <Ensino />,
    compositores: <CompositoresC />,
    obras: <ObrasC />,
    historia: <HistoriaC />,
    instrumentos: <InstrumentosC />,
    estudar: <PaginaEstudar esboco={C} />,
  };

  return (
    <div className="min-h-dvh bg-fundo text-texto">
      <Barra tela={tela} />
      <main className="pb-36 lg:pb-24">
        {TELAS_PESSOAIS.includes(tela) ? (
          <Pessoal tela={tela} />
        ) : (
          (sistema[tela] ?? publico[tela])
        )}
      </main>
      <Rodape esboco={C} />
      <AbasDoTelefone tela={tela} />
    </div>
  );
}
