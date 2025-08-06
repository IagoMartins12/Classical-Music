// app/student/reviews/pageClient.tsx - Client Component para Avaliações dos Professores

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiStar,
  FiUser,
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiEdit3,
  FiHeart,
  FiThumbsUp,
  FiAward,
  FiEye,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { StudentReviewsData, TeacherToReview } from './pageServer';
import Link from 'next/link';
import Image from 'next/image';
import { useStudentReviews } from '@/app/hooks/lessonsSystem/useStudentReviews';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface StudentReviewsPageClientProps {
  initialData: StudentReviewsData | null;
  studentProfile: StudentProfile;
  errorMessage?: string;
}

interface ReviewFormData {
  rating: number;
  comment: string;
  teachingQuality: number;
  communication: number;
  punctuality: number;
  preparation: number;
  patience: number;
  motivation: number;
  wouldRecommend: boolean;
}

const initialFormData: ReviewFormData = {
  rating: 5,
  comment: '',
  teachingQuality: 5,
  communication: 5,
  punctuality: 5,
  preparation: 5,
  patience: 5,
  motivation: 5,
  wouldRecommend: true,
};

export default function StudentReviewsPageClient({
  initialData,
  studentProfile,
  errorMessage,
}: StudentReviewsPageClientProps) {
  // Initialize hook with server data
  const {
    teachers,
    loading,
    error,
    successMessage,
    fetchTeachersToReview,
    submitReview,
    updateReview,
    refreshTeachers,
    clearError,
    clearSuccess,
  } = useStudentReviews();

  // Local UI states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherToReview | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>(initialFormData);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Use initial data or hook data
  const displayTeachers = initialData?.teachers || teachers;
  const displaySummary = initialData?.summary || {
    totalTeachers: teachers.length,
    activeTeachers: teachers.length,
    pendingReviews: teachers.filter((t) => !t.hasReview).length,
    completedReviews: teachers.filter((t) => t.hasReview).length,
  };

  // Initialize with server data
  useEffect(() => {
    if (initialData && initialData.teachers.length > 0) {
      console.log('⭐ Usando dados iniciais do servidor');
    } else if (!errorMessage && errorMessage !== 'no_teachers') {
      fetchTeachersToReview();
    }
  }, [initialData, errorMessage, fetchTeachersToReview]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setShowSuccessAlert(true);
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        clearSuccess();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccess]);

  // Handle open review modal
  const handleOpenReviewModal = useCallback(
    (teacher: TeacherToReview, editMode: boolean = false) => {
      setSelectedTeacher(teacher);
      setIsEditMode(editMode);

      if (editMode && teacher.currentReview) {
        // Fill form with existing review data
        setFormData({
          rating: teacher.currentReview.rating,
          comment: teacher.currentReview.comment || '',
          teachingQuality: teacher.currentReview.teachingQuality || 5,
          communication: teacher.currentReview.communication || 5,
          punctuality: teacher.currentReview.punctuality || 5,
          preparation: teacher.currentReview.preparation || 5,
          patience: teacher.currentReview.patience || 5,
          motivation: teacher.currentReview.motivation || 5,
          wouldRecommend: teacher.currentReview.wouldRecommend,
        });
      } else {
        setFormData(initialFormData);
      }

      setShowReviewModal(true);
    },
    []
  );

  // Handle close review modal
  const handleCloseReviewModal = useCallback(() => {
    setShowReviewModal(false);
    setSelectedTeacher(null);
    setIsEditMode(false);
    setFormData(initialFormData);
  }, []);

  // Handle submit review
  const handleSubmitReview = useCallback(async () => {
    if (!selectedTeacher) return;

    const success = isEditMode
      ? await updateReview(selectedTeacher.teacherId, formData)
      : await submitReview(selectedTeacher.teacherId, formData);

    if (success) {
      handleCloseReviewModal();
    }
  }, [
    selectedTeacher,
    formData,
    isEditMode,
    submitReview,
    updateReview,
    handleCloseReviewModal,
  ]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshTeachers();
  }, [refreshTeachers]);

  // Star Rating Component
  const StarRating = ({
    value,
    onChange,
    size = 'w-6 h-6',
    readonly = false,
  }: {
    value: number;
    onChange?: (value: number) => void;
    size?: string;
    readonly?: boolean;
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            disabled={readonly}
            className={`${size} ${
              star <= value ? 'text-accent-yellow' : 'text-theme-tertiary'
            } ${
              !readonly
                ? 'hover:text-accent-yellow cursor-pointer'
                : 'cursor-default'
            } transition-colors`}
          >
            <FiStar className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  // Error state para "no teachers"
  if (errorMessage === 'no_teachers') {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiUser className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Nenhum Professor Vinculado
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              Você ainda não tem professores vinculados à sua conta. Entre em
              contato com um professor para começar suas aulas.
            </p>
            <Link href="/student" className="btn-classical-primary">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state geral
  if ((error || errorMessage) && displayTeachers.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiStar className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Professores
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                disabled={loading.teachers}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${
                    loading.teachers ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.teachers ? 'Carregando...' : 'Tentar Novamente'}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  Limpar Erro
                </button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Success Alert */}
        {showSuccessAlert && successMessage && (
          <div className="fixed top-4 right-4 z-50">
            <AnimatedCard
              hover="none"
              className="classical-card p-4 border-l-4 border-accent-green max-w-sm"
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-accent-green/10 rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-accent-green" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-accent-green">
                    {successMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessAlert(false)}
                  className="w-5 h-5 text-theme-tertiary hover:text-theme-primary"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </AnimatedCard>
          </div>
        )}

        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiStar className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Avaliar Professores
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Compartilhe sua experiência e ajude outros alunos
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiUser className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displaySummary.totalTeachers}
              </div>
              <div className="text-sm text-theme-tertiary">Professores</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displaySummary.completedReviews}
              </div>
              <div className="text-sm text-theme-tertiary">Avaliadas</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiClock className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displaySummary.pendingReviews}
              </div>
              <div className="text-sm text-theme-tertiary">Pendentes</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHeart className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displaySummary.activeTeachers}
              </div>
              <div className="text-sm text-theme-tertiary">Ativos</div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-theme-primary">
              Seus Professores
            </h2>
            <button
              onClick={handleRefresh}
              disabled={loading.teachers}
              className="btn-classical-secondary flex items-center space-x-2"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${loading.teachers ? 'animate-spin' : ''}`}
              />
              <span>Atualizar</span>
            </button>
          </div>
        </AnimatedItem>

        {/* Teachers Grid */}
        <AnimatedItem direction="up" springType="gentle">
          {displayTeachers.length === 0 ? (
            <div className="text-center py-12">
              <FiStar className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-theme-primary mb-2">
                Nenhum Professor Encontrado
              </h3>
              <p className="text-theme-tertiary">
                Você ainda não tem professores vinculados para avaliar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTeachers.map((teacher, index) => (
                <AnimatedCard
                  key={teacher.teacherId}
                  hover="lift"
                  className="classical-card p-6"
                  delay={index * 0.1}
                >
                  {/* Teacher Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    {teacher.teacherImage ? (
                      <div className="w-16 h-16 relative rounded-full overflow-hidden">
                        <Image
                          src={teacher.teacherImage}
                          alt={teacher.teacherName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-theme-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-theme-primary mb-1">
                        {teacher.teacherName}
                      </h3>
                      <p className="text-sm text-theme-tertiary">
                        Estudando há {teacher.relationshipDuration}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-theme-primary">
                        {teacher.totalLessons}
                      </div>
                      <div className="text-xs text-theme-tertiary">
                        Total de aulas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-theme-primary">
                        {teacher.completedLessons}
                      </div>
                      <div className="text-xs text-theme-tertiary">
                        Concluídas
                      </div>
                    </div>
                  </div>

                  {/* Review Status */}
                  {teacher.hasReview && teacher.currentReview ? (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-accent-green">
                          ✓ Avaliação enviada
                        </span>
                        <button
                          onClick={() => handleOpenReviewModal(teacher, true)}
                          className="text-sm text-brand-primary hover:text-brand-secondary transition-colors flex items-center space-x-1"
                        >
                          <FiEdit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </div>

                      <div className="bg-gradient-to-r from-accent-green/5 to-accent-blue/5 rounded-lg border border-accent-green/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <StarRating
                            value={teacher.currentReview.rating}
                            readonly
                            size="w-4 h-4"
                          />
                          <span className="text-sm text-theme-tertiary">
                            {new Date(
                              teacher.currentReview.createdAt
                            ).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {teacher.currentReview.comment && (
                          <p className="text-sm text-theme-secondary line-clamp-2">
                            {teacher.currentReview.comment}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-theme-tertiary">
                            {teacher.currentReview.wouldRecommend
                              ? 'Recomendaria'
                              : 'Não recomendaria'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <FiThumbsUp
                              className={`w-3 h-3 ${
                                teacher.currentReview.wouldRecommend
                                  ? 'text-accent-green'
                                  : 'text-theme-tertiary'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="flex items-center justify-center p-4 border-2 border-dashed border-theme-secondary rounded-lg">
                        <div className="text-center">
                          <FiStar className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                          <p className="text-sm text-theme-tertiary">
                            Avaliação pendente
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() =>
                      handleOpenReviewModal(teacher, teacher.hasReview)
                    }
                    className={`w-full flex items-center justify-center space-x-2 ${
                      teacher.hasReview
                        ? 'btn-classical-secondary'
                        : 'btn-classical-primary'
                    }`}
                  >
                    {teacher.hasReview ? (
                      <>
                        <FiEye className="w-4 h-4" />
                        <span>Ver Avaliação</span>
                      </>
                    ) : (
                      <>
                        <FiStar className="w-4 h-4" />
                        <span>Avaliar Professor</span>
                      </>
                    )}
                  </button>
                </AnimatedCard>
              ))}
            </div>
          )}
        </AnimatedItem>
      </AnimatedContainer>

      {/* Review Modal */}
      {showReviewModal && selectedTeacher && (
        <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <AnimatedCard
            hover="none"
            className="classical-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-theme-primary">
                    {isEditMode ? 'Editar Avaliação' : 'Avaliar Professor'}
                  </h2>
                  <p className="text-theme-secondary">
                    {selectedTeacher.teacherName}
                  </p>
                </div>
                <button
                  onClick={handleCloseReviewModal}
                  className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                >
                  <FiX className="w-4 h-4 text-theme-tertiary" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-3">
                    Avaliação Geral *
                  </label>
                  <StarRating
                    value={formData.rating}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, rating: value }))
                    }
                    size="w-8 h-8"
                  />
                </div>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Qualidade do Ensino
                    </label>
                    <StarRating
                      value={formData.teachingQuality}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          teachingQuality: value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Comunicação
                    </label>
                    <StarRating
                      value={formData.communication}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          communication: value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Pontualidade
                    </label>
                    <StarRating
                      value={formData.punctuality}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, punctuality: value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Preparação das Aulas
                    </label>
                    <StarRating
                      value={formData.preparation}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, preparation: value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Paciência
                    </label>
                    <StarRating
                      value={formData.patience}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, patience: value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Motivação
                    </label>
                    <StarRating
                      value={formData.motivation}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, motivation: value }))
                      }
                    />
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Comentário (opcional)
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Compartilhe sua experiência com este professor..."
                    rows={4}
                    className="input-classical w-full resize-none"
                  />
                </div>

                {/* Would Recommend */}
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-3">
                    Você recomendaria este professor?
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          wouldRecommend: true,
                        }))
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                        formData.wouldRecommend
                          ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                          : 'border-theme-secondary text-theme-secondary hover:border-accent-green/30'
                      }`}
                    >
                      <FiThumbsUp className="w-4 h-4" />
                      <span>Sim, recomendaria</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          wouldRecommend: false,
                        }))
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                        !formData.wouldRecommend
                          ? 'bg-accent-red/10 border-accent-red/30 text-accent-red'
                          : 'border-theme-secondary text-theme-secondary hover:border-accent-red/30'
                      }`}
                    >
                      <FiX className="w-4 h-4" />
                      <span>Não recomendaria</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-theme-secondary">
                <button
                  onClick={handleCloseReviewModal}
                  className="btn-classical-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={loading.submitReview || loading.updateReview}
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  {(loading.submitReview || loading.updateReview) && (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {loading.submitReview || loading.updateReview
                      ? 'Enviando...'
                      : isEditMode
                      ? 'Atualizar Avaliação'
                      : 'Enviar Avaliação'}
                  </span>
                </button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </PageContainer>
  );
}
