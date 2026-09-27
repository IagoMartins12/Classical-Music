// app/uploads/loading.tsx
'use client';

import {
  PiArrowSquareOut,
  PiDatabase,
  PiFile,
  PiFileText,
  PiFunnel,
  PiGear,
  PiListBullets,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiNotePencil,
  PiPlus,
  PiSquaresFour,
  PiTrash,
  PiUploadSimple,
  PiUser,
} from 'react-icons/pi';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function UploadsPageLoading() {
  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <PiUploadSimple className="w-8 h-8" />
            </div>
          </div>
          <div className="h-12 border border-theme-primary rounded-2xl mx-auto max-w-md mb-4"></div>
          <div className="h-6 border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              icon: <PiDatabase className="w-5 h-5" />,
              gradient: '',
            },
            {
              icon: <PiUser className="w-5 h-5" />,
              gradient: '',
            },
            {
              icon: <PiMusicNotes className="w-5 h-5" />,
              gradient: '',
            },
            {
              icon: <PiFileText className="w-5 h-5" />,
              gradient: '',
            },
            {
              icon: <PiFile className="w-5 h-5" />,
              gradient: '',
            },
            {
              icon: <PiUploadSimple className="w-5 h-5" />,
              gradient: '',
            },
          ].map((item, index) => (
            <Card densidade="compacta" key={index} className="text-center">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${item.gradient}/20 rounded-xl flex items-center justify-center mb-2 mx-auto`}
              >
                {item.icon}
              </div>
              <div className="h-8 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </Card>
          ))}
        </div>

        {/* Controls Skeleton */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Create Buttons */}
            <div className="flex flex-wrap gap-2">
              <Inline gap={2} className="h-10 w-36 rounded-lg justify-center">
                <PiPlus className="w-4 h-4" />
                <div className="w-20 h-4 rounded"></div>
              </Inline>
              <Inline
                gap={2}
                className="h-10 w-28 bg-theme-secondary rounded-lg justify-center"
              >
                <PiPlus className="w-4 h-4" />
                <div className="w-16 h-4 rounded"></div>
              </Inline>
              <Inline
                gap={2}
                className="h-10 w-32 bg-theme-secondary rounded-lg justify-center"
              >
                <PiPlus className="w-4 h-4" />
                <div className="w-20 h-4 rounded"></div>
              </Inline>
            </div>

            {/* Right Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                <div className="h-12 w-80 border border-theme-secondary rounded-lg"></div>
              </div>

              {/* Action Buttons */}
              <Inline gap={2}>
                <Inline
                  gap={2}
                  className="h-12 w-24 bg-theme-secondary border border-theme-secondary rounded-lg justify-center"
                >
                  <PiFunnel className="w-4 h-4" />
                  <div className="w-12 h-4 rounded"></div>
                </Inline>

                <div className="bg-theme-secondary border border-theme-primary rounded-lg p-1 flex">
                  <div className="p-2 rounded bg-theme-elevated">
                    <PiListBullets className="w-4 h-4" />
                  </div>
                  <div className="p-2 rounded">
                    <PiSquaresFour className="w-4 h-4" />
                  </div>
                </div>
              </Inline>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-theme-secondary rounded-xl p-1 overflow-x-auto mt-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-lg h-10 min-w-[120px] ${
                  index === 0 ? '' : ''
                }`}
              ></div>
            ))}
          </div>
        </Card>

        {/* Filter Status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Inline gap={4}>
            <div className="h-4 w-48 bg-theme-elevated rounded"></div>
          </Inline>

          <Inline gap={2}>
            <Inline
              gap={1}
              className="h-8 w-20 bg-theme-secondary rounded justify-center"
            >
              <PiGear className="w-4 h-4" />
              <div className="w-12 h-3 rounded"></div>
            </Inline>
          </Inline>
        </div>

        {/* Content Sections */}
        <Stack gap={8}>
          {/* Composers Section */}
          <Stack gap={6}>
            <Inline gap={3}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <PiUser className="w-5 h-5" />
              </div>
              <Stack gap={2}>
                <div className="h-8 w-48 rounded"></div>
                <div className="h-4 w-32 bg-theme-elevated rounded"></div>
              </Stack>
            </Inline>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ComposerCardSkeleton key={i} />
              ))}
            </div>
          </Stack>

          {/* Works Section */}
          <Stack gap={6}>
            <Inline gap={3}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <PiMusicNotes className="w-5 h-5" />
              </div>
              <Stack gap={2}>
                <div className="h-8 w-32 rounded"></div>
                <div className="h-4 w-28 bg-theme-elevated rounded"></div>
              </Stack>
            </Inline>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <WorkCardSkeleton key={i} />
              ))}
            </div>
          </Stack>

          {/* Scores Section */}
          <Stack gap={6}>
            <Inline gap={3}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <PiFileText className="w-5 h-5" />
              </div>
              <Stack gap={2}>
                <div className="h-8 w-40 rounded"></div>
                <div className="h-4 w-36 bg-theme-elevated rounded"></div>
              </Stack>
            </Inline>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ScoreCardSkeleton key={i} />
              ))}
            </div>
          </Stack>
        </Stack>

        {/* Pagination Skeleton */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg ${
                  i === 0 ? '' : 'bg-theme-secondary'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Components
function ComposerCardSkeleton() {
  return (
    <div className="classical-card h-full overflow-hidden">
      {/* Portrait Section */}
      <div className="relative p-6 pb-4">
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 md:w-28 md:h-28">
            <div className="w-full h-full rounded-full border-3 flex items-center justify-center">
              <PiUser className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          </div>
        </div>

        {/* Floating action buttons */}
        <Stack gap={2} className="absolute top-4 right-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <PiNotePencil className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <PiTrash className="w-4 h-4" />
          </div>
        </Stack>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-6 relative">
        <div className="relative z-10 space-y-3">
          {/* Name */}
          <div className="text-center">
            <div className="h-6 rounded mx-auto max-w-[80%]"></div>
          </div>

          {/* Status badges */}
          <div className="flex justify-center space-x-2">
            <div className="h-6 w-16 border rounded-full"></div>
            <div className="h-6 w-20 border rounded-full"></div>
          </div>

          {/* Period info */}
          <div className="text-center">
            <div className="h-6 w-24 border rounded-full mx-auto"></div>
          </div>

          {/* External links */}
          <div className="flex justify-center space-x-2 pt-2">
            <Inline
              gap={1}
              className="h-6 w-16 border rounded-full justify-center"
            >
              <div className="w-8 h-3 rounded"></div>
              <PiArrowSquareOut className="w-2.5 h-2.5" />
            </Inline>
          </div>

          {/* Date info */}
          <div className="flex items-center justify-center pt-4 border-t border-theme-secondary mt-4">
            <div className="h-3 w-32 bg-theme-elevated rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkCardSkeleton() {
  return (
    <div className="classical-card h-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="relative p-6 pb-4 border-b border-theme-secondary">
        {/* Floating action buttons */}
        <Stack gap={2} className="absolute top-4 right-4 z-50">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <PiNotePencil className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <PiTrash className="w-4 h-4" />
          </div>
        </Stack>

        <div className="relative z-10">
          {/* Title */}
          <div className="h-6 rounded mb-3 mr-16"></div>

          {/* Composer */}
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full mr-2"></div>
            <div className="h-4 w-32 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 w-full flex flex-col">
        {/* Work Details */}
        <div className="space-y-3 mb-4 flex-1">
          <div className="flex items-center">
            <PiMusicNotes className="w-4 h-4 mr-2 flex-shrink-0" />
            <div className="h-4 w-24 bg-theme-elevated rounded"></div>
          </div>

          <div className="flex items-center">
            <PiMusicNotes className="w-4 h-4 mr-2 flex-shrink-0" />
            <div className="h-4 w-20 bg-theme-elevated rounded"></div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 border rounded-full"></div>
          <div className="h-6 w-14 border rounded-full"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
          <div className="h-3 w-28 bg-theme-elevated rounded"></div>
          <Inline gap={1} className="h-4 w-12 rounded justify-center">
            <PiArrowSquareOut className="w-3 h-3" />
          </Inline>
        </div>
      </div>
    </div>
  );
}

function ScoreCardSkeleton() {
  return (
    <div className="classical-card h-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="relative p-6 pb-4 border-b border-theme-secondary">
        {/* Floating action buttons */}
        <Stack gap={2} className="absolute top-4 right-4 z-50">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <PiNotePencil className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <PiTrash className="w-4 h-4" />
          </div>
        </Stack>

        <div className="relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <PiFileText className="w-8 h-8" />
            </div>
          </div>

          {/* Title */}
          <div className="h-6 rounded mb-3 mx-4"></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 w-full flex flex-col">
        {/* Score Details */}
        <div className="space-y-3 mb-4 flex-1">
          {/* Work info */}
          <Stack gap={2} className="text-center">
            <div className="flex items-center justify-center">
              <PiMusicNotes className="w-4 h-4 mr-2" />
              <div className="h-4 w-32 rounded"></div>
            </div>

            <div className="flex items-center justify-center">
              <PiUser className="w-4 h-4 mr-2" />
              <div className="h-4 w-28 bg-theme-elevated rounded"></div>
            </div>
          </Stack>

          {/* File info */}
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="h-4 w-24 bg-theme-elevated rounded"></div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <div className="h-6 w-14 border rounded-full"></div>
          <div className="h-6 w-20 border rounded-full"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
          <div className="h-3 w-28 bg-theme-elevated rounded"></div>
          <Inline gap={2}>
            <Inline gap={1} className="h-4 w-16 rounded justify-center">
              <div className="w-8 h-3 rounded"></div>
            </Inline>
            <Inline gap={1} className="h-4 w-12 rounded justify-center">
              <PiArrowSquareOut className="w-3 h-3" />
            </Inline>
          </Inline>
        </div>
      </div>
    </div>
  );
}
