// ================================
// app/teachers/page.tsx - CORRIGIDO
// ================================
import { Metadata } from 'next';
import { Suspense } from 'react';
import PublicTeachersPageServer from './pageServer';
import { ListPageLoading } from '@/app/wrappers/SuspenseWrapper';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'Professores de Música Clássica - Opus Atlas | Piano, Violino, Conservatório',
      description:
        'Encontre o professor ideal para suas aulas de música clássica. Professores especializados em piano, violino, violoncelo, teoria musical. Perfis verificados, especialidades em Bach, Chopin, Beethoven, Mozart e métodos de ensino consolidados.',
      keywords: [
        'professores música clássica',
        'professor piano clássico',
        'professor violino',
        'aulas música erudita',
        'professor conservatório',
        'ensino musical clássico',
        'metodologia piano',
        'professor Bach',
        'professor Chopin',
        'professor Beethoven',
        'aulas particulares música',
        'educação musical especializada',
        'técnica pianística',
        'interpretação musical',
        'professor violoncelo',
        'professor teoria musical',
        'aulas harmonia',
        'professor composição',
        'mestrado música',
        'professor certificado',
        'experiência conservatório',
        'método Suzuki',
        'técnica clássica',
        'preparação concursos',
        'aulas adultos música',
      ],
      ogTitle: 'Professores Especializados em Música Clássica',
      ogDescription:
        'Conecte-se com professores experientes e qualificados para sua jornada na música clássica.',
    },
    en: {
      title:
        'Classical Music Teachers - Opus Atlas | Piano, Violin, Conservatory',
      description:
        'Find the ideal teacher for your classical music lessons. Teachers specialized in piano, violin, cello, music theory. Verified profiles, specialties in Bach, Chopin, Beethoven, Mozart and established teaching methods.',
      keywords: [
        'classical music teachers',
        'classical piano teacher',
        'violin teacher',
        'classical music lessons',
        'conservatory teacher',
        'classical music education',
        'piano methodology',
        'Bach teacher',
        'Chopin teacher',
        'Beethoven teacher',
        'private music lessons',
        'specialized music education',
        'piano technique',
        'musical interpretation',
        'cello teacher',
        'music theory teacher',
        'harmony lessons',
        'composition teacher',
        'music masters degree',
        'certified teacher',
        'conservatory experience',
        'Suzuki method',
        'classical technique',
        'competition preparation',
        'adult music lessons',
      ],
      ogTitle: 'Specialized Classical Music Teachers',
      ogDescription:
        'Connect with experienced and qualified teachers for your classical music journey.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Education Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/teachers'
          : 'https://opusatlas.com.br/teachers',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical:
        language === 'pt'
          ? 'https://opusatlas.com.br/teachers'
          : 'https://opusatlas.com.br/teachers',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/teachers',
        'en-US': 'https://opusatlas.com.br/teachers',
      },
    },
  };
}

interface PublicTeachersPageProps {
  searchParams?: Promise<{
    instrument?: string;
    specialty?: string;
    skillLevel?: string;
    ageGroup?: string;
    location?: string;
    verified?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function PublicTeachersPage({
  searchParams,
}: PublicTeachersPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = {
    instrument: resolvedSearchParams?.instrument,
    specialty: resolvedSearchParams?.specialty,
    skillLevel: resolvedSearchParams?.skillLevel,
    ageGroup: resolvedSearchParams?.ageGroup,
    location: resolvedSearchParams?.location,
    verified: resolvedSearchParams?.verified === 'true',
    sortBy: resolvedSearchParams?.sortBy || 'rating',
    page: parseInt(resolvedSearchParams?.page || '1'),
  };

  return (
    <Suspense fallback={<ListPageLoading />}>
      <PublicTeachersPageServer filters={filters} />
    </Suspense>
  );
}
