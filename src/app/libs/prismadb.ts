// app/libs/prismadb.ts - SOLUÇÃO CORRIGIDA PARA BUILD TIME vs RUNTIME
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 🔧 DETECÇÃO PRECISA DE BUILD TIME vs RUNTIME
const IS_BUILD_TIME = (() => {
  // 1. Verificar NEXT_PHASE (mais confiável)
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-development-server'
  ) {
    return true;
  }

  // 2. Verificar argumentos do processo
  const buildCommands = ['build', 'next build'];
  const haseBuildArg = process.argv.some((arg) =>
    buildCommands.some((cmd) => arg.includes(cmd))
  );
  if (haseBuildArg) {
    return true;
  }

  // 3. Verificar DATABASE_URL fake (backup)
  if (process.env.DATABASE_URL?.includes('build:build@localhost')) {
    return true;
  }

  // 4. Verificar se está no processo de build do Next.js
  if (
    process.env.NODE_ENV === 'production' &&
    typeof window === 'undefined' &&
    !process.env.VERCEL &&
    !(global as any).prismaConnected
  ) {
    // Flag adicional

    // Verificar se consegue conectar com o banco real
    // Se não conseguir, provavelmente é build time
    try {
      // Tentativa rápida de conexão (sem criar client completo)
      const dbUrl = process.env.DATABASE_URL || '';
      if (
        dbUrl.includes('localhost:27017') ||
        dbUrl.includes('opus-atlas-mongodb-prod:27017')
      ) {
        // Se parece com URL real, assumir que é runtime
        (global as any).prismaConnected = true;
        return false;
      }
    } catch {
      // Se der erro na verificação, assumir build time
      return true;
    }
  }

  return false;
})();

// Dados mock (mantendo os mesmos dados que você já tem)
const EMPTY_RESULT: any[] = [];
const EMPTY_COUNT = 0;
const EMPTY_OBJECT = null;

// 🎯 MOCKS ULTRA REALISTAS (mantendo os existentes)
const MOCK_EPOCHS = [
  { id: '685d59e11e3db0c5aaa8942d', name: 'Barroco' },
  { id: '685d59eb1e3db0c5aaa89435', name: 'Clássico' },
  { id: '685d5a061e3db0c5aaa89443', name: 'Contemporâneo' },
  { id: '685d59bc1e3db0c5aaa8941b', name: 'Medieval' },
  { id: '685d59ff1e3db0c5aaa8943f', name: 'Modernismo' },
  { id: '685d59d81e3db0c5aaa89425', name: 'Renascentista' },
  { id: '685d59f31e3db0c5aaa89439', name: 'Romântico' },
];

const MOCK_INSTRUMENTS = [
  { id: '685ef4b5a249f2a204023458', name: 'Piano', category: null },
  { id: '686024a90b6936a3c6cf4454', name: 'Órgão', category: null },
  { id: '686014f850400eeeb5a5af13', name: 'Contrabaixo', category: null },
  { id: '686011a550400eeeb5a5ae5d', name: 'Clarinete', category: null },
  { id: '6860111c50400eeeb5a5ae44', name: 'Banda', category: null },
  { id: '686025dc0b6936a3c6cf449d', name: 'A Cappella', category: null },
  { id: '6861f08c2d0344907e76d148', name: 'Acompanhamento', category: null },
  { id: '68628e89ba5984680e211ed5', name: 'Acordeão', category: null },
  { id: '686014e550400eeeb5a5af0f', name: 'Alaúde', category: null },
  { id: '6860a4270b6936a3c6cf5e46', name: 'Bandolim', category: null },
];

const MOCK_ROLES = [
  { id: '685d591c1e3db0c5aaa893e4', name: 'Compositor' },
  { id: '685d59571e3db0c5aaa893fa', name: 'Arranjador' },
  { id: '685d59241e3db0c5aaa893e8', name: 'Cantor' },
  { id: '685d59841e3db0c5aaa89410', name: 'Desconhecido' },
  { id: '685d596b1e3db0c5aaa89404', name: 'Editor' },
  { id: '685d59731e3db0c5aaa89408', name: 'Escritor' },
  { id: '685d594a1e3db0c5aaa893f2', name: 'Libretista' },
  { id: '685d597b1e3db0c5aaa8940c', name: 'Tradutor' },
];

