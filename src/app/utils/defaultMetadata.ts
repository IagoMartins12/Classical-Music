// app/utils/metadata/defaultMetadata.ts
import { Metadata } from 'next';

export type ImageSize = 'small' | 'large';

interface MetadataConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  imageSize?: ImageSize;
  customImage?: {
    url: string;
    alt: string;
  };
  canonical?: string;
}

export function generateDefaultMetadata(
  language: 'pt' | 'en',
  config: MetadataConfig = {}
): Metadata {
  const {
    title,
    description,
    keywords = [],
    imageSize = 'large',
    customImage,
    canonical,
  } = config;

  // Configuração base por idioma
  const baseContent = {
    pt: {
      defaultTitle: 'Opus Atlas - Enciclopédia de Música Clássica',
      defaultDescription:
        'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa. Descubra compositores, obras e desenvolva suas habilidades musicais.',
      defaultKeywords: [
        'música clássica',
        'compositores',
        'partituras',
        'educação musical',
        'piano',
        'estudo musical',
      ],
      ogTitle: 'Opus Atlas - Enciclopédia Musical Gratuita',
      ogDescription:
        'Democratizando o acesso à música clássica com partituras gratuitas de grandes mestres como Chopin, Bach, Beethoven e Mozart.',
      imageAlt: 'Opus Atlas - Enciclopédia de Música Clássica',
    },
    en: {
      defaultTitle: 'Opus Atlas - Classical Music Encyclopedia',
      defaultDescription:
        'Explore, learn, and practice classical music with our interactive encyclopedia. Discover composers, works, and improve your musical skills.',
      defaultKeywords: [
        'classical music',
        'composers',
        'sheet music',
        'music education',
        'piano',
        'music study',
      ],
      ogTitle: 'Opus Atlas - Free Musical Encyclopedia',
      ogDescription:
        'Democratizing access to classical music with free sheet music from great masters like Chopin, Bach, Beethoven and Mozart.',
      imageAlt: 'Opus Atlas - Classical Music Encyclopedia',
    },
  };

  const content = baseContent[language] || baseContent.pt;

  // Configuração da imagem baseada no tamanho
  const imageConfig = customImage || {
    url:
      imageSize === 'large'
        ? 'https://opusatlas.com.br/logo-opus-atlas.jpeg'
        : 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
    alt: content.imageAlt,
  };

  const imageDimensions =
    imageSize === 'large'
      ? { width: 1200, height: 630 }
      : { width: 400, height: 400 };

  // URL base baseada no idioma
  const baseUrl =
    language === 'pt' ? 'https://opusatlas.com.br' : 'https://opusatlas.com';

  return {
    title: title || content.defaultTitle,
    description: description || content.defaultDescription,
    keywords: [...content.defaultKeywords, ...keywords],
    authors: [{ name: 'Opus Atlas Team' }],
    creator: 'Opus Atlas',

    openGraph: {
      title: title || content.ogTitle,
      description: description || content.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: canonical || baseUrl,
      siteName: 'Opus Atlas',
      images: [
        {
          url: imageConfig.url,
          ...imageDimensions,
          alt: imageConfig.alt,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: title || content.ogTitle,
      description: description || content.ogDescription,
      images: [imageConfig.url],
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
      canonical: canonical || baseUrl,
      languages: {
        'pt-BR': 'https://opusatlas.com.br',
        'en-US': 'https://opusatlas.com',
      },
    },

    verification: {
      google: 'XC9v3XyFFCT6IhoCOH1QaahKLju232tXhlZDCcNEiFU',
    },
  };
}

// Função para páginas específicas que querem manter sua própria configuração
export function generatePageMetadata(
  language: 'pt' | 'en',
  pageConfig: MetadataConfig & {
    route?: string;
  }
): Metadata {
  const { route, ...config } = pageConfig;

  const baseUrl =
    language === 'pt' ? 'https://opusatlas.com.br' : 'https://opusatlas.com';

  const canonical = route ? `${baseUrl}${route}` : undefined;

  return generateDefaultMetadata(language, {
    ...config,
    canonical,
  });
}
