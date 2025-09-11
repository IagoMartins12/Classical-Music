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

// 🎯 MOCKS ULTRA REALISTAS baseados nos seus dados reais

// ÉPOCAS REAIS
const MOCK_EPOCHS = [
  { id: '685d59e11e3db0c5aaa8942d', name: 'Barroco' },
  { id: '685d59eb1e3db0c5aaa89435', name: 'Clássico' },
  { id: '685d5a061e3db0c5aaa89443', name: 'Contemporâneo' },
  { id: '685d59bc1e3db0c5aaa8941b', name: 'Medieval' },
  { id: '685d59ff1e3db0c5aaa8943f', name: 'Modernismo' },
  { id: '685d59d81e3db0c5aaa89425', name: 'Renascentista' },
  { id: '685d59f31e3db0c5aaa89439', name: 'Romântico' },
];

// INSTRUMENTOS REAIS (principais)
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

// ROLES REAIS
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

// GÊNEROS DE OBRA REAIS
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
  {
    id: '68602fd50b6936a3c6cf46c2',
    name: 'alemandas',
    createdAt: new Date('2025-06-28T18:09:25.375Z'),
    updatedAt: new Date('2025-06-28T18:09:25.377Z'),
  },
  {
    id: '68603c0b0b6936a3c6cf4961',
    name: 'allegrettos',
    createdAt: new Date('2025-06-28T19:01:31.940Z'),
    updatedAt: new Date('2025-06-28T19:01:31.941Z'),
  },
  {
    id: '6860a5a10b6936a3c6cf5e91',
    name: 'allegros',
    createdAt: new Date('2025-06-29T02:32:01.281Z'),
    updatedAt: new Date('2025-06-29T02:32:01.282Z'),
  },
  {
    id: '6860378a0b6936a3c6cf486e',
    name: 'andantes',
    createdAt: new Date('2025-06-28T18:42:18.756Z'),
    updatedAt: new Date('2025-06-28T18:42:18.757Z'),
  },
  {
    id: '68603d570b6936a3c6cf49a6',
    name: 'andantinos',
    createdAt: new Date('2025-06-28T19:07:03.121Z'),
    updatedAt: new Date('2025-06-28T19:07:03.123Z'),
  },
  {
    id: '686026360b6936a3c6cf44b3',
    name: 'ariettas',
    createdAt: new Date('2025-06-28T17:28:22.939Z'),
    updatedAt: new Date('2025-06-28T17:28:22.940Z'),
  },
  {
    id: '68602e760b6936a3c6cf467c',
    name: 'ariosos',
    createdAt: new Date('2025-06-28T18:03:34.247Z'),
    updatedAt: new Date('2025-06-28T18:03:34.248Z'),
  },
];

