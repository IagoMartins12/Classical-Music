// app/uploads/history/loading.tsx
'use client';

import {
  FiClock,
  FiUser,
  FiMusic,
  FiFile,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiCalendar,
  FiActivity,
  FiChevronDown,
  FiEye,
  FiMapPin,
  FiMonitor,
  FiRefreshCw,
} from 'react-icons/fi';

export default function HistoryLoading() {
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
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <FiClock className="w-8 h-8 text-theme-primary/30" />
            </div>
          </div>
          <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-md mb-4"></div>
          <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="classical-card p-6 mb-8">
          <div className="space-y-4">
            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-16 bg-theme-elevated rounded"></div>
                <div className="h-4 w-32 bg-theme-elevated rounded"></div>
              </div>
              <div className="h-10 w-24 bg-theme-secondary rounded-lg flex items-center justify-center space-x-2">
                <FiFilter className="w-4 h-4 text-theme-tertiary/30" />
                <div className="w-12 h-4 bg-theme-tertiary/30 rounded"></div>
                <FiChevronDown className="w-4 h-4 text-theme-tertiary/30" />
              </div>
            </div>

            {/* Filter Options - Expanded */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme-secondary">
              <div>
                <div className="h-4 w-20 bg-theme-elevated rounded mb-2"></div>
                <div className="h-12 bg-theme-secondary border border-theme-primary/20 rounded-lg"></div>
              </div>

              <div>
                <div className="h-4 w-12 bg-theme-elevated rounded mb-2"></div>
                <div className="h-12 bg-theme-secondary border border-theme-primary/20 rounded-lg"></div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <div className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg"></div>
              <div className="h-10 w-20 bg-theme-secondary rounded-lg"></div>
            </div> */}
          </div>
        </div>

        {/* History Timeline Skeleton */}
        <div className="space-y-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-theme-secondary/50"></div>

            {Array.from({ length: 5 }).map((_, index) => (
              <HistoryRecordSkeleton key={index} index={index} />
            ))}
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

// Skeleton for History Record
function HistoryRecordSkeleton({ index }: { index: number }) {
  const actionTypes = [
    {
      icon: <FiPlus className="w-5 h-5 text-theme-primary/30" />,
      gradient: 'from-green-400 to-green-600',
      borderColor: 'border-l-green-500',
    },
    {
      icon: <FiEdit className="w-5 h-5 text-theme-primary/30" />,
      gradient: 'from-blue-400 to-blue-600',
      borderColor: 'border-l-blue-500',
    },
    {
      icon: <FiTrash2 className="w-5 h-5 text-theme-primary/30" />,
      gradient: 'from-red-400 to-red-600',
      borderColor: 'border-l-red-500',
    },
  ];

  const actionType = actionTypes[index % 3];

  return (
    <div className="relative flex items-start space-x-4 pb-6">
      {/* Timeline Dot */}
      <div
        className={`relative z-10 w-12 h-12 bg-gradient-to-br ${actionType.gradient}/20 rounded-full flex items-center justify-center shadow-lg`}
      >
        {actionType.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={`classical-card-2 p-4 border-l-4 ${actionType.borderColor}/20`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-32 bg-theme-elevated rounded"></div>
              <div className="h-6 w-16 bg-accent-blue/10 border border-accent-blue/20 rounded-full"></div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-xs">
                <FiCalendar className="w-3 h-3 text-theme-tertiary/30" />
                <div className="h-3 w-16 bg-theme-elevated rounded"></div>
              </div>

              <div className="w-6 h-6 rounded-full bg-theme-secondary/50 flex items-center justify-center">
                <FiEye className="w-3 h-3 text-theme-tertiary/30" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-32 bg-theme-elevated rounded"></div>
            <div className="h-4 w-40 bg-theme-elevated rounded"></div>
            <div className="h-3 w-48 bg-theme-elevated rounded"></div>
          </div>

          {/* Changes Summary */}
          <div className="mt-3 p-3 bg-blue-50/10 border border-blue-200/20 rounded-lg">
            <div className="flex items-center mb-2">
              <FiEdit className="w-4 h-4 text-theme-primary/30 mr-1" />
              <div className="h-4 w-20 bg-blue-700/20 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="h-3 w-24 bg-blue-700/20 rounded mb-1"></div>
                <div className="pl-2 border-l-2 border-blue-300/30">
                  <div className="flex items-center">
                    <div className="w-8 h-3 bg-red-600/20 rounded mr-2"></div>
                    <div className="h-3 w-16 bg-red-600/20 rounded"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-3 bg-green-600/20 rounded mr-2"></div>
                    <div className="h-3 w-20 bg-green-600/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical details for expanded state */}
          {index === 0 && (
            <div className="mt-3 pt-3 border-t border-theme-secondary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-3 h-3 text-theme-tertiary/30" />
                  <div className="h-3 w-24 bg-theme-elevated rounded"></div>
                </div>

                <div className="flex items-center space-x-2">
                  <FiMonitor className="w-3 h-3 text-theme-tertiary/30" />
                  <div className="h-3 w-32 bg-theme-elevated rounded"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
