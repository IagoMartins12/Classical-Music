// app/components/Admin/Skeletons/StatsSkeleton.tsx
'use client';

import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';

interface StatsSkeletonProps {
  count?: number;
}

export default function StatsSkeleton({ count = 4 }: StatsSkeletonProps) {
  return (
    <AnimatedItem direction="up" springType="gentle">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: count }).map((_, index) => (
          <AnimatedCard key={index} className="classical-card p-6" hover="none">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-theme-secondary rounded-lg"></div>
                <div className="w-6 h-6 bg-theme-secondary rounded"></div>
              </div>

              <div className="space-y-3">
                <div className="h-4 bg-theme-secondary rounded w-3/4"></div>
                <div className="h-8 bg-theme-secondary rounded w-1/2"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-theme-secondary rounded"></div>
                  <div className="h-3 bg-theme-secondary rounded w-16"></div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </AnimatedItem>
  );
}

export function ChartSkeleton({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <AnimatedCard className="classical-card p-6">
      <div className="animate-pulse">
        {title && (
          <div className="mb-4">
            <div className="h-5 bg-theme-secondary rounded w-1/3 mb-2"></div>
            {subtitle && (
              <div className="h-3 bg-theme-secondary rounded w-1/2"></div>
            )}
          </div>
        )}
        <div className="h-64 bg-theme-secondary rounded-lg"></div>
      </div>
    </AnimatedCard>
  );
}

export function TopPerformersSkeleton() {
  return (
    <AnimatedCard className="classical-card p-6 mb-8">
      <div className="animate-pulse">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-theme-secondary rounded"></div>
          <div className="h-5 bg-theme-secondary rounded w-48"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-4 bg-theme-secondary rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-theme-primary rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-theme-primary rounded w-3/4"></div>
                  <div className="h-3 bg-theme-primary rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-theme-primary rounded"></div>
                  <div className="h-3 bg-theme-primary rounded w-8"></div>
                </div>
                <div className="w-6 h-6 bg-theme-primary rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}
