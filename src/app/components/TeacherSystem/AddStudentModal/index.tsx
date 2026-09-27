// Substituir o AddStudentModal existente

import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiCaretLeft,
  PiMagnifyingGlass,
  PiMapPin,
  PiPlus,
  PiUser,
  PiUserPlus,
  PiWarning,
} from 'react-icons/pi';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import Input from '../../Common/Inputs';
import Select from '../../Common/Select';
import Modal from '../../Modal';
import Image from '@/app/components/SmartImage';
import { StudentSearchResult } from '@/app/(teacher)/teacher/pageClient';
import { Dispatch, SetStateAction, useState } from 'react';
import Button from '../../Common/Button';
import Checkbox from '../../Common/Checkbox';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';

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
                <PiCaretLeft className="w-4 h-4" />
                <NomeAcao acao="anterior" />
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
                <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
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
                <Stack gap={3}>
                  <h3 className="font-semibold text-theme-primary">
                    Resultados da busca ({searchResults.length})
                  </h3>

                  {searchResults.map((student) => (
                    <Card nivel={2} densidade="compacta" key={student.id}>
                      <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-between">
                        <Inline gap={3} className="w-[95%] sm:w-auto">
                          {/* Avatar */}
                          <div className="relative w-10 h-10">
                            {student.image ? (
                              <div className="relative w-full h-full rounded-full overflow-hidden border-2">
                                <Image
                                  src={student.image}
                                  alt={student.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full rounded-full flex items-center justify-center border-2">
                                <PiUser className="w-5 h-5 text-theme-primary" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div>
                            <div className="font-semibold text-theme-primary">
                              {student.name}
                            </div>
                            <Text papel="rotulo" tom="fraco" as="div">
                              {student.email}
                            </Text>
                            {student.location && (
                              <Text
                                papel="legenda"
                                tom="fraco"
                                as="div"
                                className="flex items-center"
                              >
                                <PiMapPin className="w-3 h-3 mr-1" />
                                {student.location}
                              </Text>
                            )}
                          </div>
                        </Inline>

                        {/* Action Button */}
                        <div>
                          {student.isAlreadyStudent ? (
                            <span className="px-3 py-1 border rounded-full text-xs font-medium">
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
                                    <PiArrowsClockwise
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
                                <PiPlus className="w-4 h-4" />
                                <span>Com Plano</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </Stack>
              )}

              {/* RESULT AREA (altura fixa para evitar jumping) */}
              <div className="min-h-[200px] transition-all">
                {/* 🔄 BUSCANDO */}
                {isSearching && (
                  <div className="text-center py-10">
                    <PiMagnifyingGlass className="w-12 h-12 text-theme-tertiary mx-auto mb-4 animate-pulse" />
                    <h3 className="font-semibold text-theme-primary mb-2">
                      Buscando aluno…
                    </h3>
                    <Text papel="rotulo" tom="fraco" as="p">
                      Procurando usuário com o email informado
                    </Text>
                  </div>
                )}

                {/* ❌ NENHUM RESULTADO */}
                {hasSearched && searchResults.length === 0 && (
                  <div className="text-center py-10">
                    <PiWarning className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                    <h3 className="font-semibold text-theme-primary mb-2">
                      Nenhum aluno encontrado
                    </h3>
                    <Text papel="rotulo" tom="fraco" as="p">
                      Verifique se o email está correto ou se o aluno já possui
                      cadastro.
                    </Text>
                  </div>
                )}

                {/* 🧭 INSTRUÇÕES */}
                {searchQuery.length < 3 && (
                  <div className="text-center py-10">
                    <PiUserPlus className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                    <h3 className="font-semibold text-theme-primary mb-2">
                      Como adicionar um aluno
                    </h3>
                    <Text
                      papel="rotulo"
                      tom="fraco"
                      as="div"
                      className="space-y-2"
                    >
                      <p>1. Digite o email completo do aluno</p>
                      <p>2. O aluno precisa estar cadastrado</p>
                      <p>3. Escolha “Adicionar Rápido” ou “Com Plano”</p>
                    </Text>
                  </div>
                )}
              </div>
            </>
          ) : (
            // 🆕 NOVA: SEÇÃO DE PLANO DE ESTUDOS
            <Stack gap={6}>
              {/* Student Info Header */}
              <div className="rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Inline gap={3}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center">
                      <PiUser className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ouro-texto text-lg">
                        Configurar Plano de Estudos
                      </h3>
                      <p className="text-ouro-texto opacity-80">
                        {selectedStudent.name} • {selectedStudent.email}
                      </p>
                    </div>
                  </Inline>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Configurações Básicas */}
                <AnimatedCard className="classical-card p-4">
                  <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <PiCalendarBlank className="w-5 h-5 text-ouro-texto" />
                    Configurações de Aulas
                  </h4>

                  <Stack>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Select
                          label="Aulas por Semana"
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
                        <Select
                          label="Duração (minutos)"
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
                    <Stack gap={2}>
                      <label className="block text-sm font-medium text-theme-primary">
                        Dias Preferidos
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <label
                            key={day.value}
                            className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                              studyPlan.preferredDays.includes(day.value)
                                ? 'text-ouro-texto'
                                : 'border-theme-secondary'
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
                    </Stack>

                    {/* Horários Preferidos */}
                    <Stack gap={2}>
                      <label className="block text-sm font-medium text-theme-primary">
                        Horários Preferidos
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <label
                            key={time.value}
                            className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${
                              studyPlan.preferredTimes.includes(time.value)
                                ? 'text-ouro-texto'
                                : 'border-theme-secondary'
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
                    </Stack>
                  </Stack>
                </AnimatedCard>

                {/* Configurações de Estudo */}
                <AnimatedCard className="classical-card p-4">
                  <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <PiBookOpen className="w-5 h-5 text-ouro-texto" />
                    Plano de Estudos
                  </h4>

                  <Stack>
                    {/* Frequência de Prática */}
                    <div>
                      <Select
                        label="Frequência de Prática"
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
                      <Select
                        label="Tarefas de Casa"
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
                                ? ''
                                : 'border-theme-secondary text-theme-secondary'
                            }`}
                            disabled={studyPlan.currentFocus.includes(area)}
                          >
                            {area}
                          </button>
                        ))}
                      </div>

                      {/* Selecionadas */}
                      {studyPlan.currentFocus.length > 0 && (
                        <Stack gap={2}>
                          <Text papel="rotulo" tom="suave" as="p">
                            Áreas selecionadas:
                          </Text>
                          <div className="flex flex-wrap gap-2">
                            {studyPlan.currentFocus.map((focus) => (
                              <span
                                key={focus}
                                className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full"
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
                        </Stack>
                      )}
                    </div>
                  </Stack>
                </AnimatedCard>
              </div>

              {/* Campos de Texto Expandidos */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <Field.Area
                    label="Objetivos de Estudo"
                    value={studyPlan.studyGoals || ''}
                    onChange={(e) =>
                      handleStudyPlanChange('studyGoals', e.target.value)
                    }
                    rows={3}
                    placeholder="Descreva os objetivos musicais do aluno..."
                  />
                </div>

                <div>
                  <Field.Area
                    label="Instruções Especiais"
                    value={studyPlan.specialInstructions || ''}
                    onChange={(e) =>
                      handleStudyPlanChange(
                        'specialInstructions',
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Necessidades especiais, preferências específicas..."
                  />
                </div>
              </div>

              <div>
                <Field.Area
                  label="Plano de Aprendizado Detalhado"
                  value={studyPlan.learningPlan || ''}
                  onChange={(e) =>
                    handleStudyPlanChange('learningPlan', e.target.value)
                  }
                  rows={4}
                  placeholder="Descreva o plano detalhado de aprendizado, metodologia a ser seguida, progressão esperada..."
                />
              </div>

              <div>
                <Field.Area
                  label="Notas do Professor (privadas)"
                  value={studyPlan.teacherNotes || ''}
                  onChange={(e) =>
                    handleStudyPlanChange('teacherNotes', e.target.value)
                  }
                  rows={3}
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
                      <div className="w-4 h-4 border-2 rounded-full animate-spin"></div>
                      <span>Adicionando...</span>
                    </>
                  ) : (
                    <>
                      <PiPlus className="w-4 h-4" />
                      <span>Adicionar Aluno</span>
                    </>
                  )}
                </button>
              </div>
            </Stack>
          )}
        </div>
      </AnimatedCard>
    </Modal>
  );
};

export default AddStudentModal;
