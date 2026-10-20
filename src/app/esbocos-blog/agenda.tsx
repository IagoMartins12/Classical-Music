'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiMapPin,
} from 'react-icons/pi';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import {
  AGENDA,
  CIDADES,
  MES_DA_AGENDA,
  TIPOS,
  diaDaSemana,
  diaDoMes,
  porDia,
  semanaPorExtenso,
  type Concerto,
  type Tipo,
} from './dados';
import { Capa } from './ilhas';
import { LINK, PAGINA } from './pecas';

/**
 * A agenda de concertos nos três esboços.
 *
 * O que a página de hoje faz e continua valendo: filtrar por cidade e por
 * tipo, ver o mês, abrir um evento. O que muda em todos: o tipo do evento não
 * tem mais cor nem emoji (eram sete cores e uma legenda para decorá-las) — é
 * texto, e vira filtro. Quem administra continua criando evento e local
 * daqui; os botões só aparecem para a equipe e ficaram fora do esboço.
 */

// ---------------------------------------------------------------------------
// O filtro, igual nos três.
// ---------------------------------------------------------------------------

function useFiltro() {
  const [tipo, setTipo] = useState<Tipo | ''>('');
  const [cidade, setCidade] = useState('');
  const [gratis, setGratis] = useState(false);

  const eventos = useMemo(
    () =>
      AGENDA.filter(
        (e) =>
          (!tipo || e.tipo === tipo) &&
          (!cidade || e.cidade === cidade) &&
          (!gratis || e.gratuito)
      ),
    [tipo, cidade, gratis]
  );

  const limpar = () => {
    setTipo('');
    setCidade('');
    setGratis(false);
  };

  return {
    tipo,
    setTipo,
    cidade,
    setCidade,
    gratis,
    setGratis,
    eventos,
    limpar,
  };
}

type Filtro = ReturnType<typeof useFiltro>;

