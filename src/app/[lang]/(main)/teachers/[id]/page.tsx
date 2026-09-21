// app/public/teachers/[id]/page.tsx - Página de Detalhes do Professor

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicTeacherDetailsPageServer from './pageServer';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { alternatesFor } from '@/app/utils/seoAlternates';

interface TeacherPubParams {
  id: string;
}

interface TeacherDetailsPageProps {
  params: LangParams<TeacherPubParams>;
}

export async function generateMetadata({
  params,
}: TeacherDetailsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const language = await routeLanguage(params);

  // Aqui você pode buscar dados específicos do professor se tiver uma função
  // const teacher = await getTeacherById(resolvedParams.id);

  const content = {
    pt: {
      title:
        'Professor de Música Clássica - Opus Atlas | Especialista Certificado',
      description:
        'Conheça nosso professor especializado em música clássica, suas qualificações, experiência em conservatório, métodos de ensino e avaliações de estudantes. Aulas de piano, violino, teoria musical e interpretação de obras clássicas.',
      keywords: [
        'professor música clássica certificado',
        'aulas particulares piano',
        'professor violino experiente',
        'especialista conservatório',
        'metodologia ensino musical',
        'técnica instrumental',
        'interpretação clássica',
        'professor teoria musical',
        'experiência ensino música',
        'formação musical superior',
        'avaliações estudantes',
        'resultados comprovados',
        'preparação concursos música',
        'método personalizado',
        'educação musical qualidade',
      ],
      ogTitle: 'Professor Especializado em Música Clássica',
      ogDescription:
        'Descubra um educador musical experiente e qualificado para sua jornada na música clássica.',
    },
    en: {
      title: 'Classical Music Teacher - Opus Atlas | Certified Specialist',
      description:
        'Meet our classical music specialist teacher, their qualifications, conservatory experience, teaching methods and student reviews. Piano, violin, music theory lessons and classical works interpretation.',
      keywords: [
        'certified classical music teacher',
        'private piano lessons',
        'experienced violin teacher',
        'conservatory specialist',
        'music teaching methodology',
        'instrumental technique',
        'classical interpretation',
        'music theory teacher',
        'music teaching experience',
        'higher music education',
        'student reviews',
        'proven results',
        'music competition preparation',
        'personalized method',
        'quality music education',
      ],
      ogTitle: 'Classical Music Specialist Teacher',
      ogDescription:
        'Discover an experienced and qualified music educator for your classical music journey.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'profile',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: `https://opusatlas.com.br/teachers/${resolvedParams.id}`,
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt:
            language === 'pt'
              ? 'Perfil do Professor - Opus Atlas'
              : 'Teacher Profile - Opus Atlas',
        },
      ],
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
    alternates: alternatesFor(`/teachers/${resolvedParams.id}`, language),
  };
}

/**
 * **`generateStaticParams` vazio, e é isso que liga o cache.**
 *
 * No App Router, rota com segmento dinâmico e **sem** `generateStaticParams`
 * é renderizada a cada pedido, e o `revalidate` acima não vale nada — era o
 * caso aqui: cada visita a uma professor renderizava a página do zero, para o diretório de professores.
 *
 * Devolvendo uma lista vazia, nada é gerado no build (não faria sentido gerar
 * centenas de milhares de páginas) mas a rota passa a ser guardada: a primeira
 * visita de cada endereço renderiza, as seguintes vêm do Redis compartilhado,
 * e a API revalida por tag quando o dado muda.
 */
export async function generateStaticParams() {
  return [];
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
