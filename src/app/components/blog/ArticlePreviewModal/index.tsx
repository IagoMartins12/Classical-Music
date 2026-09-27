// components/blog/ArticlePreviewModal.tsx
'use client';

import Image from '@/app/components/SmartImage';
import { ArticleContent } from '../ArticleContent';
import Modal from '../../Modal';
import { Text } from '@/app/components/ui/Text';
import { Stack } from '@/app/components/ui/Layout';

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
            <Text papel="legenda" tom="fraco" as="p">
              Visualização de como o artigo ficará publicado
            </Text>
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
                <Text
                  papel="legenda"
                  tom="fraco"
                  as="p"
                  className="text-center mt-2"
                >
                  Foto: {article.coverImageCredit}
                </Text>
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
                <Text papel="legenda" tom="fraco">
                  Tipo:
                </Text>
                <Text papel="legenda" tom="ouro" className="font-medium">
                  {article.types[0]}
                </Text>
              </div>
            )}
            {article.readTime && (
              <div className="flex items-center gap-2">
                <Text papel="legenda" tom="fraco">
                  Leitura:
                </Text>
                <Text papel="legenda" tom="forte" className="font-medium">
                  {article.readTime} min
                </Text>
              </div>
            )}
            {article.status && (
              <div className="flex items-center gap-2">
                <Text papel="legenda" tom="fraco">
                  Status:
                </Text>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    article.status === 'PUBLISHED'
                      ? 'bg-ok/10 text-ok dark:bg-ok/20 dark:text-ok'
                      : article.status === 'DRAFT'
                        ? 'bg-sup-2 text-texto dark:bg-gray-900/20 dark:text-texto-fraco'
                        : 'bg-atencao/10 text-atencao dark:bg-atencao/20 dark:text-atencao'
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
            <Stack
              gap={3}
              className="mt-8 pt-6 border-t border-theme-secondary"
            >
              <h3 className="text-sm font-medium text-theme-tertiary">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Text
                    papel="legenda"
                    tom="ouro"
                    key={tag}
                    className="px-3 py-1 bg-ouro/10 rounded-full font-medium"
                  >
                    #{tag}
                  </Text>
                ))}
              </div>
            </Stack>
          )}

          {/* Keywords (SEO) */}
          {article.keywords && article.keywords.length > 0 && (
            <Stack gap={3} className="mt-6">
              <h3 className="text-sm font-medium text-theme-tertiary">
                Keywords (SEO):
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword: string) => (
                  <Text
                    papel="legenda"
                    tom="suave"
                    key={keyword}
                    className="px-3 py-1 bg-sup-2 dark:bg-gray-800 rounded-full"
                  >
                    {keyword}
                  </Text>
                ))}
              </div>
            </Stack>
          )}

          {/* SEO Info */}
          {(article.metaTitle || article.metaDescription) && (
            <div className="mt-8 p-4 bg-aviso/10 dark:bg-aviso/20 border border-aviso/30 dark:border-aviso rounded-lg">
              <h3 className="text-sm font-medium text-aviso dark:text-aviso mb-2">
                Informações de SEO:
              </h3>
              {article.metaTitle && (
                <div className="mb-2">
                  <span className="text-xs text-aviso dark:text-aviso">
                    Meta Título:
                  </span>
                  <p className="text-sm text-aviso dark:text-aviso">
                    {article.metaTitle}
                  </p>
                </div>
              )}
              {article.metaDescription && (
                <div>
                  <span className="text-xs text-aviso dark:text-aviso">
                    Meta Descrição:
                  </span>
                  <p className="text-sm text-aviso dark:text-aviso">
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
