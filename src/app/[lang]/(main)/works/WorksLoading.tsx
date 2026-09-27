// Este é um componente comum, não o `loading.tsx` de rota — e a diferença
// importa.
//
// Um `loading.tsx` cria um limite de `Suspense` no topo do segmento **e de
// tudo o que está abaixo dele**. Aqui embaixo existe uma rota de detalhe
// (`[workId]`, `[id]`), e com o limite no caminho o Next despachava a casca
// com HTTP 200 antes de saber o desfecho: uma obra inexistente respondia
// **200 com a tela de "não encontrada"** — o "soft 404" que os buscadores
// penalizam — e uma falha da API respondia 200 com a página vazia.
//
// Como componente, ele continua sendo o esqueleto do `Suspense` da própria
// listagem, sem impor limite nenhum às rotas filhas.

// app/works/loading.tsx - Clean Skeleton Loading
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import { PiHeadphones, PiMagnifyingGlass, PiMusicNotes } from 'react-icons/pi';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function WorksLoading() {
  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full blur-2xl"></div>
      </div>

      {/* Floating musical notes - static */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-12 text-5xl">
          <PiMusicNotes />
        </div>
        <div className="absolute bottom-6 right-12 text-4xl">
          <PiMusicNotes />
        </div>
        <div className="absolute top-12 right-24 text-3xl">
          <GiGrandPiano />
        </div>
        <div className="absolute bottom-12 left-24 text-3xl">
          <PiHeadphones />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <Stack gap={6} className="relative text-center py-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-12 rounded-2xl mx-auto max-w-lg animate-pulse"></div>
            <div className="h-6 rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </Stack>

        {/* Search and Filters Skeleton */}
        <Card>
          <Inline gap={3} className="mb-6">
            <div className="w-10 h-10 rounded-xl"></div>
            <Stack gap={2}>
              <div className="h-5 w-32 rounded animate-pulse"></div>
              <div className="h-3 w-48 bg-theme-elevated rounded animate-pulse"></div>
            </Stack>
          </Inline>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <PiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
              <div className="h-12 rounded-xl pl-12 pr-12 animate-pulse"></div>
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-32 rounded-lg animate-pulse"></div>

            {/* View Mode Toggle */}
            <Inline gap={3}>
              <div className="h-4 w-12 bg-theme-elevated rounded animate-pulse"></div>
              <div className="bg-theme-elevated rounded-lg p-1 flex">
                <div className="w-8 h-8 bg-theme-elevated rounded-md"></div>
                <div className="w-8 h-8 rounded-md"></div>
              </div>
            </Inline>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm pt-4 border-t border-theme-secondary">
            <div className="h-4 w-48 bg-theme-elevated rounded animate-pulse"></div>
            <Inline gap={2}>
              <div className="w-4 h-4 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-theme-elevated rounded animate-pulse"></div>
            </Inline>
          </div>
        </Card>

        {/* Works Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 24 }, (_, index) => (
            <WorkCardSkeleton key={index} />
          ))}
        </div>

        {/* Pagination Skeleton */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Info */}
            <div className="h-4 w-48 bg-theme-elevated rounded animate-pulse"></div>

            {/* Pagination controls */}
            <Inline gap={3}>
              <div className="h-10 w-24 rounded-lg animate-pulse"></div>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-lg animate-pulse ${
                      i === 0 ? 'border' : 'bg-theme-elevated'
                    }`}
                  ></div>
                ))}
              </div>
              <div className="h-10 w-24 rounded-lg animate-pulse"></div>
            </Inline>
          </div>
        </Card>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 w-2 h-2 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 rounded-full animate-pulse"></div>
    </div>
  );
}

// Skeleton para Work Card
function WorkCardSkeleton() {
  return (
    <div className="classical-card h-full overflow-hidden animate-pulse">
      {/* Header Section */}
      <div className="relative p-6 pb-4 border-b border-theme-secondary">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-2 text-3xl">
            <PiMusicNotes />
          </div>
        </div>

        {/* Floating action buttons */}
        <Stack gap={2} className="absolute top-4 right-4">
          <div className="w-8 h-8 rounded-full"></div>
          <div className="w-8 h-8 rounded-full"></div>
        </Stack>

        <div className="relative z-10">
          {/* Title */}
          <div className="h-6 rounded mb-3 w-4/5"></div>

          {/* Opus/Catalog */}
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 rounded mr-2"></div>
            <div className="h-4 bg-theme-elevated rounded w-24"></div>
          </div>

          {/* Composer */}
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full mr-2"></div>
            <div className="h-4 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Work Details */}
        <div className="space-y-3 mb-4 flex-1">
          {/* Instrument */}
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2"></div>
            <div className="h-3 bg-theme-elevated rounded w-20"></div>
          </div>

          {/* Composition Year */}
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2"></div>
            <div className="h-3 bg-theme-elevated rounded w-16"></div>
          </div>

          {/* Duration */}
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2"></div>
            <div className="h-3 bg-theme-elevated rounded w-12"></div>
          </div>

          {/* Tone/Key */}
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2"></div>
            <div className="h-3 bg-theme-elevated rounded w-18"></div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-5 w-16 rounded-full"></div>
          <div className="h-5 w-14 rounded-full"></div>
        </div>

        {/* Action Section */}
        <Stack gap={3}>
          {/* Main Action Button */}
          <div className="h-10 rounded-xl shadow-theme-small"></div>

          {/* Secondary Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
            <Inline gap={2}>
              <div className="w-1.5 h-1.5 rounded-full"></div>
              <div className="h-3 w-20 bg-theme-elevated rounded"></div>
            </Inline>
            <div className="w-6 h-6 bg-theme-elevated rounded-full"></div>
          </div>
        </Stack>
      </div>

      {/* Floating mini indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full"></div>
    </div>
  );
}
