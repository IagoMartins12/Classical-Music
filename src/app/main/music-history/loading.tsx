// LoadingSkeleton.tsx - Premium version with theme system
'use client';
import {
  FiChevronDown,
  FiMusic,
  FiGlobe,
  FiUser,
  FiBookOpen,
  FiLock,
} from 'react-icons/fi';
import { GiMusicalNotes, GiScrollQuill } from 'react-icons/gi';

import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';

const DetailedMusicHistorySkeleton = () => {
  // Dados das seções para o skeleton
  const skeletonSections = [
    {
      id: 'timeline-overview',
      icon: <FiLock className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'origins',
      icon: <GiScrollQuill className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'medieval',
      icon: <GiMusicalNotes className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'renaissance',
      icon: <FiGlobe className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'baroque',
      icon: <FiMusic className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'classical',
      icon: <FiUser className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'romantic',
      icon: <FiMusic className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'modern',
      icon: <FiBookOpen className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'contemporary',
      icon: <FiGlobe className="w-6 h-6 text-theme-primary" />,
    },
    {
      id: 'popular-music',
      icon: <FiMusic className="w-6 h-6 text-theme-primary" />,
    },
  ];

  return (
    <div className="w-full bg-gradient-primary py-0 md:py-20 lg:py-20 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Accordion Sections Skeleton */}
        <div className="space-y-6">
          {skeletonSections.map((section, index) => (
            <div
              key={section.id}
              className="classical-card overflow-hidden hover:shadow-theme-glow transition-all duration-200 animate-shimmer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="p-6 cursor-pointer select-none group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br  rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                    >
                      {section.icon}
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-80 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
                      <div className="h-4 w-64 bg-theme-elevated rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-16 bg-theme-elevated rounded animate-pulse"></div>
                    <div
                      className={`w-8 h-8 bg-gradient-to-br rounded-xl flex items-center justify-center`}
                    >
                      <FiChevronDown className="w-4 h-4 text-theme-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingMusicHistorySkeleton = () => {
  return (
    <div className=" bg-gradient-primary">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden bg-gradient-primary pt-8 md:pt-24 lg:pt-24 flex items-center">
        {/* Animated musical notes */}
        <AnimatedMusicalNotes />

        <div className="section-wrap py-24 lg:py-32">
          <div className="text-center">
            {/* Floating Icons Skeleton */}
            <div className="flex justify-center items-center mb-8 space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-shimmer">
                <div className="w-8 h-8 bg-theme-inverse/20 rounded-lg animate-pulse"></div>
              </div>
              <div
                className="w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-shimmer"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="w-10 h-10 bg-theme-inverse/20 rounded-lg animate-pulse"></div>
              </div>
              <div
                className="w-16 h-16 bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-shimmer"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="w-8 h-8 bg-theme-inverse/20 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Title Skeleton */}
            <div className="space-y-6 mb-8">
              <div className="space-y-4">
                <div className="h-16 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-shimmer shadow-theme-medium"></div>
                <div
                  className="h-12 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 rounded-xl mx-auto max-w-xl animate-shimmer"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>

            {/* Subtitle Skeleton */}
            <div className="space-y-4 mb-8">
              <div
                className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-4xl animate-shimmer"
                style={{ animationDelay: '0.3s' }}
              ></div>
              <div
                className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-3xl animate-shimmer"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>

            {/* Feature Stats Skeleton */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="classical-card p-6 text-center group animate-shimmer"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-theme-elevated to-interactive-hover border border-theme-primary rounded-xl mx-auto mb-4"></div>
                  <div className="h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg mb-2"></div>
                  <div className="h-4 bg-theme-elevated rounded"></div>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="section-wrap space-y-12 relative z-10">
        <DetailedMusicHistorySkeleton />
        {/* Navigation Tabs Skeleton */}
        <div className="classical-card p-8 animate-shimmer">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl"></div>
              <div className="h-6 w-48 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-lg"></div>
            </div>
            <div className="h-4 w-64 bg-theme-elevated rounded mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="classical-card-simple p-6 animate-shimmer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded"></div>
                    <div className="h-4 bg-theme-elevated rounded w-4/5"></div>
                    <div className="h-3 bg-theme-elevated rounded w-3/5"></div>
                  </div>
                  <div className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Epoch Sections Skeleton */}
        <div className="space-y-20">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } gap-12 items-start animate-shimmer`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Content Section */}
              <div className="flex-1 space-y-8">
                {/* Header */}
                <div className="relative flex justify-center lg:justify-start">
                  <div className="inline-flex items-center px-12 py-4 rounded-2xl bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 shadow-theme-glow backdrop-blur-md">
                    <div className="w-12 h-12 bg-theme-inverse/20 rounded-xl mr-4"></div>
                    <div className="space-y-2">
                      <div className="h-8 w-48 bg-theme-primary/30 rounded"></div>
                      <div className="h-4 w-32 bg-theme-inverse/20 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="classical-card p-8 group">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl"></div>
                    <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-theme-elevated rounded"></div>
                    <div className="h-4 bg-theme-elevated rounded w-4/5"></div>
                    <div className="h-4 bg-theme-elevated rounded w-3/4"></div>
                    <div className="h-4 bg-theme-elevated rounded w-5/6"></div>
                  </div>
                </div>

                {/* Details Card */}
                <div className="classical-card overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl"></div>
                      <div className="h-6 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl"></div>
                            <div className="h-5 w-24 bg-theme-elevated rounded"></div>
                          </div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((subItem) => (
                              <div
                                key={subItem}
                                className="flex items-start space-x-3 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary/20 rounded-xl"
                              >
                                <div className="w-2 h-2 bg-accent-blue/30 rounded-full mt-2"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-3 bg-theme-elevated rounded"></div>
                                  <div className="h-3 bg-theme-elevated rounded w-4/5"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Composers Section */}
              <div className="flex-1 w-full lg:max-w-md">
                <div className="classical-card p-6 sticky top-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                      <div className="h-3 w-24 bg-theme-elevated rounded"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((composer) => (
                      <div
                        key={composer}
                        className="classical-card-simple p-4 animate-shimmer"
                        style={{ animationDelay: `${composer * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl shadow-theme-medium flex-shrink-0"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                            <div className="h-3 bg-theme-elevated rounded w-2/3"></div>
                          </div>
                          <div className="w-6 h-6 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-theme-elevated rounded"></div>
                          <div className="h-3 bg-theme-elevated rounded w-4/5"></div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-theme-secondary">
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-brand-primary/30 rounded-full"></div>
                            <div className="h-3 w-16 bg-theme-elevated rounded"></div>
                          </div>
                          <div className="w-3 h-3 bg-theme-elevated rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed History Skeleton */}
        <div className="space-y-8">
          {[1, 2, 3].map((section) => (
            <div
              key={section}
              className="classical-card p-8 animate-shimmer"
              style={{ animationDelay: `${section * 0.3}s` }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-gold/20 to-brand-secondary/20 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="h-6 w-64 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  <div className="h-4 w-48 bg-theme-elevated rounded"></div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="h-4 bg-theme-elevated rounded"></div>
                <div className="h-4 bg-theme-elevated rounded w-5/6"></div>
                <div className="h-4 bg-theme-elevated rounded w-4/5"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((card) => (
                  <div key={card} className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl"></div>
                      <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-theme-elevated rounded"></div>
                      <div className="h-3 bg-theme-elevated rounded w-4/5"></div>
                      <div className="h-3 bg-theme-elevated rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div
        className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className="fixed bottom-20 right-4 w-1.5 h-1.5 bg-accent-blue/30 rounded-full animate-pulse"
        style={{ animationDelay: '0.5s' }}
      ></div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(212, 175, 55, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingMusicHistorySkeleton;
