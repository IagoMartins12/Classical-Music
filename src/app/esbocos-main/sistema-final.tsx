'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  PiArrowLeft,
  PiArrowRight,
  PiFlag,
  PiHouse,
  PiMagnifyingGlass,
  PiSignIn,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS, destino, rota, type EsbocoId } from './dados';
import { Ficha, Retrato, linkTexto, useEsboco } from './pecas';

/**
 * 404 e acesso negado (06/10, 5ª versão, com as skills copywriting e
 * impeccable). Parte do que a versão em homologação acerta — um número
 * grande em ouro como âncora, a marca presente, hierarquia limpa e uma
 * citação de música — e troca o que ela tem de genérico (cartões de ícone,
 * botão "Opus Atlas", animação com rebote).
 *
 * A âncora é o número de catálogo: **Op. 404**, como "Noturnos, Op. 9" no
 * site inteiro. Três composições:
 *
 * - **A — Centro:** o selo, o "Op." grande, o texto, a busca, os caminhos
 *   em linha e a citação, com as notas ao fundo.
 * - **B — Programa de concerto:** o texto à esquerda; à direita, o programa
 *   impresso com as saídas como as peças da noite.
 * - **C — Pauta:** uma pauta atravessa a tela com o número escrito nela;
 *   embaixo, o texto e os caminhos em duas colunas.
 */

type Contexto = 'site' | 'blog' | 'portal';
type Caso = 'visitante' | 'sem-permissao' | 'plano';

interface Caminho {
  rotulo: string;
  texto: string;
  href: string;
}

interface Tela {
  numero: string;
  /** O nome curto do erro, logo abaixo do número. */
  nome: string;
  titulo: string;
  texto: ReactNode;
  acao: ReactNode;
  caminhos: Caminho[];
  citacao: { texto: string; autor: string };
  nota?: ReactNode;
}

// ---------------------------------------------------------------------------
// Peças
// ---------------------------------------------------------------------------

function Selo({ className }: { className?: string }) {
  return (
    <span className={cx('block', className)}>
      <NextImage
        src="/esbocos-main/selo-opus-atlas.webp"
        alt="Opus Atlas"
        width={721}
        height={735}
        className="selo-marca h-auto w-full"
      />
    </span>
  );
}

/** O número de catálogo: "Op." pequeno em itálico, o número grande. */
function Numero({
  numero,
  nome,
  tamanho = 'g',
  centro,
}: {
  numero: string;
  nome: string;
  tamanho?: 'g' | 'm';
  centro?: boolean;
}) {
  return (
    <div
      className={cx('entra flex flex-col gap-1', centro && 'items-center')}
      aria-hidden="true"
    >
      <span className="flex items-baseline gap-3 font-display leading-none text-ouro-texto">
        <span
          className={cx(
            'italic',
            tamanho === 'g'
              ? 'text-[clamp(2rem,4vw,3rem)]'
              : 'text-[clamp(1.5rem,3vw,2.25rem)]'
          )}
        >
          Op.
        </span>
        <span
          className={cx(
            'tabular-nums tracking-[-0.03em]',
            tamanho === 'g'
              ? 'text-[clamp(6rem,15vw,10.5rem)]'
              : 'text-[clamp(4.5rem,10vw,7rem)]'
          )}
        >
          {numero}
        </span>
      </span>
      <span className="font-display text-[1.125rem] italic text-texto-suave">
        {nome}
      </span>
    </div>
  );
}

function Citacao({
  citacao,
  centro,
}: {
  citacao: Tela['citacao'];
  centro?: boolean;
}) {
  return (
    <figure
      className={cx(
        'flex max-w-[40ch] flex-col gap-2',
        centro && 'items-center text-center'
      )}
    >
      <blockquote className="font-display text-[1.375rem] italic leading-snug text-texto-suave">
        “{citacao.texto}”
      </blockquote>
      <figcaption className="t-rotulo text-ouro-texto">
        {citacao.autor}
      </figcaption>
    </figure>
  );
}

