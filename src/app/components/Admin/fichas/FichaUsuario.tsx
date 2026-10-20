'use client';

import { useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiPencilSimple } from 'react-icons/pi';
import ConviteEPlanoModal from '@/app/components/Admin/Modals/ConviteEPlanoModal';
import UserEditModal from '@/app/components/Admin/Modals/UserEditModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';

import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import {
  PERIODOS_COBRANCA,
  PLANOS,
  data,
  dataHora,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import { useInvalidateAdmin } from '@/app/hooks/admin/query';
import type { AdminUser } from '@/app/requests/admin/users';
import { useItensDoUsuario, useUsuario } from '@/app/hooks/admin/usePainel';
import type { TipoDeItem } from '@/app/requests/admin/painel';

export const PERFIS: Record<string, string> = {
  MUSIC_STUDENT: 'Estudante de música',
  CASUAL_USER: 'Ouvinte',
  PROFESSIONAL: 'Profissional',
  TEACHER: 'Professor',
};

export const NIVEIS: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

export function Papel({ u }: { u: Pick<AdminUser, 'role' | 'isTeacher'> }) {
  return (
    <Inline gap={1} quebra>
      {u.role === 2 && <Badge estado="ouro">Administrador</Badge>}
      {u.isTeacher && <Badge>Professor</Badge>}
      {!u.role && !u.isTeacher && <span className="t-legenda">Pessoa</span>}
    </Inline>
  );
}

/**
 * A ficha de uma conta: os números (que abrem as listas), o cadastro, o
 * plano, as aulas e o que o painel já fez com ela. Abre de qualquer tela
 * pelo navegador do painel (`useNavegar().usuario(id)`).
 */
export function FichaUsuario({
  usuarioId,
  aoFechar,
}: {
  usuarioId: string;
  aoFechar: () => void;
}) {
  const { data: d, loading } = useUsuario(usuarioId);
  const [lista, setLista] = useState<TipoDeItem | null>(null);
  const [editando, setEditando] = useState(false);
  const [ajustando, setAjustando] = useState<'convite' | 'plano' | null>(null);
  const invalidar = useInvalidateAdmin();
  const nome = d
    ? [d.firstName, d.lastName].filter(Boolean).join(' ') ||
      d.username ||
      d.email
    : '';

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={nome || 'Conta'}
      descricao={
        d ? `${d.email}${d.username ? ` · @${d.username}` : ''}` : undefined
      }
      largura="g"
      rodape={
        d ? (
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPencilSimple}
            onClick={() => setEditando(true)}
          >
            Editar papel e professor
          </Button>
        ) : undefined
      }
    >
      {loading || !d ? (
        <Row.Skeleton repetir={4} />
      ) : (
        <Stack gap={6}>
          <Numeros
            colunas={3}
            itens={(
              [
                ['favoritos', 'Favoritos', d.counts.favorites],
                ['aprendidas', 'Aprendidas', d.counts.learned],
                ['quero-aprender', 'Quero aprender', d.counts.wantToLearn],
                ['anotacoes', 'Anotações', d.counts.annotations],
                ['envios', 'Envios ao catálogo', d.counts.contributions],
                ['arquivos', 'Arquivos', d.counts.uploads],
              ] as [TipoDeItem, string, number][]
            ).map(([tipo, rotulo, n]) => ({
              id: tipo,
              rotulo,
              valor: numero(n),
              aoClicar: n > 0 ? () => setLista(tipo) : undefined,
            }))}
          />

          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <Info rotulo="Perfil">
              {d.userType ? PERFIS[d.userType] : 'não informou'}
            </Info>
            <Info rotulo="Nível">
              {d.experienceLevel ? NIVEIS[d.experienceLevel] : '—'}
            </Info>
            <Info rotulo="Papel">
              <Papel u={{ role: d.role, isTeacher: d.isTeacher }} />
            </Info>
            <Info rotulo="Conta desde">{data(d.createdAt)}</Info>
            <Info rotulo="Último acesso">
              {d.lastSeen ? relativo(d.lastSeen) : 'nunca entrou'}
            </Info>
            <Info rotulo="Cadastro inicial">
              {d.onboardingCompleted ? 'concluído' : 'não concluído'}
            </Info>
            <Info rotulo="Perfil público">
              {d.profilePublic ? 'sim' : 'não'}
            </Info>
            <Info rotulo="E-mail">
              {d.emailVerified
                ? `confirmado em ${data(d.emailVerified)}`
                : 'não confirmado'}
            </Info>
          </dl>

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              Plano
            </Text>
            {d.assinatura ? (
              <p className="text-[0.9375rem] text-texto">
                {PLANOS[d.assinatura.planType]}
                {d.assinatura.billingPeriod
                  ? ` · ${PERIODOS_COBRANCA[d.assinatura.billingPeriod]}`
                  : ''}
                <span className="text-texto-suave">
                  {d.assinatura.status === 'TRIAL'
                    ? ` · em teste até ${data(d.assinatura.trialEndDate)}`
                    : d.assinatura.status === 'CANCELLED'
                      ? ` · cancelada, com acesso até ${data(d.assinatura.endDate)}`
                      : d.assinatura.status === 'PAST_DUE'
                        ? ' · pagamento em atraso'
                        : d.assinatura.endDate
                          ? ` · renova em ${data(d.assinatura.endDate)}`
                          : ''}
                  {d.assinatura.concedida ? ' · concedido pela equipe' : ''}
                </span>{' '}
                {d.assinatura.concedida && (
                  <button
                    type="button"
                    onClick={() => setAjustando('plano')}
                    className="t-rotulo mr-3 text-ouro-texto underline-offset-4 hover:underline"
                  >
                    Editar plano concedido
                  </button>
                )}
                <Link
                  href="/admin/plans/subscribers"
                  className="t-rotulo text-ouro-texto hover:underline underline-offset-4"
                >
                  Ver assinaturas
                </Link>
              </p>
            ) : (
              <p className="t-rotulo text-texto-suave">
                Free — sem assinatura paga.
                {d.isTeacher && d.teacherProfile?.status === 'ACTIVE' && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => setAjustando('plano')}
                      className="text-ouro-texto underline-offset-4 hover:underline"
                    >
                      Conceder plano de professor
                    </button>
                  </>
                )}
              </p>
            )}
          </Stack>

          {(d.teacherProfile || d.studentProfile) && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                Aulas
              </Text>
              {d.teacherProfile && (
                <Text papel="rotulo" as="p">
                  Professor{' '}
                  {d.teacherProfile.status === 'PENDING'
                    ? '(convite aguardando aceite)'
                    : d.teacherProfile.status === 'ACTIVE'
                      ? 'ativo'
                      : 'inativo'}
                  {' · '}
                  {numero(d.teacherProfile.totalStudents)} alunos ·{' '}
                  {numero(d.teacherProfile.totalLessons)} aulas
                </Text>
              )}
              {d.conviteProfessor && (
                <p className="t-rotulo text-texto-suave">
                  Convite com o plano{' '}
                  {d.conviteProfessor.planType
                    ? PLANOS[d.conviteProfessor.planType]
                    : '(sem plano)'}
                  {d.conviteProfessor.planExpiresAt
                    ? ` até ${data(d.conviteProfessor.planExpiresAt)}`
                    : ', sem vencimento'}
                  {' · '}
                  {d.conviteProfessor.expired
                    ? `venceu em ${data(d.conviteProfessor.inviteExpiresAt)}`
                    : `vale até ${data(d.conviteProfessor.inviteExpiresAt)}`}{' '}
                  <button
                    type="button"
                    onClick={() => setAjustando('convite')}
                    className="text-ouro-texto underline-offset-4 hover:underline"
                  >
                    Editar convite
                  </button>
                </p>
              )}
              {d.studentProfile && (
                <Text papel="rotulo" as="p">
                  Aluno · {numero(d.studentProfile.totalLessonsAttended)} aulas
                  assistidas · sequência de{' '}
                  {numero(d.studentProfile.currentStreak)} dias
                </Text>
              )}
            </Stack>
          )}

          <Stack gap={2}>
            <Inline extremos>
              <Text papel="secao" as="h3">
                No painel
              </Text>
            </Inline>
            <HistoricoDoRegistro entityId={d.id} />
          </Stack>
        </Stack>
      )}
      <ItensDaConta
        usuarioId={usuarioId}
        nome={nome}
        tipo={lista}
        aoFechar={() => setLista(null)}
      />
      {ajustando === 'convite' && d?.conviteProfessor && (
        <ConviteEPlanoModal
          modo="convite"
          usuarioId={d.id}
          convite={d.conviteProfessor}
          aoFechar={() => setAjustando(null)}
          aoSalvar={() => {
            setAjustando(null);
            toast.success('Convite atualizado.');
            void invalidar('usuarios');
            void invalidar('auditoria');
          }}
        />
      )}
      {ajustando === 'plano' && d && (
        <ConviteEPlanoModal
          modo="plano"
          usuarioId={d.id}
          plano={
            d.assinatura?.concedida
              ? {
                  planType: d.assinatura.planType,
                  endDate: d.assinatura.endDate,
                }
              : null
          }
          aoFechar={() => setAjustando(null)}
          aoSalvar={() => {
            setAjustando(null);
            toast.success('Plano atualizado.');
            void invalidar('usuarios');
            void invalidar('auditoria');
          }}
        />
      )}
      {editando && d && (
        <UserEditModal
          user={
            {
              id: d.id,
              name: nome,
              email: d.email,
              username: d.username ?? undefined,
              role: d.role,
              isTeacher: d.isTeacher,
              teacherProfile: d.teacherProfile
                ? {
                    id: '',
                    status: d.teacherProfile.status as 'ACTIVE',
                    isVerified: d.teacherProfile.isVerified,
                  }
                : undefined,
            } as AdminUser
          }
          isOpen
          onClose={() => setEditando(false)}
          onSave={() => {
            setEditando(false);
            toast.success('Conta atualizada.');
            void invalidar('usuarios');
            void invalidar('auditoria');
          }}
        />
      )}
    </Sheet>
  );
}

