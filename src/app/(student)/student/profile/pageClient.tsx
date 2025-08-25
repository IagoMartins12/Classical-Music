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
import LocationSelector from '../../../components/Common/LocationSelector';
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
import Select from '@/app/components/Common/Select';
import { useTranslation } from '@/app/hooks/useTranslation';

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
  const { t } = useTranslation({ sections: ['student/profile'] });

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

  const skillLevels = [
    { value: 'BEGINNER', label: t('beginner') },
    { value: 'INTERMEDIATE', label: t('intermediate') },
    { value: 'ADVANCED', label: t('advanced') },
  ];

  const learningPaceOptions = [
    { value: '', label: t('pace_select') },
    { value: 'slow', label: t('pace_slow') },
    { value: 'medium', label: t('pace_medium') },
    { value: 'fast', label: t('pace_fast') },
  ];

  const profileVisibilityOptions = [
    { value: 'public', label: t('visibility_public') },
    { value: 'teacher_only', label: t('visibility_teacher_only') },
    { value: 'private', label: t('visibility_private') },
  ];

  const contactPreferences = [
    { value: 'whatsapp', label: t('contact_whatsapp') },
    { value: 'email', label: t('contact_email') },
    { value: 'both', label: t('contact_both') },
  ];

  // Local state
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Forms para cada seção
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

  // Validação de telefone em tempo real
  const phoneValidation = usePhoneValidation(personalForm.phone);
  const [phoneError, setPhoneError] = useState<string>('');

  // Initialize with server data
  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  const toast = useToast();

  // Sincronizar forms quando profile mudar
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

  // Handlers para telefone e localização
  const handlePhoneChange = (phone: string) => {
    setPersonalForm((prev) => ({ ...prev, phone }));
    setPhoneError('');
  };

  const handleLocationChange = (location: any) => {
    setPersonalForm((prev) => ({ ...prev, location }));
  };

  // Validação
  const validatePersonalForm = () => {
    const errors: string[] = [];

    if (!personalForm.firstName.trim()) {
      errors.push(t('first_name_required'));
    }

    // Validação de telefone
    if (personalForm.phone && personalForm.phone.trim() !== '') {
      const phoneValidationResult = validatePhoneNumber(personalForm.phone);
      if (!phoneValidationResult.isValid && !phoneValidationResult.isEmpty) {
        errors.push(phoneValidationResult.error || t('phone_invalid'));
        setPhoneError(phoneValidationResult.error || t('phone_invalid'));
      }
    }

    if (errors.length > 0) {
      showError(errors.join('; '));
      return false;
    }

    return true;
  };

  // Função salvar dados pessoais
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
        showSuccess(t('personal_data_saved'));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados pessoais:', error);
      showError(t('error_saving_personal'));
    } finally {
      setSaving(false);
    }
  }, [personalForm, updateProfile, t]);

  // Função salvar dados de estudo
  const saveStudyData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: studyForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess(t('study_settings_saved'));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados de estudo:', error);
      showError(t('error_saving_study'));
    } finally {
      setSaving(false);
    }
  }, [studyForm, updateProfile, t]);

  // Função salvar preferências
  const savePreferencesData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: preferencesForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess(t('musical_preferences_saved'));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
      showError(t('error_saving_preferences'));
    } finally {
      setSaving(false);
    }
  }, [preferencesForm, updateProfile, t]);

  // Função salvar privacidade
  const savePrivacyData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: privacyForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess(t('privacy_settings_saved'));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar privacidade:', error);
      showError(t('error_saving_privacy'));
    } finally {
      setSaving(false);
    }
  }, [privacyForm, updateProfile, t]);

  // Função salvar comunicação
  const saveCommunicationData = useCallback(async () => {
    setSaving(true);

    try {
      const success = await updateProfile({
        studentData: communicationForm,
      });

      if (success) {
        setEditingSection(null);
        showSuccess(t('communication_settings_saved'));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar comunicação:', error);
      showError(t('error_saving_communication'));
    } finally {
      setSaving(false);
    }
  }, [communicationForm, updateProfile, t]);

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
              {t('error_loading_profile')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage}
            </p>
            <button onClick={refreshProfile} className="btn-classical-primary">
              {t('try_again')}
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
            <p className="text-theme-secondary">{t('loading_profile')}</p>
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
              {t('title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('subtitle')}
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
          {/* 1. INFORMAÇÕES PESSOAIS */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('personal_info')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('personal_info_subtitle')}
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
                    {editingSection === 'personal' ? t('cancel') : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'personal' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('first_name')} *
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
                        {t('last_name')}
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
                      label={t('phone_whatsapp')}
                      placeholder="Digite seu número"
                      showLabel={true}
                      error={phoneError}
                    />

                    {/* Aviso de validação de telefone */}
                    {phoneError &&
                      phoneValidation.showError &&
                      phoneValidation.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 mt-4">
                          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-red-800">
                              {t('invalid_phone_title')}
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

                  {/* Localização */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FiMapPin className="w-4 h-4 text-brand-primary" />
                      <h4 className="font-medium text-theme-primary">
                        {t('location')}
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
                      {t('cancel')}
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
                      <span>{t('save')}</span>
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
                        {t('email')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiMail className="w-4 h-4" />
                        <span>{profile?.user.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('phone')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiPhone className="w-4 h-4" />
                        <span>{profile?.user.phone || t('not_informed')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('location')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>
                          {profile?.user.city && profile?.user.state
                            ? `${profile.user.city}, ${profile.user.state}`
                            : profile?.user.country || t('not_informed')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('student_since')}
                      </label>
                      <div className="text-theme-primary font-medium">
                        {profile?.enrollmentDate
                          ? new Date(profile.enrollmentDate).toLocaleDateString(
                              'pt-BR'
                            )
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 2. CONFIGURAÇÕES DE ESTUDO */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiBookOpen className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('study_settings')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('study_settings_subtitle')}
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
                    {editingSection === 'study' ? t('cancel') : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'study' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('current_level')}
                      </label>
                      <Select
                        options={skillLevels}
                        value={studyForm.level}
                        onChange={(e) =>
                          setStudyForm((prev) => ({
                            ...prev,
                            level: e.target.value as any,
                          }))
                        }
                        className="input-classical w-full"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('weekly_practice_time')}
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
                        placeholder={t('practice_time_placeholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('learning_pace')}
                    </label>
                    <Select
                      options={learningPaceOptions}
                      value={studyForm.learningPace}
                      onChange={(e) =>
                        setStudyForm((prev) => ({
                          ...prev,
                          learningPace: e.target.value,
                        }))
                      }
                      className="input-classical w-full"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('musical_goals')}
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
                      placeholder={t('musical_goals_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('musical_background')}
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
                      placeholder={t('musical_background_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('special_needs')}
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
                      placeholder={t('special_needs_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      {t('cancel')}
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
                      <span>{t('save')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('current_level')}
                      </label>
                      <div className="text-theme-primary font-medium">
                        {skillLevels.find((l) => l.value === profile?.level)
                          ?.label || t('not_defined')}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('weekly_practice_time')}
                      </label>
                      <div className="text-theme-primary font-medium">
                        {profile?.practiceTime
                          ? `${profile.practiceTime} minutos`
                          : t('not_defined')}
                      </div>
                    </div>
                  </div>

                  {profile?.learningPace && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('learning_pace')}
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
                        {t('musical_goals')}
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {profile.musicalGoals}
                      </div>
                    </div>
                  )}

                  {profile?.musicalBackground && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('musical_background')}
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {profile.musicalBackground}
                      </div>
                    </div>
                  )}

                  {profile?.specialNeeds && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('special_needs')}
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
                        {t('complete_study_settings')}
                      </h3>
                      <p className="text-theme-tertiary mb-4">
                        {t('add_goals_background')}
                      </p>
                      <button
                        onClick={() => setEditingSection('study')}
                        className="btn-classical-primary"
                      >
                        {t('configure_now')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 3. PREFERÊNCIAS MUSICAIS */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-lg flex items-center justify-center">
                    <FiHeart className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('musical_preferences')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('musical_preferences_subtitle')}
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
                    {editingSection === 'preferences' ? t('cancel') : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'preferences' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-4">
                      {t('preferred_genres')}
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
                      {t('cancel')}
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
                      <span>{t('save')}</span>
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
                        {t('add_favorite_genres')}
                      </h3>
                      <p className="text-theme-tertiary mb-4">
                        {t('select_favorite_genres')}
                      </p>
                      <button
                        onClick={() => setEditingSection('preferences')}
                        className="btn-classical-primary"
                      >
                        {t('choose_genres')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 4. CONFIGURAÇÕES DE PRIVACIDADE */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiShield className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('privacy_settings')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('privacy_settings_subtitle')}
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
                    {editingSection === 'privacy' ? t('cancel') : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'privacy' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('profile_visibility')}
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
                          {t('allow_public_progress')}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {t('allow_public_progress_description')}
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
                          {t('share_progress_teachers')}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {t('share_progress_teachers_description')}
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
                      {t('cancel')}
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
                      <span>{t('save')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-theme-tertiary">
                      {t('profile_visibility')}
                    </label>
                    <div className="text-theme-primary font-medium">
                      {profileVisibilityOptions.find(
                        (option) => option.value === profile?.profileVisibility
                      )?.label || t('not_defined')}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-theme-secondary/5 rounded-lg">
                      <span className="text-theme-primary">
                        {t('public_progress')}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile?.allowPublicProgress
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-theme-secondary text-theme-tertiary'
                        }`}
                      >
                        {profile?.allowPublicProgress
                          ? t('activated')
                          : t('deactivated')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-theme-secondary/5 rounded-lg">
                      <span className="text-theme-primary">
                        {t('share_with_teachers')}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile?.allowProgressShare
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-theme-secondary text-theme-tertiary'
                        }`}
                      >
                        {profile?.allowProgressShare
                          ? t('activated')
                          : t('deactivated')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 5. CONFIGURAÇÕES DE COMUNICAÇÃO */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-lg flex items-center justify-center">
                    <FiMessageSquare className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('communication_settings')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('communication_settings_subtitle')}
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
                    {editingSection === 'communication'
                      ? t('cancel')
                      : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'communication' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('preferred_contact')}
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
                      {t('cancel')}
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
                      <span>{t('save')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-theme-tertiary">
                    {t('preferred_contact')}
                  </label>
                  <div className="text-theme-primary font-medium">
                    {contactPreferences.find(
                      (pref) => pref.value === profile?.preferredContact
                    )?.label || t('not_defined')}
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* 6. MEU REPERTÓRIO (READ-ONLY) */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-lg flex items-center justify-center">
                    <FiMusic className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('my_repertoire')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('my_repertoire_subtitle')}
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
                  <span>{t('refresh')}</span>
                </button>
              </div>

              {studyData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Want to Learn */}
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center">
                      <FiTarget className="w-5 h-5 mr-2" />
                      {t('want_to_learn')} ({studyData.wantToLearn.length})
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
                            +{studyData.wantToLearn.length - 5}{' '}
                            {t('more_works')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Learned */}
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center">
                      <FiCheck className="w-5 h-5 mr-2" />
                      {t('already_learned')} ({studyData.learned.length})
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
                              {t('mastery')}: {work.mastery}/5
                            </div>
                            {work.wouldRecommend && (
                              <div className="text-xs text-accent-blue">
                                ⭐ {t('recommends')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {studyData.learned.length > 5 && (
                        <div className="text-center">
                          <span className="text-sm text-theme-tertiary">
                            +{studyData.learned.length - 5} {t('more_works')}
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
                      {t('recent_annotations')}
                    </h3>
                    <div className="space-y-2">
                      {studyData.recentAnnotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="p-3 bg-theme-secondary/10 rounded-lg bg-theme-elevated"
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

              {/* Active Teachers */}
              {profile.teachers.length > 0 && (
                <div className="mt-8 pt-6 border-t border-theme-secondary">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    {t('my_teachers')}
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
                              {teacher.totalLessons} {t('lessons')} •{' '}
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
