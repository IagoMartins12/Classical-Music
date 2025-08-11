// app/student/reviews/pageServer.tsx - Server Component para Avaliações dos Professores

import { getStudentProfileForPageServer } from '@/app/requests/student-requests';
import StudentReviewsPageClient from './pageClient';

export interface TeacherToReview {
  teacherId: string;
  teacherName: string;
  teacherImage?: string;
  teacherEmail?: string;
  specialties: string[];
  relationshipStart: Date;
  totalLessons: number;
  completedLessons: number;
  relationshipDuration: string;
  hasReview: boolean;
  currentReview?: {
    id: string;
    rating: number;
    comment?: string;
    teachingQuality?: number;
    communication?: number;
    punctuality?: number;
    preparation?: number;
    patience?: number;
    motivation?: number;
    wouldRecommend: boolean;
    createdAt: Date;
  };
}

export interface StudentReviewsData {
  teachers: TeacherToReview[];
  summary: {
    totalTeachers: number;
    activeTeachers: number;
    pendingReviews: number;
    completedReviews: number;
  };
}

interface StudentReviewsPageServerProps {
  userId: string;
}

// Helper function to calculate relationship duration
function calculateRelationshipDuration(startDate: Date): string {
  console.log('START DATE', startDate);
  const now = new Date();

  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    let duration = `${years} ${years === 1 ? 'ano' : 'anos'}`;
    if (remainingMonths > 0) {
      duration += ` e ${remainingMonths} ${
        remainingMonths === 1 ? 'mês' : 'meses'
      }`;
    }
    return duration;
  }
}

export default async function StudentReviewsPageServer({
  userId,
}: StudentReviewsPageServerProps) {
  console.log(`⭐ [STUDENT-REVIEWS-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // Buscar perfil do aluno para verificar professores vinculados
    console.log('🔍 Verificando perfil do aluno...');
    const profileData = await getStudentProfileForPageServer(userId);

    if (!profileData || !profileData.profile) {
      throw new Error('Perfil de aluno não encontrado');
    }

    // Verificar se tem professores ativos
    const activeTeachers = profileData.profile.teachers.filter(
      (t) => t.isActive
    );

    if (activeTeachers.length === 0) {
      // Aluno não tem professores - mostrar página especial
      return (
        <StudentReviewsPageClient
          initialData={null}
          errorMessage="no_teachers"
        />
      );
    }

    // Para cada professor, buscar dados completos incluindo avaliação existente
    console.log('📊 Preparando dados dos professores...');
    const teachersToReview: TeacherToReview[] = [];

    for (const teacher of activeTeachers) {
      // Buscar avaliação existente (simulado - na real seria uma query ao banco)
      // Por enquanto, vamos simular que não há avaliações ainda
      const hasReview = false; // TODO: Implementar busca real por avaliação
      const currentReview = undefined; // TODO: Buscar avaliação real se existir

      const teacherData: TeacherToReview = {
        teacherId: teacher.teacherId,
        teacherName: teacher.teacherName,
        teacherImage: teacher.teacherImage,
        teacherEmail: undefined, // Não expostas no perfil do student
        specialties: [], // TODO: Buscar especialidades do professor
        relationshipStart: teacher.startDate,
        totalLessons: teacher.totalLessons,
        completedLessons: 0, // TODO: Calcular aulas concluídas
        relationshipDuration: calculateRelationshipDuration(teacher.startDate),
        hasReview,
        currentReview,
      };

      teachersToReview.push(teacherData);
    }

    // Calcular resumo
    const summary = {
      totalTeachers: teachersToReview.length,
      activeTeachers: teachersToReview.length, // Todos são ativos neste caso
      pendingReviews: teachersToReview.filter((t) => !t.hasReview).length,
      completedReviews: teachersToReview.filter((t) => t.hasReview).length,
    };

    const studentReviewsData: StudentReviewsData = {
      teachers: teachersToReview,
      summary,
    };

    console.log(
      `✅ [STUDENT-REVIEWS-PAGE-SERVER] Data loaded successfully - ${teachersToReview.length} professores`
    );

    return <StudentReviewsPageClient initialData={studentReviewsData} />;
  } catch (error) {
    console.error('❌ [STUDENT-REVIEWS-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios
    return (
      <StudentReviewsPageClient
        initialData={null}
        errorMessage="Erro ao carregar dados. Tente recarregar a página."
      />
    );
  }
}
