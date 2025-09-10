// app/copyright/page.tsx - Otimizado para SEO Musical
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import CopyrightPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'Direitos Autorais - Opus Atlas | Partituras Legais de Música Clássica',
      description:
        'Como o Opus Atlas respeita direitos autorais em partituras de música clássica. Saiba sobre domínio público, IMSLP, partituras legais de Bach, Chopin, Beethoven, Mozart e compositores clássicos. Política DMCA transparente.',
      keywords: [
        'direitos autorais música clássica',
        'partituras legais',
        'domínio público música',
        'IMSLP partituras',
        'Bach domínio público',
        'Chopin partituras legais',
        'Beethoven direitos autorais',
        'Mozart partituras gratuitas',
        'copyright música erudita',
        'partituras sem copyright',
        'DMCA música clássica',
        'propriedade intelectual música',
        'uso legal partituras',
        'compositores domínio público',
        'partituras piano legais',
        'partituras violino gratuitas',
        'música clássica gratuita',
        'download legal partituras',
      ],
      ogTitle: 'Direitos Autorais - Partituras Legais de Música Clássica',
      ogDescription:
        'Partituras 100% legais de grandes mestres. Saiba como respeitamos direitos autorais e oferecemos música clássica gratuita.',
    },
    en: {
      title: 'Copyright Policy - Opus Atlas | Legal Classical Music Scores',
      description:
        'How Opus Atlas respects copyright in classical music scores. Learn about public domain, IMSLP, legal sheet music from Bach, Chopin, Beethoven, Mozart and classical composers. Transparent DMCA policy.',
      keywords: [
        'classical music copyright',
        'legal sheet music',
        'public domain music',
        'IMSLP scores',
        'Bach public domain',
        'Chopin legal scores',
        'Beethoven copyright',
        'Mozart free sheet music',
        'classical music copyright',
        'copyright-free scores',
        'DMCA classical music',
        'music intellectual property',
        'legal music usage',
        'public domain composers',
        'legal piano scores',
        'free violin sheet music',
        'free classical music',
        'legal score downloads',
      ],
      ogTitle: 'Copyright Policy - Legal Classical Music Scores',
      ogDescription:
        '100% legal scores from great masters. Learn how we respect copyright and offer free classical music.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Legal Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/copyright'
          : 'https://opusatlas.com.br/copyright',
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt:
            language === 'pt'
              ? 'Sobre o Opus Atlas - Enciclopédia Musical'
              : 'About Opus Atlas - Musical Encyclopedia',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,
      images: ['https://opusatlas.com.br/logo-opus-atlas.jpeg'],
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
          ? 'https://opusatlas.com.br/copyright'
          : 'https://opusatlas.com.br/copyright',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/copyright',
        'en-US': 'https://opusatlas.com.br/copyright',
      },
    },
  };
}

export const revalidate = 3600;

export default async function CopyrightPageRoute() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/copyright',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <CopyrightPage />
    </TranslationProvider>
  );
}