function Filtros({
  filtro,
  className,
}: {
  filtro: Filtro;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar a agenda"
      className={cx('flex flex-wrap items-center gap-x-6 gap-y-3', className)}
    >
      <div className="flex flex-wrap gap-2">
        <Chip selecionado={!filtro.tipo} onClick={() => filtro.setTipo('')}>
          Todos
        </Chip>
        {TIPOS.map((tipo) => (
          <Chip
            key={tipo}
            selecionado={filtro.tipo === tipo}
            onClick={() => filtro.setTipo(tipo)}
          >
            {tipo}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-56">
          <Selecao
            aria-label="Cidade"
            icone={PiMapPin}
            valor={filtro.cidade}
            aoMudar={filtro.setCidade}
            opcoes={[
              { value: '', label: 'Todas as cidades' },
              ...CIDADES.map((c) => ({ value: c, label: c })),
            ]}
            className="w-full"
          />
        </div>
        <Chip
          selecionado={filtro.gratis}
          onClick={() => filtro.setGratis(!filtro.gratis)}
        >
          Só gratuitos
        </Chip>
      </div>
    </div>
  );
}

function SemEventos({ filtro }: { filtro: Filtro }) {
  return (
    <Vazio
      icone={PiCalendarBlank}
      titulo="Nenhum evento com esses filtros"
      descricao="Não há nada em outubro para essa combinação de tipo e cidade."
      acao={<Button onClick={filtro.limpar}>Limpar os filtros</Button>}
    />
  );
}

/** O mês e as setas. */
function TrocaDeMes({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-1', className)}>
      <Button
        variante="fantasma"
        tamanho="p"
        icone={PiCaretLeft}
        rotulo="Mês anterior"
      />
      <p aria-live="polite" className="min-w-[10.5rem] text-center t-subtitulo">
        {MES_DA_AGENDA.nome}
      </p>
      <Button
        variante="fantasma"
        tamanho="p"
        icone={PiCaretRight}
        rotulo="Próximo mês"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// O que se sabe de um evento, além do nome e da hora.
// ---------------------------------------------------------------------------

function Ingresso({ evento }: { evento: Concerto }) {
  if (evento.gratuito) return <Badge>Entrada gratuita</Badge>;
  return (
    <a href="#ingressos" onClick={(e) => e.preventDefault()} className={LINK}>
      Ingressos
      <Icon de={PiArrowSquareOut} tamanho="pp" />
    </a>
  );
}

/** Os compositores do programa: cada um leva à página dele na enciclopédia. */
function NoPrograma({ evento }: { evento: Concerto }) {
  return (
    <p className="text-[0.875rem] text-texto-fraco">
      No programa:{' '}
      {evento.compositores.map((nome, i) => (
        <span key={nome}>
          {i > 0 && ', '}
          <Link
            href="/composers"
            className="text-texto-suave underline decoration-linha-forte underline-offset-4 hover:decoration-ouro"
          >
            {nome}
          </Link>
        </span>
      ))}
    </p>
  );
}

const Local = ({ evento }: { evento: Concerto }) => (
  <>
    {evento.casa}, {evento.cidade} <span className="t-dado">{evento.uf}</span>
  </>
);

const idDoDia = (iso: string) => `dia-${diaDoMes(iso)}`;

const tituloDoDia = (iso: string) =>
  `${semanaPorExtenso(iso)}, ${Number(diaDoMes(iso))} de outubro`;

// ---------------------------------------------------------------------------
// O mês em grade. Pequeno, ele é um índice dos dias (A); grande, é a página
// (C). Dia sem evento não é clicável.
// ---------------------------------------------------------------------------

const CABECALHO_DA_SEMANA = [
  ['D', 'domingo'],
  ['S', 'segunda-feira'],
  ['T', 'terça-feira'],
  ['Q', 'quarta-feira'],
  ['Q', 'quinta-feira'],
  ['S', 'sexta-feira'],
  ['S', 'sábado'],
];

function diasDoMes() {
  const vazios = diaDaSemana(`${MES_DA_AGENDA.iso}-01`);
  return [
    ...Array.from({ length: vazios }, () => null),
    ...Array.from(
      { length: MES_DA_AGENDA.dias },
      (_, i) => `${MES_DA_AGENDA.iso}-${String(i + 1).padStart(2, '0')}`
    ),
  ];
}

function MesPequeno({ eventos }: { eventos: Concerto[] }) {
  const comEvento = new Set(eventos.map((e) => e.data));

  return (
    <div>
      <div
        aria-hidden="true"
        className="grid grid-cols-7 pb-1 text-center text-[0.8125rem] text-texto-fraco"
      >
        {CABECALHO_DA_SEMANA.map(([letra, nome]) => (
          <span key={nome}>{letra}</span>
        ))}
      </div>
      <ul className="grid grid-cols-7">
        {diasDoMes().map((dia, i) => (
          <li key={dia ?? `vazio-${i}`} className="grid place-items-center">
            {dia &&
              (comEvento.has(dia) ? (
                <a
                  href={`#${idDoDia(dia)}`}
                  aria-label={`${tituloDoDia(dia)}: ver os eventos`}
                  className="t-dado grid h-10 w-10 place-items-center rounded-full text-[0.9375rem] font-medium text-ouro-na-tinta tint-ouro transition-colors duration-[var(--t-toque)] hover:text-texto"
                >
                  {Number(diaDoMes(dia))}
                </a>
              ) : (
                <span className="t-dado grid h-10 w-10 place-items-center text-[0.9375rem] text-texto-fraco">
                  {Number(diaDoMes(dia))}
                </span>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A — Primeira página: a programação em linhas, dia a dia, com o mês ao lado
// servindo de índice.
// ---------------------------------------------------------------------------

export function AgendaA() {
  const filtro = useFiltro();
  const dias = porDia(filtro.eventos);
  const casas = [...new Set(AGENDA.map((e) => `${e.casa}, ${e.cidade}`))];

  return (
    <main className={cx(PAGINA, 'pt-10 lg:pt-14')}>
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <header className="flex flex-col gap-3">
            <h1 className="font-display text-[2.5rem] leading-[1.05] tracking-[-0.015em] sm:text-[3.25rem]">
              Agenda de concertos
            </h1>
            <p className="max-w-[52ch] text-[1.1875rem] leading-[1.55] text-texto-suave">
              Concertos, óperas e recitais nas casas de espetáculo do Brasil.
            </p>
            <Filtros filtro={filtro} className="mt-4" />
          </header>

          <div className="mt-10 flex flex-col gap-10">
            {dias.length === 0 && <SemEventos filtro={filtro} />}
            {dias.map((dia) => (
              <section
                key={dia.data}
                id={idDoDia(dia.data)}
                aria-label={tituloDoDia(dia.data)}
                className="scroll-mt-36"
              >
                <h2 className="flex items-baseline gap-3 border-b border-linha-forte pb-2">
                  <span className="font-display text-[2.25rem] leading-none">
                    {diaDoMes(dia.data)}
                  </span>
                  <span className="text-[0.9375rem] text-texto-suave">
                    {semanaPorExtenso(dia.data)}
                  </span>
                </h2>
                <ul>
                  {dia.eventos.map((evento) => (
                    <li
                      key={evento.id}
                      className="grid gap-x-6 gap-y-2 border-b border-linha py-5 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]"
                    >
                      <p className="t-dado pt-1.5 text-[0.9375rem] text-texto-suave">
                        {evento.hora}
                      </p>
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <h3 className="font-display text-[1.5rem] leading-[1.15] text-balance">
                          {evento.programa}
                        </h3>
                        <p className="text-[0.9375rem] text-texto-suave">
                          <Local evento={evento} />
                        </p>
                        <p className="max-w-[58ch] text-[0.9375rem] leading-[1.55] text-texto-fraco">
                          {evento.descricao}
                        </p>
                        <NoPrograma evento={evento} />
                      </div>
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2 sm:pt-1.5">
                        <Text papel="legenda">{evento.tipo}</Text>
                        <Ingresso evento={evento} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <aside className="max-lg:hidden lg:col-span-4">
          <div className="flex flex-col gap-6 lg:sticky lg:top-32">
            <section
              aria-label="Dias com evento"
              className="rounded-card bg-sup-2 p-5"
            >
              <TrocaDeMes className="justify-between pb-4" />
              <MesPequeno eventos={filtro.eventos} />
            </section>
            <section aria-labelledby="casas-a">
              <h2 id="casas-a" className="t-secao">
                Casas na agenda
              </h2>
              <ul className="mt-2">
                {casas.map((casa) => (
                  <li
                    key={casa}
                    className="flex items-baseline justify-between gap-4 border-b border-linha py-3 text-[0.9375rem] last:border-b-0"
                  >
                    <span className="text-texto-suave">{casa}</span>
                    <span className="t-dado text-[0.8125rem] text-texto-fraco">
                      {
                        AGENDA.filter((e) => `${e.casa}, ${e.cidade}` === casa)
                          .length
                      }
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// B — Caderno: o programa impresso. Uma coluna, o dia na margem, e cada
// evento abre no próprio lugar (sem modal).
// ---------------------------------------------------------------------------

export function AgendaB() {
  const filtro = useFiltro();
  const dias = porDia(filtro.eventos);

  return (
    <main className="mx-auto w-full max-w-[var(--largura-conteudo)] px-4 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-4 pb-10 pt-12 lg:pt-16">
        <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-[-0.02em] sm:text-[4rem]">
          Agenda de concertos
        </h1>
        <p className="max-w-[48ch] text-[1.25rem] leading-[1.5] text-texto-suave">
          Concertos, óperas e recitais nas casas de espetáculo do Brasil.
        </p>
        <Filtros filtro={filtro} className="pt-3" />
      </header>

      <div className="flex items-center justify-between border-t border-linha-forte py-4">
        <TrocaDeMes />
        <Text papel="legenda" as="p">
          <span className="t-dado">{filtro.eventos.length}</span>{' '}
          {filtro.eventos.length === 1 ? 'evento' : 'eventos'}
        </Text>
      </div>

      {dias.length === 0 && <SemEventos filtro={filtro} />}

      {dias.map((dia) => (
        <section
          key={dia.data}
          id={idDoDia(dia.data)}
          aria-label={tituloDoDia(dia.data)}
          className="grid gap-x-10 border-t border-linha lg:grid-cols-[9.5rem_minmax(0,1fr)]"
        >
          <h2 className="flex items-baseline gap-3 self-start pt-5 lg:sticky lg:top-16 lg:flex-col lg:gap-0 lg:pb-5">
            <span className="font-display text-[2.5rem] leading-none">
              {diaDoMes(dia.data)}
            </span>
            <span className="text-[0.8125rem] text-texto-fraco">
              {semanaPorExtenso(dia.data)}
            </span>
          </h2>
          <ul>
            {dia.eventos.map((evento) => (
              <li
                key={evento.id}
                className="border-b border-linha last:border-b-0"
              >
                <details className="group/ev">
                  <summary className="grid cursor-pointer list-none grid-cols-[3.75rem_minmax(0,1fr)_auto] items-baseline gap-x-4 rounded-controle py-5 [&::-webkit-details-marker]:hidden sm:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto]">
                    <span className="t-dado text-[0.9375rem] text-texto-suave">
                      {evento.hora}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="font-display text-[1.5rem] leading-[1.15] text-balance sm:text-[1.75rem]">
                        {evento.programa}
                      </span>
                      <span className="text-[0.875rem] text-texto-suave sm:hidden">
                        <Local evento={evento} />
                      </span>
                    </span>
                    <span className="text-right text-[0.9375rem] text-texto-suave max-sm:hidden lg:whitespace-nowrap">
                      <Local evento={evento} />
                    </span>
                    <Icon
                      de={PiCaretDown}
                      className="self-center text-texto-fraco transition-transform duration-[var(--t-resposta)] ease-saida group-open/ev:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <div className="flex flex-col gap-3 pb-6 pl-[4.75rem] sm:pl-[5.5rem]">
                    <p className="max-w-[58ch] text-[1rem] leading-[1.55] text-texto-suave">
                      {evento.descricao}
                    </p>
                    <NoPrograma evento={evento} />
                    <div className="flex flex-wrap items-center gap-4">
                      <Text papel="legenda">{evento.tipo}</Text>
                      <Ingresso evento={evento} />
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

// ---------------------------------------------------------------------------
// C — Atlas: o mês inteiro à vista. Os destaques com imagem no topo, a grade
// do mês, e o dia escolhido aberto ao lado.
// ---------------------------------------------------------------------------

const VEU =
  'absolute inset-0 bg-gradient-to-t from-veu-foto from-[12%] via-veu-foto/55 via-[48%] to-transparent to-[85%]';

export function AgendaC() {
  const filtro = useFiltro();
  const [escolhido, setEscolhido] = useState(`${MES_DA_AGENDA.iso}-10`);
  const destaques = AGENDA.filter((e) => e.imagem).slice(0, 3);
  const porData = new Map(
    porDia(filtro.eventos).map((d) => [d.data, d.eventos])
  );
  const doDia = porData.get(escolhido) ?? [];

  return (
    <main className={cx(PAGINA, 'pt-8 lg:pt-10')}>
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[2.5rem] leading-[1.05] tracking-[-0.015em] sm:text-[3.25rem]">
          Agenda de concertos
        </h1>
        <p className="max-w-[52ch] text-[1.1875rem] leading-[1.55] text-texto-suave">
          Concertos, óperas e recitais nas casas de espetáculo do Brasil.
        </p>
      </header>

      <section
        aria-label="Destaques do mês"
        className="mt-8 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]"
      >
        {destaques.map((evento, i) => (
          <article
            key={evento.id}
            className="relative isolate flex min-h-[15rem] items-end overflow-hidden rounded-card lg:min-h-[19rem]"
          >
            <Capa
              src={evento.imagem ?? null}
              alt=""
              inicial={evento.programa.charAt(0)}
              foco={evento.foco}
              sizes="(min-width: 768px) 520px, 100vw"
              prioridade={i === 0}
              preencher
            />
            <span aria-hidden="true" className={VEU} />
            <div className="relative flex flex-col gap-1.5 p-5">
              <p className="flex gap-3 text-[0.8125rem] text-sobre-foto/85">
                <time
                  dateTime={evento.data}
                  className="t-dado font-medium text-ouro"
                >
                  {diaDoMes(evento.data)} out, {evento.semana} {evento.hora}
                </time>
                <span>{evento.tipo}</span>
              </p>
              <h2 className="font-display text-[1.625rem] leading-[1.1] text-balance text-sobre-foto">
                <button
                  type="button"
                  onClick={() => setEscolhido(evento.data)}
                  className="blog-titulo-link text-left"
                >
                  {evento.programa}
                </button>
              </h2>
              <p className="text-[0.875rem] text-sobre-foto/85">
                <Local evento={evento} />
              </p>
            </div>
          </article>
        ))}
      </section>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <TrocaDeMes />
        <Filtros filtro={filtro} />
      </div>

      <div className="mt-6 grid items-start gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div
            aria-hidden="true"
            className="grid grid-cols-7 pb-2 text-[0.8125rem] text-texto-fraco"
          >
            {CABECALHO_DA_SEMANA.map(([letra, nome]) => (
              <span key={nome} className="px-1 sm:px-2.5">
                <span className="sm:hidden">{letra}</span>
                <span className="capitalize max-sm:hidden">
                  {nome.slice(0, 3)}
                </span>
              </span>
            ))}
          </div>
          <ul className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {diasDoMes().map((dia, i) => {
              if (!dia) return <li key={`vazio-${i}`} aria-hidden="true" />;
              const eventos = porData.get(dia) ?? [];
              const ativo = dia === escolhido;
              const numero = (
                <span
                  className={cx(
                    't-dado text-[0.875rem]',
                    eventos.length
                      ? 'font-medium text-texto'
                      : 'text-texto-fraco'
                  )}
                >
                  {Number(diaDoMes(dia))}
                </span>
              );

              if (!eventos.length) {
                return (
                  <li
                    key={dia}
                    className="min-h-14 rounded-controle p-1.5 sm:min-h-[6.75rem] sm:p-2.5"
                  >
                    {numero}
                  </li>
                );
              }

              return (
                <li key={dia}>
                  <button
                    type="button"
                    aria-pressed={ativo}
                    aria-label={`${tituloDoDia(dia)}, ${eventos.length} ${eventos.length === 1 ? 'evento' : 'eventos'}`}
                    onClick={() => setEscolhido(dia)}
                    className={cx(
                      'flex h-full min-h-14 w-full flex-col gap-1.5 rounded-controle border p-1.5 text-left transition-[border-color] duration-[var(--t-resposta)] ease-saida sm:min-h-[6.75rem] sm:p-2.5',
                      ativo
                        ? 'border-ouro tint-ouro'
                        : 'border-transparent bg-sup-2 hover:border-ouro/45'
                    )}
                  >
                    {numero}
                    {/* No telefone não cabe o nome: fica a contagem. */}
                    <span className="t-dado text-[0.8125rem] text-ouro-na-tinta sm:hidden">
                      {eventos.length}
                    </span>
                    {eventos.slice(0, 2).map((evento) => (
                      <span
                        key={evento.id}
                        className="line-clamp-2 text-[0.8125rem] leading-[1.3] text-texto-suave max-sm:hidden"
                      >
                        <span className="t-dado text-texto-fraco">
                          {evento.hora}
                        </span>{' '}
                        {evento.programa}
                      </span>
                    ))}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <section
          aria-live="polite"
          aria-labelledby="dia-escolhido-c"
          className="sup-1 p-5 lg:sticky lg:top-24"
        >
          <h2 id="dia-escolhido-c" className="t-subtitulo">
            {tituloDoDia(escolhido)}
          </h2>
          {doDia.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p" className="pt-3">
              Nenhum evento neste dia com os filtros de agora.
            </Text>
          ) : (
            <ul className="mt-1">
              {doDia.map((evento) => (
                <li
                  key={evento.id}
                  className="flex flex-col gap-2 border-b border-linha py-4 last:border-b-0 last:pb-0"
                >
                  <p className="flex gap-3 text-[0.8125rem] text-texto-fraco">
                    <span className="t-dado text-texto-suave">
                      {evento.hora}
                    </span>
                    <span>{evento.tipo}</span>
                  </p>
                  <h3 className="font-display text-[1.375rem] leading-[1.15] text-balance">
                    {evento.programa}
                  </h3>
                  <p className="text-[0.875rem] text-texto-suave">
                    <Local evento={evento} />
                  </p>
                  <p className="text-[0.875rem] leading-[1.55] text-texto-fraco">
                    {evento.descricao}
                  </p>
                  <NoPrograma evento={evento} />
                  <div className="pt-1">
                    <Ingresso evento={evento} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
