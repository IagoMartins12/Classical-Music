// ================================
// app/teachers/page.tsx - CORRIGIDO
// ================================
import { Metadata } from 'next';
import { Suspense } from 'react';
import PublicTeachersPageServer from './pageServer';
import { ListPageLoading } from '@/app/wrappers/SuspenseWrapper';
import type { Language } from '@/app/utils/translations/serverTranslations';
import { alternatesFor } from '@/app/utils/seoAlternates';

/**
 * O que a rota `/teachers` desenha, sem saber de onde vieram os filtros.
 *
 * **Por que este arquivo existe.** No Next 15, ler `searchParams` em qualquer
 * ponto de uma rota a torna dinâmica: ela renderiza do zero a cada visita e o
 * `revalidate` declarado não vale nada. Mas a visita que importa — a que vem
 * do Google e do menu — chega sem filtro nenhum.
 *
 * Então a rota foi partida em duas que desenham exatamente a mesma coisa:
 * `page.tsx`, sem `searchParams`, que o Next gera e guarda; e
 * `filtered/page.tsx`, que lê os filtros e renderiza sob demanda, como antes.
 * O `middleware.ts` manda a visita para uma ou outra conforme haja query
 * string, sem mudar a URL que o visitante vê.
 */

export interface TeacherFilters {
  instrument?: string;
  specialty?: string;
  skillLevel?: string;
  ageGroup?: string;
  location?: string;
  verified: boolean;
  sortBy: string;
  page: number;
}

export type TeacherSearchParams = {
  instrument?: string;
  specialty?: string;
  skillLevel?: string;
  ageGroup?: string;
  location?: string;
  verified?: string;
  sortBy?: string;
  page?: string;
};

/** A visão padrão: sem filtro, primeira página, ordenada por avaliação. */
export const DEFAULT_TEACHER_FILTERS: TeacherFilters = {
  verified: false,
  sortBy: 'rating',
  page: 1,
};

export function toTeacherFilters(
  searchParams: TeacherSearchParams | undefined
): TeacherFilters {
  return {
    instrument: searchParams?.instrument,
    specialty: searchParams?.specialty,
    skillLevel: searchParams?.skillLevel,
    ageGroup: searchParams?.ageGroup,
    location: searchParams?.location,
    verified: searchParams?.verified === 'true',
    sortBy: searchParams?.sortBy || 'rating',
    page: parseInt(searchParams?.page || '1'),
  };
}

export function TeachersView({ filters }: { filters: TeacherFilters }) {
  return (
    <Suspense fallback={<ListPageLoading />}>
      <PublicTeachersPageServer filters={filters} />
    </Suspense>
  );
}

export function teachersMetadata(language: Language): Metadata {
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
    alternates: alternatesFor('/teachers', language),
  };
}
