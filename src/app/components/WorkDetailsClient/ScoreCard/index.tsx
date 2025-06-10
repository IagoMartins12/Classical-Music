// ScoreCard.tsx - Premium version with theme system
import { IMSLPScore } from '@/app/libs/imslp-score-scraper';
import {
  FiClock,
  FiDownload,
  FiFileText,
  FiStar,
  FiUser,
} from 'react-icons/fi';
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
          classical-card-simple cursor-pointer transition-all duration-300 hover:shadow-theme-glow group relative overflow-hidden
          ${
            isSelected
              ? 'border-brand-primary bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 shadow-theme-glow'
              : 'hover:border-theme-primary hover:bg-interactive-hover'
          }
          ${shouldShowThumbnail ? '' : 'mb-0 border-b-0 rounded-b-none'}
        `}
      onClick={onSelect}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gradient"></div>
      )}

      <div className="flex items-center gap-6 p-6">
        {/* Thumbnail com efeito lupa - só mostra se for o último do grupo */}
        {shouldShowThumbnail && score.thumbnailUrl && (
          <div
            className="relative w-24 h-32 flex-shrink-0 group/thumbnail"
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
            <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-theme-primary shadow-theme-medium group-hover/thumbnail:shadow-theme-glow transition-all duration-300 group-hover/thumbnail:scale-105">
              <img
                src={score.thumbnailUrl}
                alt={`Preview de ${score.title}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/thumbnail:scale-110"
              />

              {/* Overlay com ícone de zoom */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-8 h-8 bg-theme-inverse rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-theme-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lupa expandida */}
            {showMagnified && (
              <div
                className="fixed z-[9999] pointer-events-none animate-fade-in-scale"
                style={{
                  left: `${mousePosition.x + 50}px`,
                  top: `${mousePosition.y - 100}px`,
                }}
              >
                <div className="bg-theme-elevated rounded-2xl shadow-theme-large border-2 border-theme-primary p-3 backdrop-blur-md">
                  <img
                    src={score.thumbnailUrl}
                    alt={`Preview expandido de ${score.title}`}
                    className="w-80 h-96 object-contain rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h4 className="font-semibold text-theme-primary text-base leading-tight classical-title mb-2 group-hover:text-brand-primary transition-colors duration-300">
                {score.title}
              </h4>

              {/* Rating se disponível */}
              {score.rating && (
                <div className="flex items-center space-x-1 mb-2">
                  <FiStar className="w-3 h-3 text-accent-gold fill-current" />
                  <span className="text-sm font-medium text-accent-gold">
                    {score.rating.toFixed(1)}
                  </span>
                  {score.ratingsCount && (
                    <span className="text-xs text-theme-tertiary">
                      ({score.ratingsCount})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Download button */}
            {score.downloadUrl && (
              <a
                href={score.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-brand-gradient text-theme-inverse px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300 flex-shrink-0 group/download"
                onClick={(e) => e.stopPropagation()}
              >
                <FiDownload className="w-3 h-3 group-hover/download:animate-bounce" />
                <span>Download</span>
                <svg
                  className="w-3 h-3 transition-transform group-hover/download:translate-x-0.5"
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
              </a>
            )}
          </div>

          {/* Detalhes em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {score.fileSize && (
              <div className="flex items-center gap-2 text-theme-secondary">
                <div className="w-5 h-5 bg-accent-blue/20 border border-accent-blue/30 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-3 h-3 text-accent-blue" />
                </div>
                <span>
                  {score.fileSize}
                  {score.pageCount && ` • ${score.pageCount} páginas`}
                </span>
              </div>
            )}

            {shouldShowThumbnail && score.uploader && (
              <div className="flex items-center gap-2 text-theme-secondary">
                <div className="w-5 h-5 bg-accent-green/20 border border-accent-green/30 rounded-lg flex items-center justify-center">
                  <FiUser className="w-3 h-3 text-accent-green" />
                </div>
                <span>
                  {score.uploader}
                  {score.uploadDate && ` • ${score.uploadDate}`}
                </span>
              </div>
            )}

            {score.downloadCount && (
              <div className="flex items-center gap-2 text-theme-secondary">
                <div className="w-5 h-5 bg-accent-purple/20 border border-accent-purple/30 rounded-lg flex items-center justify-center">
                  <FiDownload className="w-3 h-3 text-accent-purple" />
                </div>
                <span>{score.downloadCount} downloads</span>
              </div>
            )}

            {shouldShowThumbnail && score.uploadDate && (
              <div className="flex items-center gap-2 text-theme-secondary">
                <div className="w-5 h-5 bg-brand-primary/20 border border-brand-primary/30 rounded-lg flex items-center justify-center">
                  <FiClock className="w-3 h-3 text-brand-primary" />
                </div>
                <span>{score.uploadDate}</span>
              </div>
            )}
          </div>

          {/* Informações adicionais para thumbnail */}
          {shouldShowThumbnail &&
            (score.editor || score.publisher || score.copyright) && (
              <div className="mt-4 pt-4 border-t border-theme-secondary">
                <div className="space-y-2 text-xs text-theme-tertiary">
                  {score.editor && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-theme-secondary">
                        Editor:
                      </span>
                      <span>{score.editor}</span>
                    </div>
                  )}
                  {score.publisher && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-theme-secondary">
                        Editora:
                      </span>
                      <span>{score.publisher}</span>
                    </div>
                  )}
                  {score.copyright && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-theme-secondary flex-shrink-0">
                        Copyright:
                      </span>
                      <span className="leading-relaxed">{score.copyright}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl pointer-events-none"></div>

      {/* Selection highlight */}
      {isSelected && (
        <div className="absolute inset-0 bg-brand-gradient opacity-5 rounded-xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default ScoreCard;
