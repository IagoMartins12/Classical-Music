// app/requests/study-requests.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

export interface UserStudySettings {
  id: string;
  studyModeSettings?: {
    defaultMetronome: {
      bpm: number;
      sound: 'click' | 'beep' | 'wood';
      volume: number;
      timeSignature: string;
    };
    pdfSettings: {
      zoom: number;
      theme: 'light' | 'dark';
      layout: 'single' | 'spread';
      autoSave: boolean;
    };
    sessionSettings: {
      autoStart: boolean;
      reminderInterval: number; // minutos
      defaultFocus: string;
    };
  };
}

export interface ActiveStudySession {
  id: string;
  workId: string;
  scoreId?: string;
  duration: number;
  isActive: boolean;
  isPaused: boolean;
  startTime: string;
  metronomeSettings: any;
  studyNotes: string;
  practiceGoals: string[];
  sectionsWorked: string[];
}

export interface PdfAnnotation {
  id: string;
  type: string;
  content?: string;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  strokeWidth?: number;
  drawing?: any;
  measure?: number;
  beat?: number;
  voice?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreBookmark {
  id: string;
  title: string;
  description?: string;
  color: string;
  page: number;
  measure?: number;
  system?: number;
  x?: number;
  y?: number;
  sortOrder: number;
  createdAt: Date;
}

// Cache das configurações do usuário por 30 minutos
const getUserStudySettingsCache = unstable_cache(
  async (userId: string): Promise<UserStudySettings | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          studyModeSettings: true,
        },
      });

      if (!user) return null;

      // Configurações padrão se não existirem
      const defaultSettings = {
        defaultMetronome: {
          bpm: 120,
          sound: 'click' as const,
          volume: 0.5,
          timeSignature: '4/4',
        },
        pdfSettings: {
          zoom: 1.2,
          theme: 'light' as const,
          layout: 'single' as const,
          autoSave: true,
        },
        sessionSettings: {
          autoStart: false,
          reminderInterval: 30,
          defaultFocus: 'TECHNICAL',
        },
      };

      return {
        id: user.id,
        studyModeSettings:
          user.studyModeSettings &&
          typeof user.studyModeSettings === 'object' &&
          !Array.isArray(user.studyModeSettings)
            ? { ...defaultSettings, ...user.studyModeSettings }
            : defaultSettings,
      };
    } catch (error) {
      console.error('Erro ao buscar configurações de estudo:', error);
      return null;
    }
  },
  ['user-study-settings'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['user-study-settings'],
  }
);

// Buscar configurações do usuário
export const getUserStudySettings = async (userId: string) => {
  return getUserStudySettingsCache(userId);
};

// Buscar sessão ativa de estudo
export const getActiveStudySession = async (
  userId: string,
  workId: string
): Promise<ActiveStudySession | null> => {
  try {
    // Buscar sessão mais recente que ainda está ativa
    const session = await prisma.studySession.findFirst({
      where: {
        userId,
        workId,
        // Considerar ativa se foi criada nas últimas 24 horas
        date: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        workId: true,
        scoreId: true,
        durationMin: true,
        date: true,
        metronomeSettings: true,
        studyNotes: true,
        practiceGoals: true,
        sectionsWorked: true,
        notes: true,
      },
    });

    if (!session) return null;

    return {
      id: session.id,
      workId: session.workId,
      scoreId: session.scoreId || undefined,
      duration: session.durationMin * 60, // converter para segundos
      isActive: true,
      isPaused: false,
      startTime: session.date.toISOString(),
      metronomeSettings: session.metronomeSettings || {},
      studyNotes: session.studyNotes || session.notes || '',
      practiceGoals: session.practiceGoals || [],
      sectionsWorked: session.sectionsWorked || [],
    };
  } catch (error) {
    console.error('Erro ao buscar sessão ativa:', error);
    return null;
  }
};

// Buscar anotações PDF de uma partitura
export const getPdfAnnotations = async (
  userId: string,
  workId: string,
  scoreId: string
): Promise<PdfAnnotation[]> => {
  try {
    const annotations = await prisma.pdfAnnotation.findMany({
      where: {
        userId,
        workId,
        scoreId,
      },
      orderBy: [{ page: 'asc' }, { y: 'asc' }, { x: 'asc' }],
    });

    return annotations.map((annotation) => ({
      id: annotation.id,
      type: annotation.type,
      content: annotation.content || undefined,
      page: annotation.page,
      x: annotation.x,
      y: annotation.y,
      width: annotation.width || undefined,
      height: annotation.height || undefined,
      color: annotation.color || undefined,
      fontSize: annotation.fontSize || undefined,
      strokeWidth: annotation.strokeWidth || undefined,
      drawing: annotation.drawing || undefined,
      measure: annotation.measure || undefined,
      beat: annotation.beat || undefined,
      voice: annotation.voice || undefined,
      tags: annotation.tags,
      createdAt: annotation.createdAt,
      updatedAt: annotation.updatedAt,
    }));
  } catch (error) {
    console.error('Erro ao buscar anotações PDF:', error);
    return [];
  }
};

