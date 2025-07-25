// scripts/migrate-spotify-artists.ts - SCRIPT DE MIGRAÇÃO
import prisma from '@/app/libs/prismadb';

async function migrateSpotifyArtists() {
  console.log('🚀 Iniciando migração dos dados spotifyArtists...');

  try {
    // Buscar todas as obras que têm spotifyArtists como string
    const worksWithSpotifyArtists = await prisma.work.findMany({
      where: {
        spotifyArtists: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        spotifyArtists: true,
      },
    });

    console.log(
      `📊 Encontradas ${worksWithSpotifyArtists.length} obras com dados do Spotify`
    );

    let migratedCount = 0;
    let errorCount = 0;

    for (const work of worksWithSpotifyArtists) {
      try {
        let parsedArtists;

        // Se já é um objeto (Json), não precisa migrar
        if (typeof work.spotifyArtists === 'object') {
          console.log(`✅ ${work.title}: Já está em formato Json`);
          continue;
        }

        // Se é string, tentar parsear
        if (typeof work.spotifyArtists === 'string') {
          parsedArtists = JSON.parse(work.spotifyArtists);
        } else {
          console.log(
            `⚠️ ${work.title}: Tipo inesperado:`,
            typeof work.spotifyArtists
          );
          continue;
        }

        // Atualizar no banco
        await prisma.work.update({
          where: { id: work.id },
          data: {
            spotifyArtists: parsedArtists, // Prisma irá salvar como Json automaticamente
          },
        });

        migratedCount++;
        console.log(`✅ ${work.title}: Migrado com sucesso`);
      } catch (error) {
        errorCount++;
        console.error(`❌ ${work.title}: Erro na migração:`, error);
      }
    }

    console.log('\n📈 Resumo da Migração:');
    console.log(`✅ Migradas com sucesso: ${migratedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processadas: ${worksWithSpotifyArtists.length}`);
  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  migrateSpotifyArtists()
    .then(() => {
      console.log('🎉 Migração concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migração falhou:', error);
      process.exit(1);
    });
}

export { migrateSpotifyArtists };
