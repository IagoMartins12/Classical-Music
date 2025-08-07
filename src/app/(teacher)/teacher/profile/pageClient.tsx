// app/teacher/profile/pageClient.tsx - Client Component para Perfil do Professor
'use client';

import { useState, useCallback } from 'react';
import {
  FiUser,
  FiSave,
  FiEdit3,
  FiCamera,
  FiGlobe,
  FiAward,
  FiBookOpen,
  FiMusic,
  FiClock,
  FiUsers,
  FiStar,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiMapPin,
  FiMail,
  FiPhone,
  FiSettings,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../components/animation/AnimatedComponents';
import { TeacherProfileData, TeacherProfile } from './pageServer';
import Image from 'next/image';

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

const AGE_GROUPS = [
  'Crianças (4-12 anos)',
  'Adolescentes (13-17 anos)',
  'Adultos (18-60 anos)',
  'Terceira Idade (60+ anos)',
];

const SKILL_LEVELS = ['Iniciante', 'Intermediário', 'Avançado', 'Profissional'];

export default function TeacherProfilePageClient({
  initialData,
  teacherProfile,
  isNew = false,
  errorMessage,
}: TeacherProfilePageClientProps) {
  // States
  const [data, setData] = useState(initialData);
  const [editingSection, setEditingSection] = useState<EditingSection>(
    isNew ? 'personal' : null
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(errorMessage);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [personalForm, setPersonalForm] = useState({
    firstName: teacherProfile.name.split(' ')[0] || '',
    lastName: teacherProfile.name.split(' ').slice(1).join(' ') || '',
    email: teacherProfile.email,
    phone: data?.user.phone || '',
    city: data?.user.city || '',
    state: data?.user.state || '',
    country: data?.user.country || 'Brasil',
  });

  const [professionalForm, setProfessionalForm] = useState({
    bio: data?.bio || '',
    experience: data?.experience || '',
    education: data?.education || '',
    achievements: data?.achievements || '',
    website: data?.website || '',
    socialMedia: data?.socialMedia || {},
  });

  const [teachingForm, setTeachingForm] = useState({
    instruments: data?.instruments || [],
    specialties: data?.specialties || [],
    teachingMethod: data?.teachingMethod || '',
    ageGroups: data?.ageGroups || [],
    skillLevels: data?.skillLevels || [],
    defaultLessonDuration: data?.defaultLessonDuration || 60,
    maxStudentsPerWeek: data?.maxStudentsPerWeek || 50,
    timezone: data?.timezone || 'America/Sao_Paulo',
  });

  const [publicForm, setPublicForm] = useState({
    isPublicProfile: data?.isPublicProfile || false,
    publicBio: data?.publicBio || '',
    highlightedWorks: data?.highlightedWorks || [],
  });

  // Helper functions
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 8000);
  };

  // Save functions
  const savePersonalData = useCallback(async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: personalForm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar dados pessoais');
      }

      const result = await response.json();

      if (result.success) {
        setData(result.profile);
        setEditingSection(null);
        showSuccess('Dados pessoais salvos com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar dados pessoais:', error);
      showError(
        error instanceof Error ? error.message : 'Erro ao salvar dados pessoais'
      );
    } finally {
      setSaving(false);
    }
  }, [personalForm]);

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
        setData(result.profile);
        setEditingSection(null);
        showSuccess('Dados profissionais salvos com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar dados profissionais:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar dados profissionais'
      );
    } finally {
      setSaving(false);
    }
  }, [professionalForm]);

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
        setData(result.profile);
        setEditingSection(null);
        showSuccess('Configurações de ensino salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar dados de ensino:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar dados de ensino'
      );
    } finally {
      setSaving(false);
    }
  }, [teachingForm]);

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
        setData(result.profile);
        setEditingSection(null);
        showSuccess('Perfil público atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil público:', error);
      showError(
        error instanceof Error ? error.message : 'Erro ao salvar perfil público'
      );
    } finally {
      setSaving(false);
    }
  }, [publicForm]);

  // Array helpers
  const addToArray = (
    field: keyof typeof teachingForm,
    value: string,
    options: string[]
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
              Erro ao Carregar Perfil
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary flex items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Recarregar Página</span>
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
              Meu Perfil de Professor
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Configure seu perfil profissional e destaque suas especialidades
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

        {/* Profile Stats */}
        {data && (
          <AnimatedItem direction="up" springType="gentle">
            <SequentialGrid
              cols={4}
              gap={6}
              delayBetweenItems={0.1}
              className="mb-8"
            >
              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiUsers className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {data.totalStudents}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Total de Alunos
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiBookOpen className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {data.totalLessons}
                </div>
                <div className="text-sm text-theme-tertiary">Aulas Dadas</div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiStar className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {data.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Avaliação Média
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiAward className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {data.isVerified ? 'Sim' : 'Não'}
                </div>
                <div className="text-sm text-theme-tertiary">Verificado</div>
              </AnimatedCard>
            </SequentialGrid>
          </AnimatedItem>
        )}

        {/* Profile Sections */}
        <SequentialGrid
          cols={1}
          gap={8}
          delayBetweenItems={0.2}
          className="space-y-8"
        >
          {/* Personal Information */}
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
                        Nome
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

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={personalForm.email}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Telefone/WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={personalForm.phone}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={personalForm.city}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder="São Paulo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={personalForm.state}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder="SP"
                      />
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
                      onClick={savePersonalData}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Nome
                      </label>
                      <div className="text-theme-primary font-medium">
                        {data?.user.firstName} {data?.user.lastName}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Email
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiMail className="w-4 h-4" />
                        <span>{data?.user.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Telefone
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2">
                        <FiPhone className="w-4 h-4" />
                        <span>{data?.user.phone || 'Não informado'}</span>
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
                          {data?.user.city && data?.user.state
                            ? `${data.user.city}, ${data.user.state}`
                            : 'Não informado'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Membro desde
                      </label>
                      <div className="text-theme-primary font-medium">
                        {data?.createdAt
                          ? new Date(data.createdAt).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Status
                      </label>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          data?.status === 'ACTIVE'
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-accent-yellow/10 text-accent-yellow'
                        }`}
                      >
                        {data?.status === 'ACTIVE' ? 'Ativo' : data?.status}
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
                      Informações Profissionais
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Sua experiência, formação e conquistas
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
                    {editingSection === 'professional' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'professional' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Biografia
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
                      placeholder="Conte um pouco sobre você, sua paixão pela música e sua trajetória..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Experiência
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
                        placeholder="Ex: 10 anos ensinando piano, participação em orquestras..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Formação
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
                        placeholder="Ex: Bacharelado em Música pela USP, Mestrado em Performance..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Conquistas e Prêmios
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
                      placeholder="Ex: 1º lugar no Concurso Nacional de Piano 2020..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={professionalForm.website}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="input-classical w-full"
                        placeholder="https://seusite.com"
                      />
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
                      onClick={saveProfessionalData}
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
                  {data?.bio && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Biografia
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
                          Experiência
                        </label>
                        <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                          {data.experience}
                        </div>
                      </div>
                    )}

                    {data?.education && (
                      <div>
                        <label className="text-sm text-theme-tertiary">
                          Formação
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
                        Conquistas
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {data.achievements}
                      </div>
                    </div>
                  )}

                  {data?.website && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Website
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
                          Complete seu perfil profissional
                        </h3>
                        <p className="text-theme-tertiary mb-4">
                          Adicione suas informações profissionais para atrair
                          mais alunos
                        </p>
                        <button
                          onClick={() => setEditingSection('professional')}
                          className="btn-classical-primary"
                        >
                          Começar Agora
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
                      Configurações de Ensino
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Seus instrumentos, especialidades e métodos de ensino
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
                    {editingSection === 'teaching' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'teaching' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-3">
                      Instrumentos que Ensina
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
                          className="px-3 py-1 bg-theme-elevated hover:bg-interactive-hover border border-theme-secondary hover:border-brand-primary text-theme-secondary hover:text-brand-primary rounded-full text-sm transition-all"
                        >
                          + {instrument}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-3">
                      Especialidades Musicais
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
                          className="px-3 py-1 bg-theme-elevated hover:bg-interactive-hover border border-theme-secondary hover:border-brand-primary text-theme-secondary hover:text-brand-primary rounded-full text-sm transition-all"
                        >
                          + {specialty}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Metodologia de Ensino
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
                      placeholder="Descreva sua abordagem e metodologia de ensino..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        Faixas Etárias
                      </label>
                      <div className="space-y-2">
                        {AGE_GROUPS.map((ageGroup) => (
                          <label
                            key={ageGroup}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="checkbox"
                              checked={teachingForm.ageGroups.includes(
                                ageGroup
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addToArray('ageGroups', ageGroup, AGE_GROUPS);
                                } else {
                                  removeFromArray('ageGroups', ageGroup);
                                }
                              }}
                              className="w-4 h-4 text-brand-primary border-theme-secondary rounded focus:ring-brand-primary"
                            />
                            <span className="text-theme-primary text-sm">
                              {ageGroup}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        Níveis de Habilidade
                      </label>
                      <div className="space-y-2">
                        {SKILL_LEVELS.map((skillLevel) => (
                          <label
                            key={skillLevel}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="checkbox"
                              checked={teachingForm.skillLevels.includes(
                                skillLevel
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addToArray(
                                    'skillLevels',
                                    skillLevel,
                                    SKILL_LEVELS
                                  );
                                } else {
                                  removeFromArray('skillLevels', skillLevel);
                                }
                              }}
                              className="w-4 h-4 text-brand-primary border-theme-secondary rounded focus:ring-brand-primary"
                            />
                            <span className="text-theme-primary text-sm">
                              {skillLevel}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Duração Padrão da Aula (min)
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
                      >
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>60 minutos</option>
                        <option value={90}>90 minutos</option>
                        <option value={120}>120 minutos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Máximo de Alunos por Semana
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
                        max={100}
                        className="input-classical w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Fuso Horário
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
                      >
                        <option value="America/Sao_Paulo">
                          São Paulo (UTC-3)
                        </option>
                        <option value="America/Rio_Branco">
                          Rio Branco (UTC-5)
                        </option>
                        <option value="America/Manaus">Manaus (UTC-4)</option>
                      </select>
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
                      onClick={saveTeachingData}
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
                        Instrumentos
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
                            Nenhum instrumento adicionado
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Especialidades
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
                            Nenhuma especialidade adicionada
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {data?.teachingMethod && (
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Metodologia
                      </label>
                      <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                        {data.teachingMethod}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Faixas Etárias
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
                            Nenhuma faixa etária selecionada
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Níveis de Habilidade
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
                            Nenhum nível selecionado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Duração Padrão
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2 mt-1">
                        <FiClock className="w-4 h-4" />
                        <span>{data?.defaultLessonDuration} minutos</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Capacidade Semanal
                      </label>
                      <div className="text-theme-primary font-medium flex items-center space-x-2 mt-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{data?.maxStudentsPerWeek} alunos</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-theme-tertiary">
                        Fuso Horário
                      </label>
                      <div className="text-theme-primary font-medium mt-1">
                        {data?.timezone === 'America/Sao_Paulo'
                          ? 'São Paulo (UTC-3)'
                          : data?.timezone}
                      </div>
                    </div>
                  </div>

                  {(!data?.instruments || data.instruments.length === 0) &&
                    (!data?.specialties || data.specialties.length === 0) && (
                      <div className="text-center py-8">
                        <FiMusic className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          Configure suas especialidades
                        </h3>
                        <p className="text-theme-tertiary mb-4">
                          Adicione os instrumentos e especialidades que você
                          ensina
                        </p>
                        <button
                          onClick={() => setEditingSection('teaching')}
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
                      Perfil Público
                    </h2>
                    <p className="text-theme-tertiary text-sm">
                      Configure sua visibilidade na página "Conheça Nossos
                      Professores"
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
                    {editingSection === 'public' ? 'Cancelar' : 'Editar'}
                  </span>
                </button>
              </div>

              {editingSection === 'public' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
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
                          Perfil Público
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {publicForm.isPublicProfile
                            ? 'Seu perfil será exibido publicamente'
                            : 'Seu perfil ficará privado'}
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
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-theme-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>

                  {publicForm.isPublicProfile && (
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Biografia Pública
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
                        placeholder="Escreva uma biografia específica para o perfil público, destacando seus diferenciais como professor..."
                      />
                      <div className="text-xs text-theme-tertiary mt-1">
                        Se deixar em branco, será usada sua biografia principal
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                      className="btn-classical-secondary"
                    >
                      Cancelar
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
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
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
                          Status do Perfil
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {data?.isPublicProfile
                            ? 'Perfil público e visível'
                            : 'Perfil privado'}
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
                      {data?.isPublicProfile ? 'Público' : 'Privado'}
                    </div>
                  </div>

                  {data?.isPublicProfile && (
                    <>
                      {data.publicBio && (
                        <div>
                          <label className="text-sm text-theme-tertiary">
                            Biografia Pública
                          </label>
                          <div className="text-theme-primary mt-2 whitespace-pre-wrap">
                            {data.publicBio}
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-lg border border-brand-primary/20 p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <FiGlobe className="w-5 h-5 text-brand-primary" />
                          <div className="font-medium text-theme-primary">
                            Seu perfil está público!
                          </div>
                        </div>
                        <div className="text-sm text-theme-secondary mb-3">
                          Os alunos podem encontrar você na página "Conheça
                          Nossos Professores"
                        </div>
                        <a
                          href={`/teachers/${teacherProfile.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
                        >
                          Ver meu perfil público →
                        </a>
                      </div>
                    </>
                  )}

                  {!data?.isPublicProfile && (
                    <div className="text-center py-8">
                      <FiEyeOff className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-theme-primary mb-2">
                        Perfil Privado
                      </h3>
                      <p className="text-theme-tertiary mb-4">
                        Ative seu perfil público para aparecer na listagem de
                        professores e atrair novos alunos
                      </p>
                      <button
                        onClick={() => setEditingSection('public')}
                        className="btn-classical-primary"
                      >
                        Tornar Público
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>
        </SequentialGrid>
      </AnimatedContainer>
    </PageContainer>
  );
}
