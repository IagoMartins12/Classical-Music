// app/pageServer.tsx - Enhanced Home Page
import HeroMainPage from '../components/HeroMainPage';
import PopularComposers from '../components/PopularComposers';
import EssentialComposers from '../components/EssentialComposers';

import {
  getEpochsCache,
  getRecomendadedComposers,
  getTop20FamousComposers,
} from '../requests/composers';

import {
  getFeaturedComposer,
  getRandomDiscoveries,
  getRecentAdditions,
  getMusicalFacts,
} from '../requests/home-request';
import FeaturedComposer from '../components/FeaturedComposer';
import ComposersByEpoch from '../components/ComposersByEpoch';
import RandomDiscoveries from '../components/RandomDiscoveries';
import RecentAdditions from '../components/RecentAdditions';
import MusicalFacts from '../components/MusicalFacts';
import AdContainer from '../components/Ads/AdContainer';

export default async function EnhancedHomePage() {
  // Buscar todos os dados em paralelo para melhor performance
  const [
    composersData,
    recomendadData,
    featuredComposer,
    epochsData,
    randomDiscoveries,
    recentComposers,
    musicalFacts,
  ] = await Promise.all([
    getTop20FamousComposers(),
    getRecomendadedComposers(),
    getFeaturedComposer(),
    getEpochsCache(),
    getRandomDiscoveries(),
    getRecentAdditions(),
    getMusicalFacts(),
  ]);

  return (
    <div className="classical-theme">
      {/* <AdContainer placement="BETWEEN_CONTENT" className="space-y-4" /> */}

      {/* Hero principal */}
      <HeroMainPage />

      {/* Compositores populares (existente) */}
      <PopularComposers composersData={composersData} />

      {/* Compositor em destaque (novo) */}
      {featuredComposer && <FeaturedComposer composer={featuredComposer} />}

      {/* Explore por período (novo) */}
      {epochsData.length > 0 && <ComposersByEpoch epochs={epochsData} />}

      {/* Descobertas aleatórias (novo) */}
      {(randomDiscoveries.composers.length > 0 ||
        randomDiscoveries.works.length > 0) && (
        <RandomDiscoveries
          composers={randomDiscoveries.composers}
          works={randomDiscoveries.works}
        />
      )}
      {/* Últimas adições (novo) */}
      {recentComposers.composers.length > 0 &&
        recentComposers.works.length > 0 && (
          <RecentAdditions
            composers={recentComposers.composers}
            works={recentComposers.works}
          />
        )}

      {/* Curiosidades musicais (novo) */}
      {musicalFacts.length > 0 && <MusicalFacts facts={musicalFacts} />}

      {/* Compositores essenciais (existente) */}
      <EssentialComposers composersData={recomendadData} />
    </div>
  );
}
