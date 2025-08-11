// app/public/teachers/[id]/page.tsx - Página de Detalhes do Professor

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicTeacherDetailsPageServer from './pageServer';

interface TeacherPubParams {
  id: string;
}

interface TeacherDetailsPageProps {
  params: Promise<TeacherPubParams>;
}

// Gerar metadata dinâmica
export async function generateMetadata(): Promise<Metadata> {
  // Buscar dados básicos do professor para metadata
  try {
    return {
      title: `Professor | Opus Atlas`,
      description: `Conheça nosso professor de música, suas especialidades, experiência e avaliações de alunos.`,
      keywords:
        'professor de música, aulas particulares, ensino musical, especialista em música',
      openGraph: {
        title: `Professor de Música - Opus Atlas`,
        description: `Descubra um professor talentoso e experiente para sua jornada musical`,
        type: 'profile',
        images: [
          {
            url: '/images/og-teacher-profile.jpg',
            width: 1200,
            height: 630,
            alt: 'Perfil do Professor - Opus Atlas',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Professor de Música - Opus Atlas',
        description: 'Conheça nosso professor especialista em música',
      },
    };
  } catch {
    return {
      title: 'Professor | Opus Atlas',
      description: 'Perfil do professor de música',
    };
  }
}

export default async function TeacherDetailsPage({
  params,
}: TeacherDetailsPageProps) {
  const resolvedParams = await params;

  if (!resolvedParams.id) {
    notFound();
  }

  return <PublicTeacherDetailsPageServer teacherId={resolvedParams.id} />;
}
