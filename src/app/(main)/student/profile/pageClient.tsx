// app/student/profile/pageClient.tsx - Client Component para Perfil do Aluno

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiUser,
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiMail,
  FiMapPin,
  FiMusic,
  FiTarget,
  FiClock,
  FiBookOpen,
  FiHeart,
  FiCalendar,
  FiAlertCircle,
  FiCheck,
  FiEdit3,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { StudentProfileData, UserProfile } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useStudentProfile } from '@/app/hooks/lessonsSystem/useStudentProfile';

interface StudentProfilePageClientProps {
  initialData: StudentProfileData | null;
  userProfile: UserProfile;
  errorMessage?: string;
}

const skillLevels = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const learningPaceOptions = [
  { value: 'slow', label: 'Devagar' },
  { value: 'medium', label: 'Moderado' },
  { value: 'fast', label: 'Rápido' },
];

const profileVisibilityOptions = [
  { value: 'public', label: 'Público' },
  { value: 'teacher_only', label: 'Apenas Professores' },
  { value: 'private', label: 'Privado' },
];

const contactPreferences = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Ambos' },
];

const musicalGenres = [
  'Clássico',
  'Jazz',
  'Blues',
  'Rock',
  'Pop',
  'Folk',
  'Country',
  'Bossa Nova',
  'MPB',
  'Samba',
  'Chorinho',
  'Erudito',
  'Barroco',
  'Romântico',
  'Impressionista',
  'Contemporâneo',
  'Minimalista',
];

