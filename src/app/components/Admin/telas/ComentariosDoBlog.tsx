'use client';

import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiChatsCircle } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Avatar } from '@/app/components/Admin/painel/Avatar';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { numero, relativo } from '@/app/components/Admin/painel/formatos';
import {
  useComentarios,
  useContagemComentarios,
  useConversa,
  useModerarComentario,
} from '@/app/hooks/admin/useBlogAdmin';
import type {
  AcaoComentario,
  ComentarioAdmin,
  EstadoComentario,
  NoDaConversa,
} from '@/app/requests/admin/blog';

/**
 * Comentários do blog: aprovar, recusar, marcar spam.
 *
 * Recusar exige justificativa (RN-4) — a tela antiga pedia com
 * `window.prompt`, a caixa cinza do navegador, fora do sistema e sem jeito de
 * cancelar direito. Agora é a confirmação do painel, com o campo e o botão
 * travado até haver motivo. Spam não pede: a marcação já é o motivo.
 *
 * Cada comentário mostra quantas denúncias estão abertas contra ele — o
 * detalhe mora na fila de Denúncias, e o link leva para lá.
 */

type Filtro =
  | 'PENDING'
  | 'FLAGGED'
  | 'respostas'
  | 'APPROVED'
  | 'REJECTED'
  | 'SPAM'
  | 'todos';

const ESTADOS: Record<EstadoComentario, string> = {
  PENDING: 'Esperando',
  APPROVED: 'Aprovado',
  REJECTED: 'Recusado',
  FLAGGED: 'Sinalizado',
  SPAM: 'Spam',
};

