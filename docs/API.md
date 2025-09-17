# Documentação Completa das APIs - Opus Atlas

Este documento detalha todas as 124 rotas de API do Opus Atlas, organizadas por módulo com exemplos de uso e respostas.

## Visão Geral

### Estatísticas das APIs

- **124 rotas** implementadas
- **REST** + **GraphQL-like** queries
- **Rate limiting** integrado
- **Cache Redis** automático
- **Validação Prisma** em todas as rotas

### Base URL

- **Desenvolvimento**: `http://localhost:3000/api`
- **Produção**: `https://opusatlas.com.br/api`

### Autenticação

```bash
# NextAuth.js Session Cookie
Authorization: Bearer <jwt-token>

# Ou Header customizado
X-Auth-Token: <session-token>
```

---

## 1. APIs de Autenticação (7 rotas)

### 1.1 NextAuth.js Handler

```http
GET/POST /api/auth/[...nextauth]
```

**Providers disponíveis:**

- Google OAuth 2.0
- Email/Password (credenciais)

**Exemplo Google OAuth:**

```bash
# Redirect para Google
GET /api/auth/signin/google

# Callback do Google
GET /api/auth/callback/google?code=...&state=...
```

### 1.2 Verificação de Status do Email

```http
POST /api/auth/check-email-status
```

**Request:**

```json
{
  "email": "usuario@example.com"
}
```

**Response:**

```json
{
  "exists": true,
  "verified": true,
  "provider": "google",
  "lastLogin": "2024-12-01T10:30:00Z"
}
```

### 1.3 Esqueci Minha Senha

```http
POST /api/auth/forgot-password
```

**Request:**

```json
{
  "email": "usuario@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email de recuperação enviado",
  "expiresAt": "2024-12-01T11:30:00Z"
}
```

### 1.4 Reset de Senha

```http
POST /api/auth/reset-password
```

**Request:**

