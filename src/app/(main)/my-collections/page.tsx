import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MyCollectionsView } from '@/app/components/site/collections/MyCollectionsView';
import { PersonalPage } from '@/app/components/site/personal/PersonalPage';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import { getServerSession } from '@/app/libs/api/server-session';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

// Per person: rendered on every request, never cached.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const copy = COLLECTIONS[await getServerLanguageStatic()].mine;
  return {
    title: `${copy.title} · Opus Atlas`,
    description: copy.text,
    robots: { index: false, follow: false },
  };
}

export default async function MyCollectionsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect('/not-authenticated');
  const copy = COLLECTIONS[await getServerLanguageStatic()].mine;
  return (
    <PersonalPage title={copy.title} description={copy.text}>
      <MyCollectionsView />
    </PersonalPage>
  );
}
