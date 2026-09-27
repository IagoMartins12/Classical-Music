// app/profile/components/ProfileSkeleton.tsx
import React from 'react';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1">
        <Card nivel={2} densidade="compacta">
          <Stack gap={3}>
            {[...Array(5)].map((_, index) => (
              <Inline gap={3} key={index} className="px-3 py-2.5">
                <div className="w-4 h-4 bg-theme-secondary bg-opacity-50 rounded" />
                <div className="h-4 bg-theme-secondary bg-opacity-50 rounded flex-1" />
              </Inline>
            ))}
          </Stack>

          {/* Progress Skeleton */}
          <Stack gap={2} className="mt-4 pt-4 border-t border-theme-secondary">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-theme-secondary bg-opacity-50 rounded" />
              <div className="h-3 w-8 bg-theme-secondary bg-opacity-50 rounded" />
            </div>
            <div className="w-full bg-theme-secondary bg-opacity-50 rounded-full h-2">
              <div className="bg-brand-primary h-2 rounded-full w-1/5" />
            </div>
          </Stack>
        </Card>
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:col-span-3">
        <Card nivel={2}>
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Stack gap={2}>
              <div className="h-6 w-48 bg-theme-secondary bg-opacity-50 rounded" />
              <div className="h-4 w-64 bg-theme-secondary bg-opacity-30 rounded" />
            </Stack>
            <div className="h-9 w-20 bg-theme-secondary bg-opacity-50 rounded" />
          </div>

          {/* Profile Image Section Skeleton */}
          <Inline gap={6} className="pb-6 border-b border-theme-secondary mb-6">
            <div className="w-20 h-20 bg-theme-secondary bg-opacity-50 rounded-full" />
            <Stack gap={2}>
              <div className="h-5 w-32 bg-theme-secondary bg-opacity-50 rounded" />
              <div className="h-4 w-48 bg-theme-secondary bg-opacity-30 rounded" />
              <div className="h-8 w-24 bg-theme-secondary bg-opacity-50 rounded" />
            </Stack>
          </Inline>

          {/* Form Fields Skeleton */}
          <Stack gap={6}>
            {/* Two column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, index) => (
                <Stack gap={2} key={index}>
                  <div className="h-4 w-16 bg-theme-secondary bg-opacity-50 rounded" />
                  <div className="h-12 bg-theme-secondary bg-opacity-30 rounded" />
                </Stack>
              ))}
            </div>

            {/* Bio field skeleton */}
            <Stack gap={2}>
              <div className="h-4 w-20 bg-theme-secondary bg-opacity-50 rounded" />
              <div className="h-24 bg-theme-secondary bg-opacity-30 rounded" />
            </Stack>

            {/* Location section skeleton */}
            <Stack>
              <Inline gap={2}>
                <div className="w-4 h-4 bg-theme-secondary bg-opacity-50 rounded" />
                <div className="h-5 w-24 bg-theme-secondary bg-opacity-50 rounded" />
              </Inline>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, index) => (
                  <Stack gap={2} key={index}>
                    <div className="h-4 w-12 bg-theme-secondary bg-opacity-50 rounded" />
                    <div className="h-12 bg-theme-secondary bg-opacity-30 rounded" />
                  </Stack>
                ))}
              </div>
            </Stack>

            {/* Account info skeleton */}
            <Stack className="pt-6 border-t border-theme-secondary">
              <div className="h-5 w-36 bg-theme-secondary bg-opacity-50 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, index) => (
                  <Stack gap={2} key={index}>
                    <div className="h-4 w-12 bg-theme-secondary bg-opacity-50 rounded" />
                    <div className="h-12 bg-theme-secondary bg-opacity-30 rounded" />
                  </Stack>
                ))}
              </div>
            </Stack>
          </Stack>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
