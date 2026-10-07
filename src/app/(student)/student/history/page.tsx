import type { Metadata } from 'next';
import { HistoryScreen } from '@/app/components/Portal/screens/HistoryScreen';

export const metadata: Metadata = { title: 'Histórico' };

export default function HistoryPage() {
  return <HistoryScreen role="student" />;
}
