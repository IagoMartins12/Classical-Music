'use client';

import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiArrowSquareOut, PiClock, PiWarning } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  BarraDeSelecao,
  Segmentos,
} from '@/app/components/Admin/painel/Controles';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import {
  dataHora,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import {
  useDenuncias,
  useEstatisticasDenuncias,
  useResolverDenuncia,
  useResolverDenuncias,
} from '@/app/hooks/admin/usePainel';
import type { Denuncia, EstadoDenuncia } from '@/app/requests/admin/painel';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import {
  fetchContributions,
  revertContribution,
} from '@/app/requests/contributions';

/**
 * Denúncias: a fila de moderação e os números dela, numa tela só.
 *
 * **Eram três.** `/admin/moderation` mostrava gráficos das denúncias,
 * `/admin/moderation/moderate` a fila (a mesma tela de `/moderation` do site,
 * com cabeçalho de site), e `/admin/report` repetia a primeira. Os dois
 * endereços antigos redirecionam para cá.
 *
 * **Na ordem do prazo** (RN-4): a que vence primeiro vem primeiro; a que já
 * venceu diz há quanto tempo. A API ordenava errado até 29/09/2026 — as
 * urgentes vinham por último.
 *
 * **Três decisões, com nome de decisão.** A API tinha `approve` e `reject`
 * com o mesmo efeito (o conteúdo fica), mudando só o rótulo. Aqui:
 * "Improcedente" (a denúncia estava errada), "Procede, já corrigi" (dado
 * errado que o moderador consertou; o conteúdo fica) e "Remover", que exige
 * justificativa escrita. Em lote, só as duas primeiras — remover pede motivo
 * caso a caso.
 */

const ESTADOS: { valor: EstadoDenuncia; rotulo: string }[] = [
  { valor: 'pending', rotulo: 'Abertas' },
  { valor: 'rejected', rotulo: 'Improcedentes' },
  { valor: 'approved', rotulo: 'Procedentes' },
  { valor: 'all', rotulo: 'Todas' },
];

const TIPOS: Record<string, string> = {
  work: 'Obra',
  composer: 'Compositor',
  score: 'Partitura',
  'blog-comment': 'Comentário do blog',
  annotation: 'Anotação de obra',
  curiosity: 'Curiosidade de compositor',
  contribution: 'Contribuição da comunidade',
};

const CAMPO: Record<string, string> = {
  ...CONTRIBUTE.pt.fields,
  bio: 'Biografia',
  bioEn: 'Biografia em inglês',
  videoUrl: 'Vídeo',
};

/** How the detail names the text that was reported. */
const ESCRITO: Record<string, string> = {
  'blog-comment': 'O comentário',
  annotation: 'A anotação',
  curiosity: 'A curiosidade',
  contribution: 'O que a pessoa escreveu no campo',
};

const escrito = (d: Denuncia) =>
  d.entityType === 'curiosity'
    ? d.entity?.text
    : d.entityType === 'contribution' && typeof d.entity?.after === 'string'
      ? d.entity.after
      : d.entity?.content;

const PRIORIDADE: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  normal: 'Normal',
  low: 'Baixa',
};

function nomeDoItem(d: Denuncia) {
  const e = d.entity;
  if (!e) return 'Item já removido';
  if (d.entityType === 'annotation' && e.title) return e.title;
  if (d.entityType === 'contribution')
    return `${CAMPO[e.field ?? ''] ?? 'Campo'}: contribuição da comunidade`;
  if (
    d.entityType === 'blog-comment' ||
    d.entityType === 'annotation' ||
    d.entityType === 'curiosity'
  ) {
    const text = escrito(d) ?? '';
    return `“${text.slice(0, 90)}${text.length > 90 ? '…' : ''}”`;
  }
  return e.title ?? e.fullName ?? e.name ?? '—';
}

function contextoDoItem(d: Denuncia) {
  const e = d.entity;
  if (!e) return TIPOS[d.entityType];
  if (d.entityType === 'work' && e.composer)
    return `Obra de ${e.composer.fullName ?? e.composer.name}`;
  if (d.entityType === 'score' && e.work) return `Partitura de ${e.work.title}`;
  return TIPOS[d.entityType];
}

