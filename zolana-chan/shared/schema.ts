import { sql } from "drizzle-orm";
import { pgTable, text, varchar, bigint, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const mixerDeposits = pgTable("mixer_deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commitment: text("commitment").notNull().unique(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  depositAddress: text("deposit_address").notNull(),
  depositSignature: text("deposit_signature").notNull().unique(),
  depositedAt: timestamp("deposited_at").notNull().defaultNow(),
  withdrawn: boolean("withdrawn").notNull().default(false),
  withdrawnAt: timestamp("withdrawn_at"),
});

export const insertMixerDepositSchema = createInsertSchema(mixerDeposits).omit({
  id: true,
  depositedAt: true,
  withdrawn: true,
  withdrawnAt: true,
});

export type InsertMixerDeposit = z.infer<typeof insertMixerDepositSchema>;
export type MixerDeposit = typeof mixerDeposits.$inferSelect;

export const mixerWithdrawals = pgTable("mixer_withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  depositId: varchar("deposit_id").notNull().references(() => mixerDeposits.id),
  recipientAddress: text("recipient_address").notNull(),
  withdrawalSignature: text("withdrawal_signature").notNull(),
  withdrawnAt: timestamp("withdrawn_at").notNull().defaultNow(),
});

export const insertMixerWithdrawalSchema = createInsertSchema(mixerWithdrawals).omit({
  id: true,
  withdrawnAt: true,
});

export type InsertMixerWithdrawal = z.infer<typeof insertMixerWithdrawalSchema>;
export type MixerWithdrawal = typeof mixerWithdrawals.$inferSelect;

export const mixerConfig = pgTable("mixer_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minimumAnonymitySet: integer("minimum_anonymity_set").notNull().default(3),
  minimumDelayMinutes: integer("minimum_delay_minutes").notNull().default(10),
  fixedDepositAmount: bigint("fixed_deposit_amount", { mode: "number" }).notNull().default(100000000),
});

export type MixerConfig = typeof mixerConfig.$inferSelect;
