// app/uploads/page.tsx - Meus uploads otimizado
import { getServerSession } from 'next-auth';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import UploadsPageServer from './pageServer';
import EmailVerificationRequired from '@/app/components/VerificationsProviders/EmailVerificationRequired';
import { authOptions } from '@/app/libs/auth';
import { getUserById } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meus Uploads - Opus Atlas | Minhas Contribuições Musicais',
      description:
        'Gerencie suas contribuições para a enciclopédia musical. Visualize e edite compositores, obras e partituras que você adicionou à plataforma.',
      ogTitle: 'Minhas Contribuições - Opus Atlas',
      ogDescription:
        'Minhas contribuições para a enciclopédia de música clássica',
    },
    en: {
      title: 'My Uploads - Opus Atlas | My Musical Contributions',
      description:
        'Manage your contributions to the musical encyclopedia. View and edit composers, works and sheet music you added to the platform.',
      ogTitle: 'My Contributions - Opus Atlas',
      ogDescription: 'My contributions to the classical music encyclopedia',
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
    twitter: {
      card: 'summary',
      title: t.ogTitle,
      description: t.ogDescription,
    },
  };
}

export default async function UploadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    epoch?: string;
    composer?: string;
    work?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  const userData = await getUserById(session.user.id);

  if (!userData) {
    return redirect('/not-authenticated');
  }

  if (!userData.emailVerified && userData.email) {
    return (
      <EmailVerificationRequired
        userEmail={userData.email}
        userName={userData.firstName || undefined}
      />
    );
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const type = resolvedSearchParams.type || 'all';
  const epochId = resolvedSearchParams.epoch || '';
  const composerId = resolvedSearchParams.composer || '';
  const workId = resolvedSearchParams.work || '';

  return (
    <UploadsPageServer
      page={page}
      search={search}
      type={type}
      epochId={epochId}
      composerId={composerId}
      workId={workId}
      userId={session.user.id}
      userRole={session.user.role || 0}
    />
  );
}
