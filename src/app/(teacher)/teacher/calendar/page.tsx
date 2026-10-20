import type { Metadata } from 'next';
import { CalendarScreen } from '@/app/components/Portal/screens/CalendarScreen';

export const metadata: Metadata = { title: 'Calendário' };

export default function CalendarPage() {
  return <CalendarScreen role="teacher" />;
}
