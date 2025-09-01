// app/teacher/lessons/create/pageServer.tsx - Server Component para Criar Nova Aula

import { getTeacherStudentsData } from '@/app/requests/teacher-request';
import CreateLessonPageClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

export interface CreateLessonData {
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
    relationship: {
      maxLessonsPerWeek: number;
      lessonDuration: number;
      preferredDays?: string[];
      preferredTimes?: string[];
    };
  }>;
  defaultSettings: {
    defaultDuration: number;
    timezone: string;
    availableDays: string[];
    availableTimes: string[];
  };
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

export default async function CreateLessonPageServer({
  userId,
}: {
  userId: string;
}) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'teacher/lessonsCreate',
  ]);

  try {
    // Buscar alunos ativos do professor
    const studentsData = await getTeacherStudentsData(userId, 'active', 100, 0);

    if (!studentsData || !studentsData.success) {
      throw new Error('Falha ao carregar dados dos alunos');
    }

    // Preparar lista de alunos com configurações
    const students = studentsData.students.map((studentRel) => ({
      id: studentRel.student.id,
      name: studentRel.student.name,
      image: studentRel.student.image,
      level: studentRel.student.level,
      isActive: studentRel.relationship.isActive,
      relationship: {
        maxLessonsPerWeek: studentRel.relationship.maxLessonsPerWeek,
        lessonDuration: studentRel.relationship.lessonDuration,
        preferredDays: studentRel.relationship.preferredDays,
        preferredTimes: studentRel.relationship.preferredTimes,
      },
    }));

    const createLessonData: CreateLessonData = {
      students,
      defaultSettings: {
        defaultDuration: 60,
        timezone: 'America/Sao_Paulo',
        availableDays: [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ],
        availableTimes: [
          '08:00',
          '09:00',
          '10:00',
          '11:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
          '19:00',
          '20:00',
        ],
      },
    };

    console.log(
      `✅ [CREATE-LESSON-PAGE-SERVER] Data loaded successfully - ${students.length} students`
    );

    return (
      <TranslationProvider language={language} translations={translations}>
        <CreateLessonPageClient initialData={createLessonData} />
      </TranslationProvider>
    );
  } catch (error) {
    // Fallback com dados vazios
    return (
      <TranslationProvider language={language} translations={translations}>
        <CreateLessonPageClient
          initialData={{
            students: [],
            defaultSettings: {
              defaultDuration: 60,
              timezone: 'America/Sao_Paulo',
              availableDays: [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
              ],
              availableTimes: ['09:00', '14:00', '16:00', '18:00'],
            },
          }}
          errorMessage="Erro ao carregar dados. Tente recarregar a página."
        />
      </TranslationProvider>
    );
  }
}
