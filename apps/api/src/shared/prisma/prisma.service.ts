import { Injectable, Optional, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export const DATABASE_URL_TOKEN = Symbol('DATABASE_URL');

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor(@Optional() @Inject(DATABASE_URL_TOKEN) url?: string) {
    const connectionString =
      url ?? process.env.DATABASE_URL ?? 'postgresql://dojo:dojo@localhost:5433/fullstack_dojo';
    const pool = new Pool({ connectionString });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
