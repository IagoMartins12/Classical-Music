// test-prisma-connection.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Habilitar logs para debug
});

async function testPrismaConnection() {
  try {
    console.log('🔄 Testando conexão com Prisma...');

    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    // Testar inserção básica em cada collection principal
    const tests = [
      {
        name: 'Epoch',
        test: async () => {
          const epoch = await prisma.epoch.create({
            data: { name: 'Test Epoch' },
          });
          console.log('✅ Epoch criado:', epoch.id);
          await prisma.epoch.delete({ where: { id: epoch.id } });
          console.log('✅ Epoch deletado');
        },
      },
      {
        name: 'Role',
        test: async () => {
          const role = await prisma.role.create({
            data: { name: 'Test Role' },
          });
          console.log('✅ Role criado:', role.id);
          await prisma.role.delete({ where: { id: role.id } });
          console.log('✅ Role deletado');
        },
      },
      {
        name: 'Instrument',
        test: async () => {
          const instrument = await prisma.instrument.create({
            data: { name: 'Test Instrument' },
          });
          console.log('✅ Instrument criado:', instrument.id);
          await prisma.instrument.delete({ where: { id: instrument.id } });
          console.log('✅ Instrument deletado');
        },
      },
      {
        name: 'WorkGenre',
        test: async () => {
          const workGenre = await prisma.workGenre.create({
            data: { name: 'Test Genre' },
          });
          console.log('✅ WorkGenre criado:', workGenre.id);
          await prisma.workGenre.delete({ where: { id: workGenre.id } });
          console.log('✅ WorkGenre deletado');
        },
      },
      {
        name: 'User',
        test: async () => {
          const user = await prisma.user.create({
            data: {
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
            },
          });
          console.log('✅ User criado:', user.id);
          await prisma.user.delete({ where: { id: user.id } });
          console.log('✅ User deletado');
        },
      },
    ];

    for (const testCase of tests) {
      console.log(`\n📝 Testando ${testCase.name}...`);
      try {
        await testCase.test();
      } catch (error) {
        console.error(`❌ Erro em ${testCase.name}:`, error.message);
        if (error.code) {
          console.error(`   Código: ${error.code}`);
        }
      }
    }

    console.log('\n🎉 Testes concluídos!');
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
