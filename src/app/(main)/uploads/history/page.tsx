// app/uploads/history/page.tsx - Histórico de uploads
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import HistoryClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Histórico de Uploads - Opus Atlas | Registro de Atividades',
      description:
        'Visualize o histórico completo de alterações nos seus uploads. Acompanhe criações, edições e atualizações das suas contribuições musicais.',
      ogTitle: 'Meu Histórico de Contribuições - Opus Atlas',
      ogDescription:
        'Registro completo das minhas atividades na plataforma musical',
    },
    en: {
      title: 'Upload History - Opus Atlas | Activity Log',
      description:
        'View the complete history of changes in your uploads. Track creations, edits and updates of your musical contributions.',
      ogTitle: 'My Contribution History - Opus Atlas',
      ogDescription: 'Complete record of my activities on the musical platform',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
  };
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    type?: string;
    action?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const type = resolvedSearchParams.type || 'all';
  const action = resolvedSearchParams.action || 'all';

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/uploads',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <HistoryClient
        page={page}
        type={type}
        action={action}
        userId={session.user.id}
        isAdmin={session.user.role === 2}
      />
    </TranslationProvider>
  );
}
