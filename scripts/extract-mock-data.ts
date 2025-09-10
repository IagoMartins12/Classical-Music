// scripts/extract-mock-data.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Lista de compositores famosos para priorizar
const famousComposerNames = [
  'Ludwig van Beethoven',
  'Wolfgang Amadeus Mozart',
  'Johann Sebastian Bach',
  'Frédéric Chopin',
  'Franz Liszt',
  'Claude Debussy',
  'Johannes Brahms',
  'Franz Schubert',
  'Peter Ilyich Tchaikovsky',
  'Antonio Vivaldi',
  'George Frideric Handel',
  'Robert Schumann',
  'Felix Mendelssohn',
  'Richard Wagner',
  'Joseph Haydn',
];

async function extractMockData() {
  console.log('🔄 Extraindo dados reais para melhorar os mocks...');

  try {
    // 1. ÉPOCAS (todas)
    console.log('📅 Buscando épocas...');
    const epochs = await prisma.epoch.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    // 2. INSTRUMENTOS (principais)
    console.log('🎼 Buscando instrumentos...');
    const instruments = await prisma.instrument.findMany({
      select: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    // 3. ROLES (todos)
    console.log('👤 Buscando roles...');
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    // 4. GÊNEROS DE OBRA (principais)
    console.log('🎵 Buscando gêneros...');
    const workGenres = await prisma.workGenre.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    // 5. COMPOSITORES FAMOSOS (com dados completos)
    console.log('🎭 Buscando compositores famosos...');
    const composers = await prisma.composer.findMany({
      where: {
        OR: famousComposerNames.map((name) => ({
          OR: [
            { fullName: { contains: name, mode: 'insensitive' } },
            { name: { contains: name, mode: 'insensitive' } },
          ],
        })),
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        alternativeNames: true,
        birthDate: true,
        deathDate: true,
        portraitUrl: true,
        epochId: true,
        epochName: true,
        bio: true,
        videoUrl: true,
        permLinkImslp: true,
        imslpId: true,
        wikipediaLink: true,
        nationality: true,
        instruments: true,
        imslpCategories: true,
        pageQuality: true,
        lastVerified: true,
        dataCompleteness: true,
        hasValidImage: true,
        createdBy: true,
        isCustom: true,
        dataQuality: true,
        verificationStatus: true,
        verifiedBy: true,
        verifiedAt: true,
        dataSource: true,
        isVerified: true,
        verificationNotes: true,
        lastEditedBy: true,
        lastEditedAt: true,
        editHistory: true,
        primaryRoleId: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        epoch: {
          select: {
            id: true,
            name: true,
          },
        },
        primaryRole: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            works: true,
          },
        },
      },
      orderBy: {
        works: {
          _count: 'desc',
        },
      },
      take: 15,
    });

    // 6. OBRAS POPULARES (dos compositores famosos + mais favoritadas)
    console.log('🎶 Buscando obras populares...');
    const composerIds = composers.map((c) => c.id);

    const works = await prisma.work.findMany({
      where: {
        OR: [
          { composerId: { in: composerIds } },
          // Obras com mais favoritos independente do compositor
          { favoriteBy: { some: {} } },
        ],
      },
      select: {
        id: true,
        title: true,
        composerId: true,
        instrumentId: true,
        epochId: true,
        videoUrl: true,
        imslpPermlink: true,
        imslpId: true,
        opOrCatalog: true,
        compositionYear: true,
        firstPublishDate: true,
        tone: true,
        mediaDuration: true,
        workStyle: true,
        moviment: true,
        categoryNames: true,
        workGenresArr: true,
        dedicateTo: true,
        instrumentation: true,
        workType: true,
        movementNumber: true,
        parentWorkId: true,
        createdAt: true,
        updatedAt: true,
        subtitle: true,
        imslpTags: true,
        spotifyTrackId: true,
        spotifyTrackUrl: true,
        spotifyDisplayTitle: true,
        spotifyDuration: true,
        spotifyArtists: true,
        spotifyThumbnail: true,
        youtubeVideoId: true,
        youtubeVideoUrl: true,
        youtubeTitle: true,
        customAudioUrl: true,
        customAudioFile: true,
        customAudioSource: true,
        customAudioMetadata: true,
        mediaSource: true,
        lastMediaSearch: true,
        mediaSearchError: true,
        videoAulaUrl: true,
        videoAulaFile: true,
        videoAulaTitle: true,
        videoAulaType: true,
        videoAulaSource: true,
        videoAulaAddedBy: true,
        videoAulaAddedAt: true,
        videoAulaMetadata: true,
        imslpDifficultyLevel: true,
        imslpDifficultySystem: true,
        imslpDifficultyRating: true,
        imslpSourceId: true,
        verificationStatus: true,
        verifiedBy: true,
        verifiedAt: true,
        isVerified: true,
        createdBy: true,
        isCustom: true,
        lastEditedBy: true,
        lastEditedAt: true,
        editHistory: true,
        difficultyLevel: true,
        difficultySystem: true,
        difficultyRating: true,
        difficultySourceId: true,
        annotationsCount: true,
        helpfulAnnotationsCount: true,
        lastAnnotationAt: true,
        composer: {
          select: {
            id: true,
            name: true,
            fullName: true,
            epochName: true,
          },
        },
        epoch: {
          select: {
            id: true,
            name: true,
          },
        },
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            favoriteBy: true,
          },
        },
      },
      orderBy: [{ favoriteBy: { _count: 'desc' } }, { createdAt: 'desc' }],
      take: 25,
    });

    // 7. PARTITURAS (algumas amostras)
    console.log('📄 Buscando partituras...');
    const workIds = works.slice(0, 5).map((w) => w.id);

    const workScores = await prisma.workScore.findMany({
      where: {
        workId: { in: workIds },
        isActive: true,
      },
      select: {
        id: true,
        workId: true,
        sourceId: true,
        source: true,
        title: true,
        downloadUrl: true,
        fileSize: true,
        pageCount: true,
        fileFormat: true,
        editor: true,
        publisher: true,
        copyright: true,
        thumbnailUrl: true,
        uploadDate: true,
        uploader: true,
        notes: true,
        type: true,
        groupIndex: true,
        groupTitle: true,
        rating: true,
        ratingsCount: true,
        downloadCount: true,
        dataQuality: true,
        verificationStatus: true,
        verifiedBy: true,
        verifiedAt: true,
        lastEditedBy: true,
        lastEditedAt: true,
        editHistory: true,
        qualityScore: true,
        isCustom: true,
        uploadedBy: true,
        customData: true,
        isActive: true,
        isVerified: true,
        lastVerified: true,
        lastAccessed: true,
        accessCount: true,
        imslpTotalCounts: true,
        processingStatus: true,
        createdAt: true,
        updatedAt: true,
        work: {
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 8. USUÁRIOS (sample para estrutura)
    console.log('👥 Buscando amostra de usuários...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        emailVerified: true,
        hashedPassword: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        userType: true,
        onboardingCompleted: true,
        city: true,
        state: true,
        country: true,
        phone: true,
        phoneCountryCode: true,
        phoneNumber: true,
        favoriteComposerId: true,
        favoriteEpochId: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        profilePublic: true,
        showLocation: true,
        helpfulAnnotationsCount: true,
        totalAnnotationsCount: true,
        totalXP: true,
        totalUploads: true,
        uploadScore: true,
        isTeacher: true,
        isStudent: true,
      },
      take: 3,
    });

    // Organizar dados extraídos
    const extractedData = {
      epochs,
      instruments,
      roles,
      workGenres,
      composers,
      works,
      workScores,
      users,
      metadata: {
        extractedAt: new Date().toISOString(),
        totalComposers: composers.length,
        totalWorks: works.length,
        totalScores: workScores.length,
        note: 'Dados extraídos para melhorar mocks durante build time',
      },
    };

    // Salvar em arquivo
    const outputPath = path.join(process.cwd(), 'extracted-mock-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));

    console.log('✅ Dados extraídos com sucesso!');
    console.log(`📁 Arquivo salvo em: ${outputPath}`);
    console.log('📊 Resumo:');
    console.log(`   - ${epochs.length} épocas`);
    console.log(`   - ${instruments.length} instrumentos`);
    console.log(`   - ${roles.length} roles`);
    console.log(`   - ${workGenres.length} gêneros`);
    console.log(`   - ${composers.length} compositores`);
    console.log(`   - ${works.length} obras`);
    console.log(`   - ${workScores.length} partituras`);
    console.log(`   - ${users.length} usuários`);

    console.log('\n🔍 Copie o conteúdo do arquivo para enviar ao Claude!');
  } catch (error) {
    console.error('❌ Erro ao extrair dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
extractMockData();

// Para rodar o script:
// npx ts-node scripts/extract-mock-data.ts
