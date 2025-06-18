// app/learning/page.tsx
import { Metadata } from 'next';
import { getCurrentUserLearningData } from '@/app/requests/learning';
import LearningPageClient from '../components/LearningPageClient';

export const metadata: Metadata = {
  title: 'Meu Aprendizado | Classical Music App',
  description:
    'Acompanhe seu progresso musical e gerencie suas listas de estudo',
};

export default async function LearningPage() {
  // Buscar dados do servidor (SSR)
  const learningData = await getCurrentUserLearningData();

  return <LearningPageClient initialData={learningData} />;
}
