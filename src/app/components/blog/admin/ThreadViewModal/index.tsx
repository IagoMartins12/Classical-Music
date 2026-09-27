// app/components/blog/admin/ThreadViewModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from '@/app/components/SmartImage';
import {
  askRejectionNotes,
  loadCommentThread,
  moderateComment,
  type ModerationAction,
} from '@/app/requests/blog/admin-actions';
import {
  PiArrowBendUpLeft,
  PiCheckCircle,
  PiFlag,
  PiSpinnerGap,
  PiUser,
  PiWarning,
  PiX,
  PiXCircle,
} from 'react-icons/pi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import { toast } from 'react-hot-toast';
import { Text } from '@/app/components/ui/Text';
import { Stack } from '@/app/components/ui/Layout';

interface ThreadComment {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  isEdited: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
  replies: ThreadComment[];
  _count: {
    likes: number;
  };
}

interface ThreadViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: string;
  articleTitle: string;
  onActionComplete: () => void;
}

export function ThreadViewModal({
  isOpen,
  onClose,
  commentId,
  articleTitle,
  onActionComplete,
}: ThreadViewModalProps) {
  const [thread, setThread] = useState<ThreadComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && commentId) {
      fetchThread();
    }
  }, [isOpen, commentId]);

  const fetchThread = async () => {
    setLoading(true);
    try {
      setThread(await loadCommentThread<ThreadComment>(commentId));
    } catch (error) {
      console.error('Erro ao carregar thread:', error);
      toast.error('Erro ao carregar thread');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (commentId: string, action: ModerationAction) => {
    // Reprovar exige justificativa na API.
    const notes = action === 'reject' ? askRejectionNotes() : undefined;
    if (notes === null) return;

    setProcessing(commentId);

    try {
      await moderateComment(commentId, action, notes);

      toast.success(
        action === 'approve'
          ? 'Comentário aprovado!'
          : action === 'reject'
            ? 'Comentário rejeitado!'
            : 'Marcado como spam!'
      );

      // Recarregar thread
      await fetchThread();
      onActionComplete();
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao processar ação');
    } finally {
      setProcessing(null);
    }
  };

  const getUserName = (user: ThreadComment['user']) => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pendente', color: 'bg-blue-500/20 text-blue-600' };
      case 'APPROVED':
        return { label: 'Aprovado', color: 'bg-green-500/20 text-green-600' };
      case 'REJECTED':
        return { label: 'Rejeitado', color: 'bg-red-500/20 text-red-600' };
      case 'SPAM':
        return { label: 'Spam', color: 'bg-orange-500/20 text-orange-600' };
      case 'FLAGGED':
        return {
          label: 'Denunciado',
          color: 'bg-yellow-500/20 text-yellow-600',
        };
      default:
        return { label: status, color: 'bg-gray-500/20 text-gray-600' };
    }
  };

  const renderComment = (comment: ThreadComment, depth: number = 0) => {
    const statusBadge = getStatusBadge(comment.status);
    const isHighlighted = comment.id === commentId;

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'} ${
          isHighlighted ? 'rounded-lg p-4' : ''
        }`}
      >
        {/* Flag Warning */}
        {comment.isFlagged && (
          <div className="bg-yellow-500/10 p-3 mb-3 rounded">
            <div className="flex items-start space-x-2">
              <PiWarning className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-700">
                  Denunciado
                </p>
                {comment.flagReason && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Motivo: {comment.flagReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.user.image ? (
              <Image
                src={comment.user.image}
                alt={getUserName(comment.user)}
                width={depth > 0 ? 32 : 40}
                height={depth > 0 ? 32 : 40}
                className="rounded-full"
              />
            ) : (
              <div
                className={`${
                  depth > 0 ? 'w-8 h-8' : 'w-10 h-10'
                } rounded-full bg-theme-classical flex items-center justify-center`}
              >
                <PiUser className="w-5 h-5 text-ouro-texto" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Text papel="rotulo" tom="forte" className="font-semibold">
                  {getUserName(comment.user)}
                </Text>
                <Text papel="legenda" tom="fraco">
                  {new Date(comment.createdAt).toLocaleString('pt-BR')}
                </Text>
                {comment.isEdited && (
                  <Text papel="legenda" tom="fraco">
                    (editado)
                  </Text>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
              >
                {statusBadge.label}
              </span>
            </div>

            {/* Comment text */}
            <Text
              papel="rotulo"
              tom="suave"
              as="p"
              className="mb-3 whitespace-pre-wrap"
            >
              {comment.content}
            </Text>

            {/* Stats */}
            <Text
              papel="legenda"
              tom="fraco"
              as="div"
              className="flex items-center gap-4 mb-3"
            >
              <span>{comment._count.likes} curtidas</span>
              <span>{comment.user.email}</span>
            </Text>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {comment.status !== 'APPROVED' && (
                <Button
                  onClick={() => handleAction(comment.id, 'approve')}
                  disabled={processing === comment.id}
                  variant="success"
                  size="sm"
                  leftIcon={<PiCheckCircle className="w-4 h-4" />}
                >
                  Aprovar
                </Button>
              )}

              {comment.status !== 'REJECTED' && (
                <Button
                  onClick={() => handleAction(comment.id, 'reject')}
                  disabled={processing === comment.id}
                  variant="delete"
                  size="sm"
                  leftIcon={<PiXCircle className="w-4 h-4" />}
                >
                  Rejeitar
                </Button>
              )}

              {comment.status !== 'SPAM' && (
                <Button
                  onClick={() => handleAction(comment.id, 'spam')}
                  disabled={processing === comment.id}
                  variant="outline"
                  size="sm"
                  leftIcon={<PiFlag className="w-4 h-4" />}
                >
                  Spam
                </Button>
              )}

              {processing === comment.id && (
                <PiSpinnerGap className="w-4 h-4 animate-spin text-ouro-texto" />
              )}
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 border-l-2 border-theme-secondary pl-4">
                <Text
                  papel="legenda"
                  tom="fraco"
                  as="div"
                  className="flex items-center gap-2 mb-3"
                >
                  <PiArrowBendUpLeft className="w-4 h-4" />
                  <span>{comment.replies.length} resposta(s)</span>
                </Text>
                {comment.replies.map((reply) =>
                  renderComment(reply, depth + 1)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className=" overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <PiSpinnerGap className="w-8 h-8 animate-spin text-ouro-texto" />
          </div>
        ) : thread ? (
          <Stack>
            {/* Info Box */}
            <Stack gap={1}>
              <h2 className="text-xl font-bold text-theme-primary">
                Visualizar Thread
              </h2>
              <Text papel="rotulo" tom="suave" as="p">
                Artigo: {articleTitle}
              </Text>
            </Stack>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PiArrowBendUpLeft className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Thread Completa
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Visualize toda a conversa e modere diretamente daqui. O
                    comentário destacado é o que você selecionou.
                  </p>
                </div>
              </div>
            </div>

            {/* Thread */}
            <div className="bg-theme-elevated rounded-lg p-4">
              {renderComment(thread)}
            </div>
          </Stack>
        ) : (
          <div className="text-center py-12">
            <PiWarning className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
            <p className="text-theme-secondary">
              Não foi possível carregar a thread
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-theme-secondary">
        <Button
          onClick={onClose}
          leftIcon={<PiX className="w-4 h-4 mr-2" />}
          variant="secondary"
        >
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
