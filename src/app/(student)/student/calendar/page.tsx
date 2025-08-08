// app/student/calendar/page.tsx - Página do Calendário do Aluno

import { Metadata } from 'next';

import StudentCalendarPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Meu Calendário | Aluno - Opus Atlas',
  description:
    'Visualize suas aulas agendadas, horários de estudo e cronograma musical',
  keywords:
    'calendário aluno, agenda de aulas, horários de estudo, cronograma musical',
  openGraph: {
    title: 'Calendário do Aluno - Opus Atlas',
    description:
      'Acompanhe sua agenda de aulas e organize seu tempo de estudo musical',
    type: 'website',
  },
};

export default async function StudentCalendarPage() {
  const session = await getRequiredServerSession();

  return (
    <StudentCalendarPageServer
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
