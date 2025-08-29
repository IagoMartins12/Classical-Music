// app/annotations/page.tsx - Página privada otimizada
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import AnnotationsPageServer from './pageServer';
import { redirect } from 'next/navigation';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Minhas Anotações - Opus Atlas | Estudos de Música Clássica',
      description:
        'Gerencie suas anotações musicais sobre partituras de Bach, Chopin, Beethoven. Organize técnicas de interpretação, análises musicais e compartilhe conhecimento com estudantes de música clássica.',
      keywords: [
        'anotações musicais',
        'estudos música clássica',
        'técnicas interpretação piano',
        'análise musical',
        'notas estudo Bach',
        'anotações Chopin',
        'técnicas Beethoven',
        'estudo violino clássico',
        'compartilhar conhecimento musical',
        'educação musical',
        'conservatório virtual',
        'análise partituras',
        'interpretação música erudita',
        'técnicas pianísticas',
        'estudo individual música',
      ],
      ogTitle: 'Anotações Musicais - Organize seus Estudos',
      ogDescription:
        'Organize e compartilhe seu conhecimento musical através de anotações especializadas sobre obras clássicas.',
    },
    en: {
      title: 'My Annotations - Opus Atlas | Classical Music Studies',
      description:
        'Manage your musical annotations about Bach, Chopin, Beethoven sheet music. Organize interpretation techniques, musical analyses and share knowledge with classical music students.',
      keywords: [
        'musical annotations',
        'classical music studies',
        'piano interpretation techniques',
        'musical analysis',
        'Bach study notes',
        'Chopin annotations',
        'Beethoven techniques',
        'classical violin study',
        'musical knowledge sharing',
        'music education',
        'virtual conservatory',
        'sheet music analysis',
        'classical music interpretation',
        'pianistic techniques',
        'individual music study',
      ],
      ogTitle: 'Musical Annotations - Organize Your Studies',
      ogDescription:
        'Organize and share your musical knowledge through specialized annotations on classical works.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    robots: { index: false, follow: false }, // Página privada
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
    },
  };
}

export default async function AnnotationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  return <AnnotationsPageServer />;
}
