// app/profile/components/InstrumentsSection.tsx (versão com dados reais)
'use client';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { Field } from '@/app/components/ui/Field';
import { PERFIL } from '@/app/conteudo/textos/perfil';
import { useTextos } from '@/app/hooks/useTextos';

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
import { Button } from '@/app/components/ui/Button';
import {
  getAvailableInstruments,
  getUserInstruments,
  updateUserInstruments,
} from '@/app/actions/profile';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';
import { porIdioma } from '@/app/utils/porIdioma';
import { useTx } from '@/app/hooks/useTx';

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
  const tx = useTx();
  const { updateUserSession } = useSessionUpdate();
  const { t } = useTextos(PERFIL);
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
      toast.error(
        tx('Erro ao carregar instrumentos', 'Could not load the instruments')
      );
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
        toast.error(
          porIdioma(
            'Não foi possível carregar os instrumentos',
            'Could not load the instruments'
          )
        );
      }
    } catch (error) {
      console.error('Erro ao carregar instrumentos disponíveis:', error);
      toast.error(
        porIdioma(
          'Não foi possível carregar os instrumentos',
          'Could not load the instruments'
        )
      );
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
      toast.error(tx('Selecione um instrumento', 'Choose an instrument'));
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
    toast.success(
      tx('Instrumento adicionado à lista!', 'Instrument added to the list.')
    );
  };

  const handleRemoveInstrument = (id: string) => {
    setUserInstruments((prev) => prev.filter((inst) => inst.id !== id));
    toast.success(
      tx('Instrumento removido da lista!', 'Instrument removed from the list.')
    );
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
      toast.error(
        tx('Erro ao salvar instrumentos.', 'Could not save the instruments.')
      );
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
            <h3 className="font-display text-[1.5rem] leading-tight text-texto">
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
                <div className="w-10 h-10 bg-sup-2 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-sup-2 rounded w-24 mb-2" />
                  <div className="h-3 bg-sup-2 rounded w-16" />
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
      <div className="flex flex-wrap items-start justify-between gap-4 sm:flex-nowrap sm:[&>*:not(:first-child)]:shrink-0">
        <div className="sm:min-w-0 sm:flex-1">
          <h3 className="font-display text-[1.5rem] leading-tight text-texto">
            {t('instruments_title')}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t('instruments_description')}
          </Text>
        </div>

        {!isEditing ? (
          <Button
            variante="secundario"
            tamanho="p"
            onClick={() => setIsEditing(true)}
            icone={PiPencilLine}
          >
            {t('instruments_edit')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variante="fantasma"
              tamanho="p"
              onClick={handleCancel}
              icone={PiX}
              disabled={isLoading}
            >
              {t('instruments_cancel')}
            </Button>
            <Button
              variante="primario"
              tamanho="p"
              onClick={handleSave}
              carregando={isLoading}
              icone={PiFloppyDisk}
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
            <PiMusicNotes className="w-12 h-12 text-texto-fraco mx-auto mb-3" />
            <p className="text-texto-suave">{t('instruments_none')}</p>
            {!isEditing && (
              <Button
                variante="secundario"
                tamanho="p"
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
                    <PiMusicNotes className="w-5 h-5 text-texto" />
                  </div>

                  <div>
                    <Inline gap={3}>
                      <h4 className="font-medium text-texto">
                        {instrument.name}
                      </h4>
                      {instrument.category && (
                        <Text
                          papel="legenda"
                          tom="suave"
                          className="px-2 py-1 bg-sup-2 rounded-full"
                        >
                          {instrument.category}
                        </Text>
                      )}
                      {instrument.isPrimary && (
                        <Text
                          papel="legenda"
                          tom="forte"
                          as="div"
                          className="!px-3 !py-1 tint-ouro text-ouro-na-tinta rounded-full"
                        >
                          {t('instruments_primary')}
                        </Text>
                      )}
                    </Inline>

                    {isEditing ? (
                      <div className="flex flex-col md:flex-row items-start gap-4 md:items-center mt-4 md:mt-2">
                        <Field.Selecao
                          label={t('instruments_level')}
                          rotuloOculto
                          value={instrument.level}
                          onChange={(e) =>
                            handleUpdateInstrument(instrument.id, {
                              level: e.target.value as any,
                            })
                          }
                          className="w-full md:w-48"
                        >
                          {LEVELS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </Field.Selecao>

                        <CaixaDeMarcar
                          rotulo={t('instruments_primary')}
                          marcado={instrument.isPrimary}
                          aoMudar={(marcado: boolean) =>
                            handleUpdateInstrument(instrument.id, {
                              isPrimary: marcado,
                            })
                          }
                        />

                        <CaixaDeMarcar
                          marcado={instrument.isLearning}
                          aoMudar={(marcado: boolean) =>
                            handleUpdateInstrument(instrument.id, {
                              isLearning: marcado,
                            })
                          }
                          rotulo={t('instruments_learning')}
                        />
                      </div>
                    ) : (
                      <Text papel="rotulo" tom="suave" as="p">
                        {
                          LEVELS.find((l) => l.value === instrument.level)
                            ?.label
                        }
                        {instrument.startedAt && (
                          <span className="ml-2 text-texto-fraco">
                            • {t('instruments_since')}{' '}
                            {new Date(instrument.startedAt).getFullYear()}
                          </span>
                        )}
                      </Text>
                    )}
                  </div>
                </Inline>

                {isEditing && (
                  <Button
                    variante="fantasma"
                    tamanho="p"
                    onClick={() => handleRemoveInstrument(instrument.id)}
                    title={tx('Remover instrumento', 'Remove instrument')}
                    icone={PiTrash}
                    rotulo={tx('Remover instrumento', 'Remove instrument')}
                    className="text-erro"
                  />
                )}
              </div>
            </Card>
          ))
        )}
      </Stack>

      {/* Add Instrument Form */}
      {isEditing && (
        <div className="border-t border-linha pt-6">
          {!showAddForm ? (
            <Button
              variante="secundario"
              onClick={() => setShowAddForm(true)}
              icone={PiPlus}
              className="w-full"
              disabled={filteredInstruments.length === 0}
            >
              {filteredInstruments.length === 0
                ? t('instruments_add_all_added')
                : t('instruments_add_instrument')}
            </Button>
          ) : (
            <Card
              nivel={2}
              densidade="compacta"
              className="gap-4 flex flex-col"
            >
              <h4 className="font-medium text-texto">
                {t('instruments_add_title')}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field.Selecao
                  label={tx('Instrumento', 'Instrument')}
                  value={newInstrument.instrumentId}
                  onChange={(e) =>
                    setNewInstrument((prev) => ({
                      ...prev,
                      instrumentId: e.target.value,
                    }))
                  }
                >
                  {[
                    { value: '', label: t('instruments_select_instrument') },
                    ...filteredInstruments.map((inst) => ({
                      value: inst.id,
                      label: `${inst.name}${
                        inst.category ? ` (${inst.category})` : ''
                      }`,
                    })),
                  ].map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Field.Selecao>

                <Field.Selecao
                  label={t('instruments_level')}
                  value={newInstrument.level}
                  onChange={(e) =>
                    setNewInstrument((prev) => ({
                      ...prev,
                      level: e.target.value as any,
                    }))
                  }
                >
                  {LEVELS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Field.Selecao>
              </div>

              <Inline gap={6}>
                <CaixaDeMarcar
                  rotulo={t('instruments_primary_checkbox')}
                  marcado={newInstrument.isPrimary}
                  aoMudar={(marcado: boolean) =>
                    setNewInstrument((prev) => ({
                      ...prev,
                      isPrimary: marcado,
                    }))
                  }
                />

                <CaixaDeMarcar
                  rotulo={t('instruments_learning_checkbox')}
                  marcado={newInstrument.isLearning}
                  aoMudar={(marcado: boolean) =>
                    setNewInstrument((prev) => ({
                      ...prev,
                      isLearning: marcado,
                    }))
                  }
                />
              </Inline>

              <div className="flex justify-end gap-2">
                <Button
                  variante="fantasma"
                  tamanho="p"
                  icone={PiX}
                  onClick={() => setShowAddForm(false)}
                >
                  {t('instruments_cancel')}
                </Button>
                <Button
                  variante="primario"
                  tamanho="p"
                  icone={PiPlus}
                  onClick={handleAddInstrument}
                  disabled={!newInstrument.instrumentId}
                >
                  {t('instruments_add_button')}
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
