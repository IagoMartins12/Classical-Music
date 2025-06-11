// app/components/Lists/ListComposers.tsx - Updated with sophisticated design and theme system
'use client';

import React, { useState } from 'react';
import { FiChevronDown, FiUsers } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import ListComposersCards from '../Cards/ListComposersCard';
import { composerHomeProps } from '../../PopularComposers';
import { useNavigate } from '@/app/hooks/useNavigate';

interface listComposersProps {
  composers: composerHomeProps[];
}

const ListComposers: React.FC<listComposersProps> = ({ composers }) => {
  const [activeComposerId, setActiveComposerId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12); // Começar com 12 para melhor grid
  const [isLoading, setIsLoading] = useState(false);

  const { navigateToUrl } = useNavigate();

  const handleLoadMore = async () => {
    setIsLoading(true);
    // Simular loading para melhor UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    setVisibleCount((prev) => prev + 12);
    setIsLoading(false);
  };

  const visibleComposers = composers.slice(0, visibleCount);

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
                  Carregando...
                </>
              ) : (
                <>
                  <FiChevronDown className="w-5 h-5 mr-2 inline" />
                  Carregar Mais Compositores
                </>
              )}
            </button>

            {/* Progress info */}
            <p className="text-theme-tertiary text-sm">
              Mais {composers.length - visibleCount} compositores disponíveis
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Completion message */}
            <div className="classical-card p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-brand-primary rounded-full flex items-center justify-center shadow-theme-glow">
                  <GiMusicalNotes className="w-6 h-6 text-theme-inverse" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-theme-primary classical-title mb-2">
                Todos os Compositores Exibidos!
              </h4>
              <p className="text-theme-secondary text-sm mb-4">
                Você explorou todos os {composers.length} compositores desta
                coleção.
              </p>
            </div>

            {/* See All Button */}
            <button
              onClick={() => navigateToUrl('composers')}
              className="btn-classical-secondary text-lg px-8 py-4 hover:scale-105 active:scale-95"
            >
              <FiUsers className="w-5 h-5 mr-2 inline" />
              Ver Todos os Compositores
            </button>
          </div>
        )}
      </div>

      {/* Floating stats indicator */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden">
        <div className="bg-theme-elevated/90 backdrop-blur-md border border-theme-primary rounded-full px-4 py-2 shadow-theme-glow">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-theme-secondary font-medium">
              {visibleComposers.length}/{composers.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListComposers;
