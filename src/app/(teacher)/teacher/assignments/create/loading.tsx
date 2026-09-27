// app/teacher/assignments/create/loading.tsx - Loading para Criar Nova Tarefa
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import { PiClipboardText, PiMusicNotes, PiTarget } from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function CreateAssignmentLoading() {
  return (
    <div className="min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-40 h-40 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-ouro-texto/10 animate-float">
          <PiClipboardText />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiTarget />
        </div>
        <div
          className="absolute top-1/3 right-24 text-3xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/3 left-24 text-3xl text-aviso/10 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <PiMusicNotes />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <Inline gap={4}>
            <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            <Stack gap={2}>
              <div className="h-8 bg-fundo rounded w-48"></div>
              <div className="h-4 bg-theme-elevated rounded w-64"></div>
            </Stack>
          </Inline>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Skeleton */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="animate-pulse">
              <Stack gap={8}>
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <div className="h-6 bg-fundo rounded w-48 mb-4"></div>

                  {/* Student Selection */}
                  <Stack gap={2}>
                    <div className="h-4 bg-sup-2/30 rounded w-16"></div>
                    <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </Stack>

                  {/* Lesson Selection */}
                  <Stack gap={2}>
                    <div className="h-4 bg-sup-2/30 rounded w-24"></div>
                    <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </Stack>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type */}
                    <div>
                      <div className="h-4 bg-sup-2/30 rounded mb-2 w-20"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                      <div className="h-3 bg-sup-2/20 rounded mt-1 w-3/4"></div>
                    </div>

                    {/* Priority */}
                    <Stack gap={2}>
                      <div className="h-4 bg-sup-2/30 rounded w-16"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </Stack>
                  </div>

                  {/* Title */}
                  <Stack gap={2}>
                    <div className="h-4 bg-sup-2/30 rounded w-24"></div>
                    <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </Stack>

                  {/* Description */}
                  <Stack gap={2}>
                    <div className="h-4 bg-sup-2/30 rounded w-32"></div>
                    <div className="h-24 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </Stack>
                </div>

                {/* Timing Section */}
                <Stack>
                  <div className="h-5 bg-fundo rounded w-32"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Stack gap={2}>
                      <div className="h-4 bg-sup-2/30 rounded w-24"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </Stack>

                    <Stack gap={2}>
                      <div className="h-4 bg-sup-2/30 rounded w-32"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </Stack>
                  </div>
                </Stack>

                {/* Practice Goals Section */}
                <Stack>
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-fundo rounded w-40"></div>
                    <div className="h-6 w-20 bg-ouro/20 rounded"></div>
                  </div>

                  <Stack gap={2}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex-1"></div>
                        <div className="w-8 h-8 bg-theme-elevated rounded"></div>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>

                {/* Musical Pieces Section */}
                <Stack>
                  <div className="flex items-center justify-between">
                    <Inline gap={2}>
                      <PiMusicNotes className="w-5 h-5 text-texto/30" />
                      <div className="h-5 bg-fundo rounded w-32"></div>
                    </Inline>
                    <div className="h-4 bg-sup-2/30 rounded w-16"></div>
                  </div>

                  <Card nivel={2} densidade="compacta">
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <MusicalPieceItemSkeleton key={i} />
                      ))}
                    </div>
                  </Card>
                </Stack>

                {/* Advanced Options Section */}
                <Stack>
                  <Inline gap={2}>
                    <div className="h-4 bg-ouro/30 rounded w-32"></div>
                    <div className="w-4 h-4 bg-sup-2/30 rounded"></div>
                  </Inline>

                  {/* Advanced form fields */}
                  <Stack gap={6} className="p-4 bg-sup-1/5 rounded-lg">
                    {/* Technical Goals */}
                    <Stack gap={2}>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-sup-2/30 rounded w-32"></div>
                        <div className="h-6 w-20 bg-ouro/20 rounded"></div>
                      </div>
                      <Stack gap={2}>
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Inline gap={2} key={i}>
                            <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex-1"></div>
                            <div className="w-8 h-8 bg-theme-elevated rounded"></div>
                          </Inline>
                        ))}
                      </Stack>
                    </Stack>

                    {/* Musical Goals */}
                    <Stack gap={2}>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-sup-2/30 rounded w-28"></div>
                        <div className="h-6 w-20 bg-ouro/20 rounded"></div>
                      </div>
                      <Stack gap={2}>
                        <Inline gap={2}>
                          <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex-1"></div>
                          <div className="w-8 h-8 bg-theme-elevated rounded"></div>
                        </Inline>
                      </Stack>
                    </Stack>

                    {/* Exercises */}
                    <Stack gap={2}>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-sup-2/30 rounded w-36"></div>
                        <div className="h-6 w-20 bg-ouro/20 rounded"></div>
                      </div>
                      <Stack gap={2}>
                        <Inline gap={2}>
                          <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex-1"></div>
                          <div className="w-8 h-8 bg-theme-elevated rounded"></div>
                        </Inline>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>

                {/* Actions */}
                <Inline
                  gap={3}
                  className="justify-end pt-6 border-t border-theme-secondary"
                >
                  <div className="h-10 w-20 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
                  <div className="h-10 w-32 bg-ouro/20 border border-ouro/30 rounded-lg"></div>
                </Inline>
              </Stack>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <Stack gap={6} className="order-1 lg:order-2">
            {/* Selected Student Info */}
            <Card className="animate-pulse">
              <div className="h-5 bg-fundo rounded w-32 mb-4"></div>

              <Stack>
                <Inline gap={3}>
                  <div className="w-12 h-12 bg-ouro/20 rounded-full"></div>
                  <Stack gap={1}>
                    <div className="h-4 bg-fundo/30 rounded w-20"></div>
                    <div className="h-3 bg-sup-2/30 rounded w-16"></div>
                  </Stack>
                </Inline>

                <Stack gap={2}>
                  <div className="h-3 bg-sup-2/30 rounded w-24"></div>
                  <Stack gap={2}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Stack
                        gap={1}
                        key={i}
                        className="p-2 bg-sup-elevada/50 rounded"
                      >
                        <div className="h-3 bg-fundo/20 rounded w-3/4"></div>
                        <div className="h-3 bg-sup-2/20 rounded w-1/2"></div>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {/* Selected Works Summary */}
            <Card className="animate-pulse">
              <Inline gap={2} className="mb-4">
                <PiMusicNotes className="w-5 h-5 text-texto/30" />
                <div className="h-5 bg-fundo rounded w-32"></div>
              </Inline>

              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Inline
                    gap={3}
                    key={i}
                    className="p-3 bg-sup-elevada/50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-aviso/20 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-fundo/20 rounded mb-1 w-3/4"></div>
                      <div className="h-3 bg-sup-2/20 rounded w-1/2"></div>
                      <div className="h-3 bg-ok/30 rounded w-20 mt-1"></div>
                    </div>
                    <div className="h-4 w-8 bg-sup-1/20 rounded"></div>
                  </Inline>
                ))}

                <div className="mt-3 p-3 bg-ouro/5 border border-ouro/20 rounded-lg">
                  <Stack gap={1}>
                    <div className="flex justify-between">
                      <div className="h-3 bg-sup-1/30 rounded w-20"></div>
                      <div className="h-3 bg-sup-1/30 rounded w-4"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-sup-1/30 rounded w-24"></div>
                      <div className="h-3 bg-sup-1/30 rounded w-4"></div>
                    </div>
                  </Stack>
                </div>
              </div>
            </Card>

            {/* Assignment Type Info */}
            <Card className="animate-pulse">
              <div className="h-5 bg-fundo rounded w-28 mb-4"></div>

              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <AssignmentTypeItemSkeleton key={i} isSelected={i === 0} />
                ))}
              </div>
            </Card>

            {/* Tips */}
            <Card className="animate-pulse">
              <div className="h-5 bg-fundo rounded w-12 mb-4"></div>
              <Stack gap={3}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-ouro/30 rounded mt-0.5 flex-shrink-0"></div>
                    <div className="h-3 bg-sup-1/30 rounded flex-1"></div>
                  </div>
                ))}
              </Stack>
            </Card>
          </Stack>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Musical Piece Item Skeleton