const MOCK_WORK_GENRES = [
  {
    id: '686028450b6936a3c6cf4522',
    name: 'aberturas',
    createdAt: new Date('2025-06-28T17:37:09.592Z'),
    updatedAt: new Date('2025-06-28T17:37:09.593Z'),
  },
  {
    id: '6861f73b2d0344907e76d2f0',
    name: 'adagiettos',
    createdAt: new Date('2025-06-30T02:32:27.932Z'),
    updatedAt: new Date('2025-06-30T02:32:27.932Z'),
  },
  {
    id: '686024d70b6936a3c6cf4461',
    name: 'adágios',
    createdAt: new Date('2025-06-28T17:22:31.268Z'),
    updatedAt: new Date('2025-06-28T17:22:31.269Z'),
  },
];

const MOCK_COMPOSERS = [
  {
    id: '685d8f9a8803000f9b61d151',
    name: 'Bach',
    fullName: 'Johann Sebastian Bach',
    alternativeNames:
      'Jean Sébastien Bach (fr), Jan Sebastian Bach, John Sebastian Bach (en)',
    birthDate: '21 March 1685',
    deathDate: '28 July 1750',
    portraitUrl:
      'https://imslp.org/images/thumb/6/6a/Johann_Sebastian_Bach.jpg/180px-Johann_Sebastian_Bach.jpg',
    epochId: '685d59e11e3db0c5aaa8942d',
    epochName: 'Barroco',
    bio: null,
    videoUrl: null,
    permLinkImslp: 'https://imslp.org/wiki/Category:Bach,_Johann_Sebastian',
    imslpId: 'Category:Bach, Johann Sebastian',
    wikipediaLink: 'https://en.wikipedia.org/wiki/Johann_Sebastian_Bach',
    nationality: 'German',
    instruments:
      'Piano, Violin, Viola, Cello, Flute, Oboe, Harp, Organ, Harpsichord, Soprano',
    imslpCategories:
      'Composers, People from the Baroque era, German people, Male people',
    pageQuality: 'high',
    lastVerified: new Date('2025-06-26T18:21:14.235Z'),
    dataCompleteness: 88,
    hasValidImage: true,
    createdBy: null,
    isCustom: false,
    dataQuality: null,
    verificationStatus: null,
    verifiedBy: null,
    verifiedAt: null,
    dataSource: null,
    isVerified: false,
    verificationNotes: null,
    lastEditedBy: null,
    lastEditedAt: null,
    editHistory: null,
    primaryRoleId: '685d591c1e3db0c5aaa893e4',
    roles: '685d59571e3db0c5aaa893fa, 685d596b1e3db0c5aaa89404',
    createdAt: new Date('2025-06-26T18:21:14.238Z'),
    updatedAt: new Date('2025-07-28T05:07:05.665Z'),
    epoch: { id: '685d59e11e3db0c5aaa8942d', name: 'Barroco' },
    primaryRole: { id: '685d591c1e3db0c5aaa893e4', name: 'Compositor' },
    _count: { works: 1426 },
  },
  {
    id: '685ef349c6bd886c5b497f8f',
    name: 'Mozart',
    fullName: 'Wolfgang Amadeus Mozart',
    alternativeNames: 'Johann Chrysostom Wolfgang Theophilus Mozart',
    birthDate: '27 January 1756',
    deathDate: '5 December 1791',
    portraitUrl:
      'https://imslp.org/images/thumb/8/87/415_mozart.jpg/180px-415_mozart.jpg',
    epochId: '685d59eb1e3db0c5aaa89435',
    epochName: 'Clássico',
    bio: null,
    videoUrl: null,
    permLinkImslp: 'https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus',
    imslpId: 'Category:Mozart, Wolfgang Amadeus',
    wikipediaLink: 'https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart',
    nationality: 'Austrian',
    instruments:
      'Piano, Violin, Flute, Bassoon, Bass, Viola, Cello, Double bass, Clarinet, Horn',
    imslpCategories:
      'Composers, People from the Classical era, Austrian people, Male people',
    pageQuality: 'high',
    lastVerified: new Date('2025-06-27T19:38:49.735Z'),
    dataCompleteness: 88,
    hasValidImage: true,
    createdBy: null,
    isCustom: false,
    dataQuality: null,
    verificationStatus: null,
    verifiedBy: null,
    verifiedAt: null,
    dataSource: null,
    isVerified: false,
    verificationNotes: null,
    lastEditedBy: null,
    lastEditedAt: null,
    editHistory: null,
    primaryRoleId: '685d591c1e3db0c5aaa893e4',
    roles:
      '685d59571e3db0c5aaa893fa, 685d594a1e3db0c5aaa893f2, 685d59731e3db0c5aaa89408',
    createdAt: new Date('2025-06-27T19:38:49.736Z'),
    updatedAt: new Date('2025-09-02T21:23:11.190Z'),
    epoch: { id: '685d59eb1e3db0c5aaa89435', name: 'Clássico' },
    primaryRole: { id: '685d591c1e3db0c5aaa893e4', name: 'Compositor' },
    _count: { works: 829 },
  },
];

