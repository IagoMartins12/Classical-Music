// app/uploads/loading.tsx
'use client';

import {
  FiUpload,
  FiDatabase,
  FiUser,
  FiMusic,
  FiFileText,
  FiFile,
  FiSearch,
  FiFilter,
  FiPlus,
  FiSettings,
  FiList,
  FiGrid,
  FiEdit,
  FiTrash2,
  FiExternalLink,
} from 'react-icons/fi';
import { MdUpload } from 'react-icons/md';
import { GiMusicalNotes } from 'react-icons/gi';

export default function UploadsPageLoading() {
  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <MdUpload className="w-8 h-8 text-theme-primary/30" />
            </div>
          </div>
          <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-md mb-4"></div>
          <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              icon: <FiDatabase className="w-5 h-5 text-theme-primary/30" />,
              gradient: 'from-brand-primary to-brand-secondary',
            },
            {
              icon: <FiUser className="w-5 h-5 text-theme-primary/30" />,
              gradient: 'from-accent-purple to-accent-blue',
            },
            {
              icon: <FiMusic className="w-5 h-5 text-theme-primary/30" />,
              gradient: 'from-accent-blue to-accent-green',
            },
            {
              icon: <FiFileText className="w-5 h-5 text-theme-primary/30" />,
              gradient: 'from-accent-green to-accent-amber',
            },
            {
              icon: <FiFile className="w-5 h-5 text-theme-primary/30" />,
              gradient: 'from-accent-amber to-accent-red',
            },
            {
              icon: <FiUpload className="w-5 h-5 text-theme-primary/30" />,
              gradient: 'from-accent-red to-brand-primary',
            },
          ].map((item, index) => (
            <div key={index} className="classical-card p-4 text-center">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${item.gradient}/20 rounded-xl flex items-center justify-center mb-2 mx-auto`}
              >
                {item.icon}
              </div>
              <div className="h-8 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </div>
          ))}
        </div>

        {/* Controls Skeleton */}
        <div className="classical-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Create Buttons */}
            <div className="flex flex-wrap gap-2">
              <div className="h-10 w-36 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg flex items-center justify-center space-x-2">
                <FiPlus className="w-4 h-4 text-theme-primary/30" />
                <div className="w-20 h-4 bg-theme-primary/30 rounded"></div>
              </div>
              <div className="h-10 w-28 bg-theme-secondary rounded-lg flex items-center justify-center space-x-2">
                <FiPlus className="w-4 h-4 text-theme-tertiary/30" />
                <div className="w-16 h-4 bg-theme-tertiary/30 rounded"></div>
              </div>
              <div className="h-10 w-32 bg-theme-secondary rounded-lg flex items-center justify-center space-x-2">
                <FiPlus className="w-4 h-4 text-theme-tertiary/30" />
                <div className="w-20 h-4 bg-theme-tertiary/30 rounded"></div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary/30 w-4 h-4" />
                <div className="h-12 w-80 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <div className="h-12 w-24 bg-theme-secondary border border-theme-secondary rounded-lg flex items-center justify-center space-x-2">
                  <FiFilter className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="w-12 h-4 bg-theme-tertiary/30 rounded"></div>
                </div>

                <div className="bg-theme-secondary border border-theme-primary rounded-lg p-1 flex">
                  <div className="p-2 rounded bg-theme-elevated">
                    <FiList className="w-4 h-4 text-theme-tertiary/30" />
                  </div>
                  <div className="p-2 rounded bg-brand-gradient/20">
                    <FiGrid className="w-4 h-4 text-brand-primary/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-theme-secondary rounded-xl p-1 overflow-x-auto mt-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-lg h-10 min-w-[120px] ${
                  index === 0
                    ? 'bg-gradient-to-r from-brand-primary/20 to-theme-tertiary/50'
                    : 'bg-theme-elevated/50'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Filter Status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-4 w-48 bg-theme-elevated rounded"></div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-8 w-20 bg-theme-secondary rounded flex items-center justify-center space-x-1">
              <FiSettings className="w-4 h-4 text-theme-tertiary/30" />
              <div className="w-12 h-3 bg-theme-tertiary/30 rounded"></div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Composers Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <FiUser className="w-5 h-5 text-theme-primary/30" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                <div className="h-4 w-32 bg-theme-elevated rounded"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ComposerCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Works Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-theme-primary/30" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                <div className="h-4 w-28 bg-theme-elevated rounded"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <WorkCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Scores Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-theme-primary/30" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-40 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                <div className="h-4 w-36 bg-theme-elevated rounded"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ScoreCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg ${
                  i === 0 ? 'bg-brand-primary/20' : 'bg-theme-secondary'
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
            <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full border-3 border-brand-primary/20 flex items-center justify-center">
              <FiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse/20" />
            </div>
          </div>
        </div>

        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <div className="w-8 h-8 bg-theme-elevated/50 rounded-lg flex items-center justify-center">
            <FiEdit className="w-4 h-4 text-theme-tertiary/30" />
          </div>
          <div className="w-8 h-8 bg-theme-elevated/50 rounded-lg flex items-center justify-center">
            <FiTrash2 className="w-4 h-4 text-theme-tertiary/30" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-6 relative">
        <div className="relative z-10 space-y-3">
          {/* Name */}
          <div className="text-center">
            <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mx-auto max-w-[80%]"></div>
          </div>

          {/* Status badges */}
          <div className="flex justify-center space-x-2">
            <div className="h-6 w-16 bg-accent-blue/10 border border-accent-blue/20 rounded-full"></div>
            <div className="h-6 w-20 bg-accent-green/10 border border-accent-green/20 rounded-full"></div>
          </div>

          {/* Period info */}
          <div className="text-center">
            <div className="h-6 w-24 bg-brand-primary/10 border border-brand-primary/20 rounded-full mx-auto"></div>
          </div>

          {/* External links */}
          <div className="flex justify-center space-x-2 pt-2">
            <div className="h-6 w-16 bg-accent-green/10 border border-accent-green/20 rounded-full flex items-center justify-center space-x-1">
              <div className="w-8 h-3 bg-accent-green/20 rounded"></div>
              <FiExternalLink className="w-2.5 h-2.5 text-accent-green/30" />
            </div>
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
        <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2">
          <div className="w-8 h-8 bg-theme-elevated/50 rounded-lg flex items-center justify-center">
            <FiEdit className="w-4 h-4 text-theme-tertiary/30" />
          </div>
          <div className="w-8 h-8 bg-theme-elevated/50 rounded-lg flex items-center justify-center">
            <FiTrash2 className="w-4 h-4 text-theme-tertiary/30" />
          </div>
        </div>

        <div className="relative z-10">
          {/* Title */}
          <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-3 mr-16"></div>

          {/* Composer */}
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-full mr-2"></div>
            <div className="h-4 w-32 bg-accent-blue/20 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 w-full flex flex-col">
        {/* Work Details */}
        <div className="space-y-3 mb-4 flex-1">
          <div className="flex items-center">
            <FiMusic className="w-4 h-4 text-brand-primary/30 mr-2 flex-shrink-0" />
            <div className="h-4 w-24 bg-theme-elevated rounded"></div>
          </div>

          <div className="flex items-center">
            <GiMusicalNotes className="w-4 h-4 text-brand-secondary/30 mr-2 flex-shrink-0" />
            <div className="h-4 w-20 bg-theme-elevated rounded"></div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 bg-brand-primary/10 border border-brand-primary/30 rounded-full"></div>
          <div className="h-6 w-14 bg-accent-blue/10 border border-accent-blue/30 rounded-full"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
          <div className="h-3 w-28 bg-theme-elevated rounded"></div>
          <div className="h-4 w-12 bg-accent-green/20 rounded flex items-center justify-center space-x-1">
            <FiExternalLink className="w-3 h-3 text-accent-green/30" />
          </div>
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
        <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2">
          <div className="w-8 h-8 bg-theme-elevated/50 rounded-lg flex items-center justify-center">
            <FiEdit className="w-4 h-4 text-theme-tertiary/30" />
          </div>
          <div className="w-8 h-8 bg-theme-elevated/50 rounded-lg flex items-center justify-center">
            <FiTrash2 className="w-4 h-4 text-theme-tertiary/30" />
          </div>
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-green/20 to-accent-amber/20 rounded-xl flex items-center justify-center">
              <FiFileText className="w-8 h-8 text-theme-primary/30" />
            </div>
          </div>

          {/* Title */}
          <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-3 mx-4"></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 w-full flex flex-col">
        {/* Score Details */}
        <div className="space-y-3 mb-4 flex-1">
          {/* Work info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <FiMusic className="w-4 h-4 text-accent-blue/30 mr-2" />
              <div className="h-4 w-32 bg-accent-blue/20 rounded"></div>
            </div>

            <div className="flex items-center justify-center">
              <FiUser className="w-4 h-4 text-theme-tertiary/30 mr-2" />
              <div className="h-4 w-28 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* File info */}
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="h-4 w-24 bg-theme-elevated rounded"></div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <div className="h-6 w-14 bg-accent-blue/10 border border-accent-blue/30 rounded-full"></div>
          <div className="h-6 w-20 bg-accent-green/10 border border-accent-green/30 rounded-full"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
          <div className="h-3 w-28 bg-theme-elevated rounded"></div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-16 bg-brand-primary/20 rounded flex items-center justify-center space-x-1">
              <div className="w-8 h-3 bg-brand-primary/30 rounded"></div>
            </div>
            <div className="h-4 w-12 bg-accent-green/20 rounded flex items-center justify-center space-x-1">
              <FiExternalLink className="w-3 h-3 text-accent-green/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
