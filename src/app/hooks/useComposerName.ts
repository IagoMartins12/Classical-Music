// hooks/useComposerName.ts
import { useState, useEffect } from 'react';
import { findComposerById } from '@/app/requests/catalog-search';

interface Composer {
  id: string;
  name: string;
  fullName?: string;
  worksCount?: number;
}

export function useComposerName(
  composerId: string,
  popularComposers?: Composer[]
) {
  const [composerName, setComposerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const findComposerName = async () => {
      if (!composerId) {
        setComposerName('');
        return;
      }

      // Primeiro tenta encontrar nos compositores populares
      const popularComposer = popularComposers?.find(
        (c) => c.id === composerId
      );

      if (popularComposer) {
        setComposerName(popularComposer.name);
        return;
      }

      // Se não encontrou, busca na API
      setIsLoading(true);
      try {
        const composer = await findComposerById(composerId);
        if (composer && composer.name) {
          setComposerName(composer.name);
        } else {
          setComposerName(composerId); // Fallback para o ID se não encontrar
        }
      } catch (error) {
        console.error('Erro ao buscar nome do compositor:', error);
        setComposerName(composerId); // Fallback para o ID se houver erro
      } finally {
        setIsLoading(false);
      }
    };

    findComposerName();
  }, [composerId, popularComposers]);

  return { composerName, isLoading };
}
