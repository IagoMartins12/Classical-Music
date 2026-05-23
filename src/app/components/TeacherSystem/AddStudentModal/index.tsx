// Substituir o AddStudentModal existente

import {
  FiMapPin,
  FiPlus,
  FiSearch,
  FiUser,
  FiUserPlus,
  FiCalendar,
  FiBookOpen,
  FiRefreshCw,
} from 'react-icons/fi';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import Input from '../../Common/Inputs';
import Select from '../../Common/Select';
import Modal from '../../Modal';
import Image from 'next/image';
import { StudentSearchResult } from '@/app/(teacher)/teacher/pageClient';
import { Dispatch, SetStateAction, useState } from 'react';
import Button from '../../Common/Button';
import { FaChevronLeft } from 'react-icons/fa';
import Checkbox from '../../Common/Checkbox';
import { BiError } from 'react-icons/bi';

interface AddStudentModalProps {
  onClose: () => void;
  isOpen: boolean;
  searchLoading: boolean;
  searchResults: StudentSearchResult[];
  searchQuery: string;
  loading: boolean;
  addStudent: (
    studentUserId: string,
    studyPlan?: StudyPlanData
  ) => Promise<void>;
  handleSearchChange?: (value: string) => () => void;
  setSearchQuery?: Dispatch<SetStateAction<string>>;
}

// 🆕 NOVO: Interface para plano de estudos
interface StudyPlanData {
  maxLessonsPerWeek: number;
  lessonDuration: number;
  preferredDays: string[];
  preferredTimes: string[];
  currentFocus: string[];
  learningPlan?: string;
  studyGoals?: string;
  practiceFrequency?: string;
  homeworkExpectation?: string;
  specialInstructions?: string;
  teacherNotes?: string;
}
type MultiSelectFields = 'preferredDays' | 'preferredTimes' | 'currentFocus';

// 🆕 NOVO: Opções para os selects
const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const TIME_SLOTS = [
  { value: '07:00', label: '07:00' },
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' },
];

const PRACTICE_FREQUENCY_OPTIONS = [
  { value: '', label: 'Selecione a frequencia' },
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekdays', label: 'Dias úteis' },
  { value: 'alternate', label: 'Dias alternados' },
  { value: 'weekends', label: 'Fins de semana' },
  { value: 'flexible', label: 'Flexível' },
];

const HOMEWORK_EXPECTATION_OPTIONS = [
  { value: '', label: 'Selecione a quantidade de exercícios' },

  { value: 'light', label: 'Leve (1-2 exercícios)' },
  { value: 'moderate', label: 'Moderada (3-4 exercícios)' },
  { value: 'intensive', label: 'Intensiva (5+ exercícios)' },
  { value: 'flexible', label: 'Flexível conforme progresso' },
  { value: 'none', label: 'Sem tarefas de casa' },
];

