// app/privacy/page.tsx - Política de Privacidade

import PrivacyPage from './pageClient';

export const metadata = {
  title: 'Política de Privacidade - Classical Hub',
  description:
    'Conheça como protegemos seus dados e respeitamos sua privacidade no Classical Hub. Informações sobre coleta, uso e proteção de dados.',
  keywords: [
    'privacidade',
    'proteção de dados',
    'LGPD',
    'cookies',
    'segurança',
    'dados pessoais',
  ],
  openGraph: {
    title: 'Política de Privacidade | Classical Hub',
    description: 'Como protegemos seus dados e respeitamos sua privacidade.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}
