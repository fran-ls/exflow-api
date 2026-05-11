import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { envs } from '../config/envs';

class Database {
  private pool: Pool;
  private adapter: PrismaPg;
  public prisma: PrismaClient;
  private static instance: Database;

  private constructor() {
    this.pool = new Pool({
      connectionString: envs.DATABASE_URL
    });
    this.adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({
      adapter: this.adapter
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    await this.prisma.$connect();
    console.log('✅ Database connected');
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

export const db = Database.getInstance();
export const prisma = db.prisma;