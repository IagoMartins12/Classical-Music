// app/requests/student-requests.ts - Centralized API requests for student functionality

import { unstable_cache } from 'next/cache';

// ====================================
// TYPES AND INTERFACES
// ====================================

export interface StudentDashboard {
  stats: {
    totalLessons: number;
    completedLessons: number;
    upcomingLessons: number;
    missedLessons: number;
    totalStudyTime: number; // em minutos
    averageAttendance: number;
    currentStreak: number;
    longestStreak: number;
  };
  upcomingLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    teacher: {
      id: string;
      name: string;
      image?: string;
    };
    location?: string;
    objectives: string[];
    publicNotes?: string;
    homework?: string;
    isToday: boolean;
    isNext: boolean;
  }>;
  todayLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    teacher: {
      id: string;
      name: string;
      image?: string;
    };
    location?: string;
    objectives: string[];
    publicNotes?: string;
    homework?: string;
  }>;
  recentLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    status: string;
    teacher: {
      name: string;
      image?: string;
    };
    lessonSummary?: string;
    publicNotes?: string;
    homework?: string;
    nextLessonPrep?: string;
    skillsWorked: string[];
    improvements: string[];
    challenges: string[];
    studentProgress?: any;
  }>;
  studyProgress: {
    currentWorks: Array<{
      workId: string;
      title: string;
      composer: string;
      addedAt: Date;
      difficulty?: string | null;
      selectedScore?: {
        title: string;
        type: string;
      };
    }>;
    learnedWorks: Array<{
      workId: string;
      title: string;
      composer: string;
      learnedAt: Date;
      mastery: number;
      wouldRecommend: boolean;
    }>;
    recentAnnotations: Array<{
      id: string;
      workTitle: string;
      title: string;
      category: string;
      createdAt: Date;
    }>;
  };
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherImage?: string;
    relationshipStart: Date;
    nextLessonAt?: Date;
    totalLessonsWithTeacher: number;
    specialties: string[];
  }>;
}

export interface StudentProfile {
  id: string;
  userId: string;
  level: string;
  mainInstrument?: string;
  musicalGoals?: string;
  preferredGenres: string[];
  musicalBackground?: string;
  allowPublicProgress: boolean;
  allowProgressShare: boolean;
  profileVisibility: string;
  practiceTime?: number;
  practiceSchedule?: any;
  learningPace?: string;
  specialNeeds?: string;
  status: string;
  enrollmentDate: Date;
  lastLessonAt?: Date;
  lastActiveAt?: Date;
  preferredContact: string;
  reminderPreferences?: any;
  totalLessonsAttended: number;
  totalAssignments: number;
  completedAssignments: number;
  currentStreak: number;
  longestStreak: number;
  progressScore?: number;
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    image?: string;
    experienceLevel: string | null;
  };
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherImage?: string;
    isActive: boolean;
    startDate: Date;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    nextLessonAt?: Date;
    totalLessons: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'lesson' | 'assignment_due' | 'practice_reminder';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  teacher: {
    id: string;
    name: string;
    image?: string;
  };
  location?: string;
  description?: string;
  objectives?: string[];
  homework?: string;
  publicNotes?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  details?: {
    workScoreIds: string[];
    topics: string[];
    techniques: string[];
    lessonSummary?: string;
    skillsWorked: string[];
    improvements: string[];
    challenges: string[];
    studentProgress?: any;
    nextLessonPrep?: string;
    canProvideFeedback: boolean;
    studentFeedback?: string;
  };
}

// ====================================
// DASHBOARD REQUESTS
// ====================================

export const getStudentDashboard =
  async (): Promise<StudentDashboard | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/student/dashboard`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          next: {
            revalidate: 300, // 5 minutes
            tags: ['student-dashboard'],
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Dashboard API returned error');
      }

      return data.dashboard;
    } catch (error) {
      console.error('❌ Error fetching student dashboard:', error);
      return null;
    }
  };

// Cached version for server-side rendering
export const getCachedStudentDashboard = unstable_cache(
  getStudentDashboard,
  ['student-dashboard'],
  {
    revalidate: 300, // 5 minutes
    tags: ['student-dashboard'],
  }
);

// ====================================
// PROFILE REQUESTS
// ====================================

export const getStudentProfile = async (): Promise<{
  profile: StudentProfile;
  isNew: boolean;
} | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/profile`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 180, // 3 minutes
          tags: ['student-profile'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Profile API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Profile API returned error');
    }

    return {
      profile: data.profile,
      isNew: data.isNew || false,
    };
  } catch (error) {
    console.error('❌ Error fetching student profile:', error);
    return null;
  }
};

