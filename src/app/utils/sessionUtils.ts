// app/libs/getRequiredServerSession.ts
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { authOptions } from '../libs/auth';

export async function getRequiredServerSession(): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/not-authenticad');
  }

  return session; // Aqui o TypeScript já sabe que não é null
}
