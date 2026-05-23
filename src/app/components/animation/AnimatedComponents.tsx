'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── CSS ─────────────────────────────────────────────────────────────────────
// Injected once via a <style> tag; SSR-safe (guarded by typeof document check).

const ANIMATION_CSS = `
/* ── Defaults: elements are always visible unless opted into animation ── */
.anim-container,
.anim-item,
.anim-card {
  opacity: 1;
  transform: none;
}

/* ── Opt-in: hidden state BEFORE intersection ── */
.anim-container[data-pending],
.anim-item[data-pending],
.anim-card[data-pending] {
  opacity: 0;
}

.anim-item[data-pending][data-dir="up"]    { transform: translateY(20px); }
.anim-item[data-pending][data-dir="down"]  { transform: translateY(-20px); }
.anim-item[data-pending][data-dir="left"]  { transform: translateX(-20px); }
.anim-item[data-pending][data-dir="right"] { transform: translateX(20px); }
.anim-item[data-pending][data-dir="scale"] { transform: scale(0.95); }

.anim-card[data-pending] {
  transform: scale(0.95) translateY(20px);
}

/* ── Transitions (only when pending, removed on reveal to avoid conflicts) ── */
.anim-container[data-pending] {
  transition: opacity 0.6s ease-out;
}

.anim-item[data-pending] {
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.anim-card[data-pending] {
  transition:
    opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── Speed overrides ── */
.anim-speed-fast[data-pending]   { transition-duration: 0.3s !important; }
.anim-speed-normal[data-pending] { transition-duration: 0.5s !important; }
.anim-speed-slow[data-pending]   { transition-duration: 0.8s !important; }

/* ── Spring overrides ── */
.anim-spring-smooth[data-pending]  { transition-timing-function: ease-out !important; }
.anim-spring-bouncy[data-pending]  { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55) !important; }
.anim-spring-gentle[data-pending]  { transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94) !important; }

/* ── Hover effects ── */
.anim-hover-scale { transition: transform 0.2s ease-out; }
.anim-hover-scale:hover { transform: scale(1.05); }

.anim-hover-lift { transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; }
.anim-hover-lift:hover { transform: translateY(-5px) scale(1.02); }

.anim-hover-glow { transition: box-shadow 0.2s ease-out; }
.anim-hover-glow:hover { box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3); }

/* ── Sequential grid ── */
.anim-seq-grid > .anim-seq-child {
  opacity: 1;
  transform: none;
}

.anim-seq-grid[data-pending] > .anim-seq-child {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.anim-seq-grid > .anim-seq-child:hover {
  transform: translateY(-5px);
  transition: transform 0.2s ease-out !important;
}

/* ── Skeleton ── */
.anim-skeleton-shimmer {
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
  background-size: 200% 100%;
  animation: anim-shimmer 2s infinite linear;
}

.anim-skeleton-pulse {
  animation: anim-pulse 1.5s infinite ease-in-out;
}

/* ── Spinner ── */
.anim-spinner {
  animation: anim-spin 1s linear infinite;
}

/* ── Floating ── */
.anim-floating {
  animation: anim-float 6s ease-in-out infinite;
}

/* ── Keyframes ── */
@keyframes anim-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes anim-pulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

@keyframes anim-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes anim-float {
  0%, 100% { transform: translateY(0) rotate(0deg);   opacity: 0.3; }
  50%       { transform: translateY(-10px) rotate(2deg); opacity: 0.7; }
}

/* ── Reduced-motion: opt out of everything ── */
@media (prefers-reduced-motion: reduce) {
  .anim-container[data-pending],
  .anim-item[data-pending],
  .anim-card[data-pending],
  .anim-seq-grid[data-pending] > .anim-seq-child,
  .anim-floating {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
    transition: none !important;
  }
}
`;

// ─── CSS injection (singleton, client-only) ───────────────────────────────────

let cssInjected = false;

function ensureCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.dataset.id = 'animated-components';
  style.textContent = ANIMATION_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

// ─── Shared IntersectionObserver ──────────────────────────────────────────────
// One observer for the entire app; each element registers its own callback.

let sharedObserver: IntersectionObserver | null = null;
const observerCallbacks = new Map<Element, () => void>();

function getObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const cb = observerCallbacks.get(entry.target);
          if (cb) {
            cb();
            sharedObserver!.unobserve(entry.target);
            observerCallbacks.delete(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
  }
  return sharedObserver;
}

function observeElement(el: Element, cb: () => void) {
  observerCallbacks.set(el, cb);
  getObserver().observe(el);
}

