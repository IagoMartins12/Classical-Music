import { IMSLPScore } from '@/app/libs/imslp-score-scraper';
import { LuDownload, LuFileText } from 'react-icons/lu';

// Componente de Preview
interface ScorePreviewProps {
  score: IMSLPScore;
}

const ScorePreview = ({ score }: ScorePreviewProps) => {
  const handleDownload = () => {
    if (score.downloadUrl) {
      window.open(score.downloadUrl, '_blank');
    }
  };

  return (
    <div className="classical-card-simple border rounded-lg p-6" id="preview">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-theme-primary line-clamp-2">
          {score.title}
        </h3>
        <button
          onClick={handleDownload}
          disabled={!score.downloadUrl}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LuDownload className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* Preview da Partitura */}
      {score.thumbnailUrl ? (
        <div className="mb-6">
          <img
            src={score.thumbnailUrl}
            alt={`Preview de ${score.title}`}
            className="w-full max-w-sm mx-auto rounded-lg border shadow-sm"
          />
        </div>
      ) : (
        <div className="mb-6 bg-gray-100 rounded-lg p-8 text-center">
          <LuFileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
          <p className="text-theme-primary">Preview não disponível</p>
        </div>
      )}

      {/* Detalhes */}
      <div className="space-y-3 text-sm">
        {score.fileSize && (
          <div className="flex justify-between">
            <span className="text-theme-primary font-bold">Tamanho:</span>
            <span className="text-theme-primary ">{score.fileSize}</span>
          </div>
        )}

        {score.pageCount && (
          <div className="flex justify-between">
            <span className="text-theme-primary font-bold">Páginas:</span>
            <span className="text-theme-primary">{score.pageCount}</span>
          </div>
        )}

        {/* {score.rating && (
          <div className="flex justify-between">
            <span className="text-theme-primary">Avaliação:</span>
            <div className="flex items-center gap-1">
              <LuStar className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-900">{score.rating.toFixed(1)}</span>
              {score.ratingsCount && (
                <span className="text-theme-primary">
                  ({score.ratingsCount})
                </span>
              )}
            </div>
          </div>
        )} */}

        {score.downloadCount && (
          <div className="flex justify-between">
            <span className="text-theme-primary font-bold">Downloads:</span>
            <span className="text-theme-primary0">{score.downloadCount}</span>
          </div>
        )}

        {score.copyright && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-theme-primary  font-bold block mb-1">
              Copyright:
            </span>
            <span className="text-theme-primary text-xs">
              {score.copyright}
            </span>
          </div>
        )}

        {score.notes && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-theme-primary text-bold block mb-1">
              Notas:
            </span>
            <span className="text-theme-primary text-xs">{score.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScorePreview;
