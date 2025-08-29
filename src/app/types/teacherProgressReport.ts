// app/types/teacherProgressReport.ts - Types para relatório detalhado

export interface ProgressOverview {
  totalLessons: number;
  completedLessons: number;
  totalStudyHours: number;
  attendanceRate: number;
  completionRate: number;
  piecesStudied: number;
  favoritePieces: number;
  avgLessonRating: number;
  currentStreak: number;
  longestStreak: number;
  totalAssignments: number;
  completedAssignments: number;
  avgCompletionTime: number; // em horas
}

export interface ProgressEvolution {
  monthly: Array<{
    month: string;
    year: number;
    lessonsCompleted: number;
    studyHours: number;
    piecesLearned: number;
    assignmentsCompleted: number;
    attendanceRate: number;
    engagementScore: number;
    avgRating: number;
  }>;
  weekly: Array<{
    week: string;
    year: number;
    consistency: number;
    practiceTime: number;
    lessonsAttended: number;
    homeworkCompleted: number;
  }>;
  beforeAfter: {
    beforeClasses: {
      totalWorks: number;
      favoriteWorks: number;
      annotations: number;
      averageRating: number;
      practiceTime: number;
    };
    afterClasses: {
      totalWorks: number;
      favoriteWorks: number;
      annotations: number;
      averageRating: number;
      practiceTime: number;
      improvement: {
        works: number;
        favorites: number;
        annotations: number;
        rating: number;
        practice: number;
      };
    };
  };
}

export interface MusicalPreferences {
  favoriteComposers: Array<{
    name: string;
    epoch: string;
    worksCount: number;
    studiedCount: number;
    favoriteCount: number;
    percentage: number;
  }>;
  favoritePeriods: Array<{
    name: string;
    worksCount: number;
    studiedCount: number;
    favoriteCount: number;
    percentage: number;
  }>;
  studiedVsFavorites: Array<{
    category: string;
    studied: number;
    favorited: number;
    learnedButNotFavorited: number;
    favoritedButNotStudied: number;
  }>;
  difficultyProgression: Array<{
    period: string;
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
    averageDifficulty: number;
  }>;
}

export interface EngagementPatterns {
  bestStudyTimes: Array<{
    hour: number;
    successRate: number;
    lessonsCount: number;
    avgRating: number;
    punctualityRate: number;
  }>;
  productiveDays: Array<{
    dayOfWeek: string;
    attendanceRate: number;
    completionRate: number;
    avgEngagement: number;
    lessonsCount: number;
  }>;
  attendancePatterns: Array<{
    month: string;
    attendanceRate: number;
    punctualityRate: number;
    cancellationRate: number;
    noShowRate: number;
  }>;
  homeworkCompliance: {
    overallRate: number;
    byDifficulty: Array<{
      difficulty: string;
      completionRate: number;
      avgTime: number;
      onTimeRate: number;
    }>;
    byType: Array<{
      type: string;
      completionRate: number;
      avgScore: number;
      preferenceScore: number;
    }>;
  };
}

export interface PedagogicalInsights {
  learningStyle: {
    primary: string;
    characteristics: string[];
    strengths: string[];
    preferences: string[];
  };
  skillsAssessment: {
    technique: number;
    interpretation: number;
    rhythm: number;
    pitch: number;
    expression: number;
    sightReading: number;
  };
  strongAreas: string[];
  improvementAreas: string[];
  recommendedFocus: string[];
  nextSteps: string[];
  teachingNotes: string[];
}

export interface AssignmentsAnalysis {
  byType: Array<{
    type: string;
    total: number;
    completed: number;
    avgCompletionTime: number;
    avgScore: number;
    difficultyRating: number;
  }>;
  completionTrends: Array<{
    month: string;
    submitted: number;
    completed: number;
    overdue: number;
    avgQuality: number;
  }>;
  difficultyVsPerformance: Array<{
    difficulty: string;
    assigned: number;
    completed: number;
    avgScore: number;
    avgTime: number;
  }>;
  timePatterns: Array<{
    assignmentType: string;
    estimatedTime: number;
    actualTime: number;
    efficiency: number;
  }>;
}

export interface RepertoireAnalysis {
  composersStudied: Array<{
    name: string;
    period: string;
    worksCount: number;
    completionRate: number;
    avgDifficulty: number;
    studyTime: number;
  }>;
  periodsDistribution: Array<{
    period: string;
    count: number;
    percentage: number;
    avgDifficulty: number;
    favoriteRate: number;
  }>;
  genrePreferences: Array<{
    genre: string;
    studiedCount: number;
    completedCount: number;
    favoriteRate: number;
    engagementScore: number;
  }>;
  complexityEvolution: Array<{
    timeRange: string;
    avgComplexity: number;
    completionRate: number;
    satisfactionRate: number;
  }>;
}