const COMMON_FOCUS_AREAS = [
  'Técnica básica',
  'Leitura de partituras',
  'Teoria musical',
  'Repertório clássico',
  'Improvisação',
  'Digitação',
  'Dinâmica',
  'Fraseado',
  'Ritmo',
  'Harmonia',
];

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  searchLoading,
  searchQuery,
  searchResults,
  loading,
  addStudent,
  handleSearchChange,
  setSearchQuery,
}) => {
  // 🆕 NOVO: Estado para o plano de estudos
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentSearchResult | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanData>({
    maxLessonsPerWeek: 1,
    lessonDuration: 60,
    preferredDays: [],
    preferredTimes: [],
    currentFocus: [],
    practiceFrequency: '',
    homeworkExpectation: '',
  });

  // 🆕 NOVO: Handlers para o plano de estudos
  const handleStudyPlanChange = (field: keyof StudyPlanData, value: any) => {
    setStudyPlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelectChange = (field: MultiSelectFields, value: string) => {
    setStudyPlan((prev) => {
      const currentValues = prev[field]; // aqui já é garantido que é string[]
      return {
        ...prev,
        [field]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleAddFocusArea = (area: string) => {
    if (area.trim() && !studyPlan.currentFocus.includes(area.trim())) {
      setStudyPlan((prev) => ({
        ...prev,
        currentFocus: [...prev.currentFocus, area.trim()],
      }));
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setStudyPlan((prev) => ({
      ...prev,
      currentFocus: prev.currentFocus.filter((focus) => focus !== area),
    }));
  };

  const handleAddStudentWithPlan = async (studentUserId: string) => {
    const finalStudyPlan = showStudyPlan ? studyPlan : undefined;

    await addStudent(studentUserId, finalStudyPlan);

    // Reset após adicionar
    setShowStudyPlan(false);
    setSelectedStudent(null);
    setStudyPlan({
      maxLessonsPerWeek: 1,
      lessonDuration: 60,
      preferredDays: [],
      preferredTimes: [],
      currentFocus: [],
      practiceFrequency: 'weekdays',
      homeworkExpectation: 'moderate',
    });
  };

  const isSearching = searchQuery.length >= 3 && searchLoading;
  const hasSearched = searchQuery.length >= 3 && !searchLoading;

  return (
    <Modal maxWidth="5xl" isOpen={isOpen} onClose={onClose}>
      <AnimatedCard hover="none">
        <div className="p-0 sm:p-6">
          <div className="flex items-center gap-6 mb-6">
            {showStudyPlan && (
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setShowStudyPlan(false);
                }}
                className="text-theme-primary "
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                Adicionar Novo Aluno
              </h2>
              <p className="text-theme-tertiary">
                Busque o aluno pelo email completo e configure o plano de
                estudos
              </p>
            </div>
          </div>

          {!selectedStudent ? (
            // 🔄 SEÇÃO DE BUSCA (existente, sem mudanças)
            <>
              {/* Search Input */}
              <div className="relative mb-6">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                <Input
                  type="email"
                  placeholder="Digite o email completo do aluno..."
                  value={searchQuery}
                  onChange={(e) => {
                    if (setSearchQuery) {
                      setSearchQuery(e.target.value);
                    } else if (handleSearchChange) {
                      handleSearchChange(e.target.value);
                    }
                  }}
                  className="input-classical w-full"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-primary">
                    Resultados da busca ({searchResults.length})
                  </h3>

                  {searchResults.map((student) => (
                    <div key={student.id} className="classical-card-simple p-4">
                      <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-between">
                        <div className="flex w-[95%] sm:w-auto  items-center space-x-3">
                          {/* Avatar */}
                          <div className="relative w-10 h-10">
                            {student.image ? (
                              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20">
                                <Image
                                  src={student.image}
                                  alt={student.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                                <FiUser className="w-5 h-5 text-theme-primary" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div>
                            <div className="font-semibold text-theme-primary">
                              {student.name}
                            </div>
                            <div className="text-sm text-theme-tertiary">
                              {student.email}
                            </div>
                            {student.location && (
                              <div className="text-xs text-theme-tertiary flex items-center">
                                <FiMapPin className="w-3 h-3 mr-1" />
                                {student.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div>
                          {student.isAlreadyStudent ? (
                            <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium">
                              Já é seu aluno
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  handleAddStudentWithPlan(student.id)
                                }
                                disabled={loading}
                                variant="secondary"
                                className="flex"
                              >
                                <span>
                                  {loading ? (
                                    <FiRefreshCw
                                      className={`w-4 h-4 ${
                                        loading ? 'animate-spin' : ''
                                      }`}
                                    />
                                  ) : (
                                    ' Adicionar Rápido'
                                  )}
                                </span>
                              </Button>

                              {/* 🆕 NOVO: Botão com plano de estudos */}
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowStudyPlan(true);
                                }}
                                disabled={loading}
                                className={`btn-classical-primary ${
                                  loading ? 'opacity-25' : ''
                                } text-sm px-4 py-2 flex items-center space-x-2`}
                              >
                                <FiPlus className="w-4 h-4" />
                                <span>Com Plano</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RESULT AREA (altura fixa para evitar jumping) */}
              <div className="min-h-[200px] transition-all">
                {/* 🔄 BUSCANDO */}
                {isSearching && (
                  <div className="text-center py-10">
                    <FiSearch className="w-12 h-12 text-theme-tertiary mx-auto mb-4 animate-pulse" />
                    <h3 className="font-semibold text-theme-primary mb-2">
                      Buscando aluno…
                    </h3>
                    <p className="text-theme-tertiary text-sm">
                      Procurando usuário com o email informado
                    </p>
                  </div>
                )}

                {/* ❌ NENHUM RESULTADO */}
                {hasSearched && searchResults.length === 0 && (
                  <div className="text-center py-10">
                    <BiError className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                    <h3 className="font-semibold text-theme-primary mb-2">
                      Nenhum aluno encontrado
                    </h3>
                    <p className="text-theme-tertiary text-sm">
                      Verifique se o email está correto ou se o aluno já possui
                      cadastro.
                    </p>
                  </div>
                )}

                {/* 🧭 INSTRUÇÕES */}
                {searchQuery.length < 3 && (
                  <div className="text-center py-10">
                    <FiUserPlus className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                    <h3 className="font-semibold text-theme-primary mb-2">
                      Como adicionar um aluno
                    </h3>
                    <div className="text-theme-tertiary text-sm space-y-2">
                      <p>1. Digite o email completo do aluno</p>
                      <p>2. O aluno precisa estar cadastrado</p>
                      <p>3. Escolha “Adicionar Rápido” ou “Com Plano”</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // 🆕 NOVA: SEÇÃO DE PLANO DE ESTUDOS
            <div className="space-y-6">
              {/* Student Info Header */}
              <div className="bg-brand-primary/5  rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-primary text-lg">
                        Configurar Plano de Estudos
                      </h3>
                      <p className="text-brand-primary opacity-80">
                        {selectedStudent.name} • {selectedStudent.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Configurações Básicas */}
                <AnimatedCard className="classical-card p-4">
                  <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-brand-primary" />
                    Configurações de Aulas
                  </h4>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Aulas por Semana
                        </label>
                        <Select
                          options={[
                            { value: '1', label: '1 aula' },
                            { value: '2', label: '2 aulas' },
                            { value: '3', label: '3 aulas' },
                            { value: '4', label: '4 aulas' },
                          ]}
                          value={studyPlan.maxLessonsPerWeek.toString()}
                          onChange={(e) =>
                            handleStudyPlanChange(
                              'maxLessonsPerWeek',
                              parseInt(e.target.value)
                            )
                          }
                          className="input-classical w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Duração (minutos)
                        </label>
                        <Select
                          options={[
                            { value: '30', label: '30 min' },
                            { value: '45', label: '45 min' },
                            { value: '60', label: '60 min' },
                            { value: '90', label: '90 min' },
                            { value: '120', label: '120 min' },
                          ]}
                          value={studyPlan.lessonDuration.toString()}
                          onChange={(e) =>
                            handleStudyPlanChange(
                              'lessonDuration',
                              parseInt(e.target.value)
                            )
                          }
                          className="input-classical w-full"
                        />
                      </div>
                    </div>

                    {/* Dias Preferidos */}
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Dias Preferidos
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <label
                            key={day.value}
                            className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                              studyPlan.preferredDays.includes(day.value)
                                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                : 'border-theme-secondary hover:border-theme-primary'
                            }`}
                          >
                            <Checkbox
                              label={day.label}
                              checked={studyPlan.preferredDays.includes(
                                day.value
                              )}
                              onChange={() =>
                                handleMultiSelectChange(
                                  'preferredDays',
                                  day.value
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Horários Preferidos */}
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Horários Preferidos
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <label
                            key={time.value}
                            className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${
                              studyPlan.preferredTimes.includes(time.value)
                                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                : 'border-theme-secondary hover:border-theme-primary'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={studyPlan.preferredTimes.includes(
                                time.value
                              )}
                              onChange={() =>
                                handleMultiSelectChange(
                                  'preferredTimes',
                                  time.value
                                )
                              }
                              className="sr-only"
                            />
                            <span className="text-sm font-mono">
                              {time.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Configurações de Estudo */}
                <AnimatedCard className="classical-card p-4">
                  <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiBookOpen className="w-5 h-5 text-brand-primary" />
                    Plano de Estudos
                  </h4>

                  <div className="space-y-4">
                    {/* Frequência de Prática */}
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Frequência de Prática
                      </label>
                      <Select
                        options={PRACTICE_FREQUENCY_OPTIONS}
                        value={studyPlan.practiceFrequency || ''}
                        onChange={(e) =>
                          handleStudyPlanChange(
                            'practiceFrequency',
                            e.target.value
                          )
                        }
                        className="input-classical w-full"
                      />
                    </div>

                    {/* Expectativa de Tarefa */}
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Tarefas de Casa
                      </label>
                      <Select
                        options={HOMEWORK_EXPECTATION_OPTIONS}
                        value={studyPlan.homeworkExpectation || ''}
                        onChange={(e) =>
                          handleStudyPlanChange(
                            'homeworkExpectation',
                            e.target.value
                          )
                        }
                        className="input-classical w-full"
                      />
                    </div>

                    {/* Áreas de Foco */}
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Áreas de Foco Inicial
                      </label>

                      {/* Botões Rápidos */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {COMMON_FOCUS_AREAS.map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => handleAddFocusArea(area)}
                            className={`px-3 py-1 text-xs rounded-full border transition-all ${
                              studyPlan.currentFocus.includes(area)
                                ? 'border-brand-primary bg-brand-primary '
                                : 'border-theme-secondary text-theme-secondary hover:border-brand-primary hover:text-brand-primary'
                            }`}
                            disabled={studyPlan.currentFocus.includes(area)}
                          >
                            {area}
                          </button>
                        ))}
                      </div>

                      {/* Selecionadas */}
                      {studyPlan.currentFocus.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-theme-secondary">
                            Áreas selecionadas:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {studyPlan.currentFocus.map((focus) => (
                              <span
                                key={focus}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary  text-sm rounded-full"
                              >
                                {focus}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFocusArea(focus)}
                                  className="hover:text-red-200"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              {/* Campos de Texto Expandidos */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Objetivos de Estudo
                  </label>
                  <textarea
                    value={studyPlan.studyGoals || ''}
                    onChange={(e) =>
                      handleStudyPlanChange('studyGoals', e.target.value)
                    }
                    rows={3}
                    className="input-classical w-full"
                    placeholder="Descreva os objetivos musicais do aluno..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Instruções Especiais
                  </label>
                  <textarea
                    value={studyPlan.specialInstructions || ''}
                    onChange={(e) =>
                      handleStudyPlanChange(
                        'specialInstructions',
                        e.target.value
                      )
                    }
                    rows={3}
                    className="input-classical w-full"
                    placeholder="Necessidades especiais, preferências específicas..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Plano de Aprendizado Detalhado
                </label>
                <textarea
                  value={studyPlan.learningPlan || ''}
                  onChange={(e) =>
                    handleStudyPlanChange('learningPlan', e.target.value)
                  }
                  rows={4}
                  className="input-classical w-full"
                  placeholder="Descreva o plano detalhado de aprendizado, metodologia a ser seguida, progressão esperada..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Notas do Professor (privadas)
                </label>
                <textarea
                  value={studyPlan.teacherNotes || ''}
                  onChange={(e) =>
                    handleStudyPlanChange('teacherNotes', e.target.value)
                  }
                  rows={3}
                  className="input-classical w-full"
                  placeholder="Observações pessoais sobre o aluno..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-theme-secondary">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setShowStudyPlan(false);
                  }}
                  className={`btn-classical-secondary ${
                    loading ?? 'opacity-85'
                  }`}
                  disabled={loading}
                >
                  Voltar
                </button>

                <button
                  onClick={() => handleAddStudentWithPlan(selectedStudent.id)}
                  disabled={loading}
                  className="btn-classical-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin"></div>
                      <span>Adicionando...</span>
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      <span>Adicionar Aluno</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>
    </Modal>
  );
};

export default AddStudentModal;
