// app/components/blog/admin/ThreadViewModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BiUser,
  BiCheckCircle,
  BiXCircle,
  BiFlag,
  BiLoader,
} from 'react-icons/bi';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { HiReply } from 'react-icons/hi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import { toast } from 'react-hot-toast';

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
      const response = await fetch(`/api/blog/comments/${commentId}/thread`);
      const data = await response.json();

      if (data.success) {
        setThread(data.thread);
      } else {
        toast.error('Erro ao carregar thread');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao carregar thread:', error);
      toast.error('Erro ao carregar thread');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (commentId: string, action: string) => {
    setProcessing(commentId);

    try {
      const response = await fetch(`/api/blog/admin/moderation/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error();

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
    } catch {
      toast.error('Erro ao processar ação');
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
          isHighlighted ? 'rounded-lg p-4 bg-brand-primary/5' : ''
        }`}
      >
        {/* Flag Warning */}
        {comment.isFlagged && (
          <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 mb-3 rounded">
            <div className="flex items-start space-x-2">
              <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
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
                <BiUser className="w-5 h-5 text-brand-primary" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-theme-primary text-sm">
                  {getUserName(comment.user)}
                </span>
                <span className="text-xs text-theme-tertiary">
                  {new Date(comment.createdAt).toLocaleString('pt-BR')}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-theme-tertiary">(editado)</span>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
              >
                {statusBadge.label}
              </span>
            </div>

            {/* Comment text */}
            <p className="text-theme-secondary text-sm mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-theme-tertiary mb-3">
              <span>{comment._count.likes} curtidas</span>
              <span>{comment.user.email}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {comment.status !== 'APPROVED' && (
                <Button
                  onClick={() => handleAction(comment.id, 'approve')}
                  disabled={processing === comment.id}
                  variant="success"
                  size="sm"
                  leftIcon={<BiCheckCircle className="w-4 h-4" />}
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
                  leftIcon={<BiXCircle className="w-4 h-4" />}
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
                  leftIcon={<BiFlag className="w-4 h-4" />}
                >
                  Spam
                </Button>
              )}

              {processing === comment.id && (
                <BiLoader className="w-4 h-4 animate-spin text-brand-primary" />
              )}
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 border-l-2 border-theme-secondary pl-4">
                <div className="flex items-center gap-2 mb-3 text-xs text-theme-tertiary">
                  <HiReply className="w-4 h-4" />
                  <span>{comment.replies.length} resposta(s)</span>
                </div>
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
            <BiLoader className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : thread ? (
          <div className="space-y-4">
            {/* Info Box */}
            <div>
              <h2 className="text-xl font-bold text-theme-primary mb-1">
                Visualizar Thread
              </h2>
              <p className="text-sm text-theme-secondary">
                Artigo: {articleTitle}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiReply className="w-5 h-5 text-blue-600" />
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
          </div>
        ) : (
          <div className="text-center py-12">
            <FiAlertTriangle className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
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
          leftIcon={<FiX className="w-4 h-4 mr-2" />}
          variant="secondary"
        >
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