```json
{
  "token": "reset-token-uuid",
  "password": "nova-senha-segura",
  "confirmPassword": "nova-senha-segura"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

### 1.5 Confirmação de Conta

```http
GET /api/auth/confirm-account/[token]
```

**Response:**

```json
{
  "success": true,
  "message": "Conta verificada com sucesso",
  "user": {
    "id": "user-id",
    "email": "usuario@example.com",
    "verified": true
  }
}
```

### 1.6 Confirmação de Mudança de Email

```http
GET /api/auth/confirm-email-change/[token]
```

**Response:**

```json
{
  "success": true,
  "message": "Email alterado com sucesso",
  "newEmail": "novo@example.com"
}
```

---

## 2. APIs de Usuários e Perfis (15 rotas)

### 2.1 Perfil do Usuário

```http
GET    /api/profile/cascade-info
PUT    /api/profile/cascade-info
```

**GET Response:**

```json
{
  "user": {
    "id": "cm123456789",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@example.com",
    "image": "https://cloudinary.com/image.jpg",
    "bio": "Pianista clássico",
    "userType": "MUSIC_STUDENT",
    "experienceLevel": "INTERMEDIATE",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "phone": "+5511999999999"
  },
  "instruments": [
    {
      "id": "inst1",
      "name": "Piano",
      "level": "INTERMEDIATE",
      "isPrimary": true,
      "startedAt": "2020-01-01T00:00:00Z"
    }
  ],
  "favoriteComposer": {
    "id": "comp1",
    "name": "Johann Sebastian Bach"
  },
  "favoriteEpoch": {
    "id": "epoch1",
    "name": "Baroque"
  }
}
```

**PUT Request:**

```json
{
  "firstName": "João",
  "lastName": "Silva Santos",
  "bio": "Pianista clássico especializado em período romântico",
  "phone": "+5511888888888",
  "city": "Rio de Janeiro",
  "experienceLevel": "ADVANCED"
}
```

### 2.2 APIs do Estudante

#### Dashboard do Estudante

```http
GET /api/student/dashboard
```

**Response:**

```json
{
  "stats": {
    "totalLessons": 24,
    "upcomingLessons": 3,
    "studyHours": 48,
    "currentStreak": 7,
    "completedAssignments": 18,
    "totalAssignments": 22
  },
  "recentLessons": [
    {
      "id": "lesson1",
      "title": "Técnica de Escalas",
      "date": "2024-11-30T14:00:00Z",
      "status": "COMPLETED",
      "teacher": "Prof. Maria"
    }
  ],
  "todayLessons": [
    {
      "id": "lesson2",
      "title": "Sonata em Dó Maior",
      "time": "15:00",
      "teacher": "Prof. Maria"
    }
  ],
  "activeStudies": [
    {
      "workId": "work1",
      "title": "Prelúdio em Dó Maior BWV 846",
      "composer": "J.S. Bach",
      "progress": 75,
      "targetDate": "2024-12-15"
    }
  ]
}
```

#### Calendário do Estudante

```http
GET /api/student/calendar
```

**Query Parameters:**

```
?month=2024-12&view=month
?start=2024-12-01&end=2024-12-31
```

**Response:**

```json
{
  "events": [
    {
      "id": "lesson1",
      "title": "Aula de Piano",
      "start": "2024-12-01T14:00:00Z",
      "end": "2024-12-01T15:00:00Z",
      "type": "lesson",
      "status": "SCHEDULED",
      "teacher": "Prof. Maria",
      "location": "Sala 101"
    },
    {
      "id": "assignment1",
      "title": "Praticar Escalas",
      "start": "2024-12-02T00:00:00Z",
      "type": "assignment",
      "status": "PENDING",
      "dueDate": "2024-12-05T23:59:59Z"
    }
  ],
  "summary": {
    "totalLessons": 8,
    "totalAssignments": 5,
    "completedTasks": 3
  }
}
```

#### Progresso do Estudante

```http
GET /api/student/progress
```

**Response:**

```json
{
  "overview": {
    "totalStudyTime": 120, // horas
    "worksLearned": 15,
    "averageMastery": 4.2,
    "publicPerformances": 3
  },
  "monthlyProgress": [
    {
      "month": "2024-11",
      "lessonsCompleted": 8,
      "studyHours": 24,
      "worksLearned": 2
    }
  ],
  "skillDevelopment": {
    "technique": 85,
    "musicality": 78,
    "sight_reading": 65,
    "memorization": 90
  },
  "recentAchievements": [
    {
      "id": "achievement1",
      "name": "Perfeccionista",
      "description": "Manteve maestria média de 4.5+",
      "unlockedAt": "2024-11-28T10:00:00Z",
      "xp": 50
    }
  ]
}
```

#### Notificações do Estudante

```http
GET    /api/student/notifications
POST   /api/student/notifications/mark-all-read
POST   /api/student/notifications/[id]/mark-read
POST   /api/student/notifications/[id]/mark-shown
GET    /api/student/notifications/check
```

**GET Response:**

```json
{
  "notifications": [
    {
      "id": "notif1",
      "type": "LESSON_STARTING_SOON",
      "priority": "HIGH",
      "title": "Aula começando em 30 minutos",
      "message": "Sua aula de piano com Prof. Maria começará às 14:00",
      "actionText": "Ver Detalhes",
      "actionUrl": "/student/lessons/lesson1",
      "createdAt": "2024-12-01T13:30:00Z",
      "status": "UNREAD"
    }
  ],
  "unreadCount": 3,
  "hasHighPriority": true
}
```

### 2.3 APIs do Professor

#### Dashboard do Professor

```http
GET /api/teacher/dashboard
```

**Response:**

```json
{
  "stats": {
    "totalStudents": 12,
    "activeStudents": 10,
    "todayLessons": 5,
    "thisWeekLessons": 32,
    "pendingAssignments": 8,
    "completedLessons": 156
  },
  "todaySchedule": [
    {
      "id": "lesson1",
      "time": "14:00",
      "duration": 60,
      "student": "João Silva",
      "topic": "Sonata K. 331",
      "status": "SCHEDULED"
    }
  ],
  "recentActivities": [
    {
      "type": "ASSIGNMENT_SUBMISSION",
      "student": "Maria Santos",
      "assignment": "Prática de Escalas",
      "timestamp": "2024-11-30T16:30:00Z"
    }
  ],
  "studentsOverview": [
    {
      "id": "student1",
      "name": "João Silva",
      "nextLesson": "2024-12-01T14:00:00Z",
      "progress": 85,
      "status": "ACTIVE"
    }
  ]
}
```

#### Gestão de Estudantes

```http
GET    /api/teacher/students
POST   /api/teacher/students/[studentId]/resend-invite
GET    /api/teacher/students/search
```

**GET /api/teacher/students Response:**

```json
{
  "students": [
    {
      "id": "student1",
      "user": {
        "firstName": "João",
        "lastName": "Silva",
        "email": "joao@example.com",
        "image": "https://cloudinary.com/avatar.jpg"
      },
      "level": "INTERMEDIATE",
      "mainInstrument": "Piano",
      "enrollmentDate": "2024-01-15T00:00:00Z",
      "totalLessons": 24,
      "completionRate": 92,
      "nextLesson": "2024-12-01T14:00:00Z",
      "status": "ACTIVE"
    }
  ],
  "totalCount": 12,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

#### Calendário do Professor

```http
GET /api/teacher/calendar
```

**Response:**

```json
{
  "events": [
    {
      "id": "lesson1",
      "title": "João Silva - Piano Intermediário",
      "start": "2024-12-01T14:00:00Z",
      "end": "2024-12-01T15:00:00Z",
      "type": "lesson",
      "student": {
        "id": "student1",
        "name": "João Silva"
      },
      "status": "SCHEDULED",
      "isRecurring": true,
      "location": "Sala 101"
    }
  ],
  "conflicts": [],
  "availability": {
    "busySlots": 25,
    "availableSlots": 15,
    "utilizationRate": 62.5
  }
}
```

---

## 3. APIs de Conteúdo Musical (35 rotas)

### 3.1 Compositores

#### Listar Compositores

```http
GET /api/composers
```

**Query Parameters:**

```
?search=bach
?epoch=baroque
?role=composer
?page=1&limit=50
?sortBy=name&sortOrder=asc
```

**Response:**

```json
{
  "composers": [
    {
      "id": "comp1",
      "name": "Johann Sebastian Bach",
      "fullName": "Johann Sebastian Bach",
      "birthDate": "21 de março de 1685",
      "deathDate": "28 de julho de 1750",
      "portraitUrl": "https://cloudinary.com/bach-portrait.jpg",
      "epochName": "Baroque",
      "nationality": "German",
      "totalWorks": 1128,
      "isVerified": true,
      "permLinkImslp": "https://imslp.org/wiki/Category:Bach,_Johann_Sebastian"
    }
  ],
  "totalCount": 19177,
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 384
  },
  "filters": {
    "epochs": ["Baroque", "Classical", "Romantic"],
    "nationalities": ["German", "Austrian", "Italian"],
    "roles": ["Composer", "Pianist", "Conductor"]
  }
}
```

#### Detalhes do Compositor

```http
GET /api/composers/[composerId]
```

**Response:**

```json
{
  "id": "comp1",
  "name": "Johann Sebastian Bach",
  "fullName": "Johann Sebastian Bach",
  "alternativeNames": "J.S. Bach, Bach",
  "birthDate": "21 de março de 1685",
  "deathDate": "28 de julho de 1750",
  "portraitUrl": "https://cloudinary.com/bach-portrait.jpg",
  "bio": "Johann Sebastian Bach foi um compositor e músico alemão do período Barroco...",
  "epoch": {
    "id": "epoch1",
    "name": "Baroque"
  },
  "primaryRole": {
    "id": "role1",
    "name": "Composer"
  },
  "nationality": "German",
  "instruments": "Organ, Harpsichord, Violin",
  "permLinkImslp": "https://imslp.org/wiki/Category:Bach,_Johann_Sebastian",
  "wikipediaLink": "https://en.wikipedia.org/wiki/Johann_Sebastian_Bach",
  "totalWorks": 1128,
  "isVerified": true,
  "verifiedBy": "admin",
  "verifiedAt": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "stats": {
    "totalFavorites": 1542,
    "totalAnnotations": 856,
    "viewsLastMonth": 12431
  }
}
```

#### Criar Compositor

```http
POST /api/composers
```

**Request:**

```json
{
  "name": "Wolfgang Amadeus Mozart",
  "fullName": "Wolfgang Amadeus Mozart",
  "birthDate": "27 de janeiro de 1756",
  "deathDate": "5 de dezembro de 1791",
  "epochId": "classical-epoch-id",
  "primaryRoleId": "composer-role-id",
  "nationality": "Austrian",
  "permLinkImslp": "https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus",
  "extractFromImslp": true // Fazer scraping automático
}
```

#### Verificar Compositor

```http
POST /api/composers/[composerId]/verify
```

**Request:**

```json
{
  "verified": true,
  "verificationNotes": "Dados conferidos e validados com fontes oficiais"
}
```

#### Gerar Biografia com IA

```http
POST /api/composer/[composerId]/generate-bio
```

**Request:**

```json
{
  "provider": "openai", // ou "groq"
  "language": "pt-BR",
  "length": "medium", // short, medium, long
  "includeWorks": true
}
```

**Response:**

```json
{
  "bio": "Johann Sebastian Bach (1685-1750) foi um compositor e músico alemão...",
  "wordCount": 245,
  "generatedAt": "2024-12-01T10:30:00Z",
  "provider": "openai",
  "model": "gpt-3.5-turbo"
}
```

### 3.2 Obras Musicais

#### Listar Obras

```http
GET /api/works
```

**Query Parameters:**

```
?search=prelude
?composerId=comp1
?instrumentId=piano
?epochId=baroque
?difficulty=INTERMEDIATE
?type=INDIVIDUAL
?page=1&limit=50
```

**Response:**

```json
{
  "works": [
    {
      "id": "work1",
      "title": "Prelúdio em Dó Maior BWV 846",
      "composer": {
        "id": "comp1",
        "name": "Johann Sebastian Bach"
      },
      "instrument": {
        "id": "piano",
        "name": "Piano"
      },
      "epoch": {
        "id": "baroque",
        "name": "Baroque"
      },
      "opOrCatalog": "BWV 846",
      "compositionYear": "1722",
      "tone": "C Major",
      "workType": "INDIVIDUAL",
      "categoryNames": ["Para 1 instrumentista"],
      "workGenresArr": ["Prelúdio"],
      "totalScores": 15,
      "totalFavorites": 432,
      "hasVideo": true,
      "hasAudio": true
    }
  ],
  "totalCount": 207883,
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 4158
  }
}
```

#### Detalhes da Obra

```http
GET /api/works/[workId]
```

**Response:**

```json
{
  "id": "work1",
  "title": "Prelúdio em Dó Maior BWV 846",
  "subtitle": "Das wohltemperierte Klavier I",
  "composer": {
    "id": "comp1",
    "name": "Johann Sebastian Bach",
    "epochName": "Baroque"
  },
  "instrument": {
    "id": "piano",
    "name": "Piano",
    "category": "Keyboard"
  },
  "epoch": {
    "id": "baroque",
    "name": "Baroque"
  },
  "opOrCatalog": "BWV 846",
  "compositionYear": "1722",
  "firstPublishDate": "1801",
  "tone": "C Major",
  "mediaDuration": "2:30",
  "workStyle": "Baroque",
  "workType": "INDIVIDUAL",
  "categoryNames": ["Para 1 instrumentista"],
  "workGenresArr": ["Prelúdio"],
  "instrumentation": "Piano solo",
  "imslpPermlink": "https://imslp.org/wiki/...",
  "imslpId": "IMSLP02448",
  "difficultyLevel": "INTERMEDIATE",
  "imslpDifficultyLevel": "4",
  "multimedia": {
    "youtube": {
      "videoId": "abc123",
      "title": "Bach Prelude C Major - Glenn Gould",
      "thumbnail": "https://img.youtube.com/vi/abc123/maxresdefault.jpg"
    },
    "spotify": {
      "trackId": "spotify123",
      "title": "Bach: Prelude in C Major",
      "artists": ["Glenn Gould"],
      "duration": 150000,
      "previewUrl": "https://p.scdn.co/mp3-preview/..."
    }
  },
  "stats": {
    "totalFavorites": 432,
    "wantToLearn": 156,
    "learned": 89,
    "totalAnnotations": 23,
    "totalScores": 15,
    "viewsLastMonth": 2341
  },
  "isVerified": true
}
```

#### Partituras da Obra

```http
GET /api/works/[workId]/scores
```

**Response:**

```json
{
  "scores": [
    {
      "id": "score1",
      "sourceId": "IMSLP123456",
      "source": "IMSLP",
      "title": "Complete Score",
      "type": "SCORES",
      "downloadUrl": "https://imslp.eu/files/imglnks/euimg/...",
      "fileSize": "1.2 MB",
      "pageCount": "8",
      "fileFormat": "PDF",
      "thumbnailUrl": "https://cloudinary.com/score-thumb.jpg",
      "editor": "Hans Bischoff",
      "publisher": "Steingräber",
      "copyright": "Public Domain",
      "uploadDate": "2008-05-15",
      "rating": 4.5,
      "downloadCount": 15432,
      "isFavorited": false
    }
  ],
  "groupedByType": {
    "SCORES": 8,
    "PARTS": 3,
    "ARRANGEMENTS": 4
  },
  "totalCount": 15,
  "processingStatus": "COMPLETED"
}
```

#### Busca de Obras

```http
GET /api/works/search
```

**Query Parameters:**

```
?q=bach prelude
?filters[composer]=bach
&filters[instrument]=piano
&filters[difficulty]=INTERMEDIATE
?autocomplete=true
```

**Response:**

```json
{
  "results": [
    {
      "id": "work1",
      "title": "Prelúdio em Dó Maior BWV 846",
      "composer": "Johann Sebastian Bach",
      "instrument": "Piano",
      "match_score": 0.95,
      "highlight": {
        "title": "<mark>Prelúdio</mark> em Dó Maior BWV 846",
        "composer": "Johann Sebastian <mark>Bach</mark>"
      }
    }
  ],
  "suggestions": ["Bach Preludes", "Bach Inventions", "Bach Fugues"],
  "totalFound": 156,
  "searchTime": "23ms"
}
```

#### Upload de Mídia para Obra

```http
POST /api/works/[workId]/media/upload
```

**Request (multipart/form-data):**

```
videoFile: [video-file]
title: "Performance by Student"
type: "performance"
isPublic: true
```

**Response:**

```json
{
  "success": true,
  "media": {
    "id": "media123",
    "url": "https://cloudinary.com/video.mp4",
    "thumbnail": "https://cloudinary.com/thumb.jpg",
    "duration": 180,
    "uploadedAt": "2024-12-01T10:30:00Z"
  }
}
```

### 3.3 Partituras

#### Listar Partituras por Grupo

```http
GET /api/work-scores/groups
```

**Response:**

```json
{
  "groups": [
    {
      "workId": "work1",
      "workTitle": "Prelúdio em Dó Maior BWV 846",
      "composer": "J.S. Bach",
      "scoresByType": {
        "SCORES": [
          {
            "id": "score1",
            "title": "Complete Score",
            "downloadUrl": "https://...",
            "pageCount": "8",
            "fileSize": "1.2 MB"
          }
        ],
        "PARTS": [],
        "ARRANGEMENTS": [
          {
            "id": "arr1",
            "title": "For String Quartet",
            "arranger": "Anonymous"
          }
        ]
      },
      "totalScores": 15
    }
  ]
}
```

#### Buscar Partituras IMSLP

```http
GET /api/imslp-scores
```

**Query Parameters:**

```
?workId=work1
?type=SCORES
&refresh=true
```

### 3.4 Instrumentos e Gêneros

#### Listar Instrumentos

```http
GET /api/instruments
```

**Response:**

```json
{
  "instruments": [
    {
      "id": "piano",
      "name": "Piano",
      "category": "Keyboard",
      "totalWorks": 45123,
      "difficulty": "Variable"
    }
  ]
}
```

#### Tipos de Obra do Compositor

```http
GET /api/composer-work-types
```

---

## 4. APIs de Sistema Educacional (20 rotas)

### 4.1 Aulas (Lessons)

#### Listar Aulas

```http
GET /api/lessons
```

**Query Parameters:**

```
?teacherId=teacher1
?studentId=student1
?status=SCHEDULED
?dateStart=2024-12-01
&dateEnd=2024-12-31
```

**Response:**

```json
{
  "lessons": [
    {
      "id": "lesson1",
      "title": "Técnica de Escalas Maiores",
      "teacherId": "teacher1",
      "studentId": "student1",
      "scheduledAt": "2024-12-01T14:00:00Z",
      "duration": 60,
      "status": "SCHEDULED",
      "type": "INDIVIDUAL",
      "location": "Sala 101",
      "objectives": ["Dominar escalas maiores", "Melhorar articulação"],
      "teacher": {
        "name": "Prof. Maria Silva"
      },
      "student": {
        "name": "João Santos"
      }
    }
  ]
}
```

#### Criar Aula

```http
POST /api/lessons
```

**Request:**

```json
{
  "title": "Sonata K. 331 - Análise",
  "teacherId": "teacher1",
  "studentId": "student1",
  "scheduledAt": "2024-12-05T15:00:00Z",
  "duration": 60,
  "type": "INDIVIDUAL",
  "location": "Online",
  "objectives": ["Analisar estrutura da sonata", "Trabalhar interpretação"],
  "workScoreIds": ["score1", "score2"],
  "isRecurring": true,
  "recurrenceType": "WEEKLY",
  "recurrenceEnd": "2024-12-31T23:59:59Z"
}
```

**Response:**

```json
{
  "lesson": {
    "id": "lesson123",
    "title": "Sonata K. 331 - Análise",
    "scheduledAt": "2024-12-05T15:00:00Z",
    "status": "SCHEDULED"
  },
  "recurringLessons": [
    {
      "id": "lesson124",
      "scheduledAt": "2024-12-12T15:00:00Z"
    }
  ],
  "totalCreated": 4
}
```

#### Verificar Conflitos

```http
POST /api/lessons/check-conflicts
```

**Request:**

```json
{
  "teacherId": "teacher1",
  "studentId": "student1",
  "scheduledAt": "2024-12-05T15:00:00Z",
  "duration": 60
}
```

**Response:**

```json
{
  "hasConflict": false,
  "availableSlots": ["14:00", "15:00", "16:00"],
  "teacherConflicts": [],
  "studentConflicts": [],
  "maxLessonsExceeded": false
}
```

### 4.2 Tarefas (Assignments)

#### Listar Tarefas

```http
GET /api/assignments
```

**Response:**

```json
{
  "assignments": [
    {
      "id": "assign1",
      "title": "Praticar Escalas Cromáticas",
      "lessonId": "lesson1",
      "studentId": "student1",
      "type": "practice",
      "priority": "medium",
      "status": "PENDING",
      "dueDate": "2024-12-10T23:59:59Z",
      "estimatedTime": 30,
      "progress": 25,
      "practiceGoals": [
        "Tocar escalas cromáticas em todas as tonalidades",
        "Manter andamento constante de 120 bpm"
      ],
      "lesson": {
        "title": "Técnica Avançada",
        "scheduledAt": "2024-12-01T14:00:00Z"
      }
    }
  ]
}
```

#### Criar Tarefa

```http
POST /api/assignments
```

**Request:**

```json
{
  "title": "Estudo de Articulação",
  "description": "Praticar diferentes tipos de articulação no Prelúdio BWV 846",
  "lessonId": "lesson1",
  "studentId": "student1",
  "type": "practice",
  "priority": "high",
  "dueDate": "2024-12-15T23:59:59Z",
  "estimatedTime": 45,
  "workScoreIds": ["score1"],
  "practiceGoals": ["Dominar legato e staccato", "Aplicar dinâmicas corretas"],
  "technicalGoals": ["Independência das mãos", "Controle de pedal"]
}
```

### 4.3 Sistema de Aprendizado

#### Lista Quero Aprender

```http
GET    /api/learning/want-to-learn
POST   /api/learning/want-to-learn
PUT    /api/learning/want-to-learn/[id]
DELETE /api/learning/want-to-learn/[id]
```

**GET Response:**

```json
{
  "wantToLearn": [
    {
      "id": "wtl1",
      "workId": "work1",
      "work": {
        "title": "Moonlight Sonata Op. 27 No. 2",
        "composer": "Ludwig van Beethoven"
      },
      "priority": 5,
      "targetDate": "2024-12-31",
      "difficulty": "ADVANCED",
      "motivation": "Sempre foi meu sonho tocar esta sonata",
      "progress": 45,
      "selectedWorkScore": {
        "id": "score1",
        "title": "Complete Score - Henle Edition"
      },
      "milestones": {
        "learned_first_movement": true,
        "learned_second_movement": false,
        "memorized": false,
        "performed": false
      },
      "addedAt": "2024-11-01T10:00:00Z"
    }
  ],
  "stats": {
    "total": 8,
    "inProgress": 5,
    "overdue": 1,
    "avgProgress": 62.5
  }
}
```

**POST Request:**

```json
{
  "workId": "work1",
  "priority": 5,
  "targetDate": "2024-12-31",
  "difficulty": "ADVANCED",
  "motivation": "Peça dos meus sonhos",
  "selectedWorkScoreId": "score1",
  "estimatedStudyTime": 120
}
```

#### Lista Já Aprendi

```http
GET    /api/learning/learned
POST   /api/learning/learned
```

**POST Request:**

```json
{
  "workId": "work1",
  "mastery": 4,
  "studyStartDate": "2024-10-01",
  "studyDuration": 60, // dias
  "notes": "Obra desafiadora mas muito gratificante",
  "difficulty": "ADVANCED",
  "enjoyment": 5,
  "wouldRecommend": true,
  "publicPerformance": true,
  "videoUrl": "https://cloudinary.com/my-performance.mp4",
  "isVideoPublic": false
}
```

### 4.4 Sistema de Favoritos

#### Favoritos de Compositores

```http
GET    /api/favorites/composers
POST   /api/favorites/composers
DELETE /api/favorites/composers/[composerId]
```

#### Favoritos de Obras

```http
GET    /api/favorites/works
POST   /api/favorites/works
DELETE /api/favorites/works/[workId]
```

#### Favoritos de Partituras

```http
GET    /api/favorites/scores
POST   /api/favorites/scores
DELETE /api/favorites/scores/[scoreId]
```

**POST Request:**

```json
{
  "workId": "work1",
  "scoreId": "IMSLP123456",
  "scoreSource": "IMSLP",
  "notes": "Melhor edição para estudo",
  "tags": ["estudo", "performance"],
  "personalRating": 5
}
```

---

## 5. APIs de Admin (35 rotas)

### 5.1 Analytics e Insights

#### Analytics Gerais

```http
GET /api/admin/analytics
```

**Query Parameters:**

```
?period=30d  // 7d, 30d, 90d, 1y
?metrics=users,content,engagement
```

**Response:**

```json
{
  "period": "30d",
  "users": {
    "total": 1247,
    "active": 856,
    "new": 123,
    "retention_rate": 78.5,
    "growth_rate": 12.3
  },
  "content": {
    "total_works": 207883,
    "total_composers": 19177,
    "total_scores": 892456,
    "new_uploads": 45,
    "verified_content": 156782
  },
  "engagement": {
    "total_sessions": 5234,
    "avg_session_duration": "8m 23s",
    "page_views": 89456,
    "favorites_added": 1234,
    "annotations_created": 567
  }
}
```

#### Insights com IA

```http
GET /api/admin/insights
```

**Response:**

```json
{
  "generated_at": "2024-12-01T10:30:00Z",
  "insights": [
    {
      "type": "user_growth",
      "confidence": 0.92,
      "finding": "Crescimento de usuários acelerou 23% no último mês",
      "impact": "high",
      "recommendation": "Aumentar investimento em marketing"
    },
    {
      "type": "content_gap",
      "confidence": 0.87,
      "finding": "Período Contemporâneo tem baixo engajamento",
      "impact": "medium",
      "recommendation": "Adicionar mais obras contemporâneas populares"
    }
  ],
  "predictions": {
    "new_users_next_30d": {
      "estimated": 180,
      "confidence": 0.85,
      "factors": ["historical_growth", "seasonal_patterns"]
    }
  }
}
```

### 5.2 Gestão de Usuários

#### Listar Usuários

```http
GET /api/admin/users
```

**Response:**

```json
{
  "users": [
    {
      "id": "user1",
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao@example.com",
      "userType": "MUSIC_STUDENT",
      "role": 0,
      "createdAt": "2024-11-01T00:00:00Z",
      "lastActiveAt": "2024-11-30T15:30:00Z",
      "totalUploads": 5,
      "totalAnnotations": 12,
      "uploadScore": 85
    }
  ]
}
```

#### Detalhes do Usuário

```http
GET /api/admin/users/details
```

**Query Parameters:**

```
?userId=user1
```

### 5.3 Newsletter

#### Dashboard Newsletter

```http
GET /api/admin/newsletter/subscribers
```

**Response:**

```json
{
  "stats": {
    "total": 2451,
    "active": 2234,
    "pending": 156,
    "unsubscribed": 61
  },
  "recentSubscribers": [
    {
      "email": "usuario@example.com",
      "status": "ACTIVE",
      "subscribedAt": "2024-11-30T10:00:00Z"
    }
  ],
  "engagementMetrics": {
    "avgOpenRate": 45.2,
    "avgClickRate": 8.7,
    "avgEngagementScore": 72.3
  }
}
```

#### Campanhas

```http
GET  /api/admin/newsletter/campaigns
POST /api/admin/newsletter/campaigns
```

**POST Request:**

```json
{
  "name": "Newsletter Dezembro 2024",
  "subject": "Novas obras de Chopin adicionadas!",
  "templateId": "template1",
  "scheduledAt": "2024-12-01T10:00:00Z",
  "targetSegments": {
    "userTypes": ["MUSIC_STUDENT", "PROFESSIONAL"],
    "interests": ["chopin", "romantic"],
    "engagementLevel": "high"
  }
}
```

#### Enviar Campanha

```http
POST /api/admin/newsletter/campaigns/[id]/send
```

### 5.4 Sistema de Moderação

#### Relatórios Pendentes

```http
GET /api/admin/reports
```

**Response:**

```json
{
  "reports": [
    {
      "id": "report1",
      "entityType": "composer",
      "entityId": "comp123",
      "reportedBy": "user456",
      "reason": "incorrect_information",
      "description": "Data de nascimento incorreta",
      "status": "pending",
      "priority": "normal",
      "createdAt": "2024-11-30T14:20:00Z"
    }
  ],
  "stats": {
    "pending": 23,
    "approved": 156,
    "rejected": 45
  }
}
```

### 5.5 Sistema e Backup

#### Status do Sistema

```http
GET /api/admin/system
```

**Response:**

```json
{
  "system": {
    "status": "healthy",
    "uptime": "15d 8h 23m",
    "version": "1.0.0"
  },
  "performance": {
    "cpu_usage": 35.2,
    "memory_usage": 67.8,
    "disk_usage": 42.1,
    "response_time": 180
  },
  "database": {
    "status": "connected",
    "replica_set": "rs0",
    "connections": 15,
    "operations_per_second": 145
  },
  "cache": {
    "redis_status": "connected",
    "hit_rate": 89.5,
    "memory_usage": "156MB"
  }
}
```

#### Backup

```http
GET  /api/admin/backup
POST /api/admin/backup
```

**POST Request:**

```json
{
  "type": "selective", // ou "complete"
  "tables": ["User", "Composer", "Work"],
  "includeDependencies": true,
  "compression": true
}
```

---

## 6. Rate Limiting e Caching

### 6.1 Rate Limits

```typescript
const rateLimits = {
  '/api/auth/*': '10 requests per minute',
  '/api/uploads/*': '5 requests per minute',
  '/api/admin/*': '100 requests per minute',
  '/api/*': '50 requests per second',
};
```

### 6.2 Cache Strategy

```typescript
const cacheConfig = {
  '/api/composers': '1 hour TTL',
  '/api/works': '30 minutes TTL',
  '/api/work-scores': '24 hours TTL',
  '/api/search': '15 minutes TTL',
  'user-specific': 'no-cache',
};
```

---

## 7. Códigos de Status HTTP

### 7.1 Códigos de Sucesso

- `200` - OK (GET, PUT bem-sucedidos)
- `201` - Created (POST bem-sucedido)
- `204` - No Content (DELETE bem-sucedido)

### 7.2 Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `409` - Conflict (duplicata/conflito)
- `422` - Unprocessable Entity (validação falhou)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### 7.3 Formato de Erro Padrão

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email deve ter formato válido"
      }
    ],
    "timestamp": "2024-12-01T10:30:00Z",
    "path": "/api/auth/register"
  }
}
```

---

## 8. Webhooks

### 8.1 Newsletter Events

```http
POST /api/webhooks/sendgrid
```

**Payload:**

```json
[
  {
    "email": "user@example.com",
    "event": "open",
    "campaign_id": "campaign123",
    "timestamp": 1701432600
  }
]
```

### 8.2 Payment Events (Futuro)

```http
POST /api/webhooks/stripe
```

---

## 9. Exemplo de Integração

### 9.1 Cliente JavaScript

```javascript
class OpusAtlasAPI {
  constructor(baseUrl = 'https://opusatlas.com.br/api') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.token = data.token;
      return data;
    }
    throw new Error('Login failed');
  }

  async getComposers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/composers?${params}`);
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}

// Uso
const api = new OpusAtlasAPI();
await api.login('user@example.com', 'password');
const composers = await api.getComposers({ epoch: 'baroque' });
```

---

## Conclusão

Esta documentação cobre todas as 124 rotas de API do Opus Atlas, organizadas por funcionalidade com exemplos práticos de uso. As APIs seguem padrões REST com autenticação JWT, rate limiting, cache Redis e validação completa via Prisma.

Para testar as APIs localmente:

```bash
npm run dev
# APIs disponíveis em http://localhost:3000/api
```

Para mais detalhes sobre implementação específica, consulte o código em `/app/api/` do repositório.
