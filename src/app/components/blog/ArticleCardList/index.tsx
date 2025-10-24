// app/components/blog/ArticleCardList.tsx
import Link from 'next/link';
import Image from 'next/image';
import {
  FaClock,
  FaCommentDots,
  FaHeart,
  FaUser,
  FaCalendar,
} from 'react-icons/fa';

interface ArticleCardListProps {
  article: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    readTime: number | null;
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

export function ArticleCardList({ article }: ArticleCardListProps) {
  const authorName = `${article.author.firstName || ''} ${
    article.author.lastName || ''
  }`.trim();

  return (
    <article className="classical-card overflow-hidden group hover:shadow-theme-large transition-all">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <Link
          href={`/blog/${article.slug}`}
          className="relative h-48 md:h-auto md:w-80 flex-shrink-0 overflow-hidden"
        >
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-hero flex items-center justify-center text-6xl">
              🎼
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Categories */}
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.category.slug}
                  href={`/blog/category/${cat.category.slug}`}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{
                    background: cat.category.color
                      ? `${cat.category.color}20`
                      : 'var(--interactive-hover)',
                    color: cat.category.color || 'var(--brand-primary)',
                  }}
                >
                  {cat.category.icon && <span>{cat.category.icon}</span>}
                  <span>{cat.category.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <Link href={`/blog/${article.slug}`} className="mb-3">
            <h3 className="text-2xl font-bold text-theme-primary line-clamp-2 group-hover:text-brand-primary transition-colors">
              {article.title}
            </h3>
          </Link>

          {/* Description */}
          {article.description && (
            <p className="text-theme-secondary mb-4 line-clamp-3 flex-1">
              {article.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-theme-secondary">
            {/* Author */}
            <div className="flex items-center space-x-2">
              {article.author.image ? (
                <Image
                  src={article.author.image}
                  alt={authorName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-theme-classical flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-brand-primary" />
                </div>
              )}
              <span className="text-sm text-theme-secondary font-medium">
                {authorName || 'Anônimo'}
              </span>
            </div>

            {/* Date */}
            {article.publishedAt && (
              <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                <FaCalendar className="w-3 h-3" />
                <span>
                  {new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-theme-tertiary ml-auto">
              <div className="flex items-center space-x-1">
                <FaClock className="w-4 h-4" />
                <span>{article.readTime}min</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaHeart className="w-4 h-4" />
                <span>{article._count.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaCommentDots className="w-4 h-4" />
                <span>{article._count.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
