// app/components/ComposersByEpoch/ComposersByEpoch.tsx
'use client';

import { FiClock, FiUsers, FiMusic, FiChevronDown } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import SectionTitle from '../Utils/SectionTitle';

interface Epoch {
  id: string;
  name: string;
  composers: Array<{
    id: string;
    name: string;
    fullName: string;
    portraitUrl?: string;
  }>;
}

interface ComposersByEpochProps {
  epochs: Epoch[];
}

const EpochCard = ({ epoch }: { epoch: Epoch }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Definir imagens e estilos específicos para cada período
  const getEpochData = (epochName: string) => {
    const epochData = {
      Medieval: {
        gradient: 'from-amber-600/30 to-yellow-500/30',
        border: 'border-amber-500/40',
        icon: '🏰',
        accent: 'text-amber-400',
        bgColor: 'bg-amber-900/20',
        image: '/epochs/medieval.jpg',
        description: 'Século V - XV',
        buttonGradient: 'from-amber-500 to-yellow-500',
      },
      Renascentista: {
        gradient: 'from-emerald-600/30 to-green-500/30',
        border: 'border-emerald-500/40',
        icon: '🎨',
        accent: 'text-emerald-400',
        bgColor: 'bg-emerald-900/20',
        image: '/epochs/renaissance.webp',
        description: 'Século XV - XVI',
        buttonGradient: 'from-emerald-500 to-green-500',
      },
      Barroco: {
        gradient: 'from-purple-600/30 to-violet-500/30',
        border: 'border-purple-500/40',
        icon: '👑',
        accent: 'text-purple-400',
        bgColor: 'bg-purple-900/20',
        image: '/epochs/baroque.jpeg',
        description: '1600 - 1750',
        buttonGradient: 'from-purple-500 to-violet-500',
      },
      Clássico: {
        gradient: 'from-blue-600/30 to-cyan-500/30',
        border: 'border-blue-500/40',
        icon: '🎼',
        accent: 'text-blue-400',
        bgColor: 'bg-blue-900/20',
        image: '/epochs/classical.jpg',
        description: '1750 - 1820',
        buttonGradient: 'from-blue-500 to-cyan-500',
      },
      Rômantico: {
        gradient: 'from-rose-600/30 to-pink-500/30',
        border: 'border-rose-500/40',
        icon: '💕',
        accent: 'text-rose-400',
        bgColor: 'bg-rose-900/20',
        image: '/epochs/romantic.jpeg',
        description: '1820 - 1910',
        buttonGradient: 'from-rose-500 to-pink-500',
      },
      Modernismo: {
        gradient: 'from-orange-600/30 to-red-500/30',
        border: 'border-orange-500/40',
        icon: '⚡',
        accent: 'text-orange-400',
        bgColor: 'bg-orange-900/20',
        image: '/epochs/modern.jpg',
        description: '1910 - 1945',
        buttonGradient: 'from-orange-500 to-red-500',
      },
      Contemporâneo: {
        gradient: 'from-teal-600/30 to-cyan-500/30',
        border: 'border-teal-500/40',
        icon: '🚀',
        accent: 'text-teal-400',
        bgColor: 'bg-teal-900/20',
        image: '/epochs/contemporary.jpg',
        description: '1945 - presente',
        buttonGradient: 'from-teal-500 to-cyan-500',
      },
    };

    return (
      epochData[epochName as keyof typeof epochData] || {
        gradient: 'from-brand-primary/30 to-brand-secondary/30',
        border: 'border-brand-primary/40',
        icon: '🎵',
        accent: 'text-brand-primary',
        bgColor: 'bg-brand-primary/20',
        image: '/epochs/default.jpg',
        description: 'Período musical',
        buttonGradient: 'from-brand-primary to-brand-secondary',
      }
    );
  };

  const epochData = getEpochData(epoch.name);

  return (
    <div className="group cursor-pointer select-none">
      {/* Círculo principal */}
      <div
        className={`
          relative w-40 h-40 mx-auto rounded-full overflow-hidden
          border-3 border-theme-primary 
          transition-all duration-500 ease-out
          group-hover:scale-105 group-hover:shadow-theme-glow
          
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Imagem de fundo da época */}
        <div className="absolute inset-0">
          {/* Fallback com gradiente se não houver imagem */}
          <div
            className={`w-full h-full bg-gradient-to-br ${epochData.gradient}`}
          ></div>

          {/* Imagem da época (comentado até você adicionar as imagens) */}
          <Image
            src={epochData.image}
            alt={`Período ${epoch.name}`}
            fill
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            sizes="160px"
          />
        </div>

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500"></div>

        {/* Conteúdo do círculo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-3"></div>

        {/* Indicador de click */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div
            className={`w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <FiChevronDown className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Brilho decorativo */}
        <div className="absolute inset-0 rounded-full bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
      </div>

      {/* Informações da época - sempre visível */}
      <div className="mt-4 text-center">
        <h4 className="text-xl font-bold text-theme-primary classical-title mb-1">
          {epoch.name}
        </h4>
        <p className="text-sm text-theme-secondary mb-3">
          {epochData.description}
        </p>
      </div>

      {/* Opções de navegação - expandidas */}
      <div
        className={`
        transition-all duration-500 ease-out overflow-hidden
        ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
      `}
      >
        <div className="space-y-3 px-4">
          {/* Botão Compositores */}
          <Link
            href={`/composers?epoch=${epoch.id}`}
            className="group/btn flex items-center justify-between w-full px-4 py-3 bg-theme-elevated/90 backdrop-blur-md border border-theme-primary/30 rounded-xl text-theme-primary font-medium hover:bg-interactive-hover hover:border-brand-primary hover:text-brand-primary transition-all duration-300 shadow-theme-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FiUsers className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Compositores</div>
                <div className="text-xs opacity-80">Explorar conteudo</div>
              </div>
            </div>
            <svg
              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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
          </Link>

          {/* Botão Peças */}
          <Link
            href={`/works?epoch=${epoch.id}`}
            className="group/btn flex items-center justify-between w-full px-4 py-3 bg-theme-elevated/90 backdrop-blur-md border border-theme-primary/30 rounded-xl text-theme-primary font-medium hover:bg-interactive-hover hover:border-brand-primary hover:text-brand-primary transition-all duration-300 shadow-theme-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FiMusic className="w-4 h-4" />
              </div>

              <div className="text-left">
                <div className="text-sm font-semibold">Obras Musicais</div>
                <div className="text-xs opacity-70">Explorar repertório</div>
              </div>
            </div>
            <svg
              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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
          </Link>
        </div>
      </div>

      {/* Dica de interação */}
      {!isExpanded && (
        <div className="mt-3 text-center">
          <span className="text-xs text-theme-tertiary font-medium opacity-60">
            Clique para navegar
          </span>
        </div>
      )}
    </div>
  );
};

const ComposersByEpoch: React.FC<ComposersByEpochProps> = ({ epochs }) => {
  return (
    <section className="section-wrap relative py-16">
      <SectionTitle
        title="Explore por Período"
        subtitle="Descubra a evolução da música através dos séculos"
        linkText="Ver todos os períodos"
        linkHref="/composers"
        icon={<FiClock className="w-6 h-6" />}
        accent="purple"
      />

      {/* Grid de épocas - responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 mt-12">
        {epochs.map((epoch, index) => (
          <div
            key={epoch.id}
            className="animate-fade-in-up py-4"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <EpochCard epoch={epoch} />
          </div>
        ))}
      </div>

      {/* Informação adicional */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-2xl text-purple-400 text-sm font-medium backdrop-blur-sm">
          <GiMusicalNotes className="w-5 h-5" />
          <span>Cada período representa uma revolução na história musical</span>
          <FiClock className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>
    </section>
  );
};

export default ComposersByEpoch;
