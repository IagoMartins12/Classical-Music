// app/components/blog/CategoryCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    icon: string | null;
    color: string | null;
    _count: {
      articles: number;
    };
  };
  variant?: 'default' | 'compact' | 'featured';
}

export function CategoryCard({
  category,
  variant = 'default',
}: CategoryCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/blog/category/${category.slug}`}
        className="classical-card p-6 text-center group hover:scale-105 transition-all"
      >
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: category.color
              ? `${category.color}20`
              : 'var(--bg-elevated)',
          }}
        >
          {category.icon || '📚'}
        </div>
        <h3 className="font-semibold text-theme-primary mb-1 group-hover:text-brand-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-theme-tertiary">
          {category._count.articles} artigos
        </p>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/blog/category/${category.slug}`}
        className="classical-card overflow-hidden group hover:shadow-theme-large transition-all"
      >
        {/* Large Image */}
        <div className="relative h-64 overflow-hidden">
          {category.image ? (
            <>
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-7xl"
              style={{
                background: category.color
                  ? `linear-gradient(135deg, ${category.color}50, ${category.color}90)`
                  : 'var(--gradient-hero)',
              }}
            >
              {category.icon || '📚'}
            </div>
          )}

          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg backdrop-blur-sm"
              style={{
                background: category.color
                  ? `${category.color}60`
                  : 'rgba(212, 175, 55, 0.6)',
                border: `2px solid ${category.color || '#d4af37'}`,
              }}
            >
              {category.icon || '📚'}
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {category.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm font-medium">
                  {category._count.articles} artigos
                </span>
                <FiArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/blog/category/${category.slug}`}
      className="classical-card overflow-hidden group hover:shadow-theme-large transition-all"
    >
      {/* Image Header */}
      <div className="relative h-40 overflow-hidden">
        {category.image ? (
          <>
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-5xl"
            style={{
              background: category.color
                ? `linear-gradient(135deg, ${category.color}50, ${category.color}90)`
                : 'var(--gradient-hero)',
            }}
          >
            {category.icon || '📚'}
          </div>
        )}

        {/* Icon Badge */}
        <div className="absolute top-4 left-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm"
            style={{
              background: category.color
                ? `${category.color}60`
                : 'rgba(212, 175, 55, 0.6)',
              border: `2px solid ${category.color || '#d4af37'}`,
            }}
          >
            {category.icon || '📚'}
          </div>
        </div>

        {/* Article Count */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900">
            {category._count.articles}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors line-clamp-1">
          {category.name}
        </h3>

        {category.description && (
          <p className="text-sm text-theme-secondary mb-3 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* CTA */}
        <div className="flex items-center text-brand-primary text-sm font-medium group-hover:translate-x-2 transition-transform">
          <span className="mr-1">Explorar</span>
          <FiArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
