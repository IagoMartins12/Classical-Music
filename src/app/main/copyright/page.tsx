// app/copyright/page.tsx - Direitos Autorais

import CopyrightPage from './pageClient';

export const metadata = {
  title: 'Direitos Autorais - Opus Atlas',
  description:
    'Como o Opus Atlas respeita e protege direitos autorais. Informações sobre domínio público, IMSLP e processo DMCA.',
  keywords: [
    'direitos autorais',
    'copyright',
    'domínio público',
    'IMSLP',
    'DMCA',
    'partituras legais',
    'propriedade intelectual',
  ],
  openGraph: {
    title: 'Direitos Autorais | Opus Atlas',
    description:
      'Como respeitamos e protegemos direitos autorais na plataforma.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function CopyrightPageRoute() {
  return <CopyrightPage />;
}
