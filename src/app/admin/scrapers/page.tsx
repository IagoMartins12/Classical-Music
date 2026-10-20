import type { Metadata } from 'next';
import EventosImportados from '@/app/components/Admin/telas/EventosImportados';

export const metadata: Metadata = { title: 'Eventos importados' };

export default function EventosPage() {
  return <EventosImportados />;
}
