// app/work/[workId]/WorkDetailsClient.tsx - Premium version with theme system
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WorkDetails } from '@/app/requests/work-details';
import {
  FiCalendar,
  FiMusic,
  FiExternalLink,
  FiClock,
  FiMapPin,
  FiBookOpen,
  FiPlay,
  FiPause,
  FiSettings,
  FiTag,
  FiInfo,
  FiHeart,
  FiShare2,
  FiHeadphones,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { useIMSLPScores } from '@/app/hooks/useIMSLPScores';
import IMSLPTabs from './IMSLPTabs';
import { useNavigate } from '@/app/hooks/useNavigate';
import FavoriteButton from '../FavoriteButton';

interface WorkDetailsClientProps {
  work: WorkDetails;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedWorks?: any[];
}

export default function WorkDetailsClient({
  work,
  relatedWorks = [],
}: WorkDetailsClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
          <Link
            href="/works"
            className="hover:text-brand-primary transition-colors duration-300 font-medium"
          >
            Obras
          </Link>
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
          <Link
            href={`/composer/${work.composer.id}`}
            className="hover:text-brand-primary transition-colors duration-300 font-medium"
          >
            {work.composer.fullName}
          </Link>
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
          <span className="text-theme-primary font-medium">{work.title}</span>
        </nav>

        {/* Header Principal */}
        <div className="classical-card overflow-hidden relative animate-fade-in-up">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute hidden sm:flex bottom-6 right-12 text-4xl text-brand-secondary/10 animate-float"
              style={{ animationDelay: '1s' }}
            >
              <FiMusic />
            </div>
          </div>

          <div className="p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Informações Principais */}
              <div className="lg:col-span-3 space-y-6">
                {/* Título e Compositor */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                        {work.title}
                      </h1>
                      <div className="flex items-center space-x-2 text-xl text-theme-secondary mt-3">
                        <span>por</span>
                        <Link
                          href={`/composer/${work.composer.id}`}
                          className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors duration-300 classical-subtitle"
                        >
                          {work.composer.fullName}
                        </Link>
                      </div>
                      {work.opOrCatalog && (
                        <p className="text-lg text-theme-tertiary mt-2 font-medium">
                          {work.opOrCatalog}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 ml-4">
                      <FavoriteButton
                        id={work.id}
                        type="work"
                        variant="default"
                        size="lg"
                        itemName={work.title}
                        showToast={true}
                      />

                      <button className="w-12 h-12 bg-interactive-hover border border-theme-primary text-theme-primary rounded-xl hover:bg-brand-primary/20 hover:border-brand-primary hover:text-brand-primary hover:scale-110 transition-all duration-300">
                        <FiShare2 className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid de Informações Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ano de Composição */}
                  {work.compositionYear && (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiCalendar className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Ano de Composição
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {work.compositionYear}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Duração */}
                  {work.mediaDuration && (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiClock className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Duração
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {formatDuration(work.mediaDuration)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tom */}
                  {work.tone && (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiMusic className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Tom
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {work.tone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Instrumento */}
                  {work.instrument && (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <GiMusicalNotes className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Instrumento
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {work.instrument.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Época */}
                  {work.epoch && (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiMapPin className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Época
                        </p>
                        <p className="text-brand-primary font-semibold">
                          {work.epoch.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informações Adicionais */}
                {(work.firstPublishDate ||
                  work.dedicateTo ||
                  work.workStyle) && (
                  <div className="border-t border-theme-secondary pt-6">
                    <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                      <FiInfo className="w-5 h-5 text-accent-blue" />
                      <span>Informações Adicionais</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {work.firstPublishDate && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-theme-tertiary">
                            Primeira Publicação:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            {work.firstPublishDate}
                          </span>
                        </div>
                      )}
                      {work.dedicateTo && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-theme-tertiary">
                            Dedicada a:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            {work.dedicateTo}
                          </span>
                        </div>
                      )}

                      {work.workStyle && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-theme-tertiary">
                            Estilo:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            {work.workStyle}
                          </span>
                        </div>
                      )}
                      {work.instrumentation && (
                        <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                          <span className="font-medium text-theme-tertiary block mb-1">
                            Instrumentação:
                          </span>
                          <span className="text-theme-primary whitespace-pre-line">
                            {work.instrumentation}
                          </span>
                        </div>
                      )}

                      {work.moviment && (
                        <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                          <span className="font-medium text-theme-tertiary block mb-1">
                            Movimentos:
                          </span>
                          <span className="text-theme-primary whitespace-pre-line">
                            {work.moviment}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags de Categorias e Gêneros */}
                {work.categoryNames?.length > 0 && (
                  <div className="border-t border-theme-secondary pt-6">
                    <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                      <FiTag className="w-5 h-5 text-accent-green" />
                      <span>Categorias e Gêneros</span>
                    </h3>
                    <div className="space-y-4">
                      {work.categoryNames?.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-theme-tertiary block mb-3">
                            Categorias:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {work.categoryNames.map((categoryName, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 cursor-pointer bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300"
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
                          <span className="text-sm font-medium text-theme-tertiary block mb-3">
                            Tipos de Obra:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {work.workGenresArr.map((workGenre, index) => (
                              <span
                                key={index}
                                className="capitalize cursor-pointer px-4 py-2 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/30 text-accent-green rounded-full text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300"
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
                  <div
                    className="classical-card-simple p-6 animate-fade-in-up"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center">
                        <FiHeadphones className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Reprodução
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="btn-classical-primary w-full flex items-center justify-center space-x-2 group"
                      >
                        {isPlaying ? (
                          <FiPause className="w-4 h-4" />
                        ) : (
                          <FiPlay className="w-4 h-4" />
                        )}
                        <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                      </button>
                      <a
                        href={work.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classical-secondary w-full flex items-center justify-center space-x-2 group"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        <span>Abrir no Player Externo</span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                      </a>
                    </div>
                  </div>
                )}

                {/* Links Externos */}
                <div
                  className="classical-card-simple p-6 animate-fade-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                      <FiBookOpen className="w-4 h-4 text-theme-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary classical-title">
                      Recursos Externos
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <a
                      href={work.imslpPermlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-classical-primary w-full flex items-center space-x-2 group"
                    >
                      <FiBookOpen className="w-4 h-4" />
                      <span>Ver Partitura (IMSLP)</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                    </a>
                  </div>
                </div>

                {/* Informações Técnicas */}
                <div
                  className="classical-card-simple p-6 animate-fade-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                      <FiSettings className="w-4 h-4 text-theme-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary classical-title">
                      Detalhes Técnicos
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-theme-tertiary">
                        Tipo:
                      </span>
                      <span className="text-theme-primary font-semibold">
                        {getWorkTypeLabel(work.workType)}
                      </span>
                    </div>
                    {work.movementNumber && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-theme-tertiary">
                          Movimento:
                        </span>
                        <span className="text-theme-primary font-semibold">
                          #{work.movementNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                      <span className="font-medium text-theme-tertiary">
                        Catalogado em:
                      </span>
                      <span className="text-theme-primary font-semibold text-xs">
                        {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Partituras IMSLP */}
        {work.imslpPermlink && (
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            {loadingScores && (
              <div className="classical-card p-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                    <div
                      className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
                      style={{
                        animationDirection: 'reverse',
                        animationDuration: '1.5s',
                      }}
                    ></div>
                  </div>
                  <span className="text-theme-primary font-medium">
                    Carregando partituras...
                  </span>
                </div>
              </div>
            )}

            {scoresError && (
              <div className="classical-card p-6">
                <div className="bg-gradient-to-r from-accent-red/10 to-accent-red/5 border border-accent-red/30 rounded-2xl p-4">
                  <p className="text-accent-red font-medium">{scoresError}</p>
                  <button
                    onClick={refetchScores}
                    className="mt-3 btn-classical-secondary text-sm"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {imslpScores && !loadingScores && (
              <IMSLPTabs imslpData={imslpScores} />
            )}
          </div>
        )}

        {/* Obras Relacionadas */}
        {relatedWorks.length > 0 && (
          <div
            className="classical-card p-8 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-theme-primary" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Obras Relacionadas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorks.slice(0, 6).map((relatedWork, index) => (
                <Link
                  key={relatedWork.id}
                  href={`/works/${relatedWork.id}`}
                  className="block classical-card-simple p-4 hover:shadow-theme-glow transition-all duration-300 hover:scale-105 group animate-fade-in-up"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <h3 className="font-semibold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors classical-title">
                    {relatedWork.title}
                  </h3>
                  <p className="text-sm text-theme-secondary mb-2">
                    {relatedWork.composer.name}
                  </p>
                  {relatedWork.opOrCatalog && (
                    <p className="text-xs text-theme-tertiary bg-theme-elevated border border-theme-secondary px-2 py-1 rounded-full inline-block">
                      {relatedWork.opOrCatalog}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
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
      `}</style>
    </div>
  );
}
