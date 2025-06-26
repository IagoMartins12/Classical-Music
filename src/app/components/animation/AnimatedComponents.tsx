// components/animation/AnimatedComponents.tsx - Componentes reutilizáveis
'use client';

import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import {
  createContainerVariants,
  createItemVariants,
  hoverVariants,
  skeletonPulse,
  skeletonShimmer,
} from '@/app/libs/animation-variant';

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
  as?: keyof JSX.IntrinsicElements;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  delay = 0.1,
  staggerSpeed = 'normal',
  className = '',
  as: Component = 'div',
}) => {
  const variants = createContainerVariants(staggerSpeed, delay);

  return (
    <motion.div
      as={Component}
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

// =================================
// ITEM COMPONENTS
// =================================

interface AnimatedItemProps extends BaseAnimationProps {
  direction?: AnimationDirection;
  springType?: SpringType;
  hover?: HoverEffect;
  as?: keyof JSX.IntrinsicElements;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  direction = 'up',
  springType = 'smooth',
  hover = 'none',
  className = '',
  as: Component = 'div',
}) => {
  const variants = createItemVariants(direction, springType);
  const hoverProps = hover !== 'none' ? hoverVariants[hover] : {};

  return (
    <motion.div
      as={Component}
      className={className}
      variants={variants}
      whileHover={hoverProps.hover}
      whileTap={hoverProps.tap}
    >
      {children}
    </motion.div>
  );
};

// =================================
// SPECIALIZED COMPONENTS
// =================================

interface AnimatedCardProps extends BaseAnimationProps {
  hover?: HoverEffect;
  clickable?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  hover = 'lift',
  clickable = false,
  className = '',
  as: Component = 'div',
}) => {
  const variants = createItemVariants('scale', 'bouncy');
  const hoverProps = hoverVariants[hover] || {};

  return (
    <motion.div
      as={Component}
      className={`${className} ${clickable ? 'cursor-pointer' : ''}`}
      variants={variants}
      whileHover={hoverProps.hover}
      whileTap={clickable ? hoverProps.tap : undefined}
    >
      {children}
    </motion.div>
  );
};

// =================================
// GRID COMPONENTS
// =================================

interface StaggerGridProps extends BaseAnimationProps {
  cols?: number;
  gap?: number;
  staggerSpeed?: AnimationSpeed;
}

export const StaggerGrid: React.FC<StaggerGridProps> = ({
  children,
  cols = 4,
  gap = 6,
  staggerSpeed = 'fast',
  delay = 0.1,
  className = '',
}) => {
  const containerVariants = createContainerVariants(staggerSpeed, delay);

  const gridClass = `grid gap-${gap} ${
    cols === 1
      ? 'grid-cols-1'
      : cols === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : cols === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }`;

  return (
    <motion.div
      className={`${gridClass} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

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

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = 'w-full',
  height = 'h-4',
  rounded = true,
  shimmer = true,
  pulse = false,
  className = '',
}) => {
  const baseClass = `${width} ${height} ${
    rounded ? 'rounded' : ''
  } bg-theme-elevated`;
  const animationClass = shimmer ? 'bg-gradient-shimmer' : '';

  const MotionComponent = motion.div;
  const variants = shimmer
    ? skeletonShimmer
    : pulse
    ? skeletonPulse
    : undefined;

  return (
    <MotionComponent
      className={`${baseClass} ${animationClass} ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
      style={
        shimmer
          ? {
              background:
                'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)',
              backgroundSize: '200% 100%',
            }
          : undefined
      }
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
  showIcon?: boolean;
  showButton?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showIcon = true,
  showButton = false,
  className = '',
}) => {
  return (
    <AnimatedCard className={`classical-card p-6 ${className}`} hover="none">
      {/* Header with icon */}
      {showIcon && (
        <div className="flex items-center space-x-3 mb-4">
          <SkeletonItem width="w-12" height="h-12" />
          <div className="flex-1 space-y-2">
            <SkeletonItem width="w-3/4" height="h-5" />
            <SkeletonItem width="w-1/2" height="h-3" />
          </div>
        </div>
      )}

      {/* Content lines */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonItem
            key={i}
            width={i === lines - 1 ? 'w-2/3' : 'w-full'}
            height="h-4"
          />
        ))}
      </div>

      {/* Footer button */}
      {showButton && (
        <div className="mt-4 pt-4 border-t border-theme-secondary">
          <SkeletonItem width="w-32" height="h-10" />
        </div>
      )}
    </AnimatedCard>
  );
};

// =================================
// LAYOUT COMPONENTS
// =================================

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  showBackground?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  showBackground = true,
}) => {
  return (
    <div
      className={`${showBackground ? 'bg-gradient-primary' : ''} ${className}`}
    >
      {/* Background Pattern */}
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

      {/* Content */}
      <div className="section-wrap space-y-8 relative z-10">{children}</div>
    </div>
  );
};

// =================================
// UTILITY COMPONENTS
// =================================

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
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
    >
      {children}
    </motion.div>
  );
};

// =================================
// LOADING SPECIFIC
// =================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-brand-primary',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-4 ${color} border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};
