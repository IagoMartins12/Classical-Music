// app/teacher/reviews/pageServer.tsx - Server Component para Avaliações

import {
  getTeacherReviewsData,
  getTeacherProfileExtended,
} from '@/app/requests/teacher-request';
import TeacherReviewsPageClient from './pageClient';

export interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  isPublic: boolean;

  // Avaliações específicas
  teachingQuality?: number;
  communication?: number;
  punctuality?: number;
  preparation?: number;
  patience?: number;
  motivation?: number;

  // Contexto
  relationshipDuration?: string;
  lessonsCount?: number;
  wouldRecommend: boolean;

  // Dados do aluno (anonimizados se público)
  student: {
    id: string;
    name: string;
    image?: string;
  };

  // Moderação
  isModerated: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNote?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewsStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  specificAverages: {
    teachingQuality: number;
    communication: number;
    punctuality: number;
    preparation: number;
    patience: number;
    motivation: number;
  };
  recommendationRate: number;
  publicReviews: number;
  privateReviews: number;
  recentReviews: number; // últimos 30 dias
  thisMonthCount: number;
  lastMonthCount: number;
}

export interface TeacherReviewsData {
  reviews: ReviewData[];
  stats: ReviewsStats;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  teacherProfile: {
    id: string;
    averageRating: number;
    totalReviews: number;
    isPublicProfile: boolean;
    bio?: string;
    specialties: string[];
  };
}

export default async function TeacherReviewsPageServer({
  userId,
}: {
  userId: string;
}) {
  console.log(`⭐ [TEACHER-REVIEWS-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // Buscar dados em paralelo
    const [reviewsData, teacherProfileData] = await Promise.all([
      getTeacherReviewsData(
        userId,
        true, // includePrivate - Professor pode ver reviews privados sobre si
        false, // includeModerated - Não incluir reviews moderados por padrão
        20, // limit
        0 // offset
      ),
      getTeacherProfileExtended(userId),
    ]);

    if (!reviewsData || !reviewsData.success) {
      throw new Error('Falha ao carregar dados das avaliações');
    }

    const teacherReviewsData: TeacherReviewsData = {
      reviews: reviewsData.reviews,
      stats: reviewsData.stats,
      pagination: reviewsData.pagination,
      teacherProfile: {
        id: userId,
        averageRating: teacherProfileData?.averageRating || 0,
        totalReviews: teacherProfileData?.totalReviews || 0,
        isPublicProfile: teacherProfileData?.isPublicProfile || false,
        bio: teacherProfileData?.bio || undefined,
        specialties: teacherProfileData?.specialties || [],
      },
    };

    console.log(
      `✅ [TEACHER-REVIEWS-PAGE-SERVER] Data loaded successfully - ${reviewsData.reviews.length} reviews, avg rating: ${teacherReviewsData.teacherProfile.averageRating}`
    );

    return <TeacherReviewsPageClient initialData={teacherReviewsData} />;
  } catch (error) {
    console.error('❌ [TEACHER-REVIEWS-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios
    return (
      <TeacherReviewsPageClient
        initialData={{
          reviews: [],
          stats: {
            total: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            specificAverages: {
              teachingQuality: 0,
              communication: 0,
              punctuality: 0,
              preparation: 0,
              patience: 0,
              motivation: 0,
            },
            recommendationRate: 0,
            publicReviews: 0,
            privateReviews: 0,
            recentReviews: 0,
            thisMonthCount: 0,
            lastMonthCount: 0,
          },
          pagination: {
            offset: 0,
            limit: 20,
            total: 0,
            hasMore: false,
          },
          teacherProfile: {
            id: userId,
            averageRating: 0,
            totalReviews: 0,
            isPublicProfile: false,
            specialties: [],
          },
        }}
        errorMessage="Erro ao carregar dados das avaliações. Tente recarregar a página."
      />
    );
  }
}
