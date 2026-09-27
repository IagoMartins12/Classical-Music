// app/profile/components/InstrumentsSection.tsx (versão com dados reais)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Era `User` do NextAuth, aumentado em `types/next-auth.d.ts`. É o mesmo
// objeto que `useAuth()` entrega, e ele já tem tipo próprio no store.
import type { User } from '@/app/hooks/userStore';
import {
  PiFloppyDisk,
  PiMusicNotes,
  PiPencilLine,
  PiPlus,
  PiTrash,
  PiX,
} from 'react-icons/pi';

import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import Select from '../../Common/Select';
import {
  getAvailableInstruments,
  getUserInstruments,
  updateUserInstruments,
} from '@/app/actions/profile';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { useTranslation } from '@/app/context/TranslationContext';
import Checkbox from '../../Common/Checkbox';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
}

const InstrumentsSection: React.FC<InstrumentsSectionProps> = ({ user }) => {
  const { updateUserSession } = useSessionUpdate();
  const { t } = useTranslation({ sections: ['pages/profile'] });
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
    { value: 'BEGINNER', label: t('instruments_level_beginner') },
    { value: 'INTERMEDIATE', label: t('instruments_level_intermediate') },
    { value: 'ADVANCED', label: t('instruments_level_advanced') },
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
      <Stack gap={6}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              {t('instruments_title')}
            </h3>
            <Text papel="rotulo" tom="suave" as="p">
              {t('instruments_loading')}
            </Text>
          </div>
        </div>

        <Stack>
          {[...Array(2)].map((_, index) => (
            <Card
              nivel={2}
              densidade="compacta"
              key={index}
              className="animate-pulse"
            >
              <Inline gap={4}>
                <div className="w-10 h-10 bg-theme-secondary rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-theme-secondary rounded w-24 mb-2" />
                  <div className="h-3 bg-theme-secondary rounded w-16" />
                </div>
              </Inline>
            </Card>
          ))}
        </Stack>
      </Stack>
    );
  }

  const filteredInstruments = getFilteredAvailableInstruments();

  return (
    <Stack gap={6}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">
            {t('instruments_title')}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t('instruments_description')}
          </Text>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<PiPencilLine />}
          >
            {t('instruments_edit')}
          </Button>
        ) : (
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              leftIcon={<PiX />}
              disabled={isLoading}
            >
              {t('instruments_cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isLoading}
              leftIcon={<PiFloppyDisk />}
            >
              {t('instruments_save')}
            </Button>
          </div>
        )}
      </div>

      {/* Instruments List */}
      <Stack>
        {userInstruments.length === 0 ? (
          <div className="text-center py-8">
            <PiMusicNotes className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
            <p className="text-theme-secondary">{t('instruments_none')}</p>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="mt-4"
              >
                {t('instruments_add_first')}
              </Button>
            )}
          </div>
        ) : (
          userInstruments.map((instrument) => (
            <Card nivel={2} densidade="compacta" key={instrument.id}>
              <div className="flex items-center justify-between">
                <Inline gap={4}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <PiMusicNotes className="w-5 h-5 text-theme-primary" />
                  </div>

                  <div>
                    <Inline gap={3}>
                      <h4 className="font-medium text-theme-primary">
                        {instrument.name}
                      </h4>
                      {instrument.category && (
                        <Text
                          papel="legenda"
                          tom="suave"
                          className="px-2 py-1 bg-theme-secondary rounded-full"
                        >
                          {instrument.category}
                        </Text>
                      )}
                      {instrument.isPrimary && (
                        <Text
                          papel="legenda"
                          tom="forte"
                          as="div"
                          className="!px-3 !py-1 classical-card rounded-full"
                        >
                          {t('instruments_primary')}
                        </Text>
                      )}
                    </Inline>

                    {isEditing ? (
                      <div className="flex flex-col md:flex-row items-start gap-4 md:items-center mt-4 md:mt-2">
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

                        <Inline as="label" gap={2} className="text-sm">
                          <Checkbox
                            label={t('instruments_primary')}
                            checked={instrument.isPrimary}
                            onChange={(e) =>
                              handleUpdateInstrument(instrument.id, {
                                isPrimary: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                        </Inline>

                        <Inline as="label" gap={2} className="text-sm">
                          <Checkbox
                            checked={instrument.isLearning}
                            onChange={(e) =>
                              handleUpdateInstrument(instrument.id, {
                                isLearning: e.target.checked,
                              })
                            }
                            className="rounded"
                            label={t('instruments_learning')}
                          />
                        </Inline>
                      </div>
                    ) : (
                      <Text papel="rotulo" tom="suave" as="p">
                        {
                          LEVELS.find((l) => l.value === instrument.level)
                            ?.label
                        }
                        {instrument.startedAt && (
                          <span className="ml-2 text-theme-tertiary">
                            • {t('instruments_since')}{' '}
                            {new Date(instrument.startedAt).getFullYear()}
                          </span>
                        )}
                      </Text>
                    )}
                  </div>
                </Inline>

                {isEditing && (
                  <button
                    onClick={() => handleRemoveInstrument(instrument.id)}
                    className="p-2 transition-colors !text-erro"
                    title="Remover instrumento"
                  >
                    <PiTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </Stack>

      {/* Add Instrument Form */}
      {isEditing && (
        <div className="border-t border-theme-secondary pt-6">
          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              leftIcon={<PiPlus />}
              className="w-full"
              disabled={filteredInstruments.length === 0}
            >
              {filteredInstruments.length === 0
                ? t('instruments_add_all_added')
                : t('instruments_add_instrument')}
            </Button>
          ) : (
            <Card nivel={2} densidade="compacta" className="space-y-4">
              <h4 className="font-medium text-theme-primary">
                {t('instruments_add_title')}
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
                    { value: '', label: t('instruments_select_instrument') },
                    ...filteredInstruments.map((inst) => ({
                      value: inst.id,
                      label: `${inst.name}${
                        inst.category ? ` (${inst.category})` : ''
                      }`,
                    })),
                  ]}
                />

                <Select
                  label={t('instruments_level')}
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

              <Inline gap={6}>
                <Inline as="label" gap={2} className="text-sm">
                  <Checkbox
                    label={t('instruments_primary_checkbox')}
                    checked={newInstrument.isPrimary}
                    onChange={(e) =>
                      setNewInstrument((prev) => ({
                        ...prev,
                        isPrimary: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                </Inline>

                <Inline as="label" gap={2} className="text-sm">
                  <Checkbox
                    label={t('instruments_learning_checkbox')}
                    checked={newInstrument.isLearning}
                    onChange={(e) =>
                      setNewInstrument((prev) => ({
                        ...prev,
                        isLearning: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                </Inline>
              </Inline>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddInstrument}
                  disabled={!newInstrument.instrumentId}
                >
                  {t('instruments_add_button')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  {t('instruments_cancel')}
                </Button>
              </div>
            </Card>
          )}

          {/* Informações adicionais */}
          {isEditing && (
            <div className="mt-4 text-center">
              <Text papel="legenda" tom="fraco" as="p">
                {t('instruments_tip')}
              </Text>
            </div>
          )}
        </div>
      )}
    </Stack>
  );
};

export default InstrumentsSection;
