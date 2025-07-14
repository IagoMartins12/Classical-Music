// app/study/[workId]/[[...scoreId]]/StudyModeServer.tsx
import { notFound } from 'next/navigation';

import { getWorkById } from '@/app/requests/work-page-details';
import {
  getActiveStudySession,
  getUserStudySettings,
} from '@/app/requests/study-requests';
import StudyModeClient from '@/app/components/StudyModePage/StudyModeClient';

interface StudyModeServerProps {
  workId: string;
  scoreId?: string;
  userId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function StudyModeServer({
  workId,
  scoreId,
  userId,
  searchParams,
}: StudyModeServerProps) {
  try {
    // Carregar dados necessários em paralelo
    const [work, userSettings, activeSession] = await Promise.all([
      getWorkById(workId),
      getUserStudySettings(userId),
      getActiveStudySession(userId, workId),
    ]);

    if (!work) {
      notFound();
    }

    return (
      <StudyModeClient
        work={work}
        scoreId={scoreId}
        userId={userId}
        userSettings={userSettings}
        activeSession={activeSession}
        searchParams={searchParams}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar modo estudo:', error);
    notFound();
  }
}
