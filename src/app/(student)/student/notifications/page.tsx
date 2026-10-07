import type { Metadata } from 'next';
import { NotificationsScreen } from '@/app/components/Portal/screens/NotificationsScreen';

export const metadata: Metadata = { title: 'Avisos' };

export default function NotificationsPage() {
  return <NotificationsScreen role="student" />;
}