export interface AttendanceDetailed {
  absenceReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  makeupLessons: {
    requested: number;
    scheduled: number;
    completed: number;
    efficiency: number;
  };
  improvementTrend: Array<{
    month: string;
    attendanceRate: number;
    punctualityRate: number;
    improvement: number;
  }>;
  timeAnalysis: {
    bestAttendanceTimes: string[];
    worstAttendanceTimes: string[];
    seasonalPatterns: Array<{
      season: string;
      attendanceRate: number;
    }>;
  };
}

export interface Comparisons {
  periodComparison: {
    current: ProgressOverview;
    previous: ProgressOverview;
    improvement: {
      lessons: number;
      attendance: number;
      completion: number;
      engagement: number;
    };
  };
  levelPeers: {
    studentLevel: string;
    comparison: {
      lessons: { student: number; average: number; percentile: number };
      attendance: { student: number; average: number; percentile: number };
      assignments: { student: number; average: number; percentile: number };
      engagement: { student: number; average: number; percentile: number };
    };
  };
  progressVelocity: {
    current: number;
    trend: 'accelerating' | 'stable' | 'decelerating';
    projectedMilestones: Array<{
      milestone: string;
      estimatedDate: Date;
      confidence: number;
    }>;
  };
}

export interface AchievementsMilestones {
  learningMilestones: Array<{
    id: string;
    title: string;
    description: string;
    achievedAt: Date;
    category: 'lessons' | 'repertoire' | 'consistency' | 'skills';
    significance: 'major' | 'minor' | 'exceptional';
  }>;
  consistencyAwards: Array<{
    type: 'streak' | 'attendance' | 'punctuality' | 'homework';
    value: number;
    achievedAt: Date;
    description: string;
  }>;
  skillBadges: Array<{
    skill: string;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    earnedAt: Date;
    criteria: string;
  }>;
  progressCertificates: Array<{
    title: string;
    period: string;
    achievements: string[];
    signedAt: Date;
  }>;
}

export interface PedagogicalRecommendations {
  studyPlanAdjustments: Array<{
    area: string;
    currentApproach: string;
    recommendedApproach: string;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  difficultyRecommendations: {
    currentLevel: string;
    nextLevel: string;
    readinessScore: number;
    recommendedPieces: Array<{
      title: string;
      composer: string;
      difficulty: string;
      reasoning: string;
    }>;
  };
  repertoireSuggestions: Array<{
    composer: string;
    work: string;
    difficulty: string;
    estimatedTime: string;
    pedagogicalValue: string;
    studentAppeal: number;
  }>;
  techniqueFocus: Array<{
    technique: string;
    currentLevel: number;
    targetLevel: number;
    exercises: string[];
    timeframe: string;
  }>;
  practiceSchedule: {
    recommendedFrequency: number;
    sessionDuration: number;
    focusAreas: string[];
    breakdownSuggestion: Array<{
      activity: string;
      minutes: number;
      frequency: string;
    }>;
  };
}

export interface TeacherProgressReportResponse {
  studentInfo: {
    id: string;
    name: string;
    image?: string;
    level: string;
    startDate: Date;
    relationshipDuration: string;
  };
  teacherInfo: {
    id: string;
    name: string;
    specialties: string[];
    experience?: string;
  };
  reportMetadata: {
    generatedAt: Date;
    periodStart: Date;
    periodEnd: Date;
    periodLabel: string;
    dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
    analysisDepth: 'complete' | 'partial' | 'basic';
  };
  overview: ProgressOverview;
  evolution: ProgressEvolution;
  preferences: MusicalPreferences;
  engagement: EngagementPatterns;
  insights: PedagogicalInsights;
  assignments: AssignmentsAnalysis;
  repertoire: RepertoireAnalysis;
  attendance: AttendanceDetailed;
  comparisons: Comparisons;
  achievements: AchievementsMilestones;
  recommendations: PedagogicalRecommendations;
}

export type PeriodOption =
  | '1month'
  | '3months'
  | '6months'
  | '1year'
  | 'all'
  | 'custom';

export interface PeriodFilter {
  type: PeriodOption;
  startDate?: Date;
  endDate?: Date;
  label: string;
}
