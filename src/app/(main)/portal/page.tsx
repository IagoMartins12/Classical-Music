import { redirect } from 'next/navigation';
import { getServerSession } from '@/app/libs/api/server-session';

/**
 * The app's "Portal" shortcut (manifest): one address for everyone, sent to
 * the portal the account has. Teachers first (a teacher can also study);
 * without a portal, the page that explains it; signed out, the login.
 */
export default async function PortalEntry() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect('/not-authenticated');
  if (session.user.isTeacher) redirect('/teacher');
  if (session.user.isStudent) redirect('/student');
  redirect('/for-teachers');
}
