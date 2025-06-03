import { WorkListItem, WorksListResponse } from '@/app/requests/work-details';
import Link from 'next/link';
import { JSX } from 'react';
import { FiClock, FiMusic, FiUser } from 'react-icons/fi';

interface workCardProps {
  work: WorkListItem;
  renderCategories: (
    categories: {
      id: string;
      name: string;
    }[]
  ) => JSX.Element | null;
  renderWorkGenres: (
    workGenres: {
      id: string;
      name: string;
    }[]
  ) => JSX.Element | null;
}
const WorkCard: React.FC<workCardProps> = ({
  work,
  renderCategories,
  renderWorkGenres,
}) => {
  return (
    <div className="p-6 h-full flex flex-col justify-between">
      <div>
        {/* Título da Obra */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link
            href={`/works/${work.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {work.title}
          </Link>
        </h3>

        {/* Opus/Catálogo */}
        {work.opOrCatalog && (
          <p className="text-sm text-gray-600 mb-2">{work.opOrCatalog}</p>
        )}

        {/* Compositor */}
        <div className="flex items-center gap-2 mb-3">
          <FiUser className="w-4 h-4 text-gray-400" />
          <Link
            href={`/composer/${work.composer.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {work.composer.name}
          </Link>
        </div>

        {/* Informações adicionais */}
        <div className="space-y-2 mb-4">
          {work.instrument?.name && (
            <div className="flex items-center gap-2">
              <FiMusic className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {work.instrument.name}
              </span>
            </div>
          )}

          {work.genre?.name && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{work.genre.name}</span>
            </div>
          )}

          {work.compositionYear && (
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {work.compositionYear}
              </span>
            </div>
          )}

          {work.mediaDuration && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                ⏱️ {work.mediaDuration}
              </span>
            </div>
          )}

          {work.tone && (
            <div className="text-sm text-gray-600">Tom: {work.tone}</div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {work.composer.epochName}
          </span>
          {work.isPartOfCollection && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Coleção
            </span>
          )}
          {/* Categorias */}
          {/* {renderCategories(work.categories)} */}
          {/* Gêneros de Trabalho */}
          {/* {renderWorkGenres(work.workGenres)} */}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <Link
          href={`/works/${work.id}`}
          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
};

export default WorkCard;
