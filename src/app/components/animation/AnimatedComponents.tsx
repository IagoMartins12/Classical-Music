// components/animation/AnimatedComponents.tsx - Versão final sem erros
'use client';

import React from 'react';
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

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  delay = 0.1,
  staggerSpeed = 'normal',
  className = '',
}) => {
  const variants = createContainerVariants(staggerSpeed, delay);

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
};

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

export const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  direction = 'up',
  springType = 'smooth',
  hover = 'none',
  className = '',
  component,
  onClick,
  style,
}) => {
  const variants = createItemVariants(direction, springType);

  // Configuração do hover segura
  const hoverConfig =
    hover !== 'none' && hoverVariants[hover] ? hoverVariants[hover] : {};

  if (component === 'tr') {
    return (
      <motion.tr
        className={className}
        variants={variants}
        onClick={onClick}
        style={style}
        whileHover={hoverConfig.hover}
        whileTap={hoverConfig.tap}
      >
        {children}
      </motion.tr>
    );
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      onClick={onClick}
      style={style}
      whileHover={hoverConfig.hover}
      whileTap={hoverConfig.tap}
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
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  hover = 'lift',
  clickable = false,
  className = '',
  onClick,
}) => {
  const variants = createItemVariants('scale', 'bouncy');
  const hoverConfig = hoverVariants[hover] || {};
  const cursorClass = clickable || onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      className={`${className} ${cursorClass}`}
      variants={variants}
      onClick={onClick ? onClick : undefined}
      whileHover={hoverConfig.hover}
      whileTap={clickable ? hoverConfig.tap : undefined}
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

  const variants = shimmer
    ? skeletonShimmer
    : pulse
      ? skeletonPulse
      : undefined;

  const shimmerStyle = shimmer
    ? {
        background:
          'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)',
        backgroundSize: '200% 100%',
      }
    : {};

  return (
    <motion.div
      className={`${baseClass} ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
      style={shimmerStyle}
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
  classname?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-brand-primary',
  classname,
}) => {
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
    />
  );
};

// =================================
// GRID COM ANIMAÇÃO SEQUENCIAL
// =================================

interface SequentialGridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  delayBetweenItems?: number; // Delay entre cada item
  className?: string;
  classNameSub?: string;
}

export const SequentialGrid: React.FC<SequentialGridProps> = ({
  children,
  cols = 4,
  gap = 6,
  delayBetweenItems = 0.1,
  className = '',
  classNameSub,
}) => {
  const getGridCols = () => {
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
  };

  return (
    <div className={`grid gap-${gap} ${getGridCols()} ${className}`}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }} // ✅ Removido scale - card aparece no tamanho normal
          animate={{ opacity: 1, y: 0 }} // ✅ Apenas fade-in e movimento vertical
          transition={{
            duration: 0.6,
            delay: index * delayBetweenItems,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          whileHover={{
            y: -5,
            transition: { duration: 0.2 },
          }}
          className={`${classNameSub}`}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};
