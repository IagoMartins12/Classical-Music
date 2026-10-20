import { AchievementProvider } from '@/app/components/achievement/AchievementToast';
import { PersonalPage } from '@/app/components/site/personal/PersonalPage';
import { StudiesView } from '@/app/components/site/personal/StudiesView';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { getCurrentUserLearningData } from '@/app/requests/learning';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

/** "Your studies": the lists come rendered from the server, edits go through the store. */
export default async function LearningPageServer() {
  const [data, language] = await Promise.all([
    getCurrentUserLearningData(),
    getServerLanguageStatic(),
  ]);
  const copy = PERSONAL[language].studies;
  return (
    <AchievementProvider>
      <PersonalPage
        title={copy.title}
        description={copy.text}
        category="LEARNING"
      >
        <StudiesView
          initial={{ wantToLearn: data.wantToLearn, learned: data.learned }}
        />
      </PersonalPage>
    </AchievementProvider>
  );
}
