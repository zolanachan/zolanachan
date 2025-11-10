import { 
  type User, 
  type InsertUser,
  type MixerDeposit,
  type InsertMixerDeposit,
  type MixerWithdrawal,
  type InsertMixerWithdrawal,
  type MixerConfig,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mixer operations
  createDeposit(deposit: InsertMixerDeposit): Promise<MixerDeposit>;
  getDepositByCommitment(commitment: string): Promise<MixerDeposit | undefined>;
  getUnwithdrawnDeposits(): Promise<MixerDeposit[]>;
  getUnwithdrawnDepositsCount(): Promise<number>;
  markDepositAsWithdrawn(depositId: string, withdrawnAt: Date): Promise<boolean>;
  revertWithdrawal(depositId: string): Promise<void>;
  
  createWithdrawal(withdrawal: InsertMixerWithdrawal): Promise<MixerWithdrawal>;
  getWithdrawalsByDeposit(depositId: string): Promise<MixerWithdrawal[]>;
  
  getMixerConfig(): Promise<MixerConfig>;
  updateMixerConfig(config: Partial<MixerConfig>): Promise<MixerConfig>;
}

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import * as schema from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async createDeposit(deposit: InsertMixerDeposit): Promise<MixerDeposit> {
    const [created] = await db.insert(schema.mixerDeposits).values(deposit).returning();
    return created;
  }

  async getDepositByCommitment(commitment: string): Promise<MixerDeposit | undefined> {
    const [deposit] = await db.select().from(schema.mixerDeposits).where(eq(schema.mixerDeposits.commitment, commitment));
    return deposit;
  }

  async getUnwithdrawnDeposits(): Promise<MixerDeposit[]> {
    return db.select().from(schema.mixerDeposits).where(eq(schema.mixerDeposits.withdrawn, false));
  }

  async getUnwithdrawnDepositsCount(): Promise<number> {
    const deposits = await this.getUnwithdrawnDeposits();
    return deposits.length;
  }

  async markDepositAsWithdrawn(depositId: string, withdrawnAt: Date): Promise<boolean> {
    const result = await db.update(schema.mixerDeposits)
      .set({ withdrawn: true, withdrawnAt })
      .where(
        and(
          eq(schema.mixerDeposits.id, depositId),
          eq(schema.mixerDeposits.withdrawn, false)
        )
      )
      .returning();
    
    return result.length > 0;
  }

  async revertWithdrawal(depositId: string): Promise<void> {
    await db.update(schema.mixerDeposits)
      .set({ withdrawn: false, withdrawnAt: null })
      .where(eq(schema.mixerDeposits.id, depositId));
  }

  async createWithdrawal(withdrawal: InsertMixerWithdrawal): Promise<MixerWithdrawal> {
    const [created] = await db.insert(schema.mixerWithdrawals).values(withdrawal).returning();
    return created;
  }

  async getWithdrawalsByDeposit(depositId: string): Promise<MixerWithdrawal[]> {
    return db.select().from(schema.mixerWithdrawals).where(eq(schema.mixerWithdrawals.depositId, depositId));
  }

  async getMixerConfig(): Promise<MixerConfig> {
    const configs = await db.select().from(schema.mixerConfig);
    
    if (configs.length === 0) {
      const [config] = await db.insert(schema.mixerConfig).values({}).returning();
      return config;
    }
    
    return configs[0];
  }

  async updateMixerConfig(updates: Partial<MixerConfig>): Promise<MixerConfig> {
    const config = await this.getMixerConfig();
    const [updated] = await db.update(schema.mixerConfig)
      .set(updates)
      .where(eq(schema.mixerConfig.id, config.id))
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