function linkDoItem(d: Denuncia) {
  if (!d.entity) return null;
  if (d.entityType === 'work') return `/works/${d.entityId}`;
  if (d.entityType === 'composer') return `/composer/${d.entityId}`;
  if (d.entityType === 'score' && d.entity.work)
    return `/works/${d.entity.work.id}`;
  if (d.entityType === 'annotation' && d.entity.workId)
    return `/works/${d.entity.workId}`;
  if (d.entityType === 'curiosity' && d.entity.composerId)
    return `/composer/${d.entity.composerId}`;
  if (d.entityType === 'contribution' && d.entity.entityId)
    return d.entity.entityType === 'work'
      ? `/works/${d.entity.entityId}`
      : `/composer/${d.entity.entityId}`;
  return null;
}

const pessoa = (
  p: {
    firstName: string | null;
    lastName: string | null;
    email?: string | null;
  } | null
) =>
  p
    ? [p.firstName, p.lastName].filter(Boolean).join(' ') ||
      p.email ||
      'Conta sem nome'
    : 'Conta removida';

function Prazo({ d }: { d: Denuncia }) {
  if (d.status !== 'pending') {
    return (
      <span className="t-legenda">resolvida {relativo(d.resolvedAt)}</span>
    );
  }
  const h = d.slaHoursLeft;
  const texto =
    h < 0
      ? `venceu há ${Math.abs(h) >= 48 ? `${Math.round(-h / 24)} dias` : `${-h} h`}`
      : `vence em ${h >= 48 ? `${Math.round(h / 24)} dias` : `${h} h`}`;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 text-sm',
        d.overdue ? 'text-atencao' : 'text-texto-suave'
      )}
    >
      <Icon de={d.overdue ? PiWarning : PiClock} tamanho="pp" />
      <span className="t-dado">{texto}</span>
    </span>
  );
}

