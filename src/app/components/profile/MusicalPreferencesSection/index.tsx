'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'next-auth';
import { FiEdit3, FiSave, FiX, FiClock, FiHeart } from 'react-icons/fi';

import {
  updateMusicalPreferences,
  getComposersAndEpochs,
} from '@/app/actions/profile';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import Select from '../../Common/Select';

interface MusicalPreferencesSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const MusicalPreferencesSection: React.FC<MusicalPreferencesSectionProps> = ({
  user,
  updateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [composers, setComposers] = useState<any[]>([]);
  const [epochs, setEpochs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    favoriteComposerId: user.favoriteComposerId || '',
    favoriteEpochId: user.favoriteEpochId || '',
    experienceLevel: user.experienceLevel || '',
    practiceTimePerWeek: user.practiceTimePerWeek || 0,
  });

  const EXPERIENCE_LEVELS = [
    { value: '', label: 'Selecione...' },
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIATE', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' },
  ];

  const PRACTICE_TIME_OPTIONS = [
    { value: '0', label: 'Não pratico regularmente' },
    { value: '60', label: '1 hora por semana' },
    { value: '120', label: '2 horas por semana' },
    { value: '300', label: '5 horas por semana' },
    { value: '600', label: '10 horas por semana' },
    { value: '900', label: '15 horas por semana' },
    { value: '1200', label: '20+ horas por semana' },
  ];

  useEffect(() => {
    if (isEditing && composers.length === 0) {
      loadOptions();
    }
  }, [isEditing]);

  const loadOptions = async () => {
    setIsLoadingData(true);
    try {
      const result = await getComposersAndEpochs();
      if (result.success && result.data) {
        setComposers(result.data.composers);
        setEpochs(result.data.epochs);
      } else {
        toast.error('Erro ao carregar opções');
      }
    } catch (error) {
      toast.error('Erro ao carregar opções');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'practiceTimePerWeek' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('formdata', formData);
      // const result = await updateMusicalPreferences(user.id, formData);

      // if (result.success) {
      //   updateUser(formData);
      //   setIsEditing(false);
      //   toast.success(result.message);
      // } else {
      //   toast.error(result.message);
      // }
    } catch (error) {
      toast.error('Erro ao atualizar preferências.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      favoriteComposerId: user.favoriteComposerId || '',
      favoriteEpochId: user.favoriteEpochId || '',
      experienceLevel: user.experienceLevel || '',
      practiceTimePerWeek: user.practiceTimePerWeek || 0,
    });
    setIsEditing(false);
  };

  const getComposerName = (id: string) => {
    if (!id) return 'Não selecionado';
    const composer = composers.find((c) => c.id === id);
    return composer ? composer.name : 'Compositor não encontrado';
  };

  const getEpochName = (id: string) => {
    if (!id) return 'Não selecionado';
    const epoch = epochs.find((e) => e.id === id);
    return epoch ? epoch.name : 'Período não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">
            Preferências Musicais
          </h3>
          <p className="text-sm text-theme-secondary">
            Suas preferências e experiência musical
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

      {/* Experience Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FiClock className="w-4 h-4 text-brand-primary" />
            <label className="text-sm font-medium text-theme-secondary">
              Nível de Experiência
            </label>
          </div>

          <Select
            value={formData.experienceLevel}
            onChange={handleInputChange}
            name="experienceLevel"
            options={EXPERIENCE_LEVELS}
            disabled={!isEditing}
          />
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FiClock className="w-4 h-4 text-brand-primary" />
            <label className="text-sm font-medium text-theme-secondary">
              Tempo de Prática Semanal
            </label>
          </div>

          <Select
            value={formData.practiceTimePerWeek.toString()}
            onChange={handleInputChange}
            name="practiceTimePerWeek"
            options={PRACTICE_TIME_OPTIONS}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Favorites */}
      <div className="pt-6 border-t border-theme-secondary">
        <div className="flex items-center space-x-2 mb-6">
          <FiHeart className="w-4 h-4 text-brand-primary" />
          <h4 className="font-medium text-theme-primary">Favoritos</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Compositor Favorito
            </label>
            {!isEditing ? (
              <div className="input-classical bg-theme-secondary bg-opacity-50">
                {getComposerName(formData.favoriteComposerId)}
              </div>
            ) : (
              <Select
                value={formData.favoriteComposerId}
                onChange={handleInputChange}
                name="favoriteComposerId"
                options={[
                  { value: '', label: 'Selecione um compositor...' },
                  ...composers.map((composer) => ({
                    value: composer.id,
                    label: composer.name,
                  })),
                ]}
                disabled={isLoadingData}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Período Favorito
            </label>
            {!isEditing ? (
              <div className="input-classical bg-theme-secondary bg-opacity-50">
                {getEpochName(formData.favoriteEpochId)}
              </div>
            ) : (
              <Select
                value={formData.favoriteEpochId}
                onChange={handleInputChange}
                name="favoriteEpochId"
                options={[
                  { value: '', label: 'Selecione um período...' },
                  ...epochs.map((epoch) => ({
                    value: epoch.id,
                    label: epoch.name,
                  })),
                ]}
                disabled={isLoadingData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicalPreferencesSection;
