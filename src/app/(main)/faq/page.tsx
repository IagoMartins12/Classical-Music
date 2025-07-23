import FAQPage from './pageClient';

export const metadata = {
  title: 'Perguntas Frequentes - Opus Atlas',
  description:
    'Encontre respostas rápidas para as dúvidas mais comuns sobre o Opus Atlas, suas funcionalidades e como usar a plataforma.',
  keywords: [
    'FAQ',
    'perguntas frequentes',
    'ajuda',
    'dúvidas',
    'tutorial',
    'como usar',
    'suporte',
  ],
  openGraph: {
    title: 'FAQ - Perguntas Frequentes | Opus Atlas',
    description:
      'Tire suas dúvidas sobre como usar o Opus Atlas e suas funcionalidades.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function FAQPageRoute() {
  return <FAQPage />;
}