export default function StudentProfilePageClient({
  initialData,
  userProfile,
  errorMessage,
}: StudentProfilePageClientProps) {
  const {
    profile,
    studyData,
    loading,
    error,
    setInitialData,
    updateProfile,
    updateField,
    refreshProfile,
    refreshStudyData,
    clearError,
  } = useStudentProfile(initialData);

  // Local state
  const [activeTab, setActiveTab] = useState<
    'personal' | 'musical' | 'privacy' | 'study'
  >('personal');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize with server data
  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  // Show success message
  const showSuccessMessage = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  // Handle field edit
  const startEdit = useCallback(
    (field: string, currentValue: any) => {
      setIsEditing(field);
      setTempValues({ [field]: currentValue });
      clearError();
    },
    [clearError]
  );

  const cancelEdit = useCallback(() => {
    setIsEditing(null);
    setTempValues({});
  }, []);

  const saveEdit = useCallback(async () => {
    if (!isEditing || !profile) return;

    const field = isEditing;
    const value = tempValues[field];

    // Determine if it's a user field or student field
    const userFields = [
      'firstName',
      'lastName',
      'phone',
      'city',
      'state',
      'country',
      'experienceLevel',
    ];
    const isUserField = userFields.includes(field);

    const updateData = isUserField
      ? { userData: { [field]: value } }
      : { studentData: { [field]: value } };

    const success = await updateProfile(updateData);

    if (success) {
      setIsEditing(null);
      setTempValues({});
      showSuccessMessage();
    }
  }, [isEditing, tempValues, profile, updateProfile, showSuccessMessage]);

  // Handle array fields (like preferredGenres)
  const handleGenreToggle = useCallback(
    async (genre: string) => {
      if (!profile) return;

      const currentGenres = profile.preferredGenres || [];
      const isSelected = currentGenres.includes(genre);

      const success = await updateField(
        'preferredGenres',
        genre,
        isSelected ? 'remove' : 'add'
      );

      if (success) {
        showSuccessMessage();
      }
    },
    [profile, updateField, showSuccessMessage]
  );

  // Handle boolean toggles
  const handleToggle = useCallback(
    async (field: string, currentValue: boolean) => {
      const updateData = { studentData: { [field]: !currentValue } };
      const success = await updateProfile(updateData);

      if (success) {
        showSuccessMessage();
      }
    },
    [updateProfile, showSuccessMessage]
  );

  // Error state
  if (errorMessage && !profile) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Perfil
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage}
            </p>
            <button onClick={refreshProfile} className="btn-classical-primary">
              Tentar Novamente
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">Carregando perfil...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const EditableField = ({
    field,
    label,
    value,
    type = 'text',
    options = [],
  }: {
    field: string;
    label: string;
    value: any;
    type?: 'text' | 'textarea' | 'select' | 'number';
    options?: Array<{ value: string; label: string }>;
  }) => {
    const isCurrentlyEditing = isEditing === field;
    const isLoading = loading.updateProfile || loading.updateField;

    if (isCurrentlyEditing) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-theme-primary">
            {label}
          </label>
          <div className="flex items-center space-x-2">
            {type === 'select' ? (
              <Select
                value={tempValues[field] || ''}
                onChange={(e) =>
                  setTempValues({ ...tempValues, [field]: e.target.value })
                }
                options={options}
                className="input-classical flex-1"
              />
            ) : type === 'textarea' ? (
              <textarea
                value={tempValues[field] || ''}
                onChange={(e) =>
                  setTempValues({ ...tempValues, [field]: e.target.value })
                }
                className="input-classical flex-1"
                rows={3}
              />
            ) : (
              <Input
                type={type}
                value={tempValues[field] || ''}
                onChange={(e) =>
                  setTempValues({
                    ...tempValues,
                    [field]:
                      type === 'number'
                        ? parseInt(e.target.value)
                        : e.target.value,
                  })
                }
                className="input-classical flex-1"
              />
            )}
            <button
              onClick={saveEdit}
              disabled={isLoading}
              className="btn-classical-primary p-2"
            >
              <FiCheck className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEdit}
              disabled={isLoading}
              className="btn-classical-secondary p-2"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="group">
        <label className="text-sm font-medium text-theme-tertiary">
          {label}
        </label>
        <div className="flex items-center justify-between">
          <span className="text-theme-primary">
            {type === 'select'
              ? options.find((opt) => opt.value === value)?.label ||
                value ||
                'Não definido'
              : value || 'Não definido'}
          </span>
          <button
            onClick={() => startEdit(field, value)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-theme-glow">
                  {profile.user.image ? (
                    <Image
                      src={profile.user.image}
                      alt={userProfile.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-12 h-12 text-theme-primary" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center">
                  <FiSettings className="w-4 h-4 text-theme-primary" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Meu Perfil
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Gerencie suas informações e preferências musicais
            </p>
          </div>
        </AnimatedItem>

        {/* Success Message */}
        {showSuccess && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-6 bg-accent-green/10 border border-accent-green/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FiCheck className="w-5 h-5 text-accent-green" />
                <span className="text-accent-green font-medium">
                  Perfil atualizado com sucesso!
                </span>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Error Message */}
        {error && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-6 bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-accent-red" />
                  <span className="text-accent-red font-medium">{error}</span>
                </div>
                <button onClick={clearError} className="text-accent-red">
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Tabs */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'personal', label: 'Informações Pessoais', icon: FiUser },
              { id: 'musical', label: 'Preferências Musicais', icon: FiMusic },
              { id: 'privacy', label: 'Privacidade', icon: FiEye },
              { id: 'study', label: 'Meu Repertório', icon: FiBookOpen },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                  activeTab === id
                    ? 'bg-brand-primary text-theme-primary shadow-theme-glow'
                    : 'bg-theme-elevated text-theme-secondary hover:text-theme-primary hover:bg-brand-primary/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </AnimatedItem>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6">
                    Informações Pessoais
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                      field="firstName"
                      label="Primeiro Nome"
                      value={profile.user.firstName}
                    />
                    <EditableField
                      field="lastName"
                      label="Sobrenome"
                      value={profile.user.lastName}
                    />
                    <EditableField
                      field="phone"
                      label="Telefone"
                      value={profile.user.phone}
                    />
                    <EditableField
                      field="city"
                      label="Cidade"
                      value={profile.user.city}
                    />
                    <EditableField
                      field="state"
                      label="Estado"
                      value={profile.user.state}
                    />
                    <EditableField
                      field="experienceLevel"
                      label="Nível de Experiência"
                      value={profile.user.experienceLevel}
                      type="select"
                      options={skillLevels}
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t border-theme-secondary">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary">
                          Email
                        </label>
                        <div className="text-theme-primary">
                          {profile.user.email}
                        </div>
                      </div>
                      <FiMail className="w-5 h-5 text-theme-tertiary" />
                    </div>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Musical Preferences Tab */}
            {activeTab === 'musical' && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6">
                    Preferências Musicais
                  </h2>

                  <div className="space-y-6">
                    <EditableField
                      field="level"
                      label="Nível Atual"
                      value={profile.level}
                      type="select"
                      options={skillLevels}
                    />

                    <EditableField
                      field="mainInstrument"
                      label="Instrumento Principal"
                      value={profile.mainInstrument}
                    />

                    <EditableField
                      field="musicalGoals"
                      label="Objetivos Musicais"
                      value={profile.musicalGoals}
                      type="textarea"
                    />

                    <EditableField
                      field="musicalBackground"
                      label="Background Musical"
                      value={profile.musicalBackground}
                      type="textarea"
                    />

                    <EditableField
                      field="learningPace"
                      label="Ritmo de Aprendizado"
                      value={profile.learningPace}
                      type="select"
                      options={learningPaceOptions}
                    />

                    <EditableField
                      field="practiceTime"
                      label="Tempo de Prática Semanal (minutos)"
                      value={profile.practiceTime}
                      type="number"
                    />

                    <EditableField
                      field="preferredContact"
                      label="Forma de Contato Preferida"
                      value={profile.preferredContact}
                      type="select"
                      options={contactPreferences}
                    />

                    {/* Preferred Genres */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-theme-primary">
                        Gêneros Musicais Preferidos
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {musicalGenres.map((genre) => {
                          const isSelected =
                            profile.preferredGenres?.includes(genre);
                          return (
                            <button
                              key={genre}
                              onClick={() => handleGenreToggle(genre)}
                              className={`p-2 rounded-lg border transition-all text-sm ${
                                isSelected
                                  ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                                  : 'bg-theme-elevated border-theme-secondary/30 text-theme-secondary hover:text-theme-primary'
                              }`}
                            >
                              {genre}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6">
                    Configurações de Privacidade
                  </h2>

                  <div className="space-y-6">
                    <EditableField
                      field="profileVisibility"
                      label="Visibilidade do Perfil"
                      value={profile.profileVisibility}
                      type="select"
                      options={profileVisibilityOptions}
                    />

                    {/* Toggle Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-theme-secondary/5 rounded-lg">
                        <div>
                          <div className="font-medium text-theme-primary">
                            Permitir Progresso Público
                          </div>
                          <div className="text-sm text-theme-tertiary">
                            Permite que outros vejam seu progresso de
                            aprendizado
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleToggle(
                              'allowPublicProgress',
                              profile.allowPublicProgress
                            )
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            profile.allowPublicProgress
                              ? 'bg-brand-primary'
                              : 'bg-theme-tertiary'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-theme-primary rounded-full transition-transform ${
                              profile.allowPublicProgress
                                ? 'translate-x-7'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-theme-secondary/5 rounded-lg">
                        <div>
                          <div className="font-medium text-theme-primary">
                            Compartilhar Progresso com Professores
                          </div>
                          <div className="text-sm text-theme-tertiary">
                            Permite que seus professores vejam seu progresso
                            detalhado
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleToggle(
                              'allowProgressShare',
                              profile.allowProgressShare
                            )
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            profile.allowProgressShare
                              ? 'bg-brand-primary'
                              : 'bg-theme-tertiary'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-theme-primary rounded-full transition-transform ${
                              profile.allowProgressShare
                                ? 'translate-x-7'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Study Data Tab */}
            {activeTab === 'study' && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Meu Repertório
                    </h2>
                    <button
                      onClick={refreshStudyData}
                      disabled={loading.refreshStudyData}
                      className="btn-classical-secondary flex items-center space-x-2"
                    >
                      <FiRefreshCw
                        className={`w-4 h-4 ${
                          loading.refreshStudyData ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Atualizar</span>
                    </button>
                  </div>

                  {studyData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Want to Learn */}
                      <div>
                        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center">
                          <FiTarget className="w-5 h-5 mr-2" />
                          Quero Aprender ({studyData.wantToLearn.length})
                        </h3>
                        <div className="space-y-2">
                          {studyData.wantToLearn.slice(0, 5).map((work) => (
                            <div
                              key={work.workId}
                              className="p-3 bg-theme-secondary/10 rounded-lg border"
                            >
                              <div className="font-medium text-theme-primary text-sm">
                                {work.title}
                              </div>
                              <div className="text-xs text-theme-tertiary">
                                {work.composer}
                              </div>
                              {work.difficulty && (
                                <div className="text-xs text-accent-blue mt-1">
                                  {work.difficulty}
                                </div>
                              )}
                            </div>
                          ))}
                          {studyData.wantToLearn.length > 5 && (
                            <div className="text-center">
                              <span className="text-sm text-theme-tertiary">
                                +{studyData.wantToLearn.length - 5} mais obras
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Learned */}
                      <div>
                        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center">
                          <FiHeart className="w-5 h-5 mr-2" />
                          Já Aprendi ({studyData.learned.length})
                        </h3>
                        <div className="space-y-2">
                          {studyData.learned.slice(0, 5).map((work) => (
                            <div
                              key={work.workId}
                              className="p-3 bg-theme-secondary/10 rounded-lg border"
                            >
                              <div className="font-medium text-theme-primary text-sm">
                                {work.title}
                              </div>
                              <div className="text-xs text-theme-tertiary">
                                {work.composer}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-xs text-accent-green">
                                  Domínio: {work.mastery}/5
                                </div>
                                {work.wouldRecommend && (
                                  <div className="text-xs text-accent-blue">
                                    ⭐ Recomenda
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {studyData.learned.length > 5 && (
                            <div className="text-center">
                              <span className="text-sm text-theme-tertiary">
                                +{studyData.learned.length - 5} mais obras
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Annotations */}
                  {studyData?.recentAnnotations &&
                    studyData.recentAnnotations.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-theme-secondary">
                        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center">
                          <FiEdit3 className="w-5 h-5 mr-2" />
                          Anotações Recentes
                        </h3>
                        <div className="space-y-2">
                          {studyData.recentAnnotations.map((annotation) => (
                            <div
                              key={annotation.id}
                              className="p-3 bg-theme-secondary/10 rounded-lg border"
                            >
                              <div className="font-medium text-theme-primary text-sm">
                                {annotation.title}
                              </div>
                              <div className="text-xs text-theme-tertiary">
                                {annotation.workTitle} • {annotation.category}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </AnimatedCard>
              </AnimatedItem>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Estatísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-tertiary">
                      Aulas Assistidas
                    </span>
                    <span className="font-bold text-theme-primary">
                      {profile.totalLessonsAttended}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-tertiary">
                      Tarefas Concluídas
                    </span>
                    <span className="font-bold text-theme-primary">
                      {profile.completedAssignments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-tertiary">Sequência Atual</span>
                    <span className="font-bold text-accent-green">
                      {profile.currentStreak} dias
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-tertiary">
                      Melhor Sequência
                    </span>
                    <span className="font-bold text-accent-blue">
                      {profile.longestStreak} dias
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Active Teachers */}
            {profile.teachers.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                    Professores
                  </h3>
                  <div className="space-y-3">
                    {profile.teachers
                      .filter((t) => t.isActive)
                      .map((teacher) => (
                        <div
                          key={teacher.teacherId}
                          className="flex items-center space-x-3"
                        >
                          {teacher.teacherImage ? (
                            <div className="w-10 h-10 relative rounded-full overflow-hidden">
                              <Image
                                src={teacher.teacherImage}
                                alt={teacher.teacherName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-theme-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-theme-primary text-sm">
                              {teacher.teacherName}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              {teacher.totalLessons} aulas •{' '}
                              {teacher.lessonDuration}min
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={refreshProfile}
                    disabled={loading.profile}
                    className="w-full btn-classical-secondary text-left flex items-center space-x-2"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 ${
                        loading.profile ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Atualizar Perfil</span>
                  </button>
                  <button
                    onClick={refreshStudyData}
                    disabled={loading.refreshStudyData}
                    className="w-full btn-classical-secondary text-left flex items-center space-x-2"
                  >
                    <FiTrendingUp className="w-4 h-4" />
                    <span>Ver Progresso</span>
                  </button>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
