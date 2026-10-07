const YOUTUBE_ID =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

/** The 11-character video id of a YouTube URL, or null. */
export const youtubeId = (url: string | null | undefined) =>
  url?.match(YOUTUBE_ID)?.[1] ?? null;
