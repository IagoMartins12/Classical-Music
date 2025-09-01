// app/student/calendar/page.tsx - Página do Calendário do Aluno
import { Metadata } from 'next';
import StudentCalendarPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meu Calendário | Aluno - Opus Atlas',
      description:
        'Visualize suas aulas agendadas, horários de estudo e cronograma musical',
      keywords: [
        'calendário aluno',
        'agenda de aulas',
        'horários de estudo',
        'cronograma musical',
        'agenda estudante',
        'planejamento estudo',
      ],
      ogTitle: 'Calendário do Aluno - Opus Atlas',
      ogDescription:
        'Acompanhe sua agenda de aulas e organize seu tempo de estudo musical',
    },
    en: {
      title: 'My Calendar | Student - Opus Atlas',
      description:
        'View your scheduled lessons, study times and musical schedule',
      keywords: [
        'student calendar',
        'lesson schedule',
        'study times',
        'musical schedule',
        'student agenda',
        'study planning',
      ],
      ogTitle: 'Student Calendar - Opus Atlas',
      ogDescription:
        'Track your lesson schedule and organize your musical study time',
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

export default async function StudentCalendarPage() {
  const session = await getRequiredServerSession();

  return <StudentCalendarPageServer userId={session.user.id} />;
}
