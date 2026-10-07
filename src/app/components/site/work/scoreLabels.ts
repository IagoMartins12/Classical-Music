import { scoreSource } from '@/app/conteudo/site/scoreSources';
import type { WorkCopy } from '@/app/conteudo/site/work';
import type {
  ScoreEdition,
  ScoreFile,
} from '@/app/requests/work-score-library';
import type { SelectedWorkScore } from '@/app/stores/useLearningModalStore';
import type { ScoreFavoriteTarget } from '../FavoriteHeart';

/** The edition box's heading: publisher, else "Edition n"; source and license below. */
export function editionCard(
  edition: ScoreEdition,
  number: number,
  language: 'pt' | 'en',
  copy: WorkCopy['scores']
) {
  const source = scoreSource(edition.source);
  return {
    title: edition.publisher || copy.edition(number),
    detail: [
      edition.editor && copy.editor(edition.editor),
      source.license[language],
    ]
      .filter(Boolean)
      .join(' · '),
    source,
  };
}

export const scoreFavorite = (
  workId: string,
  file: ScoreFile
): ScoreFavoriteTarget => ({
  workId,
  source: file.source,
  data: {
    title: file.title,
    type: file.type,
    downloadUrl: file.downloadUrl,
    fileSize: file.fileSize,
    pageCount: file.pageCount,
    fileFormat: file.fileFormat,
  },
});

/** The study modal keeps the chosen score in its own shape. */
export const toSelectedScore = (file: ScoreFile): SelectedWorkScore => ({
  id: file.id,
  sourceId: file.sourceId,
  source: file.source as SelectedWorkScore['source'],
  title: file.title,
  downloadUrl: file.downloadUrl ?? undefined,
  thumbnailUrl: file.thumbnailUrl ?? undefined,
  fileSize: file.fileSize ?? undefined,
  pageCount: file.pageCount ?? undefined,
  fileFormat: file.fileFormat,
  type: file.type,
  editor: file.editor ?? undefined,
  publisher: file.publisher ?? undefined,
});
