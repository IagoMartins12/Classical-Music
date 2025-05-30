// app/composers/ComposersClient.tsx
'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface ComposerImslp {
  epochName: string;
  name: string;
  id: string;
  bio: string | null;
  epoch: {
    name: string;
  };
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
  epochId: string;
  permLinkImslp: string | null;
  wikipediaLink: string | null;
}

interface Epoch {
  id: string;
  name: string;
}

interface ComposersClientProps {
  composers: ComposerImslp[];
  epochs: Epoch[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  selectedEpoch: string;
}

export default function ComposersClient({
  composers,
  epochs,
  currentPage,
  totalPages,
  totalCount,
  searchTerm: initialSearchTerm,
  selectedEpoch: initialSelectedEpoch,
}: ComposersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedEpoch, setSelectedEpoch] = useState(initialSelectedEpoch);

  // Função para atualizar URL com debounce
  const updateUrl = useCallback(
    (params: { page?: number; search?: string; epoch?: string }) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (params.page !== undefined) {
        if (params.page === 1) {
          newParams.delete('page');
        } else {
          newParams.set('page', params.page.toString());
        }
      }

      if (params.search !== undefined) {
        if (params.search === '') {
          newParams.delete('search');
        } else {
          newParams.set('search', params.search);
        }
      }

      if (params.epoch !== undefined) {
        if (params.epoch === '') {
          newParams.delete('epoch');
        } else {
          newParams.set('epoch', params.epoch);
        }
      }

      const newUrl = `${window.location.pathname}${
        newParams.toString() ? '?' + newParams.toString() : ''
      }`;

      startTransition(() => {
        router.push(newUrl);
      });
    },
    [router, searchParams]
  );

  // Debounce para busca
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      const timeoutId = setTimeout(() => {
        updateUrl({ search: value, page: 1 });
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [updateUrl]
  );

  const handleEpochChange = useCallback(
    (value: string) => {
      setSelectedEpoch(value);
      updateUrl({ epoch: value, page: 1 });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateUrl]
  );

  return (
    <div
      className={`space-y-6 section-wrap ${
        isPending ? 'opacity-75 pointer-events-none' : ''
      }`}
    >
      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo de pesquisa */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Pesquisar por nome
            </label>
            <input
              id="search"
              type="text"
              placeholder="Digite o nome do compositor..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por época */}
          <div>
            <label
              htmlFor="epoch"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filtrar por época
            </label>
            <select
              id="epoch"
              value={selectedEpoch}
              onChange={(e) => handleEpochChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as épocas</option>
              {epochs.map((epoch) => (
                <option key={epoch.id} value={epoch.id}>
                  {epoch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Informações dos resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {composers.length} de {totalCount} compositores
          {searchTerm && ` para "${searchTerm}"`}
          {selectedEpoch &&
            ` da época "${epochs.find((e) => e.id === selectedEpoch)?.name}"`}
          {isPending && (
            <span className="ml-2 text-blue-600">• Carregando...</span>
          )}
        </div>
      </div>

      {/* Lista de compositores */}
      {composers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {composers.map((composer) => (
            <div
              key={composer.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Foto do compositor */}
                {composer.portraitUrl && (
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 relative rounded-full overflow-hidden">
                      <Image
                        src={composer.portraitUrl}
                        alt={composer.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                        priority={false}
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* Nome */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {composer.name}
                </h3>

                {/* Nome completo */}
                {composer.fullName !== composer.name && (
                  <p className="text-sm text-gray-600 mb-2">
                    {composer.fullName}
                  </p>
                )}

                {/* Datas */}
                {(composer.birthDate || composer.deathDate) && (
                  <p className="text-sm text-gray-500 mb-2">
                    {composer.birthDate} - {composer.deathDate || 'presente'}
                  </p>
                )}

                {/* Época */}
                {composer.epochName && (
                  <p className="text-sm text-blue-600 mb-3">
                    {composer.epochName}
                  </p>
                )}

                {/* Bio (resumida) */}
                {composer.bio && (
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {composer.bio}
                  </p>
                )}

                {/* Links */}
                <div className="flex gap-2">
                  {composer.wikipediaLink && (
                    <a
                      href={composer.wikipediaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Wikipedia
                    </a>
                  )}
                  {composer.permLinkImslp && (
                    <a
                      href={composer.permLinkImslp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      IMSLP
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum compositor encontrado.</p>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-8">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isPending}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Inicio
          </button>

          {/* Botão anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {/* Números das páginas */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={isPending}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Botão próximo */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isPending}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Final
          </button>

          {/* Info da página atual */}
          <span className="text-sm text-gray-700 ml-4">
            Página {currentPage} de {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
