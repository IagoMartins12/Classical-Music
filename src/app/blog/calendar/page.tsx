// app/blog/calendar/page.tsx

import { Metadata } from 'next';
import CalendarPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Calendário de Eventos | Blog - Opus Atlas',
  description:
    'Explore eventos de música clássica em todo o Brasil. Concertos, óperas, recitais e muito mais.',
  keywords: [
    'calendário eventos',
    'música clássica',
    'concertos',
    'ópera',
    'recitais',
    'agenda cultural',
    'eventos musicais',
  ],
  openGraph: {
    title: 'Calendário de Eventos - Música Clássica',
    description: 'Descubra eventos de música clássica em todo o Brasil',
    type: 'website',
  },
};

export default function CalendarPage() {
  return <CalendarPageServer />;
}
