// hooks/useLearnedVideo.ts - CORRIGIDO
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  updateLearnedRequest,
  uploadPerformanceVideo,
} from '@/app/requests/library';

export interface UseLearnedVideoResult {
  // Estados
  selectedVideo: File | null;
  videoPreviewUrl: string | null;
  isUploading: boolean;
  uploadError: string | null;
  isVideoPublic: boolean;

  // Actions
  selectVideo: (file: File | null) => void;
  removeVideo: () => void;
  setIsVideoPublic: (isPublic: boolean) => void;
  clearError: () => void;
  updateVideo: (workId: string, learnedData: any) => Promise<boolean>;
  deleteVideo: (workId: string) => Promise<boolean>;
}

export function useLearnedVideo(): UseLearnedVideoResult {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isVideoPublic, setIsVideoPublic] = useState(false);

  // Validação de arquivo
  const validateVideoFile = useCallback((file: File): string | null => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxSize) {
      return `Arquivo muito grande. Tamanho máximo: 500MB`;
    }

    return null;
  }, []);

  // Selecionar vídeo
  const selectVideo = useCallback(
    (file: File | null) => {
      if (!file) {
        setSelectedVideo(null);
        setVideoPreviewUrl(null);
        setUploadError(null);
        return;
      }

      // Validar arquivo
      const validationError = validateVideoFile(file);
      if (validationError) {
        setUploadError(validationError);
        toast.error(validationError);
        return;
      }

      setSelectedVideo(file);
      setUploadError(null);

      // Criar preview URL
      try {
        const previewUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(previewUrl);
      } catch (error) {
        console.error('❌ [LEARNED-VIDEO] Erro ao criar preview:', error);
        setUploadError('Erro ao carregar preview do vídeo');
      }
    },
    [validateVideoFile]
  );

  // Remover vídeo
  const removeVideo = useCallback(() => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    setUploadError(null);
  }, [videoPreviewUrl]);

  // Limpar erro
  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  // Atualizar vídeo (learned item existente)
  const updateVideo = useCallback(
    async (workId: string, learnedData: any): Promise<boolean> => {
      setIsUploading(true);
      setUploadError(null);

      try {
        // O vídeo sobe direto ao armazenamento; o item leva só o id do
        // arquivo (o legado mandava o arquivo em multipart para o Next).
        const videoAssetId = selectedVideo
          ? await uploadPerformanceVideo(workId, selectedVideo)
          : undefined;

        const result = await updateLearnedRequest(workId, {
          ...learnedData,
          isVideoPublic,
          ...(videoAssetId
            ? { videoAssetId, videoFileName: selectedVideo?.name }
            : {}),
        });

        if (result.ok) {
          // Limpar estado se foi upload de novo vídeo
          if (selectedVideo) {
            removeVideo();
          }

          return true;
        } else {
          const errorMsg = result.error || 'Erro desconhecido na atualização';
          setUploadError(errorMsg);
          toast.error(`Erro na atualização: ${errorMsg}`);
          return false;
        }
      } catch (error) {
        console.error('❌ [LEARNED-VIDEO] Erro na atualização:', error);
        const errorMsg = 'Erro de conexão durante atualização';
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [selectedVideo, isVideoPublic, removeVideo]
  );

  // Deletar vídeo
  const deleteVideo = useCallback(async (workId: string): Promise<boolean> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // A API tira o vídeo do item e apaga o arquivo do armazenamento.
      const result = await updateLearnedRequest(workId, { removeVideo: true });

      if (result.ok) {
        toast.success('Vídeo removido com sucesso!', {
          icon: '🗑️',
          duration: 3000,
        });

        return true;
      } else {
        const errorMsg = result.error || 'Erro desconhecido ao deletar vídeo';
        setUploadError(errorMsg);
        toast.error(`Erro ao deletar: ${errorMsg}`);
        return false;
      }
    } catch (error) {
      console.error('❌ [LEARNED-VIDEO] Erro ao deletar vídeo:', error);
      const errorMsg = 'Erro de conexão ao deletar vídeo';
      setUploadError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    // Estados
    selectedVideo,
    videoPreviewUrl,
    isUploading,
    uploadError,
    isVideoPublic,

    // Actions
    selectVideo,
    removeVideo,
    setIsVideoPublic,
    clearError,
    updateVideo,
    deleteVideo,
  };
}
