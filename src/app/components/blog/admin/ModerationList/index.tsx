// app/components/blog/admin/ModerationList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  BiCheckCircle,
  BiXCircle,
  BiFlag,
  BiComment,
  BiUser,
  BiListUl,
} from 'react-icons/bi';
import { FiExternalLink, FiEye, FiAlertTriangle } from 'react-icons/fi';
import { HiReply } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Button from '@/app/components/Common/Button';
import { ThreadViewModal } from '../ThreadViewModal';

interface Comment {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  isEdited: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
  flaggedBy?: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
  article: {
    id: string;
    title: string;
    slug: string;
  };
  parent: {
    id: string;
    content: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  _count?: {
    replies: number;
  };
}

interface ModerationListProps {
  comments: Comment[];
  currentFilter: string;
}

export function ModerationList({
  comments: initialComments,
  currentFilter,
}: ModerationListProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  // ✅ ESTADOS DO MODAL DE THREAD
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );
  const [selectedArticleTitle, setSelectedArticleTitle] = useState<string>('');

  const filters = [
    { key: 'all', label: 'Todos', icon: BiListUl, color: 'purple' },
    { key: 'pending', label: 'Pendentes', icon: BiComment, color: 'blue' },
    {
      key: 'flagged',
      label: 'Denunciados',
      icon: FiAlertTriangle,
      color: 'orange',
    },
    { key: 'replies', label: 'Respostas', icon: HiReply, color: 'indigo' }, // ✅ NOVO FILTRO
    {
      key: 'approved',
      label: 'Aprovados',
      icon: BiCheckCircle,
      color: 'green',
    },
    { key: 'rejected', label: 'Rejeitados', icon: BiXCircle, color: 'red' },
    { key: 'spam', label: 'Spam', icon: BiFlag, color: 'red' },
  ];

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
            : action === 'spam'
              ? 'Marcado como spam!'
              : 'Ação executada!'
      );

      router.refresh();
    } catch {
      toast.error('Erro ao processar ação');
    } finally {
      setProcessing(null);
    }
  };

  const getUserName = (user: Comment['user']) => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';
  };

  // ✅ FUNÇÃO PARA ABRIR MODAL DE THREAD
  const handleOpenThread = (commentId: string, articleTitle: string) => {
    setSelectedCommentId(commentId);
    setSelectedArticleTitle(articleTitle);
    setThreadModalOpen(true);
  };

  const handleCloseThread = () => {
    setThreadModalOpen(false);
    setSelectedCommentId(null);
    setSelectedArticleTitle('');
  };

  const handleThreadActionComplete = () => {
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pendente', color: 'blue' };
      case 'APPROVED':
        return { label: 'Aprovado', color: 'green' };
      case 'REJECTED':
        return { label: 'Rejeitado', color: 'red' };
      case 'SPAM':
        return { label: 'Spam', color: 'orange' };
      case 'FLAGGED':
        return { label: 'Denunciado', color: 'yellow' };
      default:
        return { label: status, color: 'gray' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="classical-card p-2">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = currentFilter === filter.key;

            return (
              <Link
                key={filter.key}
                href={`/blog/admin/moderation?filter=${filter.key}`}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                  ${
                    isActive
                      ? ` text-brand-primary`
                      : 'text-theme-secondary hover:bg-interactive-hover'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {initialComments.length === 0 ? (
        <div className="classical-card p-12 text-center">
          <BiComment className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            Nenhum comentário
          </h3>
          <p className="text-theme-secondary">
            {currentFilter === 'all'
              ? 'Nenhum comentário encontrado'
              : currentFilter === 'pending'
                ? 'Nenhum comentário aguardando moderação'
                : currentFilter === 'flagged'
                  ? 'Nenhum comentário denunciado'
                  : currentFilter === 'replies'
                    ? 'Nenhuma resposta encontrada'
                    : `Nenhum comentário ${
                        currentFilter === 'approved'
                          ? 'aprovado'
                          : currentFilter === 'rejected'
                            ? 'rejeitado'
                            : 'marcado como spam'
                      }`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {initialComments.map((comment) => {
            const statusBadge = getStatusBadge(comment.status);
            const isReply = !!comment.parent;
            const hasReplies = (comment._count?.replies || 0) > 0;

            return (
              <div
                key={comment.id}
                className="classical-card overflow-hidden hover:shadow-theme-medium transition-all relative"
              >
                {/* ✅ INDICADOR DE RESPOSTA */}
                {isReply && (
                  <div className="bg-theme-tertiary border-l-4  px-4 py-2">
                    <div className="flex items-center space-x-2 ">
                      <HiReply className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Esta é uma resposta
                      </span>
                    </div>
                  </div>
                )}

                {/* Flag Warning */}
                {comment.isFlagged && (
                  <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-3">
                    <div className="flex items-start space-x-2">
                      <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-theme-primary font-bold">
                          Comentário denunciado
                        </p>
                        {comment.flagReason && (
                          <p className="text-xs text-theme-primary font-medium mt-1">
                            Motivo: {comment.flagReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Comment Header */}
                <div className="p-4 bg-theme-elevated border-b border-theme-secondary">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* User Avatar */}
                      {comment.user.image ? (
                        <Image
                          src={comment.user.image}
                          alt={getUserName(comment.user)}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-theme-classical rounded-full flex items-center justify-center">
                          <BiUser className="w-5 h-5 text-brand-primary" />
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-theme-primary truncate">
                            {getUserName(comment.user)}
                          </h4>
                          <span className="text-xs text-theme-tertiary">
                            {new Date(comment.createdAt).toLocaleString(
                              'pt-BR'
                            )}
                          </span>
                          {comment.isEdited && (
                            <span className="text-xs text-theme-tertiary">
                              (editado)
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-theme-tertiary truncate">
                          {comment.user.email}
                        </p>

                        {/* ✅ MOSTRAR CONTADOR DE RESPOSTAS */}
                        {hasReplies && (
                          <div className="flex items-center space-x-1 mt-1">
                            <HiReply className="w-4 h-4 0" />
                            <span className="text-xs font-medium">
                              {comment._count!.replies}{' '}
                              {comment._count!.replies === 1
                                ? 'resposta'
                                : 'respostas'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        bg-${statusBadge.color}-500/20 text-${statusBadge.color}-600
                      `}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="p-4">
                  {/* Reply Context */}
                  {comment.parent && (
                    <div className="mb-3 p-3 bg-theme-elevated rounded-lg border-l-4 border-brand-primary">
                      <p className="text-xs text-theme-tertiary mb-1">
                        Respondendo a{' '}
                        {`${comment.parent.user.firstName || ''} ${
                          comment.parent.user.lastName || ''
                        }`.trim()}
                        :
                      </p>
                      <p className="text-sm text-theme-secondary italic line-clamp-2">
                        {comment.parent.content}
                      </p>
                    </div>
                  )}

                  {/* Comment Text */}
                  <p className="text-theme-primary whitespace-pre-wrap mb-4">
                    {comment.content}
                  </p>

                  {/* Article Link */}
                  <div className="flex items-center space-x-2 text-sm text-theme-tertiary mb-4">
                    <span>Artigo:</span>
                    <Link
                      href={`/${comment.article.slug}`}
                      target="_blank"
                      className="text-brand-primary hover:underline flex items-center space-x-1"
                    >
                      <span className="line-clamp-1">
                        {comment.article.title}
                      </span>
                      <FiExternalLink className="w-3 h-3 flex-shrink-0" />
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/${comment.article.slug}#comment-${comment.id}`}
                        target="_blank"
                        className="btn-classical-secondary text-sm flex items-center space-x-1"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>Ver no Artigo</span>
                      </Link>

                      {/* ✅ BOTÃO PARA ABRIR MODAL DE THREAD */}
                      {(isReply || hasReplies) && (
                        <button
                          onClick={() =>
                            handleOpenThread(comment.id, comment.article.title)
                          }
                          className="btn-classical-secondary text-sm flex items-center space-x-1"
                        >
                          <HiReply className="w-4 h-4" />
                          <span>Ver Thread</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {comment.status !== 'APPROVED' && (
                        <Button
                          onClick={() => handleAction(comment.id, 'approve')}
                          disabled={processing === comment.id}
                          variant="success"
                          leftIcon={<BiCheckCircle className="w-4 h-4" />}
                        >
                          <span>Aprovar</span>
                        </Button>
                      )}

                      {comment.status !== 'REJECTED' && (
                        <Button
                          onClick={() => handleAction(comment.id, 'reject')}
                          disabled={processing === comment.id}
                          variant="delete"
                          leftIcon={<BiXCircle className="w-4 h-4" />}
                        >
                          <span>Rejeitar</span>
                        </Button>
                      )}

                      {comment.status !== 'SPAM' && (
                        <Button
                          onClick={() => handleAction(comment.id, 'spam')}
                          disabled={processing === comment.id}
                          leftIcon={<BiFlag className="w-4 h-4" />}
                          variant="outline"
                        >
                          <span>Spam</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Processing Overlay */}
                {processing === comment.id && (
                  <div className="absolute inset-0 bg-theme-primary/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ MODAL DE VISUALIZAÇÃO DE THREAD */}
      {selectedCommentId && (
        <ThreadViewModal
          isOpen={threadModalOpen}
          onClose={handleCloseThread}
          commentId={selectedCommentId}
          articleTitle={selectedArticleTitle}
          onActionComplete={handleThreadActionComplete}
        />
      )}
    </div>
  );
}
