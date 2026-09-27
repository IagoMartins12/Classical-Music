// app/composers/ComposerCard.tsx - Updated with Favorites
'use client';

import {
  cliqueSimples,
  navegarComTransicao,
  nomeDeTransicao,
} from '@/app/components/ui/transicao';
import { useLocalizedRouter } from '@/app/hooks/useLocalizedRouter';
import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import FavoriteButton from '../../FavoriteButton';
import VerificationBadge from '../../Verification/VerificationBadge';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { ComposerImslp } from '@/app/[lang]/(main)/composers/pageClient';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface composerCardProps {
  composer: ComposerImslp;
}

const ComposerCard: React.FC<composerCardProps> = ({ composer }) => {
  const { t } = useTranslation({ sections: ['pages/composers'] });
  const router = useLocalizedRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDates = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate
      ? new Date(composer.birthDate).getFullYear()
      : '?';
    const death = composer.deathDate
      ? new Date(composer.deathDate).getFullYear()
      : t('card_jsx_span_children_0__presente');

    return `${birth} - ${death}`;
  };

  const hasExternalLinks = composer.wikipediaLink || composer.permLinkImslp;

  return (
    /**
     * O cartão inteiro é clicável por um link esticado sobre ele
     * (`after:absolute after:inset-0` na âncora do nome), não por um `onClick`
     * na `div`.
     *
     * **Por que isso importa:** um `onClick` não é seguido por buscador
     * nenhum. A lista de compositores é a porta de entrada para as páginas de
     * compositor, e sem `href` elas só eram descobertas pelo sitemap.
     *
     * O link envolve só o nome — envolver o cartão inteiro aninharia os links
     * da Wikipedia e do IMSLP dentro de outra âncora, o que é HTML inválido.
     * Eles sobem para `z-10` e continuam clicáveis por cima da área esticada.
     */
    <div className="group select-none h-full relative">
      <div
        style={nomeDeTransicao(`compositor-${composer.id}`)}
        className="classical-card h-full overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2"
      >
        {/* Portrait Section */}
        <div className="relative p-6 pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              {/* Loading skeleton */}
              {!imageLoaded && !imageError && (
                <div className="absolute  loading-skeleton rounded-full"></div>
              )}

              {/* Portrait image or fallback */}
              {composer.portraitUrl && !imageError ? (
                <div className="relative w-full h-full rounded-full overflow-hidden border-3 transition-all duration-500">
                  <Image
                    src={composer.portraitUrl}
                    alt={composer.name}
                    fill
                    sizes="112px"
                    className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    priority
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"></div>
                </div>
              ) : (
                // Fallback avatar
                <div className="w-full h-full rounded-full flex items-center justify-center border-3 transition-all duration-500 group-hover:scale-110">
                  <PiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                </div>
              )}
            </div>
          </div>

          {/* Floating action buttons */}
          <Stack
            gap={2}
            className="absolute top-4 right-4 z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <FavoriteButton
              id={composer.id}
              type="composer"
              variant="small"
              size="md"
              itemName={composer.fullName}
              showToast={true}
            />
          </Stack>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 music-note-background"></div>

          <div className="relative z-10 space-y-3">
            {/* Name */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-theme-primary classical-title transition-colors duration-300 line-clamp-2">
                <Link
                  href={`/composer/${composer.id}`}
                  onClick={(e) => {
                    // Clique simples vira transição; com tecla ou botão do
                    // meio, o link abre como sempre (nova aba, etc.).
                    if (!cliqueSimples(e)) return;
                    e.preventDefault();
                    navegarComTransicao(
                      router.push,
                      `/composer/${composer.id}`
                    );
                  }}
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 rounded"
                >
                  {composer.name}
                </Link>
              </h3>

              {/* Full name if different */}
              <Text
                papel="rotulo"
                tom="suave"
                className="flex items-center justify-center gap-2 mt-1 line-clamp-2"
              >
                {composer.fullName}
                <VerificationBadge
                  verified={composer.isVerified}
                  variant="icon"
                />
              </Text>
            </div>

            {/* Dates */}
            {formatDates() && (
              <Text
                papel="rotulo"
                tom="fraco"
                as="div"
                className="flex items-center justify-center"
              >
                <PiCalendarBlank className="w-3 h-3 mr-1" />
                {formatDates()}
              </Text>
            )}

            {/* Period info */}
            {composer.epochName && (
              <div className="text-center">
                <Text
                  papel="legenda"
                  tom="ouro"
                  className="inline-flex items-center px-3 py-1 rounded-full font-medium transition-colors duration-300 bg-sup-2"
                >
                  <PiMusicNotes className="w-3 h-3 mr-1" />
                  {translateEpochWithHook(composer.epochName, t)}
                </Text>
              </div>
            )}

            {/* External links */}
            {hasExternalLinks && (
              <div className="relative z-10 flex justify-center space-x-2 pt-2">
                {composer.wikipediaLink && (
                  <a
                    href={composer.wikipediaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium hover:scale-105 transition-all duration-300 group/link bg-sup-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Wikipedia
                    <PiArrowSquareOut className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                )}
                {composer.permLinkImslp && (
                  <a
                    href={composer.permLinkImslp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium hover:scale-105 transition-all duration-300 group/link bg-sup-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    IMSLP
                    <PiArrowSquareOut className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            )}

            {/* Action indicator */}
            <div className="flex items-center justify-center pt-4 border-t border-theme-secondary mt-4">
              <Inline gap={2} className="text-theme-tertiary text-xs">
                <div className="w-2 h-2 rounded-full animate-pulse"></div>
                <span className="font-medium">
                  {t('card_jsx_span_children_0__explorar_obras')}
                </span>
                <svg
                  className="w-3 h-3 transition-transform group-hover:translate-x-1"
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
              </Inline>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-b-2xl"></div>
        </div>

        {/* Floating mini indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100"></div>
      </div>
    </div>
  );
};

export default ComposerCard;
