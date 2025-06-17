// components/auth/onboarding/InstrumentsStep.tsx
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React, { useState, useMemo } from 'react';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import Button from '../../Common/Button';
import Select from '../../Common/Select';
import Input from '../../Common/Inputs';

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

const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const InstrumentsStep: React.FC<InstrumentsStepProps> = ({ instruments }) => {
  const { data, updateData } = useOnboardingModal();

  // Filter instruments
  const selectedInstruments = data.instruments || [];

  const addInstrument = (instrument: Instrument) => {
    const newInstrument: SelectedInstrument = {
      id: instrument.id,
      name: instrument.name,
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
            Instrumentos de interesse
          </h3>
          <p className="text-theme-secondary max-w-lg mx-auto">
            Selecione os instrumentos que mais despertam seu interesse. Isso nos
            ajuda a recomendar repertório relevante.
          </p>
        </div>
      ) : (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
            Quais instrumentos você toca?
          </h3>
          <p className="text-theme-secondary max-w-lg mx-auto">
            Adicione os instrumentos que você estuda ou tem interesse em
            aprender.
          </p>
        </div>
      )}

      {/* Selected Instruments */}
      {selectedInstruments.length > 0 && (
        <div className="mb-8">
          <h4 className="font-semibold text-theme-primary mb-4">
            Seus instrumentos ({selectedInstruments.length})
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
                      <span className="font-medium text-sm text-theme-primary">
                        Instrumento: {instrument.name}
                      </span>
                    ) : (
                      <></>
                    )}
                    {instrument.isPrimary && !isNotMusicStudent ? (
                      <span className=" py-1 text-end bg-brand-primary  text-theme-primary classical-subtitle rounded-full">
                        Instrumento principal:{' '}
                        <span className="font-medium text-sm pl-2 text-theme-primary">
                          {instrument.name}
                        </span>
                      </span>
                    ) : (
                      <>
                        {!isNotMusicStudent && (
                          <span className="font-medium text-sm text-theme-primary">
                            Instrumento:{' '}
                            <span className="font-medium text-sm pl-2 text-theme-primary">
                              {instrument.name}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {!isNotMusicStudent && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center gap-4">
                        <span>Selecione seu nivel atual: </span>
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

                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={instrument.isPrimary}
                          onChange={(e) =>
                            updateInstrument(instrument.id, {
                              isPrimary: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span>Principal</span>
                      </label>
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

      {/* Search and Filter */}
      {/* <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Buscar instrumentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<FiSearch className="w-4 h-4" />}
        />
      </div> */}

      {/* Available Instruments */}
      <div className="grid grid-cols-1 py-1 px-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto overflow-x-hidden classical-scrollbar">
        {instruments.map((instrument) => (
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
                {instrument.name}
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

      {instruments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-theme-secondary">
            Nenhum instrumento encontrado com os filtros atuais.
          </p>
        </div>
      )}
    </div>
  );
};

export default InstrumentsStep;
