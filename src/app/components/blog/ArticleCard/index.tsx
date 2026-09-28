import { nomeDeArtigo } from '@/app/components/ui/nomeDeArtigo';
// app/components/blog/ArticleCard.tsx
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import { PiChatDots, PiClock, PiHeart, PiUser } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null; // ✅ Vai usar image no futuro
    readTime?: number | null;
    publishedAt: Date | null;
    author: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
    };
    categories: Array<{
      category: {
        name: string;
        slug: string;
        color: string | null;
        icon?: string | null;
      };
    }>;
    _count: {
      comments: number;
      likes: number;
    };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const authorName = `${article.author.firstName || ''} ${
    article.author.lastName || ''
  }`.trim();

  return (
    <article
      data-vira={nomeDeArtigo(article.slug)}
      className="classical-card overflow-hidden group h-full flex flex-col transition-all"
    >
      {/* Image */}
      <Link
        href={`/blog/${article.slug}`}
        aria-label={article.title}
        className="block relative h-48 overflow-hidden"
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl"></div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category */}
        {article.categories[0] && (
          <Link
            href={`/blog/category/${article.categories[0].category.slug}`}
            className="inline-flex items-center space-x-1 w-fit px-3 py-1 rounded-lg mb-3 text-xs font-medium hover:opacity-80 transition-opacity"
            style={{
              background: article.categories[0].category.color
                ? `${article.categories[0].category.color}20`
                : 'var(--interactive-hover)',
              color:
                article.categories[0].category.color || 'var(--brand-primary)',
            }}
          >
            {article.categories[0].category.icon && (
              <span>{article.categories[0].category.icon}</span>
            )}
            <span>{article.categories[0].category.name}</span>
          </Link>
        )}

        {/* Title */}
        <Link href={`/blog/${article.slug}`}>
          <h3 className="text-xl font-bold text-theme-primary mb-2 line-clamp-2 transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* Description */}
        {article.description && (
          <Text
            papel="rotulo"
            tom="suave"
            as="p"
            className="mb-4 line-clamp-3 flex-1"
          >
            {article.description}
          </Text>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-theme-secondary mt-auto">
          {/* Author */}
          <Inline gap={2}>
            {article.author.image ? (
              <Image
                src={article.author.image}
                alt={authorName}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-theme-classical flex items-center justify-center">
                <PiUser className="w-3 h-3 text-ouro-texto" />
              </div>
            )}
            <Text papel="legenda" tom="fraco">
              {authorName || 'Anônimo'}
            </Text>
          </Inline>

          {/* Stats */}
          <Inline gap={3} className="text-xs text-theme-tertiary">
            <Inline gap={1}>
              <PiClock className="w-3 h-3" />
              <span>{article?.readTime ?? 0}min</span>
            </Inline>
            <Inline gap={1}>
              <PiHeart className="w-3 h-3" />
              <span>{article._count.likes}</span>
            </Inline>
            <Inline gap={1}>
              <PiChatDots className="w-3 h-3" />
              <span>{article._count.comments}</span>
            </Inline>
          </Inline>
        </div>
      </div>
    </article>
  );
}
