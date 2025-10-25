// app/components/blog/ArticleCarousel.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { ArticleCard } from '@/app/components/blog/ArticleCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
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
}

interface ArticleCarouselProps {
  articles: Article[];
}

export function ArticleCarousel({ articles }: ArticleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Atualiza cards por view baseado no tamanho da tela
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1); // mobile
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2); // tablet
      } else if (window.innerWidth < 1280) {
        setCardsPerView(3); // desktop small
      } else {
        setCardsPerView(4); // desktop large
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Verifica se pode scrollar
  const checkScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [articles]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const cardWidth = container.offsetWidth / cardsPerView;
    const scrollAmount = cardWidth * cardsPerView;

    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });

    // Atualiza índice atual
    const newIndex =
      direction === 'left'
        ? Math.max(0, currentIndex - cardsPerView)
        : Math.min(articles.length - cardsPerView, currentIndex + cardsPerView);
    setCurrentIndex(newIndex);
  };

  const totalDots = Math.ceil(articles.length / cardsPerView);

  if (articles.length === 0) {
    return (
      <div className="classical-card p-8 text-center">
        <p className="text-theme-secondary">Em breve novos artigos 🎵</p>
      </div>
    );
  }

  return (
    <div className="relative ">
      {/* Botão Esquerda */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-theme-secondary/90 hover:bg-theme-secondary backdrop-blur-sm rounded-full flex items-center justify-center text-theme-primary shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1/2"
          aria-label="Anterior"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Container do Carrossel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-2 snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex-shrink-0 snap-start"
            style={{
              width: `calc((100% - ${(cardsPerView - 1) * 24}px) / ${cardsPerView})`,
            }}
          >
            <ArticleCard article={article} />
          </div>
        ))}
      </div>

      {/* Botão Direita */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-theme-secondary/90 hover:bg-theme-secondary backdrop-blur-sm rounded-full flex items-center justify-center text-theme-primary shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1/2"
          aria-label="Próximo"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Indicadores de Progresso */}
      {totalDots > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalDots }).map((_, index) => {
            const isActive = Math.floor(currentIndex / cardsPerView) === index;
            return (
              <button
                key={index}
                onClick={() => {
                  if (scrollRef.current) {
                    const container = scrollRef.current;
                    const cardWidth = container.offsetWidth / cardsPerView;
                    container.scrollTo({
                      left: cardWidth * cardsPerView * index,
                      behavior: 'smooth',
                    });
                    setCurrentIndex(index * cardsPerView);
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-8 bg-brand-primary'
                    : 'w-1.5 bg-theme-tertiary hover:bg-theme-secondary'
                }`}
                aria-label={`Ir para página ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
