// components/ScoreFavoritesInitializer.tsx - VERSÃO SIMPLIFICADA SEM LOOPS
'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  useFavoritesStore,
  FavoriteScore,
} from '@/app/stores/useFavoritesStore';

interface ScoreFavoritesInitializerProps {
  initialScoreFavorites?: FavoriteScore[];
  workId?: string;
}

export default function ScoreFavoritesInitializer({
  initialScoreFavorites = [],
  workId,
}: ScoreFavoritesInitializerProps) {
  const { data: session } = useSession();
  const { initializeFavorites, favoriteComposers, favoriteWorks, initialized } =
    useFavoritesStore();

  // 🆕 Refs para evitar múltiplas execuções
  const initializedRef = useRef(false);
  const workDataLoadedRef = useRef<string | null>(null);

  // 🆕 Inicialização única com dados do SSR
  useEffect(() => {
    if (
      session?.user?.id &&
      initialScoreFavorites.length > 0 &&
      !initializedRef.current &&
      !initialized
    ) {
      console.log(
        '🔄 Inicializando favoritos de partituras do SSR:',
        initialScoreFavorites.length
      );

      initializeFavorites(
        favoriteComposers,
        favoriteWorks,
        initialScoreFavorites
      );
      initializedRef.current = true;
    }
  }, [session?.user?.id, initialScoreFavorites.length > 0]); // 🆕 Dependências mínimas

  // 🆕 Carregamento único de dados da obra específica
  useEffect(() => {
    if (
      session?.user?.id &&
      workId &&
      initialized &&
      workDataLoadedRef.current !== workId
    ) {
      loadWorkSpecificData(workId, session.user.id);
      workDataLoadedRef.current = workId;
    }
  }, [session?.user?.id, workId, initialized]); // 🆕 Dependências mínimas

  return null; // Componente invisível
}

// 🆕 Função externa para evitar loops
async function loadWorkSpecificData(workId: string, userId: string) {
  try {
    console.log('📊 Carregando dados específicos da obra:', { workId, userId });

    const response = await fetch(`/api/favorites/scores?workId=${workId}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados da obra carregados:', data.count || 0, 'favoritos');

      // Atualizar store será feito automaticamente pelos outros hooks
      // Não fazemos nada aqui para evitar loops
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados da obra:', error);
  }
}

// 🆕 Hook simplificado para usar em páginas
export function useWorkScoreInitialization(workId: string) {
  const { data: session } = useSession();
  const initRef = useRef(false);

  useEffect(() => {
    if (workId && !initRef.current) {
      console.log('🎯 Inicializando página para obra:', workId);
      initRef.current = true;

      // Não fazer nada automático aqui - deixar que os hooks específicos façam as requisições
      // Isso evita loops infinitos
    }
  }, [workId]);

  return {
    workId,
    isLoggedIn: !!session?.user?.id,
  };
}
