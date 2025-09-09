// components/animation/AnimatedComponents.tsx - Versão otimizada sem re-renders
'use client';

import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  createContainerVariants,
  createItemVariants,
  hoverVariants,
  skeletonPulse,
  skeletonShimmer,
} from '@/app/libs/animation-variants';

// Tipos base
type AnimationSpeed = 'fast' | 'normal' | 'slow';
type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'scale';
type SpringType = 'smooth' | 'bouncy' | 'gentle';
type HoverEffect = 'scale' | 'lift' | 'glow' | 'none';

interface BaseAnimationProps {
  delay?: number;
  speed?: AnimationSpeed;
  className?: string;
  children: React.ReactNode;
}

// =================================
// CONTAINER COMPONENTS
// =================================

interface AnimatedContainerProps extends BaseAnimationProps {
  staggerSpeed?: AnimationSpeed;
}

export const AnimatedContainer = React.memo<AnimatedContainerProps>(
  ({ children, delay = 0.1, staggerSpeed = 'normal', className = '' }) => {
    // ✅ Memoriza variants para evitar re-criação
    const variants = useMemo(
      () => createContainerVariants(staggerSpeed, delay),
      [staggerSpeed, delay]
    );

    return (
      <motion.div
        className={className}
        variants={variants}
        initial="hidden"
        animate="visible"
        // ✅ Evita re-animação em re-renders
        key={`container-${staggerSpeed}-${delay}`}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedContainer.displayName = 'AnimatedContainer';

// =================================
// ITEM COMPONENTS
// =================================

interface AnimatedItemProps extends BaseAnimationProps {
  direction?: AnimationDirection;
  springType?: SpringType;
  hover?: HoverEffect;
  onClick?: () => void;
  style?: React.CSSProperties;
  component?: 'tr' | 'div';
}

export const AnimatedItem = React.memo<AnimatedItemProps>(
  ({
    children,
    direction = 'up',
    springType = 'smooth',
    hover = 'none',
    className = '',
    component,
    onClick,
    style,
  }) => {
    // ✅ Memoriza variants
    const variants = useMemo(
      () => createItemVariants(direction, springType),
      [direction, springType]
    );

    // ✅ Memoriza hover config
    const hoverConfig = useMemo(
      () =>
        hover !== 'none' && hoverVariants[hover] ? hoverVariants[hover] : {},
      [hover]
    );

    // ✅ Memoriza click handler
    const handleClick = useCallback(() => {
      if (onClick) onClick();
    }, [onClick]);

    const baseProps = {
      className,
      variants,
      onClick: handleClick,
      style,
      whileHover: hoverConfig.hover,
      whileTap: hoverConfig.tap,
      // ✅ Key estável para evitar re-mount
      key: `item-${direction}-${springType}-${hover}`,
    };

    if (component === 'tr') {
      return <motion.tr {...baseProps}>{children}</motion.tr>;
    }

    return <motion.div {...baseProps}>{children}</motion.div>;
  }
);

AnimatedItem.displayName = 'AnimatedItem';

// =================================
// SPECIALIZED COMPONENTS
// =================================

interface AnimatedCardProps extends BaseAnimationProps {
  hover?: HoverEffect;
  clickable?: boolean;
  onClick?: () => void;
}

export const AnimatedCard = React.memo<AnimatedCardProps>(
  ({
    children,
    hover = 'lift',
    clickable = false,
    className = '',
    onClick,
  }) => {
    const variants = useMemo(() => createItemVariants('scale', 'bouncy'), []);

    const hoverConfig = useMemo(() => hoverVariants[hover] || {}, [hover]);

    const handleClick = useCallback(() => {
      if (onClick) onClick();
    }, [onClick]);

    const cursorClass = clickable || onClick ? 'cursor-pointer' : '';

    return (
      <motion.div
        className={`${className} ${cursorClass}`}
        variants={variants}
        onClick={handleClick}
        whileHover={hoverConfig.hover}
        whileTap={clickable ? hoverConfig.tap : undefined}
        key={`card-${hover}-${clickable}`}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// =================================
// SKELETON COMPONENTS
// =================================

interface SkeletonItemProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  shimmer?: boolean;
  pulse?: boolean;
  className?: string;
}

export const SkeletonItem = React.memo<SkeletonItemProps>(
  ({
    width = 'w-full',
    height = 'h-4',
    rounded = true,
    shimmer = true,
    pulse = false,
    className = '',
  }) => {
    const baseClass = useMemo(
      () => `${width} ${height} ${rounded ? 'rounded' : ''} bg-theme-elevated`,
      [width, height, rounded]
    );

    const variants = useMemo(
      () => (shimmer ? skeletonShimmer : pulse ? skeletonPulse : undefined),
      [shimmer, pulse]
    );

    const shimmerStyle = useMemo(
      () =>
        shimmer
          ? {
              background:
                'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)',
              backgroundSize: '200% 100%',
            }
          : {},
      [shimmer]
    );

    return (
      <motion.div
        className={`${baseClass} ${className}`}
        variants={variants}
        initial="hidden"
        animate="visible"
        style={shimmerStyle}
        key={`skeleton-${width}-${height}-${shimmer}-${pulse}`}
      />
    );
  }
);

SkeletonItem.displayName = 'SkeletonItem';

interface SkeletonCardProps {
  lines?: number;
  showIcon?: boolean;
  showButton?: boolean;
  className?: string;
}

export const SkeletonCard = React.memo<SkeletonCardProps>(
  ({ lines = 3, showIcon = true, showButton = false, className = '' }) => {
    return (
      <AnimatedCard className={`classical-card p-6 ${className}`} hover="none">
        {showIcon && (
          <div className="flex items-center space-x-3 mb-4">
            <SkeletonItem width="w-12" height="h-12" />
            <div className="flex-1 space-y-2">
              <SkeletonItem width="w-3/4" height="h-5" />
              <SkeletonItem width="w-1/2" height="h-3" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonItem
              key={i}
              width={i === lines - 1 ? 'w-2/3' : 'w-full'}
              height="h-4"
            />
          ))}
        </div>

        {showButton && (
          <div className="mt-4 pt-4 border-t border-theme-secondary">
            <SkeletonItem width="w-32" height="h-10" />
          </div>
        )}
      </AnimatedCard>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

// =================================
// LAYOUT COMPONENTS
// =================================

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  showBackground?: boolean;
}

export const PageContainer = React.memo<PageContainerProps>(
  ({ children, className = '', showBackground = true }) => {
    return (
      <div
        className={`${showBackground ? 'bg-gradient-primary' : ''} ${className}`}
      >
        {showBackground && (
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <motion.div
              className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              key="bg-orb-1"
            />
            <motion.div
              className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
              key="bg-orb-2"
            />
          </div>
        )}

        <div className="section-wrap space-y-8 relative z-10">{children}</div>
      </div>
    );
  }
);

PageContainer.displayName = 'PageContainer';

// =================================
// UTILITY COMPONENTS
// =================================

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FloatingElement = React.memo<FloatingElementProps>(
  ({ children, className = '', delay = 0 }) => {
    return (
      <motion.div
        className={`absolute pointer-events-none ${className}`}
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
        key={`floating-${delay}`}
      >
        {children}
      </motion.div>
    );
  }
);

FloatingElement.displayName = 'FloatingElement';

// =================================
// LOADING SPECIFIC
// =================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  classname?: string;
}

export const LoadingSpinner = React.memo<LoadingSpinnerProps>(
  ({ size = 'md', color = 'border-brand-primary', classname }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };

    return (
      <motion.div
        className={`${sizeClasses[size]} border-4 ${classname} ${color} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        key={`spinner-${size}-${color}`}
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// =================================
// GRID COM ANIMAÇÃO SEQUENCIAL
// =================================

interface SequentialGridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  delayBetweenItems?: number;
  className?: string;
  classNameSub?: string;
}

export const SequentialGrid = React.memo<SequentialGridProps>(
  ({
    children,
    cols = 4,
    gap = 6,
    delayBetweenItems = 0.1,
    className = '',
    classNameSub,
  }) => {
    const getGridCols = useCallback(() => {
      switch (cols) {
        case 1:
          return 'grid-cols-1';
        case 2:
          return 'grid-cols-1 md:grid-cols-2';
        case 3:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        case 4:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        case 5:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
        default:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      }
    }, [cols]);

    const gridCols = useMemo(() => getGridCols(), [getGridCols]);

    return (
      <div className={`grid gap-${gap} ${gridCols} ${className}`}>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={`grid-item-${index}`} // ✅ Key estável
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * delayBetweenItems,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 },
            }}
            className={classNameSub}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }
);

SequentialGrid.displayName = 'SequentialGrid';
