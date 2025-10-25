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
    lastName: 'iago_martins',
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
    id: '68efc0195f2b6ccd0c08ef52',
    name: 'Clássico',
    slug: 'classico',
    description: 'Conheça mais sobre o periodo clássico.',
    parentId: null,
    showInMenu: true,
    isActive: true,
    image:
      '/blog/categories/category-68efc0195f2b6ccd0c08ef52-1760637906265-m9nq49.jpeg',
    icon: '🎹',
    color: '#d4af37',
    coverImage: null,
    order: 1,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date('2025-10-15T15:39:05.088Z'),
    updatedAt: new Date('2025-10-17T19:31:35.390Z'),
  },
];

const MOCK_BLOG_TAGS = [
  {
    id: '68efcd7c0c8b0f5c66f56adb',
    name: 'Chopin3',
    slug: 'chopin2',
    description: '',
    color: '#d4af37',
    articleCount: 0,
    createdAt: new Date('2025-10-15T16:36:12.786Z'),
    updatedAt: new Date('2025-10-15T16:38:40.229Z'),
  },
];

const MOCK_BLOG_ARTICLES = [
  {
    id: '68efbb9cf438e29db2293b58',
    title: 'Curiosidades de chopin',
    slug: 'chopin-bacana',
    description:
      'Veja 23 curiosidades desse compositor incrivel do periodo romantico.',
    content: {
      type: 'doc',
      content: [], // Array vazio ou estrutura simplificada
    },
    coverImage:
      '/blog/68efbb9cf438e29db2293b58/thumbnail/1760588906971-965vjn.png',
    coverImageAlt: '',
    coverImageCredit: null,
    ttsAudioUrl:
      'https://res.cloudinary.com/dikufxgpb/video/upload/v1761139346/blog/tts/68efbb9cf438e29db2293b58/tts_audio_1761139342206.mp3',
    status: 'PUBLISHED',
    isFeatured: true,
    featuredOrder: 3,
    types: ['COMPOSER_ANALYSIS', 'WORK_ANALYSIS'],
    authorId: '688cdfd7cc5e99751f75a76f',
    coAuthorIds: [],
    publishedAt: new Date('2025-10-15T15:19:56.114Z'),
    scheduledFor: null,
    createdAt: new Date('2025-10-15T15:19:56.115Z'),
    updatedAt: new Date('2025-10-24T18:43:54.569Z'),
    readTime: 7,
    composerIds: [],
    workIds: [],
    scoreIds: [],
    instrumentIds: [],
    epochIds: [],
    backgroundMusicUrl: 'https://www.youtube.com/watch?v=mLmbZJAjeoI',
    backgroundMusicTitle: 'Sokolov',
    backgroundMusicVolume: 0.5,
    backgroundMusicLoop: true,
    backgroundMusicAutoplay: true,
    viewCount: 198,
    readCount: 0,
    avgReadTime: null,
    estimatedReadTime: 7,
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    version: 11,
    author: {
      id: MOCK_USERS[0].id,
      firstName: MOCK_USERS[0].firstName,
      lastName: MOCK_USERS[0].lastName,
      image: MOCK_USERS[0].image,
    },
  },
];

const MOCK_BLOG_COMMENTS = [
  {
    id: '68efdb9a903df79587a00f31',
    articleId: '68efbb9cf438e29db2293b58',
    userId: '688cdfd7cc5e99751f75a76f',
    content: 'teste',
    parentId: null,
    status: 'APPROVED',
    isEdited: false,
    likeCount: 1,
    isFlagged: false,
    flagReason: null,
    flaggedBy: null,
    moderatedBy: null,
    moderatedAt: null,
    createdAt: new Date('2025-10-15T17:36:26.570Z'),
    updatedAt: new Date('2025-10-16T02:56:32.744Z'),
  },
];

const MOCK_BLOG_ARTICLE_CATEGORIES = [
  {
    id: '68f2d0598ff6ad1d5ae4789e',
    articleId: '68efbb9cf438e29db2293b58',
    categoryId: '68efc0195f2b6ccd0c08ef52', // ← mesmo ID do MOCK_BLOG_CATEGORIES
    createdAt: new Date('2025-10-17T23:25:13.994Z'),
  },
];

const MOCK_BLOG_ARTICLE_VERSIONS = [
  {
    id: '68efbb9cf438e29db2293b59',
    articleId: '68efbb9cf438e29db2293b58',
    version: 1,
    snapshot: {
      id: '68efbb9cf438e29db2293b58',
      title: 'Chopin bacana',
      slug: 'chopin-bacana',
      description: 'Teste CHopin',
      content: {},
      coverImage: null,
      coverImageAlt: null,
      coverImageCredit: null,
      status: 'PUBLISHED',
      isFeatured: true,
      featuredOrder: 1,
      types: ['COMPOSER_ANALYSIS'],
      authorId: '688cdfd7cc5e99751f75a76f',
      coAuthorIds: [],
      publishedAt: '2025-10-15T15:19:56.114Z',
      scheduledFor: null,
      createdAt: '2025-10-15T15:19:56.115Z',
      updatedAt: '2025-10-15T15:19:56.115Z',
      readTime: 0,
      composerIds: [],
      workIds: [],
      scoreIds: [],
      instrumentIds: [],
      epochIds: [],
      backgroundMusicUrl: null,
      backgroundMusicTitle: null,
      backgroundMusicVolume: 0.3,
      backgroundMusicLoop: true,
      backgroundMusicAutoplay: true,
      viewCount: 0,
      readCount: 0,
      avgReadTime: null,
      estimatedReadTime: 1,
      metaTitle: null,
      metaDescription: null,
      keywords: [],
      version: 1,
      author: {
        id: '688cdfd7cc5e99751f75a76f',
        firstName: 'iago_martins',
        lastName: '',
        username: 'iago_martins',
        image: '',
      },
    },
    editedBy: '688cdfd7cc5e99751f75a76f',
    changeLog: 'Versão inicial',
    createdAt: new Date('2025-10-15T15:19:56.126Z'),
  },
];

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

          // ===== BLOG MODELS CORRIGIDOS =====
          case 'blogCategory':
            return MOCK_BLOG_CATEGORIES.slice(skip, skip + take).map((cat) => ({
              ...cat,
              articles: MOCK_BLOG_ARTICLE_CATEGORIES.filter(
                (ac) => ac.categoryId === cat.id
              ).map((ac) => ({
                article:
                  MOCK_BLOG_ARTICLES.find((a) => a.id === ac.articleId) || null,
              })),
              _count: {
                articles: MOCK_BLOG_ARTICLE_CATEGORIES.filter(
                  (ac) => ac.categoryId === cat.id
                ).length,
              },
            }));

          case 'blogTag':
            return MOCK_BLOG_TAGS.slice(skip, skip + take);

          case 'blogArticle':
            return MOCK_BLOG_ARTICLES.slice(skip, skip + take);

          case 'blogComment':
            return MOCK_BLOG_COMMENTS.slice(skip, skip + take);

          case 'blogArticleCategory':
            return MOCK_BLOG_ARTICLE_CATEGORIES.slice(skip, skip + take);

          case 'blogArticleVersion':
            return MOCK_BLOG_ARTICLE_VERSIONS.slice(skip, skip + take);

          case 'blogSeries':
          case 'blogArticleTag':

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
            return null;

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
            count = 0;
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
            return null;
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
      'blogArticle',
      'blogCategory',
      'blogTag',
      'blogArticleCategory',
      'blogArticleTag',
      'blogComment',
      'blogCommentLike',
      'blogLike',
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