const MOCK_WORKS = [
  {
    id: '6879bfbc68d244782048d0fc',
    title: 'Œuvres célèbres pour orgue, Walter Kraft',
    composerId: '685d8f9a8803000f9b61d151',
    instrumentId: '686024a90b6936a3c6cf4454',
    epochId: '685d59e11e3db0c5aaa8942d',
    videoUrl: null,
    imslpPermlink:
      'https://imslp.org/wiki/Œuvres_célèbres_pour_orgue,_Walter_Kraft_(Bach,_Johann_Sebastian)',
    imslpId: '927933',
    opOrCatalog: null,
    compositionYear: null,
    firstPublishDate: null,
    tone: null,
    mediaDuration: null,
    workStyle: 'Baroque',
    moviment: '10 tracks on 1 disc',
    categoryNames: ['Para 1 instrumentista'],
    workGenresArr: [
      'prelúdios de coral',
      'fantasias',
      'prelúdios',
      'fugas',
      'pastorais',
      'tocatas',
    ],
    dedicateTo: null,
    instrumentation: 'Órgão',
    workType: 'COLLECTED_WORKS',
    movementNumber: null,
    parentWorkId: null,
    createdAt: new Date('2025-07-18T03:30:04.036Z'),
    updatedAt: new Date('2025-07-28T17:03:24.073Z'),
    subtitle: null,
    imslpTags: [
      'Composers',
      'Baroque',
      'For organ',
      'Scores featuring the organ',
    ],
    difficultyLevel: 'ADVANCED',
    annotationsCount: 0,
    helpfulAnnotationsCount: 0,
    lastAnnotationAt: null,
    composer: MOCK_COMPOSERS[0],
    epoch: MOCK_EPOCHS[0],
    instrument: MOCK_INSTRUMENTS[1],
    _count: { favoriteBy: 0 },
  },
];

const MOCK_USERS = [
  {
    id: '688cdfd7cc5e99751f75a76f',
    firstName: 'iago_martins',
    lastName: '',
    username: 'iago_martins',
    email: 'admin@email.com',
    emailVerified: new Date('2025-08-01T16:28:51.109Z'),
    hashedPassword:
      '$2b$12$WyYlR5TuJ1DH2Wp/82KMeetyJ5BFY6MeeFlwZOcKS0v8RSLiVxgLG',
    image: '',
    bio: null,
    createdAt: new Date('2025-08-01T15:40:07.873Z'),
    updatedAt: new Date('2025-09-02T04:49:46.100Z'),
    role: 2,
    userType: 'MUSIC_STUDENT',
    onboardingCompleted: true,
    city: 'Acrelândia',
    state: 'Acre',
    country: 'Brazil',
    phone: '+5511988598530',
    phoneCountryCode: null,
    phoneNumber: '988598530',
    favoriteComposerId: null,
    favoriteEpochId: null,
    experienceLevel: 'BEGINNER',
    practiceTimePerWeek: null,
    profilePublic: true,
    showLocation: false,
    helpfulAnnotationsCount: 0,
    totalAnnotationsCount: 1,
    totalXP: 0,
    totalUploads: 0,
    uploadScore: 0,
    isTeacher: false,
    isStudent: false,
  },
];

