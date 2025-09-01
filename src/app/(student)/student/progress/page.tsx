// app/student/progress/page.tsx - Página de Progresso do Aluno
import { Metadata } from 'next';
import StudentProgressPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meu Progresso Musical | Aluno - Opus Atlas',
      description:
        'Acompanhe sua evolução musical, histórico de aprendizado e estatísticas de estudo detalhadas',
      keywords: [
        'progresso musical',
        'evolução aluno',
        'estatísticas estudo',
        'histórico aprendizado',
        'gráficos progresso',
        'desenvolvimento musical',
        'métricas estudante',
      ],
      ogTitle: 'Progresso Musical - Opus Atlas',
      ogDescription:
        'Visualize sua jornada musical com gráficos detalhados e estatísticas de progresso',
    },
    en: {
      title: 'My Musical Progress | Student - Opus Atlas',
      description:
        'Track your musical evolution, learning history and detailed study statistics',
      keywords: [
        'musical progress',
        'student evolution',
        'study statistics',
        'learning history',
        'progress charts',
        'musical development',
        'student metrics',
      ],
      ogTitle: 'Musical Progress - Opus Atlas',
      ogDescription:
        'Visualize your musical journey with detailed charts and progress statistics',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    robots: { index: false, follow: false }, // Página privada
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
  };
}

export default async function StudentProgressPage() {
  const session = await getRequiredServerSession();

  return <StudentProgressPageServer userId={session.user.id} />;
}
