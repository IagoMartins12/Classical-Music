// app/components/blog/CommentSection.tsx
'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  BiComment,
  BiSend,
  BiLike,
  BiSolidLike,
  BiFlag,
  BiEdit,
  BiTrash,
  BiInfoCircle,
} from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/Modal';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  isEdited: boolean;
  status: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
  replies: Comment[];
  _count: {
    likes: number;
  };
  userLiked?: boolean;
}

interface CommentSectionProps {
  articleId: string;
  commentCount: number;
}

// ✅ COMPONENTE EXTRAÍDO PARA EVITAR RE-CRIAÇÃO
const CommentItem = memo(
  ({
    comment,
    isReply = false,
    depth = 0,
    session,
    replyTo,
    replyContent,
    submitting,
    editingCommentId,
    editContent,
    onReply,
    onCancelReply,
    onReplyContentChange,
    onSubmitReply,
    onLike,
    onEdit,
    onEditContentChange,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    onReport,
  }: {
    comment: Comment;
    isReply?: boolean;
    depth?: number;
    session: any;
    replyTo: string | null;
    replyContent: string;
    submitting: boolean;
    editingCommentId: string | null;
    editContent: string;
    onReply: (commentId: string) => void;
    onCancelReply: () => void;
    onReplyContentChange: (value: string) => void;
    onSubmitReply: (commentId: string) => void;
    onLike: (commentId: string, isLiked: boolean) => void;
    onEdit: (commentId: string, content: string) => void;
    onEditContentChange: (value: string) => void;
    onSaveEdit: (commentId: string) => void;
    onCancelEdit: () => void;
    onDelete: (commentId: string) => void;
    onReport: (commentId: string) => void;
  }) => {
    const userName =
      `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim();
    const isOwner = session?.user?.id === comment.user.id;
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyTo === comment.id;

    // 🔍 DEBUG: Log de respostas
    if (comment.replies && comment.replies.length > 0) {
      console.log(
        `💬 Comentário ${comment.id.slice(-4)} tem ${comment.replies.length} respostas`
      );
    }

    // Verificar status do comentário
    const isRejected = comment.status === 'REJECTED';
    const isSpam = comment.status === 'SPAM';
    const isFlagged = comment.status === 'FLAGGED';
    const isPending = comment.status === 'PENDING';

    // Se for comentário rejeitado/spam e não for o dono
    if ((isRejected || isSpam) && !isOwner) {
      return (
        <div
          className={`${isReply ? `ml-8 mt-4` : 'mt-6'} ${
            !isReply ? 'pb-6 border-b border-theme-secondary' : ''
          }`}
        >
          <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <FiAlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isRejected
                  ? 'Comentário removido por violar nossas diretrizes'
                  : 'Comentário marcado como spam'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        id={`comment-${comment.id}`}
        className={`${isReply ? `ml-8 mt-4` : 'mt-6'} ${
          !isReply ? 'pb-6 border-b border-theme-secondary' : ''
        }`}
      >
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.user.image ? (
              <Image
                src={comment.user.image}
                alt={userName}
                width={isReply ? 32 : 40}
                height={isReply ? 32 : 40}
                className="rounded-full"
              />
            ) : (
              <div
                className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-theme-classical flex items-center justify-center`}
              >
                <FaUser
                  className={`${isReply ? 'w-4 h-4' : 'w-5 h-5'} text-brand-primary`}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Status Warning for Owner */}
            {isOwner && (isRejected || isSpam || isFlagged || isPending) && (
              <div className="mb-3 p-2 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-400">
                  <BiInfoCircle className="w-4 h-4" />
                  <span className="text-xs">
                    {isPending && 'Seu comentário está aguardando aprovação'}
                    {isFlagged &&
                      'Seu comentário foi denunciado e está em análise'}
                    {isRejected &&
                      'Seu comentário foi rejeitado por violar nossas diretrizes'}
                    {isSpam && 'Seu comentário foi marcado como spam'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-theme-primary text-sm">
                {userName || 'Usuário'}
              </span>
              <span className="text-xs text-theme-tertiary">
                {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-theme-tertiary">(editado)</span>
              )}
            </div>

            {isEditing ? (
              <div className="mb-3">
                <textarea
                  value={editContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  className="input-classical-2 w-full resize-none text-sm"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onSaveEdit(comment.id)}
                    disabled={!editContent.trim() || submitting}
                    className="btn-classical-primary px-3 py-1.5 text-xs"
                  >
                    {submitting ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="btn-classical-secondary px-3 py-1.5 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-theme-secondary mb-3 whitespace-pre-wrap text-sm">
                {comment.content}
              </p>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onLike(comment.id, !!comment.userLiked)}
                  className="flex items-center gap-1 text-xs text-theme-tertiary hover:text-brand-primary transition-colors"
                >
                  {comment.userLiked ? (
                    <BiSolidLike className="w-3.5 h-3.5" />
                  ) : (
                    <BiLike className="w-3.5 h-3.5" />
                  )}
                  <span>{comment._count?.likes || 0}</span>
                </button>

                {session && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="text-xs text-theme-tertiary hover:text-brand-primary transition-colors"
                  >
                    Responder
                  </button>
                )}

                {isOwner && (
                  <>
                    <button
                      onClick={() => onEdit(comment.id, comment.content)}
                      className="text-xs text-theme-tertiary hover:text-brand-primary transition-colors flex items-center gap-1"
                    >
                      <BiEdit className="w-3.5 h-3.5" />

                      <span className="hidden md:block">Editar</span>
                    </button>
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <BiTrash className="w-3.5 h-3.5" />
                      <span className="hidden md:block">Deletar</span>
                    </button>
                  </>
                )}

                {!isOwner && session && (
                  <button
                    onClick={() => onReport(comment.id)}
                    className="text-xs text-theme-tertiary hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <BiFlag className="w-3.5 h-3.5" />
                    Denunciar
                  </button>
                )}
              </div>
            )}

            {/* Reply Form */}
            {isReplying && (
              <div className="mt-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={3}
                  className="input-classical-2 w-full resize-none text-sm"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || submitting}
                    className="btn-classical-primary px-3 py-1.5 text-xs"
                  >
                    {submitting ? 'Enviando...' : 'Responder'}
                  </button>
                  <button
                    onClick={onCancelReply}
                    className="btn-classical-secondary px-3 py-1.5 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply
                    depth={depth + 1}
                    session={session}
                    replyTo={replyTo}
                    replyContent={replyContent}
                    submitting={submitting}
                    editingCommentId={editingCommentId}
                    editContent={editContent}
                    onReply={onReply}
                    onCancelReply={onCancelReply}
                    onReplyContentChange={onReplyContentChange}
                    onSubmitReply={onSubmitReply}
                    onLike={onLike}
                    onEdit={onEdit}
                    onEditContentChange={onEditContentChange}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    onDelete={onDelete}
                    onReport={onReport}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CommentItem.displayName = 'CommentItem';

export function CommentSection({
  articleId,
  commentCount: initialCount,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estados para denúncia
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(
    null
  );
  const [reportReason, setReportReason] = useState('');
  const [reportingComment, setReportingComment] = useState(false);

  // Estados para edição
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/comments/article/${articleId}`);
      const data = await response.json();
      if (data.success) {
        console.log(
          '📥 Comentários carregados:',
          data.comments.length,
          'top-level'
        );
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blog/comments/article/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Comentário criado:', data.comment.id);
        setNewComment('');
        await fetchComments(); // Aguardar reload
        toast.success('Comentário enviado!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao enviar comentário');
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ CALLBACKS MEMOIZADOS PARA EVITAR RE-CRIAÇÃO
  const handleReply = useCallback((commentId: string) => {
    setReplyTo(commentId);
    setReplyContent('');
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
    setReplyContent('');
  }, []);

  const handleReplyContentChange = useCallback((value: string) => {
    setReplyContent(value);
  }, []);

  const handleSubmitReply = useCallback(
    async (parentId: string) => {
      if (!session || !replyContent.trim()) return;

      setSubmitting(true);
      try {
        const response = await fetch(
          `/api/blog/comments/article/${articleId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId,
              content: replyContent.trim(),
              parentId,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Resposta criada:', data.comment.id);
          setReplyContent('');
          setReplyTo(null);
          await fetchComments(); // Aguardar reload
          toast.success('Resposta enviada!');
        } else {
          const data = await response.json();
          toast.error(data.error || 'Erro ao enviar resposta');
        }
      } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        toast.error('Erro ao enviar resposta');
      } finally {
        setSubmitting(false);
      }
    },
    [session, replyContent, articleId]
  );

  const handleLikeComment = useCallback(
    async (commentId: string, isLiked: boolean) => {
      if (!session) {
        toast.error('Faça login para curtir comentários');
        return;
      }

      try {
        const response = await fetch(`/api/blog/comments/${commentId}/like`, {
          method: isLiked ? 'DELETE' : 'POST',
        });

        if (response.ok) {
          fetchComments();
        }
      } catch (error) {
        console.error('Erro ao curtir comentário:', error);
        toast.error('Erro ao processar ação');
      }
    },
    [session]
  );

  const handleEdit = useCallback((commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  }, []);

  const handleEditContentChange = useCallback((value: string) => {
    setEditContent(value);
  }, []);

  const handleSaveEdit = useCallback(
    async (commentId: string) => {
      if (!editContent.trim()) return;

      setSubmitting(true);
      try {
        const response = await fetch(`/api/blog/comments/${commentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: editContent.trim() }),
        });

        if (response.ok) {
          setEditingCommentId(null);
          setEditContent('');
          fetchComments();
          toast.success('Comentário atualizado!');
        }
      } catch (error) {
        console.error('Erro ao editar comentário:', error);
        toast.error('Erro ao editar comentário');
      } finally {
        setSubmitting(false);
      }
    },
    [editContent]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditContent('');
  }, []);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (
      !confirm(
        'Tem certeza que deseja deletar este comentário e todas as suas respostas?'
      )
    )
      return;

    try {
      const response = await fetch(`/api/blog/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
        toast.success('Comentário deletado!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao deletar comentário');
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao deletar comentário');
    }
  }, []);

  const handleReport = useCallback((commentId: string) => {
    setReportingCommentId(commentId);
    setReportModalOpen(true);
    setReportReason('');
  }, []);

  const handleReportComment = async () => {
    if (!reportingCommentId || !reportReason.trim()) return;

    setReportingComment(true);
    try {
      const response = await fetch(
        `/api/blog/comments/${reportingCommentId}/flag`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reportReason.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          'Comentário denunciado. Será analisado por um moderador.'
        );
        setReportModalOpen(false);
        setReportingCommentId(null);
        setReportReason('');
        fetchComments();
      } else {
        toast.error(data.error || 'Erro ao denunciar comentário');
      }
    } catch (error) {
      console.error('Erro ao denunciar comentário:', error);
      toast.error('Erro ao denunciar comentário');
    } finally {
      setReportingComment(false);
    }
  };

  return (
    <>
      <section id="comments-section" className="scroll-mt-24">
        <div className="classical-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center gap-2">
            <BiComment className="text-brand-primary" />
            Comentários ({initialCount})
          </h2>

          {/* New Comment Form */}
          {session ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deixe seu comentário..."
                rows={4}
                className="input-classical-2 w-full resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="btn-classical-primary flex items-center gap-2"
                >
                  <BiSend />
                  {submitting ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-6 bg-theme-elevated rounded-lg text-center">
              <p className="text-theme-secondary mb-4">
                Faça login para deixar um comentário
              </p>
              <a href="/login" className="btn-classical-primary inline-block">
                Fazer Login
              </a>
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="loading-skeleton h-24 rounded-lg" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <BiComment className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <p className="text-theme-secondary">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  session={session}
                  replyTo={replyTo}
                  replyContent={replyContent}
                  submitting={submitting}
                  editingCommentId={editingCommentId}
                  editContent={editContent}
                  onReply={handleReply}
                  onCancelReply={handleCancelReply}
                  onReplyContentChange={handleReplyContentChange}
                  onSubmitReply={handleSubmitReply}
                  onLike={handleLikeComment}
                  onEdit={handleEdit}
                  onEditContentChange={handleEditContentChange}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onDelete={handleDeleteComment}
                  onReport={handleReport}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportingCommentId(null);
          setReportReason('');
        }}
        title="Denunciar Comentário"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Por que você está denunciando este comentário?
          </p>

          <div className="space-y-2">
            {[
              'Conteúdo ofensivo ou impróprio',
              'Spam ou propaganda',
              'Informações falsas ou enganosas',
              'Linguagem de ódio ou discriminação',
              'Conteúdo violento ou perturbador',
              'Outro motivo',
            ].map((reason) => (
              <label
                key={reason}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4 text-brand-primary"
                />
                <span className="text-sm text-theme-primary">{reason}</span>
              </label>
            ))}
          </div>

          {reportReason === 'Outro motivo' && (
            <textarea
              placeholder="Descreva o motivo..."
              className="input-classical-2 w-full resize-none"
              rows={3}
              onChange={(e) => setReportReason(`Outro: ${e.target.value}`)}
            />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => {
                setReportModalOpen(false);
                setReportingCommentId(null);
                setReportReason('');
              }}
              className="btn-classical-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleReportComment}
              disabled={!reportReason || reportingComment}
              className="btn-classical-primary flex items-center gap-2"
            >
              <BiFlag />
              {reportingComment ? 'Enviando...' : 'Denunciar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
