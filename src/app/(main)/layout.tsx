import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ClientThemeWrapper } from '../components/ClientThemeWrapper';
import Navbar from '../components/Navbar';
import AuthProvider from '../providers/AuthProvider';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Classical Hub - Enciclopédia de Música Clássica',
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
  authors: [{ name: 'Classical Hub Team' }],
  creator: 'Classical Hub',
  openGraph: {
    title: 'Classical Hub - Enciclopédia de Música Clássica',
    description:
      'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classical Hub - Enciclopédia de Música Clássica',
    description:
      'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0a0a0a"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientThemeWrapper>
          <AuthProvider>
            <FavoritesProvider>
              <Navbar />
              <main>{children}</main>

              {/* Notificações toast otimizadas */}
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
            </FavoritesProvider>
          </AuthProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
