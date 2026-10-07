'use client';

import dynamic from 'next/dynamic';
import MediaSection from '@/app/components/Players/MediaSection';
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
    curator,
    canEdit:
      curator || (!!work.createdBy && work.createdBy === session?.user?.id),
  };
}

/** Recordings (Spotify, YouTube, uploaded audio) and the video lesson. */
export function WorkMedia({ work }: { work: WorkDetails }) {
  const { curator, canEdit } = useCanEditMedia(work);
  return (
    <div className="flex flex-col gap-6">
      <MediaSection work={work} canEditMedia={canEdit} isAdmin={curator} />
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
    </div>
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
