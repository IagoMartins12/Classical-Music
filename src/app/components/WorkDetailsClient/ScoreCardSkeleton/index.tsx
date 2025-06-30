// components/ScoreCardSkeleton.tsx - Skeleton para ScoreCard
import React from 'react';

interface ScoreCardSkeletonProps {
  showThumbnail?: boolean;
  className?: string;
}

const ScoreCardSkeleton = ({
  showThumbnail = true,
  className = '',
}: ScoreCardSkeletonProps) => {
  return (
    <div className={`classical-card-simple animate-pulse ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
        {/* Thumbnail Skeleton */}
        {showThumbnail && (
          <div className="w-24 h-32 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-xl border-2 border-theme-primary/20"></div>
          </div>
        )}

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              {/* Title Skeleton */}
              <div className="h-5 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg mb-2 w-3/4"></div>

              {/* Subtitle Skeleton */}
              <div className="h-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg mb-3 w-1/2"></div>
            </div>

            {/* Download Button Skeleton */}
            <div className="flex-shrink-0">
              <div className="w-24 h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-xl"></div>
            </div>
          </div>

          {/* Details Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Info Items Skeleton */}
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Icon Skeleton */}
                <div className="w-5 h-5 bg-theme-elevated rounded-lg"></div>
                {/* Text Skeleton */}
                <div className="h-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Additional Info Skeleton (for thumbnails) */}
          {showThumbnail && (
            <div className="mt-4 pt-4 border-t border-theme-secondary/30">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-theme-elevated rounded w-12"></div>
                  <div className="h-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded w-32"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-theme-elevated rounded w-14"></div>
                  <div className="h-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded w-40"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl pointer-events-none"></div>
    </div>
  );
};

// Componente para mostrar múltiplos skeletons
interface ScoreLoadingSkeletonsProps {
  count?: number;
  showThumbnails?: boolean;
  className?: string;
}

export const ScoreLoadingSkeletons = ({
  count = 3,
  showThumbnails = true,
  className = '',
}: ScoreLoadingSkeletonsProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ScoreCardSkeleton
          key={index}
          showThumbnail={showThumbnails && (index === count - 1 || count === 1)}
          className="animate-fade-in-up"
        />
      ))}
    </div>
  );
};

// Componente de loading com barra de progresso
interface ScoreLoadingWithProgressProps {
  title?: string;
  subtitle?: string;
  progress?: number;
  showSkeletons?: boolean;
  skeletonCount?: number;
  className?: string;
}

export const ScoreLoadingWithProgress = ({
  title = 'Carregando partituras',
  subtitle = 'Buscando recursos disponíveis...',
  progress = 0,
  showSkeletons = true,
  skeletonCount = 3,
  className = '',
}: ScoreLoadingWithProgressProps) => {
  return (
    <div
      className={`classical-card overflow-hidden animate-fade-in-up ${className}`}
    >
      {/* Header */}
      <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
            <div className="relative">
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-6 h-6 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '1.5s',
                }}
              ></div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              {title}
            </h2>
            <p className="text-theme-secondary classical-subtitle">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-theme-tertiary">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-theme-elevated border border-theme-primary/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-primary to-brand-secondary h-full rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${Math.max(progress, 5)}%` }}
              >
                {/* Animated shimmer inside progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skeleton Content */}
      {showSkeletons && (
        <div className="p-8">
          <ScoreLoadingSkeletons count={skeletonCount} showThumbnails={true} />
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div
        className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
    </div>
  );
};

export default ScoreCardSkeleton;

// CSS adicional para efeito shimmer
const styles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// Inject styles (você pode mover isso para seu CSS global)
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
