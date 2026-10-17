// app/(teacher)/layout.tsx — o portal do professor (04/10/2026)
//
// A casca é a do portal (`PortalShell`, esboço A). Saíram do layout o
// `AdsProvider` (anúncio dentro da área de trabalho), o `NotificationManager`
// do legado (o sino da casca lê os avisos da API) e o toaster próprio — os
// avisos rápidos são os do painel (`Avisos`), por cima das folhas.
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Avisos } from '../components/ui/Avisos';
import { LearningHost } from '../components/Portal/LearningHost';
import { PortalShell } from '../components/Portal/PortalShell';
import TeacherVerificationRequired from '../components/VerificationsProviders/TeacherVerificationRequired';
import { getServerSession } from '@/app/libs/api/server-session';
import '../components/Portal/portal.css';

export const metadata: Metadata = {
  title: {
    template: '%s · Portal do professor · Opus Atlas',
    default: 'Portal do professor · Opus Atlas',
  },
  // Área logada: o legado tinha `index: true` aqui.
  robots: { index: false, follow: false },
};

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  // Quem dá aula é `isTeacher`, não o papel: o professor promovido pelo
  // painel fica com `role: 0`, e o administrador que também dá aula tem
  // `role: 2`.
  if (!session.user.isTeacher) {
    redirect('/access-denied');
  }

  // The portal opens with an active teacher profile: at once for a Mentor or
  // Maestro subscriber; only someone invited waits, until they accept. An
  // API older than `teacherPortal` still answers with the approval.
  if (!(session.user.teacherPortal ?? session.user.teacherVerified)) {
    return (
      <TeacherVerificationRequired
        userEmail={session.user.email}
        userName={session.user.firstName || session.user.name || undefined}
      />
    );
  }

  return (
    <>
      <PortalShell role="teacher">{children}</PortalShell>
      <LearningHost />
      <Avisos />
    </>
  );
}
