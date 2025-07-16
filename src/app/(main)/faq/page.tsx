import FAQPage from './pageClient';

export const metadata = {
  title: 'Perguntas Frequentes - Classical Hub',
  description:
    'Encontre respostas rápidas para as dúvidas mais comuns sobre o Classical Hub, suas funcionalidades e como usar a plataforma.',
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
    title: 'FAQ - Perguntas Frequentes | Classical Hub',
    description:
      'Tire suas dúvidas sobre como usar o Classical Hub e suas funcionalidades.',
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
