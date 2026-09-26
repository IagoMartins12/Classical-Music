// app/uploads/score/[id]/edit/loading.tsx
'use client';

import {
  PiArrowSquareOut,
  PiDownloadSimple,
  PiFile,
  PiFileText,
  PiFloppyDisk,
  PiImage,
  PiInfo,
  PiMusicNotes,
  PiPencilLine,
  PiStack,
  PiTag,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';

export default function EditScoreLoading() {
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
        <Inline
          as="nav"
          gap={2}
          className="text-sm text-theme-tertiary mb-6 pt-4"
        >
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
          <div className="h-4 w-20 bg-theme-elevated rounded"></div>
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
        </Inline>

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
                      <Inline gap={3} className="mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                          <PiPencilLine className="w-5 h-5 text-theme-primary/30" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-10 w-56 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded"></div>
                          <div className="h-5 w-40 bg-theme-elevated rounded"></div>
                        </div>
                      </Inline>

                      <div className="h-12 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded mb-2"></div>

                      <Inline gap={2} className="mt-3">
                        <div className="h-6 w-16 bg-theme-elevated rounded"></div>
                        <div className="h-6 w-32 bg-brand-primary/20 rounded"></div>
                      </Inline>
                      <Inline gap={2} className="mt-2">
                        <div className="h-5 w-8 bg-theme-elevated rounded"></div>
                        <div className="h-5 w-28 bg-brand-primary/20 rounded"></div>
                      </Inline>
                    </div>

                    {/* Action buttons */}
                    <Inline gap={3} className="ml-4">
                      <Inline
                        gap={2}
                        className="h-10 w-20 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg justify-center"
                      >
                        <PiFloppyDisk className="w-4 h-4 text-theme-primary/30" />
                        <div className="w-8 h-4 bg-theme-primary/30 rounded"></div>
                      </Inline>

                      <Inline
                        gap={2}
                        className="h-10 w-24 bg-accent-red/20 border border-accent-red/30 rounded-lg justify-center"
                      >
                        <PiTrash className="w-4 h-4 text-accent-red/30" />
                        <div className="w-12 h-4 bg-accent-red/30 rounded"></div>
                      </Inline>
                    </Inline>
                  </div>

                  {/* Badge de Fonte */}
                  <Inline gap={3}>
                    <Inline
                      gap={2}
                      className="h-8 w-32 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 rounded-full justify-center"
                    >
                      <PiTag className="w-4 h-4 text-theme-primary/30" />
                      <div className="w-20 h-4 bg-theme-primary/30 rounded"></div>
                    </Inline>
                  </Inline>
                </div>

                {/* Grid de Informações Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: (
                        <PiStack className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-blue to-accent-purple',
                    },
                    {
                      icon: (
                        <PiFile className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-blue',
                    },
                    {
                      icon: (
                        <PiDownloadSimple className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-purple to-accent-red',
                    },
                    {
                      icon: (
                        <PiFileText className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-brand-primary to-brand-secondary',
                    },
                    {
                      icon: <PiTag className="w-4 h-4 text-theme-primary/30" />,
                      gradient: 'from-accent-green to-accent-purple',
                    },
                    {
                      icon: (
                        <PiUser className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-red to-accent-purple',
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
                        <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                        <div className="h-5 w-20 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Informações de Publicação */}
                <div className="border-t border-theme-secondary pt-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-semibold text-theme-primary classical-title mb-4"
                  >
                    <PiFileText className="w-5 h-5 text-accent-blue/30" />
                    <div className="h-5 w-48 bg-theme-elevated rounded"></div>
                  </Inline>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <Inline gap={2}>
                      <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-20 bg-theme-primary/20 rounded"></div>
                    </Inline>
                    <Inline gap={2}>
                      <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-24 bg-theme-primary/20 rounded"></div>
                    </Inline>
                    <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated/50 to-interactive-hover/50 rounded-xl border border-theme-primary/20">
                      <div className="h-4 w-20 bg-theme-elevated rounded mb-1"></div>
                      <div className="space-y-1">
                        <div className="h-3 bg-theme-secondary rounded"></div>
                        <div className="h-3 bg-theme-secondary rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="border-t border-theme-secondary pt-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-semibold text-theme-primary classical-title mb-4"
                  >
                    <PiInfo className="w-5 h-5 text-accent-green/30" />
                    <div className="h-5 w-16 bg-theme-elevated rounded"></div>
                  </Inline>
                  <div className="p-4 bg-gradient-to-r from-theme-elevated/50 to-interactive-hover/50 rounded-xl border border-theme-primary/20">
                    <div className="space-y-2">
                      <div className="h-4 bg-theme-secondary rounded"></div>
                      <div className="h-4 bg-theme-secondary rounded w-5/6"></div>
                      <div className="h-4 bg-theme-secondary rounded w-3/4"></div>
                    </div>
                  </div>
                </div>

                {/* Link de Download */}
                <div className="border-t border-theme-secondary pt-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-semibold text-theme-primary classical-title mb-4"
                  >
                    <PiArrowSquareOut className="w-5 h-5 text-accent-blue/30" />
                    <div className="h-5 w-16 bg-theme-elevated rounded"></div>
                  </Inline>
                  <Inline
                    gap={2}
                    className="h-10 w-48 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg justify-center"
                  >
                    <PiDownloadSimple className="w-4 h-4 text-theme-primary/30" />
                    <div className="w-32 h-4 bg-theme-primary/30 rounded"></div>
                  </Inline>
                </div>
              </div>

              {/* Sidebar com Thumbnail e Obra */}
              <div className="space-y-6">
                {/* Thumbnail da Partitura */}
                <div className="classical-card-simple p-6">
                  <Inline gap={3} className="mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                      <PiImage className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <div className="h-5 w-20 bg-theme-elevated rounded"></div>
                  </Inline>

                  <div className="text-center">
                    <div className="w-full aspect-[3/4] mx-auto bg-gradient-card border border-theme-primary/20 rounded-xl flex items-center justify-center">
                      <PiFile className="w-12 h-12 text-theme-tertiary/30 opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Informações da Obra */}
                <div className="classical-card-simple p-6">
                  <Inline gap={3} className="mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center">
                      <PiMusicNotes className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <div className="h-5 w-12 bg-theme-elevated rounded"></div>
                  </Inline>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-brand-primary/20 rounded"></div>
                      <div className="h-4 w-28 bg-theme-elevated rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Detalhes Técnicos */}
                <div className="classical-card-simple p-6">
                  <Inline gap={3} className="mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                      <PiInfo className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <div className="h-5 w-32 bg-theme-elevated rounded"></div>
                  </Inline>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-8 bg-theme-primary/20 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                      <div className="h-3 w-16 bg-theme-primary/20 rounded"></div>
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
