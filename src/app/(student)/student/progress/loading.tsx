// app/student/progress/loading.tsx - Loading para Progresso do Aluno
'use client';

import {
  FiTrendingUp,
  FiBookOpen,
  FiClock,
  FiAward,
  FiTarget,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiRefreshCw,
  FiCheckCircle,
  FiMusic,
  FiHeart,
  FiStar,
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function StudentProgressLoading() {
  return (
    <div className="bg-gradient-primary min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-brand-primary/10 animate-float">
          <FiTrendingUp />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiBarChart2 />
        </div>
        <div
          className="absolute top-1/3 right-24 text-3xl text-accent-purple/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/3 left-24 text-3xl text-accent-blue/10 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <GiMusicalNotes />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-8 animate-pulse">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <div className="w-8 h-8 bg-theme-inverse/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-lg shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
          </div>
        </div>

        {/* Period Selector Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-6 bg-theme-primary/30 rounded w-32"></div>
            <div className="h-4 bg-theme-tertiary/30 rounded w-48"></div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-10 w-48 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            <div className="w-12 h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg flex items-center justify-center">
              <FiRefreshCw className="w-5 h-5 text-theme-tertiary/30" />
            </div>
          </div>
        </div>

        {/* Main Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <FiBookOpen className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiClock className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiMusic className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FaFire className="w-6 h-6 text-theme-inverse/20" /> },
          ].map((item, index) => (
            <div key={index} className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-8 bg-theme-primary/30 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-accent-blue/20 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <FiTarget className="w-5 h-5 text-theme-inverse/20" /> },
            { icon: <FiCalendar className="w-5 h-5 text-theme-inverse/20" /> },
            { icon: <FiBookOpen className="w-5 h-5 text-theme-inverse/20" /> },
          ].map((item, index) => (
            <div key={index} className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-theme-primary/30 rounded w-24"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-theme-secondary/30 rounded w-20"></div>
                  <div className="h-4 bg-theme-primary/30 rounded w-12"></div>
                </div>

                <div className="w-full bg-theme-secondary/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-accent-blue/30 to-accent-purple/30 h-2 rounded-full w-3/4"></div>
                </div>

                <div className="text-center">
                  <div className="h-3 bg-accent-green/20 rounded w-16 mx-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Monthly Progress Chart */}
          <div className="classical-card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 bg-theme-primary/30 rounded w-32"></div>
              <FiBarChart2 className="w-6 h-6 text-brand-primary/30" />
            </div>

            <div className="h-80 bg-gradient-to-r from-theme-elevated/30 to-interactive-hover/30 rounded-lg border border-theme-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FiBarChart2 className="w-8 h-8 text-theme-tertiary/30" />
                </div>
                <div className="h-4 bg-theme-tertiary/20 rounded w-32 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Assignment Types Chart */}
          <div className="classical-card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 bg-theme-primary/30 rounded w-40"></div>
              <FiTarget className="w-6 h-6 text-brand-primary/30" />
            </div>

            <div className="h-80 bg-gradient-to-r from-theme-elevated/30 to-interactive-hover/30 rounded-lg border border-theme-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-theme-tertiary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FiTarget className="w-12 h-12 text-theme-tertiary/30" />
                </div>
                <div className="h-4 bg-theme-tertiary/20 rounded w-36 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Breakdown Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-theme-primary/30 rounded w-48"></div>
            <FiUsers className="w-6 h-6 text-brand-primary/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-4 bg-theme-elevated/30 rounded-lg border border-theme-secondary/30"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-theme-secondary/30 rounded w-12"></div>
                    <div className="h-3 bg-theme-primary/30 rounded w-8"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-theme-secondary/30 rounded w-10"></div>
                    <div className="h-3 bg-theme-primary/30 rounded w-10"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-theme-secondary/30 rounded w-16"></div>
                    <div className="flex items-center space-x-1">
                      <div className="h-3 bg-accent-yellow/30 rounded w-6"></div>
                      <FiStar className="w-3 h-3 text-accent-yellow/30" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-5 w-16 bg-brand-primary/10 border border-brand-primary/30 rounded-full"
                    ></div>
                  ))}
                  <div className="h-5 w-8 bg-theme-secondary/30 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-theme-primary/30 rounded w-24"></div>
            <FiAward className="w-6 h-6 text-brand-primary/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-accent-green/5 to-accent-blue/5 border border-accent-green/30 rounded-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-full flex items-center justify-center">
                    <FiAward className="w-4 h-4 text-theme-inverse/20" />
                  </div>
                  <div className="h-4 bg-theme-primary/30 rounded w-32"></div>
                </div>
                <div className="h-3 bg-theme-secondary/30 rounded w-full mb-2"></div>
                <div className="h-3 bg-accent-green/20 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Works Progress Skeleton */}
        <div className="classical-card p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-theme-primary/30 rounded w-36"></div>
            <div className="h-4 bg-brand-primary/30 rounded w-20"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learned Works */}
            <div>
              <div className="h-4 bg-theme-primary/30 rounded w-40 mb-4 flex items-center">
                <FiCheckCircle className="w-5 h-5 mr-2 text-accent-green/30" />
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 bg-theme-elevated/30 rounded-lg border border-theme-secondary/30"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="h-4 bg-theme-primary/30 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-1"></div>
                        <div className="h-5 w-16 bg-accent-blue/10 border border-accent-blue/30 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-1 ml-3">
                        <div className="h-3 bg-theme-secondary/30 rounded w-6"></div>
                        <FiStar className="w-3 h-3 text-accent-yellow/30" />
                      </div>
                    </div>
                    <div className="h-3 bg-accent-green/20 rounded w-28 mt-2"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Want to Learn */}
            <div>
              <div className="h-4 bg-theme-primary/30 rounded w-32 mb-4 flex items-center">
                <FiHeart className="w-5 h-5 mr-2 text-accent-blue/30" />
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 bg-theme-elevated/30 rounded-lg border border-theme-secondary/30"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="h-4 bg-theme-primary/30 rounded w-28 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-20 mb-1"></div>
                        <div className="h-5 w-14 bg-accent-blue/10 border border-accent-blue/30 rounded"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-theme-secondary/30 rounded w-32 mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}