/** Os caminhos em linha, separados por fios — sem cartões. */
function CaminhosEmLinha({ caminhos }: { caminhos: Caminho[] }) {
  return (
    <nav aria-label="Outros caminhos" className="w-full max-w-4xl">
      <ul className="grid grid-cols-1 divide-y divide-[var(--linha)] border-y border-[var(--linha)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {caminhos.map((c) => (
          <li key={c.rotulo}>
            <Link
              href={c.href}
              className="group flex h-full flex-col gap-1 px-5 py-5 text-center"
            >
              <span className="inline-flex items-center justify-center gap-2 font-display text-[1.375rem] leading-tight group-hover:text-ouro-texto">
                {c.rotulo}
                <Icon
                  de={PiArrowRight}
                  tamanho="pp"
                  className="text-texto-fraco transition-transform group-hover:translate-x-0.5 group-hover:text-ouro-texto"
                />
              </span>
              <span className="t-rotulo text-texto-suave">{c.texto}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** B — o programa de concerto impresso: as saídas como as peças da noite. */
function Programa({ tela }: { tela: Tela }) {
  const romanos = ['I', 'II', 'III', 'IV'];
  return (
    <aside
      aria-label="Para onde ir"
      className="sup-alta entra relative mx-auto w-full max-w-md !rounded-[6px] p-2 shadow-[var(--sombra-2)]"
      style={{ ['--i' as string]: 2 }}
    >
      <div className="flex flex-col gap-6 rounded-[4px] border border-[color-mix(in_srgb,var(--ouro)_40%,transparent)] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Selo className="w-14" />
          <span className="font-display text-[0.9375rem] uppercase tracking-[0.3em] text-texto-suave">
            Programa
          </span>
          <span className="h-px w-16 bg-[var(--ouro)] opacity-60" />
        </div>
        <ol className="flex flex-col gap-4">
          {tela.caminhos.map((c, i) => (
            <li key={c.rotulo}>
              <Link href={c.href} className="group flex flex-col gap-0.5">
                <span className="flex items-baseline gap-3">
                  <span className="w-6 shrink-0 font-display italic text-ouro-texto">
                    {romanos[i]}.
                  </span>
                  <span className="font-display text-[1.25rem] leading-tight group-hover:text-ouro-texto">
                    {c.rotulo}
                  </span>
                  <span
                    aria-hidden="true"
                    className="min-w-4 flex-1 translate-y-[-0.25em] border-b border-dotted border-[var(--linha-forte)]"
                  />
                  <Icon
                    de={PiArrowRight}
                    tamanho="pp"
                    className="shrink-0 text-texto-fraco group-hover:text-ouro-texto"
                  />
                </span>
                <span className="pl-9 t-rotulo text-texto-suave">
                  {c.texto}
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="border-t border-[var(--linha)] pt-5">
          <Citacao citacao={tela.citacao} centro />
        </div>
      </div>
    </aside>
  );
}

/** C — a pauta de ponta a ponta, com o número escrito nela. */
function PautaComNumero({ tela }: { tela: Tela }) {
  return (
    <div
      className="relative flex h-56 items-center justify-center overflow-hidden sm:h-64"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1600 200"
        preserveAspectRatio="none"
        className="erro-traco absolute inset-x-0 top-1/2 h-36 w-full -translate-y-1/2 text-[var(--ouro)] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:h-44"
      >
        {[20, 60, 100, 140, 180].map((y, i) => (
          <path
            key={y}
            pathLength={1}
            d={`M0 ${y} H1600`}
            stroke="currentColor"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            opacity={0.45}
            style={{ ['--i' as string]: i }}
          />
        ))}
        {[260, 1340].map((x, i) => (
          <path
            key={x}
            pathLength={1}
            d={`M${x} 20 V180`}
            stroke="currentColor"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            opacity={0.45}
            style={{ ['--i' as string]: i + 5 }}
          />
        ))}
      </svg>
      <span className="relative bg-fundo px-6 sm:px-10">
        <Numero numero={tela.numero} nome={tela.nome} centro />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// As três composições
// ---------------------------------------------------------------------------

function Composicao({ esboco, tela }: { esboco: EsbocoId; tela: Tela }) {
  const titulo = (
    <h1 className="entra max-w-[18ch] text-balance font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
      {tela.titulo}
    </h1>
  );
  const texto = (
    <div
      className="entra t-corpo max-w-[52ch] text-texto-suave"
      style={{ ['--i' as string]: 1 }}
    >
      {tela.texto}
    </div>
  );

  if (esboco === 'b') {
    return (
      <section className="section-wrap grid grid-cols-1 items-center gap-14 py-12 md:py-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div className="flex flex-col gap-6">
          <Numero numero={tela.numero} nome={tela.nome} tamanho="m" />
          {titulo}
          {texto}
          <div
            className="entra flex w-full flex-col items-start gap-4"
            style={{ ['--i' as string]: 2 }}
          >
            {tela.acao}
          </div>
          {tela.nota}
        </div>
        <Programa tela={tela} />
      </section>
    );
  }

  if (esboco === 'c') {
    return (
      <section className="flex flex-col gap-10 py-10 md:py-12">
        <PautaComNumero tela={tela} />
        <div className="section-wrap grid w-full grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div className="flex flex-col gap-6">
            {titulo}
            {texto}
            <div
              className="entra flex w-full flex-col items-start gap-4"
              style={{ ['--i' as string]: 2 }}
            >
              {tela.acao}
            </div>
            {tela.nota}
          </div>
          <div className="flex flex-col gap-8">
            <nav aria-label="Outros caminhos">
              <ul className="flex flex-col border-t border-[var(--linha)]">
                {tela.caminhos.map((c) => (
                  <li key={c.rotulo} className="border-b border-[var(--linha)]">
                    <Link
                      href={c.href}
                      className="group flex items-center gap-4 py-4"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="font-display text-[1.375rem] leading-tight group-hover:text-ouro-texto">
                          {c.rotulo}
                        </span>
                        <span className="t-rotulo text-texto-suave">
                          {c.texto}
                        </span>
                      </span>
                      <Icon
                        de={PiArrowRight}
                        tamanho="p"
                        className="shrink-0 text-texto-fraco transition-transform group-hover:translate-x-0.5 group-hover:text-ouro-texto"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Citacao citacao={tela.citacao} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden">
      <NotasAoFundo className="-z-10" />
      <div className="section-wrap flex flex-col items-center gap-7 py-12 text-center md:py-16">
        <Selo className="entra w-16" />
        <Numero numero={tela.numero} nome={tela.nome} centro />
        {titulo}
        {texto}
        <div
          className="entra flex w-full flex-col items-center gap-4"
          style={{ ['--i' as string]: 2 }}
        >
          {tela.acao}
        </div>
        {tela.nota}
        <div
          className="entra mt-4 flex w-full justify-center"
          style={{ ['--i' as string]: 3 }}
        >
          <CaminhosEmLinha caminhos={tela.caminhos} />
        </div>
        <div className="entra mt-4" style={{ ['--i' as string]: 4 }}>
          <Citacao citacao={tela.citacao} centro />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Controles do esboço
// ---------------------------------------------------------------------------

function ControlesDoEsboco({ children }: { children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label="Controles do esboço"
      className="section-wrap flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[var(--linha)] !py-5"
    >
      <span className="t-legenda">Esboço</span>
      {children}
    </div>
  );
}

function SeletorDeContexto({
  contexto,
  aoMudar,
}: {
  contexto: Contexto;
  aoMudar: (c: Contexto) => void;
}) {
  return (
    <span className="flex items-center gap-1">
      {(['site', 'blog', 'portal'] as Contexto[]).map((c) => (
        <Ficha key={c} ativa={contexto === c} onClick={() => aoMudar(c)}>
          {c === 'site' ? 'no site' : c === 'blog' ? 'no blog' : 'no portal'}
        </Ficha>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

const CITACAO_404 = {
  texto: 'Sem música, a vida seria um erro.',
  autor: 'Friedrich Nietzsche',
};

const CITACAO_ACESSO = {
  texto: 'Onde as palavras falham, a música fala.',
  autor: 'Hans Christian Andersen',
};

function Busca({
  esboco,
  contexto,
  centro,
}: {
  esboco: EsbocoId;
  contexto: Contexto;
  centro?: boolean;
}) {
  const chopin = FAMOSOS.find((c) => c.nome === 'Chopin');
  return (
    <>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="c-busca flex w-full max-w-xl items-center gap-2 rounded-full bg-[var(--campo)] p-1.5 pl-5 shadow-[var(--sombra-1)]"
      >
        <Icon
          de={PiMagnifyingGlass}
          tamanho="m"
          className="shrink-0 text-texto-fraco"
        />
        <label htmlFor={`busca-404-${esboco}`} className="sr-only">
          Buscar no Opus Atlas
        </label>
        <input
          id={`busca-404-${esboco}`}
          type="search"
          enterKeyHint="search"
          defaultValue={contexto === 'site' ? 'noturnos op 9' : ''}
          placeholder={
            contexto === 'blog'
              ? 'O título do artigo'
              : 'Um compositor, uma obra…'
          }
          className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-texto-fraco"
        />
        <Button variante="primario" type="submit" className="shrink-0">
          Buscar
        </Button>
      </form>
      {contexto === 'site' && (
        <p
          className={cx(
            'flex flex-wrap items-center gap-x-3 gap-y-2 t-rotulo text-texto-suave',
            centro && 'justify-center'
          )}
        >
          Talvez você procurasse
          <Link
            href={rota(esboco, 'obra')}
            className="group inline-flex items-center gap-2 rounded-full bg-sup-2 py-1 pl-1 pr-4 text-texto"
          >
            <Retrato
              nome="Chopin"
              src={chopin?.retrato}
              sizes="32px"
              className="h-8 w-8 rounded-full"
            />
            <span className="font-display text-[1.0625rem] group-hover:text-ouro-texto">
              Noturnos, Op. 9
            </span>
          </Link>
        </p>
      )}
    </>
  );
}

function tela404(esboco: EsbocoId, contexto: Contexto, centro: boolean): Tela {
  const r = (t: string) => rota(esboco, t as 'inicio');
  const caminhos: Record<Contexto, Caminho[]> = {
    site: [
      {
        rotulo: 'Compositores',
        texto: 'Vidas, obras e épocas',
        href: r('compositores'),
      },
      {
        rotulo: 'Obras',
        texto: 'Com a partitura para baixar',
        href: r('obras'),
      },
      {
        rotulo: 'História da música',
        texto: 'Da Idade Média a hoje',
        href: r('historia'),
      },
    ],
    blog: [
      {
        rotulo: 'Artigos',
        texto: 'Tudo o que já publicamos',
        href: destino(esboco, 'blog'),
      },
      {
        rotulo: 'Concertos',
        texto: 'A agenda dos próximos',
        href: destino(esboco, 'blog'),
      },
      {
        rotulo: 'Compositores',
        texto: 'Volte à enciclopédia',
        href: r('compositores'),
      },
    ],
    portal: [
      {
        rotulo: 'Painel',
        texto: 'As aulas e tarefas de hoje',
        href: r('inicio'),
      },
      { rotulo: 'Calendário', texto: 'A sua semana', href: r('inicio') },
      {
        rotulo: 'Ajuda do portal',
        texto: 'Como cada tela funciona',
        href: r('inicio'),
      },
    ],
  };
  const textos: Record<Contexto, { titulo: string; texto: string }> = {
    site: {
      titulo: 'Página não encontrada.',
      texto:
        'O link pode estar errado ou a página mudou de endereço. Busque pelo nome do compositor ou da obra.',
    },
    blog: {
      titulo: 'Artigo não encontrado.',
      texto: 'Este artigo mudou de endereço ou saiu do ar. Busque pelo título.',
    },
    portal: {
      titulo: 'Esta tela do portal não existe.',
      texto:
        'A aula ou a tarefa pode ter sido apagada, ou o link é de outra conta.',
    },
  };
  return {
    numero: '404',
    nome: 'Partitura perdida',
    ...textos[contexto],
    acao: <Busca esboco={esboco} contexto={contexto} centro={centro} />,
    caminhos: caminhos[contexto],
    citacao: CITACAO_404,
    nota: (
      <button
        type="button"
        onClick={() => toast.success('Obrigado. A equipe vai olhar esse link.')}
        className={cx(
          'entra inline-flex min-h-10 items-center gap-2 t-legenda',
          linkTexto
        )}
        style={{ ['--i' as string]: 3 }}
      >
        <Icon de={PiFlag} tamanho="pp" /> O link era nosso? Avise a gente
      </button>
    ),
  };
}

export function NaoEncontradaFinal({ esboco }: { esboco: EsbocoId }) {
  const [contexto, setContexto] = useState<Contexto>('site');
  return (
    <>
      <Composicao
        esboco={esboco}
        tela={tela404(esboco, contexto, esboco === 'a')}
      />
      <ControlesDoEsboco>
        <SeletorDeContexto contexto={contexto} aoMudar={setContexto} />
      </ControlesDoEsboco>
    </>
  );
}

// ---------------------------------------------------------------------------
// Acesso negado
// ---------------------------------------------------------------------------

export function AcessoNegadoFinal({ esboco }: { esboco: EsbocoId }) {
  const { logado, abrirEntrar } = useEsboco();
  const [contexto, setContexto] = useState<Contexto>('site');
  const [caso, setCaso] = useState<Caso>(
    logado ? 'sem-permissao' : 'visitante'
  );
  const centro = esboco === 'a';
  const r = (t: string) => rota(esboco, t as 'inicio');
  const botoes = (filhos: ReactNode) => (
    <div className={cx('flex flex-wrap gap-3', centro && 'justify-center')}>
      {filhos}
    </div>
  );
  const nada = (
    <span
      className="entra t-rotulo text-texto-fraco"
      style={{ ['--i' as string]: 3 }}
    >
      Nada foi apagado ou alterado.
    </span>
  );

  const telas: Record<Caso, Tela> = {
    visitante: {
      numero: '401',
      nome: 'Ensaio fechado',
      titulo: 'Entre para continuar.',
      texto:
        'Esta página é pessoal, como a sua estante, seus envios ou suas aulas. Depois de entrar, você volta direto para cá.',
      acao: botoes(
        <>
          <Button variante="primario" icone={PiSignIn} onClick={abrirEntrar}>
            Entrar
          </Button>
          <Button onClick={abrirEntrar}>Criar conta grátis</Button>
        </>
      ),
      caminhos: [
        {
          rotulo: 'Compositores',
          texto: 'Aberto para todos',
          href: r('compositores'),
        },
        {
          rotulo: 'Obras',
          texto: 'Partituras grátis, sem conta',
          href: r('obras'),
        },
        {
          rotulo: 'Como estudar aqui',
          texto: 'O que a conta guarda',
          href: r('estudar'),
        },
      ],
      citacao: CITACAO_ACESSO,
    },
    'sem-permissao': {
      numero: '403',
      nome: 'Ensaio fechado',
      titulo:
        contexto === 'portal'
          ? 'Esta aula é de outra turma.'
          : 'Esta página é de outra conta.',
      texto:
        contexto === 'portal'
          ? 'Você entrou como Marina, que não faz parte desta turma. Se deveria fazer, peça o convite a quem dá a aula.'
          : 'Você entrou como Marina, e esta área precisa de outra permissão. Se acha que deveria ter acesso, fale com a gente.',
      acao: botoes(
        <>
          <Link href={r('inicio')} className={classesDeBotao('primario', 'm')}>
            <Icon de={PiHouse} tamanho="p" /> Voltar ao início
          </Link>
          <Button
            variante="fantasma"
            icone={PiArrowLeft}
            onClick={() => history.back()}
          >
            Página anterior
          </Button>
        </>
      ),
      nota: nada,
      caminhos: [
        {
          rotulo: 'Sua estante',
          texto: 'O que você está estudando',
          href: r('estudo'),
        },
        {
          rotulo: 'Pedir acesso',
          texto: 'Fale com a equipe',
          href: r('inicio'),
        },
        {
          rotulo: 'Compositores',
          texto: 'Volte à enciclopédia',
          href: r('compositores'),
        },
      ],
      citacao: CITACAO_ACESSO,
    },
    plano: {
      numero: '403',
      nome: 'Para assinantes Mentor',
      titulo: 'Disponível no plano Mentor.',
      texto:
        'O portal de aulas, com agenda, alunos e tarefas, faz parte do plano Mentor. Sua estante e seus estudos continuam como estão.',
      acao: botoes(
        <>
          <Link
            href={destino(esboco, 'planos')}
            className={classesDeBotao('primario', 'm')}
          >
            Conhecer o plano Mentor <Icon de={PiArrowRight} tamanho="p" />
          </Link>
          <Link
            href={destino(esboco, 'planos')}
            className={classesDeBotao('fantasma', 'm')}
          >
            Comparar os planos
          </Link>
        </>
      ),
      nota: nada,
      caminhos: [
        {
          rotulo: 'Como funciona o portal',
          texto: 'Para quem dá aula',
          href: r('ensino'),
        },
        { rotulo: 'Sua estante', texto: 'Continua grátis', href: r('estudo') },
        {
          rotulo: 'Compositores',
          texto: 'Volte à enciclopédia',
          href: r('compositores'),
        },
      ],
      citacao: CITACAO_ACESSO,
    },
  };

  return (
    <>
      <Composicao esboco={esboco} tela={telas[caso]} />
      <ControlesDoEsboco>
        <SeletorDeContexto contexto={contexto} aoMudar={setContexto} />
        <span className="flex items-center gap-1">
          {(
            [
              ['visitante', 'Sem conta'],
              ['sem-permissao', 'Conta sem acesso'],
              ['plano', 'Plano não inclui'],
            ] as [Caso, string][]
          ).map(([k, rot]) => (
            <Ficha key={k} ativa={caso === k} onClick={() => setCaso(k)}>
              {rot}
            </Ficha>
          ))}
        </span>
      </ControlesDoEsboco>
    </>
  );
}
