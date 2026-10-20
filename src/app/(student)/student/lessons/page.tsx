import type { Metadata } from 'next';
import { LessonsScreen } from '@/app/components/Portal/screens/LessonsScreen';

export const metadata: Metadata = { title: 'Aulas' };

export default function LessonsPage() {
  return <LessonsScreen role="student" />;
}