function unobserveElement(el: Element) {
  getObserver().unobserve(el);
  observerCallbacks.delete(el);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** True when the element is already inside the viewport on mount. */
function isAlreadyVisible(el: Element): boolean {
  const { top, bottom, left, right } = el.getBoundingClientRect();
  const vh = window.innerHeight ?? document.documentElement.clientHeight;
  const vw = window.innerWidth ?? document.documentElement.clientWidth;
  return top < vh && bottom > 0 && left < vw && right > 0;
}

/** Remove data-pending and all direction/speed/spring data attrs, ending the transition. */
function reveal(el: Element) {
  delete (el as HTMLElement).dataset.pending;
  delete (el as HTMLElement).dataset.dir;
}

const STAGGER_DELAYS: Record<AnimationSpeed, number> = {
  fast: 50,
  normal: 100,
  slow: 150,
};

// ─── useRevealOnScroll ────────────────────────────────────────────────────────
// Core hook: marks element as pending, observes it, reveals on intersection.

function useRevealOnScroll(
  ref: React.RefObject<Element | null>,
  delay: number,
  onReveal?: (el: Element) => void
) {
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  useEffect(() => {
    ensureCSS();
    const el = ref.current;
    if (!el) return;

    // Already in viewport → skip animation entirely
    if (isAlreadyVisible(el)) return;

    // Mark as pending (triggers the hidden CSS state)
    (el as HTMLElement).dataset.pending = '';

    const trigger = () => {
      const delayMs = delay * 1000;
      if (delayMs > 0) {
        setTimeout(() => {
          reveal(el);
          onRevealRef.current?.(el);
        }, delayMs);
      } else {
        reveal(el);
        onRevealRef.current?.(el);
      }
    };

    observeElement(el, trigger);
    return () => unobserveElement(el);
  }, []); // intentionally runs once on mount
}

// ─── AnimatedContainer ────────────────────────────────────────────────────────

interface AnimatedContainerProps extends BaseAnimationProps {
  staggerSpeed?: AnimationSpeed;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  delay = 0,
  staggerSpeed = 'normal',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const onReveal = useCallback(
    (el: Element) => {
      // Stagger direct .anim-item[data-pending] children
      const items = el.querySelectorAll<HTMLElement>(
        '.anim-item[data-pending]'
      );
      items.forEach((item, i) => {
        setTimeout(() => reveal(item), i * STAGGER_DELAYS[staggerSpeed]);
      });
    },
    [staggerSpeed]
  );

  useRevealOnScroll(ref, delay, onReveal);

  return (
    <div ref={ref} className={`anim-container ${className}`}>
      {children}
    </div>
  );
};

// ─── AnimatedItem ─────────────────────────────────────────────────────────────

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
  speed = 'normal',
  className = '',
  component,
  onClick,
  style,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement & HTMLTableRowElement>(null);

  useEffect(() => {
    // Set data-dir BEFORE the observer hook so CSS picks it up immediately
    if (ref.current) ref.current.dataset.dir = direction;
  }, [direction]);

  useRevealOnScroll(ref, delay);

  const classes = [
    'anim-item',
    `anim-speed-${speed}`,
    `anim-spring-${springType}`,
    hover !== 'none' ? `anim-hover-${hover}` : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (component === 'tr') {
    return (
      <tr ref={ref} className={classes} onClick={onClick} style={style}>
        {children}
      </tr>
    );
  }

  return (
    <div ref={ref} className={classes} onClick={onClick} style={style}>
      {children}
    </div>
  );
};

// ─── AnimatedCard ─────────────────────────────────────────────────────────────

interface AnimatedCardProps extends BaseAnimationProps {
  hover?: HoverEffect;
  clickable?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  hover = 'lift',
  clickable = false,
  speed = 'normal',
  className = '',
  onClick,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useRevealOnScroll(ref, delay);

  const classes = [
    'anim-card',
    `anim-speed-${speed}`,
    hover !== 'none' ? `anim-hover-${hover}` : '',
    clickable || onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

// ─── SequentialGrid ───────────────────────────────────────────────────────────

interface SequentialGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5;
  gap?: number;
  delayBetweenItems?: number;
  className?: string;
  classNameSub?: string;
}

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

export const SequentialGrid: React.FC<SequentialGridProps> = ({
  children,
  cols = 4,
  gap = 6,
  delayBetweenItems = 0.1,
  className = '',
  classNameSub = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const onReveal = useCallback(
    (el: Element) => {
      const items = el.querySelectorAll<HTMLElement>(
        ':scope > .anim-seq-child'
      );
      items.forEach((item, i) => {
        setTimeout(
          () => {
            item.style.opacity = '1';
            item.style.transform = 'none';
          },
          i * delayBetweenItems * 1000
        );
      });
      delete (el as HTMLElement).dataset.pending;
    },
    [delayBetweenItems]
  );

  useRevealOnScroll(ref, 0, onReveal);

  const gridClass = GRID_COLS[cols] ?? GRID_COLS[4];

  return (
    <div
      ref={ref}
      className={`grid gap-${gap} ${gridClass} anim-seq-grid ${className}`}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className={`anim-seq-child ${classNameSub}`}>
          {child}
        </div>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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
  useEffect(() => {
    ensureCSS();
  }, []);

  const animClass = shimmer
    ? 'anim-skeleton-shimmer'
    : pulse
      ? 'anim-skeleton-pulse'
      : '';

  return (
    <div
      className={[
        width,
        height,
        rounded ? 'rounded' : '',
        'bg-theme-elevated',
        animClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
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
}) => (
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
      {Array.from({ length: lines }, (_, i) => (
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

// ─── Layout & Utility ─────────────────────────────────────────────────────────

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
  useEffect(() => {
    ensureCSS();
  }, []);

  return (
    <div
      className={[
        showBackground ? 'bg-gradient-primary' : '',
        'relative',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showBackground && (
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl anim-floating" />
          <div
            className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl anim-floating"
            style={{ animationDelay: '2s' }}
          />
        </div>
      )}
      <div className="section-wrap space-y-8 relative z-10">{children}</div>
    </div>
  );
};

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
  useEffect(() => {
    ensureCSS();
  }, []);

  return (
    <div
      className={`absolute pointer-events-none anim-floating ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-brand-primary',
  className = '',
}) => {
  useEffect(() => {
    ensureCSS();
  }, []);

  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];

  return (
    <div
      className={`${sizeClass} border-4 ${color} border-t-transparent rounded-full anim-spinner ${className}`}
    />
  );
};
