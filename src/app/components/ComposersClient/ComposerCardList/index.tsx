import Image from 'next/image';
import { ComposerImslp } from '..';

interface composerCardListProps {
  composer: ComposerImslp;
}
const ComposerCardList: React.FC<composerCardListProps> = ({ composer }) => {
  return (
    <>
      <div className="flex-1">
        <h3 className="text-base font-medium text-gray-900">{composer.name}</h3>
        {composer.fullName !== composer.name && (
          <p className="text-sm text-gray-600 mt-1">{composer.fullName}</p>
        )}
        <div className="flex items-center space-x-4 mt-1">
          {composer.epochName && (
            <span className="text-sm text-blue-600">{composer.epochName}</span>
          )}
        </div>
      </div>

      {/* Links externos */}
      <div className="flex gap-2 ml-4">
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
    </>
  );
};

export default ComposerCardList;