// Buscar bookmarks de uma partitura
export const getScoreBookmarks = async (
  userId: string,
  workId: string,
  scoreId: string
): Promise<ScoreBookmark[]> => {
  try {
    const bookmarks = await prisma.scoreBookmark.findMany({
      where: {
        userId,
        workId,
        scoreId,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return bookmarks.map((bookmark) => ({
      id: bookmark.id,
      title: bookmark.title,
      description: bookmark.description || undefined,
      color: bookmark.color,
      page: bookmark.page,
      measure: bookmark.measure || undefined,
      system: bookmark.system || undefined,
      x: bookmark.x || undefined,
      y: bookmark.y || undefined,
      sortOrder: bookmark.sortOrder,
      createdAt: bookmark.createdAt,
    }));
  } catch (error) {
    console.error('Erro ao buscar bookmarks:', error);
    return [];
  }
};

// Salvar configurações do usuário
export const saveUserStudySettings = async (
  userId: string,
  settings: UserStudySettings['studyModeSettings']
): Promise<boolean> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        studyModeSettings: settings as any,
      },
    });

    // Invalidar cache
    const { revalidateTag } = await import('next/cache');
    revalidateTag('user-study-settings');

    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return false;
  }
};

// Criar anotação PDF
export const createPdfAnnotation = async (
  userId: string,
  workId: string,
  scoreId: string,
  annotationData: Omit<PdfAnnotation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PdfAnnotation | null> => {
  try {
    const annotation = await prisma.pdfAnnotation.create({
      data: {
        userId,
        workId,
        scoreId,
        type: annotationData.type as any,
        content: annotationData.content,
        page: annotationData.page,
        x: annotationData.x,
        y: annotationData.y,
        width: annotationData.width,
        height: annotationData.height,
        color: annotationData.color,
        fontSize: annotationData.fontSize,
        strokeWidth: annotationData.strokeWidth,
        drawing: annotationData.drawing as any,
        measure: annotationData.measure,
        beat: annotationData.beat,
        voice: annotationData.voice,
        tags: annotationData.tags,
      },
    });

    return {
      id: annotation.id,
      type: annotation.type,
      content: annotation.content || undefined,
      page: annotation.page,
      x: annotation.x,
      y: annotation.y,
      width: annotation.width || undefined,
      height: annotation.height || undefined,
      color: annotation.color || undefined,
      fontSize: annotation.fontSize || undefined,
      strokeWidth: annotation.strokeWidth || undefined,
      drawing: annotation.drawing || undefined,
      measure: annotation.measure || undefined,
      beat: annotation.beat || undefined,
      voice: annotation.voice || undefined,
      tags: annotation.tags,
      createdAt: annotation.createdAt,
      updatedAt: annotation.updatedAt,
    };
  } catch (error) {
    console.error('Erro ao criar anotação:', error);
    return null;
  }
};

// Criar bookmark
export const createScoreBookmark = async (
  userId: string,
  workId: string,
  scoreId: string,
  bookmarkData: Omit<ScoreBookmark, 'id' | 'createdAt' | 'sortOrder'>
): Promise<ScoreBookmark | null> => {
  try {
    // Buscar próximo sortOrder
    const lastBookmark = await prisma.scoreBookmark.findFirst({
      where: { userId, workId, scoreId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = (lastBookmark?.sortOrder || 0) + 1;

    const bookmark = await prisma.scoreBookmark.create({
      data: {
        userId,
        workId,
        scoreId,
        title: bookmarkData.title,
        description: bookmarkData.description,
        color: bookmarkData.color,
        page: bookmarkData.page,
        measure: bookmarkData.measure,
        system: bookmarkData.system,
        x: bookmarkData.x,
        y: bookmarkData.y,
        sortOrder,
      },
    });

    return {
      id: bookmark.id,
      title: bookmark.title,
      description: bookmark.description || undefined,
      color: bookmark.color,
      page: bookmark.page,
      measure: bookmark.measure || undefined,
      system: bookmark.system || undefined,
      x: bookmark.x || undefined,
      y: bookmark.y || undefined,
      sortOrder: bookmark.sortOrder,
      createdAt: bookmark.createdAt,
    };
  } catch (error) {
    console.error('Erro ao criar bookmark:', error);
    return null;
  }
};

// Atualizar sessão de estudo
export const updateStudySession = async (
  sessionId: string,
  updates: Partial<{
    durationMin: number;
    metronomeSettings: any;
    studyNotes: string;
    practiceGoals: string[];
    sectionsWorked: string[];
    pagesViewed: number[];
    annotationsCreated: number;
    bookmarksCreated: number;
    pdfZoomChanges: number;
    pdfSettings: any;
    windowLayout: any;
  }>
): Promise<boolean> => {
  try {
    await prisma.studySession.update({
      where: { id: sessionId },
      data: updates,
    });

    return true;
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return false;
  }
};

// Função para invalidar caches relacionados ao estudo
export async function revalidateStudyCache(userId?: string, workId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('user-study-settings');
  if (userId) {
    revalidateTag(`user-study-sessions-${userId}`);
  }
  if (workId) {
    revalidateTag(`work-${workId}`);
  }
}
