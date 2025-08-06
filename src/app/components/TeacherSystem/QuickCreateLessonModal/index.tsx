// app/components/teacher/QuickCreateLessonModal.tsx - Modal para criar aula rapidamente

'use client';

import { useState, useCallback } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSave,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import Image from 'next/image';
import Input from '../../Common/Inputs';
import Select from '../../Common/Select';
import { useCreateLesson } from '@/app/hooks/lessonsSystem/useCreateLesson';

interface QuickCreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    relationship: {
      lessonDuration: number;
    };
  }>;
}

export default function QuickCreateLessonModal({
  isOpen,
  onClose,
  onSuccess,
  students,
}: QuickCreateLessonModalProps) {
  const { createLesson, loading, error, clearError } = useCreateLesson();

  // Form state
  const [formData, setFormData] = useState({
    studentUserId: '',
    title: '',
    scheduledAt: '',
    duration: 60,
    location: '',
    objectives: '',
  });

  const [selectedStudent, setSelectedStudent] = useState<
    (typeof students)[0] | null
  >(null);

  // Form handlers
  const updateFormData = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Update selected student and duration
      if (field === 'studentUserId') {
        const student = students.find((s) => s.id === value);
        setSelectedStudent(student || null);
        if (student) {
          setFormData((prev) => ({
            ...prev,
            duration: student.relationship.lessonDuration,
          }));
        }
      }
    },
    [students]
  );

  // Generate title based on student and date
  const generateTitle = useCallback(() => {
    if (selectedStudent && formData.scheduledAt) {
      const lessonDate = new Date(formData.scheduledAt).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
        }
      );
      return `Aula ${selectedStudent.name} - ${lessonDate}`;
    }
    return '';
  }, [selectedStudent, formData.scheduledAt]);

  // Auto-generate title
  const handleGenerateTitle = useCallback(() => {
    const title = generateTitle();
    if (title) {
      updateFormData('title', title);
    }
  }, [generateTitle, updateFormData]);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      if (!formData.studentUserId || !formData.title || !formData.scheduledAt) {
        return;
      }

      const lessonData = {
        ...formData,
        objectives: formData.objectives ? [formData.objectives] : [],
      };

      const success = await createLesson(lessonData);

      if (success) {
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          studentUserId: '',
          title: '',
          scheduledAt: '',
          duration: 60,
          location: '',
          objectives: '',
        });
        setSelectedStudent(null);
      }
    },
    [formData, createLesson, onSuccess, onClose, clearError]
  );

  // Reset and close
  const handleClose = useCallback(() => {
    clearError();
    onClose();
  }, [clearError, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatedCard
        hover="none"
        className="classical-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              Criar Aula Rápida
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4 text-theme-tertiary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Aluno *
              </label>
              <Select
                options={[
                  { value: '', label: 'Selecione um aluno...' },
                  ...students.map((student) => ({
                    value: student.id,
                    label: `${student.name} (${student.level})`,
                  })),
                ]}
                value={formData.studentUserId}
                onChange={(e) =>
                  updateFormData('studentUserId', e.target.value)
                }
                className="input-classical w-full"
                required
              />
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {selectedStudent.image ? (
                    <div className="w-10 h-10 relative rounded-full overflow-hidden">
                      <Image
                        src={selectedStudent.image}
                        alt={selectedStudent.name}
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
                  <div>
                    <div className="font-medium text-theme-primary">
                      {selectedStudent.name}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      Duração padrão:{' '}
                      {selectedStudent.relationship.lessonDuration}min
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Data e Hora *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    updateFormData('scheduledAt', e.target.value)
                  }
                  className="input-classical w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Duração (min)
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    updateFormData('duration', parseInt(e.target.value))
                  }
                  min={15}
                  max={180}
                  step={15}
                  className="input-classical w-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-theme-primary">
                  Título da Aula *
                </label>
                {selectedStudent && formData.scheduledAt && (
                  <button
                    type="button"
                    onClick={handleGenerateTitle}
                    className="text-brand-primary hover:text-brand-secondary text-sm"
                  >
                    Gerar automaticamente
                  </button>
                )}
              </div>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="input-classical w-full"
                placeholder="Ex: Aula de Piano - Chopin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Local
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                className="input-classical w-full"
                placeholder="Ex: Online, Estúdio A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Objetivo Principal
              </label>
              <Input
                type="text"
                value={formData.objectives}
                onChange={(e) => updateFormData('objectives', e.target.value)}
                className="input-classical w-full"
                placeholder="Ex: Trabalhar técnica de escalas"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-accent-red" />
                  <div>
                    <p className="text-accent-red font-medium">
                      Erro ao criar aula
                    </p>
                    <p className="text-accent-red/80 text-sm">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-auto text-accent-red"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
              <button
                type="button"
                onClick={handleClose}
                className="btn-classical-secondary"
                disabled={loading.createLesson}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  loading.createLesson ||
                  !formData.studentUserId ||
                  !formData.title ||
                  !formData.scheduledAt
                }
                className="btn-classical-primary flex items-center space-x-2"
              >
                {loading.createLesson ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                <span>
                  {loading.createLesson ? 'Criando...' : 'Criar Aula'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </AnimatedCard>
    </div>
  );
}
