// types/sorting.ts - Tipos para funcionalidades de ordenação

export type AssignmentSortOption =
  | 'due_date_asc'
  | 'due_date_desc'
  | 'created_asc'
  | 'created_desc'
  | 'status'
  | 'priority';

export type LessonSortOption =
  | 'scheduled_asc'
  | 'scheduled_desc'
  | 'created_asc'
  | 'created_desc'
  | 'status'
  | 'teacher';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

export const ASSIGNMENT_SORT_OPTIONS: Record<AssignmentSortOption, SortConfig> =
  {
    due_date_asc: {
      field: 'dueDate',
      direction: 'asc',
      label: 'Prazo (mais próximo)',
    },
    due_date_desc: {
      field: 'dueDate',
      direction: 'desc',
      label: 'Prazo (mais distante)',
    },
    created_desc: {
      field: 'createdAt',
      direction: 'desc',
      label: 'Mais recente',
    },
    created_asc: {
      field: 'createdAt',
      direction: 'asc',
      label: 'Mais antiga',
    },
    status: {
      field: 'status',
      direction: 'asc',
      label: 'Por status',
    },
    priority: {
      field: 'priority',
      direction: 'asc',
      label: 'Por prioridade',
    },
  };

export const LESSON_SORT_OPTIONS: Record<LessonSortOption, SortConfig> = {
  scheduled_asc: {
    field: 'scheduledAt',
    direction: 'asc',
    label: 'Agendamento (próximas)',
  },
  scheduled_desc: {
    field: 'scheduledAt',
    direction: 'desc',
    label: 'Agendamento (distantes)',
  },
  created_desc: {
    field: 'createdAt',
    direction: 'desc',
    label: 'Mais recente',
  },
  created_asc: {
    field: 'createdAt',
    direction: 'asc',
    label: 'Mais antiga',
  },
  status: {
    field: 'status',
    direction: 'asc',
    label: 'Por status',
  },
  teacher: {
    field: 'teacher.name',
    direction: 'asc',
    label: 'Por professor',
  },
};

// Utility functions para ordenação
export const sortAssignments = (
  assignments: any[],
  sortBy: AssignmentSortOption
): any[] => {
  return [...assignments].sort((a, b) => {
    switch (sortBy) {
      case 'due_date_asc':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

      case 'due_date_desc':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();

      case 'created_asc':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      case 'created_desc':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case 'status':
        const statusOrder = { PENDING: 1, IN_PROGRESS: 2, COMPLETED: 3 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 4;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 4;
        if (aOrder === bOrder) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return aOrder - bOrder;

      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
        if (aPriority === bPriority) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return aPriority - bPriority;

      default:
        // Default: overdue first, then by due date, then by created date
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
};

export const sortLessons = (
  lessons: any[],
  sortBy: LessonSortOption
): any[] => {
  return [...lessons].sort((a, b) => {
    switch (sortBy) {
      case 'scheduled_asc':
        return (
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );

      case 'scheduled_desc':
        return (
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        );

      case 'created_asc':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      case 'created_desc':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case 'status':
        const statusOrder = { SCHEDULED: 1, COMPLETED: 2, CANCELLED: 3 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 4;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 4;
        if (aOrder === bOrder) {
          return (
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
          );
        }
        return aOrder - bOrder;

      case 'teacher':
        const teacherCompare = a.teacher.name.localeCompare(b.teacher.name);
        if (teacherCompare === 0) {
          return (
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
          );
        }
        return teacherCompare;

      default:
        return (
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
    }
  });
};
