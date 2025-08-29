// app/components/Profile/LearnedVideoViewer.tsx
'use client';

import { useState } from 'react';
import {
  FiMaximize2,
  FiMinimize2,
  FiDownload,
  FiClock,
  FiEye,
  FiUser,
  FiCalendar,
  FiX,
  FiMusic,
  FiStar,
  FiTrendingUp,
  FiEdit3,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';

interface LearnedVideoData {
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  uploadedAt: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  duration?: number;
  format?: string;
  filePath?: string | null;
}

interface LearnedData {
  id: string;
  userId: string;
  workId: string;
  learnedAt: string;
  mastery: number;
  studyStartDate?: string;
  studyDuration?: number;
  notes?: string;
  wouldRecommend: boolean;
  publicPerformance: boolean;
  lastPracticed?: string;
  difficulty?: string;
  enjoyment?: number;
  technicalChallenges?: string;
  musicalInsights?: string;
  performanceCount: number;
  bestPerformance?: string;
  selectedWorkScoreId?: string;

  // Video data (pode ser null se não tiver vídeo)
  videoData: LearnedVideoData | null;

  // Relações
  work: {
    id: string;
    title: string;
    composerId: string;
    composer: {
      name: string;
      portraitUrl?: string;
    };
    opOrCatalog?: string;
    tone?: string;
  };
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    image?: string;
  };
}

interface LearnedVideoViewerProps {
  learned: LearnedData;
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
  canDownload?: boolean;
  onToggleVisibility?: (learnedId: string, isPublic: boolean) => Promise<void>;
  onUpdateNotes?: (learnedId: string, notes: string) => Promise<void>;
}

