import type { Metadata } from 'next';
import { TOKENS, type TokensCopy } from '@/app/conteudo/site/tokens';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

type Section = {
  [K in keyof TokensCopy]: TokensCopy[K] extends { meta: string } ? K : never;
}[keyof TokensCopy];

/** E-mail link pages carry a one-time token: never indexed, never followed. */
export async function tokenMetadata(section: Section): Promise<Metadata> {
  const language = await getServerLanguageStatic();
  return {
    title: `${TOKENS[language][section].meta} · Opus Atlas`,
    robots: { index: false, follow: false },
  };
}
