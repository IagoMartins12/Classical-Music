// app/student/profile/pageClient.tsx - Client Component CORRIGIDO SEM CACHE MANUAL

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiUser,
  FiSave,
  FiEdit3,
  FiBookOpen,
  FiHeart,
  FiShield,
  FiMessageSquare,
  FiMusic,
  FiRefreshCw,
  FiX,
  FiCheck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { StudentProfileData, UserProfile } from './pageServer';
import Image from 'next/image';
import LocationSelector, {
  LocationData,
} from '../../../components/Common/LocationSelector';
import InternationalPhoneInput from '../../../components/Common/InternationalPhoneInput';
import {
  validatePhoneNumber,
  canProceedWithPhone,
  usePhoneValidation,
} from '@/app/utils/phones_and_location/phoneValidation';
import {
  convertDatabaseToLocationData,
  convertLocationDataToDatabase,
} from '@/app/utils/locationUtils';
import { useStudentProfile } from '@/app/hooks/lessonsSystem/useStudentProfile';
import { useToast } from '@/app/hooks/useToast';

interface StudentProfilePageClientProps {
  initialData: StudentProfileData | null;
  userProfile: UserProfile;
  errorMessage?: string;
}

type EditingSection =
  | 'personal'
  | 'study'
  | 'preferences'
  | 'privacy'
  | 'communication'
  | null;

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
    refreshProfile,
    refreshStudyData,
    clearError,
  } = useStudentProfile(initialData);

  // Local state
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 🔧 FORMS PARA CADA SEÇÃO
  const [personalForm, setPersonalForm] = useState(() => ({
    firstName: userProfile.name.split(' ')[0] || '',
    lastName: userProfile.name.split(' ').slice(1).join(' ') || '',
    phone: profile?.user.phone || '',
    location: convertDatabaseToLocationData({
      country: profile?.user.country,
      state: profile?.user.state,
      city: profile?.user.city,
    }),
  }));

  const [studyForm, setStudyForm] = useState(() => ({
    level: profile?.level || 'BEGINNER',
    musicalGoals: profile?.musicalGoals || '',
    musicalBackground: profile?.musicalBackground || '',
    practiceTime: profile?.practiceTime || 0,
    learningPace: profile?.learningPace || '',
    specialNeeds: profile?.specialNeeds || '',
  }));

  const [preferencesForm, setPreferencesForm] = useState(() => ({
    preferredGenres: profile?.preferredGenres || [],
  }));

  const [privacyForm, setPrivacyForm] = useState(() => ({
    allowPublicProgress: profile?.allowPublicProgress || false,
    allowProgressShare: profile?.allowProgressShare ? true : false,
    profileVisibility: profile?.profileVisibility || 'teacher_only',
  }));

  const [communicationForm, setCommunicationForm] = useState(() => ({
    preferredContact: profile?.preferredContact || 'whatsapp',
    reminderPreferences: profile?.reminderPreferences || {},
  }));

  // 🆕 VALIDAÇÃO DE TELEFONE EM TEMPO REAL
  const phoneValidation = usePhoneValidation(personalForm.phone);
  const [phoneError, setPhoneError] = useState<string>('');

  // Initialize with server data
  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  const toast = useToast();
  // 🔄 SINCRONIZAR FORMS QUANDO PROFILE MUDAR
  useEffect(() => {
    if (profile) {
      setPersonalForm((prev) => ({
        ...prev,
        phone: profile.user.phone || '',
        location: convertDatabaseToLocationData({
          country: profile.user.country,
          state: profile.user.state,
          city: profile.user.city,
        }),
      }));

      setStudyForm({
        level: profile.level || 'BEGINNER',
        musicalGoals: profile.musicalGoals || '',
        musicalBackground: profile.musicalBackground || '',
        practiceTime: profile.practiceTime || 0,
        learningPace: profile.learningPace || '',
        specialNeeds: profile.specialNeeds || '',
      });

      setPreferencesForm({
        preferredGenres: profile.preferredGenres || [],
      });

      setPrivacyForm({
        allowPublicProgress: profile.allowPublicProgress || false,
        allowProgressShare: profile.allowProgressShare || true,
        profileVisibility: profile.profileVisibility || 'teacher_only',
      });

      setCommunicationForm({
        preferredContact: profile.preferredContact || 'whatsapp',
        reminderPreferences: profile.reminderPreferences || {},
      });
    }
  }, [profile]);

  // Helper functions
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    clearError();
    toast.error(message);
    setTimeout(() => clearError(), 8000);
  };

  // 🔧 HANDLERS PARA TELEFONE E LOCALIZAÇÃO
  const handlePhoneChange = (phone: string) => {
    setPersonalForm((prev) => ({ ...prev, phone }));
    setPhoneError('');
  };

  const handleLocationChange = (location: LocationData) => {
    setPersonalForm((prev) => ({ ...prev, location }));
  };

  // 🔧 VALIDAÇÃO
  const validatePersonalForm = () => {
    const errors: string[] = [];

    if (!personalForm.firstName.trim()) {
      errors.push('Nome é obrigatório');
    }

    // Validação de telefone
    if (personalForm.phone && personalForm.phone.trim() !== '') {
      const phoneValidationResult = validatePhoneNumber(personalForm.phone);
      if (!phoneValidationResult.isValid && !phoneValidationResult.isEmpty) {
        errors.push(phoneValidationResult.error || 'Telefone inválido');
        setPhoneError(phoneValidationResult.error || 'Telefone inválido');
      }
    }

    if (errors.length > 0) {
      showError(errors.join('; '));
      return false;
    }

    return true;
  };

  // 🔧 FUNÇÃO SALVAR DADOS PESSOAIS CORRIGIDA - SEM INVALIDAÇÃO MANUAL
  const savePersonalData = useCallback(async () => {
    if (!validatePersonalForm()) {
      return;
    }

    setSaving(true);

    try {
      const locationForDatabase = convertLocationDataToDatabase(
        personalForm.location
      );

      const userData = {
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        phone: personalForm.phone,
        city: locationForDatabase.city,
        state: locationForDatabase.state,
        country: locationForDatabase.country,
      };

      const success = await updateProfile({ userData });

      if (success) {
        setEditingSection(null);
        showSuccess('Dados pessoais salvos com sucesso!');
        // ✅ CACHE É INVALIDADO AUTOMATICAMENTE NO SERVIDOR
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados pessoais:', error);
      showError('Erro ao salvar dados pessoais');
    } finally {
      setSaving(false);
    }
  }, [personalForm, updateProfile]);

  // 🔧 FUNÇÃO SALVAR DADOS DE ESTUDO CORRIGIDA - SEM INVALIDAÇÃO MANUAL
  const saveStudyData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: studyForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess('Configurações de estudo salvas com sucesso!');
        // ✅ CACHE É INVALIDADO AUTOMATICAMENTE NO SERVIDOR
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados de estudo:', error);
      showError('Erro ao salvar dados de estudo');
    } finally {
      setSaving(false);
    }
  }, [studyForm, updateProfile]);

  // 🔧 FUNÇÃO SALVAR PREFERÊNCIAS CORRIGIDA - SEM INVALIDAÇÃO MANUAL
  const savePreferencesData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: preferencesForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess('Preferências musicais salvas com sucesso!');
        // ✅ CACHE É INVALIDADO AUTOMATICAMENTE NO SERVIDOR
      }
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
      showError('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  }, [preferencesForm, updateProfile]);

  // 🔧 FUNÇÃO SALVAR PRIVACIDADE CORRIGIDA - SEM INVALIDAÇÃO MANUAL
  const savePrivacyData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: privacyForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess('Configurações de privacidade salvas com sucesso!');
        // ✅ CACHE É INVALIDADO AUTOMATICAMENTE NO SERVIDOR
      }
    } catch (error) {
      console.error('❌ Erro ao salvar privacidade:', error);
      showError('Erro ao salvar privacidade');
    } finally {
      setSaving(false);
    }
  }, [privacyForm, updateProfile]);

  // 🔧 FUNÇÃO SALVAR COMUNICAÇÃO CORRIGIDA - SEM INVALIDAÇÃO MANUAL
  const saveCommunicationData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: communicationForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess('Configurações de comunicação salvas com sucesso!');
        // ✅ CACHE É INVALIDADO AUTOMATICAMENTE NO SERVIDOR
      }
    } catch (error) {
      console.error('❌ Erro ao salvar comunicação:', error);
      showError('Erro ao salvar comunicação');
    } finally {
      setSaving(false);
    }
  }, [communicationForm, updateProfile]);

  // Handle array fields (like preferredGenres)
  const handleGenreToggle = useCallback((genre: string) => {
    setPreferencesForm((prev) => {
      const currentGenres = prev.preferredGenres || [];
      const isSelected = currentGenres.includes(genre);

      return {
        ...prev,
        preferredGenres: isSelected
          ? currentGenres.filter((g) => g !== genre)
          : [...currentGenres, genre],
      };
    });
  }, []);

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
                  <FiBookOpen className="w-4 h-4 text-theme-primary" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Meu Perfil de Aluno
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Configure suas preferências de estudo e comunicação
            </p>
          </div>
        </AnimatedItem>

        {/* Success Message */}
        {successMessage && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard
              hover="lift"
              className="classical-card p-4 mb-6 border-l-4 border-accent-green"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-green/10 rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-accent-green" />
                </div>
                <div className="text-accent-green font-medium">
                  {successMessage}
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Error Message */}
        {error && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard
              hover="lift"
              className="classical-card p-4 mb-6 border-l-4 border-accent-red"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent-red/10 rounded-full flex items-center justify-center">
                    <FiX className="w-4 h-4 text-accent-red" />
                  </div>
                  <div className="text-accent-red font-medium">{error}</div>
                </div>
                <button
                  onClick={clearError}
                  className="text-accent-red hover:text-accent-red/70 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Profile Sections */}
        <div className="space-y-8">
          {/* 🔧 1. INFORMAÇÕES PESSOAIS */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Informações Pessoais
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Seus dados básicos e informações de contato
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'personal' ? null : 'personal'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'personal' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'personal' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={personalForm.firstName}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder="Seu primeiro nome"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Sobrenome
                      </label>
                      <input
                        type="text"
                        value={personalForm.lastName}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder="Seu sobrenome"
                      />
                    </div>
                  </div>

                  <div>
                    <InternationalPhoneInput
                      value={personalForm.phone}
                      onChange={handlePhoneChange}
                      disabled={saving}
                      label="Telefone/WhatsApp"
                      placeholder="Digite seu número"
                      defaultCountry="+55"
                      showLabel={true}
                      error={phoneError}
                    />

                    {/* 🆕 AVISO DE VALIDAÇÃO DE TELEFONE */}
                    {phoneError &&
                      phoneValidation.showError &&
                      phoneValidation.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 mt-4">
                          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-red-800">
                              Telefone inválido
                            </h4>
                            <p className="text-sm text-red-700 mt-1">
                              {phoneValidation.error}
                            </p>
                            {phoneValidation.progressMessage && (
                              <p className="text-xs text-red-600 mt-1">
                                {phoneValidation.progressMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* 🆕 LOCALIZAÇÃO */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FiMapPin className="w-4 h-4 text-brand-primary" />
                      <h4 className="font-medium text-theme-primary">
                        Localização
                      </h4>
                    </div>

                    <LocationSelector
                      value={personalForm.location}
                      onChange={handleLocationChange}
                      disabled={saving}
                      showLabels={false}
                      className="space-y-3"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={savePersonalData}
                      disabled={
                        saving || !canProceedWithPhone(personalForm.phone)
                      }
                      className="btn-classical-primary flex items-center space-x-2"
                      title={
                        phoneError
                          ? `Não é possível salvar: ${phoneError}`
                          : undefined
                      }
                    >
                      {saving ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Nome
                      </label>
                      <div className="text-theme-primary font-medium">
                        {profile?.user.firstName} {profile?.user.lastName}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Email
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiMail className="w-4 h-4" />
                        <span>{profile?.user.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Telefone
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiPhone className="w-4 h-4" />
                        <span>{profile?.user.phone || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Localização
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>
                          {profile?.user.city && profile?.user.state
                            ? `${profile.user.city}, ${profile.user.state}`
                            : profile?.user.country || 'Não informado'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Aluno desde
                      </label>
                      <div className="text-theme-primary font-medium">
                        {profile?.enrollmentDate
                          ? new Date(profile.enrollmentDate).toLocaleDateString(
                              'pt-BR'
                            )
                          : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Status
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-green/10 text-accent-green">
                          {profile?.status || 'Ativo'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 🔧 2. CONFIGURAÇÕES DE ESTUDO */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiBookOpen className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Configurações de Estudo
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Seus objetivos e preferências de aprendizado
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'study' ? null : 'study'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'study' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'study' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Nível Atual
                      </label>
                      <select
                        value={studyForm.level}
                        onChange={(e) =>
                          setStudyForm((prev) => ({
                            ...prev,
                            level: e.target.value as any,
                          }))
                        }
                        className="input-classical w-full"
                        disabled={saving}
                      >
                        {skillLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Tempo de Prática Semanal (minutos)
                      </label>
                      <input
                        type="number"
                        value={studyForm.practiceTime}
                        onChange={(e) =>
                          setStudyForm((prev) => ({
                            ...prev,
                            practiceTime: parseInt(e.target.value) || 0,
                          }))
                        }
                        min={0}
                        max={2400}
                        className="input-classical w-full"
                        disabled={saving}
                        placeholder="Ex: 300 (5 horas)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Ritmo de Aprendizado
                    </label>
                    <select
                      value={studyForm.learningPace}
                      onChange={(e) =>
                        setStudyForm((prev) => ({
                          ...prev,
                          learningPace: e.target.value,
                        }))
                      }
                      className="input-classical w-full"
                      disabled={saving}
                    >
                      <option value="">Selecione...</option>
                      {learningPaceOptions.map((pace) => (
                        <option key={pace.value} value={pace.value}>
                          {pace.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Objetivos Musicais
                    </label>
                    <textarea
                      value={studyForm.musicalGoals}
                      onChange={(e) =>
                        setStudyForm((prev) => ({
                          ...prev,
                          musicalGoals: e.target.value,
                        }))
                      }
                      rows={3}
                      className="input-classical w-full"
                      placeholder="Descreva seus objetivos musicais..."
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Background Musical
                    </label>
                    <textarea
                      value={studyForm.musicalBackground}
                      onChange={(e) =>
                        setStudyForm((prev) => ({
                          ...prev,
                          musicalBackground: e.target.value,
                        }))
                      }
                      rows={3}
                      className="input-classical w-full"
                      placeholder="Conte sobre sua experiência musical anterior..."
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Necessidades Especiais
                    </label>
                    <textarea
                      value={studyForm.specialNeeds}
                      onChange={(e) =>
                        setStudyForm((prev) => ({
                          ...prev,
                          specialNeeds: e.target.value,
                        }))
                      }
                      rows={2}
                      className="input-classical w-full"
                      placeholder="Alguma necessidade especial de aprendizado..."
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveStudyData}
                      disabled={saving}
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {saving ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Nível Atual
                      </label>
                      <div className="text-theme-primary font-medium">
                        {skillLevels.find((l) => l.value === profile?.level)
                          ?.label || 'Não definido'}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Tempo de Prática Semanal
                      </label>
                      <div className="text-theme-primary font-medium">
                        {profile?.practiceTime
                          ? `${profile.practiceTime} minutos`
                          : 'Não definido'}
                      </div>
                    </div>
                  </div>

                  {profile?.learningPace && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Ritmo de Aprendizado
                      </label>
                      <div className="text-theme-primary font-medium">
                        {learningPaceOptions.find(
                          (p) => p.value === profile.learningPace
                        )?.label || profile.learningPace}
                      </div>
                    </div>
                  )}

                  {profile?.musicalGoals && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Objetivos Musicais
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {profile.musicalGoals}
                      </div>
                    </div>
                  )}

                  {profile?.musicalBackground && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Background Musical
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {profile.musicalBackground}
                      </div>
                    </div>
                  )}

                  {profile?.specialNeeds && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Necessidades Especiais
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {profile.specialNeeds}
                      </div>
                    </div>
                  )}

                  {!profile?.musicalGoals && !profile?.musicalBackground && (
                    <div className="text-center py-8">
                      <FiBookOpen className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-theme-primary mb-2">
                        Complete suas configurações de estudo
                      </h3>
                      <p className="text-theme-tertiary mb-4">
                        Adicione seus objetivos e background musical
                      </p>
                      <button
                        onClick={() => setEditingSection('study')}
                        className="btn-classical-primary"
                      >
                        Configurar Agora
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 🔧 3. PREFERÊNCIAS MUSICAIS */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-lg flex items-center justify-center">
                    <FiHeart className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Preferências Musicais
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Seus gêneros musicais favoritos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'preferences' ? null : 'preferences'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'preferences' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'preferences' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-4">
                      Gêneros Musicais Preferidos
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {musicalGenres.map((genre) => {
                        const isSelected =
                          preferencesForm.preferredGenres?.includes(genre);
                        return (
                          <button
                            key={genre}
                            onClick={() => handleGenreToggle(genre)}
                            disabled={saving}
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

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={savePreferencesData}
                      disabled={saving}
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {saving ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {profile?.preferredGenres &&
                  profile.preferredGenres.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                      {profile.preferredGenres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm text-center"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiHeart className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-theme-primary mb-2">
                        Adicione seus gêneros favoritos
                      </h3>
                      <p className="text-theme-tertiary mb-4">
                        Selecione os gêneros musicais que mais gosta
                      </p>
                      <button
                        onClick={() => setEditingSection('preferences')}
                        className="btn-classical-primary"
                      >
                        Escolher Gêneros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 🔧 4. CONFIGURAÇÕES DE PRIVACIDADE */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiShield className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Configurações de Privacidade
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Controle a visibilidade do seu progresso
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'privacy' ? null : 'privacy'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'privacy' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'privacy' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Visibilidade do Perfil
                    </label>
                    <select
                      value={privacyForm.profileVisibility}
                      onChange={(e) =>
                        setPrivacyForm((prev) => ({
                          ...prev,
                          profileVisibility: e.target.value,
                        }))
                      }
                      className="input-classical w-full"
                      disabled={saving}
                    >
                      {profileVisibilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-theme-secondary/5 rounded-lg">
                      <div>
                        <div className="font-medium text-theme-primary">
                          Permitir Progresso Público
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Permite que outros vejam seu progresso de aprendizado
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setPrivacyForm((prev) => ({
                            ...prev,
                            allowPublicProgress: !prev.allowPublicProgress,
                          }))
                        }
                        disabled={saving}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          privacyForm.allowPublicProgress
                            ? 'bg-brand-primary'
                            : 'bg-theme-tertiary'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-theme-primary rounded-full transition-transform ${
                            privacyForm.allowPublicProgress
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
                          setPrivacyForm((prev) => ({
                            ...prev,
                            allowProgressShare: !prev.allowProgressShare,
                          }))
                        }
                        disabled={saving}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          privacyForm.allowProgressShare
                            ? 'bg-brand-primary'
                            : 'bg-theme-tertiary'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-theme-primary rounded-full transition-transform ${
                            privacyForm.allowProgressShare
                              ? 'translate-x-7'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={savePrivacyData}
                      disabled={saving}
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {saving ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-theme-tertiary">
                      Visibilidade do Perfil
                    </label>
                    <div className="text-theme-primary font-medium">
                      {profileVisibilityOptions.find(
                        (option) => option.value === profile?.profileVisibility
                      )?.label || 'Não definido'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-theme-secondary/5 rounded-lg">
                      <span className="text-theme-primary">
                        Progresso Público
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile?.allowPublicProgress
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-theme-secondary text-theme-tertiary'
                        }`}
                      >
                        {profile?.allowPublicProgress
                          ? 'Ativado'
                          : 'Desativado'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-theme-secondary/5 rounded-lg">
                      <span className="text-theme-primary">
                        Compartilhar com Professores
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile?.allowProgressShare
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-theme-secondary text-theme-tertiary'
                        }`}
                      >
                        {profile?.allowProgressShare ? 'Ativado' : 'Desativado'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 🔧 5. CONFIGURAÇÕES DE COMUNICAÇÃO */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-lg flex items-center justify-center">
                    <FiMessageSquare className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Configurações de Comunicação
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Como você prefere ser contatado
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'communication'
                        ? null
                        : 'communication'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'communication' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'communication' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Forma de Contato Preferida
                    </label>
                    <select
                      value={communicationForm.preferredContact}
                      onChange={(e) =>
                        setCommunicationForm((prev) => ({
                          ...prev,
                          preferredContact: e.target.value,
                        }))
                      }
                      className="input-classical w-full"
                      disabled={saving}
                    >
                      {contactPreferences.map((pref) => (
                        <option key={pref.value} value={pref.value}>
                          {pref.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveCommunicationData}
                      disabled={saving}
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {saving ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-theme-tertiary">
                    Forma de Contato Preferida
                  </label>
                  <div className="text-theme-primary font-medium">
                    {contactPreferences.find(
                      (pref) => pref.value === profile?.preferredContact
                    )?.label || 'Não definido'}
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 🔧 6. MEU REPERTÓRIO (READ-ONLY) */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-lg flex items-center justify-center">
                    <FiMusic className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Meu Repertório
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Suas obras favoritas e progresso de estudo
                    </p>
                  </div>
                </div>

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
                      <FiCheck className="w-5 h-5 mr-2" />
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

              {/* Statistics */}
              <div className="mt-8 pt-6 border-t border-theme-secondary">
                <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center">
                  <FiTrendingUp className="w-5 h-5 mr-2" />
                  Estatísticas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-blue">
                      {profile.totalLessonsAttended}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      Aulas Assistidas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-green">
                      {profile.completedAssignments}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      Tarefas Concluídas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-orange">
                      {profile.currentStreak}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      Sequência Atual
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-purple">
                      {profile.longestStreak}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      Melhor Sequência
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Teachers */}
              {profile.teachers.length > 0 && (
                <div className="mt-8 pt-6 border-t border-theme-secondary">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Meus Professores
                  </h3>
                  <div className="space-y-3">
                    {profile.teachers
                      .filter((t) => t.isActive)
                      .map((teacher) => (
                        <div
                          key={teacher.teacherId}
                          className="flex items-center space-x-3 p-3 bg-theme-secondary/10 rounded-lg"
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
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
