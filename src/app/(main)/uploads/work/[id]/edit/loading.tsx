// app/uploads/work/[id]/edit/loading.tsx
'use client';

import {
  FiCalendar,
  FiClock,
  FiMusic,
  FiActivity,
  FiMapPin,
  FiLayers,
  FiBookOpen,
  FiEdit3,
  FiSave,
  FiTrash2,
  FiUser,
  FiTarget,
  FiTag,
  FiExternalLink,
} from 'react-icons/fi';
import { GiMusicalNotes, GiMetronome } from 'react-icons/gi';

export default function EditWorkLoading() {
  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb Skeleton */}
        <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
          <div className="h-4 w-16 bg-theme-elevated rounded"></div>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="h-4 w-16 bg-theme-elevated rounded"></div>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="h-4 w-32 bg-theme-primary/20 rounded"></div>
        </nav>

        {/* Header Principal */}
        <div className="classical-card overflow-hidden relative">
          <div className="p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Informações Principais */}
              <div className="lg:col-span-3 space-y-6">
                {/* Título e Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                          <FiEdit3 className="w-5 h-5 text-theme-primary/30" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-10 w-48 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded"></div>
                          <div className="h-5 w-40 bg-theme-elevated rounded"></div>
                        </div>
                      </div>

                      <div className="h-12 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded mb-2"></div>

                      {/* Subtitle */}
                      <div className="h-8 bg-theme-elevated rounded w-3/4 mt-2"></div>

                      <div className="flex items-center space-x-2 mt-3">
                        <div className="h-6 w-8 bg-theme-elevated rounded"></div>
                        <div className="h-6 w-32 bg-brand-primary/20 rounded"></div>
                      </div>
                      <div className="h-5 w-24 bg-theme-elevated rounded mt-2"></div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="h-10 w-20 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg flex items-center justify-center space-x-2">
                        <FiSave className="w-4 h-4 text-theme-primary/30" />
                        <div className="w-8 h-4 bg-theme-primary/30 rounded"></div>
                      </div>

                      <div className="h-10 w-24 bg-accent-red/20 border border-accent-red/30 rounded-lg flex items-center justify-center space-x-2">
                        <FiTrash2 className="w-4 h-4 text-accent-red/30" />
                        <div className="w-12 h-4 bg-accent-red/30 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Level Badge */}
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-40 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 rounded-full flex items-center justify-center space-x-2">
                      <FiTarget className="w-4 h-4 text-theme-primary/30" />
                      <div className="w-24 h-4 bg-theme-primary/30 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Grid de Informações Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: (
                        <FiCalendar className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-blue',
                    },
                    {
                      icon: (
                        <FiClock className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-purple to-accent-blue',
                    },
                    {
                      icon: (
                        <FiMusic className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-brand-primary to-brand-secondary',
                    },
                    {
                      icon: (
                        <FiActivity className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-red to-accent-purple',
                    },
                    {
                      icon: (
                        <GiMetronome className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-purple',
                    },
                    {
                      icon: (
                        <GiMusicalNotes className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-blue to-accent-purple',
                    },
                    {
                      icon: (
                        <FiMapPin className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-red to-accent-purple',
                    },
                    {
                      icon: (
                        <FiLayers className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-blue',
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 group"
                    >
                      <div
                        className={`w-8 h-8 bg-gradient-to-br ${item.gradient}/20 rounded-xl flex items-center justify-center mt-0.5`}
                      >
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                        <div className="h-5 w-20 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Informações Adicionais */}
                <div className="border-t border-theme-secondary pt-6">
                  <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                    <FiBookOpen className="w-5 h-5 text-accent-blue/30" />
                    <div className="h-5 w-48 bg-theme-elevated rounded"></div>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-24 bg-theme-primary/20 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-20 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-28 bg-theme-primary/20 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-20 bg-theme-primary/20 rounded"></div>
                    </div>
                    <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated/50 to-interactive-hover/50 rounded-xl border border-theme-primary/20">
                      <div className="h-4 w-32 bg-theme-elevated rounded mb-1"></div>
                      <div className="space-y-1">
                        <div className="h-3 bg-theme-secondary rounded"></div>
                        <div className="h-3 bg-theme-secondary rounded w-5/6"></div>
                        <div className="h-3 bg-theme-secondary rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags de Categorias e Gêneros */}
                <div className="border-t border-theme-secondary pt-6">
                  <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                    <FiTag className="w-5 h-5 text-accent-green/30" />
                    <div className="h-5 w-44 bg-theme-elevated rounded"></div>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 w-20 bg-theme-elevated rounded mb-3"></div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-8 w-24 bg-brand-primary/10 border border-brand-primary/30 rounded-full"
                          ></div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="h-4 w-28 bg-theme-elevated rounded mb-3"></div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-8 w-20 bg-accent-green/10 border border-accent-green/30 rounded-full"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link IMSLP */}
                <div className="border-t border-theme-secondary pt-6">
                  <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                    <FiExternalLink className="w-5 h-5 text-accent-blue/30" />
                    <div className="h-5 w-24 bg-theme-elevated rounded"></div>
                  </h3>
                  <div className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg flex items-center justify-center space-x-2">
                    <FiBookOpen className="w-4 h-4 text-theme-primary/30" />
                    <div className="w-16 h-4 bg-theme-primary/30 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Sidebar com Foto do Compositor */}
              <div className="space-y-6">
                {/* Foto do Compositor */}
                <div className="classical-card-simple p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <div className="h-5 w-24 bg-theme-elevated rounded"></div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="w-32 h-40 mx-auto bg-gradient-card border border-theme-primary/20 rounded-xl flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-theme-tertiary/30 opacity-50" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-brand-primary/20 rounded mx-auto"></div>
                      <div className="h-4 w-20 bg-theme-elevated rounded mx-auto"></div>
                    </div>
                  </div>
                </div>

                {/* Detalhes Técnicos */}
                <div className="classical-card-simple p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                      <FiBookOpen className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <div className="h-5 w-32 bg-theme-elevated rounded"></div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-8 bg-theme-primary/20 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                      <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                      <div className="h-3 w-16 bg-theme-primary/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
