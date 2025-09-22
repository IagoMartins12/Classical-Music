// app/pageServer.tsx - Enhanced Home Page com Cache Híbrido
import HeroMainPage from '../components/HeroMainPage';
import PopularComposers from '../components/PopularComposers';
import EssentialComposers from '../components/EssentialComposers';
// import {
//   getCachedEpochs,
//   getCachedRecommendedComposers,
//   getCachedTop20FamousComposers,
//   getCachedFeaturedComposer,
//   getCachedRandomDiscoveries,
//   getCachedRecentAdditions,
//   getCachedMusicalFacts,
// } from '../requests/cached-requests/cached-home-functions';

import FeaturedComposer from '../components/FeaturedComposer';
import ComposersByEpoch from '../components/ComposersByEpoch';
import RandomDiscoveries from '../components/RandomDiscoveries';
import RecentAdditions from '../components/RecentAdditions';
import MusicalFacts from '../components/MusicalFacts';
import { TranslationProvider } from '../context/TranslationContext';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '../utils/translations/serverTranslations';
import {
  getRecomendadedComposers,
  getTop20FamousComposers,
} from '../requests/composers';
import {
  getFeaturedComposer,
  getMusicalFacts,
  getRandomDiscoveries,
  getRecentAdditions,
} from '../requests/home-request';
import { getEpochs } from '../actions/auth';

export default async function EnhancedHomePage() {
  console.log('🏠 Loading Enhanced Home Page with Hybrid Cache...');

  // Buscar todos os dados em paralelo com cache híbrido
  // const [
  //   composersData,
  //   recomendadData,
  //   featuredComposer,
  //   epochsData,
  //   randomDiscoveries,
  //   recentComposers,
  //   musicalFacts,
  //   // Dados de tradução (sem cache por enquanto)
  //   language,
  // ] = await Promise.all([
  //   getCachedTop20FamousComposers(), // Cache semanal
  //   getCachedRecommendedComposers(), // Cache semanal
  //   getCachedFeaturedComposer(), // Cache diário (muda a cada 24h)
  //   getCachedEpochs(), // Cache semanal
  //   getCachedRandomDiscoveries(), // Cache de 4h
  //   getCachedRecentAdditions(), // Cache de 30min (atualização frequente)
  //   getCachedMusicalFacts(), // Cache de 4h
  //   getServerLanguageStatic(),
  // ]);

  const [
    composersData,
    recomendadData,
    featuredComposer,
    epochsData,
    randomDiscoveries,
    recentComposers,
    musicalFacts,
    // Dados de tradução (sem cache por enquanto)
    language,
  ] = await Promise.all([
    getTop20FamousComposers(), // Cache semanal
    getRecomendadedComposers(), // Cache semanal
    getFeaturedComposer(), // Cache diário (muda a cada 24h)
    getEpochs(), // Cache semanal
    getRandomDiscoveries(), // Cache de 4h
    getRecentAdditions(), // Cache de 30min (atualização frequente)
    getMusicalFacts(), // Cache de 4h
    getServerLanguageStatic(),
  ]);

  // Carregar traduções (pode ser cacheado futuramente se necessário)
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/home',
  ]);

  console.log('✅ Home Page data loaded successfully');

  return (
    <TranslationProvider language={language} translations={translations}>
      <div className="classical-theme">
        {/* Hero principal */}
        <HeroMainPage />

        {/* Compositores populares - cache semanal */}
        <PopularComposers composersData={composersData} />

        {/* Compositor em destaque - cache diário (muda a cada 24h) */}
        {featuredComposer && <FeaturedComposer composer={featuredComposer} />}

        {/* Explore por período - cache semanal */}
        {epochsData.length > 0 && <ComposersByEpoch epochs={epochsData} />}

        {/* Descobertas aleatórias - cache de 4h */}
        {(randomDiscoveries.composers.length > 0 ||
          randomDiscoveries.works.length > 0) && (
          <RandomDiscoveries
            composers={randomDiscoveries.composers}
            works={randomDiscoveries.works}
          />
        )}

        <div className="hidden md:block">
          {/* Últimas adições - cache de 30min (dados dinâmicos) */}
          {recentComposers.composers.length > 0 &&
            recentComposers.works.length > 0 && (
              <RecentAdditions
                composers={recentComposers.composers}
                works={recentComposers.works}
              />
            )}
        </div>

        {/* Curiosidades musicais - cache de 4h */}
        {musicalFacts.length > 0 && <MusicalFacts facts={musicalFacts} />}

        {/* Compositores essenciais - cache semanal */}
        <EssentialComposers composersData={recomendadData} />
      </div>
    </TranslationProvider>
  );
}
