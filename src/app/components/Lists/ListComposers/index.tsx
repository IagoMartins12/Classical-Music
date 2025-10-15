// app/components/Lists/ListComposers.tsx - Updated with sophisticated design and theme system
'use client';

import React, { useState } from 'react';
import { FiChevronDown, FiUsers } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import ListComposersCards from '../Cards/ListComposersCard';
import { composerHomeProps } from '../../PopularComposers';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useTranslation } from '@/app/context/TranslationContext';
import { useIsMobile } from '@/app/hooks/useMobile';

interface listComposersProps {
  composers: composerHomeProps[];
}

const ListComposers: React.FC<listComposersProps> = ({ composers }) => {
  const [activeComposerId, setActiveComposerId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12); // Começar com 12 para melhor grid
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation({ sections: ['pages/home'] });

  const { navigateToUrl } = useNavigate();

  const handleLoadMore = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setVisibleCount((prev) => prev + 12);
    setIsLoading(false);
  };

  const visibleComposers = composers.slice(0, visibleCount);

  const isMobile = useIsMobile();
  return (
    <div className="relative">
      {/* Header stats */}

      {/* Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {visibleComposers.map((composer, index) => (
          <div
            key={composer.id}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'backwards',
            }}
            onMouseEnter={() => setActiveComposerId(composer.id)}
            onMouseLeave={() => setActiveComposerId(null)}
          >
            <ListComposersCards
              composer={composer}
              isActive={activeComposerId === composer.id}
              isMobile={isMobile}
            />
          </div>
        ))}

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 12 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="classical-card p-4 space-y-4">
                <div className="aspect-square loading-skeleton rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 loading-skeleton rounded"></div>
                  <div className="h-3 loading-skeleton rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Action Buttons Section */}
      <div className="mt-12 text-center">
        {visibleCount < composers.length ? (
          <div className="space-y-4">
            {/* Load More Button */}
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={`
                btn-classical-primary text-lg px-8 py-4 
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-105 active:scale-95
                shadow-theme-glow hover:shadow-brand-glow-lg
                ${isLoading ? 'animate-pulse' : ''}
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-theme-inverse border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                  {t('loading')}
                </>
              ) : (
                <>
                  <FiChevronDown className="w-5 h-5 mr-2 inline" />
                  {t('loading_more_composers')}
                </>
              )}
            </button>

            {/* Progress info */}
            <p className="text-theme-tertiary text-sm">
              {t('more')} {composers.length - visibleCount}{' '}
              {t('composers_avaliable')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Completion message */}
            <div className="classical-card p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-brand-primary rounded-full flex items-center justify-center shadow-theme-glow">
                  <GiMusicalNotes className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-theme-primary classical-title mb-2">
                {t('all_composers_show')}
              </h4>
              <p className="text-theme-secondary text-sm mb-4">
                {t('composers_explored')} {composers.length}{' '}
                {t('collection_composers')}
              </p>
            </div>

            {/* See All Button */}
            <button
              onClick={() => navigateToUrl('composers')}
              className="btn-classical-secondary text-lg px-8 py-4 hover:scale-105 active:scale-95"
            >
              <FiUsers className="w-5 h-5 mr-2 inline" />

              {t('see_all_composers')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListComposers;