export default function LearnedVideoViewer({
  learned,
  isOpen,
  onClose,
  canEdit = false,
  canDownload = true,
  onToggleVisibility,
  onUpdateNotes,
}: LearnedVideoViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(learned.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const videoData = learned.videoData;

  if (!videoData) {
    return (
      <Modal isOpen={isOpen} maxWidth="2xl" onClose={onClose}>
        <div className="bg-theme-elevated p-6 text-center">
          <div className="mb-4">
            <FiMusic className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Nenhum Vídeo de Performance
            </h3>
            <p className="text-theme-secondary">
              Esta peça ainda não possui vídeo de performance gravado.
            </p>
          </div>

          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Modal>
    );
  }

  const videoUrl = videoData.cloudinaryUrl || videoData.filePath;
  const thumbnailUrl = videoData.thumbnailUrl;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty?: string): string => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty?: string): string => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'Iniciante';
      case 'INTERMEDIATE':
        return 'Intermediário';
      case 'ADVANCED':
        return 'Avançado';
      default:
        return 'N/A';
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = videoData.originalName || videoData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleToggleVisibility = async () => {
    if (onToggleVisibility && !isUpdating) {
      setIsUpdating(true);
      try {
        await onToggleVisibility(learned.id, !videoData.isPublic);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (onUpdateNotes && !isUpdating) {
      setIsUpdating(true);
      try {
        await onUpdateNotes(learned.id, notes);
        setEditingNotes(false);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const userName =
    learned.user.firstName && learned.user.lastName
      ? `${learned.user.firstName} ${learned.user.lastName}`.trim()
      : 'Usuário';

  return (
    <Modal isOpen={isOpen} maxWidth={'5xl'} onClose={onClose}>
      <div className="bg-theme-elevated">
        {/* Header */}
        <div className="p-4 border-b border-theme-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {learned.work.composer.portraitUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={learned.work.composer.portraitUrl}
                    alt={learned.work.composer.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-1">
                  {learned.work.title}
                </h3>
                <p className="text-theme-secondary text-sm mb-2">
                  {learned.work.composer.name}
                  {learned.work.opOrCatalog && ` - ${learned.work.opOrCatalog}`}
                  {learned.work.tone && ` (${learned.work.tone})`}
                </p>

                <div className="flex items-center space-x-4 text-xs text-theme-secondary">
                  <span className="flex items-center space-x-1">
                    <FiUser className="w-3 h-3" />
                    <span>{userName}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiCalendar className="w-3 h-3" />
                    <span>
                      Aprendida{' '}
                      {formatDistanceToNow(new Date(learned.learnedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiTrendingUp className="w-3 h-3" />
                    <span>Maestria: {learned.mastery}%</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={videoData.isPublic ? <FiUnlock /> : <FiLock />}
                  onClick={handleToggleVisibility}
                  disabled={isUpdating}
                  title={
                    videoData.isPublic ? 'Tornar Privado' : 'Tornar Público'
                  }
                >
                  {videoData.isPublic ? 'Público' : 'Privado'}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => setShowDetails(!showDetails)}
              >
                Detalhes
              </Button>

              {isFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiX />}
                  onClick={onClose}
                >
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div
          className={`relative ${
            isFullscreen
              ? 'h-screen flex items-center justify-center bg-black'
              : ''
          }`}
        >
          {videoUrl && (
            <div className={`${isFullscreen ? 'w-full max-w-6xl' : 'w-full'}`}>
              <video
                src={videoUrl}
                poster={thumbnailUrl}
                controls
                className={`w-full ${
                  isFullscreen ? 'max-h-screen' : 'max-h-96'
                } bg-black`}
              >
                Seu navegador não suporta reprodução de vídeo.
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                  onClick={toggleFullscreen}
                  className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                >
                  {isFullscreen ? 'Sair' : 'Tela Cheia'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        {showDetails && !isFullscreen && (
          <div className="p-4 bg-theme-secondary border-t border-theme-primary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações do Arquivo */}
              <div>
                <h4 className="font-medium text-theme-primary mb-3">
                  Informações do Vídeo
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Nome:</span>
                    <span className="font-mono text-theme-primary text-xs">
                      {videoData.originalName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Tamanho:</span>
                    <span className="text-theme-primary">
                      {formatFileSize(videoData.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Formato:</span>
                    <span className="text-theme-primary uppercase">
                      {videoData.format || 'N/A'}
                    </span>
                  </div>
                  {videoData.duration && (
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Duração:</span>
                      <span className="text-theme-primary">
                        {formatDuration(videoData.duration)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Visibilidade:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        videoData.isPublic
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {videoData.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações de Aprendizado */}
              <div>
                <h4 className="font-medium text-theme-primary mb-3">
                  Informações de Estudo
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Maestria:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${learned.mastery}%` }}
                        />
                      </div>
                      <span className="text-theme-primary font-medium">
                        {learned.mastery}%
                      </span>
                    </div>
                  </div>

                  {learned.difficulty && (
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Dificuldade:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                          learned.difficulty
                        )}`}
                      >
                        {getDifficultyLabel(learned.difficulty)}
                      </span>
                    </div>
                  )}

                  {learned.enjoyment && (
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Diversão:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-3 h-3 ${
                              star <= learned.enjoyment!
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Performances:</span>
                    <span className="text-theme-primary">
                      {learned.performanceCount} vez
                      {learned.performanceCount !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Recomendaria:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        learned.wouldRecommend
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {learned.wouldRecommend ? 'Sim' : 'Não'}
                    </span>
                  </div>

                  {learned.lastPracticed && (
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">
                        Último estudo:
                      </span>
                      <span className="text-theme-primary">
                        {formatDistanceToNow(new Date(learned.lastPracticed), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas e Insights */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-theme-primary">
                    Notas e Reflexões
                  </h4>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEdit3 />}
                      onClick={() => setEditingNotes(!editingNotes)}
                    >
                      Editar
                    </Button>
                  )}
                </div>

                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-20 p-2 border border-theme-primary rounded-lg bg-theme-tertiary text-theme-primary text-sm resize-none"
                      placeholder="Adicione suas reflexões sobre esta peça..."
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={isUpdating}
                        isLoading={isUpdating}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingNotes(false);
                          setNotes(learned.notes || '');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {learned.notes && (
                      <div>
                        <p className="text-sm text-theme-secondary mb-1">
                          Notas pessoais:
                        </p>
                        <p className="text-sm text-theme-primary bg-theme-tertiary p-2 rounded">
                          {learned.notes}
                        </p>
                      </div>
                    )}

                    {learned.technicalChallenges && (
                      <div>
                        <p className="text-sm text-theme-secondary mb-1">
                          Desafios técnicos:
                        </p>
                        <p className="text-sm text-theme-primary">
                          {learned.technicalChallenges}
                        </p>
                      </div>
                    )}

                    {learned.musicalInsights && (
                      <div>
                        <p className="text-sm text-theme-secondary mb-1">
                          Insights musicais:
                        </p>
                        <p className="text-sm text-theme-primary">
                          {learned.musicalInsights}
                        </p>
                      </div>
                    )}

                    {!learned.notes &&
                      !learned.technicalChallenges &&
                      !learned.musicalInsights && (
                        <p className="text-sm text-theme-tertiary italic">
                          Nenhuma nota adicionada ainda.
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!isFullscreen && (
          <div className="p-4 border-t border-theme-primary">
            <div className="flex items-center justify-between">
              <div className="text-sm text-theme-secondary">
                <span className="flex items-center space-x-1">
                  <FiClock className="w-3 h-3" />
                  <span>
                    Vídeo enviado{' '}
                    {formatDistanceToNow(new Date(videoData.uploadedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {canDownload && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiDownload />}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                )}

                <Button variant="ghost" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
