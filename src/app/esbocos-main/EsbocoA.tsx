'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiMagnifyingGlass,
} from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import { Revelar } from '@/app/components/ui/Revelar';
import { cx } from '@/app/components/ui/cx';
import {
  DIA,
  HOJE,
  PESSOA,
  TELAS,
  TELAS_PESSOAIS,
  destino,
  rota,
  type Tela,
} from './dados';
import {
  ITENS,
  LinkPlanos,
  ListaExplorar,
  MenuDoTelefone,
  AcoesDaConta,
  PESSOAIS,
  Rodape,
  Tema,
  useFechaFora,
} from './navegacao';
import { Conquistas, Estudo } from './pessoais';
import { Marca, Retrato, retratoDe, useEsboco } from './pecas';

import { PaginaEstudar } from './paginas-comum';
import { HomeFinal } from './home-final';
import { CompositorFinal } from './compositor-final';
import { ObraFinal } from './obra-final';
import { HistoriaFinal, InstrumentosFinal } from './historia-final';
import { ColecaoFinalPagina, MinhasColecoes } from './colecoes-final';
import { BuscaFinal, CompositoresFinal, ObrasFinal } from './listas-final';
import { AcessoNegadoFinal, NaoEncontradaFinal } from './sistema-final';
import {
  AnotacoesPessoaisFinal,
  EnviosFinal,
  FavoritosFinal,
  PerfilFinal,
} from './pessoais-final';
import { ConfirmarConta, ConviteDeProfessor, NovaSenha } from './sistema';

/**
 * A — Programa de concerto.
 *
 * O site como uma revista impressa de música: uma coluna larga, retratos
 * grandes, Garamond em tamanho de capa, muito respiro. A home abre como a
 * página dupla de um programa — o compositor do dia em retrato inteiro, a
 * busca logo abaixo — e cada seção é uma "página" com uma ideia só.
 * Compositor e obra são perfis de revista: retrato que acompanha a rolagem,
 * capitular na biografia, as partituras agrupadas como no site.
 */

const A = 'a' as const;

// ---------------------------------------------------------------------------
// Casca
// ---------------------------------------------------------------------------

