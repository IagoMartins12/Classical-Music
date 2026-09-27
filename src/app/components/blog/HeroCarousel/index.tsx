'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import { PiCaretLeft, PiCaretRight, PiClock, PiUser } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';

interface Article {
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
    };
  }>;
}

export function HeroCarousel({ articles }: { articles: Article[] }) {
  // ✅ USAR MONTAGEM CONTROLADA PARA EVITAR HIDRATAÇÃO
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ✅ GARANTIR QUE ESTÁ MONTADO NO CLIENTE
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAutoPlaying || articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted, isAutoPlaying, articles.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  // ✅ RENDERIZAR VERSÃO ESTÁTICA ATÉ MONTAR
  if (!mounted) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-theme-large h-[500px] md:h-[600px] bg-theme-elevated animate-pulse">
        <div className="absolute inset-0" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="classical-card p-12 text-center">
        <p className="text-theme-secondary">
          Nenhum artigo em destaque no momento
        </p>
      </div>
    );
  }

  const currentArticle = articles[currentIndex];
  const authorName = `${currentArticle.author.firstName || ''} ${
    currentArticle.author.lastName || ''
  }`.trim();

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-theme-large h-full">
      {/* Main Slide */}
      <div className="relative h-[500px] md:h-[600px]">
        {/* Background Image */}
        {currentArticle.coverImage ? (
          <Image
            src={currentArticle.coverImage}
            alt={currentArticle.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="section-wrap w-full pb-12">
            <div className="max-w-3xl">
              {/* Category */}
              {currentArticle.categories[0] && (
                <Link
                  href={`/blog/category/${currentArticle.categories[0].category.slug}`}
                  className="inline-block px-4 py-2 rounded-lg mb-4 text-sm font-medium backdrop-blur-sm bg-sup-2"
                  style={{
                    background: currentArticle.categories[0].category.color
                      ? `${currentArticle.categories[0].category.color}40`
                      : 'rgba(212, 175, 55, 0.2)',
                    borderColor: currentArticle.categories[0].category.color
                      ? currentArticle.categories[0].category.color
                      : 'var(--brand-primary)',
                    color: 'white',
                  }}
                >
                  {currentArticle.categories[0].category.name}
                </Link>
              )}

              {/* Title */}
              <Link href={`/blog/${currentArticle.slug}`}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 transition-colors line-clamp-2">
                  {currentArticle.title}
                </h2>
              </Link>

              {/* Description */}
              {currentArticle.description && (
                <p className="text-lg text-gray-200 mb-6 line-clamp-2">
                  {currentArticle.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                {authorName && (
                  <Inline gap={2}>
                    <PiUser className="w-4 h-4" />
                    <span>{authorName}</span>
                  </Inline>
                )}
                <Inline gap={2}>
                  <PiClock className="w-4 h-4" />
                  <span>{currentArticle.readTime} min de leitura</span>
                </Inline>
                {currentArticle.publishedAt && (
                  <span>
                    {new Date(currentArticle.publishedAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                )}
              </div>

              {/* CTA */}
              <Link
                href={`/blog/${currentArticle.slug}`}
                className="inline-block mt-6 btn-classical-primary"
              >
                Ler artigo completo
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {articles.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
              aria-label="Anterior"
            >
              <PiCaretLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
              aria-label="Próximo"
            >
              <PiCaretRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {articles.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center">
          {articles.map((_, index) => (
            // O alvo é o botão de 24px; o ponto de 8px é só o desenho dentro
            // dele. Com o ponto como botão, o alvo era de 8×8px, abaixo do
            // mínimo da WCAG 2.2 (24px) e difícil de acertar no telefone.
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group flex h-6 min-w-6 items-center justify-center"
              aria-label={`Ir para slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            >
              <span
                aria-hidden="true"
                className={`transition-all ${
                  index === currentIndex
                    ? 'w-8 h-2'
                    : 'w-2 h-2 bg-white/50 group-hover:bg-white/80'
                } rounded-full`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
