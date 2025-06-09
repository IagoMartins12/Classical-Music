// app/work/[workId]/WorkDetailsClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WorkDetails } from '@/app/requests/work-details';
import { CiCalendar, CiMusicNote1 } from 'react-icons/ci';
import {
  LuBookOpen,
  LuMusic,
  LuExternalLink,
  LuClock,
  LuMapPin,
} from 'react-icons/lu';
import { FaPlay, FaStop } from 'react-icons/fa';
import { useIMSLPScores } from '@/app/hooks/useIMSLPScores';
import IMSLPTabs from './IMSLPTabs';
import { useNavigate } from '@/app/hooks/useNavigate';

interface WorkDetailsClientProps {
  work: WorkDetails;
  relatedWorks?: any[];
}

export default function WorkDetailsClient({
  work,
  relatedWorks = [],
}: WorkDetailsClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Usar o hook ao invés de gerenciar estado manualmente
  const {
    scores: imslpScores,
    loading: loadingScores,
    error: scoresError,
    refetch: refetchScores,
  } = useIMSLPScores(work.imslpPermlink);

  const { navigateToUrl } = useNavigate();

  // Função para formatar duração
  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    return duration;
  };

  // Função para determinar o tipo de obra
  const getWorkTypeLabel = (type: string) => {
    const labels = {
      INDIVIDUAL: 'Obra Individual',
      COMPLETE_WORK: 'Obra Completa',
      ARRANGEMENT: 'Arranjo',
      COLLECTION: 'Coleção de peças',
      COLLECTED_WORKS: 'Coleção de peças',
    };
    return labels[type as keyof typeof labels] || type;
  };

  console.log('work', work);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/works" className="hover:text-blue-600 transition-colors">
            Obras
          </Link>
          <span className="mx-2">›</span>
          <Link
            href={`/composer/${work.composer.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {work.composer.fullName}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{work.title}</span>
        </nav>

        {/* Header Principal */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Informações Principais */}
            <div className="lg:col-span-3 space-y-6">
              {/* Título e Compositor */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {work.title}
                </h1>
                <div className="flex items-center space-x-2 text-xl text-gray-600">
                  <span>por</span>
                  <Link
                    href={`/composer/${work.composer.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {work.composer.fullName}
                  </Link>
                </div>
                {work.opOrCatalog && (
                  <p className="text-lg text-gray-500 mt-1">
                    {work.opOrCatalog}
                  </p>
                )}
              </div>

              {/* Grid de Informações Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ano de Composição */}
                {work.compositionYear && (
                  <div className="flex items-start space-x-3">
                    <CiCalendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Ano de Composição
                      </p>
                      <p className="text-gray-900">{work.compositionYear}</p>
                    </div>
                  </div>
                )}

                {/* Duração */}
                {work.mediaDuration && (
                  <div className="flex items-start space-x-3">
                    <LuClock className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Duração
                      </p>
                      <p className="text-gray-900">
                        {formatDuration(work.mediaDuration)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tom */}
                {work.tone && (
                  <div className="flex items-start space-x-3">
                    <LuMusic className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tom</p>
                      <p className="text-gray-900">{work.tone}</p>
                    </div>
                  </div>
                )}

                {/* Instrumento */}
                {work.instrument && (
                  <div className="flex items-start space-x-3">
                    <CiMusicNote1 className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Instrumento
                      </p>
                      <p className="text-gray-900">{work.instrument.name}</p>
                    </div>
                  </div>
                )}

                {/* Época */}
                {work.epoch && (
                  <div className="flex items-start space-x-3">
                    <LuMapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Época</p>
                      <p className="text-blue-600 font-medium">
                        {work.epoch.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações Adicionais */}
              {(work.firstPublishDate || work.dedicateTo || work.workStyle) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informações Adicionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {work.firstPublishDate && (
                      <div>
                        <span className="font-medium text-gray-500">
                          Primeira Publicação:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {work.firstPublishDate}
                        </span>
                      </div>
                    )}
                    {work.dedicateTo && (
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        <span className="font-medium text-gray-500">
                          Dedicada a:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {work.dedicateTo}
                        </span>
                      </div>
                    )}

                    {work.workStyle && (
                      <div>
                        <span className="font-medium text-gray-500">
                          Estilo:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {work.workStyle}
                        </span>
                      </div>
                    )}
                    {work.instrumentation && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-500">
                          Instrumentação:
                        </span>
                        <span className="ml-2 text-gray-900 whitespace-pre-line">
                          {work.instrumentation}
                        </span>
                      </div>
                    )}

                    {work.moviment && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-500">
                          Movimentos:
                        </span>
                        <span className="ml-2 text-gray-900 whitespace-pre-line">
                          {work.moviment}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags de Categorias e Gêneros */}
              {(work.categoryNames?.length > 0 ||
                work.workGenres.length > 0) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Categorias e Gêneros
                  </h3>
                  <div className="space-y-3">
                    {work.categoryNames?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-2">
                          Categorias:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {work.categoryNames.map((categoryName, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 cursor-pointer bg-blue-100 text-blue-800 text-sm rounded-full"
                              onClick={() =>
                                navigateToUrl(
                                  `works?categoryNames=${categoryName}`
                                )
                              }
                            >
                              {categoryName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {work.workGenresArr && work.workGenresArr.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-2">
                          Tipos de Obra:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {work.workGenresArr.map((workGenre, index) => (
                            <span
                              key={index}
                              className=" capitalize cursor-pointer px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                              onClick={() =>
                                navigateToUrl(
                                  `works?workGenresArr=${workGenre}`
                                )
                              }
                            >
                              {workGenre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar com Player e Links */}
            <div className="space-y-6">
              {/* Player de Áudio/Vídeo */}
              {work.videoUrl && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Reprodução
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isPlaying ? (
                        <FaStop className="w-4 h-4 mr-2" />
                      ) : (
                        <FaPlay className="w-4 h-4 mr-2" />
                      )}
                      {isPlaying ? 'Parar' : 'Reproduzir'}
                    </button>
                    <a
                      href={work.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LuExternalLink className="w-4 h-4 mr-2" />
                      Abrir no Player Externo
                    </a>
                  </div>
                </div>
              )}

              {/* Links Externos */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recursos Externos
                </h3>
                <div className="space-y-3">
                  <a
                    href={work.imslpPermlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LuBookOpen className="w-4 h-4 mr-2" />
                    Ver Partitura (IMSLP)
                  </a>
                </div>
              </div>

              {/* Informações Técnicas */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalhes Técnicos
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Tipo:</span>
                    <span className="ml-2 text-gray-900">
                      {getWorkTypeLabel(work.workType)}
                    </span>
                  </div>
                  {work.movementNumber && (
                    <div>
                      <span className="font-medium text-gray-500">
                        Movimento:
                      </span>
                      <span className="ml-2 text-gray-900">
                        #{work.movementNumber}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-500">
                      Catalogado em:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Partituras IMSLP */}
        {work.imslpPermlink && (
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div>
              {loadingScores && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Carregando partituras...
                  </span>
                </div>
              )}

              {scoresError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  <p>{scoresError}</p>
                  <button
                    onClick={refetchScores}
                    className="mt-2 text-sm underline hover:no-underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {imslpScores && !loadingScores && (
                <IMSLPTabs imslpData={imslpScores} />
              )}
            </div>
          </div>
        )}

        {/* Obras Relacionadas */}
        {relatedWorks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Obras Relacionadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorks.slice(0, 6).map((relatedWork) => (
                <Link
                  key={relatedWork.id}
                  href={`/works/${relatedWork.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {relatedWork.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {relatedWork.composer.name}
                  </p>
                  {relatedWork.opOrCatalog && (
                    <p className="text-xs text-gray-500">
                      {relatedWork.opOrCatalog}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
