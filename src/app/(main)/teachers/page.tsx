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
  searchParams: {
    instrument?: string;
    specialty?: string;
    skillLevel?: string;
    ageGroup?: string;
    location?: string;
    verified?: string;
    sortBy?: string;
    page?: string;
  };
}

export default async function PublicTeachersPage({
  searchParams,
}: PublicTeachersPageProps) {
  // Parse search params
  const filters = {
    instrument: searchParams.instrument,
    specialty: searchParams.specialty,
    skillLevel: searchParams.skillLevel,
    ageGroup: searchParams.ageGroup,
    location: searchParams.location,
    verified: searchParams.verified === 'true',
    sortBy: searchParams.sortBy || 'rating',
    page: parseInt(searchParams.page || '1'),
  };

  return <PublicTeachersPageServer filters={filters} />;
}
