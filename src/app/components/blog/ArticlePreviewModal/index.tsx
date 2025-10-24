// components/blog/ArticlePreviewModal.tsx
'use client';

import Image from 'next/image';
import { ArticleContent } from '../ArticleContent';
import Modal from '../../Modal';

interface ArticlePreviewModalProps {
  article: any;
  onClose: () => void;
}

export default function ArticlePreviewModal({
  article,
  onClose,
}: ArticlePreviewModalProps) {
  return (
    <Modal isOpen maxWidth="6xl" onClose={onClose}>
      <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-theme-tertiary border-b border-theme-secondary shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-theme-primary">
              Preview do Artigo
            </h2>
            <p className="text-xs text-theme-tertiary">
              Visualização de como o artigo ficará publicado
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8">
          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <Image
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                width={1200}
                height={600}
                className="w-full h-auto object-cover"
              />
              {article.coverImageCredit && (
                <p className="text-xs text-theme-tertiary text-center mt-2">
                  Foto: {article.coverImageCredit}
                </p>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-theme-primary mb-4">
            {article.title || 'Sem título'}
          </h1>

          {/* Description */}
          {article.description && (
            <p className="text-lg text-theme-secondary mb-6 italic">
              {article.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-theme-secondary">
            {article.types && article.types.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-theme-tertiary">Tipo:</span>
                <span className="text-xs font-medium text-brand-primary">
                  {article.types[0]}
                </span>
              </div>
            )}
            {article.readTime && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-theme-tertiary">Leitura:</span>
                <span className="text-xs font-medium text-theme-primary">
                  {article.readTime} min
                </span>
              </div>
            )}
            {article.status && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-theme-tertiary">Status:</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    article.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : article.status === 'DRAFT'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  {article.status}
                </span>
              </div>
            )}
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <ArticleContent content={article.content} />
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-theme-secondary">
              <h3 className="text-sm font-medium text-theme-tertiary mb-3">
                Tags:
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords (SEO) */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-theme-tertiary mb-3">
                Keywords (SEO):
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword: string) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-theme-secondary rounded-full text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SEO Info */}
          {(article.metaTitle || article.metaDescription) && (
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Informações de SEO:
              </h3>
              {article.metaTitle && (
                <div className="mb-2">
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    Meta Título:
                  </span>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {article.metaTitle}
                  </p>
                </div>
              )}
              {article.metaDescription && (
                <div>
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    Meta Descrição:
                  </span>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {article.metaDescription}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
