import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // <--- AQUI ERA O ERRO (agora está correto)
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Cria o Pool de conexão usando o driver nativo 'pg'
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Conecta o Prisma ao driver do Postgres
    const adapter = new PrismaPg(pool);

    // Inicializa o Prisma Client usando o adapter
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
