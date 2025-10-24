import Image from 'next/image';
import Link from 'next/link';
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';

interface ArticleHeaderProps {
  article: {
    title: string;
    coverImage: string | null;
    coverImageAlt: string | null;
    coverImageCredit: string | null;
    publishedAt: Date | null;
    readTime: number | null;
    viewCount: number;
    author: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      username: string | null;
    };
    categories: Array<{
      category: {
        name: string;
        slug: string;
        color: string | null;
      };
    }>;
    tags: Array<{
      tag: {
        name: string;
        slug: string;
        color: string | null;
      };
    }>;
  };
  isAdmin?: boolean;
}

export function ArticleHeader({ article, isAdmin }: ArticleHeaderProps) {
  const authorName = `${article.author.firstName || ''} ${
    article.author.lastName || ''
  }`.trim();

  return (
    <header className="section-wrap  !pb-0">
      {/* <div className="max-w-4xl mx-auto"> */}
      <div className=" mx-auto max-w-4xl ">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-theme-primary mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-theme-secondary">
          {/* Author */}
          <Link
            href={`/autor/${
              article.author.username || article.author.firstName
            }`}
            className="flex items-center space-x-3 hover:text-brand-primary transition-colors"
          >
            {article.author.image ? (
              <Image
                src={article.author.image}
                alt={authorName}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-theme-classical flex items-center justify-center">
                <FaUser className="w-6 h-6 text-brand-primary" />
              </div>
            )}
            <div>
              <div className="font-medium text-theme-primary">
                {authorName || 'Anônimo'}
              </div>
              <div className="text-sm text-theme-tertiary">Autor</div>
            </div>
          </Link>

          {/* Date */}
          {article.publishedAt && (
            <div className="flex items-center space-x-2">
              <FaCalendar className="w-5 h-5" />
              <span>
                {new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Read Time */}
          <div className="flex items-center space-x-2">
            <FaClock className="w-5 h-5" />
            <span>{article.readTime} min de leitura</span>
          </div>

          {/* Views */}
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <span>👁️</span>
              <span>{article.viewCount.toLocaleString()} visualizações</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <Link
                key={tag.tag.slug}
                href={`/blog/tag/${tag.tag.slug}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-theme-elevated hover:bg-theme-classical transition-all"
                style={{
                  color: tag.tag.color || 'var(--text-secondary)',
                }}
              >
                #{tag.tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative rounded-2xl overflow-hidden shadow-theme-large mb-8">
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
              <Image
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {article.coverImageCredit && (
              <div className="absolute bottom-0 right-0 px-4 py-2 bg-black/60 backdrop-blur-sm text-white text-xs rounded-tl-lg">
                📷 {article.coverImageCredit}
              </div>
            )}
          </div>
        )}

        {/* Share Buttons (Desktop) */}
        {/* <div className="hidden md:flex justify-center">
          <ShareButtons />
        </div> */}
      </div>
    </header>
  );
}