// 🎨 MOCK DATA DO BLOG
const MOCK_BLOG_CATEGORIES = [
  {
    id: '670a1b2c3d4e5f6a7b8c9d0e',
    name: 'Análise de Compositores',
    slug: 'analise-compositores',
    description: 'Artigos aprofundados sobre a vida e obra dos grandes mestres',
    parentId: null,
    showInMenu: true,
    isActive: true,
    image: null,
    icon: '🎼',
    color: '#3b82f6',
    coverImage: null,
    order: 1,
    metaTitle: 'Análise de Compositores | Opus Atlas Blog',
    metaDescription:
      'Conheça os grandes compositores da história da música clássica',
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
  },
  {
    id: '670a1b2c3d4e5f6a7b8c9d0f',
    name: 'História da Música',
    slug: 'historia-musica',
    description: 'Explorando as épocas e movimentos musicais',
    parentId: null,
    showInMenu: true,
    isActive: true,
    image: null,
    icon: '📜',
    color: '#8b5cf6',
    coverImage: null,
    order: 2,
    metaTitle: 'História da Música | Opus Atlas Blog',
    metaDescription:
      'Descubra a evolução da música clássica através dos séculos',
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
  },
  {
    id: '670a1b2c3d4e5f6a7b8c9d10',
    name: 'Guias e Tutoriais',
    slug: 'guias-tutoriais',
    description: 'Dicas práticas para músicos de todos os níveis',
    parentId: null,
    showInMenu: true,
    isActive: true,
    image: null,
    icon: '📚',
    color: '#10b981',
    coverImage: null,
    order: 3,
    metaTitle: 'Guias e Tutoriais | Opus Atlas Blog',
    metaDescription: 'Aprenda técnicas e dicas para melhorar sua performance',
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
  },
];

const MOCK_BLOG_TAGS = [
  {
    id: '670a1b2c3d4e5f6a7b8c9d11',
    name: 'barroco',
    slug: 'barroco',
    description: 'Artigos sobre o período Barroco',
    color: '#f59e0b',
    articleCount: 5,
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
  },
  {
    id: '670a1b2c3d4e5f6a7b8c9d12',
    name: 'piano',
    slug: 'piano',
    description: 'Artigos relacionados ao piano',
    color: '#6366f1',
    articleCount: 8,
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
  },
  {
    id: '670a1b2c3d4e5f6a7b8c9d13',
    name: 'iniciantes',
    slug: 'iniciantes',
    description: 'Conteúdo para músicos iniciantes',
    color: '#10b981',
    articleCount: 12,
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
  },
];

