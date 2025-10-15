// app/faq/page.tsx - Otimizado para SEO Musical
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import FAQPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'Perguntas Frequentes - Opus Atlas | Dúvidas sobre Música Clássica',
      description:
        'Dúvidas sobre música clássica? Encontre respostas sobre partituras de piano, violino, como estudar Bach, Chopin, Beethoven, Mozart. FAQ completo para estudantes de música erudita e professores de conservatório.',
      keywords: [
        'FAQ música clássica',
        'perguntas frequentes música',
        'dúvidas partituras piano',
        'como estudar Chopin',
        'como tocar Bach',
        'dúvidas Beethoven',
        'perguntas Mozart',
        'FAQ violino clássico',
        'dúvidas música erudita',
        'como usar partituras',
        'perguntas estudantes música',
        'FAQ conservatório',
        'dúvidas sonata ao luar',
        'como estudar música romântica',
        'perguntas educação musical',
        'FAQ piano clássico',
        'dúvidas compositores clássicos',
      ],
      ogTitle: 'FAQ - Perguntas sobre Música Clássica e Partituras',
      ogDescription:
        'Tire suas dúvidas sobre música clássica, partituras de grandes maestros e como estudar piano e violino.',
    },
    en: {
      title: 'FAQ - Opus Atlas | Classical Music Questions',
      description:
        'Questions about classical music? Find answers about piano and violin sheet music, how to study Bach, Chopin, Beethoven, Mozart. Complete FAQ for classical music students and conservatory teachers.',
      keywords: [
        'classical music FAQ',
        'music frequently asked questions',
        'piano sheet music questions',
        'how to study Chopin',
        'how to play Bach',
        'Beethoven questions',
        'Mozart questions',
        'classical violin FAQ',
        'classical music doubts',
        'how to use sheet music',
        'music students questions',
        'conservatory FAQ',
        'moonlight sonata questions',
        'how to study romantic music',
        'musical education questions',
        'classical piano FAQ',
        'classical composers questions',
      ],
      ogTitle: 'FAQ - Classical Music and Sheet Music Questions',
      ogDescription:
        'Get answers about classical music, sheet music from great masters and how to study piano and violin.',
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
          ? 'https://opusatlas.com.br/faq'
          : 'https://opusatlas.com.br/faq',
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
          ? 'https://opusatlas.com.br/faq'
          : 'https://opusatlas.com.br/faq',
      languages: {
        'en-US': 'https://opusatlas.com.br/faq',
        'pt-BR': 'https://opusatlas.com.br/faq',
      },
    },
  };
}

export const revalidate = 3600;

export default async function FAQPageRoute() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/faq',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <FAQPage />
    </TranslationProvider>
  );
}
