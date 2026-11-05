/**
 * The cache tag of one work's page, besides `works`: "Atualizar do IMSLP"
 * clears this work alone instead of every work (`workTag` in the API).
 */
export const workTag = (workId: string) => `work:${workId}`;
