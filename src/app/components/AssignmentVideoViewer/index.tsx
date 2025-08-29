// app/components/Assignments/AssignmentVideoViewer.tsx
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
  FiFileText,
  FiX,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VideoSubmission {
  filename: string;
  originalName: string;
  filePath: string; // URL do Cloudinary
  fileSize: number;
  uploadedAt: string;
  mimeType: string;
  // Campos do Cloudinary
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  thumbnailUrl?: string;
  duration?: number;
  format?: string;
}

interface AssignmentData {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  submissionDate?: string;
  student: {
    id: string;
    name: string;
    image?: string;
  };
  lesson: {
    id: string;
    title: string;
    scheduledAt: string;
    teacher: {
      name: string;
      image?: string;
    };
  };
  submissions?: {
    videoSubmission?: VideoSubmission;
    [key: string]: any;
  };
}

interface AssignmentVideoViewerProps {
  assignment: AssignmentData;
  isOpen: boolean;
  onClose: () => void;
  userRole: number; // 0 = student, 1 = teacher
  canDownload?: boolean;
}

export default function AssignmentVideoViewer({
  assignment,
  isOpen,
  onClose,
  canDownload = true,
}: AssignmentVideoViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const videoSubmission = assignment.submissions?.videoSubmission;

  if (!videoSubmission) {
    return (
      <Modal isOpen={isOpen} maxWidth="2xl" onClose={onClose}>
        <div className="bg-theme-elevated p-6 text-center">
          <div className="mb-4">
            <FiFileText className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Nenhum Vídeo Encontrado
            </h3>
            <p className="text-theme-secondary">
              Esta tarefa não possui submissão de vídeo.
            </p>
          </div>

          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Modal>
    );
  }

  const videoUrl = videoSubmission.cloudinaryUrl || videoSubmission.filePath;
  const thumbnailUrl = videoSubmission.thumbnailUrl;

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

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = videoSubmission.originalName || videoSubmission.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Modal isOpen={isOpen} maxWidth={'4xl'} onClose={onClose}>
      <div className="bg-theme-elevated">
        {/* Header */}
        <div className="p-4 border-b border-theme-primary">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-theme-primary mb-1">
                {assignment.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                <span className="flex items-center space-x-1">
                  <FiUser className="w-3 h-3" />
                  <span>{assignment.student.name}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FiCalendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(videoSubmission.uploadedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
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
        </div>

        {/* Details Panel */}
        {showDetails && !isFullscreen && (
          <div className="p-4 bg-theme-secondary border-t border-theme-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-theme-primary mb-3">
                  Informações do Arquivo
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Nome original:</span>
                    <span className="font-mono text-theme-primary">
                      {videoSubmission.originalName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Tamanho:</span>
                    <span className="text-theme-primary">
                      {formatFileSize(videoSubmission.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Formato:</span>
                    <span className="text-theme-primary uppercase">
                      {videoSubmission.format ||
                        videoSubmission.mimeType?.split('/')[1] ||
                        'N/A'}
                    </span>
                  </div>
                  {videoSubmission.duration && (
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Duração:</span>
                      <span className="text-theme-primary">
                        {formatDuration(videoSubmission.duration)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-theme-primary mb-3">
                  Informações da Tarefa
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Professor:</span>
                    <span className="text-theme-primary">
                      {assignment.lesson.teacher.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        assignment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {assignment.status === 'COMPLETED' && 'Concluída'}
                      {assignment.status === 'IN_PROGRESS' && 'Em Andamento'}
                      {assignment.status === 'PENDING' && 'Pendente'}
                      {assignment.status === 'OVERDUE' && 'Atrasada'}
                    </span>
                  </div>
                  {assignment.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Prazo:</span>
                      <span className="text-theme-primary">
                        {new Date(assignment.dueDate).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Enviado em:</span>
                    <span className="text-theme-primary">
                      {new Date(videoSubmission.uploadedAt).toLocaleString(
                        'pt-BR'
                      )}
                    </span>
                  </div>
                </div>
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
                    Enviado{' '}
                    {formatDistanceToNow(new Date(videoSubmission.uploadedAt), {
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