export default function Denuncias() {
  const navegar = useNavegar();
  const [status, setStatus] = useState<EstadoDenuncia>('pending');
  const [tipo, setTipo] = useState('');
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [aberta, setAberta] = useState<Denuncia | null>(null);
  const [removendo, setRemovendo] = useState<Denuncia | null>(null);
  const [motivo, setMotivo] = useState('');
  // Os números no topo trocam o estado da lista.
  const verEstado = (v: EstadoDenuncia) => {
    setStatus(v);
    setMarcadas([]);
  };

  const lista = useDenuncias({ status, entityType: tipo || undefined });
  const stats = useEstatisticasDenuncias(30);
  const resolver = useResolverDenuncia();
  const resolverLote = useResolverDenuncias();

  const s = stats.data;

  const decidir = async (d: Denuncia, action: 'approve' | 'reject') => {
    try {
      await resolver.mutateAsync([d.id, action]);
      toast.success(
        action === 'reject'
          ? 'Denúncia marcada como improcedente.'
          : 'Denúncia encerrada; o conteúdo fica.'
      );
      setAberta(null);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível resolver.'
      );
    }
  };

  const remover = async () => {
    if (!removendo) return;
    try {
      await resolver.mutateAsync([removendo.id, 'delete', motivo]);
      toast.success('Conteúdo removido e denúncia encerrada.');
      setRemovendo(null);
      setAberta(null);
      setMotivo('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível remover.');
    }
  };

  const emLote = async (action: 'approve' | 'reject') => {
    try {
      const r = await resolverLote.mutateAsync([marcadas, action]);
      toast.success(
        `${r.resolved} resolvida${r.resolved === 1 ? '' : 's'}${r.failed ? `, ${r.failed} falharam` : ''}.`
      );
      setMarcadas([]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível resolver em lote.'
      );
    }
  };

  const alternar = (id: string) =>
    setMarcadas((m) =>
      m.includes(id) ? m.filter((x) => x !== id) : [...m, id]
    );

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Denúncias"
        descricao="Na ordem do prazo de cada prioridade. Denúncia é sinal, não sentença: o conteúdo fica no ar até alguém decidir."
        atualizadoEm={stats.updatedAt}
        aoAtualizar={() => Promise.all([lista.refetch(), stats.refetch()])}
        atualizando={lista.fetching && !lista.loading}
      />

      <Numeros
        carregando={stats.loading}
        itens={[
          {
            id: 'abertas',
            rotulo: 'Abertas',
            aoClicar: () => verEstado('pending'),
            valor: numero(s?.pending.total),
            nota: s
              ? `${numero((s.pending.byPriority.urgent ?? 0) + (s.pending.byPriority.high ?? 0))} de prioridade alta`
              : undefined,
          },
          {
            id: 'vencidas',
            rotulo: 'Passaram do prazo',
            aoClicar: () => verEstado('pending'),
            valor: numero(s?.pending.overdue),
            tom: s?.pending.overdue ? 'atencao' : undefined,
          },
          {
            id: 'chegaram',
            rotulo: 'Chegaram em 30 dias',
            aoClicar: () => verEstado('all'),
            valor: numero(s?.period.reported),
          },
          {
            id: 'resolvidas',
            rotulo: 'Resolvidas em 30 dias',
            aoClicar: () => verEstado('approved'),
            valor: numero(s?.period.resolved),
            nota:
              s?.period.avgResolutionHours === null || !s
                ? 'sem base para tempo médio'
                : `em ${s.period.avgResolutionHours >= 48 ? `${Math.round(s.period.avgResolutionHours / 24)} dias` : `${s.period.avgResolutionHours} h`} em média`,
          },
        ]}
      />

      <Inline extremos quebra gap={3}>
        <Segmentos
          rotulo="Estado"
          opcoes={ESTADOS.map((e) => ({
            ...e,
            contagem: e.valor === 'pending' ? s?.pending.total : undefined,
          }))}
          valor={status}
          aoMudar={(v) => {
            setStatus(v);
            setMarcadas([]);
          }}
        />
        <div className="w-52">
          <label htmlFor="den-tipo" className="sr-only">
            Tipo de conteúdo
          </label>
          <Selecao
            id="den-tipo"
            valor={tipo}
            aoMudar={setTipo}
            opcoes={[
              { value: '', label: 'Todos os tipos' },
              ...Object.entries(TIPOS).map(([value, label]) => ({
                value,
                label:
                  s?.pending.byEntityType[value] && status === 'pending'
                    ? `${label} (${s.pending.byEntityType[value]})`
                    : label,
              })),
            ]}
          />
        </div>
      </Inline>

      <BarraDeSelecao
        quantidade={marcadas.length}
        singular="denúncia selecionada"
        plural="denúncias selecionadas"
        aoLimpar={() => setMarcadas([])}
      >
        <Button
          tamanho="p"
          onClick={() => emLote('approve')}
          carregando={resolverLote.isPending}
        >
          Procedem, já corrigi
        </Button>
        <Button
          tamanho="p"
          variante="primario"
          onClick={() => emLote('reject')}
          carregando={resolverLote.isPending}
        >
          Improcedentes
        </Button>
      </BarraDeSelecao>

      {lista.loading ? (
        <Row.Lista>
          <Row.Skeleton repetir={6} />
        </Row.Lista>
      ) : lista.error ? (
        <Vazio
          titulo="Não foi possível ler a fila"
          descricao={lista.error}
          acao={
            <Button tamanho="p" onClick={() => void lista.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : lista.items.length === 0 ? (
        <Vazio
          titulo={
            status === 'pending' ? 'Nenhuma denúncia esperando' : 'Nada aqui'
          }
          descricao={
            status === 'pending'
              ? 'Quando alguém denunciar uma obra, um compositor, uma partitura ou um comentário, a denúncia aparece aqui com o prazo.'
              : 'Troque o estado ou o tipo para ver outras.'
          }
        />
      ) : (
        <ul className="sup-1 flex flex-col !p-0">
          {lista.items.map((d) => {
            const marcada = marcadas.includes(d.id);
            return (
              <li
                key={d.id}
                className={cx(
                  'flex gap-3 border-t border-linha px-4 py-4 first:border-0 md:px-5',
                  marcada && 'bg-[var(--interactive-hover)]'
                )}
              >
                {d.status === 'pending' && (
                  <input
                    type="checkbox"
                    checked={marcada}
                    onChange={() => alternar(d.id)}
                    aria-label={`Selecionar a denúncia sobre ${nomeDoItem(d)}`}
                    className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--ouro)]"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setAberta(d)}
                  className="flex min-w-0 flex-1 flex-col gap-1.5 text-left"
                >
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex min-w-0 items-center gap-1.5 font-display text-[1.125rem] leading-snug text-texto">
                      <span className="truncate">{nomeDoItem(d)}</span>
                      {d.entity?.isVerified && (
                        <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
                      )}
                    </span>
                    <span className="t-legenda">{contextoDoItem(d)}</span>
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    <span className="text-texto">
                      {d.categoryLabel ?? d.reason}
                    </span>
                    {d.description
                      ? ` — ${d.description.slice(0, 140)}${d.description.length > 140 ? '…' : ''}`
                      : ''}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Prazo d={d} />
                    {d.priority !== 'normal' && (
                      <Badge
                        estado={
                          d.priority === 'urgent'
                            ? 'erro'
                            : d.priority === 'high'
                              ? 'atencao'
                              : 'neutro'
                        }
                      >
                        {PRIORIDADE[d.priority]}
                      </Badge>
                    )}
                    <span className="t-legenda">
                      por {pessoa(d.reporter)} · {relativo(d.createdAt)}
                    </span>
                  </span>
                </button>
                {d.status === 'pending' && (
                  <div className="hidden shrink-0 items-start gap-2 lg:flex">
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      onClick={() => decidir(d, 'reject')}
                      disabled={resolver.isPending}
                    >
                      Improcedente
                    </Button>
                    <Button
                      tamanho="p"
                      variante="perigo"
                      onClick={() => setRemovendo(d)}
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {lista.hasMore && (
        <Button
          variante="secundario"
          tamanho="p"
          carregando={lista.loadingMore}
          onClick={lista.loadMore}
          className="self-center"
        >
          Carregar mais
        </Button>
      )}

      <Sheet
        aberto={!!aberta}
        aoFechar={() => setAberta(null)}
        titulo={aberta ? nomeDoItem(aberta) : ''}
        descricao={aberta ? contextoDoItem(aberta) : undefined}
        largura="g"
        rodape={
          aberta?.status === 'pending' ? (
            <>
              <Button
                tamanho="p"
                variante="perigo"
                onClick={() => setRemovendo(aberta)}
              >
                Remover conteúdo
              </Button>
              <Button
                tamanho="p"
                onClick={() => decidir(aberta, 'approve')}
                carregando={resolver.isPending}
              >
                Procede, já corrigi
              </Button>
              <Button
                tamanho="p"
                variante="primario"
                onClick={() => decidir(aberta, 'reject')}
                carregando={resolver.isPending}
              >
                Improcedente, manter
              </Button>
            </>
          ) : undefined
        }
      >
        {aberta && (
          <Stack gap={6}>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Info rotulo="Motivo">
                {aberta.categoryLabel ?? aberta.reason}
              </Info>
              <Info rotulo="Prioridade">{PRIORIDADE[aberta.priority]}</Info>
              <Info rotulo="Denunciada por">
                {aberta.reporter ? (
                  <Elo onClick={() => navegar.usuario(aberta.reporter!.id)}>
                    {pessoa(aberta.reporter)}
                  </Elo>
                ) : (
                  pessoa(aberta.reporter)
                )}
              </Info>
              <Info rotulo="O que foi denunciado">
                {aberta.entityType === 'work' ? (
                  <Elo onClick={() => navegar.obra(aberta.entityId)}>
                    abrir a obra
                  </Elo>
                ) : aberta.entityType === 'composer' ? (
                  <Elo onClick={() => navegar.compositor(aberta.entityId)}>
                    abrir o compositor
                  </Elo>
                ) : aberta.entityType === 'score' ? (
                  <Elo onClick={() => navegar.partitura(aberta.entityId)}>
                    abrir a partitura
                  </Elo>
                ) : (
                  (TIPOS[aberta.entityType] ?? aberta.entityType)
                )}
              </Info>
              <Info rotulo="Quando">{dataHora(aberta.createdAt)}</Info>
              <Info rotulo="Prazo">
                <Prazo d={aberta} />
              </Info>
              {aberta.status !== 'pending' && (
                <Info rotulo="Decidida por">{pessoa(aberta.moderator)}</Info>
              )}
            </dl>
            {aberta.description && (
              <Stack gap={1}>
                <Text papel="legenda" as="p">
                  O que a pessoa escreveu
                </Text>
                <blockquote className="rounded-controle bg-sup-2 px-4 py-3 text-[0.9375rem] text-texto">
                  {aberta.description}
                </blockquote>
              </Stack>
            )}
            {escrito(aberta) && aberta.entityType !== 'score' && (
              <Stack gap={1}>
                <Text papel="legenda" as="p">
                  {ESCRITO[aberta.entityType] ?? 'O conteúdo'}
                </Text>
                <blockquote className="max-h-80 overflow-y-auto whitespace-pre-line rounded-controle bg-sup-2 px-4 py-3 text-[0.9375rem] text-texto">
                  {escrito(aberta)}
                </blockquote>
              </Stack>
            )}
            {(aberta.entityType === 'composer' ||
              aberta.entityType === 'work') && (
              <ContribuicoesRecentes
                tipo={aberta.entityType}
                id={aberta.entityId}
              />
            )}
            {aberta.moderationNotes && (
              <Stack gap={1}>
                <Text papel="legenda" as="p">
                  Justificativa da decisão
                </Text>
                <p className="text-[0.9375rem] text-texto">
                  {aberta.moderationNotes}
                </p>
              </Stack>
            )}
            {linkDoItem(aberta) && (
              <Link
                href={linkDoItem(aberta)!}
                target="_blank"
                className="t-rotulo inline-flex items-center gap-1.5 self-start text-ouro-texto hover:underline underline-offset-4"
              >
                Abrir no site <Icon de={PiArrowSquareOut} tamanho="pp" />
              </Link>
            )}
            {aberta.status === 'pending' && (
              <Text papel="legenda" as="p">
                “Procede, já corrigi” encerra a denúncia com o conteúdo no ar —
                para dado errado que você acabou de consertar. Remover apaga o
                item e exige justificativa, que fica na auditoria.
              </Text>
            )}
          </Stack>
        )}
      </Sheet>

      <ConfirmModal
        isOpen={!!removendo}
        onClose={() => {
          setRemovendo(null);
          setMotivo('');
        }}
        onConfirm={remover}
        type="danger"
        acaoPerigosa
        title="Remover o conteúdo denunciado?"
        message={
          removendo
            ? `${nomeDoItem(removendo)} sai do site. A justificativa fica registrada na auditoria.`
            : ''
        }
        confirmText="Remover"
        cancelText="Voltar"
        isLoading={resolver.isPending}
        confirmarBloqueado={motivo.trim().length < 3}
      >
        <Field.Area
          label="Justificativa"
          ajuda="Obrigatória: é o que sustenta a decisão se o autor perguntar."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
        />
      </ConfirmModal>
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

/**
 * The live contributions to a reported composer or work: "dado errado"
 * usually means one of them. Undoing brings the old value back and takes
 * the XP; it never overwrites a later edit.
 */
function ContribuicoesRecentes({
  tipo,
  id,
}: {
  tipo: 'composer' | 'work';
  id: string;
}) {
  const lista = useQuery({
    queryKey: ['admin', 'contribuicoes', tipo, id],
    queryFn: () => fetchContributions(tipo, id),
  });
  const [desfazendo, setDesfazendo] = useState<string | null>(null);

  const desfazer = async (contribuicao: string) => {
    setDesfazendo(contribuicao);
    const result = await revertContribution(contribuicao).catch(() => null);
    setDesfazendo(null);
    if (!result?.ok) return toast.error('Não foi possível desfazer.');
    toast.success('Contribuição desfeita.');
    void lista.refetch();
  };

  if (!lista.data?.length) return null;
  return (
    <Stack gap={2}>
      <Text papel="legenda" as="p">
        Contribuições da comunidade em vigor
      </Text>
      <ul className="flex flex-col">
        {lista.data.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-3 border-b border-linha py-2 last:border-0"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[0.9375rem] text-texto">
                {c.field ? (CAMPO[c.field] ?? c.field) : 'Curiosidade'}
              </span>
              <span className="t-legenda">
                {c.author.name} · {relativo(c.createdAt)}
              </span>
            </span>
            {c.kind !== 'CURIOSITY' && (
              <Button
                tamanho="p"
                variante="fantasma"
                carregando={desfazendo === c.id}
                onClick={() => void desfazer(c.id)}
              >
                Desfazer
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Stack>
  );
}
