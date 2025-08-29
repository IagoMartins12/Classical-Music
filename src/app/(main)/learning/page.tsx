// app/learning/page.tsx - Aprendizado pessoal otimizado
import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import LearningPageServer from './pageServer';
import { redirect } from 'next/navigation';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meu Aprendizado - Opus Atlas | Progresso Musical Pessoal',
      description:
        'Acompanhe seu progresso musical pessoal e gerencie suas listas de estudo. Organize seu desenvolvimento em piano, violino e teoria musical com metas e conquistas.',
      ogTitle: 'Meu Progresso Musical - Opus Atlas',
      ogDescription:
        'Acompanhe meu desenvolvimento e conquistas na música clássica',
      keywords: ['progresso musical', 'aprendizado pessoal', 'estudos música'],
    },
    en: {
      title: 'My Learning - Opus Atlas | Personal Musical Progress',
      description:
        'Track your personal musical progress and manage your study lists. Organize your development in piano, violin and music theory with goals and achievements.',
      ogTitle: 'My Musical Progress - Opus Atlas',
      ogDescription: 'Track my development and achievements in classical music',
      keywords: ['musical progress', 'personal learning', 'music studies'],
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
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

export default async function LearningPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  return <LearningPageServer />;
}
