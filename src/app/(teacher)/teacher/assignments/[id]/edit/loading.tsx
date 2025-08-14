// app/teacher/assignments/[id]/loading.tsx - Loading para Detalhes da Tarefa
'use client';

import {
  FiClipboard,
  FiTarget,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiMusic,
  FiStar,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function AssignmentDetailsLoading() {
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
          <FiClipboard />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiTarget />
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
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            <div>
              <div className="h-8 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2 w-64"></div>
              <div className="h-4 bg-theme-elevated rounded w-40"></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-20 bg-gradient-to-r from-accent-green/20 to-accent-green/20 border border-accent-green/30 rounded-full"></div>
            <div className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assignment Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-48 mb-6"></div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-8"></div>
                    <div className="h-4 bg-theme-primary/30 rounded w-20"></div>
                  </div>

                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-16"></div>
                    <div className="h-6 w-16 bg-gradient-to-r from-accent-yellow/20 to-accent-yellow/20 border border-accent-yellow/30 rounded-full"></div>
                  </div>

                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-12"></div>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-4 bg-theme-primary/30 rounded w-24"></div>
                      <div className="h-4 bg-accent-yellow/30 rounded w-20"></div>
                    </div>
                  </div>

                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-24"></div>
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-4 bg-theme-primary/30 rounded w-20"></div>
                      <div className="h-4 bg-theme-tertiary/30 rounded w-16"></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-16"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-4 bg-theme-primary/20 rounded w-5/6"></div>
                    <div className="h-4 bg-theme-primary/20 rounded w-4/6"></div>
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-32"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <FiTarget className="w-4 h-4 text-accent-blue/30" />
                        <div className="h-3 bg-theme-primary/20 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-28"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <FiTarget className="w-4 h-4 text-accent-green/30" />
                        <div className="h-3 bg-theme-primary/20 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-20"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <FiBookOpen className="w-4 h-4 text-accent-purple/30" />
                        <div className="h-3 bg-theme-primary/20 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-16"></div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="w-full bg-theme-secondary rounded-full h-3">
                        <div className="bg-gradient-to-r from-brand-primary/30 to-brand-secondary/30 h-3 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Musical Pieces Section */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-2 mb-4">
                <FiMusic className="w-5 h-5 text-theme-primary/30" />
                <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-48"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <MusicalPieceCardSkeleton key={i} />
                ))}
              </div>
            </div>

            {/* Student Submission */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-36 mb-4"></div>

              <div className="h-3 bg-theme-tertiary/30 rounded mb-4 w-48"></div>

              {/* Student Notes */}
              <div className="mb-6">
                <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-32"></div>
                <div className="p-4 bg-theme-secondary/10 rounded-lg border">
                  <div className="space-y-2">
                    <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-4/5"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-3/5"></div>
                  </div>
                </div>
              </div>

              {/* Student Rating */}
              <div className="mb-6">
                <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-40"></div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className="w-5 h-5 text-accent-yellow/30"
                      />
                    ))}
                  </div>
                  <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                </div>
              </div>

              {/* Submission Files */}
              <div className="space-y-4">
                <div className="h-4 bg-theme-primary/30 rounded w-32"></div>
                <div className="h-3 bg-theme-tertiary/30 rounded w-48"></div>
              </div>
            </div>

            {/* Teacher Feedback */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-28"></div>
                <div className="h-8 w-16 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              </div>

              <div className="space-y-4">
                {/* Feedback Text */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-20"></div>
                  <div className="p-4 bg-theme-secondary/10 rounded-lg border">
                    <div className="space-y-2">
                      <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                      <div className="h-3 bg-theme-primary/20 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>

                {/* Teacher Rating */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-24"></div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          className="w-6 h-6 text-accent-yellow/30"
                        />
                      ))}
                    </div>
                    <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-12 mb-4"></div>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded mb-1 w-24"></div>
                  <div className="h-3 bg-brand-primary/30 rounded w-20"></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-12 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gradient-to-r from-accent-green/20 to-accent-green/20 border border-accent-green/30 rounded-lg w-full"></div>
                <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-20 mb-4"></div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-16"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-12"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-16"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-accent-purple/30 rounded w-20"></div>
                </div>
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

// Musical Piece Card Skeleton
function MusicalPieceCardSkeleton() {
  return (
    <div className="classical-card-2 p-4 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-theme-primary/30 rounded mb-1 w-3/4"></div>
          <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-1/2"></div>
          <div className="h-3 bg-accent-green/30 rounded w-20"></div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-theme-secondary">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-theme-tertiary/30 rounded w-12"></div>
          <div className="flex space-x-2">
            <div className="w-6 h-6 bg-theme-elevated rounded"></div>
            <div className="w-6 h-6 bg-theme-elevated rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
