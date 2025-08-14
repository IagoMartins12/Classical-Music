// app/student/reviews/loading.tsx - Loading para Avaliações dos Professores
'use client';

import {
  FiStar,
  FiUser,
  FiClock,
  FiCheck,
  FiHeart,
  FiRefreshCw,
  FiEye,
  FiThumbsUp,
  FiEdit3,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function StudentReviewsLoading() {
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
          <FiStar />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiUser />
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

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <FiUser className="w-6 h-6 text-theme-inverse/20" />,
              color: 'from-brand-primary/20 to-brand-secondary/20',
            },
            {
              icon: <FiCheck className="w-6 h-6 text-theme-inverse/20" />,
              color: 'from-accent-green/20 to-accent-blue/20',
            },
            {
              icon: <FiClock className="w-6 h-6 text-theme-inverse/20" />,
              color: 'from-accent-yellow/20 to-accent-orange/20',
            },
            {
              icon: <FiHeart className="w-6 h-6 text-theme-inverse/20" />,
              color: 'from-accent-purple/20 to-accent-pink/20',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="classical-card p-6 text-center animate-pulse"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
              >
                {item.icon}
              </div>
              <div className="h-6 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded mb-2"></div>
              <div className="h-3 bg-theme-elevated rounded"></div>
            </div>
          ))}
        </div>

        {/* Controls Skeleton */}
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="h-8 bg-theme-primary/30 rounded w-32"></div>
          <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-4 flex items-center space-x-2">
            <FiRefreshCw className="w-4 h-4 text-theme-tertiary/30" />
            <div className="h-4 w-16 bg-theme-tertiary/20 rounded"></div>
          </div>
        </div>

        {/* Teachers Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <TeacherReviewCardSkeleton key={index} delay={index * 0.1} />
          ))}
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Teacher Review Card Skeleton Component
function TeacherReviewCardSkeleton({ delay = 0 }: { delay?: number }) {
  const hasReview = Math.random() > 0.4; // 60% chance of having review

  return (
    <div
      className="classical-card p-6 animate-pulse"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Teacher Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-theme-inverse/30 rounded-full"></div>
        </div>
        <div className="flex-1">
          <div className="h-5 bg-theme-primary/30 rounded w-32 mb-1"></div>
          <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="h-6 bg-theme-primary/30 rounded w-8 mx-auto mb-1"></div>
          <div className="h-3 bg-theme-tertiary/30 rounded w-16 mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-6 bg-theme-primary/30 rounded w-8 mx-auto mb-1"></div>
          <div className="h-3 bg-theme-tertiary/30 rounded w-20 mx-auto"></div>
        </div>
      </div>

      {/* Review Status */}
      {hasReview ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-accent-green/30 rounded w-28"></div>
            <div className="flex items-center space-x-1">
              <FiEdit3 className="w-3 h-3 text-theme-tertiary/30" />
              <div className="h-3 bg-brand-primary/30 rounded w-10"></div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-accent-green/5 to-accent-blue/5 rounded-lg border border-accent-green/20 p-4">
            <div className="flex items-center justify-between mb-2">
              {/* Stars */}
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className="w-4 h-4 text-accent-yellow/30"
                  />
                ))}
              </div>
              <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
            </div>

            <div className="h-3 bg-theme-secondary/30 rounded w-full mb-1"></div>
            <div className="h-3 bg-theme-secondary/30 rounded w-3/4"></div>

            <div className="flex items-center justify-between mt-3">
              <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
              <div className="flex items-center space-x-1">
                <FiThumbsUp className="w-3 h-3 text-accent-green/30" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-theme-secondary rounded-lg">
            <div className="text-center">
              <FiStar className="w-8 h-8 text-theme-tertiary/30 mx-auto mb-2" />
              <div className="h-3 bg-theme-tertiary/30 rounded w-24 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div
        className={`w-full h-10 rounded-lg flex items-center justify-center space-x-2 ${
          hasReview
            ? 'bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary'
            : 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30'
        }`}
      >
        {hasReview ? (
          <>
            <FiEye className="w-4 h-4 text-theme-tertiary/30" />
            <div className="h-4 w-20 bg-theme-tertiary/20 rounded"></div>
          </>
        ) : (
          <>
            <FiStar className="w-4 h-4 text-theme-inverse/30" />
            <div className="h-4 w-24 bg-theme-inverse/30 rounded"></div>
          </>
        )}
      </div>
    </div>
  );
}
