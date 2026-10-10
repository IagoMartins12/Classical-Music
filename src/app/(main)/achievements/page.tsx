import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AchievementProvider } from '@/app/components/achievement/AchievementToast';
import { AchievementsView } from '@/app/components/site/personal/AchievementsView';
import { PersonalPage } from '@/app/components/site/personal/PersonalPage';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { getServerSession } from '@/app/libs/api/server-session';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

// One page per person: rendered on every request.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const copy = PERSONAL[await getServerLanguageStatic()].achievements;
  return {
    title: `${copy.title} · Opus Atlas`,
    robots: { index: false, follow: false },
  };
}

export default async function AchievementsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect('/not-authenticated');

  const copy = PERSONAL[await getServerLanguageStatic()].achievements;
  return (
    <AchievementProvider>
      <PersonalPage title={copy.title} description={copy.text} progress={false}>
        <AchievementsView />
      </PersonalPage>
    </AchievementProvider>
  );
}
