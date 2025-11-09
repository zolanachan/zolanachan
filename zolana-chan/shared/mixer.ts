import { createHash, randomBytes } from 'crypto';

/**
 * Commitment-based privacy mixer utilities
 * 
 * Privacy model:
 * 1. User generates secret + nullifier
 * 2. Creates commitment = hash(secret + nullifier)
 * 3. Deposits SOL with commitment
 * 4. Later, proves ownership by revealing secret + nullifier
 * 5. Withdraws to different address (breaks link)
 */

export interface MixerNote {
  secret: string;          // 32-byte random value (hex)
  nullifier: string;       // 32-byte random value (hex)
  commitment: string;      // SHA-256 hash of secret + nullifier
  depositAmount: number;   // Amount in lamports
}

/**
 * Generate a new random mixer note
 */
export function generateMixerNote(depositAmount: number): MixerNote {
  const secret = randomBytes(32).toString('hex');
  const nullifier = randomBytes(32).toString('hex');
  const commitment = generateCommitment(secret, nullifier);
  
  return {
    secret,
    nullifier,
    commitment,
    depositAmount,
  };
}

/**
 * Generate commitment hash from secret and nullifier
 */
export function generateCommitment(secret: string, nullifier: string): string {
  const data = Buffer.concat([
    Buffer.from(secret, 'hex'),
    Buffer.from(nullifier, 'hex'),
  ]);
  
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Verify that a secret and nullifier produce the expected commitment
 */
export function verifyCommitment(
  secret: string,
  nullifier: string,
  expectedCommitment: string
): boolean {
  const actualCommitment = generateCommitment(secret, nullifier);
  return actualCommitment === expectedCommitment;
}

/**
 * Serialize mixer note to string for storage/transmission
 */
export function serializeMixerNote(note: MixerNote): string {
  return JSON.stringify(note);
}

/**
 * Parse mixer note from string
 */
export function parseMixerNote(serialized: string): MixerNote {
  return JSON.parse(serialized);
}

/**
 * Convert mixer note to QR-friendly format (base64)
 */
export function noteToBase64(note: MixerNote): string {
  const json = serializeMixerNote(note);
  return Buffer.from(json).toString('base64');
}

/**
 * Parse mixer note from base64
 */
export function noteFromBase64(base64: string): MixerNote {
  const json = Buffer.from(base64, 'base64').toString('utf-8');
  return parseMixerNote(json);
}

/**
 * Calculate minimum time delay for withdrawal (in milliseconds)
 */
export function calculateMinimumWithdrawalTime(
  depositTime: Date,
  minimumDelayMinutes: number
): Date {
  return new Date(depositTime.getTime() + minimumDelayMinutes * 60 * 1000);
}

/**
 * Check if enough time has passed for withdrawal
 */
export function canWithdraw(
  depositTime: Date,
  minimumDelayMinutes: number
): boolean {
  const now = new Date();
  const minimumTime = calculateMinimumWithdrawalTime(depositTime, minimumDelayMinutes);
  return now >= minimumTime;
}

/**
 * Calculate time remaining until withdrawal is allowed
 */
export function timeUntilWithdrawal(
  depositTime: Date,
  minimumDelayMinutes: number
): number {
  const minimumTime = calculateMinimumWithdrawalTime(depositTime, minimumDelayMinutes);
  const now = new Date();
  const remaining = minimumTime.getTime() - now.getTime();
  return Math.max(0, remaining);
}
