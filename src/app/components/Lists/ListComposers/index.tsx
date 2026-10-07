// app/components/Lists/ListComposers.tsx - Updated with sophisticated design and theme system
'use client';

import React, { useState } from 'react';
import { PiCaretDown, PiMusicNotes, PiUsers } from 'react-icons/pi';
import ListComposersCards from '../Cards/ListComposersCard';
import { composerHomeProps } from '../../PopularComposers';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useTranslation } from '@/app/context/TranslationContext';
import { useIsMobile } from '@/app/hooks/useMobile';
import { Text } from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

interface listComposersProps {
  composers: composerHomeProps[];
}

const ListComposers: React.FC<listComposersProps> = ({ composers }) => {
  const [activeComposerId, setActiveComposerId] = useState<string | null>(null);
  // Abre com 12; "carregar mais" mostra todos de uma vez (pedido do dono,
  // 01/10). A lista já veio inteira do servidor: não há o que esperar.
  const [visibleCount, setVisibleCount] = useState(12);
  const { t } = useTranslation({ sections: ['pages/home'] });

  const { navigateToUrl } = useNavigate();

  const handleLoadMore = () => setVisibleCount(composers.length);

  const visibleComposers = composers.slice(0, visibleCount);

  const isMobile = useIsMobile();
  return (
    <div className="relative">
      {/* Header stats */}

      {/* Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {visibleComposers.map((composer, index) => (
          <div
            key={composer.id}
            className="animate-fade-in-up"
            style={{
              // Cascata por leva de 12: com a lista inteira aberta, o último
              // compositor esperaria segundos para aparecer.
              animationDelay: `${(index % 12) * 0.05}s`,
              animationFillMode: 'backwards',
            }}
            onMouseEnter={() => setActiveComposerId(composer.id)}
            onMouseLeave={() => setActiveComposerId(null)}
          >
            <ListComposersCards
              composer={composer}
              isActive={activeComposerId === composer.id}
              isMobile={isMobile}
            />
          </div>
        ))}
      </div>

      {/* Action Buttons Section */}
      <div className="mt-12 text-center">
        {visibleCount < composers.length ? (
          <div className="gap-4 flex flex-col">
            {/* Load More Button */}
            <Button
              className="self-center"
              variante="primario"
              icone={PiCaretDown}
              onClick={handleLoadMore}
            >
              {t('loading_more_composers')}
            </Button>

            {/* Progress info */}
            <Text papel="rotulo" tom="fraco" as="p">
              {t('more')} {composers.length - visibleCount}{' '}
              {t('composers_avaliable')}
            </Text>
          </div>
        ) : (
          <div className="gap-6 flex flex-col">
            {/* Completion message */}
            <Card className="max-w-md mx-auto w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-theme-glow">
                  <PiMusicNotes className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-theme-primary classical-title mb-2">
                {t('all_composers_show')}
              </h4>
              <Text papel="rotulo" tom="suave" as="p" className="mb-4">
                {t('composers_explored')} {composers.length}{' '}
                {t('collection_composers')}
              </Text>
            </Card>

            {/* See All Button */}
            <Button
              className="self-center"
              variante="secundario"
              type="submit"
              onClick={() => navigateToUrl('composers')}
            >
              <PiUsers className="w-5 h-5 mr-2 inline" />

              {t('see_all_composers')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListComposers;