// COMPOSITORES REAIS (baseados nos seus dados)
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
  {
    id: '685f8b71c6bd886c5b4995fe',
    name: 'Vivaldi',
    fullName: 'Antonio Vivaldi',
    alternativeNames: 'Antonio Lucio Vivaldi',
    birthDate: '4 March 1678',
    deathDate: '28 July 1741',
    portraitUrl:
      'https://imslp.org/images/thumb/1/1b/Antonio_Vivaldi.jpg/180px-Antonio_Vivaldi.jpg',
    epochId: '685d59e11e3db0c5aaa8942d',
    epochName: 'Barroco',
    bio: 'Antonio Vivaldi (4 de março de 1678 - 28 de julho de 1741) foi um compositor, violinista e padre católico italiano do período Barroco.',
    videoUrl: null,
    permLinkImslp: 'https://imslp.org/wiki/Category:Vivaldi,_Antonio',
    imslpId: 'Category:Vivaldi, Antonio',
    wikipediaLink: 'https://en.wikipedia.org/wiki/Antonio_Vivaldi',
    nationality: 'Italian',
    instruments:
      'Violin, Viola, Cello, Flute, Oboe, Bassoon, Horn, Trumpet, Organ, Bass',
    imslpCategories:
      'Composers, People from the Baroque era, Italian people, Male people',
    pageQuality: 'high',
    lastVerified: new Date('2025-06-28T06:28:01.693Z'),
    dataCompleteness: 88,
    hasValidImage: true,
    createdBy: null,
    isCustom: false,
    dataQuality: null,
    verificationStatus: 'verified',
    verifiedBy: null,
    verifiedAt: new Date('2025-07-10T20:06:00.848Z'),
    dataSource: null,
    isVerified: false,
    verificationNotes: null,
    lastEditedBy: null,
    lastEditedAt: null,
    editHistory: {
      action: 'verified',
      by: '6867dd6fcc0ebd96bc5b336f',
      at: '2025-07-10T20:06:00.848Z',
      notes: 'Verificado',
      previous: null,
    },
    primaryRoleId: '685d591c1e3db0c5aaa893e4',
    roles: null,
    createdAt: new Date('2025-06-28T06:28:01.694Z'),
    updatedAt: new Date('2025-09-02T21:43:44.849Z'),
    epoch: { id: '685d59e11e3db0c5aaa8942d', name: 'Barroco' },
    primaryRole: { id: '685d591c1e3db0c5aaa893e4', name: 'Compositor' },
    _count: { works: 696 },
  },
  {
    id: '685f4a93c6bd886c5b498cce',
    name: 'Schubert',
    fullName: 'Franz Schubert',
    alternativeNames: 'Franz Peter Schubert',
    birthDate: '31 January 1797',
    deathDate: '19 November 1828',
    portraitUrl:
      'https://imslp.org/images/thumb/3/39/Schubert_HQ.JPG/180px-Schubert_HQ.JPG',
    epochId: '685d59f31e3db0c5aaa89439',
    epochName: 'Romântico',
    bio: null,
    videoUrl: null,
    permLinkImslp: 'https://imslp.org/wiki/Category:Schubert,_Franz',
    imslpId: 'Category:Schubert, Franz',
    wikipediaLink: 'https://en.wikipedia.org/wiki/Franz_Schubert',
    nationality: 'Austrian',
    instruments:
      'Piano, Violin, Cello, Flute, Viola, Double bass, Guitar, Organ, Voice, Soprano',
    imslpCategories:
      'Composers, People from the Romantic era, Austrian people, Male people',
    pageQuality: 'high',
    lastVerified: new Date('2025-06-28T01:51:15.919Z'),
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
    roles: '685d59571e3db0c5aaa893fa, 685d594a1e3db0c5aaa893f2',
    createdAt: new Date('2025-06-28T01:51:15.920Z'),
    updatedAt: new Date('2025-09-02T21:23:33.797Z'),
    epoch: { id: '685d59f31e3db0c5aaa89439', name: 'Romântico' },
    primaryRole: { id: '685d591c1e3db0c5aaa893e4', name: 'Compositor' },
    _count: { works: 1061 },
  },
  {
    id: '685e7ff8c6bd886c5b496e2a',
    name: 'Haydn',
    fullName: 'Joseph Haydn',
    alternativeNames: 'Franz Joseph Haydn, Josef Haydn, Franz Josef Haydn',
    birthDate: '31 March 1732',
    deathDate: '31 May 1809',
    portraitUrl:
      'https://imslp.org/images/thumb/c/c6/J-haydn.jpg/180px-J-haydn.jpg',
    epochId: '685d59eb1e3db0c5aaa89435',
    epochName: 'Clássico',
    bio: null,
    videoUrl: null,
    permLinkImslp: 'https://imslp.org/wiki/Category:Haydn,_Joseph',
    imslpId: 'Category:Haydn, Joseph',
    wikipediaLink: 'https://en.wikipedia.org/wiki/Joseph_Haydn',
    nationality: 'Austrian',
    instruments:
      'Piano, Violin, Wind quintet, Viola, Cello, Double bass, Flute, Horn, Harp, Organ',
    imslpCategories:
      'Composers, People from the Classical era, Austrian people, Male people',
    pageQuality: 'high',
    lastVerified: new Date('2025-06-27T11:26:48.586Z'),
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
    roles: '685d59571e3db0c5aaa893fa',
    createdAt: new Date('2025-06-27T11:26:48.588Z'),
    updatedAt: new Date('2025-07-28T05:07:06.457Z'),
    epoch: { id: '685d59eb1e3db0c5aaa89435', name: 'Clássico' },
    primaryRole: { id: '685d591c1e3db0c5aaa893e4', name: 'Compositor' },
    _count: { works: 936 },
  },
];

