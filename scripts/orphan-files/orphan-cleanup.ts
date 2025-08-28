// scripts/orphan-files/orphan-cleanup.ts - VERSÃO CORRIGIDA
import {
  OrphanFileScanner,
  OrphanFileCategory,
} from '@/app/libs/orphanFiles/orphanFileScanner';
import {
  CloudinaryOrphanScanner,
  CloudinaryFileCategory,
} from '@/app/libs/orphanFiles/cloudinaryOrphanScanner';

// 🔧 TIPOS HÍBRIDOS CORRIGIDOS
type AllFileCategory = OrphanFileCategory | CloudinaryFileCategory;

// 🔧 DEFINIR CATEGORIAS VÁLIDAS
const LOCAL_CATEGORIES: OrphanFileCategory[] = [
  'profiles',
  'composers',
  'scores',
  'advertisements',
  'works',
  'general',
  'unknown',
  'cloudinary',
];

const CLOUDINARY_CATEGORIES: CloudinaryFileCategory[] = [
  'assignments',
  'learned',
  'scores',
  'works-audio',
  'works-video',
  'advertisements',
  'profiles',
  'composers',
  'unknown',
];

// 🔧 FUNÇÃO AUXILIAR PARA VALIDAR CATEGORIAS LOCAIS
function isValidLocalCategory(
  category: string
): category is OrphanFileCategory {
  return LOCAL_CATEGORIES.includes(category as OrphanFileCategory);
}

// 🔧 FUNÇÃO AUXILIAR PARA VALIDAR CATEGORIAS DO CLOUDINARY
function isCloudinaryCategory(
  category: string
): category is CloudinaryFileCategory {
  return CLOUDINARY_CATEGORIES.includes(category as CloudinaryFileCategory);
}

// 🔧 FUNÇÃO PARA VERIFICAR SE É CATEGORIA HÍBRIDA
function isHybridCategory(category: string): boolean {
  // Categorias que podem estar em ambos os sistemas
  const hybridCategories = [
    'scores',
    'advertisements',
    'profiles',
    'composers',
  ];
  return hybridCategories.includes(category);
}