const TITULO_DA_LISTA: Record<TipoDeItem, string> = {
  favoritos: 'Favoritos',
  aprendidas: 'Aprendidas',
  'quero-aprender': 'Quero aprender',
  anotacoes: 'Anotações',
  envios: 'Envios ao catálogo',
  arquivos: 'Arquivos',
};

/** O que está por trás de um número do detalhe, numa folha por cima. */
function ItensDaConta({
  usuarioId,
  nome,
  tipo,
  aoFechar,
}: {
  usuarioId: string | null;
  nome: string;
  tipo: TipoDeItem | null;
  aoFechar: () => void;
}) {
  const itens = useItensDoUsuario(usuarioId, tipo);
  const navegar = useNavegar();

  return (
    <Sheet
      aberto={!!tipo}
      aoFechar={aoFechar}
      largura="g"
      titulo={tipo ? TITULO_DA_LISTA[tipo] : ''}
      descricao={
        itens.total !== null ? `${nome} · ${numero(itens.total)}` : nome
      }
    >
      {itens.loading ? (
        <Row.Skeleton repetir={5} />
      ) : itens.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {itens.error}
        </Text>
      ) : itens.items.length === 0 ? (
        <Text papel="rotulo" tom="suave" as="p">
          Nada aqui.
        </Text>
      ) : (
        <Stack gap={3}>
          <ul className="flex flex-col">
            {itens.items.map((i) => {
              // Cada item abre o registro dentro do painel; o site fica no
              // ícone ao lado.
              const alvo: {
                tipo: 'obra' | 'compositor' | 'partitura';
                id: string;
              } | null = i.workId
                ? { tipo: 'obra', id: i.workId }
                : i.entityType === 'composer' && i.entityId
                  ? { tipo: 'compositor', id: i.entityId }
                  : i.entityType === 'work' && i.entityId
                    ? { tipo: 'obra', id: i.entityId }
                    : (i.entityType === 'score' ||
                          i.entityType === 'workScore') &&
                        i.entityId
                      ? { tipo: 'partitura', id: i.entityId }
                      : null;
              return (
                <li key={i.id} className="border-b border-linha last:border-0">
                  <button
                    type="button"
                    disabled={!alvo}
                    onClick={() => alvo && navegar[alvo.tipo](alvo.id)}
                    className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-baseline gap-3 rounded-controle px-2 py-2.5 text-left transition-colors enabled:hover:bg-[var(--interactive-hover)] disabled:cursor-default"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[0.9375rem] text-texto">
                        {i.titulo}
                      </span>
                      {i.detalhe && (
                        <span className="t-legenda">{i.detalhe}</span>
                      )}
                    </span>
                    {i.em && (
                      <span className="t-legenda t-dado shrink-0">
                        {dataHora(i.em)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {itens.hasMore && (
            <Button
              tamanho="p"
              variante="texto"
              onClick={itens.loadMore}
              carregando={itens.loadingMore}
            >
              Carregar mais
            </Button>
          )}
        </Stack>
      )}
    </Sheet>
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
