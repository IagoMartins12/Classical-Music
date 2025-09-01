// app/student/page.tsx - Página Principal do Dashboard do Aluno
import { Metadata } from 'next';
import StudentPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Dashboard do Aluno | Opus Atlas',
      description:
        'Acompanhe suas aulas de música, progresso nos estudos e comunicação com seus professores',
      keywords: [
        'aluno de música',
        'aulas de música',
        'progresso musical',
        'estudos musicais',
        'professor de música',
        'dashboard estudante',
        'educação musical',
        'conservatório virtual',
      ],
      ogTitle: 'Dashboard do Aluno - Opus Atlas',
      ogDescription:
        'Plataforma para alunos acompanharem seu progresso musical e interagirem com professores',
    },
    en: {
      title: 'Student Dashboard | Opus Atlas',
      description:
        'Track your music lessons, study progress and communication with your teachers',
      keywords: [
        'music student',
        'music lessons',
        'musical progress',
        'musical studies',
        'music teacher',
        'student dashboard',
        'music education',
        'virtual conservatory',
      ],
      ogTitle: 'Student Dashboard - Opus Atlas',
      ogDescription:
        'Platform for students to track their musical progress and interact with teachers',
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

export default async function StudentPage() {
  const session = await getRequiredServerSession();

  return (
    <StudentPageServer
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={`${session.user.firstName || ''} ${
        session.user.lastName || ''
      }`.trim()}
      userImage={session.user.image}
      userRole={session.user.role}
    />
  );
}
