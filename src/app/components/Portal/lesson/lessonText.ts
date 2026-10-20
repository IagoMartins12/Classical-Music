// components/Portal/lesson/lessonText.ts — como uma aula se escreve
import type { Lesson } from '@/app/requests/portal/api';
import { nameOf } from '@/app/requests/portal/api';
import { dayOf, longDate, timeRange } from '../format';

export function lessonTitle(
  lesson: Pick<Lesson, 'title' | 'scheduledAt' | 'duration' | 'location'>
) {
  const place = lesson.location ? ` · ${lesson.location}` : '';
  return {
    title: lesson.title,
    subtitle:
      `${longDate(dayOf(lesson.scheduledAt))} · ${timeRange(lesson.scheduledAt, lesson.duration)}${place}`.replace(
        /^./,
        (c) => c.toUpperCase()
      ),
  };
}

/** A outra pessoa da aula, do ponto de vista de quem lê. */
export const counterpartOf = (
  lesson: Pick<Lesson, 'teacher' | 'student'>,
  role: 'teacher' | 'student'
) =>
  role === 'teacher'
    ? { ...lesson.student, name: nameOf(lesson.student) }
    : { ...lesson.teacher, name: nameOf(lesson.teacher) };

const RECURRENCE: Record<string, string> = {
  WEEKLY: 'Toda semana',
  BIWEEKLY: 'A cada duas semanas',
  MONTHLY: 'Todo mês',
};

export const recurrenceLabel = (
  lesson: Pick<Lesson, 'isRecurring' | 'recurrenceType'>
) =>
  lesson.isRecurring ? (RECURRENCE[lesson.recurrenceType] ?? 'Em série') : null;
