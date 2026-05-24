// app/hooks/assignmentSystem/useAssignmentVideo.ts - Hook para upload de vídeo em assignments

import { useState, useCallback } from 'react';

interface UseAssignmentVideoReturn {
  // Estados
  selectedVideo: File | null;
  videoPreviewUrl: string | null;
  isUploading: boolean;
  uploadError: string | null;

  // Ações
  selectVideo: (file: File | null) => void;
  removeVideo: () => void;
  clearError: () => void;
  uploadVideo: (assignmentId: string, additionalData?: any) => Promise<boolean>;
}

/**
 * 🎥 Hook para gerenciar upload de vídeo em assignments
 */
export function useAssignmentVideo(): UseAssignmentVideoReturn {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Selecionar vídeo com validações
  const selectVideo = useCallback(
    (file: File | null) => {
      setUploadError(null);

      // Limpar vídeo anterior
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
      }

      if (!file) {
        setSelectedVideo(null);
        return;
      }

      // Validações
      const allowedTypes = [
        'video/mp4',
        'video/webm',
        'video/mov',
        'video/quicktime',
      ];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Formato não suportado. Use MP4, WebM ou MOV.');
        return;
      }

      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        setUploadError('Arquivo muito grande. Máximo 500MB permitido.');
        return;
      }

      // Definir vídeo e criar preview
      setSelectedVideo(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);

      console.log(
        `🎥 [USE-ASSIGNMENT-VIDEO] Vídeo selecionado: ${
          file.name
        } (${Math.round(file.size / 1024)}KB)`
      );
    },
    [videoPreviewUrl]
  );

  // Remover vídeo
  const removeVideo = useCallback(() => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    setUploadError(null);

    console.log(`🗑️ [USE-ASSIGNMENT-VIDEO] Vídeo removido`);
  }, [videoPreviewUrl]);

  // Limpar erro
  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  // Upload do vídeo
  const uploadVideo = useCallback(
    async (
      assignmentId: string,
      additionalData: any = {}
    ): Promise<boolean> => {
      if (!selectedVideo) {
        setUploadError('Nenhum vídeo selecionado');
        return false;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        console.log(
          `🚀 [USE-ASSIGNMENT-VIDEO] Iniciando upload para assignment ${assignmentId}`
        );

        // Preparar FormData
        const formData = new FormData();
        formData.append(
          'data',
          JSON.stringify({
            assignmentId,
            ...additionalData,
          })
        );
        formData.append('videoFile', selectedVideo);

        // Fazer request
        const response = await fetch('/api/assignments', {
          method: 'PATCH',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          console.log(`✅ [USE-ASSIGNMENT-VIDEO] Upload concluído com sucesso`);

          // Limpar estado após sucesso
          removeVideo();
          return true;
        } else {
          throw new Error(result.error || 'Erro desconhecido no upload');
        }
      } catch (error) {
        console.error('❌ [USE-ASSIGNMENT-VIDEO] Erro no upload:', error);
        setUploadError(
          error instanceof Error ? error.message : 'Erro interno no upload'
        );
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [selectedVideo, removeVideo]
  );

  return {
    // Estados
    selectedVideo,
    videoPreviewUrl,
    isUploading,
    uploadError,

    // Ações
    selectVideo,
    removeVideo,
    clearError,
    uploadVideo,
  };
}
