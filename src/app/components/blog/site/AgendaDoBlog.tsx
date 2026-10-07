'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiMagnifyingGlass,
  PiMapPin,
  PiPencilSimple,
  PiPlus,
  PiTrash,
} from 'react-icons/pi';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { cx } from '@/app/components/ui/cx';
import { useIsBlogAdmin } from '@/app/components/blog/AdminOnly';
import { useCalendarManagement } from '@/app/hooks/useCalendarManagement';
import { BLOG, rotuloDoTipo, type Idioma } from '@/app/conteudo/blog';
import {
  loadCalendar,
  type CalendarEventData,
  type CalendarFilterOptions,
} from '@/app/requests/calendar-requests';
import {
  chaveDoDia,
  dataCurta,
  diaDaSemana,
  horaDoEvento,
  mesCurto,
  diaDoMes,
} from '@/app/utils/blog/formatos';
import { Capa } from './Capa';
import { BotaoDoEvento } from './DetalheDoEvento';
import { VEU } from './cartoes';
import { LINK } from './pecas';

/**
 * A agenda de concertos (escolha de 30/09/2026: o esboço C).
 *
 * O mês inteiro à vista: os destaques com imagem no topo, a grade do mês e o
 * dia escolhido aberto ao lado (embaixo, no telefone). O que dura vários
 * dias — uma exposição, um festival — não ocupa todas as casas do mês: vai
 * para "Em cartaz neste mês".
 *
 * O tipo do evento não tem mais cor (eram sete, com uma legenda para
 * decorar): é texto, e filtro. Quem administra cria e edita evento e local
 * daqui; os formulários só carregam para a equipe.
 */

const FUSO_PADRAO = 'America/Sao_Paulo';
const UM_DIA = 86_400_000;

// Os formulários da equipe, fora do pacote de quem só lê.
const CreateEventModal = dynamic(
  () => import('@/app/components/calendar/CreateEventModal'),
  { ssr: false }
);
const CreateVenueModal = dynamic(
  () => import('@/app/components/calendar/CreateVenueModal'),
  { ssr: false }
);
const ConfirmDeleteEventModal = dynamic(
  () => import('@/app/components/calendar/ConfirmDeleteEventModal'),
  { ssr: false }
);

/** "2026-10" → o primeiro e o último instante do mês, no fuso de Brasília. */
function limitesDoMes(mes: string) {
  const [ano, m] = mes.split('-').map(Number);
  const inicio = new Date(Date.UTC(ano, m - 1, 1, 3));
  const fim = new Date(Date.UTC(ano, m, 1, 3) - 1);
  return { inicio, fim, ano, m };
}

