// components/onboarding/InstrumentsStep.tsx
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

import { useTranslation } from '@/app/hooks/useTranslation';
import { translateInstrument } from '@/app/utils/translations/instrumentsGenresTranslation';
import { useLanguageStore } from '@/app/stores/useLanguageStore';
import Select from '../../Common/Select';
import Checkbox from '../../Common/Checkbox';

interface Instrument {
  id: string;
  name: string;
  category?: string | null;
}

interface SelectedInstrument {
  id: string;
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPrimary: boolean;
  isLearning: boolean;
}

interface InstrumentsStepProps {
  instruments: Instrument[];
}

const InstrumentsStep: React.FC<InstrumentsStepProps> = ({ instruments }) => {
  const { data, updateData } = useOnboardingModal();
  const { t } = useTranslation({ sections: ['components/onboarding'] });
  const { language } = useLanguageStore();

  const EXPERIENCE_LEVELS = [
    { value: 'BEGINNER', label: t('instruments_step_level_beginner') },
    { value: 'INTERMEDIATE', label: t('instruments_step_level_intermediate') },
    { value: 'ADVANCED', label: t('instruments_step_level_advanced') },
  ];

  // Filter instruments
  const selectedInstruments = data.instruments || [];

  // Traduzir instrumentos para exibição
  const translatedInstruments = instruments.map((instrument) => ({
    ...instrument,
    displayName: translateInstrument(instrument.name, language),
  }));

  const addInstrument = (instrument: Instrument) => {
    const newInstrument: SelectedInstrument = {
      id: instrument.id,
      name: instrument.name, // Salvar nome original em português
      level: 'BEGINNER',
      isPrimary: selectedInstruments.length === 0, // First instrument is primary
      isLearning: true,
    };

    updateData({
      instruments: [...selectedInstruments, newInstrument],
    });
  };

  const removeInstrument = (instrumentId: string) => {
    const updated = selectedInstruments.filter(
      (inst) => inst.id !== instrumentId
    );

    // If we removed the primary instrument, make the first one primary
    if (updated.length > 0 && !updated.some((inst) => inst.isPrimary)) {
      updated[0].isPrimary = true;
    }

    updateData({ instruments: updated });
  };

  const updateInstrument = (
    instrumentId: string,
    updates: Partial<SelectedInstrument>
  ) => {
    const updated = selectedInstruments.map((inst) => {
      if (inst.id === instrumentId) {
        return { ...inst, ...updates };
      }
      return inst;
    });

    // If setting as primary, remove primary from others
    if (updates.isPrimary) {
      updated.forEach((inst) => {
        if (inst.id !== instrumentId) {
          inst.isPrimary = false;
        }
      });
    }

    updateData({ instruments: updated });
  };

  const isNotMusicStudent = data.userType === 'CASUAL_USER';
  const isInstrumentSelected = (instrumentId: string) => {
    return selectedInstruments.some((inst) => inst.id === instrumentId);
  };

  return (
    <div className="py-6">
      {isNotMusicStudent ? (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
            {t('instruments_step_title_casual')}
          </h3>
          <p className="text-theme-secondary max-w-lg mx-auto">
            {t('instruments_step_subtitle_casual')}
          </p>
        </div>
      ) : (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
            {t('instruments_step_title_student')}
          </h3>
          <p className="text-theme-secondary max-w-lg mx-auto">
            {t('instruments_step_subtitle_student')}
          </p>
        </div>
      )}

      {/* Selected Instruments */}
      {selectedInstruments.length > 0 && (
        <div className="mb-8">
          <h4 className="font-semibold text-theme-primary mb-4">
            {t('instruments_step_your_instruments')} (
            {selectedInstruments.length})
          </h4>

          <div className="space-y-3">
            {selectedInstruments.map((instrument) => (
              <div
                key={instrument.id}
                className="classical-card-2 p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {isNotMusicStudent ? (
                      <span className=" py-1 text-end bg-brand-primary  text-theme-primary classical-subtitle rounded-full">
                        {t('instruments_step_instrument_label')}{' '}
                        <span className="font-medium text-sm pl-2 text-theme-primary">
                          {translateInstrument(instrument.name, language)}
                        </span>
                      </span>
                    ) : (
                      <></>
                    )}
                    {instrument.isPrimary && !isNotMusicStudent ? (
                      <span className=" py-1 text-end bg-brand-primary  text-theme-primary classical-subtitle rounded-full">
                        {t('instruments_step_main_instrument_label')}{' '}
                        <span className="font-medium text-sm pl-2 text-theme-primary">
                          {translateInstrument(instrument.name, language)}
                        </span>
                      </span>
                    ) : (
                      <>
                        {!isNotMusicStudent && (
                          <span className=" py-1 text-end bg-brand-primary  text-theme-primary classical-subtitle rounded-full">
                            {t('instruments_step_instrument_label')}{' '}
                            <span className="font-medium text-sm pl-2 text-theme-primary">
                              {translateInstrument(instrument.name, language)}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {!isNotMusicStudent && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center gap-4">
                        <span>{t('instruments_step_select_level')}</span>
                        <Select
                          value={instrument.level}
                          onChange={(e) =>
                            updateInstrument(instrument.id, {
                              level: e.target.value as any,
                            })
                          }
                          options={EXPERIENCE_LEVELS}
                          className="text-sm"
                        />
                      </div>

                      <Checkbox
                        label={t('instruments_step_primary_label')}
                        type="checkbox"
                        checked={instrument.isPrimary}
                        onChange={(e) =>
                          updateInstrument(instrument.id, {
                            isPrimary: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeInstrument(instrument.id)}
                  className="p-2 text-theme-tertiary hover:text-accent-red transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Instruments */}
      <div className="grid grid-cols-1 py-1 px-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto overflow-x-hidden classical-scrollbar">
        {translatedInstruments.map((instrument) => (
          <button
            key={instrument.id}
            onClick={() => addInstrument(instrument)}
            disabled={isInstrumentSelected(instrument.id)}
            className={`
              classical-card-2 p-3 text-left transition-all duration-200
              ${
                isInstrumentSelected(instrument.id)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 hover:border-brand-primary'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-theme-primary">
                {instrument.displayName}
              </span>
              {!isInstrumentSelected(instrument.id) && (
                <FiPlus className="w-4 h-4 text-brand-primary" />
              )}
            </div>
            {instrument.category && (
              <span className="text-xs text-theme-tertiary">
                {instrument.category}
              </span>
            )}
          </button>
        ))}
      </div>

      {translatedInstruments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-theme-secondary">
            {t('instruments_step_no_instruments')}
          </p>
        </div>
      )}
    </div>
  );
};

export default InstrumentsStep;
