'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiArrowSquareOut, PiCalendarBlank, PiPlay } from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Selecao } from '@/app/components/ui/Selecao';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { FiltroSelecao } from '@/app/components/Admin/painel/Filtros';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import {
  AcompanhamentoDeRodada,
  BarraDeProgresso,
  EstadoDaRodada,
  duracao,
} from '@/app/components/Admin/painel/Rodada';
import {
  dataCurta,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminInfinite,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import {
  useAgendamentosScraper,
  useAgendarScraper,
  useCasas,
  useDesagendarScraper,
  useRodarScraper,
  useRodarTodosScrapers,
} from '@/app/hooks/admin/useBlogAdmin';
import { useJobsRecentes } from '@/app/hooks/admin/useJobs';
import {
  NOME_DO_ESTADO_DO_EVENTO,
  getEventosImportados,
  getPreviaDaRodada,
  importarDaPrevia,
  type EventoDaRodada,
  type EventoImportado,
  type FiltroDeEventosImportados,
  type ResultadoDoScraper,
} from '@/app/requests/admin/blog';
import { terminou, type Job } from '@/app/requests/admin/jobs';

/**
 * Eventos importados: a agenda de concertos do blog vem dos sites das casas
 * (OSESP, Theatro Municipal…), lida por scrapers que rodam na fila.
 *
 * **Estava quebrada.** "Buscar agora" abria o modal antigo, que chamava rotas
 * que a API não tem mais, sem a sessão: a rodada nem começava, e a tela
 * ficava em "Iniciando". Agora "Buscar agora" enfileira a rodada
 * (`POST /scrapers/:id/run`) e acompanha o job até o fim.
 *
 * **Rodada manual não grava nada (01/10).** Ela só lê o site e mostra cada
 * evento, novo ou já na agenda; entra o que for marcado — um a um ou todos
 * os novos — ao salvar (`POST /scrapers/runs/:jobId/import`, que manda só as
 * posições). A rodada **agendada** importa sozinha e mostra o que fez.
 *
 * Cada casa mostra a última rodada — ao vivo enquanto roda —, e embaixo ficam
 * as rodadas dos últimos dias (filtráveis por casa e estado) e **todos os
 * eventos** que entraram por scraper. Uma rodada aberta lista evento a evento
 * o que houve — entrou, já existia, falhou e por quê —, e durante a
 * importação a barra diz qual evento está entrando. Cada evento abre a ficha.
 */

const ESTADOS_DA_RODADA = [
  { value: 'completed', label: 'Concluídas' },
  { value: 'failed', label: 'Falharam' },
  { value: 'curso', label: 'Na fila ou rodando' },
];

const irPara = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const FREQUENCIAS = [
  { value: '', label: 'Só quando eu mandar' },
  { value: '0 3 * * *', label: 'Toda madrugada, às 3h' },
  { value: '0 3 * * 1', label: 'Segunda, às 3h' },
  { value: '0 3 1,15 * *', label: 'Dias 1 e 15, às 3h' },
  { value: '0 3 1 * *', label: 'Dia 1 do mês, às 3h' },
];

type Rodada = Job<ResultadoDoScraper>;

const casaDa = (j: Rodada) =>
  (j.payload?.scraperId as string | undefined) ?? j.result?.scraperId ?? null;

export default function EventosImportados() {
  const casas = useCasas();
  const agenda = useAgendamentosScraper();
  const agendar = useAgendarScraper();
  const desagendar = useDesagendarScraper();
  const rodar = useRodarScraper();
  const rodarTodos = useRodarTodosScrapers();
  const recentes = useJobsRecentes<ResultadoDoScraper>('scraper', {
    limit: 40,
  });
  const [acompanhando, setAcompanhando] = useState<{
    jobId: string;
    casa: string;
  } | null>(null);
  const [rodando, setRodando] = useState<string | null>(null);
  const [casaDasRodadas, setCasaDasRodadas] = useState('');
  const [estadoDasRodadas, setEstadoDasRodadas] = useState('');
  const [quantasRodadas, setQuantasRodadas] = useState(15);
  const [filtroEventos, setFiltroEventos] = useState<FiltroDeEventosImportados>(
    { when: 'futuros' }
  );
  // Com casa escolhida, a API filtra (as 40 de cima podem não ter a casa).
  const daCasa = useJobsRecentes<ResultadoDoScraper>(
    'scraper',
    { limit: 100, job: casaDasRodadas },
    !!casaDasRodadas
  );
  const fonteDasRodadas = casaDasRodadas ? daCasa : recentes;
  const rodadas = useMemo(
    () =>
      (fonteDasRodadas.data ?? []).filter((j) =>
        !estadoDasRodadas
          ? true
          : estadoDasRodadas === 'curso'
            ? !terminou(j)
            : j.state === estadoDasRodadas
      ),
    [fonteDasRodadas.data, estadoDasRodadas]
  );

  const nomeDaCasa = (id: string | null) =>
    casas.data?.find((c) => c.id === id)?.venueName ?? id ?? 'Casa';

  // A rodada mais recente de cada casa.
  const ultimaDe = useMemo(() => {
    const m = new Map<string, Rodada>();
    for (const j of recentes.data ?? []) {
      const c = casaDa(j);
      if (c && !m.has(c)) m.set(c, j);
    }
    return m;
  }, [recentes.data]);

  const agendamentoDe = (id: string) =>
    agenda.data?.schedules.find((s) => s.scraperId === id);

  const mudar = async (id: string, cron: string) => {
    try {
      if (cron) await agendar.mutateAsync([id, cron]);
      else await desagendar.mutateAsync([id]);
      toast.success(cron ? 'Agendamento salvo.' : 'Agendamento tirado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível agendar.');
    }
  };

  const buscar = async (casa: string) => {
    setRodando(casa);
    try {
      const r = await rodar.mutateAsync([casa]);
      setAcompanhando({ jobId: r.jobId, casa });
      if (r.alreadyQueued) {
        toast(
          'Essa casa já estava na fila neste minuto; acompanhando a mesma rodada.'
        );
      }
      void recentes.refetch();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível começar a rodada.'
      );
    } finally {
      setRodando(null);
    }
  };

  const buscarTodas = async () => {
    try {
      const r = await rodarTodos.mutateAsync([]);
      toast.success(
        `${numero(r.queued)} casas na fila. O worker lê uma por vez; cada linha mostra o andamento.`
      );
      void recentes.refetch();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível enfileirar.'
      );
    }
  };

  // Números da última semana, somando as rodadas concluídas.
  const semana = useMemo(() => {
    const desde = Date.now() - 7 * 86_400_000;
    const feitas = (recentes.data ?? []).filter(
      (j) =>
        j.state === 'completed' &&
        j.finishedAt &&
        new Date(j.finishedAt).getTime() >= desde &&
        j.result
    );
    return {
      rodadas: feitas.length,
      falhas: (recentes.data ?? []).filter(
        (j) =>
          j.state === 'failed' &&
          j.finishedAt &&
          new Date(j.finishedAt).getTime() >= desde
      ).length,
      encontrados: feitas.reduce((s, j) => s + (j.result?.eventsFound ?? 0), 0),
      importados: feitas.reduce((s, j) => s + (j.result?.imported ?? 0), 0),
      duplicados: feitas.reduce((s, j) => s + (j.result?.duplicates ?? 0), 0),
    };
  }, [recentes.data]);

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Eventos importados"
        descricao="A agenda de concertos do blog, lida dos sites das casas"
        acoes={
          <>
            <Link
              href="/blog/calendar"
              target="_blank"
              className={classesDeBotao('fantasma', 'p')}
            >
              <Icon de={PiCalendarBlank} tamanho="pp" /> Ver a agenda
            </Link>
            <Button
              tamanho="p"
              variante="primario"
              icone={PiPlay}
              carregando={rodarTodos.isPending}
              onClick={buscarTodas}
            >
              Buscar em todas
            </Button>
          </>
        }
      />

      <Numeros
        carregando={recentes.loading}
        colunas={4}
        itens={[
          {
            id: 'rodadas',
            rotulo: 'Rodadas em 7 dias',
            valor: numero(semana.rodadas),
            nota: semana.falhas
              ? `${numero(semana.falhas)} falharam`
              : 'nenhuma falha',
            tom: semana.falhas ? 'atencao' : undefined,
            aoClicar: () => {
              setCasaDasRodadas('');
              setEstadoDasRodadas(semana.falhas ? 'failed' : '');
              irPara('scr-rodadas');
            },
          },
          {
            id: 'encontrados',
            rotulo: 'Eventos lidos',
            valor: numero(semana.encontrados),
            nota: 'nos sites das casas',
            aoClicar: () => {
              setCasaDasRodadas('');
              setEstadoDasRodadas('completed');
              irPara('scr-rodadas');
            },
          },
          {
            id: 'importados',
            rotulo: 'Entraram na agenda',
            valor: numero(semana.importados),
            nota: 'eventos novos',
            aoClicar: () => {
              setFiltroEventos({
                importedFrom: new Date(
                  Date.now() - 7 * 86_400_000
                ).toISOString(),
              });
              irPara('scr-eventos');
            },
          },
          {
            id: 'duplicados',
            rotulo: 'Já estavam lá',
            valor: numero(semana.duplicados),
            nota: 'pulados, sem duplicar',
            aoClicar: () => {
              setCasaDasRodadas('');
              setEstadoDasRodadas('completed');
              irPara('scr-rodadas');
            },
          },
        ]}
      />

      <Secao titulo="Casas" id="scr-casas">
        {casas.loading ? (
          <Row.Lista>
            <Row.Skeleton repetir={6} />
          </Row.Lista>
        ) : casas.error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {casas.error}
          </Text>
        ) : (
          <ul className="sup-1 flex flex-col !p-0">
            {(casas.data ?? []).map((c) => {
              const a = agendamentoDe(c.id);
              const cron = a?.cron ?? '';
              const conhecido = FREQUENCIAS.some((f) => f.value === cron);
              const ultima = ultimaDe.get(c.id);
              const emCurso = ultima && !terminou(ultima);
              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-3 border-t border-linha px-5 py-4 first:border-0"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex min-w-0 flex-1 basis-60 flex-col">
                      <span className="font-display text-[1.125rem] text-texto">
                        {c.venueName}
                      </span>
                      <a
                        href={c.baseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="t-legenda inline-flex items-center gap-1 hover:text-texto"
                      >
                        {c.baseUrl
                          .replace(/^https?:\/\//, '')
                          .replace(/\/$/, '')}{' '}
                        <Icon de={PiArrowSquareOut} tamanho="pp" />
                      </a>
                    </span>
                    <span className="flex w-full flex-col gap-1 sm:w-56">
                      <label htmlFor={`agenda-${c.id}`} className="sr-only">
                        Frequência de {c.venueName}
                      </label>
                      <Selecao
                        id={`agenda-${c.id}`}
                        valor={cron}
                        aoMudar={(v) => mudar(c.id, v)}
                        opcoes={
                          conhecido
                            ? FREQUENCIAS
                            : [
                                ...FREQUENCIAS,
                                {
                                  value: cron,
                                  label: `Personalizado (${cron})`,
                                },
                              ]
                        }
                        disabled={agendar.isPending || desagendar.isPending}
                      />
                      <span className="t-legenda">
                        {a?.nextRunAt
                          ? `Próxima rodada ${relativo(a.nextRunAt)}`
                          : 'Sem agendamento'}
                      </span>
                    </span>
                    <Button
                      tamanho="p"
                      icone={PiPlay}
                      onClick={() => buscar(c.id)}
                      carregando={rodando === c.id}
                      disabled={!!emCurso || !!c.desativado}
                      className="max-sm:w-full"
                    >
                      {c.desativado
                        ? 'Desativada'
                        : emCurso
                          ? 'Rodando'
                          : 'Buscar agora'}
                    </Button>
                  </div>
                  {c.desativado && (
                    <Text papel="legenda" as="p" className="medida-texto">
                      {c.desativado}
                    </Text>
                  )}

                  {ultima && (
                    <button
                      type="button"
                      onClick={() =>
                        setAcompanhando({ jobId: ultima.jobId, casa: c.id })
                      }
                      className="-mx-2 flex flex-col gap-2 rounded-controle px-2 py-2 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                    >
                      {emCurso ? (
                        <BarraDeProgresso job={ultima} />
                      ) : (
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <EstadoDaRodada job={ultima} />
                          <span className="t-legenda">
                            {ultima.finishedAt
                              ? relativo(ultima.finishedAt)
                              : ''}
                            {ultima.result
                              ? ultima.result.modo === 'previa'
                                ? ` · prévia: ${numero(ultima.result.eventsFound)} lidos, ${numero(ultima.result.eventsFound - ultima.result.duplicates)} novos para escolher`
                                : ` · ${numero(ultima.result.eventsFound)} lidos, ${numero(ultima.result.imported)} entraram, ${numero(ultima.result.duplicates)} já existiam${ultima.result.failed ? `, ${numero(ultima.result.failed)} com problema` : ''}`
                              : ultima.failedReason
                                ? ` · ${ultima.failedReason}`
                                : ''}
                          </span>
                        </span>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <Text papel="legenda" as="p" className="medida-texto">
          Horários de Brasília. &quot;Buscar agora&quot; só lê o site: você vê
          cada evento e escolhe o que entra na agenda. A rodada agendada importa
          sozinha e pula o que já está lá.
        </Text>
      </Secao>

      <Secao
        titulo="Últimas rodadas"
        id="scr-rodadas"
        detalhe="feitas ficam 7 dias; falhas, 30"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <FiltroSelecao
            rotulo="Casa"
            valor={casaDasRodadas}
            aoMudar={(v) => {
              setCasaDasRodadas(v);
              setQuantasRodadas(15);
            }}
            todos="Todas as casas"
            opcoes={(casas.data ?? []).map((c) => ({
              value: c.id,
              label: c.venueName,
            }))}
          />
          <FiltroSelecao
            rotulo="Estado"
            valor={estadoDasRodadas}
            aoMudar={(v) => {
              setEstadoDasRodadas(v);
              setQuantasRodadas(15);
            }}
            todos="Todos"
            opcoes={ESTADOS_DA_RODADA}
          />
        </div>
        {fonteDasRodadas.loading ? (
          <Row.Skeleton repetir={4} />
        ) : rodadas.length === 0 ? (
          <Text papel="rotulo" tom="suave" as="p">
            {casaDasRodadas || estadoDasRodadas
              ? 'Nenhuma rodada com esses filtros.'
              : 'Nenhuma rodada nos últimos dias.'}
          </Text>
        ) : (
          <Stack gap={3}>
            <ul className="sup-1 flex flex-col !p-0">
              {rodadas.slice(0, quantasRodadas).map((j) => (
                <li
                  key={j.jobId}
                  className="border-t border-linha first:border-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAcompanhando({
                        jobId: j.jobId,
                        casa: casaDa(j) ?? '',
                      })
                    }
                    className="flex min-h-11 w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                  >
                    <span className="min-w-0 flex-1 basis-40 truncate text-[0.9375rem] text-texto">
                      {nomeDaCasa(casaDa(j))}
                    </span>
                    <EstadoDaRodada job={j} />
                    <span className="t-legenda t-dado w-40 text-right max-sm:text-left">
                      {j.result
                        ? j.result.modo === 'previa'
                          ? `prévia · ${numero(j.result.eventsFound)} lidos`
                          : `${numero(j.result.eventsFound)} lidos · ${numero(j.result.imported)} entraram`
                        : (duracao(j) ?? '—')}
                    </span>
                    <span className="t-legenda w-24 text-right max-sm:text-left">
                      {relativo(j.finishedAt ?? j.processedAt ?? j.requestedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {rodadas.length > quantasRodadas && (
              <Button
                tamanho="p"
                variante="texto"
                className="self-start"
                onClick={() => setQuantasRodadas((n) => n + 15)}
              >
                Mostrar mais ({numero(rodadas.length - quantasRodadas)})
              </Button>
            )}
          </Stack>
        )}
      </Secao>

      <Secao
        titulo="Eventos importados"
        id="scr-eventos"
        detalhe="tudo que entrou por scraper, de todas as rodadas"
      >
        <EventosNaAgenda
          filtro={filtroEventos}
          aoMudar={setFiltroEventos}
          casas={(casas.data ?? []).map((c) => ({
            value: c.id,
            label: c.venueName,
          }))}
        />
      </Secao>

      <AcompanhamentoDeRodada<ResultadoDoScraper>
        fila="scraper"
        jobId={acompanhando?.jobId ?? null}
        titulo={nomeDaCasa(acompanhando?.casa ?? null)}
        aoFechar={() => {
          setAcompanhando(null);
          void recentes.refetch();
        }}
        resultado={(r) =>
          r.modo === 'previa' && acompanhando ? (
            <EscolhaDaPrevia
              jobId={acompanhando.jobId}
              aoImportar={() => void recentes.refetch()}
            />
          ) : (
            <Stack gap={4}>
              <Numeros
                colunas={4}
                itens={[
                  {
                    id: 'lidos',
                    rotulo: 'Lidos no site',
                    valor: numero(r.eventsFound),
                  },
                  {
                    id: 'novos',
                    rotulo: 'Entraram na agenda',
                    valor: numero(r.imported),
                  },
                  {
                    id: 'duplicados',
                    rotulo: 'Já existiam',
                    valor: numero(r.duplicates),
                  },
                  {
                    id: 'problema',
                    rotulo: 'Com problema',
                    valor: numero(r.failed),
                    tom: r.failed ? 'atencao' : undefined,
                  },
                ]}
              />
              {r.eventsFound === 0 && (
                <Text papel="rotulo" tom="suave" as="p">
                  O site não listou nenhum evento. Pode ser programação vazia —
                  ou a página mudou e o scraper precisa de ajuste.
                </Text>
              )}
              {r.eventos ? (
                <EventosDaRodada eventos={r.eventos} total={r.eventsFound} />
              ) : (
                r.problems.length > 0 && (
                  // Rodadas de antes do detalhe evento a evento só têm isto.
                  <Stack gap={2}>
                    <Text papel="rotulo" as="h4" className="font-medium">
                      O que não entrou, e por quê
                    </Text>
                    <ul className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
                      {r.problems.map((p, i) => (
                        <li
                          key={i}
                          className="px-4 py-2.5 text-sm text-texto-suave"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </Stack>
                )
              )}
            </Stack>
          )
        }
        rodape={
          <Link
            href="/blog/calendar"
            target="_blank"
            className={classesDeBotao('secundario', 'p')}
          >
            <Icon de={PiCalendarBlank} tamanho="pp" /> Ver a agenda
          </Link>
        }
      />
    </Stack>
  );
}

const NOME_DO_DESFECHO: Record<EventoDaRodada['estado'], string> = {
  novo: 'Novo',
  importado: 'Entrou',
  'ja-existia': 'Já existia',
  falhou: 'Não entrou',
};

/** Cada evento que a rodada leu, com o que houve; os que estão no banco abrem. */
function EventosDaRodada({
  eventos,
  total,
}: {
  eventos: EventoDaRodada[];
  total: number;
}) {
  const navegar = useNavegar();
  const [recorte, setRecorte] = useState<'' | EventoDaRodada['estado']>('');
  const conta = (e: EventoDaRodada['estado']) =>
    eventos.filter((x) => x.estado === e).length;
  const lista = recorte ? eventos.filter((e) => e.estado === recorte) : eventos;

  return (
    <Stack gap={3}>
      <Text papel="rotulo" as="h4" className="font-medium">
        Evento a evento
      </Text>
      <Segmentos
        rotulo="Mostrar"
        valor={recorte}
        aoMudar={setRecorte}
        opcoes={[
          { valor: '', rotulo: 'Todos', contagem: eventos.length },
          {
            valor: 'importado',
            rotulo: 'Entraram',
            contagem: conta('importado'),
          },
          {
            valor: 'ja-existia',
            rotulo: 'Já existiam',
            contagem: conta('ja-existia'),
          },
          {
            valor: 'falhou',
            rotulo: 'Não entraram',
            contagem: conta('falhou'),
          },
        ]}
      />
      {lista.length === 0 ? (
        <Text papel="rotulo" tom="suave" as="p">
          Nenhum.
        </Text>
      ) : (
        <ul className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
          {lista.map((e, i) => (
            <li
              key={`${e.eventId ?? ''}-${i}`}
              className="flex flex-col gap-0.5 px-4 py-2.5"
            >
              <span className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1 text-sm text-texto">
                  {e.eventId ? (
                    <Elo onClick={() => navegar.evento(e.eventId!)}>
                      {e.titulo}
                    </Elo>
                  ) : (
                    e.titulo
                  )}
                </span>
                <span
                  className={
                    e.estado === 'falhou'
                      ? 't-legenda shrink-0 text-erro'
                      : 't-legenda shrink-0'
                  }
                >
                  {NOME_DO_DESFECHO[e.estado]}
                </span>
              </span>
              <span className="t-legenda">
                {[
                  e.data ? dataCurta(e.data) : null,
                  e.estado === 'falhou' ? e.mensagem : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      )}
      {total > eventos.length && (
        <Text papel="legenda" as="p">
          Mostrando os primeiros {numero(eventos.length)} de {numero(total)}.
        </Text>
      )}
    </Stack>
  );
}

/** Todos os eventos que entraram por scraper, com filtros; cada um abre. */
function EventosNaAgenda({
  filtro,
  aoMudar,
  casas,
}: {
  filtro: FiltroDeEventosImportados;
  aoMudar: (f: FiltroDeEventosImportados) => void;
  casas: { value: string; label: string }[];
}) {
  const navegar = useNavegar();
  const lista = useAdminInfinite<EventoImportado>(
    adminKeys.list('scrapers', { eventos: filtro }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await getEventosImportados(filtro, pagina);
      return {
        items: r.items,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );
  const muda = (parte: Partial<FiltroDeEventosImportados>) =>
    aoMudar({ ...filtro, ...parte });

  return (
    <Stack gap={4}>
      <div className="flex flex-col gap-3">
        <Busca
          rotulo="Buscar evento"
          placeholder="Título do evento"
          valor={filtro.search ?? ''}
          aoMudar={(v) => muda({ search: v || undefined })}
        />
        <Segmentos
          rotulo="Quando"
          valor={filtro.when ?? ''}
          aoMudar={(v) => muda({ when: v || undefined })}
          opcoes={[
            { valor: 'futuros', rotulo: 'Próximos' },
            { valor: 'passados', rotulo: 'Já aconteceram' },
            { valor: '', rotulo: 'Todos' },
          ]}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <FiltroSelecao
            rotulo="Casa"
            valor={filtro.scraperId ?? ''}
            aoMudar={(v) => muda({ scraperId: v || undefined })}
            todos="Todas as casas"
            opcoes={casas}
          />
          <FiltroSelecao
            rotulo="Estado"
            valor={filtro.status ?? ''}
            aoMudar={(v) => muda({ status: v || undefined })}
            opcoes={Object.entries(NOME_DO_ESTADO_DO_EVENTO).map(
              ([value, label]) => ({ value, label })
            )}
          />
        </div>
        {filtro.importedFrom && (
          <Button
            tamanho="p"
            variante="texto"
            className="self-start"
            onClick={() => muda({ importedFrom: undefined })}
          >
            Importados desde {dataCurta(filtro.importedFrom)} · tirar
          </Button>
        )}
      </div>

      {lista.loading ? (
        <Row.Skeleton repetir={5} />
      ) : lista.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {lista.error}
        </Text>
      ) : lista.items.length === 0 ? (
        <Text papel="rotulo" tom="suave" as="p">
          Nenhum evento com esses filtros.
        </Text>
      ) : (
        <Stack gap={3}>
          <Text papel="legenda" as="p">
            {numero(lista.total ?? lista.items.length)} eventos
          </Text>
          <ul className="sup-1 flex flex-col !p-0">
            {lista.items.map((e) => (
              <li key={e.id} className="border-t border-linha first:border-0">
                <button
                  type="button"
                  onClick={() => navegar.evento(e.id)}
                  className="flex min-h-11 w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  <span className="flex min-w-0 flex-1 basis-60 flex-col">
                    <span className="truncate text-[0.9375rem] text-texto">
                      {e.title}
                    </span>
                    <span className="t-legenda truncate">
                      {[e.venue?.name, e.room].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="t-legenda w-36">
                    {NOME_DO_ESTADO_DO_EVENTO[e.status] ?? e.status}
                  </span>
                  <span className="t-legenda t-dado w-32 text-right max-sm:text-left">
                    {dataCurta(e.startDate)}
                    {e.startTime ? `, ${e.startTime}` : ''}
                  </span>
                  <span className="t-legenda w-28 text-right max-sm:text-left">
                    entrou {relativo(e.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {lista.hasMore && (
            <Button
              tamanho="p"
              variante="texto"
              className="self-start"
              onClick={lista.loadMore}
              carregando={lista.loadingMore}
            >
              Carregar mais
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * A prévia de uma rodada manual: cada evento lido, marcado "novo" ou "já
 * está na agenda". Nada entra até alguém escolher — um a um ou todos os
 * novos — e salvar. A lista é conferida de novo contra a agenda ao abrir,
 * então o que já foi importado depois aparece como existente.
 */
function EscolhaDaPrevia({
  jobId,
  aoImportar,
}: {
  jobId: string;
  aoImportar: () => void;
}) {
  const navegar = useNavegar();
  const previa = useAdminQuery(
    adminKeys.list('scrapers', { previa: jobId }),
    () => getPreviaDaRodada(jobId)
  );
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [importando, setImportando] = useState(false);
  const [soNovos, setSoNovos] = useState(true);

  const eventos = previa.data?.eventos ?? [];
  const novos = eventos.filter((e) => e.estado === 'novo');
  const lista = soNovos ? novos : eventos;
  const todosNovosMarcados =
    novos.length > 0 && novos.every((e) => marcados.has(e.indice!));

  const alternar = (i: number) =>
    setMarcados((m) => {
      const n = new Set(m);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const importar = async () => {
    setImportando(true);
    try {
      const r = await importarDaPrevia(jobId, [...marcados]);
      toast.success(
        `${numero(r.importados)} ${r.importados === 1 ? 'evento entrou' : 'eventos entraram'} na agenda${r.jaExistiam ? `; ${numero(r.jaExistiam)} já estavam lá` : ''}${r.falharam ? `; ${numero(r.falharam)} com problema` : ''}.`
      );
      setMarcados(new Set());
      await previa.refetch();
      aoImportar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível importar.'
      );
    } finally {
      setImportando(false);
    }
  };

  if (previa.loading) return <Row.Skeleton repetir={5} />;
  if (previa.error) {
    return (
      <Text papel="rotulo" tom="erro" as="p">
        {previa.error}
      </Text>
    );
  }

  return (
    <Stack gap={4}>
      <Text papel="rotulo" tom="suave" as="p" className="medida-texto">
        Esta rodada só leu o site: {numero(previa.data?.lidos ?? 0)} eventos,{' '}
        {numero(novos.length)} ainda fora da agenda. Escolha o que entra e
        salve.
      </Text>
      <div className="flex flex-wrap items-center gap-3">
        <Segmentos
          rotulo="Mostrar"
          valor={soNovos ? 'novos' : 'todos'}
          aoMudar={(v) => setSoNovos(v === 'novos')}
          opcoes={[
            { valor: 'novos', rotulo: 'Novos', contagem: novos.length },
            { valor: 'todos', rotulo: 'Todos', contagem: eventos.length },
          ]}
        />
        <Button
          tamanho="p"
          variante="texto"
          disabled={novos.length === 0}
          onClick={() =>
            setMarcados(
              todosNovosMarcados
                ? new Set()
                : new Set(novos.map((e) => e.indice!))
            )
          }
        >
          {todosNovosMarcados ? 'Desmarcar todos' : 'Marcar todos os novos'}
        </Button>
        <Button
          tamanho="p"
          variante="primario"
          className="sm:ml-auto"
          disabled={marcados.size === 0}
          carregando={importando}
          onClick={importar}
        >
          {marcados.size
            ? `Importar ${numero(marcados.size)} ${marcados.size === 1 ? 'evento' : 'eventos'}`
            : 'Importar'}
        </Button>
      </div>

      {lista.length === 0 ? (
        <Text papel="rotulo" tom="suave" as="p">
          {soNovos
            ? 'Nada novo: tudo o que o site listou já está na agenda.'
            : 'O site não listou nenhum evento.'}
        </Text>
      ) : (
        <ul className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
          {lista.map((e) => {
            const novo = e.estado === 'novo';
            return (
              <li key={e.indice} className="flex items-start gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Importar ${e.titulo}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--ouro)]"
                  disabled={!novo}
                  checked={marcados.has(e.indice!)}
                  onChange={() => alternar(e.indice!)}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm text-texto">
                    {!novo && e.eventId ? (
                      <Elo onClick={() => navegar.evento(e.eventId!)}>
                        {e.titulo}
                      </Elo>
                    ) : (
                      e.titulo
                    )}
                  </span>
                  <span className="t-legenda">
                    {[e.data ? dataCurta(e.data) : null, e.hora, e.local]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="t-legenda shrink-0">
                  {novo ? 'Novo' : 'Já na agenda'}
                </span>
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="t-legenda shrink-0 hover:text-texto"
                    aria-label={`Abrir ${e.titulo} no site da casa`}
                  >
                    <Icon de={PiArrowSquareOut} tamanho="pp" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Stack>
  );
}
