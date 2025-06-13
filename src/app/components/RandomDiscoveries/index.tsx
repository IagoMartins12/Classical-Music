// app/components/RandomDiscoveries/RandomDiscoveries.tsx
'use client';

import { FiShuffle, FiUser, FiEye, FiMusic } from 'react-icons/fi';
import { GiMusicalNotes, GiTreasureMap, GiPianoKeys } from 'react-icons/gi';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import SectionTitle from '../Utils/SectionTitle';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl?: string | null;
  epochName: string;
}

interface Work {
  id: string;
  title: string;
  imslpPermlink: string;
  tone?: string | null;
  epochName: string;
  instrumentName: string;
  composerName: string;
  composer: {
    id: string;
    name: string;
    fullName: string;
    portraitUrl?: string | null;
  };
}

interface RandomDiscoveriesProps {
  composers: Composer[];
  works: Work[];
}

const DiscoveryComposerCard = ({ composer }: { composer: Composer }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group cursor-pointer select-none">
      <Link href={`/composer/${composer.id}`}>
        <div className="classical-card overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1 hover:shadow-theme-glow relative">
          {/* Discovery badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 backdrop-blur-md rounded-full px-2 py-1 text-xs font-medium text-orange-400 flex items-center gap-1">
              <GiTreasureMap className="w-2.5 h-2.5" />
              Composer
            </div>
          </div>

          {/* Portrait Section */}
          <div className="relative p-5 pb-3">
            <div className="flex justify-center mb-3">
              <div className="relative w-16 h-16">
                {/* Loading skeleton */}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 loading-skeleton rounded-full"></div>
                )}

                {/* Portrait image or fallback */}
                {composer.portraitUrl && !imageError ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-orange-400/20 group-hover:border-orange-400/50 transition-all duration-500">
                    <Image
                      src={composer.portraitUrl}
                      alt={composer.name}
                      fill
                      sizes="64px"
                      className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center border-2 border-orange-400/20 group-hover:border-orange-400/50 transition-all duration-500">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Floating action button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFavorited(!isFavorited);
                }}
                className={`w-6 h-6 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                  isFavorited
                    ? 'bg-accent-red/20 border border-accent-red/50 text-accent-red'
                    : 'bg-theme-elevated/80 border border-theme-primary/30 text-theme-primary hover:bg-interactive-hover'
                }`}
              >
                <FiHeart
                  className={`w-2.5 h-2.5 mx-auto ${
                    isFavorited ? 'fill-current' : ''
                  }`}
                />
              </button> */}
            </div>
          </div>

          {/* Content Section */}
          <div className="px-5 pb-5 relative">
            <div className="relative z-10 space-y-2 text-center">
              {/* Name */}
              <h3 className="text-sm font-bold text-theme-primary classical-title group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
                {composer.name}
              </h3>

              {/* Period info */}
              <div className="flex justify-center">
                <span className="inline-flex items-center px-2 py-0.5 bg-theme-tertiary/10 border border-theme-tertiary/20 text-theme-tertiary rounded-full text-xs font-medium">
                  <GiMusicalNotes className="w-2 h-2 mr-1" />
                  {composer.epochName}
                </span>
              </div>

              {/* Action indicator */}
              <div className="flex items-center justify-center pt-2 border-t border-theme-secondary/50">
                <div className="flex items-center space-x-1 text-theme-tertiary text-xs">
                  <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Explorar</span>
                  <FiEye className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        </div>
      </Link>
    </div>
  );
};

const DiscoveryWorkCard = ({ work }: { work: Work }) => {
  // const [isFavorited, setIsFavorited] = useState(false);

  const formatTitle = (title: string) => {
    return title.length > 40 ? `${title.substring(0, 40)}...` : title;
  };

  return (
    <div className="group cursor-pointer select-none">
      <Link href={`/works/${work.id}`}>
        <div className="classical-card overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1 hover:shadow-theme-glow relative">
          {/* Discovery badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-md rounded-full px-2 py-1 text-xs font-medium text-purple-400 flex items-center gap-1">
              <GiPianoKeys className="w-2.5 h-2.5" />
              Obra
            </div>
          </div>

          {/* Music icon section */}
          <div className="relative p-5 pb-3">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-purple-400/20 group-hover:border-purple-400/50 transition-all duration-500 group-hover:scale-110">
                <FiMusic className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Floating action button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFavorited(!isFavorited);
                }}
                className={`w-6 h-6 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                  isFavorited
                    ? 'bg-accent-red/20 border border-accent-red/50 text-accent-red'
                    : 'bg-theme-elevated/80 border border-theme-primary/30 text-theme-primary hover:bg-interactive-hover'
                }`}
              >
                <FiHeart
                  className={`w-2.5 h-2.5 mx-auto ${
                    isFavorited ? 'fill-current' : ''
                  }`}
                />
              </button> */}
            </div>
          </div>

          {/* Content Section */}
          <div className="px-5 pb-5 relative">
            <div className="relative z-10 space-y-2 text-center">
              {/* Title */}
              <h3 className="text-sm font-bold text-theme-primary classical-title group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                {formatTitle(work.title)}
              </h3>

              {/* Composer */}
              <p className="text-xs text-theme-secondary line-clamp-1">
                {work.composerName}
              </p>

              {/* Details */}
              <div className="flex justify-center flex-wrap gap-1">
                <span className="inline-flex items-center px-1.5 py-0.5 bg-theme-tertiary/10 border border-theme-tertiary/20 text-theme-tertiary rounded text-xs">
                  {work.instrumentName}
                </span>
                {work.tone && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded text-xs">
                    {work.tone}
                  </span>
                )}
              </div>

              {/* Action indicator */}
              <div className="flex items-center justify-center pt-2 border-t border-theme-secondary/50">
                <div className="flex items-center space-x-1 text-theme-tertiary text-xs">
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Estudar</span>
                  <FiMusic className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        </div>
      </Link>
    </div>
  );
};

const RandomDiscoveries: React.FC<RandomDiscoveriesProps> = ({
  works,
  composers,
}) => {
  return (
    <section className="section-wrap relative">
      <SectionTitle
        title="Descobertas Aleatórias"
        subtitle="Compositores e obras fascinantes esperando para serem explorados"
        linkText="Descobrir mais"
        linkHref="/composers?random=true"
        icon={<FiShuffle className="w-6 h-6" />}
      />

      {/* Seção de Compositores */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
            <FiUser className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            Compositores para Descobrir
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {composers.map((composer) => (
            <DiscoveryComposerCard key={composer.id} composer={composer} />
          ))}
        </div>
      </div>

      {/* Seção de Obras */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <FiMusic className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            Obras para Explorar
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {works.map((work) => (
            <DiscoveryWorkCard key={work.id} work={work} />
          ))}
        </div>
      </div>

      {/* Mystery section footer */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-full text-theme-primary text-sm font-medium backdrop-blur-sm">
          <GiTreasureMap className="w-4 h-4 text-orange-400" />
          <span>Cada descoberta revela uma nova jornada musical</span>
          <GiMusicalNotes className="w-4 h-4 text-purple-400 animate-pulse" />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>
    </section>
  );
};

export default RandomDiscoveries;
