import React from 'react';
import {
  FiChevronDown,
  FiMusic,
  FiGlobe,
  FiUser,
  FiBookOpen,
  FiLock,
} from 'react-icons/fi';
import { GiMusicalNotes, GiScrollQuill } from 'react-icons/gi';

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

export default DetailedMusicHistorySkeleton;
