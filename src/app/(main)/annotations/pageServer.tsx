// app/annotations/pageServer.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import AnnotationsPageClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';
import { AchievementProvider } from '@/app/components/achievement/AchievementToast';

export default async function AnnotationsPageServer() {
  const session = await getServerSession(authOptions);
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/annotations',
  ]);
  if (!session?.user?.id) {
    return null;
  }

  return (
    <TranslationProvider language={language} translations={translations}>
      <AchievementProvider>
        <AnnotationsPageClient />
      </AchievementProvider>
    </TranslationProvider>
  );
}
