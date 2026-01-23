import { Global, Module } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: async () => {
        const connectionString = `${process.env.DATABASE_URL}`;
        const adapter = new PrismaPg({ connectionString });
        const prisma = new PrismaClient({ adapter } as any);
        await prisma.$connect();
        return prisma;
      },
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule {}
