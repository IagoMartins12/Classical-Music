// app/annotations/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import AnnotationsPageServer from './pageServer';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Minhas Anotações | Opus Atlas',
  description:
    'Gerencie suas anotações musicais e compartilhe conhecimento com a comunidade',
  keywords:
    'anotações musicais, técnica, interpretação, estudo musical, Opus Atlas',
  openGraph: {
    title: 'Minhas Anotações Musicais',
    description:
      'Organize e compartilhe seu conhecimento musical através de anotações especializadas',
    type: 'website',
  },
};

export default async function AnnotationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  return <AnnotationsPageServer />;
}
