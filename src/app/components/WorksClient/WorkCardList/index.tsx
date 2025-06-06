import { WorkListItem } from '@/app/requests/work-details';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';

interface workCardListProps {
  work: WorkListItem;
}
const WorkCardList: React.FC<workCardListProps> = ({ work }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-4">
          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {work.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Link
                href={`/composer/${work.composer.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {work.composer.name}
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">
                {work.composer.epochName}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {work.opOrCatalog && <span>{work.opOrCatalog}</span>}
              {work.instrument?.name && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{work.instrument.name}</span>
                </>
              )}
              {work.compositionYear && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{work.compositionYear}</span>
                </>
              )}
              {work.mediaDuration && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>⏱️ {work.mediaDuration}</span>
                </>
              )}
            </div>
          </div>

          {/* Badges resumidas */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {work.isPartOfCollection && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Coleção
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ícone de link externo */}
      <div className="ml-4 flex-shrink-0">
        <FiExternalLink className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

export default WorkCardList;
