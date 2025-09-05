// app/composers/page.tsx - Lista de compositores SUPER otimizada
import { Suspense } from 'react';
import ComposersServer from './pageServer';
import { ListPageLoading } from '@/app/wrappers/SuspenseWrapper';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

interface ComposersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    epoch?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ComposersPageProps) {
  const resolvedParams = await searchParams;
  const language = await getServerLanguageStatic();

  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || '';

  const content = {
    pt: {
      baseTitle: 'Compositores Clássicos - Lista Completa',
      baseDescription:
        'Explore nossa coleção completa de compositores clássicos. Bach, Chopin, Beethoven, Mozart e centenas de mestres da música erudita. Partituras gratuitas, biografias e análises musicais organizadas por época.',
      searchTitle: `Buscar Compositores: "${search}"`,
      searchDescription: `Resultados da busca por "${search}" em nossa enciclopédia de compositores clássicos.`,
      keywords: [
        'compositores clássicos',
        'lista compositores',
        'Bach compositor',
        'Chopin biografia',
        'Beethoven obras',
        'Mozart partituras',
        'compositores barrocos',
        'compositores românticos',
        'compositores clássicos',
        'compositores impressionistas',
        'música erudita',
        'história música clássica',
        'biografias músicos',
        'enciclopédia musical',
        'educação musical',
        'conservatório',
        'estudar compositores',
        'análise compositores',
        'época musical',
        'períodos musicais',
      ],
    },
    en: {
      baseTitle: 'Classical Composers - Complete List',
      baseDescription:
        'Explore our complete collection of classical composers. Bach, Chopin, Beethoven, Mozart and hundreds of classical music masters. Free sheet music, biographies and musical analyses organized by era.',
      searchTitle: `Search Composers: "${search}"`,
      searchDescription: `Search results for "${search}" in our encyclopedia of classical composers.`,
      keywords: [
        'classical composers',
        'composers list',
        'Bach composer',
        'Chopin biography',
        'Beethoven works',
        'Mozart sheet music',
        'baroque composers',
        'romantic composers',
        'classical composers',
        'impressionist composers',
        'classical music',
        'classical music history',
        'musicians biographies',
        'musical encyclopedia',
        'music education',
        'conservatory',
        'study composers',
        'composers analysis',
        'musical era',
        'musical periods',
      ],
    },
  };

  const t = content[language];

  let title = search ? t.searchTitle : t.baseTitle;
  const description = search ? t.searchDescription : t.baseDescription;

  if (page > 1) {
    title += ` - Página ${page}`;
  }

  return {
    title,
    description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    creator: 'Opus Atlas',
    openGraph: {
      title,
      description,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: 'https://opusatlas.com.br/composers',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://opusatlas.com.br/composers',
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
  };
}

export const revalidate = 3600;

export default async function ComposersPage({
  searchParams,
}: ComposersPageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || '';
  const epochId = resolvedParams.epoch || '';

  return (
    <Suspense fallback={<ListPageLoading />}>
      <ComposersServer page={page} search={search} epochId={epochId} />
    </Suspense>
  );
}
