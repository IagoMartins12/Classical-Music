// app/uploads/moderation/page.tsx - Moderação (admin only)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import ModerationClient from '@/app/(main)/moderation/pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Moderação de Uploads - Opus Atlas | Painel Administrativo',
      description:
        'Painel de moderação para gerencie reports, aprovações e moderação de uploads de conteúdo musical. Área restrita para moderadores.',
      ogTitle: 'Painel de Moderação - Opus Atlas',
      ogDescription:
        'Ferramenta administrativa para moderação de conteúdo musical',
    },
    en: {
      title: 'Upload Moderation - Opus Atlas | Administrative Panel',
      description:
        'Moderation panel to manage reports, approvals and moderation of musical content uploads. Restricted area for moderators.',
      ogTitle: 'Moderation Panel - Opus Atlas',
      ogDescription: 'Administrative tool for musical content moderation',
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

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const status = resolvedSearchParams.status || 'pending';

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/uploads',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <ModerationClient page={page} status={status} />
    </TranslationProvider>
  );
}
