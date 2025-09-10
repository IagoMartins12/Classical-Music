// app/(main)/layout.tsx - SEM html, head, body
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import AdsProvider from '../components/Ads/AdsProvider';
import { getServerLanguageStatic } from '../utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Opus Atlas - Enciclopédia de Música Clássica',
      description:
        'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa. Descubra compositores, obras e desenvolva suas habilidades musicais.',
      keywords: [
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
    },
    en: {
      title: 'Opus Atlas - Classical Music Encyclopedia',
      description:
        'Explore, learn, and practice classical music with our interactive encyclopedia. Discover composers, works, and improve your musical skills.',
      keywords: [
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
    },
  };

  const t = content[language] || content.pt;

  return {
    title: {
      template: `%s | Opus Atlas`,
      default: t.title,
    },
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br'
          : 'https://opusatlas.com',
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt: 'Opus Atlas - Classical Music Encyclopedia',
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
          ? 'https://opusatlas.com.br'
          : 'https://opusatlas.com',
      languages: {
        'pt-BR': 'https://opusatlas.com.br',
        'en-US': 'https://opusatlas.com',
      },
    },
  };
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdsProvider>
      <FavoritesProvider>
        <div className="min-h-screen">
          <Navbar />
          <main>{children}</main>
          <Footer />

          {/* Toaster para área pública */}
          <Toaster
            position="top-center"
            containerClassName="toast-container"
            toastOptions={{
              duration: 4000,
              className: 'toast-item',
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                backdropFilter: 'blur(8px)',
                maxWidth: '400px',
              },
              success: {
                iconTheme: {
                  primary: 'var(--accent-green)',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid var(--accent-green)',
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--accent-red)',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid var(--accent-red)',
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
                },
              },
              loading: {
                iconTheme: {
                  primary: 'var(--brand-primary)',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid var(--brand-primary)',
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
                },
              },
            }}
          />
        </div>
      </FavoritesProvider>
    </AdsProvider>
  );
}
