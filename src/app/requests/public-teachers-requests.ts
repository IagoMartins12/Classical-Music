// app/requests/public-teachers-requests.ts — diretório público de professores, pela API (Etapa 3)
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

// ====================================
// TYPES AND INTERFACES
// ====================================

export interface PublicTeacher {
  id: string;
  name: string;
  profileImage?: string;
  bio?: string;
  publicBio?: string;
  specialties: string[];
  instruments: string[];
  experience?: string;
  education?: string;
  achievements?: string;
  website?: string;
  socialMedia?: any;
  highlightedWorks: string[];
  teachingMethod?: string;
  ageGroups: string[];
  skillLevels: string[];

  // Contact
  email?: string;
  phone?: string;
  location?: string;

  // Stats
  isVerified: boolean;
  averageRating?: number;
  totalReviews: number;
  totalStudents: number;
  totalLessons: number;
  completionRate?: number;
  teachingSince: Date;
  yearsExperience: number;
}

export interface TeacherFilters {
  instruments: Array<{ name: string; count: number }>;
  specialties: Array<{ name: string; count: number }>;
  skillLevels: Array<{ name: string; count: number }>;
  ageGroups: Array<{ name: string; count: number }>;
  locations: Array<{ name: string; count: number }>;
}

export interface PublicTeachersResponse {
  teachers: PublicTeacher[];
  filters: TeacherFilters;
  stats: {
    totalTeachers: number;
    verifiedTeachers: number;
    averageRating: number;
    totalActiveStudents: number;
  };
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface TeacherDetailedProfile extends PublicTeacher {
  fullBio: string;
  teachingPhilosophy?: string;

  // A API não devolve estes dois e nenhuma tela os usa; ficam vazios. No
  // legado, a nota era sempre zero e "novos alunos" contava todos, todo mês.
  monthlyStats: Array<{
    month: string;
    year: number;
    newStudents: number;
    completedLessons: number;
  }>;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  contactPreferences: {
    preferredMethod: 'whatsapp' | 'email' | 'both';
    responseTime: string;
    acceptingStudents: boolean;
    maxStudentsPerWeek: number;
    defaultLessonDuration: number;
  };
}

type TeacherSummary = ApiSchema<'PublicTeacherSummaryDto'>;

/**
 * Cache do `fetch` do Next. O diretório é público e igual para todos; a API
 * avisa pela tag `teachers` quando um perfil muda.
 */
const TEACHERS_CACHE = { revalidate: 300, tags: ['teachers'] };

function toPublicTeacher(teacher: TeacherSummary): PublicTeacher {
  return {
    id: teacher.id,
    name: teacher.name,
    profileImage: teacher.profileImage || undefined,
    bio: teacher.bio || undefined,
    publicBio: teacher.publicBio || undefined,
    specialties: teacher.specialties,
    instruments: teacher.instruments,
    experience: teacher.experience || undefined,
    education: teacher.education || undefined,
    achievements: teacher.achievements || undefined,
    website: teacher.website || undefined,
    socialMedia: teacher.socialMedia,
    highlightedWorks: teacher.highlightedWorks,
    teachingMethod: teacher.teachingMethod || undefined,
    ageGroups: teacher.ageGroups,
    skillLevels: teacher.skillLevels,
    email: teacher.email || undefined,
    phone: teacher.phone || undefined,
    location: teacher.location || undefined,
    isVerified: teacher.isVerified,
    averageRating: teacher.averageRating || undefined,
    totalReviews: teacher.totalReviews,
    totalStudents: teacher.totalStudents,
    totalLessons: teacher.totalLessons,
    completionRate: teacher.completionRate || undefined,
    teachingSince: new Date(teacher.teachingSince),
    yearsExperience: teacher.yearsExperience,
  };
}

// Lista de professores públicos com filtros. `null` se a API falhar.
export async function getPublicTeachers(
  filters: {
    instrument?: string;
    specialty?: string;
    skillLevel?: string;
    ageGroup?: string;
    location?: string;
    verified?: boolean;
    sortBy?: 'rating' | 'students' | 'experience' | 'name';
    limit?: number;
    offset?: number;
  } = {}
): Promise<PublicTeachersResponse | null> {
  const {
    instrument,
    specialty,
    skillLevel,
    ageGroup,
    location,
    verified = false,
    sortBy = 'rating',
    limit = 12,
    offset = 0,
  } = filters;

  try {
    // A lista e as opções de filtro são duas rotas na API.
    const [list, filterOptions] = await Promise.all([
      apiFetch<ApiSchema<'PublicTeachersListResponseDto'>>('/teachers', {
        query: {
          instrument,
          specialty,
          skillLevel,
          ageGroup,
          location,
          verified: verified || undefined,
          sortBy,
          page: Math.floor(offset / limit) + 1,
          limit,
        },
        next: TEACHERS_CACHE,
      }),
      apiFetch<ApiSchema<'TeacherFilterOptionsResponseDto'>>(
        '/teachers/filter-options',
        { next: TEACHERS_CACHE }
      ),
    ]);

    return {
      teachers: list.teachers.map(toPublicTeacher),
      filters: filterOptions,
      stats: list.stats,
      pagination: {
        offset,
        limit: list.pagination.limit,
        total: list.pagination.total,
        hasMore: list.pagination.hasMore,
      },
    };
  } catch (error) {
    console.error('❌ [PUBLIC-TEACHERS] Error loading public teachers:', error);
    return null;
  }
}

// Detalhes de um professor público; `null` se não existe ou não é público.
export async function getPublicTeacherDetails(
  teacherId: string
): Promise<TeacherDetailedProfile | null> {
  try {
    const teacher = await apiFetch<ApiSchema<'PublicTeacherDetailDto'>>(
      `/teachers/${encodeURIComponent(teacherId)}`,
      { next: TEACHERS_CACHE }
    );

    return {
      ...toPublicTeacher(teacher),
      fullBio: teacher.fullBio,
      teachingPhilosophy: teacher.teachingPhilosophy || undefined,
      monthlyStats: [],
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      contactPreferences: teacher.contactPreferences,
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return null;
    }
    console.error(
      '❌ [PUBLIC-TEACHER-DETAILS] Error loading teacher details:',
      error
    );
    return null;
  }
}
