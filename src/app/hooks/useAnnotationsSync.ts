// app/hooks/useAnnotationsSync.ts - HOOK PARA SINCRONIZAÇÃO
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import { UserAnnotation } from '@/app/requests/user-annotations';

interface UseAnnotationsSyncOptions {
  onSync?: (annotations: UserAnnotation[]) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  syncInterval?: number;
}

interface SyncResult {
  syncWithStore: () => void;
  refreshFromAPI: () => Promise<void>;
  isRefreshing: boolean;
  lastSyncTime: number;
}

export function useAnnotationsSync(
  initialAnnotations: UserAnnotation[] = [],
  options: UseAnnotationsSyncOptions = {}
): SyncResult {
  const { onSync, onError, enabled = true, syncInterval = 2000 } = options;

  const { user } = useAuth();
  const annotationsStore = useAnnotationsStore();

  const lastSyncTimeRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout>(null);

  // 🔧 Função para converter anotações do store para UserAnnotation
  const convertStoreAnnotationToUserAnnotation = useCallback(
    (storeAnnotation: any): UserAnnotation => {
      return {
        id: storeAnnotation.id,
        userId: storeAnnotation.userId,
        workId: storeAnnotation.workId,
        title: storeAnnotation.title,
        content: storeAnnotation.content,
        category: storeAnnotation.category,
        scope: storeAnnotation.scope,
        measureStart: storeAnnotation.measureStart,
        measureEnd: storeAnnotation.measureEnd,
        movement: storeAnnotation.movement,
        section: storeAnnotation.section,
        pageNumber: storeAnnotation.pageNumber,
        hand: storeAnnotation.hand,
        voice: storeAnnotation.voice,
        instrument: storeAnnotation.instrument,
        difficulty: storeAnnotation.difficulty,
        tags: storeAnnotation.tags,
        isPublic: storeAnnotation.isPublic,
        isVerified: storeAnnotation.isVerified,
        helpfulCount: storeAnnotation.helpfulCount,
        viewCount: storeAnnotation.viewCount,
        createdAt: storeAnnotation.createdAt,
        updatedAt: storeAnnotation.updatedAt,
        work: storeAnnotation.work || {
          id: storeAnnotation.workId,
          title: 'Obra',
          composer: {
            name: 'Compositor',
            fullName: 'Compositor',
          },
        },
        _count: storeAnnotation._count || {
          helpfulVotes: 0,
          replies: 0,
        },
      };
    },
    []
  );

  // 🔧 Função para sincronizar com o store
  const syncWithStore = useCallback(() => {
    if (!user?.id || !enabled) return;

    try {
      // Coletar todas as anotações do usuário de todos os trabalhos no store
      const userAnnotationsFromStore: UserAnnotation[] = [];

      // Iterar sobre todas as anotações no store
      Object.values(annotationsStore.annotations).forEach((workAnnotations) => {
        workAnnotations.forEach((annotation) => {
          if (annotation.userId === user.id) {
            userAnnotationsFromStore.push(
              convertStoreAnnotationToUserAnnotation(annotation)
            );
          }
        });
      });

      // Se encontrou anotações no store, usar elas
      if (userAnnotationsFromStore.length > 0) {
        console.log(
          '🔄 [Hook] Sincronizando com store:',
          userAnnotationsFromStore.length,
          'anotações'
        );

        // Ordenar como no servidor (por helpful count e data)
        userAnnotationsFromStore.sort((a, b) => {
          if (b.helpfulCount !== a.helpfulCount) {
            return b.helpfulCount - a.helpfulCount;
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        lastSyncTimeRef.current = Date.now();
        onSync?.(userAnnotationsFromStore);
      }
    } catch (error) {
      console.error('Erro ao sincronizar com store:', error);
      onError?.(error as Error);
    }
  }, [
    user?.id,
    enabled,
    annotationsStore.annotations,
    convertStoreAnnotationToUserAnnotation,
    onSync,
    onError,
  ]);

  // 🔧 Função para atualizar via API
  const refreshFromAPI = useCallback(async (): Promise<void> => {
    if (!user?.id || !enabled || isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    try {
      console.log('🔄 [Hook] Refresh via API para usuário:', user.id);

      const response = await fetch(`/api/users/${user.id}/annotations`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.annotations) {
          console.log(
            '✅ [Hook] Dados atualizados via API:',
            data.annotations.length
          );
          lastSyncTimeRef.current = Date.now();
          onSync?.(data.annotations);
        }
      } else {
        throw new Error(`API retornou ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar via API:', error);
      // Fallback: tentar sincronizar com o store
      syncWithStore();
      onError?.(error as Error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [user?.id, enabled, syncWithStore, onSync, onError]);

  // 🔧 Escutar mudanças no store
  useEffect(() => {
    if (!enabled || !user?.id) return;

    const checkStoreChanges = () => {
      // Verificar se há mudanças relevantes no store
      const storeHasUserAnnotations = Object.values(
        annotationsStore.annotations
      ).some((workAnnotations) =>
        workAnnotations.some((annotation) => annotation.userId === user.id)
      );

      if (storeHasUserAnnotations) {
        syncWithStore();
      }
    };

    // Verificar mudanças no intervalo definido
    syncTimeoutRef.current = setInterval(checkStoreChanges, syncInterval);

    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [
    enabled,
    user?.id,
    syncInterval,
    annotationsStore.annotations,
    syncWithStore,
  ]);

  // 🔧 Escutar eventos customizados globais
  useEffect(() => {
    if (!enabled) return;

    const handleAnnotationChange = (event: any) => {
      console.log('🔄 [Hook] Evento de anotação detectado:', event.type);

      // Aguardar um pouco para o store atualizar
      setTimeout(() => {
        syncWithStore();
      }, 500);
    };

    // Adicionar listeners para eventos customizados
    window.addEventListener('annotationCreated', handleAnnotationChange);
    window.addEventListener('annotationUpdated', handleAnnotationChange);
    window.addEventListener('annotationDeleted', handleAnnotationChange);

    return () => {
      window.removeEventListener('annotationCreated', handleAnnotationChange);
      window.removeEventListener('annotationUpdated', handleAnnotationChange);
      window.removeEventListener('annotationDeleted', handleAnnotationChange);
    };
  }, [enabled, syncWithStore]);

  // 🔧 Observar mudanças nos loadings do store
  useEffect(() => {
    if (!enabled) return;

    // Quando uma operação de criação/atualização/deleção termina
    const prevCreateLoading = annotationsStore.loading.create;
    const prevUpdateLoading = annotationsStore.loading.update;

    // Verificar se uma criação acabou de ser concluída
    if (prevCreateLoading === false) {
      setTimeout(syncWithStore, 300);
    }

    // Verificar se alguma atualização acabou de ser concluída
    if (prevUpdateLoading.size === 0) {
      setTimeout(syncWithStore, 300);
    }
  }, [
    enabled,
    annotationsStore.loading.create,
    annotationsStore.loading.update,
    syncWithStore,
  ]);

  return {
    syncWithStore,
    refreshFromAPI,
    isRefreshing: isRefreshingRef.current,
    lastSyncTime: lastSyncTimeRef.current,
  };
}

// 🔧 Hook específico para sincronização de anotações de usuário
export function useUserAnnotationsSync(
  initialAnnotations: UserAnnotation[],
  onUpdate: (annotations: UserAnnotation[]) => void
) {
  const { user } = useAuth();

  return useAnnotationsSync(initialAnnotations, {
    onSync: onUpdate,
    onError: (error) => {
      console.error('Erro na sincronização de anotações:', error);
    },
    enabled: !!user?.id,
    syncInterval: 2000, // 2 segundos
  });
}
