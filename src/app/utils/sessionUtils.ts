// app/utils/sessionUtils.ts — a sessão obrigatória das páginas por pessoa
import { redirect } from 'next/navigation';
import {
  getServerSession,
  type ServerSession,
} from '@/app/libs/api/server-session';

/**
 * A sessão de quem está pedindo a página, ou um desvio para o login.
 *
 * O tipo passou a ser o `ServerSession` da API, no lugar do `Session` do
 * NextAuth: mesma forma (`{ user: { id, role, … } }`), sem o `expires` que só
 * o NextAuth tinha e ninguém lia, e sem a consulta ao MongoDB que o
 * `PrismaAdapter` fazia a cada render.
 */
export async function getRequiredServerSession(): Promise<ServerSession> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  return session;
}
