// app/teacher/calendar/page.tsx - Página de Calendario de aulas (professor)

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import TeacherCalendarPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Calendário de Aulas | Professor - Opus Atlas',
  description:
    'Visualize e gerencie sua agenda de aulas, horários disponíveis e cronograma de ensino',
  keywords:
    'calendário professor, agenda de aulas, horários, cronograma musical, gestão de tempo',
  openGraph: {
    title: 'Calendário do Professor - Opus Atlas',
    description:
      'Organize sua agenda de aulas e gerencie seu tempo de ensino de forma eficiente',
    type: 'website',
  },
};

export default async function TeacherCalendarPage() {
  const session = await getRequiredServerSession();

  return (
    <TeacherCalendarPageServer
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
