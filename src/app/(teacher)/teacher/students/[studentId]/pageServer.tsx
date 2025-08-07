// app/teacher/students/[studentId]/pageServer.tsx - Server Component para Detalhes do Aluno

import { notFound } from 'next/navigation';
import TeacherStudentDetailPageClient from './pageClient';
import { getTeacherStudentDetailData } from '@/app/requests/teacher-request';

export interface StudentDetailData {
  student: {
    id: string;
    name: string;
    email: string | null;
    image?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    experienceLevel?: string | null;
    createdAt: Date;
  };
  studentProfile: {
    id: string;
    level: string;
    mainInstrument?: string | null;
    musicalGoals?: string | null;
    practiceTime?: number | null;
    status: string;
    createdAt: Date;
  };
  relationship: {
    relationshipId: string;
    isActive: boolean;
    startDate: Date;
    endDate?: Date | null;
    pausedAt?: Date | null;
    pauseReason?: string | null;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    preferredDays?: string[];
    preferredTimes?: string[];
    learningPlan?: string | null;
    currentFocus?: string[];
    teacherNotes?: string | null;
  };
  stats: {
    totalLessons: number;
    completedLessons: number;
    scheduledLessons: number;
    cancelledLessons: number;
    completionRate: number;
    totalStudyTime: number; // em minutos
    averageLessonRating: number;
    streakDays: number;
    lastLessonDate?: Date;
    nextLessonDate?: Date;
  };
  recentLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    status: string;
    objectives: string[];
    topics: string[];
    homework?: string | null;
    studentProgress?: any;
    teacherNotes?: string | null;
    studentFeedback?: string | null;
  }>;
  upcomingLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    objectives: string[];
    location?: string | null;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    description: string;
    dueDate?: Date | null;
    status: string;
    isCompleted: boolean;
    progress: number;
    type: string;
    priority: string;
  }>;
}

export default async function TeacherStudentDetailPageServer({
  studentId,
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: {
  studentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}) {
  console.log(
    `👨‍🎓 [TEACHER-STUDENT-DETAIL-PAGE-SERVER] Loading student ${studentId} for teacher ${userId}`
  );

  try {
    // 🚀 Buscar dados detalhados do aluno direto do banco
    const studentData = await getTeacherStudentDetailData(userId, studentId);

    if (!studentData) {
      console.log(
        `❌ [TEACHER-STUDENT-DETAIL-PAGE-SERVER] Student not found or no access`
      );
      return;
    }

    console.log(
      `✅ [TEACHER-STUDENT-DETAIL-PAGE-SERVER] Data loaded successfully`
    );

    return (
      <TeacherStudentDetailPageClient
        studentData={studentData}
        teacherProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
      />
    );
  } catch (error) {
    console.error(
      '❌ [TEACHER-STUDENT-DETAIL-PAGE-SERVER] Critical error:',
      error
    );
    return notFound();
  }
}
