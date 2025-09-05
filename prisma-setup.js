const { execSync } = require('child_process');

async function setupPrisma() {
  try {
    console.log('🔄 Gerando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🔄 Sincronizando schema com banco...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Prisma setup concluído!');
  } catch (error) {
    console.error('❌ Erro no setup do Prisma:', error.message);
    process.exit(1);
  }
}

setupPrisma();
