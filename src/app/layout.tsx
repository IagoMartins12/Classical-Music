// app/layout.tsx - Layout raiz atualizado
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientThemeWrapper } from './components/ClientThemeWrapper';
import AuthProvider from './providers/AuthProvider';
import { getServerLanguageStatic } from './utils/translations/serverTranslations';
import { generateDefaultMetadata } from './utils/defaultMetadata';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  return generateDefaultMetadata(language, {
    imageSize: 'large', // Usar imagem grande por padrão
  });
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <meta
          name="google-site-verification"
          content="XC9v3XyFFCT6IhoCOH1NuuhJBju232tXhlZDCcNEiFU"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientThemeWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ClientThemeWrapper>

        {/* Umami Analytics */}
        <Script
          src="https://analytics.opusatlas.com.br/analytics"
          data-website-id="f3475284-e507-4e7e-af4a-3a1ecd932652"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
