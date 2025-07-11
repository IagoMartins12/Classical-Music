// app/annotations/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';
import AuthCheck from '../components/AuthCheck';
import AnnotationsPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Minhas Anotações | Classical Hub',
  description:
    'Gerencie suas anotações musicais e compartilhe conhecimento com a comunidade',
  keywords:
    'anotações musicais, técnica, interpretação, estudo musical, classical hub',
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
    return <AuthCheck title="Suas anotações musicais" />;
  }

  return <AnnotationsPageServer />;
}
