'use client';

import { useState, type ReactNode } from 'react';
import {
  PiBell,
  PiCalendarBlank,
  PiChartLineUp,
  PiCheck,
  PiClipboardText,
  PiEnvelopeSimple,
  PiNotebook,
  PiPaperPlaneTilt,
  PiUserPlus,
  PiVideoCamera,
  PiWhatsappLogo,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { LIMITES, PLANOS } from '@/app/conteudo/planos';

/**
 * `/for-teachers` em três direções (pedido do dono, 08/10). A página
 * explica o portal para quem dá aula: o que ele faz, com as telas, como
 * começar, os cartões de Mentor e Maestro (na versão final, o mesmo
 * componente e os mesmos preços da `/pricing`), perguntas e contato.
 * Preços aqui são de exemplo.
 */

type Direcao = 'a' | 'b' | 'c';

const DIRECOES: {
  id: Direcao;
  nome: string;
  ideia: string;
  bom: string;
  custo: string;
}[] = [
  {
    id: 'a',
    nome: 'A sala de aula',
    ideia:
      'Editorial, como o resto da main: um título grande, a tela da agenda em destaque e três capítulos (aulas, tarefas, progresso), cada um com a tela real ao lado. Depois "como começar" em três passos, os planos, as perguntas e o contato.',
    bom: 'É a que mais conversa com as páginas de compositor e obra, e a que mostra mais o portal. Boa para quem chega curioso e quer entender antes de decidir.',
    custo:
      'A mais longa. O preço só aparece depois da metade da página: quem já decidiu precisa rolar ou usar o atalho do topo.',
  },
  {
    id: 'b',
    nome: 'Uma semana de aula',
    ideia:
      'Narrativa: a semana do professor contada dia a dia. Segunda marca as aulas, quinta o aviso chega antes e a tarefa sai com prazo (e volta com vídeo no Maestro), fim do mês o relatório vai para o aluno. Cada dia é um momento do portal. Depois, planos e perguntas.',
    bom: 'A que mais se parece com a vida de quem dá aula: o professor se vê na página. Explica o valor sem lista de recursos.',
    custo:
      'Depende de texto bem escrito e de telas bonitas em cada dia. Quem procura um recurso específico tem de achar o dia certo.',
  },
  {
    id: 'c',
    nome: 'Direto ao ponto',
    ideia:
      'Conversão: o topo já traz Mentor e Maestro lado a lado. Abaixo, "o que o portal substitui" (a planilha, o grupo de mensagens, o caderno), os passos e as perguntas. Telas menores, como prova.',
    bom: 'A mais curta e a mais clara para quem chega da /pricing ou de um anúncio já querendo assinar.',
    custo:
      'A menos explicativa. Para quem não conhece o portal, os planos chegam antes do porquê.',
  },
];

// ---------------------------------------------------------------------------
// Telas do portal (desenhadas; na versão final, capturas reais)
// ---------------------------------------------------------------------------

function Moldura({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        'sup-alta overflow-hidden rounded-card shadow-[var(--sombra-2)]',
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-linha px-4 py-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-sup-2" />
        ))}
        <span className="t-legenda ml-3">opusatlas.com.br/teacher</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function TelaAgenda() {
  const aulas = [
    ['14h', 'Marina Duarte', 'Noturno Op. 9 nº 2'],
    ['15h30', 'Pedro Lima', 'Invenção nº 1, Bach'],
    ['17h', 'Ana Souza', 'Escalas e Clair de lune'],
  ];
  return (
    <Moldura>
      <p className="t-legenda mb-1">Hoje · quinta, 16 de outubro</p>
      <p className="font-display text-[1.5rem] mb-4">Boa tarde, Helena</p>
      <ul className="flex flex-col gap-2">
        {aulas.map(([h, nome, obra]) => (
          <li
            key={nome}
            className="flex items-center gap-3 rounded-controle bg-sup-2 px-3 py-2.5"
          >
            <span className="t-dado w-12 text-ouro-texto">{h}</span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[0.9375rem]">{nome}</span>
              <span className="t-legenda truncate">{obra}</span>
            </span>
          </li>
        ))}
      </ul>
    </Moldura>
  );
}

