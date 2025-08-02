// scripts/orphan-files/orphan-cleanup.ts
import {
  OrphanFileScanner,
  OrphanFileCategory,
} from '@/app/libs/orphanFiles/orphanFileScanner';

async function main() {
  const command = process.argv[2];
  const category = process.argv[3] as OrphanFileCategory;

  const scanner = new OrphanFileScanner();

  switch (command) {
    case 'scan':
      console.log('🔍 Iniciando scan de arquivos órfãos...');

      let result;
      if (category) {
        result = await scanner.scanByCategory(category);
      } else {
        result = await scanner.scanAll();
      }

      console.log('\n📊 Resultado do Scan:');
      console.log('='.repeat(60));
      console.log(`📁 Total de arquivos escaneados: ${result.totalFiles}`);
      console.log(
        `🗑️ Arquivos órfãos encontrados: ${result.orphanFiles.length}`
      );
      console.log(`💾 Espaço recuperável: ${result.formattedTotalSize}`);
      console.log(
        `⏱️ Tempo de processamento: ${(result.scanDuration / 1000).toFixed(2)}s`
      );

      if (result.orphanFiles.length > 0) {
        console.log('\n📋 Arquivos órfãos por categoria:');
        Object.entries(result.categories).forEach(([cat, count]) => {
          if (count > 0) {
            console.log(`  ${cat}: ${count} arquivos`);
          }
        });

        console.log(
          '\n💡 Use "npm run orphan-files:remove" para remover arquivos específicos'
        );
      } else {
        console.log(
          '\n✅ Nenhum arquivo órfão encontrado! Seus uploads estão organizados.'
        );
      }
      break;

    case 'scan-category':
      if (!category) {
        console.error(
          '❌ Especifique uma categoria: profiles, composers, scores, advertisements, works, general'
        );
        process.exit(1);
      }

      console.log(`🔍 Escaneando categoria: ${category}`);
      const categoryResult = await scanner.scanByCategory(category);

      console.log(`\n📊 Resultado para ${category}:`);
      console.log(
        `🗑️ Órfãos encontrados: ${categoryResult.orphanFiles.length}`
      );
      console.log(`💾 Espaço: ${categoryResult.formattedTotalSize}`);

      if (categoryResult.orphanFiles.length > 0) {
        console.log('\n📋 Arquivos encontrados:');
        categoryResult.orphanFiles.slice(0, 10).forEach((file) => {
          console.log(`  • ${file.name} (${file.formattedSize})`);
        });

        if (categoryResult.orphanFiles.length > 10) {
          console.log(
            `  ... e mais ${categoryResult.orphanFiles.length - 10} arquivos`
          );
        }
      }
      break;

    default:
      console.log('🧹 Sistema de Limpeza de Arquivos Órfãos');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log(
        '  scan                     - Escanear todos os arquivos órfãos'
      );
      console.log('  scan-category <cat>      - Escanear categoria específica');
      console.log('');
      console.log('Categorias disponíveis:');
      console.log('  profiles      - Fotos de perfil de usuários');
      console.log('  composers     - Fotos de compositores');
      console.log('  scores        - Partituras e thumbnails');
      console.log('  advertisements- Mídia de publicidades');
      console.log('  works         - Áudios e vídeos de obras');
      console.log('  general       - Outros uploads');
      console.log('');
      console.log('Exemplos:');
      console.log('  npm run orphan-files:scan');
      console.log('  npm run orphan-files:scan-category scores');
      console.log('  npx tsx scripts/orphan-files/orphan-cleanup.ts scan');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Erro:', error);
    process.exit(1);
  });
}