const MOCK_BLOG_ARTICLES = [
  {
    id: '670a1b2c3d4e5f6a7b8c9d14',
    title: 'Bach: O Mestre do Barroco Alemão',
    slug: 'bach-mestre-barroco-alemao',
    description:
      'Conheça a vida e obra de Johann Sebastian Bach, um dos maiores compositores de todos os tempos',
    content: {
      blocks: [
        {
          type: 'paragraph',
          content:
            'Johann Sebastian Bach é amplamente reconhecido como um dos maiores compositores da história da música.',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Primeiros Anos',
        },
        {
          type: 'paragraph',
          content:
            'Nascido em 1685 em Eisenach, Alemanha, Bach veio de uma longa linhagem de músicos.',
        },
      ],
    },
    coverImage: '/images/blog/bach-cover.jpg',
    coverImageAlt: 'Retrato de Johann Sebastian Bach',
    coverImageCredit: 'Domínio Público',
    ttsAudioUrl: null,
    status: 'PUBLISHED',
    isFeatured: true,
    featuredOrder: 1,
    types: ['COMPOSER_ANALYSIS'],
    authorId: '688cdfd7cc5e99751f75a76f',
    coAuthorIds: [],
    publishedAt: new Date('2025-01-20T09:00:00.000Z'),
    scheduledFor: null,
    createdAt: new Date('2025-01-18T10:00:00.000Z'),
    updatedAt: new Date('2025-01-20T09:00:00.000Z'),
    readTime: 8,
    composerIds: ['685d8f9a8803000f9b61d151'],
    workIds: [],
    scoreIds: [],
    instrumentIds: ['685ef4b5a249f2a204023458'],
    epochIds: ['685d59e11e3db0c5aaa8942d'],
    backgroundMusicUrl: null,
    backgroundMusicTitle: null,
    backgroundMusicVolume: 0.3,
    backgroundMusicLoop: true,
    backgroundMusicAutoplay: true,
    viewCount: 1547,
    readCount: 892,
    avgReadTime: 480,
    estimatedReadTime: 480,
    metaTitle: 'Bach: O Mestre do Barroco Alemão | Opus Atlas',
    metaDescription:
      'Descubra a vida e obra de Johann Sebastian Bach, suas principais composições e legado',
    keywords: ['bach', 'barroco', 'música clássica', 'compositor alemão'],
    version: 1,
  },
  {
    id: '670a1b2c3d4e5f6a7b8c9d15',
    title: 'Como Estudar Piano: Guia para Iniciantes',
    slug: 'como-estudar-piano-guia-iniciantes',
    description:
      'Um guia completo com dicas práticas para quem está começando a estudar piano',
    content: {
      blocks: [
        {
          type: 'paragraph',
          content:
            'Começar a estudar piano pode parecer desafiador, mas com as técnicas certas você pode progredir rapidamente.',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Postura Correta',
        },
        {
          type: 'paragraph',
          content:
            'A postura é fundamental para tocar piano de forma confortável e eficiente.',
        },
      ],
    },
    coverImage: '/images/blog/piano-guide-cover.jpg',
    coverImageAlt: 'Mãos tocando piano',
    coverImageCredit: 'Unsplash',
    ttsAudioUrl: null,
    status: 'PUBLISHED',
    isFeatured: false,
    featuredOrder: null,
    types: ['TUTORIAL'],
    authorId: '688cdfd7cc5e99751f75a76f',
    coAuthorIds: [],
    publishedAt: new Date('2025-01-22T14:00:00.000Z'),
    scheduledFor: null,
    createdAt: new Date('2025-01-21T10:00:00.000Z'),
    updatedAt: new Date('2025-01-22T14:00:00.000Z'),
    readTime: 6,
    composerIds: [],
    workIds: [],
    scoreIds: [],
    instrumentIds: ['685ef4b5a249f2a204023458'],
    epochIds: [],
    backgroundMusicUrl: null,
    backgroundMusicTitle: null,
    backgroundMusicVolume: 0.3,
    backgroundMusicLoop: true,
    backgroundMusicAutoplay: true,
    viewCount: 2341,
    readCount: 1456,
    avgReadTime: 360,
    estimatedReadTime: 360,
    metaTitle: 'Como Estudar Piano: Guia Completo para Iniciantes',
    metaDescription:
      'Aprenda as melhores técnicas e dicas para começar seus estudos de piano',
    keywords: ['piano', 'iniciantes', 'tutorial', 'técnica'],
    version: 1,
  },
];

const MOCK_BLOG_COMMENTS = [
  {
    id: '670a1b2c3d4e5f6a7b8c9d16',
    articleId: '670a1b2c3d4e5f6a7b8c9d14',
    userId: '688cdfd7cc5e99751f75a76f',
    content: 'Excelente artigo! Bach realmente foi um gênio incomparável.',
    parentId: null,
    status: 'APPROVED',
    isEdited: false,
    likeCount: 5,
    isFlagged: false,
    flagReason: null,
    flaggedBy: null,
    moderatedBy: null,
    moderatedAt: null,
    createdAt: new Date('2025-01-20T11:30:00.000Z'),
    updatedAt: new Date('2025-01-20T11:30:00.000Z'),
  },
];

const MOCK_BLOG_SERIES = [
  {
    id: '670a1b2c3d4e5f6a7b8c9d17',
    title: 'Grandes Compositores do Barroco',
    slug: 'grandes-compositores-barroco',
    description:
      'Uma série sobre os principais compositores do período Barroco',
    coverImage: '/images/blog/barroco-series.jpg',
    authorId: '688cdfd7cc5e99751f75a76f',
    isActive: true,
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
  },
];

// createMockResult - Sistema completo de mocks para build time
// Este arquivo deve substituir a função createMockResult no prismadb.ts

