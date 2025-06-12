// app/page.tsx - Enhanced Home Page
import HeroMainPage from './components/HeroMainPage';
import PopularComposers from './components/PopularComposers';
import EssentialComposers from './components/EssentialComposers';

import {
  getRecomendadedComposers,
  getTop20FamousComposers,
} from './requests/composers';

import {
  getFeaturedComposer,
  getEpochsWithComposers,
  getRandomDiscoveries,
  getRecentAdditions,
  getMusicalFacts,
} from './requests/home-request';
import FeaturedComposer from './components/FeaturedComposer';
import ComposersByEpoch from './components/ComposersByEpoch';
import RandomDiscoveries from './components/RandomDiscoveries';
import RecentAdditions from './components/RecentAdditions';
import MusicalFacts from './components/MusicalFacts';

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
    getEpochsWithComposers(),
    getRandomDiscoveries(),
    getRecentAdditions(),
    getMusicalFacts(),
  ]);

  return (
    <div className="classical-theme">
      {/* Hero principal */}
      <HeroMainPage />

      {/* Compositores populares (existente) */}
      <PopularComposers composersData={composersData} />

      {/* Compositor em destaque (novo) */}
      {featuredComposer && <FeaturedComposer composer={featuredComposer} />}

      {/* Explore por período (novo) */}
      {epochsData.length > 0 && <ComposersByEpoch epochs={epochsData} />}

      {/* Compositores essenciais (existente) */}
      <EssentialComposers composersData={recomendadData} />

      {/* Descobertas aleatórias (novo) */}
      {(randomDiscoveries.composers.length > 0 ||
        randomDiscoveries.works.length > 0) && (
        <RandomDiscoveries discoveries={randomDiscoveries} />
      )}
      {/* Últimas adições (novo) */}
      {recentComposers.length > 0 && (
        <RecentAdditions composers={recentComposers} />
      )}

      {/* Curiosidades musicais (novo) */}
      {musicalFacts.length > 0 && <MusicalFacts facts={musicalFacts} />}
    </div>
  );
}

// Exportar também os tipos para uso em outros componentes
export type {} from // Types para os novos componentes
'./requests/home-components';
