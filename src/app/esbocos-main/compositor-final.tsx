'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiArrowRight,
  PiCaretDown,
  PiLightbulb,
  PiPlus,
  PiShareNetwork,
  PiSparkle,
  PiUsers,
} from 'react-icons/pi';
import { Carrossel as CarrosselComPontos } from '@/app/components/blog/site/Carrossel';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { cx } from '@/app/components/ui/cx';
import { destino, formatar, rota, type EsbocoId } from './dados';
import { ArtigosLigados, SobreCompositor, VideoDoCompositor } from './fichas';
import { fichaCompositor, type QualFicha } from './fichas-dados';
import {
  COMECAR_BAILLOT,
  COMECAR_CHOPIN,
  EXTRA_BAILLOT,
  EXTRA_CHOPIN,
  contemporaneosSorteados,
} from './final-dados';
import { ConviteParaCompletar, useContribuir } from './contribuir';
import { Coracao } from './coracao';
import {
  CartaoCompositor,
  LARGURA_CARTAO_COMPOSITOR,
} from './cartao-compositor';
import { BotaoReportar } from './reportar';
import { Ficha, Retrato, linkTexto, useEsboco } from './pecas';

/**
 * O compositor consolidado (06/10): o perfil de revista do esboço A, com o
 * que faltava. Toda seção nasce do dado — Baillot (sem biografia) não mostra
 * "Para ver" nem curiosidades, e sim o convite para completar.
 */

