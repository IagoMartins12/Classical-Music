// app/profile/components/InstrumentsSection.tsx (versão com dados reais)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'next-auth';
import { FiPlus, FiX, FiEdit3, FiSave, FiTrash2 } from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import { GiMusicalNotes } from 'react-icons/gi';
import Select from '../../Common/Select';
import {
  getAvailableInstruments,
  getUserInstruments,
  updateUserInstruments,
} from '@/app/actions/profile';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';

interface Instrument {
  id: string;
  name: string;
  category?: string;
}

interface UserInstrument {
  id: string;
  instrumentId: string;
  name: string;
  category?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPrimary: boolean;
  isLearning: boolean;
  startedAt?: Date;
}

interface InstrumentsSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const InstrumentsSection: React.FC<InstrumentsSectionProps> = ({
  user,
  updateUser: localUpdateUser,
}) => {
  const { updateUser: globalUpdateUser } = useAuth();
  const { updateUserSession } = useSessionUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
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

  // Carrega dados iniciais
  useEffect(() => {
    loadInitialData();
  }, [user.id]);

  // Carrega instrumentos disponíveis quando entrar em modo de edição
  useEffect(() => {
    if (isEditing && availableInstruments.length === 0) {
      loadAvailableInstruments();
    }
  }, [isEditing]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      await loadUserInstruments();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar instrumentos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadUserInstruments = async () => {
    try {
      const result = await getUserInstruments(user.id);

      if (result.success && result.data) {
        setUserInstruments(result.data);
      } else {
        console.error(
          'Erro ao carregar instrumentos do usuário:',
          result.message
        );
        setUserInstruments([]);
      }
    } catch (error) {
      console.error('Erro ao carregar instrumentos do usuário:', error);
      setUserInstruments([]);
    }
  };

  const loadAvailableInstruments = async () => {
    try {
      const result = await getAvailableInstruments();

      if (result.success && result.data) {
        setAvailableInstruments(result.data);
      } else {
        toast.error('Erro ao carregar instrumentos disponíveis');
      }
    } catch (error) {
      console.error('Erro ao carregar instrumentos disponíveis:', error);
      toast.error('Erro ao carregar instrumentos disponíveis');
    }
  };

  // 🔍 Filtrar instrumentos disponíveis (excluir os que já tenho)
  const getFilteredAvailableInstruments = useCallback(() => {
    const userInstrumentIds = userInstruments.map((ui) => ui.instrumentId);
    return availableInstruments.filter(
      (instrument) => !userInstrumentIds.includes(instrument.id)
    );
  }, [availableInstruments, userInstruments]);

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
      id: `temp_${Date.now()}`, // ID temporário até salvar
      instrumentId: instrument.id,
      name: instrument.name,
      category: instrument.category,
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
    toast.success('Instrumento adicionado à lista!');
  };

  const handleRemoveInstrument = (id: string) => {
    setUserInstruments((prev) => prev.filter((inst) => inst.id !== id));
    toast.success('Instrumento removido da lista!');
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

  // Função para sincronizar todos os estados após update
  const syncUserData = async () => {
    // Recarregar dados do banco para garantir sincronização
    await loadUserInstruments();

    // Forçar refresh da sessão NextAuth se necessário
    await updateUserSession();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Preparar dados para envio - separar instrumentos existentes dos novos
      const existingInstruments = userInstruments
        .filter((inst) => !inst.id.startsWith('temp_'))
        .map((inst) => ({
          instrumentId: inst.instrumentId,
          level: inst.level,
          isPrimary: inst.isPrimary,
          isLearning: inst.isLearning,
        }));

      const newInstruments = userInstruments
        .filter((inst) => inst.id.startsWith('temp_'))
        .map((inst) => ({
          instrumentId: inst.instrumentId,
          level: inst.level,
          isPrimary: inst.isPrimary,
          isLearning: inst.isLearning,
        }));

      // Combinar todos os instrumentos
      const instrumentsToSave = [...existingInstruments, ...newInstruments];

      const result = await updateUserInstruments(user.id, instrumentsToSave);

      if (result.success) {
        await syncUserData();
        setIsEditing(false);
        setShowAddForm(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao salvar instrumentos:', error);
      toast.error('Erro ao salvar instrumentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowAddForm(false);
    // Recarregar dados originais
    loadUserInstruments();
  };

  // Loading inicial
  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              Meus Instrumentos
            </h3>
            <p className="text-sm text-theme-secondary">
              Carregando seus instrumentos...
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="classical-card-2 p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-theme-secondary rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-theme-secondary rounded w-24 mb-2" />
                  <div className="h-3 bg-theme-secondary rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredInstruments = getFilteredAvailableInstruments();

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
              disabled={isLoading}
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
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="mt-4"
              >
                Adicionar Primeiro Instrumento
              </Button>
            )}
          </div>
        ) : (
          userInstruments.map((instrument) => (
            <div key={instrument.id} className="classical-card-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center">
                    <GiMusicalNotes className="w-5 h-5 text-theme-inverse" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-theme-primary">
                        {instrument.name}
                      </h4>
                      {instrument.category && (
                        <span className="px-2 py-1 text-xs bg-theme-secondary bg-opacity-50 text-theme-secondary rounded-full">
                          {instrument.category}
                        </span>
                      )}
                      {instrument.isPrimary && (
                        <div className="px-2 py-1 text-xs  classical-card text-theme-primary rounded-full">
                          Principal
                        </div>
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

                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={instrument.isLearning}
                            onChange={(e) =>
                              handleUpdateInstrument(instrument.id, {
                                isLearning: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span>Aprendendo</span>
                        </label>
                      </div>
                    ) : (
                      <p className="text-sm text-theme-secondary">
                        {
                          LEVELS.find((l) => l.value === instrument.level)
                            ?.label
                        }
                        {instrument.startedAt && (
                          <span className="ml-2 text-theme-tertiary">
                            • Desde{' '}
                            {new Date(instrument.startedAt).getFullYear()}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={() => handleRemoveInstrument(instrument.id)}
                    className="p-2 text-theme-tertiary hover:text-accent-red transition-colors"
                    title="Remover instrumento"
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
              disabled={filteredInstruments.length === 0}
            >
              {filteredInstruments.length === 0
                ? 'Todos os instrumentos já foram adicionados'
                : 'Adicionar Instrumento'}
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
                    ...filteredInstruments.map((inst) => ({
                      value: inst.id,
                      label: `${inst.name}${
                        inst.category ? ` (${inst.category})` : ''
                      }`,
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

                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newInstrument.isLearning}
                    onChange={(e) =>
                      setNewInstrument((prev) => ({
                        ...prev,
                        isLearning: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span>Estou aprendendo</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddInstrument}
                  disabled={!newInstrument.instrumentId}
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

          {/* Informações adicionais */}
          {isEditing && (
            <div className="mt-4 text-center">
              <p className="text-xs text-theme-tertiary">
                💡 Dica: Marque um instrumento como "Principal" para destacá-lo
                no seu perfil
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstrumentsSection;
