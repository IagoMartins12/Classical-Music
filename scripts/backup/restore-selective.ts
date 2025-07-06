// scripts/restore-selective.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Script para restaurar apenas collections específicas
async function restoreSelective(
  backupPath: string,
  collections: string[]
): Promise<void> {
  console.log(`🎯 Restauração seletiva: ${collections.join(', ')}`);

  try {
    const backupContent = await fs.readFile(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);

    for (const collection of collections) {
      const data = backupData.data[collection];

      if (!data || !Array.isArray(data)) {
        console.log(`⚠️  Collection '${collection}' não encontrada no backup`);
        continue;
      }

      console.log(
        `📥 Restaurando ${data.length} registros em ${collection}...`
      );

      // @ts-ignore
      await prisma[collection].createMany({
        data: data,
        skipDuplicates: true,
      });

      console.log(`✓ ${collection} restaurado`);
    }

    console.log('✅ Restauração seletiva concluída!');
  } catch (error) {
    console.error('❌ Erro na restauração seletiva:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exportar para uso em CLI
if (require.main === module) {
  const backupPath = process.argv[2];
  const collections = process.argv.slice(3);

  if (!backupPath || collections.length === 0) {
    console.log(
      'Uso: tsx scripts/restore-selective.ts <backup-path> <collection1> [collection2] ...'
    );
    process.exit(1);
  }

  restoreSelective(backupPath, collections);
}
