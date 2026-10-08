import { AchievementProvider } from '@/app/components/achievement/AchievementToast';
import { AnnotationsView } from '@/app/components/site/personal/AnnotationsView';
import { PersonalPage } from '@/app/components/site/personal/PersonalPage';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

/** "Your annotations": loaded in the browser, where edits and deletes happen. */
export default async function AnnotationsPageServer() {
  const copy = PERSONAL[await getServerLanguageStatic()].annotations;
  return (
    <AchievementProvider>
      <PersonalPage
        title={copy.title}
        description={copy.text}
        category="ANNOTATIONS"
      >
        <AnnotationsView />
      </PersonalPage>
    </AchievementProvider>
  );
}