async function main() {
  const command = process.argv[2];
  const category = process.argv[3] as AllFileCategory;
  const scanType =
    (process.argv[4] as 'local' | 'cloudinary' | 'hybrid') || 'hybrid';

  const scanner = new OrphanFileScanner();
  const cloudinaryScanner = new CloudinaryOrphanScanner();

  switch (command) {
    case 'scan': {
      console.log(`🔍 Iniciando scan ${scanType} de arquivos órfãos...`);

      let result;
      const options: any = { includesCloudinary: scanType !== 'local' };

      if (scanType === 'cloudinary') {
        // Scan apenas Cloudinary
        const cloudinaryResult =
          await cloudinaryScanner.scanCloudinaryOrphans();

        console.log('\n📊 Resultado do Scan Cloudinary:');
        console.log('='.repeat(60));
        console.log(
          `☁️ Total de arquivos no Cloudinary: ${cloudinaryResult.totalFiles}`
        );
        console.log(
          `🗑️ Arquivos órfãos encontrados: ${cloudinaryResult.orphanFiles.length}`
        );
        console.log(
          `💾 Espaço recuperável: ${cloudinaryResult.formattedTotalSize}`
        );
        console.log(
          `⏱️ Tempo de processamento: ${(
            cloudinaryResult.scanDuration / 1000
          ).toFixed(2)}s`
        );

        if (cloudinaryResult.orphanFiles.length > 0) {
          console.log('\n📋 Arquivos órfãos por categoria (Cloudinary):');
          Object.entries(cloudinaryResult.categories).forEach(
            ([cat, stats]) => {
              if (stats.orphans > 0) {
                console.log(
                  `  ${cat}: ${stats.orphans} órfãos de ${stats.count} arquivos`
                );
              }
            }
          );

          console.log('\n📂 Pastas escaneadas:');
          cloudinaryResult.scannedFolders.forEach((folder) => {
            console.log(`  📁 ${folder || 'Root'}`);
          });

          console.log(
            '\n💡 Use o comando "remove-cloudinary" para remover arquivos específicos'
          );
        } else {
          console.log('\n✅ Nenhum arquivo órfão encontrado no Cloudinary!');
        }
      } else {
        // Scan híbrido ou local
        if (category && isValidLocalCategory(category)) {
          result = await scanner.scanByCategory(category, options);
        } else {
          result = await scanner.scanAll(options);
        }

        console.log('\n📊 Resultado do Scan:');
        console.log('='.repeat(60));
        console.log(
          `📁 Total de arquivos locais escaneados: ${result.totalFiles}`
        );
        console.log(
          `🗑️ Arquivos locais órfãos encontrados: ${result.orphanFiles.length}`
        );
        console.log(
          `💾 Espaço local recuperável: ${result.formattedTotalSize}`
        );

        if (result.cloudinaryData) {
          console.log(
            `☁️ Total de arquivos no Cloudinary: ${result.cloudinaryData.totalFiles}`
          );
          console.log(
            `🗑️ Arquivos órfãos no Cloudinary: ${result.cloudinaryData.orphanFiles.length}`
          );
          console.log(
            `💾 Espaço Cloudinary recuperável: ${result.cloudinaryData.formattedTotalSize}`
          );
        }

        console.log(
          `⏱️ Tempo de processamento: ${(result.scanDuration / 1000).toFixed(
            2
          )}s`
        );

        const totalOrphans =
          result.orphanFiles.length +
          (result.cloudinaryData?.orphanFiles.length || 0);

        if (totalOrphans > 0) {
          console.log('\n📋 Arquivos órfãos por categoria:');

          // Categorias locais
          if (result.orphanFiles.length > 0) {
            console.log('  📂 Locais:');
            Object.entries(result.categories).forEach(([cat, count]) => {
              if (count > 0) {
                console.log(`    ${cat}: ${count} arquivos`);
              }
            });
          }

          // Categorias do Cloudinary
          if (
            result.cloudinaryData &&
            result.cloudinaryData.orphanFiles.length > 0
          ) {
            console.log('  ☁️ Cloudinary:');
            Object.entries(result.cloudinaryData.categories).forEach(
              ([cat, stats]) => {
                if (stats.orphans > 0) {
                  console.log(
                    `    ${cat}: ${stats.orphans} órfãos de ${stats.count} arquivos`
                  );
                }
              }
            );
          }

          console.log('\n💡 Comandos de remoção disponíveis:');
          console.log(
            '  npm run orphan-files:remove <local-paths...>  # Para arquivos locais'
          );
          console.log(
            '  npm run orphan-files:remove-cloudinary <publicIds...>  # Para Cloudinary'
          );
        } else {
          console.log(
            '\n✅ Nenhum arquivo órfão encontrado! Seus uploads estão organizados.'
          );
        }
      }
      break;
    }

    case 'scan-category': {
      if (!category) {
        console.error('❌ Especifique uma categoria válida.');
        showAvailableCategories();
        process.exit(1);
      }

      console.log(`🔍 Escaneando categoria: ${category} (${scanType})`);

      if (scanType === 'cloudinary' || isCloudinaryCategory(category)) {
        // 🔧 SCAN ESPECÍFICO DO CLOUDINARY
        const cloudinaryResult =
          await cloudinaryScanner.scanCloudinaryOrphans();
        const categoryFiles = cloudinaryResult.orphanFiles.filter(
          (f) => f.category === category
        );

        console.log(`\n📊 Resultado para ${category} (Cloudinary):`);
        console.log(`🗑️ Órfãos encontrados: ${categoryFiles.length}`);
        const categorySize = categoryFiles.reduce(
          (sum, file) => sum + file.bytes,
          0
        );
        console.log(
          `💾 Espaço: ${(categorySize / (1024 * 1024)).toFixed(2)} MB`
        );

        if (categoryFiles.length > 0) {
          console.log('\n📋 Arquivos encontrados:');
          categoryFiles.slice(0, 10).forEach((file) => {
            console.log(`  • ${file.publicId} (${file.formattedSize})`);
          });

          if (categoryFiles.length > 10) {
            console.log(`  ... e mais ${categoryFiles.length - 10} arquivos`);
          }
        }
      } else if (isValidLocalCategory(category)) {
        // 🔧 SCAN LOCAL COM TIPAGEM CORRETA
        const categoryResult = await scanner.scanByCategory(category, {
          includesCloudinary: scanType === 'hybrid',
        });

        console.log(`\n📊 Resultado para ${category}:`);
        console.log(`🗑️ Órfãos locais: ${categoryResult.orphanFiles.length}`);
        console.log(`💾 Espaço local: ${categoryResult.formattedTotalSize}`);

        if (categoryResult.cloudinaryData) {
          const cloudinaryCount =
            categoryResult.cloudinaryData.orphanFiles.length;
          console.log(`☁️ Órfãos no Cloudinary: ${cloudinaryCount}`);
        }

        if (categoryResult.orphanFiles.length > 0) {
          console.log('\n📋 Arquivos locais encontrados:');
          categoryResult.orphanFiles.slice(0, 10).forEach((file) => {
            console.log(`  • ${file.name} (${file.formattedSize})`);
          });

          if (categoryResult.orphanFiles.length > 10) {
            console.log(
              `  ... e mais ${categoryResult.orphanFiles.length - 10} arquivos`
            );
          }
        }
      } else {
        console.error(`❌ Categoria '${category}' não reconhecida.`);
        showAvailableCategories();
        process.exit(1);
      }
      break;
    }

    case 'remove': {
      const filePaths = process.argv.slice(3);
      if (filePaths.length === 0) {
        console.error(
          '❌ Especifique pelo menos um caminho de arquivo para remover.'
        );
        console.log(
          'Exemplo: npm run orphan-files:remove /uploads/file1.jpg /uploads/file2.png'
        );
        process.exit(1);
      }

      console.log(`🗑️ Removendo ${filePaths.length} arquivos locais...`);
      const result = await scanner.removeOrphanFiles(filePaths);

      if (result.localResult) {
        console.log(`✅ Removidos: ${result.localResult.removed.length}`);
        console.log(`❌ Falharam: ${result.localResult.failed.length}`);
        console.log(
          `💾 Espaço liberado: ${(
            result.totalSizeFreed /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );

        if (result.localResult.failed.length > 0) {
          console.log('\n❌ Arquivos que falharam:');
          result.localResult.failed.forEach((failure) => {
            console.log(`  • ${failure.path}: ${failure.error}`);
          });
        }
      }
      break;
    }

    case 'remove-cloudinary': {
      const publicIds = process.argv.slice(3);
      if (publicIds.length === 0) {
        console.error(
          '❌ Especifique pelo menos um publicId do Cloudinary para remover.'
        );
        console.log(
          'Exemplo: npm run orphan-files:remove-cloudinary folder/file1 folder/file2'
        );
        process.exit(1);
      }

      console.log(`🗑️ Removendo ${publicIds.length} arquivos do Cloudinary...`);
      const result = await cloudinaryScanner.removeCloudinaryOrphans(publicIds);

      console.log(`✅ Removidos: ${result.removed.length}`);
      console.log(`❌ Falharam: ${result.failed.length}`);
      console.log(
        `💾 Espaço liberado: ${(result.totalSizeFreed / (1024 * 1024)).toFixed(
          2
        )} MB`
      );

      if (result.failed.length > 0) {
        console.log('\n❌ Arquivos que falharam:');
        result.failed.forEach((failure) => {
          console.log(`  • ${failure.publicId}: ${failure.error}`);
        });
      }
      break;
    }

    case 'stats': {
      console.log('📊 Obtendo estatísticas dos arquivos órfãos...');

      // Stats locais
      const localResult = await scanner.scanAll({ includesCloudinary: false });

      // Stats do Cloudinary
      const cloudinaryResult = await cloudinaryScanner.scanCloudinaryOrphans();

      console.log('\n📈 Estatísticas Consolidadas:');
      console.log('='.repeat(60));
      console.log(
        `📂 Arquivos locais: ${localResult.totalFiles} total, ${localResult.orphanFiles.length} órfãos`
      );
      console.log(
        `☁️ Arquivos Cloudinary: ${cloudinaryResult.totalFiles} total, ${cloudinaryResult.orphanFiles.length} órfãos`
      );

      const totalFiles = localResult.totalFiles + cloudinaryResult.totalFiles;
      const totalOrphans =
        localResult.orphanFiles.length + cloudinaryResult.orphanFiles.length;
      const totalSize = localResult.totalSize + cloudinaryResult.totalSize;

      console.log(
        `🔄 Total geral: ${totalFiles} arquivos, ${totalOrphans} órfãos`
      );
      console.log(
        `💾 Espaço total recuperável: ${(totalSize / (1024 * 1024)).toFixed(
          2
        )} MB`
      );

      if (totalFiles > 0) {
        console.log(
          `📊 Taxa de órfãos: ${((totalOrphans / totalFiles) * 100).toFixed(
            1
          )}%`
        );
      }
      break;
    }

    case 'preview': {
      const fileIdentifier = process.argv[3]; // Path local ou publicId do Cloudinary
      const sourceType = (process.argv[4] as 'local' | 'cloudinary') || 'auto';

      if (!fileIdentifier) {
        console.error('❌ Especifique um arquivo para preview.');
        console.log(
          'Uso: npm run orphan-files:preview <path-ou-publicId> [local|cloudinary]'
        );
        process.exit(1);
      }

      console.log(`👁️ Gerando preview para: ${fileIdentifier}`);

      if (sourceType === 'cloudinary' || fileIdentifier.includes('/')) {
        console.log('☁️ Buscando no Cloudinary...');
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
          console.log(
            `🔗 URL: https://res.cloudinary.com/${cloudName}/image/upload/${fileIdentifier}`
          );
          console.log(
            `🔗 Video URL: https://res.cloudinary.com/${cloudName}/video/upload/${fileIdentifier}`
          );
        } else {
          console.error('❌ CLOUDINARY_CLOUD_NAME não configurado');
        }
      } else {
        console.log('📂 Arquivo local identificado');
        console.log(`📁 Caminho: ${fileIdentifier}`);
        console.log(`🔗 URL local: http://localhost:3000${fileIdentifier}`);
      }
      break;
    }

    case 'test-config': {
      console.log('🔧 Testando configuração do Cloudinary...');

      try {
        const cloudinaryScanner = new CloudinaryOrphanScanner();
        const testResult = await cloudinaryScanner.scanCloudinaryOrphans();
        console.log('✅ Configuração do Cloudinary OK!');
        console.log(`📊 Arquivos encontrados: ${testResult.totalFiles}`);
      } catch (error) {
        console.error('❌ Erro na configuração do Cloudinary:', error);
        console.log('\n🔧 Verifique as variáveis de ambiente:');
        console.log('  CLOUDINARY_CLOUD_NAME');
        console.log('  CLOUDINARY_API_KEY');
        console.log('  CLOUDINARY_API_SECRET');
      }
      break;
    }

    default: {
      console.log('🧹 Sistema Híbrido de Limpeza de Arquivos Órfãos');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log(
        '  scan [categoria] [tipo]              - Escanear arquivos órfãos'
      );
      console.log(
        '  scan-category <cat> [tipo]           - Escanear categoria específica'
      );
      console.log(
        '  remove <paths...>                    - Remover arquivos locais'
      );
      console.log(
        '  remove-cloudinary <publicIds...>     - Remover arquivos do Cloudinary'
      );
      console.log(
        '  stats                                - Estatísticas consolidadas'
      );
      console.log(
        '  preview <file> [fonte]               - Preview de arquivo'
      );
      console.log(
        '  test-config                          - Testar configuração do Cloudinary'
      );
      console.log('');
      console.log('Tipos de scan:');
      console.log('  hybrid       - Local + Cloudinary (padrão)');
      console.log('  local        - Apenas arquivos locais');
      console.log('  cloudinary   - Apenas Cloudinary');
      console.log('');
      console.log('Categorias locais:');
      console.log('  profiles      - Fotos de perfil de usuários');
      console.log('  composers     - Fotos de compositores');
      console.log('  scores        - Partituras e thumbnails');
      console.log('  advertisements- Mídia de publicidades');
      console.log('  works         - Áudios e vídeos de obras');
      console.log('  general       - Outros uploads');
      console.log('');
      console.log('Categorias do Cloudinary:');
      console.log('  assignments   - Vídeos de tarefas');
      console.log('  learned       - Vídeos de performance');
      console.log('  works-audio   - Áudios customizados de obras');
      console.log('  works-video   - Vídeos educativos de obras');
      console.log('');
      console.log('Exemplos:');
      console.log('  npm run orphan-files:scan');
      console.log('  npm run orphan-files:scan profiles hybrid');
      console.log(
        '  npm run orphan-files:scan-category assignments cloudinary'
      );
      console.log('  npm run orphan-files:remove /uploads/old-image.jpg');
      console.log(
        '  npm run orphan-files:remove-cloudinary videos/learned/old-video'
      );
      console.log('  npm run orphan-files:stats');
      console.log('  npm run orphan-files:test-config');
      console.log(
        '  npx tsx scripts/orphan-files/orphan-cleanup.ts scan hybrid'
      );
    }
  }
}

// 🔧 FUNÇÃO AUXILIAR PARA MOSTRAR CATEGORIAS DISPONÍVEIS
function showAvailableCategories() {
  console.log('Categorias disponíveis:');
  console.log('📂 Locais:');
  LOCAL_CATEGORIES.forEach((cat) => {
    if (cat !== 'cloudinary') console.log(`  - ${cat}`);
  });
  console.log('☁️ Cloudinary:');
  CLOUDINARY_CATEGORIES.forEach((cat) => {
    console.log(`  - ${cat}`);
  });
  console.log('🔄 Híbridas (local + cloudinary):');
  const hybridCats = ['scores', 'advertisements', 'profiles', 'composers'];
  hybridCats.forEach((cat) => {
    console.log(`  - ${cat}`);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Erro:', error);
    process.exit(1);
  });
}
