// components/animation/AnimatedComponents.tsx - Versão otimizada sem re-renders
'use client';

import React, { useMemo, memo, useCallback } from 'react';
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

export const AnimatedContainer = memo<AnimatedContainerProps>(
  ({ children, delay = 0.1, staggerSpeed = 'normal', className = '' }) => {
    // Memoizar variantes para evitar recriação
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

export const AnimatedItem = memo<AnimatedItemProps>(
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
    // Memoizar variantes
    const variants = useMemo(
      () => createItemVariants(direction, springType),
      [direction, springType]
    );

    // Memoizar configuração do hover
    const hoverConfig = useMemo(
      () =>
        hover !== 'none' && hoverVariants[hover] ? hoverVariants[hover] : {},
      [hover]
    );

    const motionProps = useMemo(
      () => ({
        className,
        variants,
        onClick,
        style,
        whileHover: hoverConfig.hover,
        whileTap: hoverConfig.tap,
      }),
      [className, variants, onClick, style, hoverConfig]
    );

    if (component === 'tr') {
      return <motion.tr {...motionProps}>{children}</motion.tr>;
    }

    return <motion.div {...motionProps}>{children}</motion.div>;
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

export const AnimatedCard = memo<AnimatedCardProps>(
  ({
    children,
    hover = 'lift',
    clickable = false,
    className = '',
    onClick,
  }) => {
    const variants = useMemo(() => createItemVariants('scale', 'bouncy'), []);

    const hoverConfig = useMemo(() => hoverVariants[hover] || {}, [hover]);

    const cursorClass = useMemo(
      () => (clickable || onClick ? 'cursor-pointer' : ''),
      [clickable, onClick]
    );

    const motionProps = useMemo(
      () => ({
        className: `${className} ${cursorClass}`,
        variants,
        onClick: onClick ? onClick : undefined,
        whileHover: hoverConfig.hover,
        whileTap: clickable ? hoverConfig.tap : undefined,
      }),
      [className, cursorClass, variants, onClick, hoverConfig, clickable]
    );

    return <motion.div {...motionProps}>{children}</motion.div>;
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// =================================
// GRID COMPONENTS OPTIMIZADOS
// =================================

interface StaggerGridProps extends BaseAnimationProps {
  cols?: number;
  gap?: number;
  staggerSpeed?: AnimationSpeed;
}

export const StaggerGrid = memo<StaggerGridProps>(
  ({
    children,
    cols = 4,
    gap = 6,
    staggerSpeed = 'fast',
    delay = 0.1,
    className = '',
  }) => {
    const containerVariants = useMemo(
      () => createContainerVariants(staggerSpeed, delay),
      [staggerSpeed, delay]
    );

    const gridCols = useMemo(() => {
      switch (cols) {
        case 1:
          return 'grid-cols-1';
        case 2:
          return 'grid-cols-1 md:grid-cols-2';
        case 3:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        case 4:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        default:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      }
    }, [cols]);

    const gridClassName = useMemo(
      () => `grid gap-${gap} ${gridCols} ${className}`,
      [gap, gridCols, className]
    );

    return (
      <motion.div
        className={gridClassName}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    );
  }
);

StaggerGrid.displayName = 'StaggerGrid';

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

export const SkeletonItem = memo<SkeletonItemProps>(
  ({
    width = 'w-full',
    height = 'h-4',
    rounded = true,
    shimmer = true,
    pulse = false,
    className = '',
  }) => {
    const baseClass = useMemo(
      () =>
        `${width} ${height} ${rounded ? 'rounded' : ''} bg-theme-elevated ${className}`,
      [width, height, rounded, className]
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
        className={baseClass}
        variants={variants}
        initial="hidden"
        animate="visible"
        style={shimmerStyle}
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

export const SkeletonCard = memo<SkeletonCardProps>(
  ({ lines = 3, showIcon = true, showButton = false, className = '' }) => {
    const linesArray = useMemo(() => Array.from({ length: lines }), [lines]);

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
          {linesArray.map((_, i) => (
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

export const PageContainer = memo<PageContainerProps>(
  ({ children, className = '', showBackground = true }) => {
    const containerClassName = useMemo(
      () => `${showBackground ? 'bg-gradient-primary' : ''} ${className}`,
      [showBackground, className]
    );

    return (
      <div className={containerClassName}>
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

export const FloatingElement = memo<FloatingElementProps>(
  ({ children, className = '', delay = 0 }) => {
    const floatingClassName = useMemo(
      () => `absolute pointer-events-none ${className}`,
      [className]
    );

    const animationProps = useMemo(
      () => ({
        y: [0, -10, 0],
        opacity: [0.3, 0.7, 0.3],
        rotate: [0, 2, -2, 0],
      }),
      []
    );

    const transitionProps = useMemo(
      () => ({
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay,
      }),
      [delay]
    );

    return (
      <motion.div
        className={floatingClassName}
        animate={animationProps}
        transition={transitionProps}
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

export const LoadingSpinner = memo<LoadingSpinnerProps>(
  ({ size = 'md', color = 'border-brand-primary', classname = '' }) => {
    const sizeClasses = useMemo(
      () => ({
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
      }),
      []
    );

    const spinnerClassName = useMemo(
      () =>
        `${sizeClasses[size]} border-4 ${classname} ${color} border-t-transparent rounded-full`,
      [sizeClasses, size, classname, color]
    );

    const animationProps = useMemo(() => ({ rotate: 360 }), []);
    const transitionProps = useMemo(
      () => ({
        duration: 1,
        repeat: Infinity,
        ease: 'linear' as const,
      }),
      []
    );

    return (
      <motion.div
        className={spinnerClassName}
        animate={animationProps}
        transition={transitionProps}
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// =================================
// COMPOSTOS ESPECÍFICOS OTIMIZADOS
// =================================

interface ComposerCardAnimatedProps {
  children: React.ReactNode;
  onClick?: () => void;
  index?: number;
  className?: string;
  delayMultiplier?: number;
}

export const ComposerCardAnimated = memo<ComposerCardAnimatedProps>(
  ({ children, onClick, index = 0, className = '', delayMultiplier = 0.1 }) => {
    const motionClassName = useMemo(
      () => `cursor-pointer ${className}`,
      [className]
    );

    const initialProps = useMemo(() => ({ opacity: 0, y: 30 }), []);

    const animateProps = useMemo(() => ({ opacity: 1, y: 0 }), []);

    const transitionProps = useMemo(
      () => ({
        duration: 0.6,
        delay: index * delayMultiplier,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }),
      [index, delayMultiplier]
    );

    const hoverProps = useMemo(
      () => ({
        y: -5,
        transition: { duration: 0.2 },
      }),
      []
    );

    const tapProps = useMemo(() => ({ y: 0 }), []);

    return (
      <motion.div
        className={motionClassName}
        onClick={onClick}
        initial={initialProps}
        animate={animateProps}
        transition={transitionProps}
        whileHover={hoverProps}
        whileTap={tapProps}
      >
        {children}
      </motion.div>
    );
  }
);

ComposerCardAnimated.displayName = 'ComposerCardAnimated';

// =================================
// GRID COM ANIMAÇÃO SEQUENCIAL OTIMIZADO
// =================================

interface SequentialGridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  delayBetweenItems?: number;
  className?: string;
  classNameSub?: string;
}

export const SequentialGrid = memo<SequentialGridProps>(
  ({
    children,
    cols = 4,
    gap = 6,
    delayBetweenItems = 0.1,
    className = '',
    classNameSub = '',
  }) => {
    const gridCols = useMemo(() => {
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

    const gridClassName = useMemo(
      () => `grid gap-${gap} ${gridCols} ${className}`,
      [gap, gridCols, className]
    );

    // Estabilizar children com chave única
    const stableChildren = useMemo(
      () => React.Children.toArray(children),
      [children]
    );

    const initialProps = useMemo(() => ({ opacity: 0, y: 30 }), []);

    const animateProps = useMemo(() => ({ opacity: 1, y: 0 }), []);

    const hoverProps = useMemo(
      () => ({
        y: -5,
        transition: { duration: 0.2 },
      }),
      []
    );

    return (
      <div className={gridClassName}>
        {stableChildren.map((child, index) => {
          const key = `sequential-${index}`;
          const transitionProps = {
            duration: 0.6,
            delay: index * delayBetweenItems,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
          };

          return (
            <motion.div
              key={key}
              initial={initialProps}
              animate={animateProps}
              transition={transitionProps}
              whileHover={hoverProps}
              className={classNameSub}
            >
              {child}
            </motion.div>
          );
        })}
      </div>
    );
  }
);

SequentialGrid.displayName = 'SequentialGrid';

// =================================
// OUTROS COMPONENTES ÚTEIS OTIMIZADOS
// =================================

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FadeIn = memo<FadeInProps>(
  ({ children, className = '', delay = 0 }) => {
    const initialProps = useMemo(() => ({ opacity: 0 }), []);

    const animateProps = useMemo(() => ({ opacity: 1 }), []);

    const transitionProps = useMemo(() => ({ duration: 0.6, delay }), [delay]);

    return (
      <motion.div
        className={className}
        initial={initialProps}
        animate={animateProps}
        transition={transitionProps}
      >
        {children}
      </motion.div>
    );
  }
);

FadeIn.displayName = 'FadeIn';

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  delay?: number;
}

export const SlideIn = memo<SlideInProps>(
  ({ children, direction = 'up', className = '', delay = 0 }) => {
    const initialPosition = useMemo(() => {
      switch (direction) {
        case 'left':
          return { x: -50 };
        case 'right':
          return { x: 50 };
        case 'up':
          return { y: 50 };
        case 'down':
          return { y: -50 };
      }
    }, [direction]);

    const initialProps = useMemo(
      () => ({ opacity: 0, ...initialPosition }),
      [initialPosition]
    );

    const animateProps = useMemo(() => ({ opacity: 1, x: 0, y: 0 }), []);

    const transitionProps = useMemo(
      () => ({ duration: 0.6, delay, ease: 'easeOut' as const }),
      [delay]
    );

    return (
      <motion.div
        className={className}
        initial={initialProps}
        animate={animateProps}
        transition={transitionProps}
      >
        {children}
      </motion.div>
    );
  }
);

SlideIn.displayName = 'SlideIn';

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ScaleIn = memo<ScaleInProps>(
  ({ children, className = '', delay = 0 }) => {
    const initialProps = useMemo(() => ({ opacity: 0, scale: 0.8 }), []);

    const animateProps = useMemo(() => ({ opacity: 1, scale: 1 }), []);

    const transitionProps = useMemo(
      () => ({ duration: 0.5, delay, ease: 'easeOut' as const }),
      [delay]
    );

    return (
      <motion.div
        className={className}
        initial={initialProps}
        animate={animateProps}
        transition={transitionProps}
      >
        {children}
      </motion.div>
    );
  }
);

ScaleIn.displayName = 'ScaleIn';

// =================================
// COMPONENTES DE ANIMAÇÃO SEQUENCIAL AVANÇADA OTIMIZADOS
// =================================

interface WaveAnimationProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  delayBetweenRows?: number;
  delayBetweenCols?: number;
  className?: string;
}

export const WaveAnimation = memo<WaveAnimationProps>(
  ({
    children,
    cols = 4,
    gap = 6,
    delayBetweenRows = 0.2,
    delayBetweenCols = 0.05,
    className = '',
  }) => {
    const gridCols = useMemo(() => {
      switch (cols) {
        case 1:
          return 'grid-cols-1';
        case 2:
          return 'grid-cols-1 md:grid-cols-2';
        case 3:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        case 4:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        default:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      }
    }, [cols]);

    const gridClassName = useMemo(
      () => `grid gap-${gap} ${gridCols} ${className}`,
      [gap, gridCols, className]
    );

    const stableChildren = useMemo(
      () => React.Children.toArray(children),
      [children]
    );

    const initialProps = useMemo(() => ({ opacity: 0, y: 30 }), []);

    const animateProps = useMemo(() => ({ opacity: 1, y: 0 }), []);

    const hoverProps = useMemo(
      () => ({
        y: -3,
        transition: { duration: 0.2 },
      }),
      []
    );

    return (
      <div className={gridClassName}>
        {stableChildren.map((child, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const delay = row * delayBetweenRows + col * delayBetweenCols;
          const key = `wave-${index}`;

          const transitionProps = {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
          };

          return (
            <motion.div
              key={key}
              initial={initialProps}
              animate={animateProps}
              transition={transitionProps}
              whileHover={hoverProps}
            >
              {child}
            </motion.div>
          );
        })}
      </div>
    );
  }
);

WaveAnimation.displayName = 'WaveAnimation';

interface TypewriterGridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  delayBetweenItems?: number;
  animationType?: 'typewriter' | 'cascade' | 'spiral';
  className?: string;
}

export const TypewriterGrid = memo<TypewriterGridProps>(
  ({
    children,
    cols = 4,
    gap = 6,
    delayBetweenItems = 0.15,
    animationType = 'typewriter',
    className = '',
  }) => {
    const gridCols = useMemo(() => {
      switch (cols) {
        case 1:
          return 'grid-cols-1';
        case 2:
          return 'grid-cols-1 md:grid-cols-2';
        case 3:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        case 4:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        default:
          return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      }
    }, [cols]);

    const gridClassName = useMemo(
      () => `grid gap-${gap} ${gridCols} ${className}`,
      [gap, gridCols, className]
    );

    const stableChildren = useMemo(
      () => React.Children.toArray(children),
      [children]
    );

    const getDelay = useCallback(
      (index: number) => {
        switch (animationType) {
          case 'typewriter':
            return index * delayBetweenItems;
          case 'cascade':
            const row = Math.floor(index / cols);
            const col = index % cols;
            return (row + col) * delayBetweenItems;
          case 'spiral':
            return index * delayBetweenItems * 0.8;
          default:
            return index * delayBetweenItems;
        }
      },
      [animationType, cols, delayBetweenItems]
    );

    const initialProps = useMemo(
      () => ({
        opacity: 0,
        y: 30,
        x: animationType === 'cascade' ? -15 : 0,
      }),
      [animationType]
    );

    const animateProps = useMemo(() => ({ opacity: 1, y: 0, x: 0 }), []);

    const hoverProps = useMemo(
      () => ({
        y: -5,
        transition: { duration: 0.2 },
      }),
      []
    );

    const tapProps = useMemo(() => ({ y: 0 }), []);

    return (
      <div className={gridClassName}>
        {stableChildren.map((child, index) => {
          const key = `typewriter-${index}`;
          const transitionProps = {
            duration: 0.6,
            delay: getDelay(index),
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
          };

          return (
            <motion.div
              key={key}
              initial={initialProps}
              animate={animateProps}
              transition={transitionProps}
              whileHover={hoverProps}
              whileTap={tapProps}
            >
              {child}
            </motion.div>
          );
        })}
      </div>
    );
  }
);

TypewriterGrid.displayName = 'TypewriterGrid';
