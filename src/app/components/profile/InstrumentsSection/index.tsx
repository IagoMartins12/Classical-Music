// app/profile/components/InstrumentsSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'next-auth';
import { FiPlus, FiX, FiEdit3, FiSave, FiTrash2 } from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import { GiMusicalNotes } from 'react-icons/gi';
import Select from '../../Common/Select';

interface Instrument {
  id: string;
  name: string;
  category?: string;
}

interface UserInstrument {
  id: string;
  instrumentId: string;
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPrimary: boolean;
  isLearning: boolean;
}

interface InstrumentsSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const InstrumentsSection: React.FC<InstrumentsSectionProps> = ({
  user,
  updateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableInstruments, setAvailableInstruments] = useState<
    Instrument[]
  >([]);
  const [userInstruments, setUserInstruments] = useState<UserInstrument[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInstrument, setNewInstrument] = useState({
    instrumentId: '',
    level: 'BEGINNER' as const,
    isPrimary: false,
    isLearning: true,
  });

  const LEVELS = [
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIATE', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' },
  ];

  useEffect(() => {
    loadUserInstruments();
    if (isEditing) {
      loadAvailableInstruments();
    }
  }, [isEditing]);

  const loadUserInstruments = async () => {
    try {
      // Simular dados do usuário
      setUserInstruments([
        {
          id: '1',
          instrumentId: 'piano',
          name: 'Piano',
          level: 'INTERMEDIATE',
          isPrimary: true,
          isLearning: true,
        },
        {
          id: '2',
          instrumentId: 'violin',
          name: 'Violino',
          level: 'BEGINNER',
          isPrimary: false,
          isLearning: true,
        },
      ]);
    } catch (error) {
      console.error('Error loading user instruments:', error);
    }
  };

  const loadAvailableInstruments = async () => {
    try {
      // Simular instrumentos disponíveis
      setAvailableInstruments([
        { id: 'piano', name: 'Piano', category: 'Teclado' },
        { id: 'violin', name: 'Violino', category: 'Cordas' },
        { id: 'guitar', name: 'Violão', category: 'Cordas' },
        { id: 'flute', name: 'Flauta', category: 'Sopro' },
        { id: 'cello', name: 'Violoncelo', category: 'Cordas' },
      ]);
    } catch (error) {
      console.error('Error loading instruments:', error);
    }
  };

  const handleAddInstrument = () => {
    if (!newInstrument.instrumentId) {
      toast.error('Selecione um instrumento');
      return;
    }

    const instrument = availableInstruments.find(
      (i) => i.id === newInstrument.instrumentId
    );
    if (!instrument) return;

    const userInstrument: UserInstrument = {
      id: Date.now().toString(),
      instrumentId: instrument.id,
      name: instrument.name,
      level: newInstrument.level,
      isPrimary: newInstrument.isPrimary,
      isLearning: newInstrument.isLearning,
    };

    // Se está marcando como principal, remover principal dos outros
    if (newInstrument.isPrimary) {
      setUserInstruments((prev) =>
        prev.map((inst) => ({ ...inst, isPrimary: false }))
      );
    }

    setUserInstruments((prev) => [...prev, userInstrument]);
    setNewInstrument({
      instrumentId: '',
      level: 'BEGINNER',
      isPrimary: false,
      isLearning: true,
    });
    setShowAddForm(false);
    toast.success('Instrumento adicionado!');
  };

  const handleRemoveInstrument = (id: string) => {
    setUserInstruments((prev) => prev.filter((inst) => inst.id !== id));
    toast.success('Instrumento removido!');
  };

  const handleUpdateInstrument = (
    id: string,
    updates: Partial<UserInstrument>
  ) => {
    // Se está marcando como principal, remover principal dos outros
    if (updates.isPrimary) {
      setUserInstruments((prev) =>
        prev.map((inst) =>
          inst.id === id
            ? { ...inst, ...updates }
            : { ...inst, isPrimary: false }
        )
      );
    } else {
      setUserInstruments((prev) =>
        prev.map((inst) => (inst.id === id ? { ...inst, ...updates } : inst))
      );
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aqui você salvaria os instrumentos
      setIsEditing(false);
      setShowAddForm(false);
      toast.success('Instrumentos atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar instrumentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowAddForm(false);
    loadUserInstruments(); // Recarregar dados originais
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">
            Meus Instrumentos
          </h3>
          <p className="text-sm text-theme-secondary">
            Instrumentos que você toca ou tem interesse.
          </p>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<FiEdit3 />}
          >
            Editar
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              leftIcon={<FiX />}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isLoading}
              leftIcon={<FiSave />}
            >
              Salvar
            </Button>
          </div>
        )}
      </div>

      {/* Instruments List */}
      <div className="space-y-4">
        {userInstruments.length === 0 ? (
          <div className="text-center py-8">
            <GiMusicalNotes className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
            <p className="text-theme-secondary">
              Nenhum instrumento adicionado ainda
            </p>
          </div>
        ) : (
          userInstruments.map((instrument) => (
            <div key={instrument.id} className="classical-card-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center">
                    <GiMusicalNotes className="w-5 h-5 text-theme-primary" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-theme-primary">
                        {instrument.name}
                      </h4>
                      {instrument.isPrimary && (
                        <span className="px-2 py-1 text-xs bg-brand-primary text-brand-primary classical-card rounded-full">
                          Principal
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center space-x-4 mt-2">
                        <Select
                          value={instrument.level}
                          onChange={(e) =>
                            handleUpdateInstrument(instrument.id, {
                              level: e.target.value as any,
                            })
                          }
                          options={LEVELS}
                          className="w-32"
                        />

                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={instrument.isPrimary}
                            onChange={(e) =>
                              handleUpdateInstrument(instrument.id, {
                                isPrimary: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span>Principal</span>
                        </label>
                      </div>
                    ) : (
                      <p className="text-sm text-theme-secondary">
                        {
                          LEVELS.find((l) => l.value === instrument.level)
                            ?.label
                        }
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={() => handleRemoveInstrument(instrument.id)}
                    className="p-2 text-theme-tertiary hover:text-accent-red transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Instrument Form */}
      {isEditing && (
        <div className="border-t border-theme-secondary pt-6">
          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              leftIcon={<FiPlus />}
              className="w-full"
            >
              Adicionar Instrumento
            </Button>
          ) : (
            <div className="classical-card-2 p-4 space-y-4">
              <h4 className="font-medium text-theme-primary">
                Adicionar Instrumento
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Instrumento"
                  value={newInstrument.instrumentId}
                  onChange={(e) =>
                    setNewInstrument((prev) => ({
                      ...prev,
                      instrumentId: e.target.value,
                    }))
                  }
                  options={[
                    { value: '', label: 'Selecione um instrumento...' },
                    ...availableInstruments.map((inst) => ({
                      value: inst.id,
                      label: inst.name,
                    })),
                  ]}
                />

                <Select
                  label="Nível"
                  value={newInstrument.level}
                  onChange={(e) =>
                    setNewInstrument((prev) => ({
                      ...prev,
                      level: e.target.value as any,
                    }))
                  }
                  options={LEVELS}
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newInstrument.isPrimary}
                    onChange={(e) =>
                      setNewInstrument((prev) => ({
                        ...prev,
                        isPrimary: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span>Instrumento principal</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddInstrument}
                >
                  Adicionar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstrumentsSection;
