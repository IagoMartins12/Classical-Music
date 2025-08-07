// app/(main)/layout.tsx - SEM html, head, body
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthProvider from '../providers/AuthProvider';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import AdsProvider from '../components/Ads/AdsProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | Opus Atlas',
    default: 'Opus Atlas - Enciclopédia de Música Clássica',
  },
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
  authors: [{ name: 'Opus Atlas Team' }],
  creator: 'Opus Atlas',
  openGraph: {
    title: 'Opus Atlas - Enciclopédia de Música Clássica',
    description:
      'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Opus Atlas - Enciclopédia de Música Clássica',
    description:
      'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
