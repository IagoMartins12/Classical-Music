// app/composer/[composerId]/ComposerDetailsServer.tsx - Versão otimizada
import { notFound } from 'next/navigation';
import {
  getComposerById,
  getComposerWorksWithFilters,
  getComposerFilterOptions,
} from '@/app/requests/composer-details';
import ComposerDetailsClient from '@/app/components/ComposerDetailsClient';

interface ComposerDetailsServerProps {
  composerId: string;
}

export default async function ComposerDetailsServer({
  composerId,
}: ComposerDetailsServerProps) {
  try {
    // OTIMIZAÇÃO: Carregar dados do compositor, obras iniciais e opções de filtro em paralelo
    const [composer, initialWorksData, filterOptions] = await Promise.all([
      getComposerById(composerId),
      getComposerWorksWithFilters(composerId, 1, 50), // Primeira página com 50 obras
      getComposerFilterOptions(composerId),
    ]);

    if (!composer) {
      notFound();
    }

    return (
      <ComposerDetailsClient
        composer={composer}
        initialWorksData={initialWorksData}
        filterOptions={filterOptions}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar compositor:', error);
    notFound();
  }
}