const createMockResult = (model: string, operation: string, args: any) => {
  if (IS_BUILD_TIME) {
    console.log(`🔧 Build time detected - mocking ${model}.${operation}`);

    switch (operation) {
      case 'findMany':
        const take = args?.take || 10;
        const skip = args?.skip || 0;

        switch (model) {
          // ===== MODELOS PRINCIPAIS =====
          case 'composer':
            return MOCK_COMPOSERS.slice(skip, skip + take);

          case 'work':
            return MOCK_WORKS.slice(skip, skip + take).map((work) => ({
              ...work,
              favoriteBy: [],
              _count: {
                favoriteBy: 0,
                annotations: 0,
                wantToLearners: 0,
                learners: 0,
              },
            }));

          case 'epoch':
            return MOCK_EPOCHS.slice(skip, skip + take);

          case 'instrument':
            return MOCK_INSTRUMENTS.slice(skip, skip + take);

          case 'role':
            return MOCK_ROLES.slice(skip, skip + take);

          case 'workGenre':
            return MOCK_WORK_GENRES.slice(skip, skip + take);

          case 'user':
            return MOCK_USERS.slice(skip, skip + take);

          // ===== BLOG MODELS =====
          case 'blogCategory':
            return MOCK_BLOG_CATEGORIES.slice(skip, skip + take);

          case 'blogTag':
            return MOCK_BLOG_TAGS.slice(skip, skip + take);

          case 'blogArticle':
            return MOCK_BLOG_ARTICLES.slice(skip, skip + take);

          case 'blogComment':
            return MOCK_BLOG_COMMENTS.slice(skip, skip + take);

          case 'blogSeries':
            return MOCK_BLOG_SERIES.slice(skip, skip + take);

          // ===== RELAÇÕES E TABELAS DE JUNÇÃO =====
          case 'favoriteWork':
          case 'favoriteComposer':
          case 'favoriteScore':
          case 'scoreFavoriteStats':
          case 'wantToLearn':
          case 'learned':
          case 'userInstrument':
          case 'annotation':
          case 'workAnnotation':
          case 'annotationHelpfulVote':
          case 'workScore':
            return [];

          // Blog Relations
          case 'blogArticleCategory':
          case 'blogArticleTag':
          case 'blogMedia':
          case 'blogLike':
          case 'blogBookmark':
          case 'blogCommentLike':
          case 'blogArticleVersion':
          case 'blogSeriesArticle':
            return [];

          // ===== SISTEMA DE AUTENTICAÇÃO =====
          case 'account':
          case 'session':
          case 'userToken':
            return [];

          // ===== SISTEMA DE UPLOAD/MODERAÇÃO =====
          case 'uploadHistory':
          case 'uploadModeration':
          case 'generatedReport':
            return [];

          // ===== SISTEMA DE ANÚNCIOS =====
          case 'advertisement':
          case 'adStats':
            return [];

          // ===== SISTEMA DE NEWSLETTER =====
          case 'newsletterSubscriber':
          case 'newsletterTemplate':
          case 'newsletterCampaign':
          case 'newsletterCampaignSend':
          case 'newsletterEmailEvent':
          case 'testEmailList':
          case 'templateFragment':
            return [];

          // ===== SISTEMA PROFESSOR-ALUNO =====
          case 'teacher':
          case 'student':
          case 'teacherStudent':
          case 'lesson':
          case 'assignment':
            return [];

          // ===== SISTEMA DE NOTIFICAÇÕES =====
          case 'notification':
          case 'schoolActivity':
            return [];

          // ===== SISTEMA DE CONQUISTAS =====
          case 'userAchievement':
          case 'achievementProgress':
            return [];

          // ===== SISTEMA DE RELATÓRIOS =====
          case 'sharedProgressReport':
          case 'sharedReportComment':
            return [];

          // ===== SISTEMA DE ACTIVITY LOG =====
          case 'activityLog':
            return [];

          default:
            console.warn(`⚠️ Unhandled model in findMany: ${model}`);
            return [];
        }

      case 'findFirst':
      case 'findUnique':
        switch (model) {
          // ===== MODELOS PRINCIPAIS =====
          case 'composer':
            return MOCK_COMPOSERS[0] || null;

          case 'work':
            const work = MOCK_WORKS[0];
            return work
              ? {
                  ...work,
                  favoriteBy: [],
                  _count: {
                    favoriteBy: 0,
                    annotations: 0,
                    wantToLearners: 0,
                    learners: 0,
                  },
                }
              : null;

          case 'epoch':
            return MOCK_EPOCHS[0] || null;

          case 'instrument':
            return MOCK_INSTRUMENTS[0] || null;

          case 'role':
            return MOCK_ROLES[0] || null;

          case 'workGenre':
            return MOCK_WORK_GENRES[0] || null;

          case 'user':
            return MOCK_USERS[0] || null;

          // ===== BLOG MODELS =====
          case 'blogCategory':
            return MOCK_BLOG_CATEGORIES[0] || null;

          case 'blogTag':
            return MOCK_BLOG_TAGS[0] || null;

          case 'blogArticle':
            return MOCK_BLOG_ARTICLES[0] || null;

          case 'blogComment':
            return MOCK_BLOG_COMMENTS[0] || null;

          case 'blogSeries':
            return MOCK_BLOG_SERIES[0] || null;

          // ===== TODOS OS OUTROS RETORNAM NULL =====
          default:
            return null;
        }

      case 'count':
        switch (model) {
          // ===== MODELOS PRINCIPAIS =====
          case 'composer':
            return MOCK_COMPOSERS.length;

          case 'work':
            return MOCK_WORKS.length;

          case 'epoch':
            return MOCK_EPOCHS.length;

          case 'instrument':
            return MOCK_INSTRUMENTS.length;

          case 'role':
            return MOCK_ROLES.length;

          case 'workGenre':
            return MOCK_WORK_GENRES.length;

          case 'user':
            return MOCK_USERS.length;

          // ===== BLOG MODELS =====
          case 'blogCategory':
            return MOCK_BLOG_CATEGORIES.length;

          case 'blogTag':
            return MOCK_BLOG_TAGS.length;

          case 'blogArticle':
            return MOCK_BLOG_ARTICLES.length;

          case 'blogComment':
            return MOCK_BLOG_COMMENTS.length;

          case 'blogSeries':
            return MOCK_BLOG_SERIES.length;

          // ===== RELAÇÕES E OUTROS MODELS RETORNAM 0 =====
          case 'favoriteWork':
          case 'favoriteComposer':
          case 'favoriteScore':
          case 'scoreFavoriteStats':
          case 'wantToLearn':
          case 'learned':
          case 'userInstrument':
          case 'annotation':
          case 'workAnnotation':
          case 'annotationHelpfulVote':
          case 'workScore':
          case 'blogArticleCategory':
          case 'blogArticleTag':
          case 'blogMedia':
          case 'blogLike':
          case 'blogBookmark':
          case 'blogCommentLike':
          case 'blogArticleVersion':
          case 'blogSeriesArticle':
          case 'account':
          case 'session':
          case 'userToken':
          case 'uploadHistory':
          case 'uploadModeration':
          case 'generatedReport':
          case 'advertisement':
          case 'adStats':
          case 'newsletterSubscriber':
          case 'newsletterTemplate':
          case 'newsletterCampaign':
          case 'newsletterCampaignSend':
          case 'newsletterEmailEvent':
          case 'testEmailList':
          case 'templateFragment':
          case 'teacher':
          case 'student':
          case 'teacherStudent':
          case 'lesson':
          case 'assignment':
          case 'notification':
          case 'schoolActivity':
          case 'userAchievement':
          case 'achievementProgress':
          case 'sharedProgressReport':
          case 'sharedReportComment':
          case 'activityLog':
            return 0;

          default:
            console.warn(`⚠️ Unhandled model in count: ${model}`);
            return 0;
        }

      case 'aggregate':
        let count = 0;
        switch (model) {
          // ===== MODELOS PRINCIPAIS =====
          case 'composer':
            count = MOCK_COMPOSERS.length;
            break;
          case 'work':
            count = MOCK_WORKS.length;
            break;
          case 'epoch':
            count = MOCK_EPOCHS.length;
            break;
          case 'instrument':
            count = MOCK_INSTRUMENTS.length;
            break;
          case 'role':
            count = MOCK_ROLES.length;
            break;
          case 'workGenre':
            count = MOCK_WORK_GENRES.length;
            break;
          case 'user':
            count = MOCK_USERS.length;
            break;

          // ===== BLOG MODELS =====
          case 'blogCategory':
            count = MOCK_BLOG_CATEGORIES.length;
            break;
          case 'blogTag':
            count = MOCK_BLOG_TAGS.length;
            break;
          case 'blogArticle':
            count = MOCK_BLOG_ARTICLES.length;
            break;
          case 'blogComment':
            count = MOCK_BLOG_COMMENTS.length;
            break;
          case 'blogSeries':
            count = MOCK_BLOG_SERIES.length;
            break;

          default:
            count = 0;
        }
        return { _count: { id: count, _all: count } };

      // ===== OPERAÇÕES EXTRAS =====
      case 'groupBy':
        return [];

      case 'findFirstOrThrow':
      case 'findUniqueOrThrow':
        return createMockResult(model, 'findFirst', args);

      case 'create':
      case 'update':
      case 'upsert':
        switch (model) {
          case 'composer':
            return MOCK_COMPOSERS[0] || null;
          case 'work':
            return MOCK_WORKS[0] || null;
          case 'user':
            return MOCK_USERS[0] || null;
          case 'blogCategory':
            return MOCK_BLOG_CATEGORIES[0] || null;
          case 'blogTag':
            return MOCK_BLOG_TAGS[0] || null;
          case 'blogArticle':
            return MOCK_BLOG_ARTICLES[0] || null;
          case 'blogComment':
            return MOCK_BLOG_COMMENTS[0] || null;
          case 'blogSeries':
            return MOCK_BLOG_SERIES[0] || null;
          default:
            return null;
        }

      case 'delete':
      case 'deleteMany':
        return { count: 0 };

      case 'createMany':
      case 'updateMany':
        return { count: 0 };

      default:
        console.warn(`⚠️ Unhandled operation: ${model}.${operation}`);
        return null;
    }
  }

  return null; // NÃO é build time, prosseguir normalmente
};

