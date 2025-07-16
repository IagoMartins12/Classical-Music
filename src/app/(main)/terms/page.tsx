// app/terms/page.tsx - Termos de Uso

import TermsPage from './pageClient';

export const metadata = {
  title: 'Termos de Uso - Classical Hub',
  description:
    'Conheça os termos que regem o uso do Classical Hub, nossa comunidade musical e sistema de uploads.',
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
    title: 'Termos de Uso | Classical Hub',
    description: 'Termos e condições de uso da plataforma Classical Hub.',
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