function MusicalPieceItemSkeleton() {
  return (
    <Inline gap={3} className="p-3 bg-sup-elevada/50 rounded-lg animate-pulse">
      <div className="w-8 h-8 bg-aviso/20 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="h-3 bg-fundo/20 rounded mb-1 w-3/4"></div>
        <div className="h-3 bg-sup-2/20 rounded w-1/2"></div>
      </div>
      <div className="w-6 h-6 bg-theme-elevated rounded"></div>
    </Inline>
  );
}

// Assignment Type Item Skeleton
function AssignmentTypeItemSkeleton({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={`p-3 rounded-lg transition-all ${
        isSelected ? 'bg-ouro/10 border-ouro/30' : 'bg-sup-1/5 border-linha/20'
      }`}
    >
      <Inline gap={2} className="mb-1">
        <div
          className={`w-4 h-4 rounded ${
            isSelected ? 'bg-ouro/30' : 'bg-sup-2/30'
          }`}
        ></div>
        <div
          className={`h-4 rounded w-16 ${
            isSelected ? 'bg-ouro/30' : 'bg-fundo/20'
          }`}
        ></div>
      </Inline>
      <Stack gap={1}>
        <div className="h-3 bg-sup-1/30 rounded w-full"></div>
        <div className="h-3 bg-sup-1/30 rounded w-3/4"></div>
      </Stack>
    </div>
  );
}
