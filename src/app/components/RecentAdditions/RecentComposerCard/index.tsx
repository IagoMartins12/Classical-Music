import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import { useState } from 'react';
import { PiClock, PiMusicNotes, PiUser } from 'react-icons/pi';
import { RecentComposerProps } from '..';
import { Text } from '@/app/components/ui/Text';

const RecentComposerCard = ({
  composer,
}: {
  composer: RecentComposerProps;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    return `${Math.floor(diffInDays / 30)} meses atrás`;
  };

  return (
    <div className="group cursor-pointer select-none">
      <Link href={`/composer/${composer.id}`}>
        <div className="classical-card-simple overflow-hidden transition-all duration-500 ease-out relative">
          {/* New badge */}
          {/* <div className="absolute top-3 left-3 z-10">
            <div className="bg-sup-2 border border-green-500/30 backdrop-blur-md rounded-full px-2 py-1 text-xs font-medium text-ouro-texto flex items-center gap-1">
              <FiPlus className="w-2.5 h-2.5" />
              Novo
            </div>
          </div> */}

          {/* Time indicator */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Text
              papel="legenda"
              tom="fraco"
              as="div"
              className="backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 bg-sup-2"
            >
              <PiClock className="w-2.5 h-2.5" />
              {formatTimeAgo(String(composer.createdAt))}
            </Text>
          </div>

          <div className="p-5">
            {/* Portrait and basic info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="relative w-14 h-14">
                  {/* Loading skeleton */}
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 loading-skeleton rounded-full"></div>
                  )}

                  {/* Portrait image or fallback */}
                  {composer.portraitUrl && !imageError ? (
                    <div className="relative w-full h-full rounded-full overflow-hidden transition-all duration-500">
                      <Image
                        src={composer.portraitUrl}
                        alt={composer.name}
                        fill
                        sizes="56px"
                        className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full fundo-sup-2 rounded-full flex items-center justify-center transition-all duration-500">
                      <PiUser className="w-6 h-6 text-theme-primary" />
                    </div>
                  )}

                  {/* Pulse indicator */}
                  {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 fundo-sup-2 rounded-full flex items-center justify-center animate-pulse">
                    <FiPlus className="w-2 h-2 text-ouro-texto" />
                  </div> */}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-theme-primary classical-title group-hover:text-ouro-texto transition-colors duration-300 line-clamp-1">
                  {composer.name}
                </h3>

                {composer.fullName !== composer.name && (
                  <Text
                    papel="rotulo"
                    tom="suave"
                    as="p"
                    className="line-clamp-1 mt-0.5"
                  >
                    {composer.fullName}
                  </Text>
                )}

                {/* Period */}
                <div className="flex items-center gap-1 mt-2">
                  <PiMusicNotes className="w-3 h-3 text-theme-tertiary" />
                  <Text papel="legenda" tom="fraco" className="font-medium">
                    {composer.epochName}
                  </Text>
                </div>
              </div>

              {/* Favorite button */}
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFavorited(!isFavorited);
                }}
                className={`w-8 h-8 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0 ${
 isFavorited
 ?'border'
 :'bg-theme-elevated border border-theme-primary/30 text-theme-tertiary hover:text-theme-primary'
 }`}
              >
                <FiHeart
                  className={`w-3.5 h-3.5 mx-auto ${
                    isFavorited ? 'fill-current' : ''
                  }`}
                />
              </button> */}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-end pt-3 border-t border-linha">
              {/* <div className="flex items-center space-x-2 text-theme-tertiary text-xs">
                <div className="w-1.5 h-1.5 bg-texto-fraco rounded-full"></div>
                <span className="font-medium">Recém-adicionado</span>
              </div> */}

              <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300">
                <svg
                  className="w-3 h-3 text-theme-tertiary group-hover:text-ouro-texto transition-all duration-300 transform group-hover:translate-x-0.5"
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

          {/* Hover glow effect */}
        </div>
      </Link>
    </div>
  );
};

export default RecentComposerCard;
