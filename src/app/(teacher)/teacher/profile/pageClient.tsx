// app/teacher/profile/pageClient.tsx - Client Component CORRIGIDO
'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiUser,
  FiSave,
  FiEdit3,
  FiGlobe,
  FiAward,
  FiMusic,
  FiClock,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiMapPin,
  FiMail,
  FiPhone,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { TeacherProfileData, TeacherProfile } from './pageServer';
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
import { TeacherStatus } from '@prisma/client';
import Input from '@/app/components/Common/Inputs';
import { useTranslation } from '@/app/context/TranslationContext';

interface TeacherProfilePageClientProps {
  initialData: TeacherProfileData | null;
  teacherProfile: TeacherProfile;
  isNew?: boolean;
  errorMessage?: string;
}

type EditingSection =
  | 'personal'
  | 'professional'
  | 'teaching'
  | 'public'
  | null;

const COMMON_INSTRUMENTS = [
  'Piano',
  'Violão',
  'Guitarra',
  'Violino',
  'Flauta',
  'Bateria',
  'Contrabaixo',
  'Violoncelo',
  'Saxofone',
  'Trompete',
  'Teclado',
  'Ukulele',
  'Harmônica',
  'Clarinete',
  'Trombone',
];

const COMMON_SPECIALTIES = [
  'Música Clássica',
  'Jazz',
  'Popular Brasileira',
  'Rock',
  'Blues',
  'Música Erudita',
  'Bossa Nova',
  'Samba',
  'Choro',
  'Música de Câmara',
  'Orquestra',
  'Teoria Musical',
  'Harmonia',
  'Composição',
  'Improvisação',
];

