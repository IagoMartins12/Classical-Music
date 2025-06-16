// app/libs/prismadb.ts (certifique-se de que está correto)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// import { PrismaClient } from '@prisma/client';

// declare global {
//   // eslint-disable-next-line
//   var prisma: PrismaClient | undefined;
// }

// const client = globalThis.prisma || new PrismaClient();
// if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;

// export default client;
