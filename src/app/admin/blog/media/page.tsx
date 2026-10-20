import type { Metadata } from 'next';
import MidiaDoBlog from '@/app/components/Admin/telas/MidiaDoBlog';

export const metadata: Metadata = { title: 'Mídia do blog' };

export default function MidiaPage() {
  return <MidiaDoBlog />;
}
