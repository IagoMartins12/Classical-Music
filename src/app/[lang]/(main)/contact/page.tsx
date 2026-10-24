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
      title:
        'Contato - Opus Atlas | Suporte para Estudantes de Música Clássica',
      description:
        'Entre em contato com o Opus Atlas. Suporte especializado para estudantes de música clássica, dúvidas sobre partituras de piano, violino, compositores como Bach, Chopin, Beethoven. Parcerias educacionais e suporte técnico.',
      keywords: [
        'contato opus atlas',
        'suporte música clássica',
        'ajuda partituras',
        'suporte estudantes música',
        'dúvidas piano clássico',
        'ajuda violino',
        'suporte partituras Bach',
        'ajuda Chopin',
        'suporte Beethoven',
        'contato educação musical',
        'parcerias música clássica',
        'suporte técnico partituras',
        'fale conosco música',
        'atendimento estudantes',
        'moderação conteúdo musical',
        'suporte conservatório',
        'ajuda música erudita',
      ],
      ogTitle: 'Contato - Suporte Especializado em Música Clássica',
      ogDescription:
        'Fale conosco! Suporte especializado para estudantes de música clássica, partituras e educação musical.',
    },
    en: {
      title: 'Contact - Opus Atlas | Support for Classical Music Students',
      description:
        'Contact Opus Atlas. Specialized support for classical music students, questions about piano and violin sheet music, composers like Bach, Chopin, Beethoven. Educational partnerships and technical support.',
      keywords: [
        'contact opus atlas',
        'classical music support',
        'sheet music help',
        'music students support',
        'classical piano questions',
        'violin help',
        'Bach scores support',
        'Chopin help',
        'Beethoven support',
        'musical education contact',
        'classical music partnerships',
        'sheet music technical support',
        'music contact us',
        'student support',
        'musical content moderation',
        'conservatory support',
        'classical music help',
      ],
      ogTitle: 'Contact - Specialized Classical Music Support',
      ogDescription:
        'Contact us! Specialized support for classical music students, sheet music and musical education.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
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