function Titulo({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <h2 className="t-titulo max-sm:!text-[1.75rem]">{children}</h2>
      {acao}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Catálogo com filtros e cache por filtro
// ---------------------------------------------------------------------------

interface Linha {
  id: string;
  titulo: string;
  detalhe: string;
  ano?: string;
  partituras?: number;
}

/** O resultado por combinação de filtro fica guardado: voltar a uma categoria não chama a API de novo. */
function useCatalogo(chave: string, todas: Linha[]) {
  const cache = useRef(new Map<string, Linha[]>());
  const [estado, setEstado] = useState<{
    linhas: Linha[];
    carregando: boolean;
    daMemoria: boolean;
  }>({ linhas: todas, carregando: false, daMemoria: true });

  useEffect(() => {
    const guardado = cache.current.get(chave);
    if (guardado) {
      setEstado({ linhas: guardado, carregando: false, daMemoria: true });
      return;
    }
    setEstado((e) => ({ ...e, carregando: true }));
    // No produto: GET /composers/:id/works?genre=…&instrument=…&sort=… (react-query com staleTime de 5 min faz o mesmo papel).
    const id = setTimeout(() => {
      const [genero] = chave.split('|');
      const linhas =
        genero === 'Todas'
          ? todas
          : todas.filter((l) =>
              l.detalhe
                .toLowerCase()
                .includes(genero.toLowerCase().replace(/s$/, ''))
            );
      cache.current.set(chave, linhas);
      setEstado({ linhas, carregando: false, daMemoria: false });
    }, 450);
    return () => clearTimeout(id);
  }, [chave, todas]);

  return estado;
}

function Catalogo({ q, esboco }: { q: QualFicha; esboco: EsbocoId }) {
  const c = fichaCompositor(q);
  const extra = q === 'completa' ? EXTRA_CHOPIN : EXTRA_BAILLOT;
  const [genero, setGenero] = useState('Todas');
  const [instrumento, setInstrumento] = useState('Todos');
  const [ordem, setOrdem] = useState('Mais estudadas');
  const [soPartitura, setSoPartitura] = useState(false);
  const todas = useMemo<Linha[]>(
    () =>
      c.destaques.map((d) => ({
        id: d.id,
        titulo: d.titulo,
        detalhe: d.detalhe,
        partituras: d.partituras,
      })),
    [c]
  );
  const chave = `${genero}|${instrumento}|${ordem}|${soPartitura}`;
  const { linhas, carregando, daMemoria } = useCatalogo(chave, todas);
  const visiveis = soPartitura ? linhas.filter((l) => l.partituras) : linhas;
  const selecao = 'input-classical min-h-10 rounded-full px-4 text-[0.9375rem]';

  return (
    <section className="mt-20 flex flex-col gap-6">
      <Titulo
        acao={
          <span className="t-rotulo text-texto-suave">{c.obras} obras</span>
        }
      >
        Catálogo
      </Titulo>
      <div className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4">
        <Ficha ativa={genero === 'Todas'} onClick={() => setGenero('Todas')}>
          Todas · {c.obras}
        </Ficha>
        {c.porGenero.map((g) => (
          <Ficha
            key={g.nome}
            ativa={genero === g.nome}
            onClick={() => setGenero(g.nome)}
          >
            {g.nome} · {g.n}
          </Ficha>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 t-rotulo text-texto-suave">
          Para
          <select
            value={instrumento}
            onChange={(e) => setInstrumento(e.target.value)}
            className={selecao}
          >
            <option>Todos</option>
            {extra.compsPara.map((p) => (
              <option key={p.nome}>{p.nome}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 t-rotulo text-texto-suave">
          Ordem
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className={selecao}
          >
            {[
              'Mais estudadas',
              'Catálogo (Op.)',
              'Ano de composição',
              'A–Z',
              'Mais partituras',
            ].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="flex min-h-10 items-center gap-2 t-rotulo">
          <input
            type="checkbox"
            checked={soPartitura}
            onChange={(e) => setSoPartitura(e.target.checked)}
            className="h-4 w-4 accent-[var(--ouro)]"
          />
          Só com partitura guardada
        </label>
        <span className="t-legenda ml-auto">
          {carregando
            ? 'Carregando…'
            : daMemoria
              ? 'Da memória — sem nova chamada'
              : 'Carregado agora'}
        </span>
      </div>
      <ul
        className="flex flex-col divide-y divide-[var(--linha)]"
        aria-busy={carregando}
      >
        {carregando
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="py-4">
                <span className="loading-skeleton block h-6 w-2/3 rounded" />
              </li>
            ))
          : visiveis.map((o) => (
              <li key={o.id} className="flex items-center gap-2">
                <Link
                  href={rota(esboco, q === 'completa' ? 'obra' : 'obra-tipica')}
                  data-vira={`obra-${o.id}`}
                  className="group grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 py-4"
                >
                  <span className="truncate font-display text-[1.25rem] group-hover:text-ouro-texto">
                    {o.titulo}
                  </span>
                  <span className="t-rotulo whitespace-nowrap text-texto-suave">
                    {o.partituras ? `${o.partituras} partituras` : o.detalhe}
                  </span>
                </Link>
                <Coracao rotulo={o.titulo} />
              </li>
            ))}
        {!carregando && !visiveis.length && (
          <li className="py-6 t-rotulo text-texto-suave">
            Nenhuma obra com esses filtros.
          </li>
        )}
      </ul>
      <Button className="self-start">Ver as {c.obras} obras</Button>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function CompositorFinal({
  q,
  esboco,
}: {
  q: QualFicha;
  esboco: EsbocoId;
}) {
  const c = fichaCompositor(q);
  const extra = q === 'completa' ? EXTRA_CHOPIN : EXTRA_BAILLOT;
  const comecar = q === 'completa' ? COMECAR_CHOPIN : COMECAR_BAILLOT;
  const { compartilhar } = useEsboco();
  const contribuir = useContribuir(q === 'completa' ? 'Chopin' : 'Baillot');
  const [todosNomes, setTodosNomes] = useState(false);
  const [fav, setFav] = useState(false);
  const morte = c.morte ?? 2026;
  const sorteados = contemporaneosSorteados(c.nasc, morte, 11);
  const obraTela = q === 'completa' ? 'obra' : 'obra-tipica';
  const falta = [
    ...(!c.bio ? [{ rotulo: 'biografia', tipo: 'bio' as const }] : []),
    ...(!c.video ? [{ rotulo: 'vídeo', tipo: 'video' as const }] : []),
    ...(!extra.curiosidades.length
      ? [{ rotulo: 'curiosidades', tipo: 'curiosidade' as const }]
      : []),
  ];
  const nomes = todosNomes
    ? extra.nomesAlternativos
    : extra.nomesAlternativos.slice(0, 3);

  return (
    <article className="section-wrap py-10 md:py-14">
      <nav aria-label="Caminho" className="t-rotulo mb-8 text-texto-fraco">
        <Link href={rota(esboco, 'compositores')} className={linkTexto}>
          Compositores
        </Link>{' '}
        <span aria-hidden="true">/</span> {c.epoca}
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <aside className="flex flex-col gap-6 md:sticky md:top-24 md:self-start">
          <div className="relative">
            <Retrato
              nome={c.nomeCompleto}
              src={c.retrato}
              prioridade
              sizes="(max-width: 768px) 100vw, 40vw"
              className="aspect-[4/5] w-full rounded-card text-[3rem] shadow-[var(--sombra-2)]"
            />
            <Coracao
              rotulo={c.nome}
              sobre
              valor={fav}
              aoMudar={setFav}
              className="absolute right-3 top-3"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['Wikipédia', extra.wikipedia],
              ['IMSLP', extra.imslp],
            ].map(([n, href]) => (
              <a
                key={n}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sup-2 px-4 text-[0.9375rem] text-texto-suave hover:text-ouro-texto"
              >
                {n} <Icon de={PiArrowSquareOut} tamanho="pp" />
              </a>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-10">
          <header className="flex flex-col gap-5">
            <h1
              data-vira={`compositor-${c.id}`}
              className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em]"
            >
              {c.nomeCompleto.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="whitespace-nowrap">
                {c.nomeCompleto.split(' ').slice(-1)}
                {c.verificado && (
                  <SeloVerificada
                    desenhar
                    className="ml-2 inline-block h-[0.42em] w-[0.42em] align-[0.35em] text-verificado"
                  />
                )}
              </span>
            </h1>
            {c.papel && (
              <p className="t-corpo -mt-2 text-texto-suave">
                {c.papel[0].toUpperCase() + c.papel.slice(1)}
              </p>
            )}
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <dt className="t-legenda">Nascimento</dt>
                <dd className="font-display text-[1.1875rem] leading-snug">
                  {extra.nascimento.data}
                </dd>
                <dd className="t-rotulo text-texto-suave">
                  {extra.nascimento.lugar}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="t-legenda">Morte</dt>
                <dd className="font-display text-[1.1875rem] leading-snug">
                  {extra.falecimento.data}
                </dd>
                <dd className="t-rotulo text-texto-suave">
                  {extra.falecimento.lugar} · aos {extra.idade} anos
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="t-legenda">País</dt>
                <dd className="font-display text-[1.1875rem] leading-snug">
                  {c.pais}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="t-legenda">Época</dt>
                <dd className="font-display text-[1.1875rem] leading-snug">
                  <Link href={rota(esboco, 'historia')} className={linkTexto}>
                    {c.epoca}
                  </Link>
                </dd>
              </div>
              <div className="flex flex-col sm:col-span-2">
                <dt className="t-legenda">Compôs para</dt>
                <dd className="font-display text-[1.1875rem] leading-snug">
                  {extra.compsPara.map((p, i) => (
                    <span key={p.nome}>
                      {i > 0 && (
                        <span className="text-texto-fraco" aria-hidden="true">
                          {' · '}
                        </span>
                      )}
                      <Link href={rota(esboco, 'obras')} className={linkTexto}>
                        {i === 0 ? p.nome : p.nome.toLowerCase()}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="t-legenda">No acervo</dt>
                <dd className="font-display text-[1.1875rem] leading-snug">
                  {c.obras} obras
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2">
              <span className="t-legenda">Também conhecido como</span>
              <p className="t-rotulo text-texto-suave">
                {nomes.join(' · ')}
                {extra.nomesAlternativos.length > 3 && (
                  <button
                    type="button"
                    aria-expanded={todosNomes}
                    onClick={() => setTodosNomes(!todosNomes)}
                    className={cx(
                      'ml-2 inline-flex items-center gap-1 text-ouro-texto',
                      linkTexto
                    )}
                  >
                    {todosNomes
                      ? 'menos'
                      : `e mais ${extra.nomesAlternativos.length - 3}`}
                    <Icon
                      de={PiCaretDown}
                      tamanho="pp"
                      className={cx(
                        'transition-transform',
                        todosNomes && 'rotate-180'
                      )}
                    />
                  </button>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Coracao rotulo={c.nome} comTexto valor={fav} aoMudar={setFav} />
              <Button
                icone={PiShareNetwork}
                onClick={() =>
                  compartilhar({
                    titulo: `${c.nomeCompleto} — ${c.obras} obras no Opus Atlas`,
                    url: `https://opusatlas.com.br/composer/${c.id}`,
                    imagem: c.retrato ?? undefined,
                  })
                }
              >
                Compartilhar
              </Button>
              <BotaoReportar alvo={c.nome} />
            </div>
          </header>

          <section className="flex flex-col gap-4">
            <h2 className="sr-only">Sobre</h2>
            <SobreCompositor c={c} capitular={!!c.bio} />
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="t-subtitulo">Por onde começar</h2>
              <span className="inline-flex items-center gap-1.5 t-legenda">
                <Icon
                  de={comecar.curadoria ? PiSparkle : PiUsers}
                  tamanho="pp"
                />
                {comecar.curadoria
                  ? 'Escolhidas pela equipe'
                  : 'As mais estudadas com partitura, da mais fácil'}
              </span>
            </div>
            <ol className="flex flex-col gap-3">
              {comecar.obras.map((o, i) => (
                <li
                  key={o.titulo}
                  className="flex items-center gap-3 rounded-card bg-sup-2 p-4"
                >
                  <span className="font-display text-[1.75rem] leading-none text-texto-fraco">
                    {i + 1}
                  </span>
                  <Link
                    href={rota(esboco, obraTela)}
                    className="group flex min-w-0 flex-1 flex-col gap-0.5"
                  >
                    <span className="font-display text-[1.25rem] leading-snug group-hover:text-ouro-texto">
                      {o.titulo}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {o.nivel} · {o.porque}
                    </span>
                    <span className="t-legenda">{o.estudando} estudando</span>
                  </Link>
                  <Coracao rotulo={o.titulo} />
                </li>
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="t-subtitulo">Curiosidades</h2>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiPlus}
                onClick={() => contribuir.abrir('curiosidade')}
              >
                Acrescentar
              </Button>
            </div>
            {extra.curiosidades.length ? (
              <ul className="flex flex-col gap-3">
                {extra.curiosidades.map((k) => (
                  <li
                    key={k.texto}
                    className="flex items-start gap-3 rounded-card bg-sup-2 p-4"
                  >
                    <Icon
                      de={PiLightbulb}
                      tamanho="m"
                      className="mt-0.5 shrink-0 text-ouro-texto"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="t-rotulo">{k.texto}</span>
                      <span className="t-legenda">por {k.autor}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="t-rotulo text-texto-suave">
                Ninguém contou uma curiosidade sobre {c.nome} ainda.
              </p>
            )}
          </section>

          <ConviteParaCompletar
            falta={falta}
            alvo={`este compositor`}
            contribuir={contribuir}
          />
        </div>
      </div>

      {c.video && (
        <Revelar as="section" className="mt-20 flex flex-col gap-6">
          <Titulo>Para ver</Titulo>
          <div className="max-w-4xl">
            <VideoDoCompositor c={c} />
          </div>
        </Revelar>
      )}

      <Catalogo q={q} esboco={esboco} />

      {c.artigos.length > 0 && (
        <section className="mt-20 flex flex-col gap-6">
          <Titulo
            acao={
              <Link
                href={destino(esboco, 'blog')}
                className={cx(
                  'inline-flex items-center gap-1.5 t-rotulo text-ouro-texto',
                  linkTexto
                )}
              >
                Blog <Icon de={PiArrowRight} tamanho="pp" />
              </Link>
            }
          >
            Para ler
          </Titulo>
          <ArtigosLigados artigos={c.artigos} esboco={esboco} />
        </section>
      )}

      <section className="mt-20">
        <CarrosselComPontos
          sempre
          idioma="pt"
          rotulo="Compositores do mesmo tempo"
          largura={LARGURA_CARTAO_COMPOSITOR}
          className="-mx-4 sm:-mx-6 lg:-mx-10"
          cabecalho={
            <div className="px-4 sm:px-6 lg:px-10">
              <Titulo
                acao={
                  <span className="t-legenda">
                    {sorteados.length} sorteados a cada visita
                  </span>
                }
              >
                Do mesmo tempo
              </Titulo>
            </div>
          }
        >
          {sorteados.map((f) => (
            <CartaoCompositor
              key={f.id}
              id={f.id}
              nome={f.nome}
              nomeCompleto={f.nomeCompleto}
              retrato={f.retrato}
              nasc={f.nasc}
              morte={f.morte}
              href={rota(esboco, 'compositor-tipico')}
            />
          ))}
        </CarrosselComPontos>
      </section>

      <p className="t-rotulo mt-16 text-texto-suave">
        Algo errado nesta página?{' '}
        <button
          type="button"
          onClick={() => contribuir.abrir('dado')}
          className={cx('text-ouro-texto', linkTexto)}
        >
          Corrija um dado
        </button>{' '}
        ou{' '}
        <Link
          href={rota(esboco, 'envios')}
          className={cx('text-ouro-texto', linkTexto)}
        >
          envie uma obra que falta
        </Link>
        . · {formatar(c.obras)} obras no acervo.
      </p>
      {contribuir.folhas}
    </article>
  );
}
