// app/requests/public-teachers-requests.ts - Queries diretas para professores públicos

import { unstable_cache } from 'next/cache';
import prisma from '@/app/libs/prismadb';

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

  // Preview data
  recentReviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    studentName: string;
    createdAt: Date;
    wouldRecommend: boolean;
  }>;
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
  // Extended details
  fullBio: string;
  teachingPhilosophy?: string;
  studentTestimonials: Array<{
    id: string;
    rating: number;
    comment: string;
    studentName: string;
    relationshipDuration?: string;
    lessonsCount?: number;
    wouldRecommend: boolean;
    teachingQuality?: number;
    communication?: number;
    punctuality?: number;
    patience?: number;
    createdAt: Date;
  }>;

  // Extended stats
  monthlyStats: Array<{
    month: string;
    year: number;
    newStudents: number;
    completedLessons: number;
    avgRating: number;
  }>;

  // Rating breakdown
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  // Contact preferences
  contactPreferences: {
    preferredMethod: 'whatsapp' | 'email' | 'both';
    responseTime: string;
    acceptingStudents: boolean;
    maxStudentsPerWeek: number;
    defaultLessonDuration: number;
  };
}

// ====================================
// DIRECT DATABASE QUERIES
// ====================================

// Buscar lista de professores públicos com filtros
export const getPublicTeachers = unstable_cache(
  async (
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
  ): Promise<PublicTeachersResponse | null> => {
    try {
      console.log(
        `👨‍🏫 [PUBLIC-TEACHERS] Loading public teachers with filters:`,
        filters
      );

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

      // Build where clause
      let whereClause: any = {
        isPublicProfile: true,
        status: 'ACTIVE',
      };

      if (verified) {
        whereClause.isVerified = true;
      }

      // Apply filters
      if (instrument) {
        whereClause.instruments = {
          has: instrument,
        };
      }

      if (specialty) {
        whereClause.specialties = {
          has: specialty,
        };
      }

      if (skillLevel) {
        whereClause.skillLevels = {
          has: skillLevel,
        };
      }

      if (ageGroup) {
        whereClause.ageGroups = {
          has: ageGroup,
        };
      }

      // Location filter (city or state)
      if (location) {
        whereClause.user = {
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { state: { contains: location, mode: 'insensitive' } },
          ],
        };
      }

      // Build order by
      let orderBy: any = {};
      switch (sortBy) {
        case 'rating':
          orderBy = [
            { averageRating: 'desc' },
            { totalReviews: 'desc' },
            { isVerified: 'desc' },
          ];
          break;
        case 'students':
          orderBy = [{ totalStudents: 'desc' }, { averageRating: 'desc' }];
          break;
        case 'experience':
          orderBy = [
            { createdAt: 'asc' }, // Mais antigo = mais experiente
            { averageRating: 'desc' },
          ];
          break;
        case 'name':
          orderBy = { user: { firstName: 'asc' } };
          break;
        default:
          orderBy = [{ averageRating: 'desc' }];
          break;
      }

      // Fetch teachers
      const [teachers, totalCount] = await Promise.all([
        prisma.teacher.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                image: true,
                createdAt: true,
              },
            },
            reviews: {
              where: {
                isPublic: true,
                isModerated: false,
              },
              include: {
                student: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
          orderBy,
          take: limit,
          skip: offset,
        }),
        prisma.teacher.count({ where: whereClause }),
      ]);

      console.log(
        `📊 [PUBLIC-TEACHERS] Found ${teachers.length} public teachers`
      );

      // Format teachers data
      const formattedTeachers: PublicTeacher[] = teachers.map((teacher) => {
        const yearsExperience = Math.floor(
          (Date.now() - teacher.createdAt.getTime()) /
            (1000 * 60 * 60 * 24 * 365)
        );

        return {
          id: teacher.user.id,
          name: `${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
          profileImage: teacher.profileImage || teacher.user.image || undefined,
          bio: teacher.bio || undefined,
          publicBio: teacher.publicBio || teacher.bio || undefined,
          specialties: teacher.specialties || [],
          instruments: teacher.instruments || [],
          experience: teacher.experience || undefined,
          education: teacher.education || undefined,
          achievements: teacher.achievements || undefined,
          website: teacher.website || undefined,
          socialMedia: teacher.socialMedia,
          highlightedWorks: teacher.highlightedWorks,
          teachingMethod: teacher.teachingMethod || undefined,
          ageGroups: teacher.ageGroups,
          skillLevels: teacher.skillLevels,

          // Contact info
          email: teacher.user.email || undefined,
          phone: teacher.user.phone || undefined,
          location:
            [teacher.user.city, teacher.user.state]
              .filter(Boolean)
              .join(', ') || undefined,

          // Stats
          isVerified: teacher.isVerified,
          averageRating: teacher.averageRating || undefined,
          totalReviews: teacher.totalReviews,
          totalStudents: teacher.totalStudents,
          totalLessons: teacher.totalLessons,
          completionRate: teacher.completionRate || undefined,
          teachingSince: teacher.createdAt,
          yearsExperience: Math.max(1, yearsExperience),

          // Recent reviews (anonymized)
          recentReviews: teacher.reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment || undefined,
            studentName: `${review.student.user.firstName?.charAt(0)}***`,
            createdAt: review.createdAt,
            wouldRecommend: review.wouldRecommend,
          })),
        };
      });

      // Generate filter options
      console.log('🔍 [PUBLIC-TEACHERS] Generating filter options...');

      const [
        allInstruments,
        allSpecialties,
        allSkillLevels,
        allAgeGroups,
        allLocations,
      ] = await Promise.all([
        // Get all instruments with counts
        prisma.teacher
          .findMany({
            where: { isPublicProfile: true, status: 'ACTIVE' },
            select: { instruments: true },
          })
          .then((results) => {
            const instrumentCount: Record<string, number> = {};
            results.forEach((teacher) => {
              teacher.instruments.forEach((instrument) => {
                instrumentCount[instrument] =
                  (instrumentCount[instrument] || 0) + 1;
              });
            });
            return Object.entries(instrumentCount)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
          }),

        // Get all specialties with counts
        prisma.teacher
          .findMany({
            where: { isPublicProfile: true, status: 'ACTIVE' },
            select: { specialties: true },
          })
          .then((results) => {
            const specialtyCount: Record<string, number> = {};
            results.forEach((teacher) => {
              teacher.specialties.forEach((specialty) => {
                specialtyCount[specialty] =
                  (specialtyCount[specialty] || 0) + 1;
              });
            });
            return Object.entries(specialtyCount)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
          }),

        // Get all skill levels with counts
        prisma.teacher
          .findMany({
            where: { isPublicProfile: true, status: 'ACTIVE' },
            select: { skillLevels: true },
          })
          .then((results) => {
            const skillCount: Record<string, number> = {};
            results.forEach((teacher) => {
              teacher.skillLevels.forEach((skill) => {
                skillCount[skill] = (skillCount[skill] || 0) + 1;
              });
            });
            return Object.entries(skillCount)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
          }),

        // Get all age groups with counts
        prisma.teacher
          .findMany({
            where: { isPublicProfile: true, status: 'ACTIVE' },
            select: { ageGroups: true },
          })
          .then((results) => {
            const ageCount: Record<string, number> = {};
            results.forEach((teacher) => {
              teacher.ageGroups.forEach((age) => {
                ageCount[age] = (ageCount[age] || 0) + 1;
              });
            });
            return Object.entries(ageCount)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
          }),

        // Get all locations with counts
        prisma.teacher
          .findMany({
            where: { isPublicProfile: true, status: 'ACTIVE' },
            include: {
              user: { select: { city: true, state: true } },
            },
          })
          .then((results) => {
            const locationCount: Record<string, number> = {};
            results.forEach((teacher) => {
              const location = [teacher.user.city, teacher.user.state]
                .filter(Boolean)
                .join(', ');
              if (location) {
                locationCount[location] = (locationCount[location] || 0) + 1;
              }
            });
            return Object.entries(locationCount)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
          }),
      ]);

      const teacherFilters: TeacherFilters = {
        instruments: allInstruments,
        specialties: allSpecialties,
        skillLevels: allSkillLevels,
        ageGroups: allAgeGroups,
        locations: allLocations,
      };

      // Calculate global stats
      const stats = {
        totalTeachers: totalCount,
        verifiedTeachers: formattedTeachers.filter((t) => t.isVerified).length,
        averageRating:
          formattedTeachers.length > 0
            ? formattedTeachers.reduce(
                (sum, t) => sum + (t.averageRating || 0),
                0
              ) / formattedTeachers.length
            : 0,
        totalActiveStudents: formattedTeachers.reduce(
          (sum, t) => sum + t.totalStudents,
          0
        ),
      };

      console.log(
        `✅ [PUBLIC-TEACHERS] Successfully loaded ${formattedTeachers.length} teachers`
      );

      return {
        teachers: formattedTeachers,
        filters: teacherFilters,
        stats,
        pagination: {
          offset,
          limit,
          total: totalCount,
          hasMore: offset + formattedTeachers.length < totalCount,
        },
      };
    } catch (error) {
      console.error(
        '❌ [PUBLIC-TEACHERS] Error loading public teachers:',
        error
      );
      return null;
    }
  },
  ['public-teachers-data'],
  {
    revalidate: 600, // 10 minutos
    tags: ['public-teachers'],
  }
);

// Buscar detalhes completos de um professor específico
export const getPublicTeacherDetails = unstable_cache(
  async (teacherId: string): Promise<TeacherDetailedProfile | null> => {
    try {
      console.log(
        `👨‍🏫 [PUBLIC-TEACHER-DETAILS] Loading details for teacher ${teacherId}`
      );

      const teacher = await prisma.teacher.findFirst({
        where: {
          userId: teacherId,
          isPublicProfile: true,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              city: true,
              state: true,
              image: true,
              createdAt: true,
            },
          },
          reviews: {
            where: {
              isPublic: true,
              isModerated: false,
            },
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!teacher) {
        console.log(
          `❌ [PUBLIC-TEACHER-DETAILS] Teacher ${teacherId} not found or not public`
        );
        return null;
      }

      // Calculate years of experience
      const yearsExperience = Math.floor(
        (Date.now() - teacher.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365)
      );

      // Calculate rating breakdown
      const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      teacher.reviews.forEach((review) => {
        ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
      });

      // Get monthly stats for last 6 months
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        const [newStudents, completedLessons, monthReviews] = await Promise.all(
          [
            prisma.teacherStudent.count({
              where: {
                teacherId: teacher.id,
                startDate: { gte: monthStart, lte: monthEnd },
              },
            }),
            prisma.lesson.count({
              where: {
                teacherId: teacher.id,
                status: 'COMPLETED',
                scheduledAt: { gte: monthStart, lte: monthEnd },
              },
            }),
            prisma.teacherReview.aggregate({
              where: {
                teacherId: teacher.id,
                createdAt: { gte: monthStart, lte: monthEnd },
              },
              _avg: { rating: true },
            }),
          ]
        );

        monthlyStats.push({
          month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
          year: monthStart.getFullYear(),
          newStudents,
          completedLessons,
          avgRating: monthReviews._avg.rating || 0,
        });
      }

      // Format detailed profile
      const detailedProfile: TeacherDetailedProfile = {
        id: teacher.user.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
        profileImage: teacher.profileImage || teacher.user.image || undefined,
        bio: teacher.bio || undefined,
        publicBio: teacher.publicBio || teacher.bio || undefined,
        fullBio:
          teacher.publicBio || teacher.bio || 'Biografia não disponível.',
        teachingPhilosophy: teacher.teachingMethod || undefined,
        specialties: teacher.specialties || [],
        instruments: teacher.instruments || [],
        experience: teacher.experience || undefined,
        education: teacher.education || undefined,
        achievements: teacher.achievements || undefined,
        website: teacher.website || undefined,
        socialMedia: teacher.socialMedia,
        highlightedWorks: teacher.highlightedWorks,
        teachingMethod: teacher.teachingMethod || undefined,
        ageGroups: teacher.ageGroups,
        skillLevels: teacher.skillLevels,

        // Contact info
        email: teacher.user.email || undefined,
        phone: teacher.user.phone || undefined,
        location:
          [teacher.user.city, teacher.user.state].filter(Boolean).join(', ') ||
          undefined,

        // Stats
        isVerified: teacher.isVerified,
        averageRating: teacher.averageRating || undefined,
        totalReviews: teacher.totalReviews,
        totalStudents: teacher.totalStudents,
        totalLessons: teacher.totalLessons,
        completionRate: teacher.completionRate || undefined,
        teachingSince: teacher.createdAt,
        yearsExperience: Math.max(1, yearsExperience),

        // Extended details
        studentTestimonials: teacher.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment || '',
          studentName: `${review.student.user.firstName?.charAt(0)}***`,
          relationshipDuration: review.relationshipDuration || undefined,
          lessonsCount: review.lessonsCount || undefined,
          wouldRecommend: review.wouldRecommend,
          teachingQuality: review.teachingQuality || undefined,
          communication: review.communication || undefined,
          punctuality: review.punctuality || undefined,
          patience: review.patience || undefined,
          createdAt: review.createdAt,
        })),

        monthlyStats,
        ratingBreakdown,

        // Contact preferences
        contactPreferences: {
          preferredMethod: teacher.user.phone ? 'whatsapp' : 'email',
          responseTime: '24 horas',
          acceptingStudents:
            teacher.status === 'ACTIVE' &&
            teacher.totalStudents < teacher.maxStudentsPerWeek,
          maxStudentsPerWeek: teacher.maxStudentsPerWeek,
          defaultLessonDuration: teacher.defaultLessonDuration,
        },

        // Recent reviews for preview
        recentReviews: teacher.reviews.slice(0, 3).map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment || undefined,
          studentName: `${review.student.user.firstName?.charAt(0)}***`,
          createdAt: review.createdAt,
          wouldRecommend: review.wouldRecommend,
        })),
      };

      console.log(
        `✅ [PUBLIC-TEACHER-DETAILS] Teacher details loaded successfully`
      );

      return detailedProfile;
    } catch (error) {
      console.error(
        '❌ [PUBLIC-TEACHER-DETAILS] Error loading teacher details:',
        error
      );
      return null;
    }
  },
  ['public-teacher-details-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['public-teacher-details'],
  }
);

// Cache invalidation
export async function revalidatePublicTeachersCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('public-teachers');
  revalidateTag('public-teachers-data');
  revalidateTag('public-teacher-details');
  revalidateTag('public-teacher-details-data');
}
