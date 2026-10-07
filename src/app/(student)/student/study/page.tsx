import type { Metadata } from 'next';
import { StudyScreen } from '@/app/components/Portal/screens/StudyScreen';

export const metadata: Metadata = { title: 'Estudo' };

export default function StudyPage() {
  return <StudyScreen />;
}
