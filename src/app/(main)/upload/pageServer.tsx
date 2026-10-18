import { PersonalPage } from '@/app/components/site/personal/PersonalPage';
import { UploadsView } from '@/app/components/site/personal/UploadsView';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { getMyUploads } from '@/app/requests/my-uploads';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

const ITEMS_PER_PAGE = 24;
const KINDS = ['composer', 'work', 'score'] as const;

/**
 * "Your uploads". The list is read on the server for the tab, search and
 * page in the URL; "All" brings a few of each kind. The upload forms still
 * read the `pages/uploads` dictionary, hence the provider.
 */
export default async function UploadsPageServer({
  page,
  search,
  type,
  epochId,
  composerId,
  workId,
}: {
  page: number;
  search: string;
  type: string;
  epochId: string;
  composerId?: string;
  workId?: string;
  userId: string;
  userRole: number;
}) {
  const tab = (KINDS as readonly string[]).includes(type)
    ? (type as (typeof KINDS)[number])
    : 'all';
  const language = await getServerLanguageStatic();
  const uploads = await getMyUploads({
    page,
    limit: ITEMS_PER_PAGE,
    search,
    type: tab,
    epochId,
    composerId,
    workId,
    limitPerType: tab === 'all',
  });
  const counts = {
    total: uploads.composerCount + uploads.workCount + uploads.scoreCount,
    composer: uploads.composerCount,
    work: uploads.workCount,
    score: uploads.scoreCount,
  };
  const copy = PERSONAL[language].uploads;

  return (
    <PersonalPage title={copy.title} description={copy.text}>
      <UploadsView
        tab={tab}
        search={search}
        data={{
          items: uploads.items,
          counts,
          page,
          pages:
            tab === 'all'
              ? 1
              : Math.max(1, Math.ceil(counts[tab] / ITEMS_PER_PAGE)),
        }}
      />
    </PersonalPage>
  );
}
