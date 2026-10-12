// app/(student)/layout.tsx — o portal do aluno (04/10/2026)
//
// Mesma casca do professor (`PortalShell`). Sem `AdsProvider`, sem o
// `NotificationManager` do legado e sem os `console.log` de cada visita.
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Avisos } from '../components/ui/Avisos';
import { LearningHost } from '../components/Portal/LearningHost';
import { PortalShell } from '../components/Portal/PortalShell';
import { StudentGate } from '../components/Portal/screens/StudentGate';
import { getServerSession } from '@/app/libs/api/server-session';
import '../components/Portal/portal.css';

export const metadata: Metadata = {
  title: {
    template: '%s · Portal do aluno · Opus Atlas',
    default: 'Portal do aluno · Opus Atlas',
  },
  // Área logada: o legado tinha `index: true` aqui.
  robots: { index: false, follow: false },
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  const status = session.user.studentInviteStatus;

  if (!session.user.isStudent && !status) {
    redirect('/access-denied');
  }

  // Sem turma ativa (04/10/2026): o convite pendente, para aceitar ou
  // recusar ali, ou a orientação com as turmas que terminaram. O legado
  // mandava para "acesso negado".
  if (status !== 'ACCEPTED') {
    return (
      <>
        <StudentGate />
        <Avisos />
      </>
    );
  }

  return (
    <>
      <PortalShell role="student">{children}</PortalShell>
      <LearningHost />
      <Avisos />
    </>
  );
}
