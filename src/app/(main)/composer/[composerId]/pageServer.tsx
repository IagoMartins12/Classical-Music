// app/composer/[composerId]/ComposerDetailsServer.tsx - Versão otimizada
import { notFound } from 'next/navigation';
import {
  getComposerById,
  getComposerWorksWithFilters,
  getComposerFilterOptions,
} from '@/app/requests/composer-details';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import ComposerDetailsClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface ComposerDetailsServerProps {
  composerId: string;
}

export default async function ComposerDetailsServer({
  composerId,
}: ComposerDetailsServerProps) {
  const session = await getServerSession(authOptions);
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/composerId',
  ]);

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
    const isAdmin = session?.user.role === 2;

    return (
      <TranslationProvider language={language} translations={translations}>
        <ComposerDetailsClient
          composer={composer}
          initialWorksData={initialWorksData}
          filterOptions={filterOptions}
          isAdmin={isAdmin}
        />
      </TranslationProvider>
    );
  } catch (error) {
    console.error('Erro ao carregar compositor:', error);
    notFound();
  }
}
