// app/help/page.tsx - Central de Ajuda

import HelpPage from './pageClient';

export const metadata = {
  title: 'Central de Ajuda - Opus Atlas',
  description:
    'Guias completos, tutoriais em vídeo e dicas para dominar todas as funcionalidades do Opus Atlas.',
  keywords: [
    'ajuda',
    'tutoriais',
    'guias',
    'como usar',
    'modo estudo',
    'anotações',
    'uploads',
    'favoritos',
  ],
  openGraph: {
    title: 'Central de Ajuda | Opus Atlas',
    description: 'Tutoriais e guias para aproveitar ao máximo o Opus Atlas.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function HelpPageRoute() {
  return <HelpPage />;
}
