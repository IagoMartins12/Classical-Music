// app/public/teachers/page.tsx - Página Pública de Professores

import { Metadata } from 'next';
import PublicTeachersPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Conheça Nossos Professores | Opus Atlas',
  description:
    'Encontre o professor ideal para suas aulas de música. Navegue por perfis verificados, especialidades e avaliações de alunos.',
  keywords:
    'professores de música, aulas de música, professores particulares, ensino musical, instrumento musical, aulas online',
  openGraph: {
    title: 'Professores de Música - Opus Atlas',
    description:
      'Descubra professores talentosos e experientes para sua jornada musical',
    type: 'website',
    images: [
      {
        url: '/images/og-teachers.jpg',
        width: 1200,
        height: 630,
        alt: 'Professores de Música - Opus Atlas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professores de Música - Opus Atlas',
    description: 'Encontre o professor ideal para suas aulas de música',
  },
};

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

  return <PublicTeachersPageServer filters={filters} />;
}
