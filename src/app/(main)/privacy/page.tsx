// app/privacy/page.tsx - Otimizado para SEO Musical
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import PrivacyPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'Política de Privacidade - Opus Atlas | Proteção de Dados Musicais',
      description:
        'Como protegemos a privacidade de estudantes de música clássica no Opus Atlas. Segurança de dados para usuários de partituras de Bach, Chopin, Beethoven. Política LGPD transparente para comunidade musical educacional.',
      keywords: [
        'privacidade música clássica',
        'proteção dados músicos',
        'LGPD estudantes música',
        'segurança conservatório online',
        'privacidade partituras',
        'dados pessoais música',
        'cookies música clássica',
        'proteção pianistas',
        'privacidade violinistas',
        'segurança educação musical',
        'dados estudantes música',
        'privacidade comunidade musical',
        'proteção informações musicais',
      ],
      ogTitle: 'Política de Privacidade - Proteção de Dados Musicais',
      ogDescription:
        'Saiba como protegemos a privacidade e dados de nossa comunidade de estudantes de música clássica.',
    },
    en: {
      title: 'Privacy Policy - Opus Atlas | Musical Data Protection',
      description:
        'How we protect the privacy of classical music students at Opus Atlas. Data security for users of sheet music from Bach, Chopin, Beethoven. Transparent privacy policy for educational musical community.',
      keywords: [
        'classical music privacy',
        'musicians data protection',
        'music students privacy',
        'online conservatory security',
        'sheet music privacy',
        'musical personal data',
        'classical music cookies',
        'pianists protection',
        'violinists privacy',
        'musical education security',
        'music students data',
        'musical community privacy',
        'musical information protection',
      ],
      ogTitle: 'Privacy Policy - Musical Data Protection',
      ogDescription:
        'Learn how we protect the privacy and data of our classical music students community.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Privacy Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/privacy'
          : 'https://opusatlas.com/en/privacy',
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
          ? 'https://opusatlas.com.br/privacy'
          : 'https://opusatlas.com/en/privacy',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/privacy',
        'en-US': 'https://opusatlas.com/en/privacy',
      },
    },
  };
}

export const revalidate = 3600;

export default async function PrivacyPageRoute() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/privacy',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <PrivacyPage />
    </TranslationProvider>
  );
}
