// app/requests/cached-requests/cached-home-functions.ts
//
// Os blocos da home vêm da API (Etapa 3), com o cache do `fetch` do Next por
// tag — que a API limpa quando o dado muda. O cache híbrido no Redis do front
// saiu daqui: guardava os compositores por uma semana, onde a revalidação por
// tag não chegava. Os nomes ficaram para a página não mudar.
import {
  getFeaturedComposer,
  getMusicalFacts,
  getRandomDiscoveries,
  getRecentAdditions,
} from '../home-request';
import {
  getEpochsCache,
  getRecomendadedComposers,
  getTop20FamousComposers,
} from '../composers';

export const getCachedFeaturedComposer = () => getFeaturedComposer();

export const getCachedRecentAdditions = () => getRecentAdditions();

export const getCachedRandomDiscoveries = () => getRandomDiscoveries();

export const getCachedMusicalFacts = () => getMusicalFacts();

export const getCachedEpochs = () => getEpochsCache();

export const getCachedTop20FamousComposers = () => getTop20FamousComposers();

export const getCachedRecommendedComposers = () => getRecomendadedComposers();
