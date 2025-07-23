// app/contact/page.tsx - Contato

import ContactPage from './pageClient';

export const metadata = {
  title: 'Entre em Contato - Opus Atlas',
  description:
    'Fale conosco! Nossa equipe está pronta para ajudar com suporte, parcerias, moderação e questões técnicas.',
  keywords: [
    'contato',
    'suporte',
    'atendimento',
    'ajuda',
    'fale conosco',
    'parceria',
    'moderação',
  ],
  openGraph: {
    title: 'Contato | Opus Atlas',
    description: 'Entre em contato com nossa equipe de suporte especializada.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function ContactPageRoute() {
  return <ContactPage />;
}
