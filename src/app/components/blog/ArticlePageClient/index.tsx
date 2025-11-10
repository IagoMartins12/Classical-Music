// components/blog/ArticlePageClient.tsx - COMPONENTE CLIENT COMPLETO
'use client';

import { useState } from 'react';
import { ArticleContent } from '../ArticleContent';
import { ReadingControls } from '../ReadingControls';
import { ArticleInteractions } from '../ArticleInteractions';
import { ProgressBar } from '../ProgressBar';
import { CommentSection } from '../CommentSection';
import Link from 'next/link';
import { AudioAutoplay } from '../AudioAutoplay';
import { ShareModalBlog } from '../ShareModalBlog';
import { TextToSpeechGoogle } from '../TextToSpeechGoogle';

interface ArticlePageClientProps {
  article: {
    id: string;
    title: string;
    slug: string;
    content: any;
    composerIds: string[];
    ttsAudioUrl?: string | null;
    workIds: string[];
    scoreIds: string[];
    _count: {
      comments: number;
      likes: number;
    };
    categories: Array<{
      category: {
        id: string;
        name: string;
        slug: string;
        color: string | null;
      };
    }>;
  };
  hasBackgroundMusic: boolean | '' | null;
  backgroundMusicUrl: string;
  backgroundMusicTitle: string;
  backgroundAudioType: 'upload' | 'youtube' | null;
  isPreview?: boolean;
  isAdmin?: boolean;
}

export function ArticlePageClient({
  article,
  hasBackgroundMusic,
  backgroundMusicUrl,
  backgroundMusicTitle,
  backgroundAudioType,
  isPreview,
  isAdmin,
}: ArticlePageClientProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  // const [showFocusMode, setShowFocusMode] = useState(false);

  const articleUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://opusatlas.com/artigo/${article.slug}`;

  return (
    <>
      {/* ✅ AUTOPLAY DE MÚSICA DE FUNDO */}
      {hasBackgroundMusic && backgroundAudioType && (
        <AudioAutoplay
          audioUrl={backgroundMusicUrl}
          audioType={backgroundAudioType}
          title={backgroundMusicTitle || 'Música de fundo do artigo'}
        />
      )}

      {/* Main Content with Sidebars */}
      <div className="section-wrap pt-0">
        <div className="relative mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Reading Controls (Fixed) */}
            <div className="hidden lg:block lg:col-span-2">
              <ReadingControls
                onOpenShareModal={() => setShowShareModal(true)}
                // onOpenFocusMode={() => setShowFocusMode(true)}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8">
              <article className="prose prose-lg max-w-none">
                <ArticleContent content={article.content} />
              </article>

              {/* ✅ TEXT-TO-SPEECH (Web Speech API - GRÁTIS) */}
              <TextToSpeechGoogle
                content={article.content}
                articleId={article.id}
                existingAudioUrl={article.ttsAudioUrl}
                isAdmin={isAdmin}
              />
              {/* <VoiceTester /> */}
              {/* Related Entities */}
              {/* {(article.composerIds.length > 0 ||
                article.workIds.length > 0 ||
                article.scoreIds.length > 0) &&
                !isPreview && (
                  <div className="mt-12">
                    <RelatedEntities
                      composerIds={article.composerIds}
                      workIds={article.workIds}
                      scoreIds={article.scoreIds}
                    />
                  </div>
                )} */}

              {/* Interactions */}
              <div className="mt-12">
                <ArticleInteractions
                  articleId={article.id}
                  onOpenShareModal={() => setShowShareModal(true)}
                  // onOpenFocusMode={() => setShowFocusMode(true)}
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 pt-8">
                {article.categories.map((cat) => (
                  <Link
                    key={cat.category.slug}
                    href={`/blog/category/${cat.category.slug}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: cat.category.color
                        ? `${cat.category.color}20`
                        : 'var(--interactive-hover)',
                      color: cat.category.color || 'var(--brand-primary)',
                      border: `1px solid ${
                        cat.category.color || 'var(--border-primary)'
                      }`,
                    }}
                  >
                    {cat.category.name}
                  </Link>
                ))}
              </div>

              {/* Comments */}
              {isPreview && (
                <div className="mt-12" id="comments-section">
                  <CommentSection
                    articleId={article.id}
                    commentCount={article._count.comments}
                  />
                </div>
              )}
            </div>

            {/* Right Sidebar - Progress Bar (Fixed) */}
            <div className="hidden lg:block lg:col-span-2">
              <ProgressBar />
            </div>
          </div>
        </div>
      </div>

      {isPreview && (
        <div className="lg:hidden">
          <ReadingControls
            isMobile
            onOpenShareModal={() => setShowShareModal(true)}
            // onOpenFocusMode={() => setShowFocusMode(true)}
          />
        </div>
      )}
      {/* Mobile Reading Controls */}

      {/* ✅ MODAL DE COMPARTILHAMENTO */}
      <ShareModalBlog
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={article.title}
        url={articleUrl}
      />

      {/* ✅ MODAL DE MODO FOCO */}
      {/* <FocusModeModal
        isOpen={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        content={article.content}
        title={article.title}
      /> */}
    </>
  );
}
