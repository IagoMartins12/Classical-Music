// app/support/page.tsx - Suporte Técnico

import SupportPage from './pageClient';

export const metadata = {
  title: 'Suporte Técnico - Opus Atlas',
  description:
    'Soluções rápidas para problemas técnicos, status do sistema e suporte especializado para questões da plataforma.',
  keywords: [
    'suporte técnico',
    'problemas técnicos',
    'bugs',
    'sistema',
    'status',
    'resolução',
    'troubleshooting',
  ],
  openGraph: {
    title: 'Suporte Técnico | Opus Atlas',
    description: 'Suporte especializado para resolver problemas técnicos.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function SupportPageRoute() {
  return <SupportPage />;
}
