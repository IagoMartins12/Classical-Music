// app/pageServer.tsx - Enhanced Home Page

import LearningPageClient from '../../components/LearningPageClient';
import { getCurrentUserLearningData } from '../../requests/learning';

export default async function LearningPageServer() {
  const learningData = await getCurrentUserLearningData();

  return <LearningPageClient initialData={learningData} />;
}