function Barra() {
  const [explorar, setExplorar] = useState(false);
  const ref = useFechaFora<HTMLDivElement>(explorar, () => setExplorar(false));

  return (
    <header ref={ref} className="navbar-classical sticky top-0 z-barra">
      <div className="section-wrap flex min-h-16 items-center gap-6">
        <Marca href={rota(A)} />
        <nav
          aria-label="Principal"
          className="flex flex-1 items-center gap-1 max-lg:hidden"
        >
          <button
            type="button"
            aria-expanded={explorar}
            onClick={() => setExplorar(!explorar)}
            className="flex min-h-10 items-center gap-1.5 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:text-texto aria-expanded:text-texto"
          >
            Explorar
            <Icon
              de={PiCaretDown}
              tamanho="pp"
              className={cx(
                'transition-transform duration-[var(--t-resposta)]',
                explorar && 'rotate-180'
              )}
            />
          </button>
          {ITENS.map((i) => (
            <Link
              key={i.chave}
              href={destino(A, i.chave)}
              className="flex min-h-10 items-center rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:text-texto"
            >
              {i.rotulo}
            </Link>
          ))}
          <LinkPlanos esboco={A} className="ml-2" />
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href={rota(A, 'busca')}
            className={classesDeBotao('fantasma', 'p')}
            aria-label="Buscar"
          >
            <Icon de={PiMagnifyingGlass} tamanho="m" />
          </Link>
          <span className="max-lg:hidden">
            <Tema />
          </span>
          <AcoesDaConta esboco={A} compacta />
          <MenuDoTelefone esboco={A} />
        </div>
      </div>
      {explorar && (
        <div className="c-resultados absolute inset-x-0 top-full z-menu sup-alta !rounded-none !rounded-b-card">
          <div className="section-wrap py-6">
            <ListaExplorar
              esboco={A}
              aoEscolher={() => setExplorar(false)}
              extra={
                <Link
                  href={rota(A, 'dia')}
                  onClick={() => setExplorar(false)}
                  className="group flex items-center gap-4 rounded-card bg-sup-2 p-4"
                >
                  <Retrato
                    nome={DIA.nasceram[0].nome}
                    src={DIA.nasceram[0].retrato}
                    sizes="64px"
                    className="h-16 w-14 shrink-0 rounded-controle"
                  />
                  <span className="flex flex-col">
                    <span className="font-display text-[1.125rem] group-hover:text-ouro-texto">
                      {DIA.nasceram[0].nome}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      nasceu em {HOJE.rotulo} de {DIA.nasceram[0].ano} — e
                      outros quatro fazem data hoje
                    </span>
                  </span>
                </Link>
              }
            />
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Compositor (a mesma tela para a ficha completa e a típica)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Obra
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Busca, dia, coleção, ensino
// ---------------------------------------------------------------------------

function Dia() {
  return (
    <div className="section-wrap flex flex-col gap-14 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95]">
            {HOJE.rotulo}
          </h1>
          <p className="t-corpo max-w-[52ch] text-texto-suave">
            Quem nasceu e quem morreu neste dia, entre todos os compositores do
            acervo.
          </p>
        </div>
        <nav aria-label="Outros dias" className="flex gap-2">
          <Button icone={PiCaretLeft}>30 de setembro</Button>
          <Button>
            2 de outubro <Icon de={PiCaretRight} tamanho="p" />
          </Button>
        </nav>
      </header>
      <section className="flex flex-col gap-6">
        <h2 className="t-titulo">Nasceram</h2>
        <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {DIA.nasceram.map((p) => (
            <li key={p.id}>
              <Link
                href={rota(A, 'compositor')}
                className="group flex flex-col gap-4"
              >
                <Retrato
                  nome={p.nome}
                  src={p.retrato}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="aspect-[4/5] w-full rounded-card"
                />
                <span className="flex flex-col gap-1">
                  <span className="t-dado text-ouro-texto">{p.ano}</span>
                  <span className="font-display text-[1.75rem] leading-tight group-hover:text-ouro-texto">
                    {p.nome}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {p.papel[0].toUpperCase() + p.papel.slice(1)}, {p.pais} ·{' '}
                    {p.obras} obras no acervo
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-6">
        <h2 className="t-titulo">Morreram</h2>
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {DIA.morreram.map((p) => (
            <li key={p.id}>
              <Link
                href={rota(A, 'compositor')}
                className="group flex items-center gap-5 py-4"
              >
                <Retrato
                  nome={p.nome}
                  src={p.retrato}
                  sizes="64px"
                  className="h-16 w-14 shrink-0 rounded-controle"
                />
                <span className="flex flex-1 flex-col">
                  <span className="font-display text-[1.375rem] group-hover:text-ouro-texto">
                    {p.nome}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {p.nasc}–{p.ano} · {p.pais} · {p.obras} obras
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

function Ensino() {
  const linhas = [
    {
      titulo: 'A agenda avisa antes do conflito',
      texto:
        'Marque uma aula e o Opus Atlas confere seus horários, a folga entre aulas e a agenda do aluno com outros professores. Se não der, sugere o próximo horário livre.',
    },
    {
      titulo: 'Fechar a aula leva um minuto',
      texto:
        'Presença, o que foi visto e a tarefa da semana, numa folha só. Aula passada sem desfecho aparece numa fila até ser fechada.',
    },
    {
      titulo: 'O repertório do aluno é o da enciclopédia',
      texto:
        'O que ele estuda, quer aprender e já aprendeu, com a partitura escolhida — e o acervo inteiro para sugerir a próxima.',
    },
    {
      titulo: 'O aluno pede aula num horário seu',
      texto:
        'Ele vê só as horas livres que você abriu, pede, e você aceita com um toque. O diário de prática mostra para onde foi o tempo dele.',
    },
  ];
  return (
    <div className="flex flex-col">
      <section className="relative isolate">
        <NotasAoFundo className="-z-10" />
        <div className="section-wrap flex flex-col items-start gap-6 py-16 md:py-24">
          <h1
            className="entra font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em] max-w-[16ch]"
            style={{ ['--i' as string]: 0 }}
          >
            Suas aulas, seus alunos e o repertório num lugar só
          </h1>
          <p
            className="t-corpo entra max-w-[56ch] text-texto-suave"
            style={{ ['--i' as string]: 1 }}
          >
            O portal do Opus Atlas é para quem dá aula de música — em casa, no
            conservatório ou online. Seus alunos entram de graça.
          </p>
          <div
            className="entra flex flex-wrap gap-3"
            style={{ ['--i' as string]: 2 }}
          >
            <Link
              href={destino(A, 'planos')}
              className={classesDeBotao('primario', 'm')}
            >
              Ver planos para professores
            </Link>
            <Link href="#como" className={classesDeBotao('secundario', 'm')}>
              Como funciona
            </Link>
          </div>
        </div>
      </section>
      <section id="como" className="section-wrap flex flex-col">
        {linhas.map((l, i) => (
          <Revelar
            key={l.titulo}
            as="article"
            className={cx(
              'grid grid-cols-1 items-center gap-8 py-14 md:grid-cols-2',
              i % 2 === 1 && 'md:[&>*:first-child]:order-2'
            )}
          >
            <div className="flex flex-col gap-3">
              <h2 className="t-titulo max-w-[20ch]">{l.titulo}</h2>
              <p className="t-corpo max-w-[52ch] text-texto-suave">{l.texto}</p>
            </div>
            <MiniaturaEnsino i={i} />
          </Revelar>
        ))}
      </section>
      <section className="section-wrap py-14">
        <div className="grid grid-cols-1 gap-6 rounded-card bg-sup-2 p-8 md:grid-cols-3 md:p-10">
          <div className="flex flex-col gap-2">
            <h2 className="t-titulo">Dois planos</h2>
            <p className="t-rotulo text-texto-suave">
              Mensal ou anual, sem multa para cancelar.
            </p>
          </div>
          {[
            ['Mentor', 'Até 7 alunos', 'R$ 39,90/mês'],
            [
              'Maestro',
              'Alunos ilimitados, selo de verificado',
              'R$ 79,90/mês',
            ],
          ].map(([n, d, p]) => (
            <div
              key={n}
              className="flex flex-col gap-1 rounded-card bg-[var(--fundo)] p-5"
            >
              <span className="font-display text-[1.75rem]">{n}</span>
              <span className="t-rotulo text-texto-suave">{d}</span>
              <span className="t-dado mt-2 text-ouro-texto">{p}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** As telas reais do portal em miniatura (como o quadro do Sobre). */
function MiniaturaEnsino({ i }: { i: number }) {
  if (i === 0) {
    return (
      <div className="rounded-card bg-sup-2 p-5" aria-hidden="true">
        <div className="grid grid-cols-5 gap-2">
          {['seg', 'ter', 'qua', 'qui', 'sex'].map((d, k) => (
            <div key={d} className="flex flex-col gap-2">
              <span className="t-legenda text-center">{d}</span>
              {[0, 1, 2].map((h) => (
                <span
                  key={h}
                  className={cx(
                    'h-9 rounded-[8px]',
                    (k + h) % 3 === 0
                      ? 'fill-ouro'
                      : k === 3 && h === 1
                        ? 'tint-ouro ring-1 ring-[var(--erro)]'
                        : 'bg-[var(--fundo)]'
                  )}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="t-rotulo mt-4 text-texto-suave">
          Quinta, 15h: Marina tem aula com Paulo.{' '}
          <span className="text-ouro-texto">Próximo livre: 16h30</span>
        </p>
      </div>
    );
  }
  if (i === 1) {
    return (
      <div
        className="flex flex-col gap-3 rounded-card bg-sup-2 p-5"
        aria-hidden="true"
      >
        {[
          'Presente',
          'Noturno Op. 9 nº 2 — compassos 1–16',
          'Tarefa: mão esquerda sozinha, 60 bpm',
        ].map((t, k) => (
          <span
            key={t}
            className="flex items-center gap-3 rounded-controle bg-[var(--fundo)] px-4 py-3 t-rotulo"
          >
            <span
              className={cx(
                'grid h-5 w-5 place-items-center rounded-full',
                k === 0 ? 'fill-ouro' : 'bg-sup-2'
              )}
            />
            {t}
          </span>
        ))}
      </div>
    );
  }
  if (i === 2) {
    return (
      <div
        className="flex flex-col divide-y divide-[var(--linha)] rounded-card bg-sup-2 px-5"
        aria-hidden="true"
      >
        {PESSOA.estudando
          .concat(
            PESSOA.queroAprender.slice(0, 1).map((q) => ({
              ...q,
              edicao: 'quer aprender',
              desde: '',
              progresso: '',
            }))
          )
          .map((e) => (
            <span key={e.obra} className="flex items-center gap-3 py-3">
              <Retrato
                nome={e.compositor}
                src={retratoDe(e.compositor)}
                sizes="40px"
                className="h-9 w-9 rounded-full"
              />
              <span className="flex flex-col">
                <span className="font-display text-[1.0625rem]">{e.obra}</span>
                <span className="t-legenda">{e.edicao}</span>
              </span>
            </span>
          ))}
      </div>
    );
  }
  return (
    <div
      className="flex flex-col gap-2 rounded-card bg-sup-2 p-5"
      aria-hidden="true"
    >
      {[
        ['Ter', '16h00'],
        ['Ter', '17h00'],
        ['Qui', '18h30'],
      ].map(([d, h], k) => (
        <span
          key={h + d}
          className={cx(
            'flex items-center justify-between rounded-controle px-4 py-3 t-rotulo',
            k === 1 ? 'tint-ouro text-ouro-na-tinta' : 'bg-[var(--fundo)]'
          )}
        >
          <span>
            {d} · {h}
          </span>
          <span>{k === 1 ? 'Pedido enviado' : 'Livre'}</span>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Moldura das pessoais
// ---------------------------------------------------------------------------

function Pessoal({ tela }: { tela: Tela }) {
  const { logado, abrirEntrar } = useEsboco();
  const item = PESSOAIS.find((p) => p.tela === tela);
  const corpo = {
    estudo: <Estudo />,
    favoritos: <FavoritosFinal esboco={A} />,
    anotacoes: <AnotacoesPessoaisFinal />,
    envios: <EnviosFinal esboco={A} />,
    conquistas: <Conquistas />,
    perfil: <PerfilFinal />,
    'colecoes-minhas': <MinhasColecoes esboco={A} />,
  }[tela as 'estudo'];

  if (!logado) {
    return (
      <div className="section-wrap flex flex-col items-start gap-4 py-24">
        <h1 className="t-titulo">Esta é uma página sua</h1>
        <p className="t-corpo text-texto-suave">
          Entre para ver {item?.rotulo.toLowerCase()}. (Na barra do esboço,
          troque para Marina.)
        </p>
        <Button variante="primario" onClick={abrirEntrar}>
          Entrar
        </Button>
      </div>
    );
  }

  return (
    <div className="section-wrap flex flex-col gap-8 py-10 md:py-14">
      <header className="flex flex-col gap-6">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
          {item?.rotulo}
        </h1>
        <nav
          aria-label="Suas páginas"
          className="faixa-rola -mx-4 flex gap-1 overflow-x-auto border-b border-[var(--linha)] px-4"
        >
          {PESSOAIS.map((p) => (
            <Link
              key={p.tela}
              href={rota(A, p.tela)}
              aria-current={p.tela === tela ? 'page' : undefined}
              className={cx(
                '-mb-px flex min-h-[var(--alvo)] shrink-0 items-center border-b-2 px-3 text-[0.9375rem] transition-colors',
                p.tela === tela
                  ? 'border-[var(--ouro)] text-texto'
                  : 'border-transparent text-texto-suave hover:text-texto'
              )}
            >
              {p.rotulo}
            </Link>
          ))}
        </nav>
      </header>
      {corpo}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EsbocoA({ tela }: { tela: Tela }) {
  const sistema: Partial<Record<Tela, ReactNode>> = {
    confirmar: <ConfirmarConta variante={A} />,
    redefinir: <NovaSenha variante={A} />,
    convite: <ConviteDeProfessor variante={A} />,
    '404': <NaoEncontradaFinal esboco={A} />,
    negado: <AcessoNegadoFinal esboco={A} />,
  };
  const publico: Partial<Record<Tela, ReactNode>> = {
    inicio: <HomeFinal esboco={A} heroi="atlas" />,
    compositor: <CompositorFinal q="completa" esboco={A} />,
    'compositor-tipico': <CompositorFinal q="tipica" esboco={A} />,
    obra: <ObraFinal q="completa" esboco={A} />,
    'obra-tipica': <ObraFinal q="tipica" esboco={A} />,
    busca: <BuscaFinal esboco={A} />,
    dia: <Dia />,
    colecao: <ColecaoFinalPagina esboco={A} />,
    ensino: <Ensino />,
    compositores: <CompositoresFinal esboco={A} />,
    obras: <ObrasFinal esboco={A} />,
    historia: <HistoriaFinal esboco={A} />,
    instrumentos: <InstrumentosFinal esboco={A} />,
    estudar: <PaginaEstudar esboco={A} />,
  };

  return (
    <div className="min-h-dvh bg-fundo text-texto">
      <Barra />
      <main className="pb-24">
        {TELAS_PESSOAIS.includes(tela) ? (
          <Pessoal tela={tela} />
        ) : (
          (sistema[tela] ?? publico[tela])
        )}
      </main>
      <Rodape esboco={A} />
      <span className="sr-only">
        {TELAS.find((t) => t.id === tela)?.rotulo}
      </span>
    </div>
  );
}
