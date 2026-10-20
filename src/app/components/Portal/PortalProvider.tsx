'use client';

// components/Portal/PortalProvider.tsx — a pilha de folhas do portal
//
// Toda janela do portal é a `Sheet` do sistema: sobe de baixo no telefone e
// fica no centro no computador. Elas se empilham — a ficha do aluno abre por
// cima da aula, e fechar fecha só a de cima.
//
// Cada folha é carregada quando abre (`next/dynamic`): a primeira tela não
// paga pelo código das vinte folhas que talvez nunca abram.

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import type { Role } from '@/app/requests/portal/api';

export type SheetRequest =
  | { type: 'lesson'; id: string }
  | { type: 'close'; id: string }
  | { type: 'schedule'; studentId?: string; start?: string; duration?: number }
  | { type: 'reschedule'; id: string }
  | { type: 'availability' }
  | { type: 'request'; teacherId?: string; start?: string }
  | { type: 'practice' }
  | { type: 'student'; studentId: string }
  | { type: 'delivery'; id: string }
  | { type: 'lesson-request'; id: string }
  | { type: 'notifications' }
  | { type: 'upgrade' }
  | { type: 'feedback'; id: string }
  | { type: 'calendar-sync' }
  | { type: 'announce'; studentIds?: string[] }
  | { type: 'assignment'; id: string }
  | { type: 'new-assignment'; studentId?: string; lessonId?: string }
  | { type: 'invite' }
  | { type: 'report'; id: string }
  | { type: 'new-report'; studentId?: string }
  | { type: 'onboarding' }
  | { type: 'edit-lesson'; id: string };

export type SheetType = SheetRequest['type'];

export interface SheetProps<T extends SheetRequest = SheetRequest> {
  request: T;
  role: Role;
  onClose: () => void;
  /** Fecha todas as folhas — depois de salvar, a pessoa volta à tela. */
  closeAll: () => void;
  open: (request: SheetRequest) => void;
}

const lazy = (
  load: () => Promise<{ default: ComponentType<SheetProps<never>> }>
) => dynamic(load, { ssr: false }) as ComponentType<SheetProps>;

/** Cada tipo de folha e o arquivo que a desenha. */
const SHEETS: Record<SheetType, ComponentType<SheetProps>> = {
  lesson: lazy(() => import('./sheets/LessonSheet')),
  close: lazy(() => import('./sheets/CloseLessonSheet')),
  schedule: lazy(() => import('./sheets/ScheduleSheet')),
  reschedule: lazy(() => import('./sheets/ScheduleSheet')),
  availability: lazy(() => import('./sheets/AvailabilitySheet')),
  request: lazy(() => import('./sheets/RequestLessonSheet')),
  practice: lazy(() => import('./sheets/PracticeSheet')),
  student: lazy(() => import('./sheets/StudentSheet')),
  delivery: lazy(() => import('./sheets/DeliverySheet')),
  'lesson-request': lazy(() => import('./sheets/LessonRequestSheet')),
  notifications: lazy(() => import('./sheets/NotificationsSheet')),
  upgrade: lazy(() => import('./sheets/UpgradeSheet')),
  feedback: lazy(() => import('./sheets/FeedbackSheet')),
  'calendar-sync': lazy(() => import('./sheets/CalendarSyncSheet')),
  announce: lazy(() => import('./sheets/AnnounceSheet')),
  assignment: lazy(() => import('./sheets/AssignmentSheet')),
  'new-assignment': lazy(() => import('./sheets/NewAssignmentSheet')),
  invite: lazy(() => import('./sheets/InviteSheet')),
  report: lazy(() => import('./sheets/ReportSheet')),
  'new-report': lazy(() => import('./sheets/NewReportSheet')),
  onboarding: lazy(() => import('./sheets/OnboardingSheet')),
  'edit-lesson': lazy(() => import('./sheets/EditLessonSheet')),
};

interface PortalContext {
  role: Role;
  open: (request: SheetRequest) => void;
  closeAll: () => void;
}

const Context = createContext<PortalContext | null>(null);

export function usePortal() {
  const value = useContext(Context);
  if (!value) throw new Error('usePortal fora do PortalProvider');
  return value;
}

export function PortalProvider({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const [stack, setStack] = useState<SheetRequest[]>([]);

  const open = useCallback(
    (request: SheetRequest) => setStack((s) => [...s, request]),
    []
  );
  const closeAll = useCallback(() => setStack([]), []);
  const closeTop = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  const value = useMemo(
    () => ({ role, open, closeAll }),
    [role, open, closeAll]
  );

  return (
    <Context.Provider value={value}>
      {children}
      {stack.map((request, i) => {
        const Sheet = SHEETS[request.type];
        return (
          <Sheet
            key={`${i}-${request.type}`}
            request={request}
            role={role}
            onClose={closeTop}
            closeAll={closeAll}
            open={open}
          />
        );
      })}
    </Context.Provider>
  );
}
