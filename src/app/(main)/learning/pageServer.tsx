// app/pageServer.tsx - Enhanced Home Page

import LearningPageClient from './pageClient';
import { getCurrentUserLearningData } from '../../requests/learning';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';
import { AchievementProvider } from '@/app/components/achievement/AchievementToast';

export default async function LearningPageServer() {
  const learningData = await getCurrentUserLearningData();
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/learning',
  ]);
  return (
    <TranslationProvider language={language} translations={translations}>
      <AchievementProvider>
        <LearningPageClient initialData={learningData} />
      </AchievementProvider>
    </TranslationProvider>
  );
}
