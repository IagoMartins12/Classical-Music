// migration-fix-updatedAt-all-models.js
const { PrismaClient } = require('@prisma/client');

async function fixUpdatedAtFields() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Iniciando correção de updatedAt em todos os modelos...');

    // Modelos que precisam ser corrigidos
    const models = [
      { name: 'Composer', collection: 'Composer' },
      { name: 'Work', collection: 'Work' },
      { name: 'User', collection: 'User' },
      { name: 'WorkGenre', collection: 'WorkGenre' },
      { name: 'UserSelectedScore', collection: 'user_selected_scores' },
      { name: 'LearningGoal', collection: 'LearningGoal' },
      { name: 'StudySession', collection: 'StudySession' },
      { name: 'Annotation', collection: 'Annotation' },
      { name: 'PdfAnnotation', collection: 'PdfAnnotation' },
      { name: 'ScoreBookmark', collection: 'ScoreBookmark' },
      { name: 'WorkAnnotation', collection: 'work_annotations' },
      { name: 'FavoriteScore', collection: 'favorite_scores' },
      { name: 'WorkScore', collection: 'work_scores' },
      { name: 'ScoreProcessingLog', collection: 'score_processing_logs' },
    ];

    let totalFixed = 0;

    for (const model of models) {
      console.log(`\n📋 Processando modelo: ${model.name}`);

      try {
        // Verificar quantos registros têm problema
        const countResult = await prisma.$runCommandRaw({
          count: model.collection,
          query: { updatedAt: null },
        });

        const nullCount = countResult.n || 0;
        console.log(`📊 Registros com updatedAt null: ${nullCount}`);

        if (nullCount === 0) {
          console.log('✅ Nenhum registro com problema encontrado');
          continue;
        }

        // Corrigir registros usando createdAt como base
        console.log('🔧 Corrigindo registros...');

        const updateResult = await prisma.$runCommandRaw({
          update: model.collection,
          updates: [
            {
              q: { updatedAt: null },
              u: [
                {
                  $set: {
                    updatedAt: {
                      $cond: {
                        if: { $ne: ['$createdAt', null] },
                        then: '$createdAt',
                        else: new Date(),
                      },
                    },
                  },
                },
              ],
              multi: true,
            },
          ],
        });

        const fixedCount = updateResult.nModified || 0;
        totalFixed += fixedCount;
        console.log(`✅ Corrigidos: ${fixedCount} registros`);

        // Verificar se ainda há registros com problema
        const remainingResult = await prisma.$runCommandRaw({
          count: model.collection,
          query: { updatedAt: null },
        });

        const remainingCount = remainingResult.n || 0;

        if (remainingCount > 0) {
          console.log(
            `⚠️  Ainda há ${remainingCount} registros com problema. Aplicando correção adicional...`
          );

          // Correção adicional para casos onde createdAt também é null
          const additionalUpdate = await prisma.$runCommandRaw({
            update: model.collection,
            updates: [
              {
                q: {
                  $or: [{ updatedAt: null }, { createdAt: null }],
                },
                u: {
                  $set: {
                    updatedAt: new Date(),
                    createdAt: new Date(),
                  },
                },
                multi: true,
              },
            ],
          });

          const additionalFixed = additionalUpdate.nModified || 0;
          totalFixed += additionalFixed;
          console.log(`✅ Correção adicional: ${additionalFixed} registros`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${model.name}:`, error.message);
      }
    }

    console.log(
      `\n🎉 Correção concluída! Total de registros corrigidos: ${totalFixed}`
    );

    // Verificação final em alguns modelos principais
    console.log('\n📋 Verificação final:');

    const verificationModels = ['composer', 'work', 'user'];

    for (const modelName of verificationModels) {
      try {
        const sampleRecords = await prisma[modelName].findMany({
          take: 3,
          select: {
            id: true,
            ...(modelName === 'composer' && { name: true }),
            ...(modelName === 'work' && { title: true }),
            ...(modelName === 'user' && { email: true }),
            createdAt: true,
            updatedAt: true,
          },
        });

        console.log(`\n${modelName.toUpperCase()} - Amostra:`);
        sampleRecords.forEach((record, index) => {
          const identifier =
            record.name || record.title || record.email || record.id;
          console.log(
            `  ${index + 1}. ${identifier}: createdAt=${
              record.createdAt
            }, updatedAt=${record.updatedAt}`
          );
        });
      } catch (error) {
        console.error(`❌ Erro na verificação de ${modelName}:`, error.message);
      }
    }

    // Verificar se ainda há problemas
    let hasRemainingIssues = false;

    for (const model of models) {
      try {
        const remainingResult = await prisma.$runCommandRaw({
          count: model.collection,
          query: { updatedAt: null },
        });

        const remainingCount = remainingResult.n || 0;
        if (remainingCount > 0) {
          console.log(
            `⚠️  ${model.name}: ainda há ${remainingCount} registros com problema`
          );
          hasRemainingIssues = true;
        }
      } catch (error) {
        // Ignore erros de verificação
      }
    }

    if (!hasRemainingIssues) {
      console.log(
        '\n🎉 Sucesso completo! Nenhum registro com updatedAt null encontrado.'
      );
      console.log('✅ Seu aplicativo deve funcionar normalmente agora.');
    } else {
      console.log(
        '\n⚠️  Alguns registros ainda têm problemas. Considere executar o script novamente.'
      );
    }
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a migração
fixUpdatedAtFields().catch(console.error);