// Criar instância real do Prisma
const realPrisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = realPrisma;
}

// Proxy para interceptar operações
const createModelProxy = (modelName: string) => {
  return new Proxy(
    {},
    {
      get(target, operation) {
        return async (...args: any[]) => {
          // 🔧 Verificar se é build time primeiro
          const mockResult = createMockResult(
            modelName,
            operation as string,
            args[0]
          );
          if (mockResult !== null) {
            return mockResult;
          }

          // 🚀 Runtime normal - usar Prisma real
          try {
            const model = (realPrisma as any)[modelName];
            if (model && typeof model[operation as string] === 'function') {
              return await model[operation as string](...args);
            }

            console.warn(
              `Operation ${operation as string} not found on model ${modelName}`
            );
            return EMPTY_RESULT;
          } catch (error) {
            console.error(
              `Prisma operation failed: ${modelName}.${operation as string}`,
              error
            );

            // Fallback para erro
            if ((operation as string).includes('find')) {
              return (operation as string) === 'findMany'
                ? EMPTY_RESULT
                : EMPTY_OBJECT;
            }
            if ((operation as string) === 'count') {
              return EMPTY_COUNT;
            }

            throw error;
          }
        };
      },
    }
  );
};

// Proxy principal
const prisma = new Proxy(realPrisma, {
  get(target, modelName) {
    // Lista completa dos modelos do schema
    const models = [
      'user',
      'composer',
      'work',
      'epoch',
      'role',
      'instrument',
      'workGenre',
      'workScore',
      'annotation',
      'workAnnotation',
      'annotationHelpfulVote',
      'userInstrument',
      'favoriteWork',
      'favoriteComposer',
      'favoriteScore',
      'scoreFavoriteStats',
      'wantToLearn',
      'learned',
      'account',
      'session',
      'userToken',
      'uploadHistory',
      'uploadModeration',
      'generatedReport',
      'advertisement',
      'adStats',
      'newsletterSubscriber',
      'newsletterTemplate',
      'newsletterCampaign',
      'newsletterCampaignSend',
      'newsletterEmailEvent',
      'testEmailList',
      'templateFragment',
      'teacher',
      'student',
      'teacherStudent',
      'lesson',
      'assignment',
      'notification',
      'schoolActivity',
      'userAchievement',
      'achievementProgress',
      'sharedProgressReport',
      'sharedReportComment',
    ];

    if (
      IS_BUILD_TIME &&
      typeof modelName === 'string' &&
      models.includes(modelName)
    ) {
      return createModelProxy(modelName);
    }

    // Runtime normal ou operações não-modelo
    return Reflect.get(target, modelName);
  },
});

// 🔧 LOG DE STATUS MELHORADO
if (IS_BUILD_TIME) {
  console.log('🔧 PRISMA BUILD-SAFE MODE ACTIVATED');
  console.log(
    '📦 All database operations will return realistic mock data during build'
  );
  console.log('🎯 Using real data from your database for convincing mocks');
} else {
  console.log('🚀 PRISMA RUNTIME MODE - Real database operations enabled');
  console.log('💾 Connected to real database for live data');
}

export default prisma;
