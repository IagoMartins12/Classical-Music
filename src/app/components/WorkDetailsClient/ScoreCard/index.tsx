import { IMSLPScore } from '@/app/libs/imslp-score-scraper';
import { LuClock, LuDownload, LuFileText, LuStar } from 'react-icons/lu';

interface ScoreCardProps {
  score: IMSLPScore;
  isSelected: boolean;
  onSelect: () => void;
}

const ScoreCard = ({ score, isSelected, onSelect }: ScoreCardProps) => {
  return (
    <div
      className={`
          border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
          ${
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }
        `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        {score.thumbnailUrl && (
          <img
            src={score.thumbnailUrl}
            alt={`Preview de ${score.title}`}
            className="w-16 h-20 object-cover rounded border"
          />
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

            {/* {score.rating && (
              <div className="flex items-center gap-1">
                <LuStar className="w-3 h-3 text-yellow-500" />
                {score.rating.toFixed(1)}
                {score.ratingsCount && ` (${score.ratingsCount})`}
              </div>
            )} */}

            {score.uploader && (
              <div className="flex items-center gap-1">
                <LuClock className="w-3 h-3" />
                {score.uploader}
                {score.uploadDate && ` • ${score.uploadDate}`}
              </div>
            )}
          </div>

          {(score.editor || score.publisher) && (
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
