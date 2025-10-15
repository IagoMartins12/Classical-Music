// app/components/ComposersByEpoch/ComposersByEpoch.tsx
'use client';

import { FiClock, FiUsers, FiMusic, FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import SectionTitle from '../Utils/SectionTitle';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { useTranslation } from '@/app/context/TranslationContext';

interface Epoch {
  id: string;
  name: string;
}

interface ComposersByEpochProps {
  epochs: Epoch[];
}

const EpochCard = ({ epoch }: { epoch: Epoch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, language } = useTranslation({ sections: ['pages/home'] });

  // Definir imagens e estilos específicos para cada período
  const getEpochData = (epochName: string) => {
    const epochData = {
      Medieval: {
        image: '/epochs/medieval.jpg',
        description: {
          ptBR: 'Século V - XV',
          en: '5th - 15th Century',
        },
      },
      Renascentista: {
        image: '/epochs/renaissance.webp',
        description: {
          ptBR: 'Século XV - XVI',
          en: '15th - 16th Century',
        },
      },
      Barroco: {
        image: '/epochs/baroque.jpeg',
        description: {
          ptBR: '1600 - 1750',
          en: '1600 - 1750y',
        },
      },
      Clássico: {
        image: '/epochs/classical.jpg',
        description: {
          ptBR: '1750 - 1820',
          en: '1750 - 1820',
        },
      },
      Romântico: {
        image: '/epochs/romantic.jpeg',
        description: {
          ptBR: '1820 - 1910',
          en: '1820 - 1910',
        },
      },
      Modernismo: {
        image: '/epochs/modern.jpg',
        description: {
          ptBR: '1910 - 1945',
          en: '1910 - 1945',
        },
      },
      Contemporâneo: {
        image: '/epochs/contemporary.jpg',
        description: {
          ptBR: '1945 - presente',
          en: '1945 - present',
        },
      },
      Todos: {
        image: '/epochs/all.png',
        description: {
          ptBR: 'Todos os periodos musicais',
          en: 'All Musical periods',
        },
      },
    };

    return (
      epochData[epochName as keyof typeof epochData] || {
        gradient: 'from-brand-primary/30 to-brand-secondary/30',
        border: 'border-brand-primary/40',
        icon: '🎵',
        accent: 'text-brand-primary',
        image: '/epochs/default.jpg',
        description: 'Período musical',
      }
    );
  };

  const epochData = getEpochData(epoch.name);

  return (
    <div
      className="group cursor-pointer select-none"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Círculo principal */}
      <div
        className={`
          relative w-40 h-40 mx-auto rounded-full overflow-hidden
          border-3 border-theme-primary 
          transition-all duration-500 ease-out
          group-hover:scale-105 group-hover:shadow-theme-glow
          
        `}
      >
        {/* Imagem de fundo da época */}
        <div className="absolute inset-0">
          <Image
            src={epochData.image}
            alt={`Período ${translateEpochWithHook(epoch.name, t)}`}
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
          {translateEpochWithHook(epoch.name, t)}
        </h4>
        <p className="text-sm text-theme-secondary mb-3">
          {language === 'pt'
            ? epochData.description.ptBR
            : epochData.description.en}
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
            href={
              epoch.name !== 'Todos'
                ? `/composers?epoch=${epoch.id}`
                : `/composers`
            }
            className=" flex items-center justify-between w-full px-4 py-3 bg-theme-tertiary rounded-xl text-theme-primary font-medium hover:bg-interactive-hover hover:border-brand-primary hover:text-brand-primary transition-all duration-300 shadow-theme-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg hidden md:flex items-center justify-center">
                <FiUsers className="w-4 h-4 " />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">
                  {t('composers_by_epoch_composers')}
                </div>
                <div className="text-xs opacity-80">
                  {t('composers_by_epoch_composers_desc')}
                </div>
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
            href={
              epoch.name !== 'Todos' ? `/works?epoch=${epoch.id}` : `/works`
            }
            className="group/btn flex items-center justify-between w-full px-4 py-3 bg-theme-tertiary rounded-xl text-theme-primary font-medium hover:bg-interactive-hover hover:border-brand-primary hover:text-brand-primary transition-all duration-300 shadow-theme-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg hidden md:flex items-center justify-center">
                <FiMusic className="w-4 h-4" />
              </div>

              <div className="text-left">
                <div className="text-sm font-semibold">
                  {t('composers_by_epoch_works')}
                </div>
                <div className="text-xs opacity-70">
                  {t('composers_by_epoch_works_desc')}
                </div>
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
        <div className=" text-center">
          <span className="text-xs text-theme-tertiary font-medium opacity-60">
            {t('composers_by_epoch_click_navigate')}
          </span>
        </div>
      )}
    </div>
  );
};

const ComposersByEpoch: React.FC<ComposersByEpochProps> = ({ epochs }) => {
  const { t } = useTranslation({ sections: ['pages/home'] });

  const epochCardMock = {
    id: '8',
    name: 'Todos',
  };

  return (
    <section className="section-wrap relative py-16 !mb-8">
      <SectionTitle
        title={t('composers_by_epoch_title')}
        subtitle={t('composers_by_epoch_subtitle')}
        linkText={t('composers_by_epoch_link_text')}
        linkHref="/composers"
        icon={<FiClock className="w-6 h-6" />}
        accent="purple"
      />

      {/* Grid de épocas - responsivo */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 md:gap-8 lg:gap-10 mt-12">
        {epochs.map((epoch, index) => (
          <div
            key={epoch.id}
            className="animate-fade-in-up py-4"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <EpochCard epoch={epoch} />
          </div>
        ))}

        <div
          className="animate-fade-in-up py-4"
          style={{ animationDelay: `${8 * 150}ms` }}
        >
          <EpochCard epoch={epochCardMock} />
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
