import { imagemPadrao } from '@/app/utils/ogImagem';
import { Metadata } from 'next';
import { ContactView } from '@/app/components/site/contact/ContactView';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { alternatesFor } from '@/app/utils/seoAlternates';

/** `[lang]` é quem decide o idioma desta página — ver `routeLanguage`. */
interface LangPageProps {
  params: LangParams;
}

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  const language = await routeLanguage(params);

  const content = {
    pt: {
      title: 'Contato',
      description:
        'Entre em contato com o Opus Atlas. Suporte especializado para estudantes de música clássica, dúvidas sobre partituras de piano, violino, compositores como Bach, Chopin, Beethoven. Parcerias educacionais e suporte técnico.',
      ogTitle: 'Contato - Suporte Especializado em Música Clássica',
      ogDescription:
        'Fale conosco! Suporte especializado para estudantes de música clássica, partituras e educação musical.',
    },
    en: {
      title: 'Contact',
      description:
        'Contact Opus Atlas. Specialized support for classical music students, questions about piano and violin sheet music, composers like Bach, Chopin, Beethoven. Educational partnerships and technical support.',
      ogTitle: 'Contact - Specialized Classical Music Support',
      ogDescription:
        'Contact us! Specialized support for classical music students, sheet music and musical education.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    authors: [{ name: 'Opus Atlas Support Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/contact'
          : 'https://opusatlas.com.br/contact',
      siteName: 'Opus Atlas',
      images: imagemPadrao(language),
    },

    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,
      images: imagemPadrao(language),
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
    alternates: alternatesFor('/contact', language),
  };
}

export const revalidate = 3600;

export default async function ContactPage({ params }: LangPageProps) {
  return <ContactView idioma={await routeLanguage(params)} />;
}
