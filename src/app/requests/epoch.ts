// app/requests/epochs.ts
import prisma from '@/app/libs/prismadb';

export default async function getAllEpochs() {
  try {
    const epochs = await prisma.epoch.findMany({});

    return epochs;
    // eslint-disable-next-line
  } catch (error: any) {
    throw new Error(error);
  }
}
