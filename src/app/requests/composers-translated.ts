// app/requests/composers-translated.ts — compositores com a época traduzida
import { Language } from '@/app/stores/useLanguageStore';
import {
  getComposersCount,
  getComposersWithPagination,
  getEpochsCache,
} from './composers';
import type {
  ComposerCardItem,
  CountParams,
  PaginationParams,
} from './composers';
import { translateEpochStatic } from '../utils/translations/epochTranslationComposer';

type ComposerTranslated = ComposerCardItem & {
  translatedEpochName: string | null;
};

// Sem cache próprio: a tradução é um mapa local, e o dado já vem do cache do
// `fetch` em `./composers`.

export async function getEpochsCacheTranslated(language: Language) {
  const epochs = await getEpochsCache();

  return epochs.map((epoch) => ({
    id: epoch.id,
    name: epoch.name,
    translatedName: translateEpochStatic(epoch.name, language),
  }));
}

export async function getComposersWithPaginationTranslated(
  params: PaginationParams,
  language: Language
): Promise<ComposerTranslated[]> {
  const composers = await getComposersWithPagination(params);
  return composers.map((composer) =>
    mapComposerWithTranslatedEpoch(composer, language)
  );
}

export async function getComposersCountTranslated(params: CountParams) {
  return getComposersCount(params);
}

function mapComposerWithTranslatedEpoch(
  composer: ComposerCardItem,
  language: Language
): ComposerTranslated {
  return {
    ...composer,
    translatedEpochName: composer.epochName
      ? translateEpochStatic(composer.epochName, language)
      : null,
  };
}
