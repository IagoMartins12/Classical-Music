import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { HistoryView } from '@/app/components/site/personal/HistoryView';
import { PersonalPage } from '@/app/components/site/personal/PersonalPage';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { getServerSession } from '@/app/libs/api/server-session';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

// Per person: rendered on every request, never cached.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const copy = PERSONAL[await getServerLanguageStatic()].history;
  return {
    title: `${copy.title} · Opus Atlas`,
    description: copy.text,
    robots: { index: false, follow: false },
  };
}

/** "Histórico de envios", in the frame of the personal pages. */
export default async function UploadHistoryPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect('/not-authenticated');
  const copy = PERSONAL[await getServerLanguageStatic()].history;
  return (
    <PersonalPage title={copy.title} description={copy.text}>
      <Suspense>
        <HistoryView />
      </Suspense>
    </PersonalPage>
  );
}
