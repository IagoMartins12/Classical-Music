// app/teacher/profile/pageClient.tsx - Client Component CORRIGIDO
'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiCheck,
  PiClock,
  PiEnvelopeSimple,
  PiEye,
  PiEyeSlash,
  PiFloppyDisk,
  PiGlobe,
  PiMapPin,
  PiMedal,
  PiMusicNotes,
  PiPencilLine,
  PiPhone,
  PiUser,
  PiUsers,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
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
import { TeacherStatus } from '@/app/types/portal';
import { saveTeacherProfile } from '@/app/requests/portal/profile-actions';
import Input from '@/app/components/Common/Inputs';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';

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

      const profile = await saveTeacherProfile({ account: userData });

      // Atualizar estado imediatamente sem reload
      setData(profile);
      setEditingSection(null);
      showSuccess(t('data_saved_success'));

      // Atualizar forms com os novos dados
      setPersonalForm((prev) => ({
        ...prev,
        phone: profile.user.phone || '',
        location: convertDatabaseToLocationData({
          country: profile.user.country,
          state: profile.user.state,
          city: profile.user.city,
        }),
      }));
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
      const profile = await saveTeacherProfile({ teacher: professionalForm });

      // Atualizar estado imediatamente
      setData(profile);
      setEditingSection(null);
      showSuccess(t('professional_data_saved'));

      // Sincronizar form com dados atualizados
      setProfessionalForm({
        bio: profile.bio || '',
        experience: profile.experience || '',
        education: profile.education || '',
        achievements: profile.achievements || '',
        website: profile.website || '',
        socialMedia: profile.socialMedia || {},
      });
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
      const profile = await saveTeacherProfile({ teacher: teachingForm });

      // Atualizar estado imediatamente
      setData(profile);
      setEditingSection(null);
      showSuccess(t('teaching_settings_saved'));

      // Sincronizar form com dados atualizados
      setTeachingForm({
        instruments: profile.instruments || [],
        specialties: profile.specialties || [],
        teachingMethod: profile.teachingMethod || '',
        ageGroups: profile.ageGroups || [],
        skillLevels: profile.skillLevels || [],
        defaultLessonDuration: profile.defaultLessonDuration || 60,
        maxStudentsPerWeek: profile.maxStudentsPerWeek || 50,
        timezone: profile.timezone || 'America/Sao_Paulo',
      });
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
      const profile = await saveTeacherProfile({ teacher: publicForm });

      // Atualizar estado imediatamente
      setData(profile);
      setEditingSection(null);
      showSuccess(t('public_profile_updated'));

      // Sincronizar form com dados atualizados
      setPublicForm({
        isPublicProfile: profile.isPublicProfile || false,
        publicBio: profile.publicBio || '',
        highlightedWorks: profile.highlightedWorks || [],
      });
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
              <PiUser className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_profile')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error}
            </p>
            <Inline
              as="button"
              gap={2}
              onClick={() => window.location.reload()}
              className="btn-classical-primary mx-auto"
            >
              <PiArrowsClockwise className="w-4 h-4" />
              <span>{t('reload_page')}</span>
            </Inline>
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
                <PiUser className="w-8 h-8 text-theme-primary" />
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
              <Inline gap={3}>
                <div className="w-8 h-8 bg-accent-green/10 rounded-full flex items-center justify-center">
                  <PiCheck className="w-4 h-4 text-accent-green" />
                </div>
                <div className="text-accent-green font-medium">
                  {successMessage}
                </div>
              </Inline>
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
                <Inline gap={3}>
                  <div className="w-8 h-8 bg-accent-red/10 rounded-full flex items-center justify-center">
                    <PiX className="w-4 h-4 text-accent-red" />
                  </div>
                  <div className="text-accent-red font-medium">{error}</div>
                </Inline>
                <button
                  onClick={() => setError('')}
                  className="text-accent-red hover:text-accent-red/70 transition-colors"
                >
                  <PiX className="w-4 h-4" />
                  <NomeAcao acao="fechar" />
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
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                    <PiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('personal_information')}
                    </h2>
                    <Text papel="rotulo" tom="fraco" as="p">
                      {t('personal_description')}
                    </Text>
                  </div>
                </Inline>

                <Inline
                  as="button"
                  gap={2}
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'personal' ? null : 'personal'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary"
                >
                  <PiPencilLine className="w-4 h-4" />
                  <span>
                    {editingSection === 'personal' ? t('cancel') : t('edit')}
                  </span>
                </Inline>
              </div>

              {editingSection === 'personal' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Field
                        label={<>{t('first_name')}*</>}
                        type="text"
                        value={personalForm.firstName}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Seu primeiro nome"
                        required
                      />
                    </div>

                    <div>
                      <Field
                        label={t('last_name')}
                        type="text"
                        value={personalForm.lastName}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
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
                          <PiWarningCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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
                    <Inline gap={2} className="mb-4">
                      <PiMapPin className="w-4 h-4 text-brand-primary" />
                      <h4 className="font-medium text-theme-primary">
                        {t('location')}
                      </h4>
                    </Inline>

                    <LocationSelector
                      value={personalForm.location}
                      onChange={handleLocationChange}
                      disabled={saving}
                      showLabels={false}
                      className="space-y-3"
                    />
                  </div>

                  <Inline
                    gap={3}
                    className="justify-end pt-4 border-t border-theme-secondary"
                  >
                    <Button
                      variante="secundario"
                      type="submit"
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                    >
                      {t('cancel')}
                    </Button>
                    <Inline
                      as="button"
                      gap={2}
                      onClick={savePersonalData}
                      disabled={
                        saving || !canProceedWithPhone(personalForm.phone)
                      }
                      className="btn-classical-primary"
                      title={
                        phoneError
                          ? `Não é possível salvar: ${phoneError}`
                          : undefined
                      }
                    >
                      {saving ? (
                        <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                      ) : (
                        <PiFloppyDisk className="w-4 h-4" />
                      )}
                      <span>{t('save')}</span>
                    </Inline>
                  </Inline>
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
                      <Inline
                        gap={2}
                        className="text-theme-primary font-medium"
                      >
                        <PiEnvelopeSimple className="w-4 h-4" />
                        <span>{data?.user.email}</span>
                      </Inline>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('phone_label')}
                      </label>
                      <Inline
                        gap={2}
                        className="text-theme-primary font-medium"
                      >
                        <PiPhone className="w-4 h-4" />
                        <span>{data?.user.phone || t('not_informed')}</span>
                      </Inline>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('location_label')}
                      </label>
                      <Inline
                        gap={2}
                        className="text-theme-primary font-medium"
                      >
                        <PiMapPin className="w-4 h-4" />
                        <span>
                          {data?.user.city && data?.user.state
                            ? `${data.user.city}, ${data.user.state}`
                            : data?.user.country || t('not_informed')}
                        </span>
                      </Inline>
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
                      <Inline gap={2}>
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
                            <PiCheck className="w-3 h-3 mr-1" />
                            {t('verified')}
                          </div>
                        )}
                      </Inline>
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
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center">
                    <PiMedal className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('professional_information')}
                    </h2>
                    <Text papel="rotulo" tom="fraco" as="p">
                      {t('professional_description')}
                    </Text>
                  </div>
                </Inline>

                <Inline
                  as="button"
                  gap={2}
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'professional' ? null : 'professional'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary"
                >
                  <PiPencilLine className="w-4 h-4" />
                  <span>
                    {editingSection === 'professional'
                      ? t('cancel')
                      : t('edit')}
                  </span>
                </Inline>
              </div>

              {editingSection === 'professional' ? (
                <div className="space-y-6">
                  <div>
                    <Field.Area
                      label={t('biography')}
                      value={professionalForm.bio}
                      onChange={(e) =>
                        setProfessionalForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder={t('biography_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Field.Area
                        label={t('experience')}
                        value={professionalForm.experience}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            experience: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder={t('experience_placeholder')}
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <Field.Area
                        label={t('education')}
                        value={professionalForm.education}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            education: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder={t('education_placeholder')}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div>
                    <Field.Area
                      label={t('achievements')}
                      value={professionalForm.achievements}
                      onChange={(e) =>
                        setProfessionalForm((prev) => ({
                          ...prev,
                          achievements: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder={t('achievements_placeholder')}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1  gap-6">
                    <div>
                      <Input
                        label={t('website')}
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

                  <Inline
                    gap={3}
                    className="justify-end pt-4 border-t border-theme-secondary"
                  >
                    <Button
                      variante="secundario"
                      type="submit"
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                    >
                      {t('cancel')}
                    </Button>
                    <Inline
                      as="button"
                      gap={2}
                      onClick={saveProfessionalData}
                      disabled={saving}
                      className="btn-classical-primary"
                    >
                      {saving ? (
                        <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                      ) : (
                        <PiFloppyDisk className="w-4 h-4" />
                      )}
                      <span>{t('save')}</span>
                    </Inline>
                  </Inline>
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
                        <Inline
                          as="a"
                          gap={2}
                          href={data.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary hover:text-brand-secondary transition-colors"
                        >
                          <PiGlobe className="w-4 h-4" />
                          <span>{data.website}</span>
                        </Inline>
                      </div>
                    </div>
                  )}

                  {!data?.bio &&
                    !data?.experience &&
                    !data?.education &&
                    !data?.achievements &&
                    !data?.website && (
                      <div className="text-center py-8">
                        <PiMedal className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          {t('complete_professional_profile')}
                        </h3>
                        <p className="text-theme-tertiary mb-4">
                          {t('complete_profile_description')}
                        </p>
                        <Button
                          variante="primario"
                          type="submit"
                          onClick={() => setEditingSection('professional')}
                        >
                          {t('start_now')}
                        </Button>
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
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <PiMusicNotes className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('teaching_configuration')}
                    </h2>
                    <Text papel="rotulo" tom="fraco" as="p">
                      {t('teaching_description')}
                    </Text>
                  </div>
                </Inline>

                <Inline
                  as="button"
                  gap={2}
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'teaching' ? null : 'teaching'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary"
                >
                  <PiPencilLine className="w-4 h-4" />
                  <span>
                    {editingSection === 'teaching' ? t('cancel') : t('edit')}
                  </span>
                </Inline>
              </div>

              {editingSection === 'teaching' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-3">
                      {t('instruments_teach')}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {teachingForm.instruments.map((instrument) => (
                        <Inline
                          as="span"
                          gap={2}
                          key={instrument}
                          className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm"
                        >
                          <span>{instrument}</span>
                          <button
                            onClick={() =>
                              removeFromArray('instruments', instrument)
                            }
                            className="text-accent-blue/70 hover:text-accent-red transition-colors"
                            disabled={saving}
                          >
                            <PiX className="w-3 h-3" />
                            <NomeAcao acao="fechar" />
                          </button>
                        </Inline>
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
                        <Inline
                          as="span"
                          gap={2}
                          key={specialty}
                          className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm"
                        >
                          <span>{specialty}</span>
                          <button
                            onClick={() =>
                              removeFromArray('specialties', specialty)
                            }
                            className="text-accent-purple/70 hover:text-accent-red transition-colors"
                            disabled={saving}
                          >
                            <PiX className="w-3 h-3" />
                            <NomeAcao acao="fechar" />
                          </button>
                        </Inline>
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
                    <Field.Area
                      label={t('teaching_methodology')}
                      value={teachingForm.teachingMethod}
                      onChange={(e) =>
                        setTeachingForm((prev) => ({
                          ...prev,
                          teachingMethod: e.target.value,
                        }))
                      }
                      rows={3}
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
                          <Inline as="label" gap={3} key={ageGroup.value}>
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
                            <Text papel="rotulo" tom="forte">
                              {ageGroup.label}
                            </Text>
                          </Inline>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        {t('skill_levels')}
                      </label>
                      <div className="space-y-2">
                        {SKILL_LEVELS.map((skillLevel) => (
                          <Inline as="label" gap={3} key={skillLevel.value}>
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
                            <Text papel="rotulo" tom="forte">
                              {skillLevel.label}
                            </Text>
                          </Inline>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Field.Selecao
                        label={t('default_lesson_duration')}
                        value={teachingForm.defaultLessonDuration}
                        onChange={(e) =>
                          setTeachingForm((prev) => ({
                            ...prev,
                            defaultLessonDuration: parseInt(e.target.value),
                          }))
                        }
                        disabled={saving}
                      >
                        <option value={30}>30 {t('minutes')}</option>
                        <option value={45}>45 {t('minutes')}</option>
                        <option value={60}>60 {t('minutes')}</option>
                        <option value={90}>90 {t('minutes')}</option>
                        <option value={120}>120 {t('minutes')}</option>
                      </Field.Selecao>
                    </div>

                    <div>
                      <Field
                        label={t('max_students_per_week')}
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
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <Field.Selecao
                        label={t('timezone')}
                        value={teachingForm.timezone}
                        onChange={(e) =>
                          setTeachingForm((prev) => ({
                            ...prev,
                            timezone: e.target.value,
                          }))
                        }
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
                      </Field.Selecao>
                    </div>
                  </div>

                  <Inline
                    gap={3}
                    className="justify-end pt-4 border-t border-theme-secondary"
                  >
                    <Button
                      variante="secundario"
                      type="submit"
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                    >
                      {t('cancel')}
                    </Button>
                    <Inline
                      as="button"
                      gap={2}
                      onClick={saveTeachingData}
                      disabled={saving}
                      className="btn-classical-primary"
                    >
                      {saving ? (
                        <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                      ) : (
                        <PiFloppyDisk className="w-4 h-4" />
                      )}
                      <span>{t('save')}</span>
                    </Inline>
                  </Inline>
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
                      <Inline
                        gap={2}
                        className="text-theme-primary font-medium mt-1"
                      >
                        <PiClock className="w-4 h-4" />
                        <span>
                          {data?.defaultLessonDuration} {t('minutes')}
                        </span>
                      </Inline>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        {t('weekly_capacity')}
                      </label>
                      <Inline
                        gap={2}
                        className="text-theme-primary font-medium mt-1"
                      >
                        <PiUsers className="w-4 h-4" />
                        <span>
                          {data?.maxStudentsPerWeek} {t('students')}
                        </span>
                      </Inline>
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
                        <PiMusicNotes className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          {t('configure_specialties')}
                        </h3>
                        <p className="text-theme-tertiary mb-4">
                          {t('configure_description')}
                        </p>
                        <Button
                          variante="primario"
                          type="submit"
                          onClick={() => setEditingSection('teaching')}
                        >
                          {t('configure_now')}
                        </Button>
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
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-lg flex items-center justify-center">
                    <PiGlobe className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('public_profile')}
                    </h2>
                    <Text papel="rotulo" tom="fraco" as="p">
                      {t('public_profile_description')}
                    </Text>
                  </div>
                </Inline>

                <Inline
                  as="button"
                  gap={2}
                  onClick={() =>
                    setEditingSection(
                      editingSection === 'public' ? null : 'public'
                    )
                  }
                  disabled={saving}
                  className="btn-classical-secondary"
                >
                  <PiPencilLine className="w-4 h-4" />
                  <span>
                    {editingSection === 'public' ? t('cancel') : t('edit')}
                  </span>
                </Inline>
              </div>

              {editingSection === 'public' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg bg-theme-elevated border-theme-primary/20">
                    <Inline gap={3}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          publicForm.isPublicProfile
                            ? 'bg-accent-green/20'
                            : 'bg-theme-secondary'
                        }`}
                      >
                        {publicForm.isPublicProfile ? (
                          <PiEye className="w-5 h-5 text-accent-green" />
                        ) : (
                          <PiEyeSlash className="w-5 h-5 text-theme-tertiary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary">
                          {t('public_profile')}
                        </div>
                        <Text papel="rotulo" tom="fraco" as="div">
                          {publicForm.isPublicProfile
                            ? t('profile_public_visible')
                            : t('profile_private')}
                        </Text>
                      </div>
                    </Inline>
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
                      <Field.Area
                        label={t('public_biography')}
                        value={publicForm.publicBio}
                        onChange={(e) =>
                          setPublicForm((prev) => ({
                            ...prev,
                            publicBio: e.target.value,
                          }))
                        }
                        rows={4}
                        placeholder={t('public_bio_placeholder')}
                        disabled={saving}
                      />
                      <Text
                        papel="legenda"
                        tom="fraco"
                        as="div"
                        className="mt-1"
                      >
                        {t('public_bio_note')}
                      </Text>
                    </div>
                  )}

                  <Inline
                    gap={3}
                    className="justify-end pt-4 border-t border-theme-secondary"
                  >
                    <Button
                      variante="secundario"
                      type="submit"
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                    >
                      {t('cancel')}
                    </Button>
                    <Inline
                      as="button"
                      gap={2}
                      onClick={savePublicData}
                      disabled={saving}
                      className="btn-classical-primary"
                    >
                      {saving ? (
                        <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                      ) : (
                        <PiFloppyDisk className="w-4 h-4" />
                      )}
                      <span>{t('save')}</span>
                    </Inline>
                  </Inline>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg bg-theme-elevated border-theme-primary/20">
                    <Inline gap={3}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          data?.isPublicProfile
                            ? 'bg-accent-green/20'
                            : 'bg-theme-secondary'
                        }`}
                      >
                        {data?.isPublicProfile ? (
                          <PiEye className="w-5 h-5 text-accent-green" />
                        ) : (
                          <PiEyeSlash className="w-5 h-5 text-theme-tertiary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary">
                          {t('profile_status')}
                        </div>
                        <Text papel="rotulo" tom="fraco" as="div">
                          {data?.isPublicProfile
                            ? t('profile_public_visible')
                            : t('profile_private')}
                        </Text>
                      </div>
                    </Inline>
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
                        <Inline gap={3} className="mb-2">
                          <PiGlobe className="w-5 h-5 text-brand-primary" />
                          <div className="font-medium text-theme-primary">
                            {t('profile_is_public')}
                          </div>
                        </Inline>
                        <Text
                          papel="rotulo"
                          tom="suave"
                          as="div"
                          className="mb-3"
                        >
                          {t('profile_public_description')}
                        </Text>
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
                      <PiEyeSlash className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-theme-primary mb-2">
                        {t('profile_private_title')}
                      </h3>
                      <p className="text-theme-tertiary mb-4">
                        {t('activate_public_profile')}
                      </p>
                      <Button
                        variante="primario"
                        type="submit"
                        onClick={() => setEditingSection('public')}
                      >
                        {t('make_public')}
                      </Button>
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