const autor = (u: ComentarioAdmin['user'] | NoDaConversa['user']) =>
  u
    ? [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Leitor sem nome'
    : 'Conta removida';

export default function ComentariosDoBlog() {
  const navegar = useNavegar();
  const [filtro, setFiltro] = useState<Filtro>('PENDING');
  const [conversa, setConversa] = useState<ComentarioAdmin | null>(null);
  const [recusando, setRecusando] = useState<ComentarioAdmin | null>(null);
  const [motivo, setMotivo] = useState('');

  const lista = useComentarios(
    filtro === 'todos'
      ? {}
      : filtro === 'respostas'
        ? { onlyReplies: true }
        : { status: filtro }
  );
  const contagem = useContagemComentarios();
  const moderar = useModerarComentario();
  const c = contagem.data;

  const agir = async (
    com: ComentarioAdmin,
    acao: AcaoComentario,
    notas?: string
  ) => {
    try {
      await moderar.mutateAsync([com.id, acao, notas]);
      toast.success(
        acao === 'approve'
          ? 'Comentário aprovado.'
          : acao === 'spam'
            ? 'Marcado como spam.'
            : 'Comentário recusado.'
      );
      void contagem.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível moderar.');
    }
  };

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Comentários do blog"
        descricao="O que os leitores escreveram, esperando decisão ou sinalizado"
      />

      <Numeros
        carregando={contagem.loading}
        itens={[
          {
            id: 'esperando',
            rotulo: 'Esperando',
            aoClicar: () => setFiltro('PENDING'),
            valor: numero(c?.PENDING),
            tom: c?.PENDING ? 'atencao' : undefined,
          },
          {
            id: 'sinalizados',
            rotulo: 'Sinalizados',
            aoClicar: () => setFiltro('FLAGGED'),
            valor: numero(c?.FLAGGED),
            tom: c?.FLAGGED ? 'atencao' : undefined,
          },
          {
            id: 'aprovados',
            rotulo: 'Aprovados',
            valor: numero(c?.APPROVED),
            aoClicar: () => setFiltro('APPROVED'),
          },
          {
            id: 'fora',
            rotulo: 'Recusados e spam',
            aoClicar: () => setFiltro('REJECTED'),
            valor: numero((c?.REJECTED ?? 0) + (c?.SPAM ?? 0)),
          },
        ]}
      />

      <Segmentos<Filtro>
        rotulo="Filtrar comentários"
        valor={filtro}
        aoMudar={setFiltro}
        opcoes={[
          {
            valor: 'PENDING',
            rotulo: 'Esperando',
            contagem: c?.PENDING || null,
          },
          {
            valor: 'FLAGGED',
            rotulo: 'Sinalizados',
            contagem: c?.FLAGGED || null,
          },
          { valor: 'respostas', rotulo: 'Respostas' },
          { valor: 'APPROVED', rotulo: 'Aprovados' },
          { valor: 'REJECTED', rotulo: 'Recusados' },
          { valor: 'SPAM', rotulo: 'Spam' },
          { valor: 'todos', rotulo: 'Todos' },
        ]}
      />

      {lista.loading ? (
        <Row.Lista>
          <Row.Skeleton repetir={5} />
        </Row.Lista>
      ) : lista.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {lista.error}
        </Text>
      ) : lista.items.length === 0 ? (
        <Vazio
          titulo={
            filtro === 'PENDING' ? 'Nenhum comentário esperando' : 'Nada aqui'
          }
          descricao={
            filtro === 'PENDING'
              ? 'Os comentários novos aparecem aqui quando precisam de decisão.'
              : 'Troque o filtro para ver outros.'
          }
        />
      ) : (
        <ul className="sup-1 flex flex-col !p-0">
          {lista.items.map((com) => (
            <li
              key={com.id}
              className="flex flex-col gap-3 border-t border-linha px-5 py-4 first:border-0"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Avatar nome={autor(com.user)} imagem={com.user?.image} />
                {com.user ? (
                  <Elo
                    onClick={() => navegar.usuario(com.user!.id)}
                    className="text-[0.9375rem] font-medium"
                  >
                    {autor(com.user)}
                  </Elo>
                ) : (
                  <span className="text-[0.9375rem] font-medium text-texto">
                    {autor(com.user)}
                  </span>
                )}
                <span className="t-legenda">
                  em{' '}
                  <Link
                    href={`/blog/${com.article.slug}`}
                    target="_blank"
                    className="font-display text-[0.9375rem] text-texto-suave hover:text-ouro-texto"
                  >
                    {com.article.title}
                  </Link>{' '}
                  · {relativo(com.createdAt)}
                  {com.isEdited ? ' · editado' : ''}
                </span>
                <span className="ml-auto flex flex-wrap gap-1.5">
                  {com.parentId && <Badge>Resposta</Badge>}
                  {com.status !== 'PENDING' && (
                    <Badge
                      estado={com.status === 'FLAGGED' ? 'atencao' : 'neutro'}
                    >
                      {ESTADOS[com.status]}
                    </Badge>
                  )}
                  {com.pendingReports > 0 && (
                    <Link href="/admin/moderation">
                      <Badge estado="atencao">
                        {com.pendingReports}{' '}
                        {com.pendingReports === 1
                          ? 'denúncia aberta'
                          : 'denúncias abertas'}
                      </Badge>
                    </Link>
                  )}
                </span>
              </div>
              <p className="medida-texto whitespace-pre-line text-[0.9375rem] text-texto">
                {com.content}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {com.status !== 'APPROVED' && (
                  <Button
                    tamanho="p"
                    variante="primario"
                    onClick={() => agir(com, 'approve')}
                    disabled={moderar.isPending}
                  >
                    Aprovar
                  </Button>
                )}
                {com.status !== 'REJECTED' && (
                  <Button tamanho="p" onClick={() => setRecusando(com)}>
                    Recusar
                  </Button>
                )}
                {com.status !== 'SPAM' && (
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    onClick={() => agir(com, 'spam')}
                    disabled={moderar.isPending}
                  >
                    É spam
                  </Button>
                )}
                {(com.parentId || (com._count?.replies ?? 0) > 0) && (
                  <Button
                    tamanho="p"
                    variante="texto"
                    icone={PiChatsCircle}
                    onClick={() => setConversa(com)}
                    className="ml-auto"
                  >
                    Ver a conversa
                  </Button>
                )}
              </div>
            </li>
          ))}
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

      <ConfirmModal
        isOpen={!!recusando}
        onClose={() => {
          setRecusando(null);
          setMotivo('');
        }}
        onConfirm={async () => {
          if (!recusando) return;
          await agir(recusando, 'reject', motivo);
          setRecusando(null);
          setMotivo('');
        }}
        type="warning"
        title="Recusar este comentário?"
        message="Ele sai do artigo. O motivo fica registrado na auditoria."
        confirmText="Recusar"
        cancelText="Voltar"
        isLoading={moderar.isPending}
        confirmarBloqueado={motivo.trim().length < 3}
      >
        <Field.Area
          label="Motivo"
          ajuda="Obrigatório (RN-4): sustenta a decisão depois."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
        />
      </ConfirmModal>

      <Sheet
        aberto={!!conversa}
        aoFechar={() => setConversa(null)}
        titulo="A conversa"
        descricao={conversa ? `em ${conversa.article.title}` : undefined}
        largura="g"
      >
        {conversa && (
          <Conversa
            id={conversa.parentId ?? conversa.id}
            destaque={conversa.id}
          />
        )}
      </Sheet>
    </Stack>
  );
}

function Conversa({ id, destaque }: { id: string; destaque: string }) {
  const { data, loading, error } = useConversa(id);
  if (loading) return <Row.Skeleton repetir={3} />;
  if (error || !data)
    return (
      <Text papel="rotulo" tom="erro" as="p">
        {error ?? 'Conversa não encontrada.'}
      </Text>
    );
  return <No no={data} destaque={destaque} nivel={0} />;
}

function No({
  no,
  destaque,
  nivel,
}: {
  no: NoDaConversa;
  destaque: string;
  nivel: number;
}) {
  return (
    <div
      className={cx(
        'flex flex-col gap-3',
        nivel > 0 && 'border-l border-linha pl-4'
      )}
    >
      <div
        className={cx(
          'rounded-controle px-4 py-3',
          no.id === destaque ? 'bg-sup-2' : ''
        )}
      >
        <p className="t-legenda flex flex-wrap items-center gap-x-1.5">
          <Avatar nome={autor(no.user)} imagem={no.user?.image} />
          <span className="font-medium text-texto">
            {autor(no.user)}
          </span> · {relativo(no.createdAt)}
          {no.status !== 'APPROVED'
            ? ` · ${ESTADOS[no.status].toLowerCase()}`
            : ''}
        </p>
        <p className="mt-1 whitespace-pre-line text-[0.9375rem] text-texto">
          {no.content}
        </p>
      </div>
      {no.replies?.map((r) => (
        <No key={r.id} no={r} destaque={destaque} nivel={nivel + 1} />
      ))}
    </div>
  );
}
