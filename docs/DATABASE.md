# Schema Completo e Relacionamentos - Opus Atlas

Este documento detalha o schema completo do banco de dados MongoDB com Prisma ORM, incluindo todas as 41 tabelas, relacionamentos e estratégias de cascade.

## Visão Geral do Banco

### Estatísticas

- **MongoDB**: 7.0 com Replica Set (rs0)
- **ORM**: Prisma 6.13.0
- **Tabelas**: 41 collections
- **Relacionamentos**: 67 relacionamentos mapeados
- **Índices**: 47+ índices otimizados
- **Dados**: ~19K compositores + 208K obras

### Estrutura de Collections

```
Collections por categoria:
├── Usuários e Autenticação (4)
├── Conteúdo Musical (7)
├── Sistema de Favoritos (4)
├── Sistema de Aprendizado (3)
├── Sistema de Anotações (3)
├── Sistema Professor-Aluno (6)
├── Sistema de Gamificação (2)
├── Sistema de Notificações (2)
├── Sistema de Newsletter (5)
├── Sistema de Publicidade (2)
├── Sistema de Moderação (2)
└── Utilitárias (1)
```

---

## 1. Usuários e Autenticação (4 tabelas)

### 1.1 User - Tabela Principal

```prisma
model User {
  id             String    @id @default(auto()) @map("_id") @db.ObjectId
  firstName      String?
  lastName       String?
  username       String?   @unique
  email          String?   @unique
  emailVerified  DateTime?
  hashedPassword String?
  image          String?
  bio            String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Configurações de usuário
  role Int @default(0) // 0=user, 1=admin, 2=super_admin
  userType            UserType?
  onboardingCompleted Boolean   @default(false)

  // Localização
  city             String?
  state            String?
  country          String?
  phone            String?
  phoneCountryCode String?
  phoneNumber      String?

  // Preferências musicais
  favoriteComposerId String? @db.ObjectId
  favoriteEpochId    String? @db.ObjectId
  experienceLevel    DifficultyLevel @default(BEGINNER)
  practiceTimePerWeek Int?

  // Configurações de privacidade
  profilePublic Boolean @default(true)
  showLocation  Boolean @default(false)

  // Métricas de contribuição
  helpfulAnnotationsCount Int @default(0)
  totalAnnotationsCount   Int @default(0)
  totalUploads           Int @default(0)
  uploadScore            Int @default(0)
  totalXP                Int @default(0)

  // Sistema professor-aluno
  isTeacher Boolean @default(false)
  isStudent Boolean @default(false)

  // Relacionamentos
  accounts     Account[]
  sessions     Session[]
  tokens       UserToken[]

  teacherProfile Teacher?
  studentProfile Student?

  instruments       UserInstrument[]
  annotations       Annotation[]
  workAnnotations   WorkAnnotation[]
  annotationVotes   AnnotationHelpfulVote[]

  favoriteWorks     FavoriteWork[]
  favoriteComposers FavoriteComposer[]
  favoriteScores    FavoriteScore[]

  wantToLearn       WantToLearn[]
  learned           Learned[]

  createdWorks      Work[]      @relation("UserCreatedWorks")
  createdComposers  Composer[]  @relation("UserCreatedComposers")
  createdScores     WorkScore[] @relation("UserCreatedScores")

  verifiedComposers Composer[]  @relation("VerifiedComposers")

  reportedUploads   UploadModeration[] @relation("ReportedUploads")
  moderatedUploads  UploadModeration[] @relation("ModeratedUploads")
  uploadHistory     UploadHistory[]
  generatedReports  GeneratedReport[]  @relation("GeneratedReports")

  notifications     Notification[]     @relation("UserNotifications")
  schoolActivities  SchoolActivity[]   @relation("UserSchoolActivities")
  achievements      UserAchievement[]  @relation("UserAchievements")
  achievementProgress AchievementProgress[] @relation("AchievementProgress")

  adStats           AdStats[]          @relation("AdStatsUser")
  newsletterSubscription NewsletterSubscriber? @relation("NewsletterSubscriber")

  favoriteComposer  Composer? @relation("FavoriteComposer", fields: [favoriteComposerId], references: [id])
  favoriteEpoch     Epoch?    @relation("FavoriteEpoch", fields: [favoriteEpochId], references: [id])

  @@index([userType])
  @@index([onboardingCompleted])
  @@index([uploadScore])
  @@index([email])
  @@index([role])
}
```

**Enums relacionados:**

