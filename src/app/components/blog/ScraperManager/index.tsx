'use client';

import { useState } from 'react';
import { FiPlay, FiMapPin } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import { AnimatedCard } from '@/app/components/animation/AnimatedComponents';
import { getEnabledScrapers } from '@/app/services/scraper-api/scappers/base-scraper.config';
import EventScraperModal from '../EventScraperModal';

export default function ScraperManager() {
  const [showModal, setShowModal] = useState(false);
  const [selectedScraperId, setSelectedScraperId] = useState<string>('');

  const scrapers = getEnabledScrapers();

  const handleRunScraper = (scraperId: string) => {
    setSelectedScraperId(scraperId);
    setShowModal(true);
  };

  return (
    <>
      {/* Grid de Scrapers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scrapers.map((scraper) => (
          <AnimatedCard
            key={scraper.id}
            className="classical-card-simple p-6 cursor-pointer transition-all hover:border-brand-primary hover:shadow-theme-glow"
            onClick={() => handleRunScraper(scraper.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{scraper.icon}</div>
              <Button size="sm" variant="primary" leftIcon={<FiPlay />}>
                Executar
              </Button>
            </div>

            <h4 className="font-bold text-theme-primary mb-1">
              {scraper.name}
            </h4>
            <p className="text-sm text-theme-secondary mb-2">
              {scraper.description}
            </p>
            <div className="flex items-center text-xs text-theme-tertiary">
              <FiMapPin className="w-3 h-3 mr-1" />
              {scraper.venue}
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Modal Reutilizável */}
      <EventScraperModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultScraperId={selectedScraperId}
      />
    </>
  );
}
