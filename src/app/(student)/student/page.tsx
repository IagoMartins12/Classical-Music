import type { Metadata } from 'next';
import { StudentDashboard } from '@/app/components/Portal/screens/StudentDashboard';

export const metadata: Metadata = { title: 'Painel' };

export default function StudentPage() {
  return <StudentDashboard />;
}