```prisma
enum UserType {
  MUSIC_STUDENT
  CASUAL_USER
  PROFESSIONAL
  TEACHER
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

### 1.2 Account - OAuth Providers

```prisma
model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String  // "oauth"
  provider          String  // "google"
  providerAccountId String
  refresh_token     String? @db.String
  access_token      String? @db.String
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.String
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}
```

### 1.3 Session - Sessões Ativas

```prisma
model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([sessionToken])
  @@index([userId])
}
```

### 1.4 UserToken - Tokens de Verificação

```prisma
model UserToken {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  userId    String?   @db.ObjectId // Opcional para tokens anônimos
  type      TokenType
  token     String    @unique
  expiresAt DateTime
  used      Boolean   @default(false)
  metadata  Json?
  ipAddress String?
  userAgent String?

  // Para tokens anônimos (newsletter)
  anonymousEmail String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([type, expiresAt])
  @@index([userId, type])
  @@index([token])
  @@index([anonymousEmail])
}
```

**Enum TokenType:**

```prisma
enum TokenType {
  EMAIL_CONFIRMATION
  PASSWORD_RESET
  NEWSLETTER_CONFIRMATION
  NEWSLETTER_UNSUBSCRIBE
  EMAIL_CHANGE
  TEACHER_INVITATION_ACCEPT
  TEACHER_INVITATION_DECLINE
  STUDENT_INVITATION_ACCEPT
  STUDENT_INVITATION_DECLINE
  STUDENT_INVITATION
}
```

---

## 2. Conteúdo Musical (7 tabelas)

### 2.1 Composer - Compositores

```prisma
model Composer {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  name     String
  fullName String

  // Informações biográficas
  alternativeNames String? // Nomes alternativos/transliterações
  birthDate        String? // "31 de janeiro de 1797"
  deathDate        String? // "28 de novembro de 1828"
  portraitUrl      String?
  bio              String?

  // Classificação
  epochId          String  @db.ObjectId
  epochName        String?
  primaryRoleId    String  @db.ObjectId
  nationality      String?
  instruments      String?

  // Links externos
  permLinkImslp    String?
  imslpId          String?
  wikipediaLink    String?
  videoUrl         String?

  // Metadados IMSLP
  imslpCategories  String?
  pageQuality      String? // "high", "medium", "low"

  // Verificação e qualidade
  dataCompleteness Float? // 0-100
  hasValidImage    Boolean @default(false)
  dataQuality      String? // "high", "medium", "low"
  verificationStatus String? // "verified", "pending", "disputed"
  verifiedBy       String? @db.ObjectId
  verifiedAt       DateTime?
  isVerified       Boolean @default(false)
  verificationNotes String?

  // Auditoria
  createdBy        String? @db.ObjectId
  isCustom         Boolean @default(false)
  lastEditedBy     String? @db.ObjectId
  lastEditedAt     DateTime?
  editHistory      Json?
  lastVerified     DateTime @default(now())

  roles     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  epoch           Epoch              @relation(fields: [epochId], references: [id])
  primaryRole     Role               @relation("PrimaryRole", fields: [primaryRoleId], references: [id])
  works           Work[]
  favoritedBy     FavoriteComposer[]
  favoriteByUsers User[]             @relation("FavoriteComposer")
  createdByUser   User?              @relation("UserCreatedComposers", fields: [createdBy], references: [id], onDelete: Cascade)
  verifier        User?              @relation("VerifiedComposers", fields: [verifiedBy], references: [id], onDelete: SetNull)

  @@index([name])
  @@index([epochId])
  @@index([fullName])
  @@index([alternativeNames])
  @@index([imslpCategories])
  @@index([primaryRoleId])
  @@index([imslpId])
  @@index([nationality])
  @@index([birthDate])
  @@index([deathDate])
  @@index([hasValidImage])
  @@index([name, epochId])
  @@index([epochId, primaryRoleId])
  @@index([nationality, epochId])
  @@index([isVerified])
  @@index([verificationStatus])
  @@index([dataQuality])
}
```

### 2.2 Work - Obras Musicais

```prisma
model Work {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  title            String
  composerId       String   @db.ObjectId
  instrumentId     String   @db.ObjectId
  epochId          String   @db.ObjectId

  // Metadados básicos
  videoUrl         String?
  imslpPermlink    String
  imslpId          String
  opOrCatalog      String?
  compositionYear  String?
  firstPublishDate String?
  tone             String?
  mediaDuration    String?
  workStyle        String?
  moviment         String?
  categoryNames    String[] @default([])
  workGenresArr    String[] @default([])
  dedicateTo       String?
  instrumentation  String?
  workType         WorkType @default(INDIVIDUAL)

  // Estrutura hierárquica
  movementNumber   Int?
  parentWorkId     String? @db.ObjectId

  // Metadados adicionais
  subtitle         String?
  imslpTags        String[] @default([])

  // Sistema de mídia integrado
  spotifyTrackId      String?
  spotifyTrackUrl     String?
  spotifyDisplayTitle String?
  spotifyDuration     Int?
  spotifyArtists      Json?
  spotifyThumbnail    String?

  youtubeVideoId      String?
  youtubeVideoUrl     String?
  youtubeTitle        String?

  customAudioUrl      String?
  customAudioFile     String?
  customAudioSource   String?
  customAudioMetadata Json?

  mediaSource         String? @default("none")
  lastMediaSearch     DateTime?
  mediaSearchError    String?

  // Sistema de videoaula
  videoAulaUrl        String?
  videoAulaFile       String?
  videoAulaTitle      String?
  videoAulaType       String?
  videoAulaSource     String?
  videoAulaAddedBy    String? @db.ObjectId
  videoAulaAddedAt    DateTime?
  videoAulaMetadata   Json?

  // Sistema de dificuldade
  imslpDifficultyLevel  String? // "1", "2", "3"... "12"
  imslpDifficultySystem String? // "IMSLP", "RCM", "ABRSM"
  imslpDifficultyRating String? // "Lvl 1", "RCM Preparatory B"
  imslpSourceId         String?

  difficultyLevel       String?
  difficultySystem      String?
  difficultyRating      String?
  difficultySourceId    String?

  // Verificação e auditoria
  verificationStatus String? // "verified", "pending", "disputed"
  verifiedBy         String? @db.ObjectId
  verifiedAt         DateTime?
  isVerified         Boolean @default(false)

  createdBy          String? @db.ObjectId
  createdByUser      User?   @relation("UserCreatedWorks", fields: [createdBy], references: [id], onDelete: SetNull)
  isCustom           Boolean @default(false)

  lastEditedBy       String? @db.ObjectId
  lastEditedAt       DateTime?
  editHistory        Json?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relacionamentos
  composer           Composer             @relation(fields: [composerId], references: [id], onDelete: Cascade)
  epoch              Epoch                @relation(fields: [epochId], references: [id])
  instrument         Instrument           @relation(fields: [instrumentId], references: [id])
  parentWork         Work?                @relation("WorkCollection", fields: [parentWorkId], references: [id])
  childWorks         Work[]               @relation("WorkCollection")

  favoriteScores     FavoriteScore[]
  scoreFavoriteStats ScoreFavoriteStats[]
  annotations        Annotation[]
  workAnnotations    WorkAnnotation[]
  favoriteBy         FavoriteWork[]
  wantToLearners     WantToLearn[]
  learners           Learned[]
  cachedScores       WorkScore[]

  // Métricas de cache
  annotationsCount        Int       @default(0)
  helpfulAnnotationsCount Int       @default(0)
  lastAnnotationAt        DateTime?

  @@index([title])
  @@index([composerId])
  @@index([imslpId])
  @@index([title, composerId])
  @@index([composerId, title])
  @@index([opOrCatalog, composerId])
  @@index([composerId, instrumentId])
  @@index([composerId, epochId])
  @@index([instrumentId, epochId])
  @@index([composerId, instrumentId, epochId])
  @@index([categoryNames])
  @@index([workGenresArr])
  @@index([parentWorkId])
  @@index([composerId, parentWorkId])
  @@index([mediaSource])
  @@index([spotifyTrackId])
  @@index([youtubeVideoId])
  @@index([difficultyLevel])
  @@index([imslpDifficultyLevel])
}
```

### 2.3 WorkScore - Partituras

```prisma
model WorkScore {
  id       String      @id @default(auto()) @map("_id") @db.ObjectId
  workId   String      @db.ObjectId
  sourceId String      // ID na fonte (IMSLP ID, custom ID)
  source   ScoreSource @default(IMSLP)

  // Dados básicos
  title       String
  downloadUrl String?
  fileSize    String?
  pageCount   String?
  fileFormat  String  @default("PDF")

  // Metadados IMSLP
  editor       String?
  publisher    String?
  copyright    String?
  thumbnailUrl String?
  uploadDate   String?
  uploader     String?
  notes        String?

  // Classificação
  type       IMSLPScoreType @default(SCORES)
  groupIndex Int?           @default(0)
  groupTitle String?

  // Métricas
  rating        Float?
  ratingsCount  Int?
  downloadCount Int?

  // Qualidade e verificação
  dataQuality        String?
  verificationStatus String?
  verifiedBy         String?   @db.ObjectId
  verifiedAt         DateTime?
  isCustom           Boolean   @default(false)
  uploadedBy         String?   // ID do usuário que fez upload
  customData         Json?

  // Status
  isActive         Boolean            @default(true)
  isVerified       Boolean            @default(false)
  lastVerified     DateTime           @default(now())
  lastAccessed     DateTime           @default(now())
  accessCount      Int                @default(0)
  processingStatus ProcessingStatus   @default(PENDING)

  // Cache
  imslpTotalCounts String? // JSON com totais reais do IMSLP

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  work                  Work          @relation(fields: [workId], references: [id], onDelete: Cascade)
  createdByUser         User?         @relation("UserCreatedScores", fields: [uploadedBy], references: [id], onDelete: SetNull)
  wantToLearnSelections WantToLearn[] @relation("WantToLearnSelectedScore")
  learnedSelections     Learned[]     @relation("LearnedSelectedScore")

  @@unique([workId, sourceId, source])
  @@index([workId, isActive])
  @@index([workId, type, groupIndex])
  @@index([source, processingStatus])
  @@index([isActive])
  @@index([lastAccessed, isActive])
  @@index([uploadedBy])
  @@index([dataQuality])
  @@index([verificationStatus])
}
```

### 2.4 Epoch - Períodos Musicais

```prisma
model Epoch {
  id   String @id @default(auto()) @map("_id") @db.ObjectId
  name String

  composers       Composer[]
  works           Work[]
  favoriteByUsers User[]     @relation("FavoriteEpoch")

  @@index([name])
}
```

**Épocas padrão:**

```json
[
  { "name": "Medieval" },
  { "name": "Renaissance" },
  { "name": "Baroque" },
  { "name": "Classical" },
  { "name": "Romantic" },
  { "name": "20th Century" },
  { "name": "Contemporary" },
  { "name": "Modern" },
  { "name": "All Periods" }
]
```

### 2.5 Role - Papéis dos Compositores

```prisma
model Role {
  id   String @id @default(auto()) @map("_id") @db.ObjectId
  name String

  primaryComposers Composer[] @relation("PrimaryRole")

  @@index([name])
}
```

### 2.6 Instrument - Instrumentos

```prisma
model Instrument {
  id         String           @id @default(auto()) @map("_id") @db.ObjectId
  name       String           @unique
  category   String?
  difficulty String?
  createdAt  DateTime         @default(now())

  users          UserInstrument[]
  works          Work[]
  advertisements Advertisement[]

  @@index([category])
  @@index([name])
}
```

### 2.7 WorkGenre - Gêneros Musicais

```prisma
model WorkGenre {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
}
```

---

## 3. Sistema de Favoritos (4 tabelas)

### 3.1 FavoriteWork - Obras Favoritas

```prisma
model FavoriteWork {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  workId String @db.ObjectId

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  work Work @relation(fields: [workId], references: [id], onDelete: Cascade)

  @@unique([userId, workId])
  @@index([userId])
  @@index([workId])
}
```

### 3.2 FavoriteComposer - Compositores Favoritos

```prisma
model FavoriteComposer {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  userId     String @db.ObjectId
  composerId String @db.ObjectId

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  composer Composer @relation(fields: [composerId], references: [id], onDelete: Cascade)

  @@unique([userId, composerId])
  @@index([userId])
  @@index([composerId])
}
```

### 3.3 FavoriteScore - Partituras Favoritas

```prisma
model FavoriteScore {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  userId      String      @db.ObjectId
  workId      String      @db.ObjectId
  scoreId     String      // ID da partitura (WorkScore.sourceId)
  scoreSource ScoreSource @default(IMSLP)

  // Dados da partitura no momento do favorito
  scoreTitle  String
  scoreType   IMSLPScoreType
  downloadUrl String?
  fileSize    String?
  pageCount   String?

  // Metadados do favorito
  notes        String?   // Notas pessoais
  tags         String[]  @default([])
  addedAt      DateTime  @default(now())
  lastAccessed DateTime  @default(now())
  accessCount  Int       @default(0)

  // Avaliação pessoal
  personalRating Int? // 1-5 estrelas

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  work Work @relation(fields: [workId], references: [id], onDelete: Cascade)

  @@unique([userId, workId, scoreId, scoreSource])
  @@index([userId, workId])
  @@index([workId, scoreId])
  @@index([scoreSource, scoreType])
  @@index([addedAt])
  @@index([personalRating])
}
```

### 3.4 ScoreFavoriteStats - Estatísticas de Favoritos

```prisma
model ScoreFavoriteStats {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  workId      String      @db.ObjectId
  scoreId     String
  scoreSource ScoreSource @default(IMSLP)

  // Estatísticas
  totalFavorites Int       @default(0)
  avgRating      Float?    // Média das avaliações pessoais
  lastFavorited  DateTime?

  // Cache das informações da partitura
  scoreTitle  String
  scoreType   IMSLPScoreType
  downloadUrl String?

  lastUpdated DateTime @default(now())

  work Work @relation(fields: [workId], references: [id], onDelete: Cascade)

  @@unique([workId, scoreId, scoreSource])
  @@index([workId, totalFavorites])
  @@index([scoreSource, totalFavorites])
  @@index([avgRating])
}
```

---

## 4. Sistema de Aprendizado (3 tabelas)

### 4.1 WantToLearn - Lista "Quero Aprender"

```prisma
model WantToLearn {
  id       String   @id @default(auto()) @map("_id") @db.ObjectId
  userId   String   @db.ObjectId
  workId   String   @db.ObjectId
  priority Int      @default(0)
  addedAt  DateTime @default(now())

  // Metadados de aprendizado
  notes              String?
  targetDate         DateTime?
  estimatedStudyTime Int?
  difficulty         DifficultyLevel?
  reminder           Boolean          @default(false)
  reminderFrequency  String?
  motivation         String?
  context            String?
  progressMilestones Json? // Milestones por instrumento
  progress           Float? @default(0) // 0-100%

  // Partitura selecionada
  selectedWorkScoreId String?    @db.ObjectId
  selectedWorkScore   WorkScore? @relation("WantToLearnSelectedScore", fields: [selectedWorkScoreId], references: [id], onDelete: SetNull)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  work Work @relation(fields: [workId], references: [id], onDelete: Cascade)

  @@unique([userId, workId])
  @@index([userId, priority])
  @@index([targetDate])
  @@index([selectedWorkScoreId])
  @@index([userId, addedAt])
  @@index([progress])
}
```

### 4.2 Learned - Lista "Já Aprendi"

```prisma
model Learned {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  workId    String   @db.ObjectId
  learnedAt DateTime @default(now())
  mastery   Int      @default(0) // 1-5

  // Dados do processo de aprendizado
  studyStartDate      DateTime?
  studyDuration       Int?       // dias
  notes               String?
  wouldRecommend      Boolean    @default(true)
  publicPerformance   Boolean    @default(false)
  lastPracticed       DateTime?
  difficulty          DifficultyLevel?
  enjoyment           Int?       // 1-5
  technicalChallenges String?
  musicalInsights     String?
  performanceCount    Int        @default(0)
  bestPerformance     String?

  // Sistema de vídeo de performance
  videoUrl        String?   // URL/caminho do vídeo
  videoFileName   String?   // Nome do arquivo original
  videoFilePath   String?   // Caminho completo no servidor
  videoFileSize   Int?      // Tamanho em bytes
  isVideoPublic   Boolean   @default(false)
  videoUploadedAt DateTime?

  // Partitura selecionada
  selectedWorkScoreId String?    @db.ObjectId
  selectedWorkScore   WorkScore? @relation("LearnedSelectedScore", fields: [selectedWorkScoreId], references: [id], onDelete: SetNull)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  work Work @relation(fields: [workId], references: [id], onDelete: Cascade)

  @@unique([userId, workId])
  @@index([userId, mastery])
  @@index([learnedAt])
  @@index([lastPracticed])
  @@index([selectedWorkScoreId])
  @@index([mastery])
  @@index([isVideoPublic])
}
```

### 4.3 UserInstrument - Instrumentos do Usuário

```prisma
model UserInstrument {
  id           String @id @default(auto()) @map("_id") @db.ObjectId
  userId       String @db.ObjectId
  instrumentId String @db.ObjectId

  level      DifficultyLevel @default(BEGINNER)
  isPrimary  Boolean         @default(false)
  isLearning Boolean         @default(true)
  startedAt  DateTime        @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  instrument Instrument @relation(fields: [instrumentId], references: [id], onDelete: Cascade)

  @@unique([userId, instrumentId])
  @@index([userId, isPrimary])
  @@index([instrumentId])
}
```

---

## 5. Sistema de Anotações (3 tabelas)

### 5.1 Annotation - Anotações Simples

```prisma
model Annotation {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  workId    String   @db.ObjectId
  content   String
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  work Work @relation(fields: [workId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([workId])
  @@index([isPublic])
  @@index([createdAt])
}
```

### 5.2 WorkAnnotation - Anotações Avançadas

```prisma
model WorkAnnotation {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  workId String @db.ObjectId

  // Conteúdo
  title    String
  content  String
  category AnnotationCategory @default(GENERAL)

  // Localização na obra
  scope        AnnotationScope @default(ENTIRE_WORK)
  measureStart Int?            // Compasso inicial
  measureEnd   Int?            // Compasso final
  movement     String?         // Nome do movimento
  section      String?         // Nome da seção
  pageNumber   Int?            // Página da partitura

  // Metadata musical
  hand       String? // "left", "right", "both"
  voice      String? // "soprano", "alto", "tenor", "bass"
  instrument String? // Instrumento específico

  // Classificação
  difficulty AnnotationDifficulty @default(ALL_LEVELS)
  tags       String[]             @default([])

  // Interação social
  isPublic     Boolean @default(true)
  isVerified   Boolean @default(false)
  helpfulCount Int     @default(0)
  viewCount    Int     @default(0)

  // Moderação
  isFlagged   Boolean   @default(false)
  flagReason  String?
  moderatedBy String?   @db.ObjectId
  moderatedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  user         User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  work         Work                    @relation(fields: [workId], references: [id], onDelete: Cascade)
  helpfulVotes AnnotationHelpfulVote[]

  @@index([workId, isPublic, category])
  @@index([workId, scope, measureStart])
  @@index([userId, createdAt])
  @@index([category, difficulty])
  @@index([isPublic, helpfulCount])
  @@index([tags])
  @@index([isVerified, isPublic])
}
```

### 5.3 AnnotationHelpfulVote - Votos em Anotações

```prisma
model AnnotationHelpfulVote {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  annotationId String   @db.ObjectId
  isHelpful    Boolean  @default(true)
  createdAt    DateTime @default(now())

  user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  annotation WorkAnnotation @relation(fields: [annotationId], references: [id], onDelete: Cascade)

  @@unique([userId, annotationId])
  @@index([annotationId, isHelpful])
  @@index([userId])
}
```

**Enums relacionados:**

```prisma
enum AnnotationCategory {
  TECHNIQUE     // Técnica
  INTERPRETATION // Interpretação
  THEORY        // Teoria
  PRACTICE_TIP  // Dicas de estudo
  PERFORMANCE   // Performance
  HISTORICAL    // Contexto histórico
  GENERAL       // Anotação geral
}

enum AnnotationDifficulty {
  BEGINNER      // Para iniciantes
  INTERMEDIATE  // Para nível intermediário
  ADVANCED      // Para avançados
  ALL_LEVELS    // Para todos os níveis
}

enum AnnotationScope {
  SPECIFIC_MEASURE // Compasso específico
  SECTION         // Seção da obra
  MOVEMENT        // Movimento inteiro
  ENTIRE_WORK     // Obra inteira
}
```

---

## 6. Sistema Professor-Aluno (6 tabelas)

### 6.1 Teacher - Perfis de Professores

```prisma
model Teacher {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @unique @db.ObjectId

  // Informações profissionais
  bio          String?
  specialties  String[] @default([]) // ["Piano", "Violão", "Teoria"]
  instruments  String[] @default([]) // Instrumentos que ensina
  experience   String?              // "10 anos", "Desde 2015"
  education    String?              // Formação acadêmica
  achievements String?              // Conquistas, prêmios

  // Perfil público
  isPublicProfile  Boolean  @default(false)
  profileImage     String?
  website          String?
  socialMedia      Json?    // {"instagram": "@professor"}
  publicBio        String?  // Bio específica para perfil público
  highlightedWorks String[] @default([])

  // Configurações de ensino
  defaultLessonDuration Int    @default(60) // minutos
  maxStudentsPerWeek    Int    @default(50)
  timezone              String @default("America/Sao_Paulo")

  // Metodologia
  teachingMethod String?   // Descrição da metodologia
  ageGroups      String[]  @default([]) // ["Crianças", "Adultos"]
  skillLevels    String[]  @default([]) // ["Iniciante", "Intermediário"]

  // Status e aprovação
  status     TeacherStatus @default(PENDING)
  isVerified Boolean       @default(false)
  verifiedAt DateTime?
  verifiedBy String?       @db.ObjectId

  // Configurações
  allowProgressReports Boolean @default(true)
  reportPreferences    Json?

  // Métricas
  totalStudents  Int    @default(0)
  totalLessons   Int    @default(0)
  averageRating  Float? @default(0)
  totalReviews   Int    @default(0)
  completionRate Float? @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  user     User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  students TeacherStudent[] @relation("TeacherStudents")
  lessons  Lesson[]         @relation("TeacherLessons")
  reviews  TeacherReview[]  @relation("TeacherReviews")

  @@index([status, isVerified])
  @@index([isPublicProfile])
  @@index([instruments])
  @@index([specialties])
  @@index([averageRating])
}
```

### 6.2 Student - Perfis de Alunos

```prisma
model Student {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @unique @db.ObjectId

  // Informações do aluno
  level             DifficultyLevel @default(BEGINNER)
  mainInstrument    String?
  musicalGoals      String?
  preferredGenres   String[]        @default([])
  musicalBackground String?

  // Configurações de privacidade
  allowPublicProgress Boolean @default(false)
  allowProgressShare  Boolean @default(true)
  allowWhatsappMensage Boolean @default(false)
  profileVisibility   String  @default("teacher_only")

  // Informações de estudo
  practiceTime     Int?  // minutos semanais
  practiceSchedule Json? // Horários preferidos
  learningPace     String? // "slow", "medium", "fast"
  specialNeeds     String?

  // Status
  status         StudentStatus @default(ACTIVE)
  enrollmentDate DateTime      @default(now())
  lastLessonAt   DateTime?
  lastActiveAt   DateTime?     @default(now())

  // Configurações de comunicação
  preferredContact    String @default("whatsapp")
  reminderPreferences Json?

  // Métricas de progresso
  totalLessonsAttended Int    @default(0)
  totalAssignments     Int    @default(0)
  completedAssignments Int    @default(0)
  currentStreak        Int    @default(0)
  longestStreak        Int    @default(0)
  progressScore        Float? @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  teachers    TeacherStudent[] @relation("StudentTeachers")
  lessons     Lesson[]         @relation("StudentLessons")
  reviews     TeacherReview[]  @relation("StudentReviews")
  assignments Assignment[]     @relation("StudentAssignments")

  @@index([status, lastActiveAt])
  @@index([level, mainInstrument])
  @@index([allowPublicProgress])
  @@index([enrollmentDate])
}
```

### 6.3 TeacherStudent - Relacionamento

```prisma
model TeacherStudent {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  teacherId String @db.ObjectId
  studentId String @db.ObjectId

  // Configurações da relação
  maxLessonsPerWeek Int      @default(1)
  lessonDuration    Int      @default(60)
  preferredDays     String[] @default([])
  preferredTimes    String[] @default([])

  // Status
  isActive    Boolean   @default(true)
  startDate   DateTime  @default(now())
  endDate     DateTime?
  pausedAt    DateTime?
  pauseReason String?

  // Planejamento pedagógico
  learningPlan String?   // Plano de estudos
  currentFocus String[]  @default([])
  nextGoals    String?
  teacherNotes String?   // Notas privadas
  studentNotes String?   // Notas visíveis

  // Configurações específicas
  homeworkFrequency String @default("weekly")
  reportFrequency   String @default("monthly")

  // Métricas
  totalLessons      Int    @default(0)
  completedLessons  Int    @default(0)
  cancelledLessons  Int    @default(0)
  noShowLessons     Int    @default(0)
  relationshipScore Float? @default(0)

  // Status do convite
  inviteStatus     StudentInviteStatus @default(PENDING)
  inviteAcceptedAt DateTime?
  inviteDeclinedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teacher Teacher @relation("TeacherStudents", fields: [teacherId], references: [id], onDelete: Cascade)
  student Student @relation("StudentTeachers", fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([teacherId, studentId])
  @@index([teacherId, isActive])
  @@index([studentId, isActive])
  @@index([startDate, endDate])
  @@index([inviteStatus])
}
```

### 6.4 Lesson - Aulas

```prisma
model Lesson {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  teacherId String @db.ObjectId
  studentId String @db.ObjectId

  // Informações básicas
  title       String
  description String?
  objectives  String[] @default([])

  // Agendamento
  scheduledAt     DateTime
  duration        Int       @default(60)
  actualStartTime DateTime?
  actualEndTime   DateTime?

  // Status e tipo
  status   LessonStatus @default(SCHEDULED)
  type     LessonType   @default(INDIVIDUAL)
  location String?      // "Online", "Estúdio A", "Casa do aluno"

  // Sistema de recorrência
  isRecurring    Boolean        @default(false)
  recurrenceType RecurrenceType @default(NONE)
  parentLessonId String?        @db.ObjectId
  recurrenceEnd  DateTime?

  // Conteúdo e materiais
  workScoreIds String[] @default([]) @db.ObjectId
  worksIds     String[] @default([]) @db.ObjectId
  topics       String[] @default([])
  techniques   String[] @default([])
  repertoire   String[] @default([])

  // Homework e tarefas
  homework       String?   // Lição de casa geral
  practiceGoals  String[]  @default([])
  nextLessonPrep String?

  // Anotações e feedback
  teacherNotes    String? // Notas privadas
  publicNotes     String? // Notas visíveis
  studentFeedback String? // Feedback do aluno
  lessonSummary   String? // Resumo da aula

  // Avaliação e progresso
  studentProgress Json?    // Progresso específico
  skillsWorked    String[] @default([])
  improvements    String[] @default([])
  challenges      String[] @default([])

  // Presença
  studentPresent Boolean? // null = não marcado
  punctuality    String?  // "on_time", "late", "early"
  engagement     Int?     // 1-5
  preparation    Int?     // 1-5

  // Cancelamento/reagendamento
  cancelledAt      DateTime?
  cancelReason     String?
  cancelledBy      String?   // "teacher", "student", "system"
  rescheduledFrom  DateTime?
  rescheduleReason String?

  // Mídia e recursos
  audioRecordings String[] @default([])
  videoRecordings String[] @default([])
  documents       String[] @default([])
  images          String[] @default([])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  teacher      Teacher      @relation("TeacherLessons", fields: [teacherId], references: [id], onDelete: Cascade)
  student      Student      @relation("StudentLessons", fields: [studentId], references: [id], onDelete: Cascade)
  parentLesson Lesson?      @relation("LessonSeries", fields: [parentLessonId], references: [id])
  childLessons Lesson[]     @relation("LessonSeries")
  assignments  Assignment[] @relation("LessonAssignments")

  @@index([teacherId, scheduledAt])
  @@index([studentId, scheduledAt])
  @@index([scheduledAt, status])
  @@index([isRecurring, recurrenceType])
  @@index([status, type])
  @@index([teacherId, studentId, scheduledAt])
}
```

### 6.5 Assignment - Tarefas

```prisma
model Assignment {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  lessonId  String @db.ObjectId
  studentId String @db.ObjectId

  // Informações da tarefa
  title       String
  description String
  type        String @default("practice")
  priority    String @default("medium")

  // Recursos e materiais
  workScoreIds String[] @default([]) @db.ObjectId
  worksIds     String[] @default([]) @db.ObjectId
  exercises    String[] @default([])

  // Metas específicas
  practiceGoals  String[] @default([])
  tempoTargets   Json?
  technicalGoals String[] @default([])
  musicalGoals   String[] @default([])

  // Status e prazos
  status        AssignmentStatus @default(PENDING)
  dueDate       DateTime?
  estimatedTime Int?             // minutos
  actualTime    Int?             // minutos gastos

  // Progresso
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  progress    Float?    @default(0) // 0-100%

  // Feedback e avaliação
  teacherFeedback String? // Feedback do professor
  teacherRating   Int?    // 1-5
  studentNotes    String? // Notas do aluno
  studentRating   Int?    // 1-5 dificuldade percebida

  // Submissões do aluno
  submissions    Json?     // Gravações, fotos, etc.
  submissionDate DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lesson  Lesson  @relation("LessonAssignments", fields: [lessonId], references: [id], onDelete: Cascade)
  student Student @relation("StudentAssignments", fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId, status])
  @@index([studentId, dueDate])
  @@index([lessonId, status])
  @@index([status, dueDate])
  @@index([type, priority])
}
```

### 6.6 TeacherReview - Avaliações

```prisma
model TeacherReview {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  teacherId String @db.ObjectId
  studentId String @db.ObjectId

  // Avaliação básica
  rating   Int     // 1-5 estrelas
  comment  String?
  isPublic Boolean @default(true)

  // Avaliações específicas
  teachingQuality Int? // 1-5
  communication   Int? // 1-5
  punctuality     Int? // 1-5
  preparation     Int? // 1-5
  patience        Int? // 1-5
  motivation      Int? // 1-5

  // Contexto
  relationshipDuration String? // "1 mês", "6 meses"
  lessonsCount         Int?
  wouldRecommend       Boolean @default(true)

  // Moderação
  isModerated    Boolean   @default(false)
  moderatedBy    String?   @db.ObjectId
  moderatedAt    DateTime?
  moderationNote String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teacher Teacher @relation("TeacherReviews", fields: [teacherId], references: [id], onDelete: Cascade)
  student Student @relation("StudentReviews", fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([teacherId, studentId])
  @@index([teacherId, isPublic])
  @@index([rating, createdAt])
  @@index([isModerated])
}
```

---

## 7. Estratégias de Cascade e Performance

### 7.1 Cascade Deletes (Críticos)

```prisma
// User CASCADE - Remove todos os dados do usuário
User → Account (CASCADE)
User → Session (CASCADE)
User → UserToken (CASCADE)
User → UserInstrument (CASCADE)
User → Annotation (CASCADE)
User → WorkAnnotation (CASCADE)
User → AnnotationHelpfulVote (CASCADE)
User → FavoriteWork/Composer/Score (CASCADE)
User → WantToLearn/Learned (CASCADE)
User → Teacher/Student (CASCADE)
User → Lesson (CASCADE)
User → Assignment (CASCADE)
User → Notification (CASCADE)
User → SchoolActivity (CASCADE)
User → UserAchievement (CASCADE)

// Composer CASCADE - Remove obras do compositor
Composer → Work (CASCADE)

// Work CASCADE - Remove partituras da obra
Work → WorkScore (CASCADE)
Work → Annotation (CASCADE)
Work → WorkAnnotation (CASCADE)
Work → FavoriteWork (CASCADE)
Work → WantToLearn (CASCADE)
Work → Learned (CASCADE)
```

### 7.2 SetNull (Preservação de Dados)

```prisma
// Preserva conteúdo quando usuário é deletado
User → createdWorks (SetNull)
User → createdComposers (SetNull)
User → createdScores (SetNull)
User → verifiedComposers (SetNull)

// Preserva seleções quando partitura é deletada
WorkScore → wantToLearnSelections (SetNull)
WorkScore → learnedSelections (SetNull)
```

### 7.3 Índices de Performance

```prisma
// Índices compostos para queries complexas
@@index([composerId, instrumentId, epochId]) // Work
@@index([userId, status, createdAt])         // Notification
@@index([workId, isPublic, category])        // WorkAnnotation
@@index([teacherId, studentId, scheduledAt]) // Lesson

// Índices de busca
@@index([name])           // Composer
@@index([title])          // Work
@@index([email])          // User
@@index([sessionToken])   // Session

// Índices de filtro
@@index([isActive])       // WorkScore
@@index([isPublic])       // WorkAnnotation
@@index([status])         // Lesson/Assignment
@@index([priority])       // Assignment
```

### 7.4 Otimizações de Query

```typescript
// Eager loading com include
const workWithDetails = await prisma.work.findUnique({
  where: { id: workId },
  include: {
    composer: true,
    instrument: true,
    epoch: true,
    cachedScores: {
      where: { isActive: true },
      take: 10,
    },
    workAnnotations: {
      where: { isPublic: true },
      include: {
        user: {
          select: { firstName: true, image: true },
        },
      },
      take: 5,
    },
  },
});

// Pagination otimizada
const works = await prisma.work.findMany({
  where: composerId ? { composerId } : undefined,
  include: {
    composer: { select: { name: true } },
    instrument: { select: { name: true } },
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});

// Aggregation para estatísticas
const stats = await prisma.user.aggregate({
  _count: { id: true },
  _avg: { uploadScore: true },
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  },
});
```

---

## 8. Comandos Úteis do Prisma

### 8.1 Desenvolvimento

```bash
# Gerar cliente
npx prisma generate

# Aplicar mudanças no schema
npx prisma db push

# Visualizar dados
npx prisma studio

# Validar schema
npx prisma validate

# Formatar schema
npx prisma format
```

### 8.2 Produção

```bash
# Deploy de migrações (SQL databases)
npx prisma migrate deploy

# Reset completo (CUIDADO!)
npx prisma migrate reset

# Status das migrações
npx prisma migrate status
```

### 8.3 Debugging

```bash
# Debug de queries
DEBUG="prisma*" npm run dev

# Logs detalhados
DATABASE_URL="..." npx prisma db push --accept-data-loss
```

---

## 9. Backup e Restore

### 9.1 Backup MongoDB

```bash
# Backup completo
docker exec opus-atlas-mongodb-prod mongodump \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --gzip \
  --out /data/backup-$(date +%Y%m%d)

# Backup específico
docker exec opus-atlas-mongodb-prod mongodump \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --collection User \
  --out /data/backup-users
```

### 9.2 Restore MongoDB

```bash
# Restore completo
docker exec opus-atlas-mongodb-prod mongorestore \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --gzip \
  /data/backup-20241201

# Restore específico
docker exec opus-atlas-mongodb-prod mongorestore \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --collection User \
  /data/backup-users/opus_atlas_prod/User.bson
```

---

## Conclusão

O schema do Opus Atlas foi projetado para ser:

- **Escalável**: Suporta milhões de registros com índices otimizados
- **Consistente**: Relacionamentos claros com cascade adequado
- **Performante**: Queries otimizadas e cache inteligente
- **Flexível**: Extensível para novas funcionalidades
- **Seguro**: Cascade deletes protegem integridade dos dados

O banco suporta desde usuários individuais até instituições educacionais com milhares de alunos e professores, mantendo performance e consistência.
