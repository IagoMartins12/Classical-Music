// app/instruments/page.tsx
import { Metadata } from 'next';
import { InstrumentsPageServer } from './InstrumentsPageServer';

export const metadata: Metadata = {
  title: 'Instrumentos Históricos | Enciclopédia Musical',
  description:
    'Explore a rica história e evolução dos instrumentos clássicos que moldaram a música ao longo dos séculos.',
  keywords: [
    'instrumentos musicais',
    'história da música',
    'piano',
    'violino',
    'órgão',
    'violoncelo',
    'harpa',
    'música clássica',
  ],
  openGraph: {
    title: 'Instrumentos Históricos | Enciclopédia Musical',
    description:
      'Descubra a fascinante história dos instrumentos musicais clássicos e explore obras icônicas.',
    type: 'website',
    // images: [
    //   {
    //     url: '/instruments/hero-instruments.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Instrumentos Musicais Históricos',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instrumentos Históricos | Enciclopédia Musical',
    description:
      'Explore a história dos instrumentos que definiram a música clássica.',
    // images: ['/instruments/hero-instruments.jpg'],
  },
};

export default function InstrumentsPage() {
  return <InstrumentsPageServer />;
}

// Force static generation during build time for better performance
export const revalidate = 3600; // Revalidate every hour