export const updateStudentProfile = async (updates: {
  userData?: any;
  studentData?: any;
}): Promise<{ success: boolean; profile?: any; error?: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, profile: data.profile };
  } catch (error) {
    console.error('❌ Error updating student profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const updateStudentProfileField = async (
  field: string,
  value: any,
  action: 'set' | 'add' | 'remove' = 'set'
): Promise<{ success: boolean; profile?: any; error?: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/profile`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field, value, action }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, profile: data.profile };
  } catch (error) {
    console.error('❌ Error updating student profile field:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const initializeStudentProfile = async (profileData: {
  level?: string;
  mainInstrument?: string;
  musicalGoals?: string;
  preferredGenres?: string[];
  practiceTime?: number;
  learningPace?: string;
  allowPublicProgress?: boolean;
  preferredContact?: string;
}): Promise<{ success: boolean; profile?: any; error?: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/profile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, profile: data.profile };
  } catch (error) {
    console.error('❌ Error initializing student profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ====================================
// CALENDAR REQUESTS
// ====================================

export const getStudentCalendar = async (
  startDate: Date,
  endDate: Date,
  options: {
    view?: string;
    includeStats?: boolean;
    teacherId?: string;
  } = {}
): Promise<{
  events: StudentCalendarEvent[];
  stats?: any;
  period: {
    start: Date;
    end: Date;
    view: string;
  };
  metadata: any;
} | null> => {
  try {
    const params = new URLSearchParams({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      view: options.view || 'month',
      stats: (options.includeStats || false).toString(),
    });

    if (options.teacherId) {
      params.append('teacherId', options.teacherId);
    }

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/calendar?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 300, // 5 minutes
          tags: ['student-calendar'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Calendar API returned error');
    }

    return {
      events: data.events,
      stats: data.stats,
      period: data.period,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error('❌ Error fetching student calendar:', error);
    return null;
  }
};

export const addLessonFeedback = async (
  lessonId: string,
  feedback: string,
  rating?: number
): Promise<{ success: boolean; lesson?: any; error?: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/calendar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId, feedback, rating }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, lesson: data.lesson };
  } catch (error) {
    console.error('❌ Error adding lesson feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ====================================
// LESSONS REQUESTS
// ====================================

export const getStudentLessons = async (
  filters: {
    teacherId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  lessons: any[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
} | null> => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/lessons?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 180, // 3 minutes
          tags: ['student-lessons'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lessons API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Lessons API returned error');
    }

    return {
      lessons: data.lessons,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error('❌ Error fetching student lessons:', error);
    return null;
  }
};

export const getStudentLesson = async (
  lessonId: string
): Promise<any | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/lessons/${lessonId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 180, // 3 minutes
          tags: ['student-lesson', `lesson-${lessonId}`],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lesson API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Lesson API returned error');
    }

    return data.lesson;
  } catch (error) {
    console.error('❌ Error fetching student lesson:', error);
    return null;
  }
};

export const updateStudentLessonFeedback = async (
  lessonId: string,
  feedback: string,
  rating?: number
): Promise<{ success: boolean; lesson?: any; error?: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/lessons/${lessonId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentFeedback: feedback,
          studentRating: rating,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, lesson: data.lesson };
  } catch (error) {
    console.error('❌ Error updating lesson feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ====================================
// ASSIGNMENTS REQUESTS
// ====================================

export const getStudentAssignments = async (
  filters: {
    teacherId?: string;
    status?: string;
    lessonId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  assignments: any[];
  stats: any;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
} | null> => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/assignments?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 180, // 3 minutes
          tags: ['student-assignments'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Assignments API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Assignments API returned error');
    }

    return {
      assignments: data.assignments,
      stats: data.stats,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error('❌ Error fetching student assignments:', error);
    return null;
  }
};

export const updateStudentAssignment = async (
  assignmentId: string,
  updates: any
): Promise<{ success: boolean; assignment?: any; error?: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/assignments`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          ...updates,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, assignment: data.assignment };
  } catch (error) {
    console.error('❌ Error updating student assignment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ====================================
// LESSON WORKS REQUESTS
// ====================================

export const getStudentLessonWorks = async (
  lessonId?: string,
  options: {
    includeProgress?: boolean;
    teacherId?: string;
    status?: string;
    limit?: number;
  } = {}
): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (lessonId) {
      params.append('lessonId', lessonId);
    }

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/lessons/works?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 300, // 5 minutes
          tags: ['student-lesson-works'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lesson Works API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Lesson Works API returned error');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching student lesson works:', error);
    return null;
  }
};

// ====================================
// CACHE INVALIDATION
// ====================================

export async function revalidateStudentCache() {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('student-dashboard');
  revalidateTag('student-profile');
  revalidateTag('student-calendar');
  revalidateTag('student-lessons');
  revalidateTag('student-assignments');
  revalidateTag('student-lesson-works');
}
