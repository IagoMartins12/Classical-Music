// app/teacher/calendar/page.tsx - Página de Calendário de aulas (professor)
import { Metadata } from 'next';
import TeacherCalendarPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Calendário de Aulas | Professor - Opus Atlas',
      description:
        'Visualize e gerencie sua agenda de aulas, horários disponíveis e cronograma de ensino',
      keywords: [
        'calendário professor',
        'agenda de aulas',
        'horários',
        'cronograma musical',
        'gestão de tempo',
        'planejamento aulas',
      ],
      ogTitle: 'Calendário do Professor - Opus Atlas',
      ogDescription:
        'Organize sua agenda de aulas e gerencie seu tempo de ensino de forma eficiente',
    },
    en: {
      title: 'Lesson Calendar | Teacher - Opus Atlas',
      description:
        'View and manage your lesson schedule, available times and teaching timetable',
      keywords: [
        'teacher calendar',
        'lesson schedule',
        'time slots',
        'musical timetable',
        'time management',
        'lesson planning',
      ],
      ogTitle: 'Teacher Calendar - Opus Atlas',
      ogDescription:
        'Organize your lesson schedule and manage your teaching time efficiently',
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

export default async function TeacherCalendarPage() {
  const session = await getRequiredServerSession();

  return <TeacherCalendarPageServer userId={session.user.id} />;
}
