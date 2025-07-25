// app/hooks/useWorkCleanup.ts
'use client';

import { useCallback } from 'react';
import { useToast } from './useToast';

export function useWorkCleanup() {
  const toast = useToast();

  const cleanupWorkMedia = useCallback(
    async (workId: string, workTitle: string) => {
      try {
        console.log(
          `🗑️ [CLEANUP] Iniciando limpeza de mídia para: ${workTitle}`
        );

        const response = await fetch(`/api/works/${workId}/cleanup`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro na limpeza');
        }

        const data = await response.json();
        console.log(`✅ [CLEANUP] Mídia removida para: ${workTitle}`);

        return { success: true, message: data.message };
      } catch (error) {
        console.error(`❌ [CLEANUP] Erro na limpeza de ${workTitle}:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro na limpeza',
        };
      }
    },
    []
  );

  const getWorkMediaFiles = useCallback(async (workId: string) => {
    try {
      const response = await fetch(`/api/works/${workId}/cleanup`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao buscar arquivos');
      }

      const data = await response.json();
      return { success: true, mediaFiles: data.mediaFiles };
    } catch (error) {
      console.error('❌ [CLEANUP] Erro ao buscar arquivos:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro ao buscar arquivos',
      };
    }
  }, []);

  const deleteWorkWithCleanup = useCallback(
    async (workId: string, workTitle: string) => {
      try {
        // 1. Primeiro, fazer backup dos arquivos de mídia
        const mediaFiles = await getWorkMediaFiles(workId);

        if (
          mediaFiles.success &&
          Object.keys(mediaFiles.mediaFiles).length > 0
        ) {
          console.log(
            `📋 [CLEANUP] Arquivos de mídia encontrados para ${workTitle}:`,
            mediaFiles.mediaFiles
          );

          // Mostrar confirmação extra se houver arquivos
          const hasMedia = Object.values(mediaFiles.mediaFiles).some(
            (files: any) => Array.isArray(files) && files.length > 0
          );

          if (hasMedia) {
            const confirmed = window.confirm(
              `⚠️ Esta obra tem arquivos de mídia que serão permanentemente removidos.\n\nDeseja continuar com a exclusão de "${workTitle}"?`
            );

            if (!confirmed) {
              return { success: false, cancelled: true };
            }
          }
        }

        // 2. Deletar a obra (isso deve incluir a limpeza automática)
        const deleteResponse = await fetch(`/api/uploads/work/${workId}`, {
          method: 'DELETE',
        });

        if (!deleteResponse.ok) {
          const data = await deleteResponse.json();
          throw new Error(data.error || 'Erro ao deletar obra');
        }

        // 3. Limpar arquivos de mídia
        const cleanupResult = await cleanupWorkMedia(workId, workTitle);

        if (!cleanupResult.success) {
          console.warn(
            `⚠️ [CLEANUP] Obra deletada, mas erro na limpeza de mídia: ${cleanupResult.error}`
          );
          toast.warning(
            'Obra deletada, mas alguns arquivos podem não ter sido removidos'
          );
        } else {
          toast.success(
            `Obra "${workTitle}" e seus arquivos foram removidos com sucesso`
          );
        }

        return { success: true };
      } catch (error) {
        console.error('❌ [CLEANUP] Erro na exclusão completa:', error);
        toast.error(
          error instanceof Error ? error.message : 'Erro ao deletar obra'
        );
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Erro ao deletar obra',
        };
      }
    },
    [cleanupWorkMedia, getWorkMediaFiles, toast]
  );

  return {
    cleanupWorkMedia,
    getWorkMediaFiles,
    deleteWorkWithCleanup,
  };
}

// Função utilitária para usar em componentes de classe ou server-side
export async function cleanupWorkMediaServer(workId: string) {
  try {
    const { rmdir } = await import('fs/promises');
    const path = await import('path');

    const workMediaDir = path.join(process.cwd(), 'public', 'uploads', workId);

    await rmdir(workMediaDir, { recursive: true });
    console.log(`✅ [SERVER-CLEANUP] Mídia removida para obra: ${workId}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [SERVER-CLEANUP] Erro ou pasta não encontrada: ${error}`);
    return false;
  }
}