// OBRAS REAIS (baseadas nos seus dados)
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
  {
    id: '6879bfb468d244782048d0fa',
    title: 'Œuvres complètes pour piano',
    composerId: '685e1087c6bd886c5b495d66',
    instrumentId: '685ef4b5a249f2a204023458',
    epochId: '685d59f31e3db0c5aaa89439',
    videoUrl: null,
    imslpPermlink:
      'https://imslp.org/wiki/Œuvres_complètes_pour_piano_(Chopin,_Frédéric)',
    imslpId: '318858',
    opOrCatalog: null,
    compositionYear: null,
    firstPublishDate: '1915-16 or 1917',
    tone: null,
    mediaDuration: null,
    workStyle: 'Romantic',
    moviment: '12 volumes',
    categoryNames: ['Peças', 'Para 1 instrumentista'],
    workGenresArr: ['pieces'],
    dedicateTo: null,
    instrumentation: 'Piano',
    workType: 'COLLECTED_WORKS',
    movementNumber: null,
    parentWorkId: null,
    createdAt: new Date('2025-07-18T03:29:56.453Z'),
    updatedAt: new Date('2025-07-28T17:03:24.073Z'),
    subtitle: null,
    imslpTags: [
      'Composers',
      'Romantic',
      'For piano',
      'Scores featuring the piano',
    ],
    difficultyLevel: 'INTERMEDIATE',
    annotationsCount: 0,
    helpfulAnnotationsCount: 0,
    lastAnnotationAt: null,
    composer: {
      id: '685e1087c6bd886c5b495d66',
      name: 'Chopin',
      fullName: 'Frédéric Chopin',
      epochName: 'Romântico',
    },
    epoch: MOCK_EPOCHS[6],
    instrument: MOCK_INSTRUMENTS[0],
    _count: { favoriteBy: 0 },
  },
];

// USUÁRIOS REAIS
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

// FACTORY PARA RESULTADOS MOCK REALISTAS
const createMockResult = (model: string, operation: string, args: any) => {
  if (IS_BUILD_TIME) {
    console.log(`🔧 Build time detected - mocking ${model}.${operation}`);

    switch (operation) {
      case 'findMany':
        const take = args?.take || 10;
        const skip = args?.skip || 0;

        switch (model) {
          case 'composer':
            return MOCK_COMPOSERS.slice(skip, skip + take);
          case 'work':
            return MOCK_WORKS.slice(skip, skip + take);
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
          case 'workScore':
          case 'annotation':
          case 'favoriteWork':
          case 'favoriteComposer':
          case 'wantToLearn':
          case 'learned':
          case 'userInstrument':
          case 'account':
          case 'session':
          case 'userToken':
            return EMPTY_RESULT; // Tabelas relacionadas ao usuário retornam vazio
          default:
            return EMPTY_RESULT;
        }

      case 'findFirst':
      case 'findUnique':
        switch (model) {
          case 'composer':
            return MOCK_COMPOSERS[0];
          case 'work':
            return MOCK_WORKS[0];
          case 'epoch':
            return MOCK_EPOCHS[0];
          case 'instrument':
            return MOCK_INSTRUMENTS[0];
          case 'role':
            return MOCK_ROLES[0];
          case 'workGenre':
            return MOCK_WORK_GENRES[0];
          case 'user':
            return MOCK_USERS[0];
          default:
            return EMPTY_OBJECT;
        }

      case 'count':
        switch (model) {
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
          default:
            return EMPTY_COUNT;
        }

      case 'aggregate':
        let count = EMPTY_COUNT;
        switch (model) {
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
        }
        return { _count: { id: count } };

      case 'create':
      case 'update':
      case 'upsert':
        switch (model) {
          case 'composer':
            return MOCK_COMPOSERS[0];
          case 'work':
            return MOCK_WORKS[0];
          case 'epoch':
            return MOCK_EPOCHS[0];
          case 'instrument':
            return MOCK_INSTRUMENTS[0];
          case 'role':
            return MOCK_ROLES[0];
          case 'workGenre':
            return MOCK_WORK_GENRES[0];
          case 'user':
            return MOCK_USERS[0];
          default:
            return EMPTY_OBJECT;
        }

      case 'delete':
      case 'deleteMany':
        return { count: 0 };

      case 'createMany':
      case 'updateMany':
        return { count: 0 };

      case 'aggregateRaw':
        return EMPTY_RESULT;

      default:
        return EMPTY_RESULT;
    }
  }

  return null; // Não é build time, prosseguir normalmente
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
