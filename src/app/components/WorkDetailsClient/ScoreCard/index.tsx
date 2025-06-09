import { IMSLPScore } from '@/app/libs/imslp-score-scraper';
import { LuClock, LuDownload, LuFileText, LuStar } from 'react-icons/lu';
import { useState } from 'react';

interface ScoreCardProps {
  score: IMSLPScore;
  isSelected: boolean;
  onSelect: () => void;
  isLastInGroup?: boolean; // Nova prop para identificar se é o último do grupo
  groupSize?: number; // Nova prop para saber o tamanho do grupo
}

const ScoreCard = ({
  score,
  isSelected,
  onSelect,
  isLastInGroup = false,
  groupSize = 1,
}: ScoreCardProps) => {
  const [showMagnified, setShowMagnified] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Determina se deve mostrar o thumbnail
  // Mostra se: é o último do grupo E o grupo tem mais de 1 item, OU se o grupo tem apenas 1 item
  const shouldShowThumbnail = groupSize === 1 || isLastInGroup;

  return (
    <div
      className={`
          border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
          ${
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }
          ${shouldShowThumbnail ? '' : 'mb-0 border-b-0'}
        `}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        {/* Thumbnail com efeito lupa - só mostra se for o último do grupo */}
        {shouldShowThumbnail && score.thumbnailUrl && (
          <div
            className="relative w-24 h-28 flex-shrink-0"
            onMouseEnter={() => setShowMagnified(true)}
            onMouseLeave={() => setShowMagnified(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
          >
            <img
              src={score.thumbnailUrl}
              alt={`Preview de ${score.title}`}
              className="w-full h-full object-cover rounded border"
            />

            {/* Lupa expandida */}
            {showMagnified && (
              <div
                className="absolute z-[9999] pointer-events-none w-[20rem]"
                style={{
                  left: `${mousePosition.x + 30}px`,
                  top: `${mousePosition.y - 50}px`,
                }}
              >
                <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-2">
                  <img
                    src={score.thumbnailUrl}
                    alt={`Preview expandido de ${score.title}`}
                    className="w-80 h-96 object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">
              {score.title}
            </h4>
            {score.downloadUrl && (
              <a
                href={score.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <LuDownload className="w-3 h-3" />
                Download
              </a>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {score.fileSize && (
              <div className="flex items-center gap-1">
                <LuFileText className="w-3 h-3" />
                {score.fileSize}
                {score.pageCount && ` • ${score.pageCount} páginas`}
              </div>
            )}

            {shouldShowThumbnail && score.uploader && (
              <div className="flex items-center gap-1">
                <LuClock className="w-3 h-3" />
                {score.uploader}
                {score.uploadDate && ` • ${score.uploadDate}`}
              </div>
            )}
          </div>

          {shouldShowThumbnail && (score.editor || score.publisher) && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              {score.editor && <div>Editor: {score.editor}</div>}
              {score.publisher && <div>Editora: {score.publisher}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
