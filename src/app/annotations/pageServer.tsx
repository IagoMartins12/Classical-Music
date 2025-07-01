// app/annotations/pageServer.tsx
import {
  getCurrentUserAnnotations,
  getUserAnnotationStats,
  getUserTopAnnotations,
  getUserMostAnnotatedWorks,
} from '../requests/user-annotations';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';
import AnnotationsPageClient from '../components/Annotations/AnnotationsPageClient';

export default async function AnnotationsPageServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Carregar dados das anotações em paralelo para máxima performance
  const [annotationsData, stats, topAnnotations, mostAnnotatedWorks] =
    await Promise.all([
      getCurrentUserAnnotations(),
      getUserAnnotationStats(session.user.id),
      getUserTopAnnotations(session.user.id, 5),
      getUserMostAnnotatedWorks(session.user.id, 5),
    ]);

  return (
    <AnnotationsPageClient
      initialData={{
        ...annotationsData,
        stats,
        topAnnotations,
        mostAnnotatedWorks,
      }}
    />
  );
}
