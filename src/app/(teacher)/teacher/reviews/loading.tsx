// app/teacher/reviews/loading.tsx - Loading para Avaliações do Professor
'use client';

import {
  FiStar,
  FiThumbsUp,
  FiTarget,
  FiAward,
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiMessageSquare,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function TeacherReviewsLoading() {
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
          <FiThumbsUp />
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
        <div className="text-center mb-8 py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 bg-theme-inverse/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-lg animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Main Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <FiStar className="w-8 h-8 text-theme-inverse/20" /> },
            { icon: <FiUsers className="w-8 h-8 text-theme-inverse/20" /> },
            { icon: <FiThumbsUp className="w-8 h-8 text-theme-inverse/20" /> },
            {
              icon: <FiTrendingUp className="w-8 h-8 text-theme-inverse/20" />,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="classical-card p-6 text-center animate-pulse"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg mb-2 w-16 mx-auto"></div>
              <div className="flex justify-center mb-2">
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-accent-yellow/30 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="h-4 bg-theme-elevated rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Detailed Stats Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Rating Distribution */}
          <div className="classical-card p-6 animate-pulse">
            <div className="flex items-center space-x-2 mb-6">
              <FiBarChart2 className="w-5 h-5 text-theme-primary/30" />
              <div className="h-5 w-48 bg-theme-primary/30 rounded"></div>
            </div>

            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-20">
                    <div className="h-4 w-2 bg-theme-primary/30 rounded"></div>
                    <FiStar className="w-4 h-4 text-accent-yellow/30" />
                  </div>

                  <div className="flex-1 bg-theme-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-yellow/30 to-accent-orange/30 h-2 rounded-full"
                      style={{ width: `${Math.random() * 80 + 10}%` }}
                    />
                  </div>

                  <div className="w-16 text-right">
                    <div className="h-3 w-12 bg-theme-tertiary/30 rounded ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specific Ratings */}
          <div className="classical-card p-6 animate-pulse">
            <div className="flex items-center space-x-2 mb-6">
              <FiTarget className="w-5 h-5 text-theme-primary/30" />
              <div className="h-5 w-40 bg-theme-primary/30 rounded"></div>
            </div>

            <div className="space-y-4">
              {[
                'Qualidade do Ensino',
                'Comunicação',
                'Pontualidade',
                'Preparação',
                'Paciência',
                'Motivação',
              ].map((label, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-theme-secondary/30 rounded"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-6 bg-accent-green/30 rounded"></div>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-accent-yellow/30 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strong Points */}
          <div className="classical-card p-6 animate-pulse">
            <div className="flex items-center space-x-2 mb-4">
              <FiAward className="w-5 h-5 text-accent-green/30" />
              <div className="h-5 w-32 bg-theme-primary/30 rounded"></div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-green/30 rounded-full"></div>
                  <div className="h-3 bg-theme-secondary/30 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="classical-card p-6 animate-pulse">
            <div className="flex items-center space-x-2 mb-4">
              <FiTarget className="w-5 h-5 text-accent-blue/30" />
              <div className="h-5 w-40 bg-theme-primary/30 rounded"></div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-blue/30 rounded-full"></div>
                  <div className="h-3 bg-theme-secondary/30 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-20 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-24 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-32 bg-theme-elevated rounded"></div>
            </div>

            <div className="h-3 w-48 bg-theme-tertiary/30 rounded"></div>
          </div>

          {/* Expanded Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-theme-secondary">
            <div>
              <div className="h-3 w-10 bg-theme-tertiary/30 rounded mb-2"></div>
              <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            </div>
            <div>
              <div className="h-3 w-12 bg-theme-tertiary/30 rounded mb-2"></div>
              <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            </div>
            <div>
              <div className="h-3 w-20 bg-theme-tertiary/30 rounded mb-2"></div>
              <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            </div>
            <div>
              <div className="h-3 w-16 bg-theme-tertiary/30 rounded mb-2"></div>
              <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Reviews List Skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </div>

        {/* Load More Skeleton */}
        <div className="text-center py-8">
          <div className="h-10 w-48 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Review Card Skeleton
function ReviewCardSkeleton() {
  const hasComment = Math.random() > 0.3;
  const hasSpecificRatings = Math.random() > 0.4;

  return (
    <div className="classical-card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {/* Student Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>

          <div>
            {/* Student Name */}
            <div className="h-5 w-32 bg-theme-primary/30 rounded mb-1"></div>

            {/* Rating and Date */}
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-accent-yellow/30 rounded"
                  ></div>
                ))}
              </div>
              <div className="h-3 w-8 bg-theme-primary/30 rounded"></div>
              <div className="h-3 w-16 bg-theme-tertiary/30 rounded"></div>
            </div>

            {/* Relationship Duration */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="h-3 w-24 bg-theme-tertiary/30 rounded"></div>
              <div className="h-3 w-16 bg-theme-tertiary/30 rounded"></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-accent-green/30 rounded"></div>
          <div className="w-4 h-4 bg-accent-green/30 rounded"></div>
        </div>
      </div>

      {/* Comment */}
      {hasComment && (
        <div className="mb-4">
          <div className="space-y-2">
            <div className="h-3 bg-theme-secondary/30 rounded w-full"></div>
            <div className="h-3 bg-theme-secondary/30 rounded w-5/6"></div>
            <div className="h-3 bg-theme-secondary/30 rounded w-3/4"></div>
          </div>
        </div>
      )}

      {/* Specific Ratings */}
      {hasSpecificRatings && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-theme-secondary">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-16 bg-theme-tertiary/30 rounded"></div>
              <div className="flex items-center space-x-1">
                <div className="h-3 w-6 bg-theme-primary/30 rounded"></div>
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 bg-accent-yellow/30 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderation Notice */}
      {Math.random() > 0.7 && (
        <div className="mt-4 p-3 bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiMessageSquare className="w-4 h-4 text-accent-yellow/50" />
            <div className="h-3 w-32 bg-accent-yellow/30 rounded"></div>
          </div>
          <div className="h-3 w-48 bg-theme-tertiary/30 rounded mt-1"></div>
        </div>
      )}
    </div>
  );
}