function somarMes(mes: string, delta: number) {
  const { ano, m } = limitesDoMes(mes);
  const d = new Date(Date.UTC(ano, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const NENHUM = 'nenhum';

/** Para buscar sem acento nem maiúscula: "dvorak" acha "Dvořák". */
const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** O domingo da semana de um dia (AAAA-MM-DD). */
function domingoDe(dia: string) {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

function somarDias(dia: string, n: number) {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const duraDias = (e: CalendarEventData) =>
  (e.end.getTime() - e.start.getTime()) / UM_DIA > 1;

const fusoDe = (e: CalendarEventData) => e.timeZone || FUSO_PADRAO;

export function AgendaDoBlog({
  idioma,
  mesInicial,
  hoje,
  eventosIniciais,
  filtrosIniciais,
}: {
  idioma: Idioma;
  /** "2026-10". */
  mesInicial: string;
  /** "2026-10-01", o dia de hoje em Brasília (calculado no servidor). */
  hoje: string;
  eventosIniciais: CalendarEventData[];
  filtrosIniciais: CalendarFilterOptions;
}) {
  const t = BLOG[idioma].agenda;
  const admin = useIsBlogAdmin();

  const [mes, setMes] = useState(mesInicial);
  const [eventos, setEventos] = useState(eventosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [carregando, setCarregando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  const [tipo, setTipo] = useState('');
  const [cidade, setCidade] = useState('');
  const [casa, setCasa] = useState('');
  const [busca, setBusca] = useState('');
  // O dia aberto: `null` deixa a agenda escolher (hoje, ou o próximo com
  // evento); `NENHUM` é o "desmarquei" — o segundo clique no mesmo dia.
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [visao, setVisao] = useState<'mes' | 'semana'>('mes');
  // Domingo da semana à vista (AAAA-MM-DD).
  const [semana, setSemana] = useState(() => domingoDe(hoje));

  const carregar = useCallback(
    async (inicio: Date, fim: Date, alvo: string) => {
      setCarregando(true);
      setFalhou(false);
      try {
        const dados = await loadCalendar(inicio, fim, {}, { fresh: true });
        setEventos(dados.events);
        if (dados.filters.cities.length) setFiltros(dados.filters);
        setMes(alvo);
      } catch {
        setFalhou(true);
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  const carregarMes = useCallback(
    async (alvo: string) => {
      const { inicio, fim } = limitesDoMes(alvo);
      setEscolhido(null);
      await carregar(inicio, fim, alvo);
    },
    [carregar]
  );

  /** A semana pode cruzar dois meses: carrega o intervalo dela inteiro. */
  const irParaSemana = useCallback(
    async (domingo: string) => {
      setSemana(domingo);
      const inicio = new Date(`${domingo}T03:00:00Z`);
      const fim = new Date(inicio.getTime() + 7 * 86_400_000);
      await carregar(inicio, fim, somarDias(domingo, 3).slice(0, 7));
    },
    [carregar]
  );

  const trocarVisao = (nova: 'mes' | 'semana') => {
    if (nova === visao) return;
    setVisao(nova);
    if (nova === 'semana') {
      const base =
        escolhido && escolhido !== NENHUM
          ? escolhido
          : mes === hoje.slice(0, 7)
            ? hoje
            : `${mes}-01`;
      void irParaSemana(domingoDe(base));
    } else {
      // O mês do meio da semana: a de 27/09 a 03/10 é de outubro.
      void carregarMes(somarDias(semana, 3).slice(0, 7));
    }
  };

  const gestao = useCalendarManagement(() => void carregarMes(mes));

  const visiveis = useMemo(() => {
    const termo = semAcento(busca.trim());
    return eventos.filter(
      (e) =>
        (!tipo || e.type === tipo) &&
        (!cidade || e.venue.city === cidade) &&
        (!casa || e.venue.id === casa) &&
        (!termo ||
          semAcento(
            [
              e.title,
              e.subtitle,
              e.ensemble,
              e.conductor,
              ...e.composers.map((c) => c.name),
            ]
              .filter(Boolean)
              .join(' ')
          ).includes(termo))
    );
  }, [eventos, tipo, cidade, casa, busca]);

  const tipos = useMemo(
    () => [...new Set(eventos.map((e) => e.type))].sort(),
    [eventos]
  );

  const longos = visiveis.filter(duraDias);
  const porDia = useMemo(() => {
    const mapa = new Map<string, CalendarEventData[]>();
    for (const e of visiveis.filter((e) => !duraDias(e))) {
      const chave = chaveDoDia(e.start, fusoDe(e));
      mapa.set(chave, [...(mapa.get(chave) ?? []), e]);
    }
    for (const lista of mapa.values())
      lista.sort((a, b) => a.start.getTime() - b.start.getTime());
    return mapa;
  }, [visiveis]);

  const { ano, m } = limitesDoMes(mes);
  const diasNoMes = new Date(Date.UTC(ano, m, 0)).getUTCDate();
  const vazios = new Date(Date.UTC(ano, m - 1, 1)).getUTCDay();
  const dias = Array.from(
    { length: diasNoMes },
    (_, i) => `${mes}-${String(i + 1).padStart(2, '0')}`
  );

  // O dia aberto: o escolhido; senão hoje, se tiver evento; senão o próximo
  // dia com evento; senão o primeiro do mês com evento.
  const comEvento = dias.filter((d) => porDia.has(d));
  const diaAberto =
    escolhido === NENHUM
      ? null
      : (escolhido ??
        (porDia.has(hoje)
          ? hoje
          : (comEvento.find((d) => d >= hoje) ?? comEvento[0] ?? null)));
  const doDia = diaAberto ? (porDia.get(diaAberto) ?? []) : [];
  // Sem dia marcado, o painel mostra os próximos do mês.
  const proximos = visiveis
    .filter((e) => !duraDias(e) && chaveDoDia(e.start, fusoDe(e)) >= hoje)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 8);

  // Os destaques do mês são os escolhidos no painel (até três, cada um numa
  // posição), lado a lado e do mesmo tamanho. Os filtros não os escondem:
  // são a vitrine do mês.
  const destaques = eventos
    .filter((e) => e.isFeatured)
    .sort((a, b) => (a.featuredOrder ?? 9) - (b.featuredOrder ?? 9))
    .slice(0, 3);

  const nomeDoMes = (() => {
    const texto = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(ano, m - 1, 15)));
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  })();

  const tituloDoDia = (dia: string) => {
    const meio = new Date(`${dia}T15:00:00Z`);
    const semana = diaDaSemana(meio, idioma, 'UTC');
    const data = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'pt-BR', {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(meio);
    return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${data}`;
  };

  const limpar = () => {
    setTipo('');
    setCidade('');
    setCasa('');
    setBusca('');
  };

  return (
    <div className="flex flex-col gap-12">
      {admin && (
        <div className="flex flex-wrap gap-2">
          <Button
            variante="primario"
            tamanho="p"
            icone={PiPlus}
            onClick={gestao.openCreateEventModal}
          >
            {t.novoEvento}
          </Button>
          <Button
            tamanho="p"
            icone={PiMapPin}
            onClick={gestao.openCreateVenueModal}
          >
            {t.novoLocal}
          </Button>
          <Link
            href="/admin/scrapers"
            className={classesDeBotao('fantasma', 'p')}
          >
            <Icon de={PiMagnifyingGlass} tamanho="pp" />
            {t.buscarNasCasas}
          </Link>
        </div>
      )}

      {destaques.length > 0 && (
        <section aria-label={t.destaques} className="grid gap-3 md:grid-cols-3">
          {destaques.map((e, i) => {
            return (
              <article
                key={e.id}
                className="group relative isolate flex min-h-[15rem] items-end overflow-hidden rounded-card lg:min-h-[19rem]"
              >
                <Capa
                  src={e.imageUrl ?? null}
                  alt=""
                  inicial={e.title}
                  sizes="(min-width: 768px) 440px, 100vw"
                  prioridade={i === 0}
                  preencher
                  className="transition-transform duration-500 ease-saida group-hover:scale-[1.02] motion-reduce:transition-none"
                />
                <span aria-hidden="true" className={VEU} />
                <div className="relative flex flex-col gap-1.5 p-5">
                  <p className="flex flex-wrap gap-x-3 text-[0.8125rem] text-sobre-foto/85">
                    <time
                      dateTime={e.start.toISOString()}
                      className="t-dado font-medium text-ouro"
                    >
                      {diaDoMes(e.start, fusoDe(e))}{' '}
                      {mesCurto(e.start, idioma, fusoDe(e))},{' '}
                      {diaDaSemana(e.start, idioma, fusoDe(e)).slice(0, 3)}
                      {horaDoEvento(e.start, idioma, fusoDe(e), e.allDay) &&
                        ` ${horaDoEvento(e.start, idioma, fusoDe(e), e.allDay)}`}
                    </time>
                    <span>{rotuloDoTipo(idioma, e.type)}</span>
                  </p>
                  <h2 className="font-display text-[1.625rem] leading-[1.1] text-balance text-sobre-foto">
                    <BotaoDoEvento evento={e}>{e.title}</BotaoDoEvento>
                  </h2>
                  <p className="text-[0.875rem] text-sobre-foto/85">
                    {e.venue.name}
                    {e.venue.city !== 'N/A' && `, ${e.venue.city}`}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          {/* No telefone o mês ocupa a linha toda, centralizado entre as
              setas; a partir do `sm`, à esquerda com os filtros ao lado. */}
          <div className="flex items-center gap-1 max-sm:w-full">
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiCaretLeft}
              rotulo={visao === 'mes' ? t.mesAnterior : t.semanaAnterior}
              disabled={carregando}
              onClick={() =>
                visao === 'mes'
                  ? carregarMes(somarMes(mes, -1))
                  : irParaSemana(somarDias(semana, -7))
              }
            />
            <h2
              aria-live="polite"
              className="min-w-[11rem] text-center t-subtitulo max-sm:flex-1"
            >
              {visao === 'mes' ? nomeDoMes : tituloDaSemana(semana, idioma)}
            </h2>
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiCaretRight}
              rotulo={visao === 'mes' ? t.proximoMes : t.proximaSemana}
              disabled={carregando}
              onClick={() =>
                visao === 'mes'
                  ? carregarMes(somarMes(mes, 1))
                  : irParaSemana(somarDias(semana, 7))
              }
            />
          </div>
          <div
            role="group"
            aria-label={t.visao}
            className="flex gap-1.5 max-sm:w-full max-sm:justify-center"
          >
            <Chip
              selecionado={visao === 'mes'}
              onClick={() => trocarVisao('mes')}
            >
              {t.mes}
            </Chip>
            <Chip
              selecionado={visao === 'semana'}
              onClick={() => trocarVisao('semana')}
            >
              {t.semanaVisao}
            </Chip>
          </div>

          <div
            role="group"
            aria-label={t.filtrar}
            className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-4"
          >
            {/* No computador, tudo numa linha: os tipos ficam com o espaço
                que sobra e rolam se forem muitos (não quebram); cidade, casa
                e busca à direita. No telefone, um embaixo do outro. */}
            {tipos.length > 1 && (
              <div className="classical-scrollbar-mini -mx-1 flex gap-2 overflow-x-auto px-1 py-1 lg:min-w-0 lg:flex-1">
                <Chip
                  selecionado={!tipo}
                  onClick={() => setTipo('')}
                  className="shrink-0 whitespace-nowrap"
                >
                  {t.todos}
                </Chip>
                {tipos.map((valor) => (
                  <Chip
                    key={valor}
                    selecionado={tipo === valor}
                    onClick={() => setTipo(valor)}
                    className="shrink-0 whitespace-nowrap"
                  >
                    {rotuloDoTipo(idioma, valor)}
                  </Chip>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:ml-auto lg:shrink-0 lg:flex-nowrap">
              {filtros.cities.length > 1 && (
                <div className="w-full sm:w-56 lg:w-56">
                  <Selecao
                    aria-label={t.cidade}
                    icone={PiMapPin}
                    valor={cidade}
                    aoMudar={setCidade}
                    opcoes={[
                      { value: '', label: t.todasCidades },
                      ...filtros.cities.map((c) => ({ value: c, label: c })),
                    ]}
                    className="w-full"
                  />
                </div>
              )}
              {filtros.venues.length > 1 && (
                <div className="w-full sm:w-60 lg:w-52">
                  <Selecao
                    aria-label={t.casa}
                    valor={casa}
                    aoMudar={setCasa}
                    opcoes={[
                      { value: '', label: t.todasCasas },
                      ...filtros.venues
                        .filter((v) => !cidade || v.city === cidade)
                        .map((v) => ({ value: v.id, label: v.name })),
                    ]}
                    className="w-full"
                  />
                </div>
              )}
              <div className="relative w-full sm:w-64 lg:w-64">
                <Icon
                  de={PiMagnifyingGlass}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-fraco"
                />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder={t.buscarEvento}
                  aria-label={t.buscarEvento}
                  className="input-classical w-full !pl-11"
                />
              </div>
            </div>
          </div>
        </div>

        {falhou && (
          <p role="alert" className="t-rotulo text-erro">
            {t.erro}
          </p>
        )}

        {visiveis.length === 0 && !carregando ? (
          <Vazio
            icone={PiCalendarBlank}
            titulo={t.vazioTitulo}
            descricao={t.vazio}
            acao={
              tipo || cidade || casa || busca ? (
                <Button onClick={limpar}>{t.limpar}</Button>
              ) : undefined
            }
          />
        ) : (
          <div
            aria-busy={carregando}
            className={cx(
              'grid items-start gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1fr)_22rem]',
              carregando &&
                'opacity-60 transition-opacity duration-[var(--t-resposta)]'
            )}
          >
            {visao === 'semana' ? (
              <ol className="grid gap-2 sm:grid-cols-7 sm:gap-1.5">
                {Array.from({ length: 7 }, (_, i) => somarDias(semana, i)).map(
                  (dia) => {
                    const doEsteDia = porDia.get(dia) ?? [];
                    const ativo = dia === diaAberto;
                    return (
                      <li
                        key={dia}
                        className={cx(
                          'flex min-h-24 flex-col gap-2 rounded-controle p-2.5 sm:min-h-[16rem]',
                          ativo ? 'tint-ouro' : 'bg-sup-2'
                        )}
                      >
                        <button
                          type="button"
                          aria-pressed={ativo}
                          onClick={() => setEscolhido(ativo ? NENHUM : dia)}
                          className="flex items-baseline gap-2 text-left"
                        >
                          <span
                            className={cx(
                              'font-display text-[1.5rem] leading-none',
                              dia === hoje && 'text-ouro-texto'
                            )}
                          >
                            {Number(dia.slice(8))}
                          </span>
                          <span className="t-legenda">
                            {diaDaSemana(
                              new Date(`${dia}T15:00:00Z`),
                              idioma,
                              'UTC'
                            ).slice(0, 3)}
                          </span>
                        </button>
                        {doEsteDia.length === 0 ? (
                          <span className="t-legenda">—</span>
                        ) : (
                          <ul className="flex flex-col gap-2">
                            {doEsteDia.map((e) => (
                              <li
                                key={e.id}
                                className="group relative text-[0.8125rem] leading-[1.35]"
                              >
                                {horaDoEvento(
                                  e.start,
                                  idioma,
                                  fusoDe(e),
                                  e.allDay
                                ) && (
                                  <span className="t-dado block text-texto-fraco">
                                    {horaDoEvento(
                                      e.start,
                                      idioma,
                                      fusoDe(e),
                                      e.allDay
                                    )}
                                  </span>
                                )}
                                <BotaoDoEvento
                                  evento={e}
                                  className="text-texto group-hover:text-ouro-texto"
                                >
                                  {e.title}
                                </BotaoDoEvento>
                                <span className="block truncate text-texto-fraco">
                                  {e.venue.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }
                )}
              </ol>
            ) : (
              <div>
                <div
                  aria-hidden="true"
                  className="grid grid-cols-7 pb-2 text-[0.8125rem] text-texto-fraco"
                >
                  {t.semanaCurta.map((nome, i) => (
                    <span key={nome} className="px-1 sm:px-2.5">
                      <span className="sm:hidden">{t.semanaInicial[i]}</span>
                      <span className="max-sm:hidden">{nome}</span>
                    </span>
                  ))}
                </div>
                <ul className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {Array.from({ length: vazios }, (_, i) => (
                    <li key={`vazio-${i}`} aria-hidden="true" />
                  ))}
                  {dias.map((dia) => {
                    const doEsteDia = porDia.get(dia) ?? [];
                    const ativo = dia === diaAberto;
                    const numero = (
                      <span
                        className={cx(
                          't-dado text-[0.875rem]',
                          dia === hoje &&
                            'text-ouro-texto underline underline-offset-4',
                          doEsteDia.length
                            ? 'font-medium text-texto'
                            : 'text-texto-fraco'
                        )}
                      >
                        {Number(dia.slice(8))}
                      </span>
                    );

                    if (!doEsteDia.length) {
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
                          aria-label={`${tituloDoDia(dia)}: ${t.eventos(doEsteDia.length)}`}
                          // O segundo clique no mesmo dia desmarca.
                          onClick={() => setEscolhido(ativo ? NENHUM : dia)}
                          className={cx(
                            'flex h-full min-h-14 w-full flex-col gap-1.5 rounded-controle border p-1.5 text-left transition-[border-color] duration-[var(--t-resposta)] ease-saida sm:min-h-[6.75rem] sm:p-2.5',
                            ativo
                              ? 'border-ouro tint-ouro'
                              : 'border-transparent bg-sup-2 hover:border-ouro/45'
                          )}
                        >
                          {numero}
                          <span className="t-dado text-[0.8125rem] text-ouro-na-tinta sm:hidden">
                            {doEsteDia.length}
                          </span>
                          {doEsteDia.slice(0, 2).map((e) => (
                            <span
                              key={e.id}
                              className="line-clamp-2 text-[0.8125rem] leading-[1.3] text-texto-suave max-sm:hidden"
                            >
                              {horaDoEvento(
                                e.start,
                                idioma,
                                fusoDe(e),
                                e.allDay
                              ) && (
                                <span className="t-dado text-texto-fraco">
                                  {horaDoEvento(
                                    e.start,
                                    idioma,
                                    fusoDe(e),
                                    e.allDay
                                  )}{' '}
                                </span>
                              )}
                              {e.title}
                            </span>
                          ))}
                          {doEsteDia.length > 2 && (
                            <span className="t-legenda max-sm:hidden">
                              +{doEsteDia.length - 2}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <section
              aria-live="polite"
              aria-labelledby="dia-aberto"
              className="sup-1 p-5 lg:sticky lg:top-24"
            >
              <h3 id="dia-aberto" className="t-subtitulo">
                {diaAberto ? tituloDoDia(diaAberto) : t.proximosDoMes}
              </h3>
              {!diaAberto ? (
                proximos.length === 0 ? (
                  <p className="t-rotulo pt-3 text-texto-suave">
                    {t.semProximos}
                  </p>
                ) : (
                  <ul className="mt-1">
                    {proximos.map((e) => (
                      <Evento
                        key={e.id}
                        evento={e}
                        idioma={idioma}
                        admin={admin}
                        comData
                        aoEditar={() => gestao.openEditEventModal(e)}
                        aoApagar={() => gestao.openDeleteEventModal(e)}
                      />
                    ))}
                  </ul>
                )
              ) : doDia.length === 0 ? (
                <p className="t-rotulo pt-3 text-texto-suave">
                  {t.nenhumNoDia}
                </p>
              ) : (
                <ul className="mt-1">
                  {doDia.map((e) => (
                    <Evento
                      key={e.id}
                      evento={e}
                      idioma={idioma}
                      admin={admin}
                      aoEditar={() => gestao.openEditEventModal(e)}
                      aoApagar={() => gestao.openDeleteEventModal(e)}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>

      {longos.length > 0 && (
        <section aria-labelledby="em-cartaz">
          <h2 id="em-cartaz" className="t-titulo">
            {t.emCartaz}
          </h2>
          <ul className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {longos.map((e) => (
              <Evento
                key={e.id}
                evento={e}
                idioma={idioma}
                admin={admin}
                longo
                aoEditar={() => gestao.openEditEventModal(e)}
                aoApagar={() => gestao.openDeleteEventModal(e)}
              />
            ))}
          </ul>
        </section>
      )}

      {admin && (
        <>
          <CreateEventModal
            isOpen={gestao.isEventModalOpen}
            onClose={gestao.closeEventModal}
            onSuccess={gestao.handleEventSuccess}
            venues={filtros.venues}
            editingEvent={gestao.editingEvent}
          />
          <CreateVenueModal
            isOpen={gestao.isVenueModalOpen}
            onClose={gestao.closeVenueModal}
            onSuccess={gestao.handleVenueSuccess}
            editingVenue={gestao.editingVenue}
          />
          <ConfirmDeleteEventModal
            isOpen={!!gestao.deletingEvent}
            onClose={gestao.closeDeleteEventModal}
            onConfirm={gestao.handleDeleteEvent}
            isLoading={gestao.isDeletingEvent}
            eventTitle={gestao.deletingEvent?.title || ''}
          />
        </>
      )}
    </div>
  );
}

function Evento({
  evento: e,
  idioma,
  admin,
  longo = false,
  comData = false,
  aoEditar,
  aoApagar,
}: {
  evento: CalendarEventData;
  idioma: Idioma;
  admin: boolean;
  longo?: boolean;
  /** Mostra o dia junto da hora (a lista dos próximos, sem dia marcado). */
  comData?: boolean;
  aoEditar: () => void;
  aoApagar: () => void;
}) {
  const t = BLOG[idioma].agenda;
  const fuso = fusoDe(e);
  const ingresso = e.ticketUrl || e.externalUrl;

  return (
    <li className="group relative flex flex-col gap-2 border-b border-linha py-4 last:border-b-0 last:pb-0">
      <p className="flex flex-wrap gap-x-3 text-[0.8125rem] text-texto-fraco">
        {longo ? (
          <span className="t-dado text-texto-suave">
            {t.ate(dataCurta(e.end, idioma))}
          </span>
        ) : (
          <span className="t-dado text-texto-suave">
            {comData &&
              `${diaDoMes(e.start, fuso)} ${mesCurto(e.start, idioma, fuso)} · `}
            {e.allDay ? t.diaInteiro : horaDoEvento(e.start, idioma, fuso)}
          </span>
        )}
        <span>{rotuloDoTipo(idioma, e.type)}</span>
      </p>
      <h4 className="font-display text-[1.375rem] leading-[1.15] text-balance">
        <BotaoDoEvento evento={e} className="group-hover:text-ouro-texto">
          {e.title}
        </BotaoDoEvento>
      </h4>
      <p className="text-[0.875rem] text-texto-suave">
        {e.venue.name}
        {e.venue.city !== 'N/A' && `, ${e.venue.city}`}
        {e.venue.state !== 'N/A' && (
          <span className="t-dado"> {e.venue.state}</span>
        )}
      </p>
      {e.description && (
        <p className="line-clamp-4 whitespace-pre-line text-[0.875rem] leading-[1.55] text-texto-fraco">
          {e.description}
        </p>
      )}
      {e.composers.length > 0 && (
        <p className="relative z-10 text-[0.875rem] text-texto-fraco">
          {t.noPrograma}:{' '}
          {e.composers.map((c, i) => (
            <span key={c.id}>
              {i > 0 && ', '}
              <Link
                href={`/composer/${c.id}`}
                className="text-texto-suave underline decoration-linha-forte underline-offset-4 hover:decoration-ouro"
              >
                {c.name}
              </Link>
            </span>
          ))}
        </p>
      )}
      <div className="relative z-10 flex flex-wrap items-center gap-3 pt-1">
        {e.isFree && <Badge>{t.gratuito}</Badge>}
        {ingresso && (
          <a
            href={ingresso}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            {t.ingressos}
            <Icon de={PiArrowSquareOut} tamanho="pp" />
            <span className="sr-only">{BLOG[idioma].corpo.abreEmNovaAba}</span>
          </a>
        )}
        {admin && (
          <span className="ml-auto flex gap-1">
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiPencilSimple}
              rotulo={`${t.editar}: ${e.title}`}
              onClick={aoEditar}
            />
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiTrash}
              rotulo={`${t.apagar}: ${e.title}`}
              onClick={aoApagar}
            />
          </span>
        )}
      </div>
    </li>
  );
}

/** "4 – 10 de outubro de 2026" (ou "28 set. – 4 out. 2026" entre meses). */
function tituloDaSemana(domingo: string, idioma: Idioma) {
  const fmt = (dia: string, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'pt-BR', {
      ...o,
      timeZone: 'UTC',
    }).format(new Date(`${dia}T12:00:00Z`));
  const sabado = somarDias(domingo, 6);
  return domingo.slice(0, 7) === sabado.slice(0, 7)
    ? `${Number(domingo.slice(8))}–${fmt(sabado, { day: 'numeric', month: 'long', year: 'numeric' })}`
    : `${fmt(domingo, { day: 'numeric', month: 'short' })} – ${fmt(sabado, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
