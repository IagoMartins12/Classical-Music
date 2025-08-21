// app/learning/page.tsx
import { Metadata } from 'next';

import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import AuthCheck from '../../components/AuthCheck';
import LearningPageServer from './pageServer';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Meu Aprendizado | Classical Music App',
  description:
    'Acompanhe seu progresso musical e gerencie suas listas de estudo',
};

export default async function LearningPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  return <LearningPageServer />;
}
