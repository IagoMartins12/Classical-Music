// app/components/ComposersClient/ComposerArticlesSection.tsx
'use client';

import Link from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { PiArrowRight, PiBookOpen, PiClock, PiUser } from 'react-icons/pi';
import { AnimatedCard, AnimatedItem } from '../animation/AnimatedComponents';
import type { BlogArticlePreview } from '@/app/requests/blog/composer-articles';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface ComposerArticlesSectionProps {
  articles: BlogArticlePreview[];
  totalCount: number;
  composerName: string;
}

export default function ComposerArticlesSection({
  articles,
  totalCount,
  composerName,
}: ComposerArticlesSectionProps) {
  const { t } = useTranslation({ sections: ['pages/composerId'] });

  if (articles.length === 0) return null;

  const hasMoreArticles = totalCount > 5;

  return (
    <AnimatedCard hover="lift" className="classical-card p-8">
      {/* Header */}
      <AnimatedItem direction="left" springType="smooth">
        <div className="flex items-center justify-between mb-6">
          <Inline gap={3}>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl flex items-center justify-center">
              <PiBookOpen className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                {t('articles_about_composer_title')}
              </h2>
              <p className="text-theme-secondary classical-subtitle">
                {t('articles_subtitle')} {composerName}
              </p>
            </div>
          </Inline>

          {totalCount > 0 && (
            <Text papel="rotulo" tom="fraco" as="div">
              {totalCount} {totalCount === 1 ? t('article') : t('articles')}
            </Text>
          )}
        </div>
      </AnimatedItem>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {articles.map((article, index) => (
          <AnimatedItem
            key={article.id}
            direction="up"
            springType="bouncy"
            delay={index * 0.1}
          >
            <Link href={`/blog/${article.slug}`}>
              <div className="group h-full bg-gradient-card border border-theme-primary rounded-xl overflow-hidden hover:shadow-theme-glow transition-all duration-300 hover:-translate-y-1">
                {/* Cover Image */}
                {article.coverImage ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-background via-transparent to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center">
                    <PiBookOpen className="w-12 h-12 text-theme-tertiary opacity-50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-theme-primary line-clamp-2 group-hover:text-brand-primary transition-colors duration-300">
                    {article.title}
                  </h3>

                  {/* {article.excerpt && (
                    <p className="text-sm text-theme-secondary line-clamp-2">
                      {article.excerpt}
                    </p>
                  )} */}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-theme-primary">
                    <Inline gap={4} className="text-xs text-theme-tertiary">
                      {article.readTime && (
                        <Inline gap={1}>
                          <PiClock className="w-3 h-3" />
                          <span>{article.readTime} min</span>
                        </Inline>
                      )}

                      {article.authorName && (
                        <Inline gap={1}>
                          <PiUser className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">
                            {article.authorName}
                          </span>
                        </Inline>
                      )}
                    </Inline>

                    <PiArrowRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          </AnimatedItem>
        ))}
      </div>

      {/* CTA Button */}
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex justify-center">
          {hasMoreArticles ? (
            <Link
              href={`/blog/search?q=${encodeURIComponent(composerName)}`}
              className="btn-classical-primary flex items-center space-x-2 group/btn"
            >
              <PiBookOpen className="w-4 h-4" />
              <span>{t('see_more_articles_about_composer')}</span>
              <PiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/blog"
              className="btn-classical-secondary flex items-center space-x-2 group/btn"
            >
              <PiBookOpen className="w-4 h-4" />
              <span>{t('see_more_articles_blog')}</span>
              <PiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          )}
        </div>
      </AnimatedItem>
    </AnimatedCard>
  );
}