export default function TeacherProfilePageClient({
  initialData,
  teacherProfile,
  isNew = false,
  errorMessage,
}: TeacherProfilePageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/profile'] });

  // States
  const [data, setData] = useState(initialData);
  const [editingSection, setEditingSection] = useState<EditingSection>(
    isNew ? 'personal' : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(errorMessage);
  const [successMessage, setSuccessMessage] = useState('');

  // Inicialização correta dos forms com dados completos
  const [personalForm, setPersonalForm] = useState(() => ({
    firstName: teacherProfile.name.split(' ')[0] || '',
    lastName: teacherProfile.name.split(' ').slice(1).join(' ') || '',
    email: teacherProfile.email,
    phone: data?.user.phone || '',
    location: convertDatabaseToLocationData({
      country: data?.user.country,
      state: data?.user.state,
      city: data?.user.city,
    }),
  }));

  const [professionalForm, setProfessionalForm] = useState(() => ({
    bio: data?.bio || '',
    experience: data?.experience || '',
    education: data?.education || '',
    achievements: data?.achievements || '',
    website: data?.website || '',
    socialMedia: data?.socialMedia || {},
  }));

  const [teachingForm, setTeachingForm] = useState(() => ({
    instruments: data?.instruments || [],
    specialties: data?.specialties || [],
    teachingMethod: data?.teachingMethod || '',
    ageGroups: data?.ageGroups || [],
    skillLevels: data?.skillLevels || [],
    defaultLessonDuration: data?.defaultLessonDuration || 60,
    maxStudentsPerWeek: data?.maxStudentsPerWeek || 50,
    timezone: data?.timezone || 'America/Sao_Paulo',
  }));

  const [publicForm, setPublicForm] = useState(() => ({
    isPublicProfile: data?.isPublicProfile || false,
    publicBio: data?.publicBio || '',
    highlightedWorks: data?.highlightedWorks || [],
  }));

  // Validação de telefone em tempo real
  const phoneValidation = usePhoneValidation(personalForm.phone);
  const [phoneError, setPhoneError] = useState<string>('');

  // Age groups options traduzidas
  const AGE_GROUPS = [
    { value: 'Crianças (4-12 anos)', label: t('age_children') },
    { value: 'Adolescentes (13-17 anos)', label: t('age_teens') },
    { value: 'Adultos (18-60 anos)', label: t('age_adults') },
    { value: 'Terceira Idade (60+ anos)', label: t('age_seniors') },
  ];

  const SKILL_LEVELS = [
    { value: 'Iniciante', label: t('level_beginner') },
    { value: 'Intermediário', label: t('level_intermediate') },
    { value: 'Avançado', label: t('level_advanced') },
    { value: 'Profissional', label: t('level_professional') },
  ];

  // Sincronizar forms quando data mudar
  useEffect(() => {
    if (data) {
      setPersonalForm((prev) => ({
        ...prev,
        phone: data.user.phone || '',
        location: convertDatabaseToLocationData({
          country: data.user.country,
          state: data.user.state,
          city: data.user.city,
        }),
      }));

      setProfessionalForm({
        bio: data.bio || '',
        experience: data.experience || '',
        education: data.education || '',
        achievements: data.achievements || '',
        website: data.website || '',
        socialMedia: data.socialMedia || {},
      });

      setTeachingForm({
        instruments: data.instruments || [],
        specialties: data.specialties || [],
        teachingMethod: data.teachingMethod || '',
        ageGroups: data.ageGroups || [],
        skillLevels: data.skillLevels || [],
        defaultLessonDuration: data.defaultLessonDuration || 60,
        maxStudentsPerWeek: data.maxStudentsPerWeek || 50,
        timezone: data.timezone || 'America/Sao_Paulo',
      });

      setPublicForm({
        isPublicProfile: data.isPublicProfile || false,
        publicBio: data.publicBio || '',
        highlightedWorks: data.highlightedWorks || [],
      });
    }
  }, [data]);

  // Helper functions
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 8000);
  };

  // Handlers para telefone e localização
  const handlePhoneChange = (phone: string) => {
    setPersonalForm((prev) => ({ ...prev, phone }));
    setPhoneError('');
  };

  const handleLocationChange = (location: LocationData) => {
    setPersonalForm((prev) => ({ ...prev, location }));
  };

  // Validação melhorada
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

  // Função salvar dados pessoais corrigida sem reload forçado
  const savePersonalData = useCallback(async () => {
    if (!validatePersonalForm()) {
      return;
    }

    setSaving(true);
    setError('');

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

      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar dados pessoais');
      }

      const result = await response.json();

      if (result.success) {
        // Atualizar estado imediatamente sem reload
        setData(result.profile);
        setEditingSection(null);
        showSuccess(t('data_saved_success'));

        // Atualizar forms com os novos dados
        setPersonalForm((prev) => ({
          ...prev,
          phone: result.profile.user.phone || '',
          location: convertDatabaseToLocationData({
            country: result.profile.user.country,
            state: result.profile.user.state,
            city: result.profile.user.city,
          }),
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados pessoais:', error);
      showError(
        error instanceof Error ? error.message : 'Erro ao salvar dados pessoais'
      );
    } finally {
      setSaving(false);
    }
  }, [personalForm, t]);

  // Função salvar dados profissionais corrigida sem reload
  const saveProfessionalData = useCallback(async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherData: professionalForm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Erro ao salvar dados profissionais'
        );
      }

      const result = await response.json();

      if (result.success) {
        // Atualizar estado imediatamente
        setData(result.profile);
        setEditingSection(null);
        showSuccess(t('professional_data_saved'));

        // Sincronizar form com dados atualizados
        setProfessionalForm({
          bio: result.profile.bio || '',
          experience: result.profile.experience || '',
          education: result.profile.education || '',
          achievements: result.profile.achievements || '',
          website: result.profile.website || '',
          socialMedia: result.profile.socialMedia || {},
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados profissionais:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar dados profissionais'
      );
    } finally {
      setSaving(false);
    }
  }, [professionalForm, t]);

  // Função salvar dados de ensino corrigida sem reload
  const saveTeachingData = useCallback(async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherData: teachingForm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar dados de ensino');
      }

      const result = await response.json();

      if (result.success) {
        // Atualizar estado imediatamente
        setData(result.profile);
        setEditingSection(null);
        showSuccess(t('teaching_settings_saved'));

        // Sincronizar form com dados atualizados
        setTeachingForm({
          instruments: result.profile.instruments || [],
          specialties: result.profile.specialties || [],
          teachingMethod: result.profile.teachingMethod || '',
          ageGroups: result.profile.ageGroups || [],
          skillLevels: result.profile.skillLevels || [],
          defaultLessonDuration: result.profile.defaultLessonDuration || 60,
          maxStudentsPerWeek: result.profile.maxStudentsPerWeek || 50,
          timezone: result.profile.timezone || 'America/Sao_Paulo',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados de ensino:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar dados de ensino'
      );
    } finally {
      setSaving(false);
    }
  }, [teachingForm, t]);

  // Função salvar perfil público corrigida sem reload
  const savePublicData = useCallback(async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherData: publicForm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar perfil público');
      }

      const result = await response.json();

      if (result.success) {
        // Atualizar estado imediatamente
        setData(result.profile);
        setEditingSection(null);
        showSuccess(t('public_profile_updated'));

        // Sincronizar form com dados atualizados
        setPublicForm({
          isPublicProfile: result.profile.isPublicProfile || false,
          publicBio: result.profile.publicBio || '',
          highlightedWorks: result.profile.highlightedWorks || [],
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar perfil público:', error);
      showError(
        error instanceof Error ? error.message : 'Erro ao salvar perfil público'
      );
    } finally {
      setSaving(false);
    }
  }, [publicForm, t]);

  // Array helpers
  const addToArray = (
    field: keyof typeof teachingForm,
    value: string,
    _options: string[]
  ) => {
    const currentArray = teachingForm[field] as string[];
    if (!currentArray.includes(value)) {
      setTeachingForm((prev) => ({
        ...prev,
        [field]: [...currentArray, value],
      }));
    }
  };

  const removeFromArray = (field: keyof typeof teachingForm, value: string) => {
    const currentArray = teachingForm[field] as string[];
    setTeachingForm((prev) => ({
      ...prev,
      [field]: currentArray.filter((item) => item !== value),
    }));
  };

  // Helper para exibir status do professor
  const getStatusDisplay = (status: TeacherStatus) => {
    switch (status) {
      case TeacherStatus.ACTIVE:
        return { label: t('status_active'), color: 'accent-green' };
      case TeacherStatus.PENDING:
        return { label: t('status_pending'), color: 'accent-yellow' };
      case TeacherStatus.INACTIVE:
        return { label: t('status_inactive'), color: 'accent-red' };
      default:
        return { label: status || 'Desconhecido', color: 'theme-tertiary' };
    }
  };

  // Render error state
  if (error && !data) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiUser className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_profile')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary flex mx-auto items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>{t('reload_page')}</span>
            </button>
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
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUser className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('page_subtitle')}
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
                  onClick={() => setError('')}
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
          {/* Personal Information - Seção corrigida */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('personal_information')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('personal_description')}
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
                      placeholder={t('phone_placeholder')}
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
                              {t('phone_invalid')}
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
                        {t('name_label')}
                      </label>
                      <div className="text-theme-primary font-medium">
                        {data?.user.firstName} {data?.user.lastName}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('email_label')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiMail className="w-4 h-4" />
                        <span>{data?.user.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('phone_label')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiPhone className="w-4 h-4" />
                        <span>{data?.user.phone || t('not_informed')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('location_label')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>
                          {data?.user.city && data?.user.state
                            ? `${data.user.city}, ${data.user.state}`
                            : data?.user.country || t('not_informed')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('member_since')}
                      </label>
                      <div className="text-theme-primary font-medium">
                        {data?.createdAt
                          ? new Date(data.createdAt).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('status')}
                      </label>
                      <div className="flex items-center space-x-2">
                        {data?.status && (
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${
                              getStatusDisplay(data.status as TeacherStatus)
                                .color
                            }/10 text-${
                              getStatusDisplay(data.status as TeacherStatus)
                                .color
                            }`}
                          >
                            {
                              getStatusDisplay(data.status as TeacherStatus)
                                .label
                            }
                          </div>
                        )}
                        {data?.isVerified && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green">
                            <FiCheck className="w-3 h-3 mr-1" />
                            {t('verified')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Professional Information */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center">
                    <FiAward className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('professional_information')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('professional_description')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'professional' ? null : 'professional'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'professional'
                      ? t('cancel')
                      : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'professional' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('biography')}
                    </label>
                    <textarea
                      value={professionalForm.bio}
                      onChange={(e) =>
                        setProfessionalForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={4}
                      className="input-classical w-full"
                      placeholder={t('biography_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('experience')}
                      </label>
                      <textarea
                        value={professionalForm.experience}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            experience: e.target.value,
                          }))
                        }
                        rows={3}
                        className="input-classical w-full"
                        placeholder={t('experience_placeholder')}
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('education')}
                      </label>
                      <textarea
                        value={professionalForm.education}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            education: e.target.value,
                          }))
                        }
                        rows={3}
                        className="input-classical w-full"
                        placeholder={t('education_placeholder')}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('achievements')}
                    </label>
                    <textarea
                      value={professionalForm.achievements}
                      onChange={(e) =>
                        setProfessionalForm((prev) => ({
                          ...prev,
                          achievements: e.target.value,
                        }))
                      }
                      rows={3}
                      className="input-classical w-full"
                      placeholder={t('achievements_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1  gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('website')}
                      </label>
                      <Input
                        widhtFull
                        type="url"
                        value={professionalForm.website}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder={t('website_placeholder')}
                        disabled={saving}
                      />
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
                      onClick={saveProfessionalData}
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
                  {data?.bio && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('biography')}
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {data.bio}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.experience && (
                      <div>
                        <label className="text-sm text-theme-tertiary">
                          {t('experience')}
                        </label>
                        <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                          {data.experience}
                        </div>
                      </div>
                    )}

                    {data?.education && (
                      <div>
                        <label className="text-sm text-theme-tertiary">
                          {t('education')}
                        </label>
                        <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                          {data.education}
                        </div>
                      </div>
                    )}
                  </div>

                  {data?.achievements && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('achievements')}
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {data.achievements}
                      </div>
                    </div>
                  )}

                  {data?.website && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('website')}
                      </label>
                      <div className="text-theme-primary mt-2">
                        <a
                          href={data.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary hover:text-brand-secondary transition-colors flex items-center space-x-2"
                        >
                          <FiGlobe className="w-4 h-4" />
                          <span>{data.website}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {!data?.bio &&
                    !data?.experience &&
                    !data?.education &&
                    !data?.achievements &&
                    !data?.website && (
                      <div className="text-center py-8">
                        <FiAward className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          {t('complete_professional_profile')}
                        </h3>
                        <p className="text-theme-tertiary mb-4">
                          {t('complete_profile_description')}
                        </p>
                        <button
                          onClick={() => setEditingSection('professional')}
                          className="btn-classical-primary"
                        >
                          {t('start_now')}
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Teaching Configuration */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiMusic className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('teaching_configuration')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('teaching_description')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'teaching' ? null : 'teaching'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'teaching' ? t('cancel') : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'teaching' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-3">
                      {t('instruments_teach')}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {teachingForm.instruments.map((instrument) => (
                        <span
                          key={instrument}
                          className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{instrument}</span>
                          <button
                            onClick={() =>
                              removeFromArray('instruments', instrument)
                            }
                            className="text-accent-blue/70 hover:text-accent-red transition-colors"
                            disabled={saving}
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_INSTRUMENTS.filter(
                        (inst) => !teachingForm.instruments.includes(inst)
                      ).map((instrument) => (
                        <button
                          key={instrument}
                          onClick={() =>
                            addToArray(
                              'instruments',
                              instrument,
                              COMMON_INSTRUMENTS
                            )
                          }
                          disabled={saving}
                          className="px-3 py-1 bg-theme-elevated hover:bg-interactive-hover border border-theme-secondary hover:border-brand-primary text-theme-secondary hover:text-brand-primary rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + {instrument}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-3">
                      {t('musical_specialties')}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {teachingForm.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{specialty}</span>
                          <button
                            onClick={() =>
                              removeFromArray('specialties', specialty)
                            }
                            className="text-accent-purple/70 hover:text-accent-red transition-colors"
                            disabled={saving}
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SPECIALTIES.filter(
                        (spec) => !teachingForm.specialties.includes(spec)
                      ).map((specialty) => (
                        <button
                          key={specialty}
                          onClick={() =>
                            addToArray(
                              'specialties',
                              specialty,
                              COMMON_SPECIALTIES
                            )
                          }
                          disabled={saving}
                          className="px-3 py-1 bg-theme-elevated hover:bg-interactive-hover border border-theme-secondary hover:border-brand-primary text-theme-secondary hover:text-brand-primary rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + {specialty}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('teaching_methodology')}
                    </label>
                    <textarea
                      value={teachingForm.teachingMethod}
                      onChange={(e) =>
                        setTeachingForm((prev) => ({
                          ...prev,
                          teachingMethod: e.target.value,
                        }))
                      }
                      rows={3}
                      className="input-classical w-full"
                      placeholder={t('methodology_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        {t('age_groups')}
                      </label>
                      <div className="space-y-2">
                        {AGE_GROUPS.map((ageGroup) => (
                          <label
                            key={ageGroup.value}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="checkbox"
                              checked={teachingForm.ageGroups.includes(
                                ageGroup.value
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addToArray('ageGroups', ageGroup.value, []);
                                } else {
                                  removeFromArray('ageGroups', ageGroup.value);
                                }
                              }}
                              disabled={saving}
                              className="w-4 h-4 text-brand-primary border-theme-secondary rounded focus:ring-brand-primary disabled:opacity-50"
                            />
                            <span className="text-theme-primary text-sm">
                              {ageGroup.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        {t('skill_levels')}
                      </label>
                      <div className="space-y-2">
                        {SKILL_LEVELS.map((skillLevel) => (
                          <label
                            key={skillLevel.value}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="checkbox"
                              checked={teachingForm.skillLevels.includes(
                                skillLevel.value
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addToArray(
                                    'skillLevels',
                                    skillLevel.value,
                                    []
                                  );
                                } else {
                                  removeFromArray(
                                    'skillLevels',
                                    skillLevel.value
                                  );
                                }
                              }}
                              disabled={saving}
                              className="w-4 h-4 text-brand-primary border-theme-secondary rounded focus:ring-brand-primary disabled:opacity-50"
                            />
                            <span className="text-theme-primary text-sm">
                              {skillLevel.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('default_lesson_duration')}
                      </label>
                      <select
                        value={teachingForm.defaultLessonDuration}
                        onChange={(e) =>
                          setTeachingForm((prev) => ({
                            ...prev,
                            defaultLessonDuration: parseInt(e.target.value),
                          }))
                        }
                        className="input-classical w-full"
                        disabled={saving}
                      >
                        <option value={30}>30 {t('minutes')}</option>
                        <option value={45}>45 {t('minutes')}</option>
                        <option value={60}>60 {t('minutes')}</option>
                        <option value={90}>90 {t('minutes')}</option>
                        <option value={120}>120 {t('minutes')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('max_students_per_week')}
                      </label>
                      <input
                        type="number"
                        value={teachingForm.maxStudentsPerWeek}
                        onChange={(e) =>
                          setTeachingForm((prev) => ({
                            ...prev,
                            maxStudentsPerWeek: parseInt(e.target.value) || 50,
                          }))
                        }
                        min={1}
                        max={200}
                        className="input-classical w-full"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('timezone')}
                      </label>
                      <select
                        value={teachingForm.timezone}
                        onChange={(e) =>
                          setTeachingForm((prev) => ({
                            ...prev,
                            timezone: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        disabled={saving}
                      >
                        <option value="America/Sao_Paulo">
                          {t('timezone_sao_paulo')}
                        </option>
                        <option value="America/Rio_Branco">
                          {t('timezone_rio_branco')}
                        </option>
                        <option value="America/Manaus">
                          {t('timezone_manaus')}
                        </option>
                      </select>
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
                      onClick={saveTeachingData}
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
                        {t('instruments')}
                      </label>
                      <div className="mt-2">
                        {data?.instruments && data.instruments.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {data.instruments.map((instrument) => (
                              <span
                                key={instrument}
                                className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm"
                              >
                                {instrument}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-theme-tertiary">
                            {t('no_instruments')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('specialties')}
                      </label>
                      <div className="mt-2">
                        {data?.specialties && data.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {data.specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-theme-tertiary">
                            {t('no_specialties')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {data?.teachingMethod && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('methodology')}
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {data.teachingMethod}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('age_groups')}
                      </label>
                      <div className="mt-2">
                        {data?.ageGroups && data.ageGroups.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {data.ageGroups.map((ageGroup) => (
                              <span
                                key={ageGroup}
                                className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm"
                              >
                                {ageGroup}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-theme-tertiary">
                            {t('no_age_groups')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('skill_levels')}
                      </label>
                      <div className="mt-2">
                        {data?.skillLevels && data.skillLevels.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {data.skillLevels.map((skillLevel) => (
                              <span
                                key={skillLevel}
                                className="px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded-full text-sm"
                              >
                                {skillLevel}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-theme-tertiary">
                            {t('no_skill_levels')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('default_duration')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2 mt-1">
                        <FiClock className="w-4 h-4" />
                        <span>
                          {data?.defaultLessonDuration} {t('minutes')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('weekly_capacity')}
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2 mt-1">
                        <FiUsers className="w-4 h-4" />
                        <span>
                          {data?.maxStudentsPerWeek} {t('students')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('timezone')}
                      </label>
                      <div className="text-theme-primary font-medium mt-1">
                        {data?.timezone === 'America/Sao_Paulo'
                          ? t('timezone_sao_paulo')
                          : data?.timezone === 'America/Rio_Branco'
                          ? t('timezone_rio_branco')
                          : data?.timezone === 'America/Manaus'
                          ? t('timezone_manaus')
                          : data?.timezone}
                      </div>
                    </div>
                  </div>

                  {(!data?.instruments || data.instruments.length === 0) &&
                    (!data?.specialties || data.specialties.length === 0) && (
                      <div className="text-center py-8">
                        <FiMusic className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          {t('configure_specialties')}
                        </h3>
                        <p className="text-theme-tertiary mb-4">
                          {t('configure_description')}
                        </p>
                        <button
                          onClick={() => setEditingSection('teaching')}
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

          {/* Public Profile */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-lg flex items-center justify-center">
                    <FiGlobe className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('public_profile')}
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      {t('public_profile_description')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'public' ? null : 'public'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>
                    {editingSection === 'public' ? t('cancel') : t('edit')}
                  </span>
                </button>
              </div>

              {editingSection === 'public' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg bg-theme-elevated border-theme-primary/20">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          publicForm.isPublicProfile
                            ? 'bg-accent-green/20'
                            : 'bg-theme-secondary'
                        }`}
                      >
                        {publicForm.isPublicProfile ? (
                          <FiEye className="w-5 h-5 text-accent-green" />
                        ) : (
                          <FiEyeOff className="w-5 h-5 text-theme-tertiary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary">
                          {t('public_profile')}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {publicForm.isPublicProfile
                            ? t('profile_public_visible')
                            : t('profile_private')}
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={publicForm.isPublicProfile}
                        onChange={(e) =>
                          setPublicForm((prev) => ({
                            ...prev,
                            isPublicProfile: e.target.checked,
                          }))
                        }
                        disabled={saving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-theme-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>

                  {publicForm.isPublicProfile && (
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('public_biography')}
                      </label>
                      <textarea
                        value={publicForm.publicBio}
                        onChange={(e) =>
                          setPublicForm((prev) => ({
                            ...prev,
                            publicBio: e.target.value,
                          }))
                        }
                        rows={4}
                        className="input-classical w-full"
                        placeholder={t('public_bio_placeholder')}
                        disabled={saving}
                      />
                      <div className="text-xs text-theme-tertiary mt-1">
                        {t('public_bio_note')}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={savePublicData}
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
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg bg-theme-elevated border-theme-primary/20">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          data?.isPublicProfile
                            ? 'bg-accent-green/20'
                            : 'bg-theme-secondary'
                        }`}
                      >
                        {data?.isPublicProfile ? (
                          <FiEye className="w-5 h-5 text-accent-green" />
                        ) : (
                          <FiEyeOff className="w-5 h-5 text-theme-tertiary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary">
                          {t('profile_status')}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {data?.isPublicProfile
                            ? t('profile_public_visible')
                            : t('profile_private')}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        data?.isPublicProfile
                          ? 'bg-accent-green/10 text-accent-green'
                          : 'bg-theme-secondary text-theme-tertiary'
                      }`}
                    >
                      {data?.isPublicProfile ? t('public') : t('private')}
                    </div>
                  </div>

                  {data?.isPublicProfile && (
                    <>
                      {data.publicBio && (
                        <div>
                          <label className="text-sm text-theme-tertiary">
                            {t('public_biography')}
                          </label>
                          <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                            {data.publicBio}
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-lg bg-theme-elevated border-brand-primary/20 p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <FiGlobe className="w-5 h-5 text-brand-primary" />
                          <div className="font-medium text-theme-primary">
                            {t('profile_is_public')}
                          </div>
                        </div>
                        <div className="text-sm text-theme-secondary mb-3">
                          {t('profile_public_description')}
                        </div>
                        <a
                          href={`/teachers/${teacherProfile.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
                        >
                          {t('view_public_profile')}
                        </a>
                      </div>
                    </>
                  )}

                  {!data?.isPublicProfile && (
                    <div className="text-center py-8">
                      <FiEyeOff className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-theme-primary mb-2">
                        {t('profile_private_title')}
                      </h3>
                      <p className="text-theme-tertiary mb-4">
                        {t('activate_public_profile')}
                      </p>
                      <button
                        onClick={() => setEditingSection('public')}
                        className="btn-classical-primary"
                      >
                        {t('make_public')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
