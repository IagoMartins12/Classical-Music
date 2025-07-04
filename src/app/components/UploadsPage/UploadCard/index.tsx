'use client';
// app/components/uploads/UploadCard.tsx

import { useState } from 'react';
import {
  FiUser,
  FiMusic,
  FiFile,
  FiEdit,
  FiTrash2,
  FiExternalLink,
  FiCalendar,
  FiTag,
  FiClock,
  FiEye,
  FiStar,
  FiDownload,
  FiShield,
  FiFlag,
  FiMoreVertical,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { UserUpload } from '@/app/requests/upload';

interface UploadCardProps {
  item: UserUpload;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
  showActions?: boolean;
}

const UploadCard = ({
  item,
  onEdit,
  onDelete,
  isAdmin,
  showActions = true,
}: UploadCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'composer':
        return <FiUser className="w-5 h-5 text-theme-primary" />;
      case 'work':
        return <FiMusic className="w-5 h-5 text-theme-primary" />;
      case 'score':
        return <FiFile className="w-5 h-5 text-theme-primary" />;
      default:
        return <FiFile className="w-5 h-5 text-theme-primary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'composer':
        return 'Compositor';
      case 'work':
        return 'Obra';
      case 'score':
        return 'Partitura';
      default:
        return 'Item';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'composer':
        return 'from-accent-purple to-accent-blue';
      case 'work':
        return 'from-accent-blue to-accent-green';
      case 'score':
        return 'from-accent-green to-accent-amber';
      default:
        return 'from-theme-secondary to-theme-tertiary';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const handleReport = async () => {
    if (!confirm('Deseja reportar este item por conteúdo inadequado?')) {
      return;
    }

    setIsReporting(true);
    try {
      const response = await fetch('/api/uploads/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: item.type,
          entityId: item.id,
          reason: 'inappropriate_content',
        }),
      });

      if (response.ok) {
        alert('Item reportado com sucesso. Nossa equipe irá analisar.');
      } else {
        throw new Error('Erro ao reportar item');
      }
    } catch (error) {
      console.error('Erro ao reportar:', error);
      alert('Erro ao reportar item');
    } finally {
      setIsReporting(false);
      setShowMenu(false);
    }
  };

  return (
    <AnimatedCard className="classical-card p-6 group hover:shadow-theme-glow transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getTypeColor(
              item.type
            )}`}
          >
            {getTypeIcon(item.type)}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-theme-tertiary px-2 py-1 bg-theme-secondary rounded-full">
                {getTypeLabel(item.type)}
              </span>
              {item.isIMSLP && (
                <span className="text-xs font-medium text-accent-blue px-2 py-1 bg-accent-blue/10 rounded-full flex items-center space-x-1">
                  <FiExternalLink className="w-3 h-3" />
                  <span>IMSLP</span>
                </span>
              )}
              {item.verificationStatus === 'verified' && (
                <span className="text-xs font-medium text-accent-green px-2 py-1 bg-accent-green/10 rounded-full flex items-center space-x-1">
                  <FiShield className="w-3 h-3" />
                  <span>Verificado</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg bg-theme-secondary hover:bg-theme-tertiary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-48 bg-theme-elevated border border-theme-secondary rounded-lg shadow-theme-large z-10">
                <div className="py-2">
                  <button
                    onClick={onEdit}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary transition-colors flex items-center space-x-2"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        window.location.origin +
                          `/uploads/${item.type}/${item.id}`
                      );
                      alert('Link copiado!');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary transition-colors flex items-center space-x-2"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={handleReport}
                      disabled={isReporting}
                      className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10 transition-colors flex items-center space-x-2"
                    >
                      <FiFlag className="w-4 h-4" />
                      <span>{isReporting ? 'Reportando...' : 'Reportar'}</span>
                    </button>
                  )}

                  <div className="border-t border-theme-secondary my-2"></div>

                  <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10 transition-colors flex items-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-theme-primary classical-title line-clamp-2">
          {item.title}
        </h3>

        {item.composerName && (
          <p className="text-sm text-theme-secondary font-medium">
            {item.composerName}
          </p>
        )}

        <div className="space-y-2">
          {item.epochName && (
            <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
              <FiClock className="w-4 h-4" />
              <span>{item.epochName}</span>
            </div>
          )}

          {item.instrumentName && (
            <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
              <FiMusic className="w-4 h-4" />
              <span>{item.instrumentName}</span>
            </div>
          )}

          {item.workGenres && item.workGenres.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
              <FiTag className="w-4 h-4" />
              <span>{item.workGenres.slice(0, 2).join(', ')}</span>
              {item.workGenres.length > 2 && (
                <span className="text-xs bg-theme-secondary px-2 py-1 rounded-full">
                  +{item.workGenres.length - 2}
                </span>
              )}
            </div>
          )}

          {item.fileSize && (
            <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
              <FiDownload className="w-4 h-4" />
              <span>{item.fileSize}</span>
              {item.pageCount && (
                <span className="text-xs text-theme-tertiary">
                  • {item.pageCount} páginas
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
          <div className="flex items-center space-x-2 text-xs text-theme-tertiary">
            <FiCalendar className="w-3 h-3" />
            <span>{formatDate(item.createdAt)}</span>
          </div>

          {item.imslpId && (
            <a
              href={`https://imslp.org/wiki/${item.imslpId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors flex items-center space-x-1"
            >
              <FiExternalLink className="w-3 h-3" />
              <span>IMSLP</span>
            </a>
          )}
        </div>

        {/* Quality Indicators */}
        {item.dataQuality && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-theme-tertiary">Qualidade:</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  item.dataQuality === 'high'
                    ? 'bg-accent-green/10 text-accent-green'
                    : item.dataQuality === 'medium'
                    ? 'bg-accent-amber/10 text-accent-amber'
                    : 'bg-accent-red/10 text-accent-red'
                }`}
              >
                {item.dataQuality === 'high'
                  ? 'Alta'
                  : item.dataQuality === 'medium'
                  ? 'Média'
                  : 'Baixa'}
              </span>
            </div>

            {item.dataCompleteness && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-theme-tertiary">
                  {item.dataCompleteness}% completo
                </span>
                <div className="w-12 h-1 bg-theme-secondary rounded-full">
                  <div
                    className="h-1 bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${item.dataCompleteness}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default UploadCard;
