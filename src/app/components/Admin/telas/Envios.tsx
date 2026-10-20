'use client';

import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PiArrowSquareOut, PiEye } from 'react-icons/pi';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { Avatar } from '@/app/components/Admin/painel/Avatar';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Escolher, type Opcao } from '@/app/components/Admin/painel/Escolher';
import { FiltroSelecao } from '@/app/components/Admin/painel/Filtros';
import { Colunas, Pizza } from '@/app/components/Admin/painel/Graficos';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import {
  SeletorDePeriodo,
  janelaDo,
  nomeDoPeriodo,
  type Periodo,
} from '@/app/components/Admin/painel/Periodo';
import { Recolhivel } from '@/app/components/Admin/painel/Recolhivel';
import {
  AcaoDaLinha,
  Tabela,
  type Coluna,
} from '@/app/components/Admin/painel/Tabela';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import { nomeDoCampo, valorLegivel } from '@/app/components/Admin/painel/acoes';
import {
  dataHora,
  numero,
  porcento,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import {
  useEnvios,
  useEstatisticasEnvios,
} from '@/app/hooks/admin/useCatalogo';
import type { Envio } from '@/app/requests/admin/catalogo';
import { buscarPessoas } from '@/app/requests/admin/users';

/**
 * Envios: o que a comunidade cadastrou, editou e apagou no catálogo.
 *
 * É a trilha das contribuições — a da auditoria é a do painel. Juntas dizem
 * tudo o que mudou no acervo e por quem. Os envios publicam direto (RN-4:
 * não há aprovação prévia); o que vier errado se corrige aqui ou vira
 * denúncia.
 *
 * Todos os números seguem o período escolhido (antes, "por tipo" e "quem
 * mais contribui" eram de todo o tempo, ao lado de um gráfico de 30 dias).
 */

const TIPOS: Record<string, string> = {
  composer: 'Compositor',
  work: 'Obra',
  score: 'Partitura',
  user: 'Perfil',
};
const FILTROS: [string, string][] = [
  ['composer', 'Compositores'],
  ['work', 'Obras'],
  ['score', 'Partituras'],
];
const ACOES: Record<string, string> = {
  create: 'cadastrou',
  update: 'editou',
  delete: 'apagou',
};

const nome = (e: Envio) =>
  String(
    e.entity?.title ??
      e.entity?.fullName ??
      e.entity?.name ??
      nomeGravado(e) ??
      `${TIPOS[e.entityType] ?? e.entityType} removido`
  );

/** O nome guardado no próprio envio, para o que já foi apagado. */
function nomeGravado(e: Envio): string | null {
  const c = e.changes as Record<string, unknown> | null;
  const v = c?.title ?? c?.name ?? c?.fullName;
  return typeof v === 'string' ? v : null;
}

const quem = (e: Envio) =>
  e.user
    ? [e.user.firstName, e.user.lastName].filter(Boolean).join(' ') ||
      'Conta sem nome'
    : 'Conta removida';

const camposDe = (e: Envio) =>
  e.changes && typeof e.changes === 'object'
    ? Object.keys(e.changes as object).length
    : 0;

/** Abre o registro do envio no painel (compositor, obra ou partitura). */
function abrirRegistro(
  e: Envio,
  navegar: ReturnType<typeof useNavegar>
): (() => void) | null {
  if (!e.entityExists) return null;
  if (e.entityType === 'composer') return () => navegar.compositor(e.entityId);
  if (e.entityType === 'work') return () => navegar.obra(e.entityId);
  if (e.entityType === 'score') return () => navegar.partitura(e.entityId);
  return null;
}

function linkPublico(e: Envio): string | null {
  if (!e.entityExists) return null;
  if (e.entityType === 'composer') return `/composer/${e.entityId}`;
  if (e.entityType === 'work') return `/works/${e.entityId}`;
  const obra = (e.entity as { work?: { id?: string } } | null)?.work?.id;
  return e.entityType === 'score' && obra ? `/works/${obra}` : null;
}

export default function Envios() {
  const navegar = useNavegar();
  const [periodo, setPeriodo] = useState<Periodo>({ tipo: 'dias', dias: 30 });
  const [tipo, setTipo] = useState('');
  const [acao, setAcao] = useState('');
  const [pessoa, setPessoa] = useState<Opcao | null>(null);
  const [aberto, setAberto] = useState<Envio | null>(null);

  const janela = useMemo(() => janelaDo(periodo), [periodo]);
  const lista = useEnvios({
    entityType: tipo || undefined,
    action: acao || undefined,
    userId: pessoa?.id,
    from: janela.de,
    to: janela.ate,
  });
  const stats = useEstatisticasEnvios(janela);
  const s = stats.data;
  const nomePeriodo = nomeDoPeriodo(periodo);

  const colunas: Coluna<Envio>[] = [
    {
      id: 'item',
      titulo: 'O quê',
      principal: true,
      celula: (e) => (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar nome={quem(e)} imagem={e.user?.image} />
          <span className="flex min-w-0 flex-col">
            <span className="t-rotulo truncate text-texto-suave">
              {e.user ? (
                <Elo
                  onClick={() => navegar.usuario(e.user!.id)}
                  className="font-medium"
                >
                  {quem(e)}
                </Elo>
              ) : (
                <span className="font-medium text-texto">{quem(e)}</span>
              )}{' '}
              {ACOES[e.action] ?? e.action}{' '}
              {(TIPOS[e.entityType] ?? e.entityType).toLowerCase()}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              {abrirRegistro(e, navegar) ? (
                <Elo
                  onClick={abrirRegistro(e, navegar)!}
                  className="truncate font-display text-[1.0625rem]"
                >
                  {nome(e)}
                </Elo>
              ) : (
                <span className="truncate font-display text-[1.0625rem] text-texto-fraco line-through">
                  {nome(e)}
                </span>
              )}
              {(e.entity as { isVerified?: boolean } | null)?.isVerified && (
                <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
              )}
            </span>
            <span className="t-legenda truncate">
              {[
                (e.entity as { composer?: { name?: string } } | null)?.composer
                  ?.name,
                (e.entity as { work?: { title?: string } } | null)?.work?.title,
                e.action === 'update' && camposDe(e)
                  ? `${camposDe(e)} ${camposDe(e) === 1 ? 'campo' : 'campos'}`
                  : null,
                e.reason,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: 'estado',
      titulo: 'Hoje',
      soNoComputador: true,
      celula: (e) =>
        !e.entityExists ? (
          <Badge>Removido</Badge>
        ) : (e.entity as { isActive?: boolean } | null)?.isActive === false ? (
          <Badge>Desativada</Badge>
        ) : (
          <span className="text-sm">no catálogo</span>
        ),
    },
    {
      id: 'quando',
      titulo: 'Quando',
      celula: (e) => (
        <span className="t-dado text-sm" title={dataHora(e.createdAt)}>
          {relativo(e.createdAt)}
        </span>
      ),
    },
  ];

  const total = s?.total ?? 0;
  const pct = (n: number) =>
    total > 0 ? porcento((n / total) * 100) : undefined;

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Envios"
        descricao="O que a comunidade cadastrou, editou e apagou no catálogo"
        atualizadoEm={stats.updatedAt}
      />

      <SeletorDePeriodo valor={periodo} aoMudar={setPeriodo} />

      <Recolhivel
        chave="envios"
        titulo="O período"
        resumo={
          s
            ? `${numero(s.total)} envios ${nomePeriodo} · ${numero(s.contribuintes)} pessoas`
            : undefined
        }
      >
        <Numeros
          carregando={stats.loading}
          colunas={6}
          itens={[
            {
              id: 'total',
              rotulo: 'Envios',
              aoClicar: () => {
                setAcao('');
                setTipo('');
                setPessoa(null);
                rolarAte('env-lista');
              },
              valor: numero(s?.total),
              nota: s ? `${numero(s.totalGeral)} desde o início` : undefined,
            },
            {
              id: 'cadastros',
              rotulo: 'Cadastros',
              aoClicar: () => {
                setAcao('create');
                rolarAte('env-lista');
              },
              valor: numero(s?.byAction.create ?? 0),
              nota: s ? pct(s.byAction.create ?? 0) : undefined,
            },
            {
              id: 'edicoes',
              rotulo: 'Edições',
              aoClicar: () => {
                setAcao('update');
                rolarAte('env-lista');
              },
              valor: numero(s?.byAction.update ?? 0),
              nota: s ? pct(s.byAction.update ?? 0) : undefined,
            },
            {
              id: 'remocoes',
              rotulo: 'Remoções',
              aoClicar: () => {
                setAcao('delete');
                rolarAte('env-lista');
              },
              valor: numero(s?.byAction.delete ?? 0),
              nota: s ? pct(s.byAction.delete ?? 0) : undefined,
            },
            {
              id: 'pessoas',
              rotulo: 'Pessoas contribuindo',
              aoClicar: () => rolarAte('env-quem'),
              valor: numero(s?.contribuintes),
              nota:
                s && s.contribuintesNovos !== null
                  ? `${numero(s.contribuintesNovos)} pela primeira vez`
                  : undefined,
            },
            {
              id: 'media',
              rotulo: 'Por pessoa',
              aoClicar: () => rolarAte('env-quem'),
              valor:
                s?.mediaPorContribuinte != null
                  ? s.mediaPorContribuinte.toLocaleString('pt-BR')
                  : '—',
              nota: 'envios, em média',
            },
          ]}
        />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section
            aria-labelledby="env-ritmo"
            className="sup-1 flex flex-col gap-4 p-5 md:p-6"
          >
            <Inline extremos alinhar="base">
              <Text papel="secao" as="h2" id="env-ritmo">
                Envios por{' '}
                {s?.janela.passo === 'semana'
                  ? 'semana'
                  : s?.janela.passo === 'mes'
                    ? 'mês'
                    : 'dia'}
              </Text>
              {s?.linhaDoTempoCortada && (
                <Text papel="legenda" as="span">
                  só os 50 mil mais antigos
                </Text>
              )}
            </Inline>
            {stats.loading || !s ? (
              <Skeleton forma="bloco" className="h-46 w-full" />
            ) : (
              <Colunas
                titulo="Envios no período"
                linhaMedia
                dados={s.timeline.map((d) => {
                  const dia = new Date(d.date);
                  const eixo =
                    s.janela.passo === 'mes'
                      ? dia.toLocaleDateString('pt-BR', {
                          month: 'short',
                          year: '2-digit',
                        })
                      : dia.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        });
                  return {
                    rotulo: `${s.janela.passo === 'semana' ? 'Semana de ' : ''}${dia.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: s.janela.passo === 'dia' ? undefined : 'numeric' })} · ${d.creates} cadastros, ${d.updates} edições, ${d.deletes} remoções`,
                    eixo,
                    valor: d.total,
                  };
                })}
              />
            )}
          </section>

          <Stack gap={8}>
            <Secao titulo="Por tipo" id="env-tipos" detalhe={nomePeriodo}>
              {s ? (
                Object.keys(s.byEntityType).length ? (
                  <Pizza
                    titulo="Envios por tipo"
                    dados={Object.entries(s.byEntityType).map(([t, n]) => ({
                      rotulo: TIPOS[t] ?? t,
                      valor: n,
                      id: t,
                    }))}
                    rotuloOutras="Outros tipos"
                    aoClicar={(p) => {
                      if (!p.id) return;
                      setTipo(p.id);
                      rolarAte('env-lista');
                    }}
                  />
                ) : (
                  <Text papel="rotulo" tom="suave" as="p">
                    Nenhum envio {nomePeriodo}.
                  </Text>
                )
              ) : (
                <Skeleton forma="bloco" className="h-24 w-full" />
              )}
            </Secao>
            <Secao titulo="Por ação" id="env-acoes" detalhe={nomePeriodo}>
              {s ? (
                <Pizza
                  titulo="Envios por ação"
                  dados={Object.entries(s.byAction).map(([acao, n]) => ({
                    rotulo:
                      acao === 'create'
                        ? 'Cadastros'
                        : acao === 'update'
                          ? 'Edições'
                          : acao === 'delete'
                            ? 'Remoções'
                            : acao,
                    valor: n,
                    id: acao,
                  }))}
                  aoClicar={(p) => {
                    if (!p.id) return;
                    setAcao(p.id);
                    rolarAte('env-lista');
                  }}
                />
              ) : (
                <Skeleton forma="bloco" className="h-24 w-full" />
              )}
            </Secao>
          </Stack>
        </div>

        {s && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Secao
              titulo="Quem mais contribuiu"
              id="env-quem"
              detalhe={nomePeriodo}
            >
              {s.topContribuintes.length === 0 ? (
                <Text papel="rotulo" tom="suave" as="p">
                  Ninguém {nomePeriodo}.
                </Text>
              ) : (
                <ol className="flex flex-col">
                  {s.topContribuintes.map((p) => (
                    <li
                      key={p.userId}
                      className="flex min-h-11 items-center gap-3 border-b border-linha last:border-0"
                    >
                      <Avatar nome={p.name || '?'} imagem={p.image} />
                      <span className="flex min-w-0 flex-1">
                        <Elo
                          onClick={() => navegar.usuario(p.userId)}
                          className="truncate text-sm"
                        >
                          {p.name || 'Conta sem nome'}
                        </Elo>
                      </span>
                      <button
                        type="button"
                        title="Ver só os envios desta pessoa"
                        onClick={() =>
                          setPessoa({
                            id: p.userId,
                            rotulo: p.name || 'Conta sem nome',
                          })
                        }
                        className="t-dado min-h-11 px-2 text-sm text-texto-suave underline decoration-linha-forte underline-offset-4 hover:text-texto hover:decoration-ouro"
                      >
                        {numero(p.contributions)}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </Secao>
            <Secao
              titulo="Mais editados"
              id="env-editados"
              detalhe={nomePeriodo}
            >
              {s.maisEditados.length === 0 ? (
                <Text papel="rotulo" tom="suave" as="p">
                  Nenhuma edição {nomePeriodo}.
                </Text>
              ) : (
                <ol className="flex flex-col">
                  {s.maisEditados.map((m) => (
                    <li
                      key={m.entityId}
                      className="flex items-baseline gap-3 border-b border-linha py-2 last:border-0"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-display text-[1rem] text-texto">
                          {m.nome ?? 'Registro removido'}
                        </span>
                        <span className="t-legenda">
                          {TIPOS[m.entityType] ?? m.entityType}
                        </span>
                      </span>
                      <span className="t-dado text-sm text-texto-suave">
                        {numero(m.edicoes)}{' '}
                        {m.edicoes === 1 ? 'edição' : 'edições'}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Secao>
          </div>
        )}
      </Recolhivel>

      <Secao titulo="Histórico" id="env-lista" detalhe={nomePeriodo}>
        <div className="flex flex-wrap gap-2">
          <Chip selecionado={tipo === ''} onClick={() => setTipo('')}>
            Tudo
          </Chip>
          {FILTROS.map(([v, l]) => (
            <Chip key={v} selecionado={tipo === v} onClick={() => setTipo(v)}>
              {l}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-3xl">
          <FiltroSelecao
            rotulo="O que fizeram"
            valor={acao}
            aoMudar={setAcao}
            todos="Tudo"
            opcoes={[
              { value: 'create', label: 'Cadastros' },
              { value: 'update', label: 'Edições' },
              { value: 'delete', label: 'Remoções' },
            ]}
          />
          <Escolher
            rotulo="Pessoa"
            valor={pessoa}
            aoMudar={setPessoa}
            buscar={buscarPessoas}
            placeholder="Nome ou e-mail"
          />
        </div>
        <Tabela
          rotulo="Envios"
          colunas={colunas}
          linhas={lista.items}
          chave={(e) => e.id}
          carregando={lista.loading}
          aoClicar={setAberto}
          acoes={(e) => {
            const href = linkPublico(e);
            return href ? (
              <AcaoDaLinha rotulo="Ver no site" icone={PiEye} href={href} />
            ) : null;
          }}
          erro={
            lista.error ? (
              <Text papel="rotulo" tom="erro" as="p">
                {lista.error}
              </Text>
            ) : undefined
          }
          vazio={
            <Vazio
              titulo="Nenhum envio aqui"
              descricao="Amplie o período ou tire um filtro."
            />
          }
          rodape={
            lista.total !== null
              ? `${numero(lista.items.length)} de ${numero(lista.total)}`
              : undefined
          }
          maisItens={lista.hasMore}
          carregandoMais={lista.loadingMore}
          aoCarregarMais={lista.loadMore}
        />
      </Secao>

      <Sheet
        aberto={!!aberto}
        aoFechar={() => setAberto(null)}
        titulo={aberto ? nome(aberto) : ''}
        descricao={
          aberto
            ? `${quem(aberto)} ${ACOES[aberto.action] ?? aberto.action} · ${dataHora(aberto.createdAt)}`
            : undefined
        }
        largura="g"
      >
        {aberto && (
          <Stack gap={6}>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
              <Info rotulo="Registro">
                {abrirRegistro(aberto, navegar) ? (
                  <Elo onClick={abrirRegistro(aberto, navegar)!}>
                    {nome(aberto)}
                  </Elo>
                ) : (
                  nome(aberto)
                )}
                <span className="text-texto-fraco">
                  {' '}
                  · {TIPOS[aberto.entityType] ?? aberto.entityType}
                </span>
              </Info>
              <Info rotulo="Situação hoje">
                {!aberto.entityExists
                  ? 'removido do catálogo'
                  : (aberto.entity as { isVerified?: boolean } | null)
                        ?.isVerified
                    ? 'no catálogo, verificado'
                    : 'no catálogo'}
              </Info>
              <Info rotulo="Quem">
                {aberto.user ? (
                  <Elo onClick={() => navegar.usuario(aberto.user!.id)}>
                    {quem(aberto)}
                  </Elo>
                ) : (
                  quem(aberto)
                )}
              </Info>
            </dl>
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                O que foi enviado
              </Text>
              <Mudancas envio={aberto} />
            </Stack>
            <Inline gap={4} quebra>
              {linkPublico(aberto) && (
                <Link
                  href={linkPublico(aberto)!}
                  target="_blank"
                  className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
                >
                  Abrir no site <Icon de={PiArrowSquareOut} tamanho="pp" />
                </Link>
              )}
              {aberto.user && (
                <button
                  type="button"
                  onClick={() => {
                    setPessoa({ id: aberto.user!.id, rotulo: quem(aberto) });
                    setAberto(null);
                  }}
                  className="t-rotulo text-ouro-texto underline-offset-4 hover:underline"
                >
                  Tudo o que esta pessoa enviou
                </button>
              )}
            </Inline>
            {aberto.entityExists && (
              <Stack gap={2}>
                <Text papel="secao" as="h3">
                  No painel
                </Text>
                <HistoricoDoRegistro entityId={aberto.entityId} />
              </Stack>
            )}
          </Stack>
        )}
      </Sheet>
    </Stack>
  );
}

function Info({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd className="text-sm text-texto">{children}</dd>
    </div>
  );
}

/** As mudanças gravadas no envio: objeto de campos, ou `{ campo: { from, to } }`. */
function Mudancas({ envio }: { envio: Envio }) {
  const c = envio.changes;
  if (!c || typeof c !== 'object' || Object.keys(c as object).length === 0) {
    return (
      <Text papel="rotulo" tom="suave" as="p">
        {envio.reason ?? 'Este envio não registrou os campos.'}
      </Text>
    );
  }
  return (
    <Stack gap={3}>
      {envio.reason && (
        <Text papel="rotulo" as="p">
          {envio.reason}
        </Text>
      )}
      <dl className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
        {Object.entries(c as Record<string, unknown>).map(([campo, v]) => {
          const par =
            v && typeof v === 'object' && ('from' in v || 'to' in v)
              ? (v as { from?: unknown; to?: unknown })
              : null;
          return (
            <div
              key={campo}
              className="grid gap-1 px-4 py-2.5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="t-legenda pt-0.5">{nomeDoCampo(campo)}</dt>
              <dd className="break-words text-sm text-texto">
                {par ? (
                  <>
                    <span className="text-texto-fraco line-through">
                      {valorLegivel(par.from)}
                    </span>{' '}
                    → {valorLegivel(par.to)}
                  </>
                ) : (
                  valorLegivel(v)
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Stack>
  );
}
