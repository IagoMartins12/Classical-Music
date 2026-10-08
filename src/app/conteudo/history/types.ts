import type { EraKey } from '../site/eras';

/**
 * One chapter of the history of music. Written by hand, in Portuguese and
 * English, as versioned data: the pages render it, nothing generates it.
 */
export interface EraChapter {
  key: EraKey;
  /** The opening, in display type. Two or three sentences. */
  lede: string;
  /** The story of the era, in order. */
  story: string[];
  /** What the ear notices first, for someone hearing it cold. */
  sound: string;
  /** What changed, each with its own short explanation. */
  changes: { title: string; text: string }[];
  /** The forms of the era, each explained in a line. */
  forms: { name: string; text: string }[];
  instruments: string[];
  /** Where to start listening, with what to listen for. */
  listenFirst: { composer: string; work: string; note: string }[];
  didYouKnow: string[];
}
