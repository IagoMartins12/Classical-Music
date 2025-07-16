// app/about-us/page.tsx - Sobre Nós (se você quiser atualizar)

import AboutPage from './pageClient';

export const metadata = {
  title: 'Sobre Nós - Classical Hub',
  description:
    'Conheça a missão do Classical Hub: democratizar o acesso à música clássica através de uma plataforma educacional completa e inovadora.',
  keywords: [
    'sobre',
    'missão',
    'visão',
    'valores',
    'equipe',
    'história',
    'educação musical',
  ],
  openGraph: {
    title: 'Sobre o Classical Hub',
    description:
      'Conheça nossa missão de democratizar o acesso à música clássica.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function AboutPageRoute() {
  return <AboutPage />;
}
