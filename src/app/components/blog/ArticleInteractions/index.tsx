'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaBullseye,
} from 'react-icons/fa';
import { BiComment } from 'react-icons/bi';
import { FiShare2 } from 'react-icons/fi';
import { useToast } from '@/app/hooks/useToast';
import { useIsMobile } from '@/app/hooks/useMobile';

interface ArticleInteractionsProps {
  articleId: string;
  onOpenShareModal?: () => void;
  onOpenFocusMode: () => void;
}

export function ArticleInteractions({
  articleId,
  onOpenShareModal,
  onOpenFocusMode,
}: ArticleInteractionsProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const isMobile = useIsMobile();
  useEffect(() => {
    fetchInteractions();
  }, [session, articleId]);

  const fetchInteractions = async () => {
    try {
      const res = await fetch(`/api/blog/interactions/articles/${articleId}`);
      if (!res.ok) return;
      const data = await res.json();
      setIsLiked(data.isLiked);
      setIsSaved(data.isBookmarked);
      setLikesCount(data.likesCount);
      setBookmarksCount(data.bookmarksCount);
    } catch (error) {
      console.error('Erro ao buscar interações:', error);
    }
  };

  const handleLike = async () => {
    if (!session) {
      alert('Faça login para curtir artigos');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(
        `/api/blog/interactions/articles/${articleId}/like/`,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        }
      );

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
        if (isLiked) {
          toast.success('Artigo removido da sua lista.');
        } else {
          toast.success('Artigo adicionado da sua lista.');
        }
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      alert('Faça login para salvar artigos');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(
        `/api/blog/interactions/articles/${articleId}/bookmark/`,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        }
      );

      if (response.ok) {
        setIsSaved(!isSaved);
        setBookmarksCount((prev) => (isSaved ? prev - 1 : prev + 1));
        if (isLiked) {
          toast.success('Artigo removido da sua lista.');
        } else {
          toast.success('Artigo adicionado da sua lista.');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-theme-secondary border-t border-theme-secondary backdrop-blur-lg z-40">
        <div className="section-wrap py-3">
          <div className="flex items-center justify-around">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center space-y-1 ${
                isLiked ? 'text-red-500' : 'text-theme-secondary'
              }`}
            >
              <FaHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">Curtir</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex flex-col items-center space-y-1 ${
                isSaved ? 'text-brand-primary' : 'text-theme-secondary'
              }`}
            >
              <FaBookmark
                className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
              />
              <span className="text-xs">Salvar</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="flex flex-col items-center space-y-1 text-theme-secondary"
            >
              <FaShareAlt className="w-5 h-5" />
              <span className="text-xs">Compartilhar</span>
            </button>

            <button
              onClick={onOpenFocusMode}
              className="flex flex-col items-center space-y-1 text-theme-secondary"
            >
              <FaBullseye className="w-5 h-5" />
              <span className="text-xs">Foco</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="classical-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center w-full justify-end md:justify-start gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={loading}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isLiked
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                : 'bg-theme-elevated hover:bg-theme-classical text-theme-secondary'
            }`}
          >
            {isLiked ? (
              <FaHeart className="w-5 h-5" />
            ) : (
              <FaRegHeart className="w-5 h-5" />
            )}
            <span className="font-medium">{likesCount}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isSaved
                ? 'bg-brand-primary/20 text-brand-primary'
                : 'bg-theme-elevated hover:bg-theme-classical text-theme-secondary'
            }`}
          >
            {isSaved ? (
              <FaBookmark className="w-5 h-5" />
            ) : (
              <FaRegBookmark className="w-5 h-5" />
            )}
            <span className="font-medium">{bookmarksCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={scrollToComments}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-elevated hover:bg-theme-classical text-theme-secondary transition-all"
          >
            <BiComment className="w-5 h-5" />
            <span className="font-medium inline">Comentar</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={() => onOpenShareModal?.()}
          className=" hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-elevated hover:bg-theme-classical text-theme-secondary transition-all"
        >
          <FiShare2 className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Compartilhar</span>
        </button>
      </div>

      {!session && (
        <div className="mt-4 pt-4 border-t border-theme-secondary">
          <p className="text-sm text-theme-tertiary text-center">
            <a href="/login" className="text-brand-primary hover:underline">
              Faça login
            </a>{' '}
            para curtir, comentar e salvar artigos
          </p>
        </div>
      )}
    </div>
  );
}
