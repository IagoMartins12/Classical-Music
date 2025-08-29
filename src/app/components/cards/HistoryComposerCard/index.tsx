// HistoryComposerCard.tsx - Premium version with theme system
'use client';

import { useComposerBiography } from '@/app/hooks/useComposerBiography';
import Image from 'next/image';
import Link from 'next/link';
import { FiUser, FiCalendar, FiExternalLink } from 'react-icons/fi';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  birthDate: string | null;
  deathDate: string | null;
  bio: string | null;
}

interface Props {
  composer: Composer;
}

export function HistoryComposerCard({ composer }: Props) {
  const getLifespan = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate
      ? new Date(composer.birthDate).getFullYear()
      : null;

    let death: number | null = null;
    if (composer.deathDate) {
      const year = new Date(composer.deathDate).getFullYear();
      death = Number.isNaN(year) ? NaN : year;
    } else {
      death = null;
    }

    if (birth && death !== null && !Number.isNaN(death)) {
      // birth e death válidos
      return `${birth} - ${death}`;
    } else if (birth && Number.isNaN(death)) {
      // death é NaN (data inválida)
      return `${birth} - Não definido`;
    } else if (birth && death === null) {
      // death ausente (null)
      return `${birth} - presente`;
    } else if (!birth && death !== null && !Number.isNaN(death)) {
      // só death válido
      return `? - ${death}`;
    }

    return null;
  };
  const lifespan = getLifespan();
  const { biography } = useComposerBiography(
    composer.id,
    composer.fullName || composer.name,
    composer.bio // Fallback para a biografia do banco se não tiver no cache
  );

  return (
    <Link
      href={`/composer/${composer.id}`}
      className="block classical-card-simple p-4 hover:shadow-theme-glow transition-all duration-500 hover:scale-105 group relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-3">
          {/* Portrait */}
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center shadow-theme-medium flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
            {composer.portraitUrl ? (
              <Image
                src={composer.portraitUrl}
                alt={composer.fullName}
                className="w-12 h-12 rounded-lg object-cover border-2 border-theme-inverse/20"
                width={20}
                height={20}
              />
            ) : null}
            <FiUser
              className={`text-theme-inverse text-sm ${
                composer.portraitUrl ? 'hidden' : ''
              }`}
            />
          </div>

          {/* Name and Link Icon */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 line-clamp-1">
              {composer.fullName}
            </h4>
            {lifespan && (
              <div className="flex items-center text-theme-tertiary text-xs mt-1">
                <FiCalendar className="w-3 h-3 mr-1" />
                <span>{lifespan}</span>
              </div>
            )}
          </div>

          {/* Link indicator */}
          <div className="w-6 h-6 bg-interactive-hover border border-theme-secondary rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-all duration-300">
            <FiExternalLink className="w-3 h-3" />
          </div>
        </div>

        {/* Bio snippet */}
        {biography && (
          <p className="text-theme-secondary text-xs leading-relaxed line-clamp-2 group-hover:text-theme-primary transition-colors duration-300">
            {biography.length > 150
              ? `${biography.substring(0, 150)}...`
              : biography}
          </p>
        )}

        {/* Bottom indicator */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-theme-secondary">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-theme-tertiary font-medium">
              Ver detalhes
            </span>
          </div>

          <svg
            className="w-3 h-3 text-theme-tertiary group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all duration-300"
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

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
    </Link>
  );
}