function TelaSemana() {
  const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const aulas: Record<string, string[]> = {
    seg: ['10h'],
    qua: ['14h', '16h'],
    qui: ['14h', '15h30', '17h'],
    sáb: ['9h', '10h30'],
  };
  return (
    <Moldura>
      <p className="t-legenda mb-1">Agenda · 13 a 18 de outubro</p>
      <p className="font-display text-[1.375rem] mb-4">
        Oito aulas nesta semana
      </p>
      <div className="grid grid-cols-6 gap-2">
        {dias.map((d) => (
          <div key={d} className="flex flex-col gap-1.5">
            <span className="t-legenda text-center">{d}</span>
            {(aulas[d] ?? []).map((h) => (
              <span
                key={h}
                className="t-dado rounded-[6px] bg-sup-2 py-1.5 text-center text-[0.75rem] text-ouro-texto"
              >
                {h}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Moldura>
  );
}

function TelaTarefa() {
  return (
    <Moldura>
      <p className="t-legenda mb-1">Tarefa · entrega até sexta</p>
      <p className="font-display text-[1.375rem] mb-3">
        Compassos 1 a 16, mão esquerda sozinha
      </p>
      <div className="mb-3 flex items-center gap-3 rounded-controle bg-sup-2 p-3">
        <span className="grid h-10 w-10 place-items-center rounded-controle bg-[var(--fundo)] text-ouro-texto">
          <Icon de={PiVideoCamera} />
        </span>
        <span className="flex flex-col">
          <span className="text-[0.9375rem]">Marina enviou um vídeo</span>
          <span className="t-legenda">há 2 horas · 1 min 40 s</span>
        </span>
      </div>
      <p className="t-rotulo text-texto-suave">
        “O pedal no compasso 9 ainda embola. Tente trocar no tempo 3.”
      </p>
    </Moldura>
  );
}

function TelaProgresso() {
  const barras = [40, 55, 50, 70, 78, 86];
  return (
    <Moldura>
      <p className="t-legenda mb-1">Relatório de setembro · Marina Duarte</p>
      <p className="font-display text-[1.375rem] mb-4">
        Seis semanas de estudo constante
      </p>
      <div className="mb-4 flex h-24 items-end gap-2">
        {barras.map((b, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-[4px] bg-[var(--ouro)] opacity-70"
            style={{ height: `${b}%` }}
          />
        ))}
      </div>
      <p className="t-rotulo text-texto-suave">
        Os números do período chegam prontos; você escreve a mensagem e
        compartilha com o aluno.
      </p>
    </Moldura>
  );
}

// ---------------------------------------------------------------------------
// Peças comuns
// ---------------------------------------------------------------------------

const PRECO_EXEMPLO = { MENTOR: 'R$ 49,90', MAESTRO: 'R$ 89,90' };

/** Na versão final: o cartão da /pricing, com o preço de GET /pricing. */
function CartoesDoProfessor({ compacto = false }: { compacto?: boolean }) {
  const c = PLANOS.pt;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(['MENTOR', 'MAESTRO'] as const).map((k) => {
        const p = c.planos[k];
        return (
          <div
            key={k}
            className={cx(
              'flex flex-col gap-4 rounded-card bg-sup-2 p-6',
              k === 'MAESTRO' && 'tint-ouro'
            )}
          >
            <div className="flex flex-col gap-1">
              <span className="font-display text-[1.75rem]">{p.nome}</span>
              <span className="t-rotulo text-texto-suave">{p.paraQuem}</span>
            </div>
            <p className="flex items-baseline gap-1">
              <span className="font-display text-[2.5rem] leading-none">
                {PRECO_EXEMPLO[k]}
              </span>
              <span className="t-rotulo text-texto-suave">/mês</span>
            </p>
            {!compacto && (
              <ul className="flex flex-col gap-2">
                {p.recursos.map((r) => (
                  <li key={r} className="t-rotulo flex items-start gap-2">
                    <Icon
                      de={PiCheck}
                      tamanho="p"
                      className="mt-0.5 shrink-0 text-ouro-texto"
                    />
                    {r}
                  </li>
                ))}
              </ul>
            )}
            <Button variante={k === 'MAESTRO' ? 'primario' : 'secundario'}>
              {p.acao}
            </Button>
          </div>
        );
      })}
      <Link
        href="/pricing?para=ensinar"
        className="t-rotulo text-ouro-texto underline-offset-4 hover:underline md:col-span-2"
      >
        Comparar todos os planos
      </Link>
    </div>
  );
}

const PASSOS = [
  {
    icone: PiPaperPlaneTilt,
    titulo: 'Assine o Mentor ou o Maestro',
    texto:
      'Pelo cartão, em reais. O portal abre na hora, no mesmo login do site.',
  },
  {
    icone: PiUserPlus,
    titulo: 'Convide seus alunos',
    texto:
      'Busque a conta do aluno no Opus Atlas (a grátis serve) e ele aparece na sua turma.',
  },
  {
    icone: PiCalendarBlank,
    titulo: 'Marque a primeira aula',
    texto:
      'Escolha o dia na agenda. O aluno recebe o aviso, e você, o lembrete antes de começar.',
  },
];

function ComoComecar() {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="t-titulo">Como começar</h2>
      <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <li key={p.titulo} className="flex flex-col gap-3">
            <span className="font-display text-[2.5rem] leading-none text-texto-fraco">
              {i + 1}
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Icon de={p.icone} className="text-ouro-texto" /> {p.titulo}
            </span>
            <span className="t-rotulo text-texto-suave">{p.texto}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

const PERGUNTAS = [
  [
    'Meus alunos precisam pagar?',
    'Não. O aluno usa a conta grátis do Opus Atlas. Quem assina é você.',
  ],
  [
    'Quantos alunos cabem no Mentor?',
    `Até ${LIMITES.MENTOR.alunos} alunos ativos. Passou disso, o Maestro não tem limite.`,
  ],
  [
    'Dou aula presencial. Serve para mim?',
    'Serve. A agenda, as tarefas e os relatórios valem para aula presencial ou online; o portal não faz a videochamada.',
  ],
  [
    'Posso cancelar quando quiser?',
    'Sim, sem multa. O portal fica aberto até o fim do período pago, e os seus alunos continuam com a conta deles.',
  ],
];

function Perguntas() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="t-titulo">Perguntas de quem dá aula</h2>
      <dl className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
        {PERGUNTAS.map(([p, r]) => (
          <div key={p} className="flex flex-col gap-1.5">
            <dt className="font-medium">{p}</dt>
            <dd className="t-rotulo text-texto-suave">{r}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FaleConosco() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-card bg-sup-2 p-8 md:flex-row md:items-center md:justify-between">
      <span className="flex flex-col gap-1">
        <span className="font-display text-[1.5rem]">
          Tem uma escola ou uma turma grande?
        </span>
        <span className="t-rotulo text-texto-suave">
          Conte como você dá aula e a gente ajuda a montar o portal.
        </span>
      </span>
      <Link href="/contact" className={classesDeBotao('secundario', 'm')}>
        <Icon de={PiEnvelopeSimple} /> Fale com a gente
      </Link>
    </section>
  );
}

// ---------------------------------------------------------------------------
// A — A sala de aula
// ---------------------------------------------------------------------------

function DirecaoA() {
  const capitulos = [
    {
      titulo: 'A agenda da semana num lugar só',
      texto:
        'Marque, remarque e veja quem vem hoje. O aluno recebe o aviso da aula e você, o lembrete antes de começar.',
      tela: <TelaSemana />,
    },
    {
      titulo: 'Tarefas que voltam com o estudo',
      texto:
        'Peça um trecho, com prazo. O aluno marca como feito e, no Maestro, manda o vídeo tocando. Você comenta ali mesmo.',
      tela: <TelaTarefa />,
    },
    {
      titulo: 'Progresso que o aluno enxerga',
      texto:
        'O relatório do período sai com aulas, tarefas e obras concluídas. Você escreve a mensagem e decide se o aluno vê.',
      tela: <TelaProgresso />,
    },
  ];
  return (
    <div className="flex flex-col gap-24">
      <header className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-6">
          <span className="t-legenda">Para professores</span>
          <h1 className="font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.95]">
            Sua turma inteira, da agenda ao relatório
          </h1>
          <p className="t-corpo max-w-[52ch] text-texto-suave">
            O portal do professor junta as aulas, as tarefas e o progresso de
            cada aluno, no mesmo lugar onde ele já estuda as partituras.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#planos" className={classesDeBotao('primario', 'm')}>
              Ver os planos
            </a>
            <a href="#comecar" className={classesDeBotao('fantasma', 'm')}>
              Como começar
            </a>
          </div>
        </div>
        <TelaAgenda />
      </header>
      {capitulos.map((cap, i) => (
        <section
          key={cap.titulo}
          className={cx(
            'grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16',
            i % 2 === 1 && 'lg:[&>*:first-child]:order-2'
          )}
        >
          <div className="flex flex-col gap-4">
            <span className="font-display text-[3rem] leading-none text-texto-fraco">
              {i + 1}
            </span>
            <h2 className="t-titulo">{cap.titulo}</h2>
            <p className="t-corpo max-w-[48ch] text-texto-suave">{cap.texto}</p>
          </div>
          {cap.tela}
        </section>
      ))}
      <div id="comecar">
        <ComoComecar />
      </div>
      <section id="planos" className="flex flex-col gap-8">
        <h2 className="t-titulo">Dois planos, a mesma sala</h2>
        <CartoesDoProfessor />
      </section>
      <Perguntas />
      <FaleConosco />
    </div>
  );
}

// ---------------------------------------------------------------------------
// B — Uma semana de aula
// ---------------------------------------------------------------------------

function DirecaoB() {
  const dias = [
    {
      dia: 'Segunda',
      icone: PiCalendarBlank,
      titulo: 'Você monta a semana',
      texto:
        'Três alunos na quinta, dois no sábado. Cada um recebe o aviso da aula no Opus Atlas.',
      tela: <TelaSemana />,
    },
    {
      dia: 'Quinta, 13h30',
      icone: PiBell,
      titulo: 'O aviso chega antes de você lembrar',
      texto:
        'Meia hora antes, você e o aluno recebem o lembrete. Ninguém esquece a partitura em casa.',
      tela: null,
    },
    {
      dia: 'Quinta, 18h',
      icone: PiClipboardText,
      titulo: 'A tarefa sai da aula com prazo',
      texto:
        'Compassos 1 a 16, mão esquerda sozinha, até sexta. No Maestro, ela volta com o vídeo do aluno tocando.',
      tela: <TelaTarefa />,
    },
    {
      dia: 'Fim do mês',
      icone: PiChartLineUp,
      titulo: 'O relatório do mês',
      texto:
        'Os números chegam prontos. Você escreve a mensagem e compartilha com o aluno, que vê o próprio estudo acontecendo.',
      tela: <TelaProgresso />,
    },
  ];
  return (
    <div className="flex flex-col gap-24">
      <header className="flex max-w-3xl flex-col gap-6">
        <span className="t-legenda">Para professores</span>
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.95]">
          Uma semana de aula com o Opus Atlas
        </h1>
        <p className="t-corpo text-texto-suave">
          Do convite ao relatório, o portal cuida do que costuma ficar no
          caderno e nas mensagens. Veja como fica a sua semana.
        </p>
      </header>
      <ol className="relative flex flex-col gap-16 border-l border-linha pl-8 md:pl-12">
        {dias.map((d) => (
          <li
            key={d.dia}
            className="relative grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start"
          >
            <span className="absolute -left-[calc(2rem+0.6rem)] top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--ouro)] md:-left-[calc(3rem+0.6rem)]" />
            <div className="flex flex-col gap-3">
              <span className="t-legenda inline-flex items-center gap-2">
                <Icon de={d.icone} tamanho="p" className="text-ouro-texto" />
                {d.dia}
              </span>
              <h2 className="t-subtitulo">{d.titulo}</h2>
              <p className="t-corpo text-texto-suave">{d.texto}</p>
            </div>
            {d.tela}
          </li>
        ))}
      </ol>
      <section className="flex flex-col gap-8">
        <h2 className="t-titulo">Para a sua turma</h2>
        <CartoesDoProfessor />
      </section>
      <ComoComecar />
      <Perguntas />
      <FaleConosco />
    </div>
  );
}

// ---------------------------------------------------------------------------
// C — Direto ao ponto
// ---------------------------------------------------------------------------

function DirecaoC() {
  const substitui = [
    {
      icone: PiNotebook,
      antes: 'O caderno de chamada',
      depois: 'A agenda com quem vem hoje e o que estudou da última vez.',
    },
    {
      icone: PiWhatsappLogo,
      antes: 'O grupo de mensagens',
      depois: 'Avisos de aula e de prazo que chegam sozinhos.',
    },
    {
      icone: PiClipboardText,
      antes: 'A planilha de tarefas',
      depois: 'Tarefas com prazo, entrega e, no Maestro, vídeo.',
    },
  ];
  return (
    <div className="flex flex-col gap-20">
      <header className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div className="flex flex-col gap-5">
          <span className="t-legenda">Para professores</span>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.95]">
            O portal do professor
          </h1>
          <p className="t-corpo text-texto-suave">
            Aulas, tarefas e progresso dos seus alunos. Escolha o plano pelo
            tamanho da turma.
          </p>
        </div>
        <CartoesDoProfessor compacto />
      </header>
      <section className="flex flex-col gap-8">
        <h2 className="t-titulo">O que ele substitui</h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {substitui.map((s) => (
            <li
              key={s.antes}
              className="flex flex-col gap-3 rounded-card bg-sup-2 p-6"
            >
              <Icon de={s.icone} tamanho="m" className="text-texto-fraco" />
              <span className="t-rotulo text-texto-fraco line-through">
                {s.antes}
              </span>
              <span className="font-display text-[1.25rem] leading-snug">
                {s.depois}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <TelaAgenda />
        <TelaTarefa />
        <TelaProgresso />
      </section>
      <ComoComecar />
      <Perguntas />
      <FaleConosco />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EsbocosProfessores() {
  const [atual, setAtual] = useState<Direcao>('a');
  const d = DIRECOES.find((x) => x.id === atual)!;
  return (
    <div className="classical-theme">
      <div className="border-b border-linha">
        <div className="section-wrap flex flex-col gap-5 py-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="t-rotulo mr-2 text-texto-suave">
              Esboços de /for-teachers:
            </span>
            {DIRECOES.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={atual === x.id}
                onClick={() => setAtual(x.id)}
                className={cx(
                  'inline-flex min-h-10 items-center rounded-full px-4 text-[0.9375rem]',
                  atual === x.id
                    ? 'tint-ouro text-ouro-na-tinta'
                    : 'bg-sup-2 text-texto-suave hover:text-texto'
                )}
              >
                {x.id.toUpperCase()} · {x.nome}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <dt className="t-legenda">A ideia</dt>
              <dd className="t-rotulo">{d.ideia}</dd>
            </div>
            <div>
              <dt className="t-legenda">O que é bom</dt>
              <dd className="t-rotulo">{d.bom}</dd>
            </div>
            <div>
              <dt className="t-legenda">O custo</dt>
              <dd className="t-rotulo">{d.custo}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="section-wrap py-16">
        {atual === 'a' && <DirecaoA />}
        {atual === 'b' && <DirecaoB />}
        {atual === 'c' && <DirecaoC />}
      </div>
    </div>
  );
}
