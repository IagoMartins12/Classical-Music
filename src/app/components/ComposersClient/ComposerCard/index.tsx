import Image from 'next/image';
import { ComposerImslp } from '..';

interface composerCardProps {
  composer: ComposerImslp;
}
const ComposerCard: React.FC<composerCardProps> = ({ composer }) => {
  return (
    <div className="p-6">
      {/* Foto do compositor */}
      {composer.portraitUrl && (
        <div className="mb-4 flex justify-center">
          <div className="w-28 h-28 relative rounded-full overflow-hidden">
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
        <p className="text-sm text-gray-600 mb-2">{composer.fullName}</p>
      )}

      {/* Datas */}
      {(composer.birthDate || composer.deathDate) && (
        <p className="text-sm text-gray-500 mb-2">
          {composer.birthDate} - {composer.deathDate || 'presente'}
        </p>
      )}

      {/* Época */}
      {composer.epochName && (
        <p className="text-sm text-blue-600 mb-3">{composer.epochName}</p>
      )}

      {/* Links */}
      <div className="flex gap-2">
        {composer.wikipediaLink && (
          <a
            href={composer.wikipediaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
          >
            IMSLP
          </a>
        )}
      </div>
    </div>
  );
};

export default ComposerCard;
