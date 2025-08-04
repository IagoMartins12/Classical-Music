// app/difficulty/loading.tsx - Loading Component
'use client';
import AnimatedMusicalNotes2 from '@/app/components/AnimatedMusicalNotes2';
import { FiTrendingUp, FiMusic } from 'react-icons/fi';

export default function DifficultyLoading() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="section-wrap">
        {/* Header Skeleton */}
        <div className="relative text-center py-16">
          <AnimatedMusicalNotes2 />

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow animate-pulse">
                <FiTrendingUp className="w-10 h-10 text-theme-primary" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-12 bg-theme-elevated rounded-xl animate-pulse mx-auto max-w-md"></div>
              <div className="h-6 bg-theme-elevated rounded-lg animate-pulse mx-auto max-w-2xl"></div>
              <div className="h-8 bg-theme-elevated rounded-full animate-pulse mx-auto max-w-xs"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-theme-elevated rounded-2xl mr-4"></div>
            <div className="space-y-2">
              <div className="h-6 bg-theme-elevated rounded w-48"></div>
              <div className="h-4 bg-theme-elevated rounded w-64"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-theme-elevated rounded-xl p-4 border border-theme-secondary"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-theme-tertiary rounded-lg"></div>
                  <div className="h-8 bg-theme-tertiary rounded w-12"></div>
                </div>
                <div className="h-4 bg-theme-tertiary rounded mb-2"></div>
                <div className="h-3 bg-theme-tertiary rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-6 bg-theme-elevated rounded w-48"></div>
              <div className="h-4 bg-theme-elevated rounded w-64"></div>
            </div>
            <div className="h-10 bg-theme-elevated rounded w-32"></div>
          </div>

          <div className="h-12 bg-theme-elevated rounded-lg mb-6"></div>

          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-8 bg-theme-elevated rounded-full w-20"
              ></div>
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-theme-elevated rounded-xl mr-3"></div>
            <div className="space-y-2">
              <div className="h-5 bg-theme-elevated rounded w-40"></div>
              <div className="h-4 bg-theme-elevated rounded w-56"></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-theme-elevated rounded-xl w-24"
              ></div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="classical-card overflow-hidden animate-pulse">
          <div className="p-6 border-b border-theme-secondary">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-theme-elevated rounded-xl mr-3"></div>
              <div className="space-y-2">
                <div className="h-5 bg-theme-elevated rounded w-40"></div>
                <div className="h-4 bg-theme-elevated rounded w-48"></div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-theme-elevated border-b border-theme-secondary">
                <tr>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="text-left py-4 px-6">
                      <div className="h-4 bg-theme-tertiary rounded w-16"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-secondary">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-theme-elevated rounded-full w-16"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="h-5 bg-theme-elevated rounded w-48"></div>
                        <div className="h-3 bg-theme-elevated rounded w-32"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-theme-elevated rounded-full mr-2"></div>
                        <div className="h-4 bg-theme-elevated rounded w-24"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <FiMusic className="w-4 h-4 text-theme-tertiary mr-2" />
                        <div className="h-4 bg-theme-elevated rounded w-20"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <div className="h-6 bg-theme-elevated rounded w-12"></div>
                        <div className="h-6 bg-theme-elevated rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Loading */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="classical-card p-4 flex items-center space-x-3">
            <div className="w-6 h-6 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-theme-primary font-medium">
              Carregando níveis de dificuldade...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
