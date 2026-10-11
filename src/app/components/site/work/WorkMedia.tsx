'use client';

import dynamic from 'next/dynamic';
import VideoAulaSection from '@/app/components/Players/VideoAulaSection';
import { useSession } from '@/app/libs/session';
import type { WorkDetails } from '@/app/requests/work-page-details';
import { canEditCatalog } from '@/app/utils/permissions';

const AnnotationsSection = dynamic(
  () => import('@/app/components/Annotations/AnnotationsSection')
);

/** Who may fix the media: curators and whoever created the work. */
function useCanEditMedia(work: WorkDetails) {
  const { data: session } = useSession();
  const curator = canEditCatalog(session?.user);
  return {
    canEdit:
      curator || (!!work.createdBy && work.createdBy === session?.user?.id),
  };
}

/** The video lesson: the last block of the work page. */
export function WorkVideoLesson({ work }: { work: WorkDetails }) {
  const { canEdit } = useCanEditMedia(work);
  return (
    <VideoAulaSection
      canEditMedia={canEdit}
      work={{
        id: work.id,
        title: work.title,
        composer: { fullName: work.composer.fullName },
        videoAulaUrl: work.videoAulaUrl ?? undefined,
        videoAulaFile: work.videoAulaFile ?? undefined,
        videoAulaTitle: work.videoAulaTitle ?? undefined,
        videoAulaType: work.videoAulaType ?? undefined,
        videoAulaSource: work.videoAulaSource ?? undefined,
        videoAulaAddedBy: work.videoAulaAddedBy ?? undefined,
        videoAulaAddedAt: work.videoAulaAddedAt ?? undefined,
        videoAulaMetadata: work.videoAulaMetadata ?? undefined,
      }}
    />
  );
}

export function WorkAnnotations({ work }: { work: WorkDetails }) {
  return (
    <AnnotationsSection
      workId={work.id}
      workTitle={work.title}
      composerName={work.composer.fullName}
    />
  );
}
