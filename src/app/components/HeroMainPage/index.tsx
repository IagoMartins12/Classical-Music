'use client';

import { useTranslation } from '@/app/context/TranslationContext';
import Image from 'next/image';
import Link from 'next/link';

const HeroMainPage = () => {
  const { t } = useTranslation({ sections: ['pages/home'] });

  console.log('hero page loaded');
  return (
    <div className="section-wrap flex flex-col lg:flex-row gap-6">
      {/* Seção Principal - História da Música */}
      <Link
        href="/music-history"
        className="relative w-full lg:w-8/12 rounded-2xl  !p-0 classical-card overflow-hidden group transition-all duration-500 flex"
      >
        <div className="relative flex-1 h-96 md:h-80 lg:h-auto">
          <Image
            alt={t('heroMainPage_image_alt_partitura')}
            src="/classical-period-2.jpg"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 60vw"
            className="object-cover transition-transform duration-500"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Conteúdo sobreposto */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">
              {t('heroMainPage_link_musica')}
            </h2>
            <p className="text-gray-200 text-base lg:text-lg mb-4 leading-relaxed line-clamp-3 md:line-clamp-none">
              {t('heroMainPage_banner_1')}
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold transition-all duration-300 group/btn">
              {t('heroMainPage_link_explorar_história_completa')}
              <svg
                className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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
            </div>
          </div>
        </div>
      </Link>

      {/* Seções Laterais */}
      <div className="w-full lg:w-4/12 flex flex-col gap-4">
        {/* Card Instrumentação */}
        <Link
          href="/instruments"
          className="relative rounded-2xl bg-white shadow-lg  !p-0 classical-card overflow-hidden group transition-all duration-500"
        >
          <div className="relative h-64">
            <Image
              alt={t('heroMainPage_image_alt_classico')}
              src="/instrument-2.jpg"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {/* <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-purple-600/90 rounded-full text-xs font-medium mb-2">
                  🎻 Instrumentos
                </span>
              </div> */}
              <h3 className="text-lg font-bold mb-2">
                {t('heroMainPage_link_instrumentação_clássica')}
              </h3>
              <p className="text-gray-200 text-sm mb-3 leading-snug">
                {t('heroMainPage_link_musica_1')}
              </p>
              <div className="inline-flex items-center text-sm font-semibold text-white  transition-colors group/div">
                {t('heroMainPage_link_descobrir_mais')}
                <svg
                  className="ml-1 w-3 h-3 transition-transform group-hover/link:translate-x-1"
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
              </div>
            </div>
          </div>
        </Link>

        {/* Card Sobre o Projeto */}
        <Link
          href="/about-us"
          className="relative rounded-2xl bg-white shadow-lg !p-0 classical-card overflow-hidden group transition-all duration-500"
        >
          <div className="relative h-64">
            <Image
              alt={t('heroMainPage_image_alt_partitura_1')}
              src="/wallpaper.jpg"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {/* <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-green-600/90 rounded-full text-xs font-medium mb-2">
                  🎼 Sobre Nós
                </span>
              </div> */}
              <h3 className="text-lg font-bold mb-2">
                {t('heroMainPage_link_nossa_missão')}
              </h3>
              <p className="text-gray-200 text-sm mb-3 leading-snug">
                {t('heroMainPage_banner_3')}
              </p>
              <div className="inline-flex items-center text-sm font-semibold text-white  transition-colors group/link">
                {t('heroMainPage_link_conheça_nossa_história')}
                <svg
                  className="ml-1 w-3 h-3 transition-transform group-hover/link:translate-x-1"
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
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HeroMainPage;
