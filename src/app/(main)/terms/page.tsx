// app/terms/page.tsx - Termos de Uso

import TermsPage from './pageClient';

export const metadata = {
  title: 'Termos de Uso - Opus Atlas',
  description:
    'Conheça os termos que regem o uso do Opus Atlas, nossa comunidade musical e sistema de uploads.',
  keywords: [
    'termos de uso',
    'termos legais',
    'regras',
    'políticas',
    'uploads',
    'moderação',
    'comunidade',
  ],
  openGraph: {
    title: 'Termos de Uso | Opus Atlas',
    description: 'Termos e condições de uso da plataforma Opus Atlas.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function TermsPageRoute() {
  return <TermsPage />;
}
