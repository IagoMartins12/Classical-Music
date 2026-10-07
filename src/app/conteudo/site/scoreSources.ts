import type { Idioma } from '../legal/tipos';

/**
 * Where a score comes from. Each `WorkScore.source` maps to one badge; a new
 * source (a publisher partnership, another library) is one more entry here.
 * Unknown sources fall back to their raw name.
 */
export interface ScoreSource {
  label: string;
  /** Uploaded on Opus Atlas by a person (shown in its own section). */
  community: boolean;
  license: Record<Idioma, string>;
}

const OPUS_ATLAS: ScoreSource = {
  label: 'Opus Atlas',
  community: true,
  license: { pt: 'Envio da comunidade', en: 'Community upload' },
};

export const SCORE_SOURCES: Record<string, ScoreSource> = {
  IMSLP: {
    label: 'IMSLP',
    community: false,
    license: { pt: 'Domínio público', en: 'Public domain' },
  },
  UPLOAD: OPUS_ATLAS,
  CUSTOM: OPUS_ATLAS,
};

export const scoreSource = (key: string): ScoreSource =>
  SCORE_SOURCES[key] ?? {
    label: key,
    community: false,
    license: { pt: '', en: '' },
  };
