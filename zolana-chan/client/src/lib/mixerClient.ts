/**
 * Browser-compatible mixer cryptography using Web Crypto API
 */

export interface MixerNote {
  secret: string;          // 32-byte random value (hex)
  nullifier: string;       // 32-byte random value (hex)
  commitment: string;      // SHA-256 hash of secret + nullifier
  depositAmount: number;   // Amount in lamports
}

/**
 * Generate random hex string using Web Crypto API
 */
async function randomHex(bytes: number): Promise<string> {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate commitment hash from secret and nullifier using Web Crypto API
 */
export async function generateCommitment(secret: string, nullifier: string): Promise<string> {
  const secretBytes = hexToBytes(secret);
  const nullifierBytes = hexToBytes(nullifier);
  
  // Concatenate secret + nullifier
  const combined = new Uint8Array(secretBytes.length + nullifierBytes.length);
  combined.set(secretBytes, 0);
  combined.set(nullifierBytes, secretBytes.length);
  
  // Hash with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hashArray = new Uint8Array(hashBuffer);
  
  return bytesToHex(hashArray);
}

/**
 * Generate a new random mixer note
 */
export async function generateMixerNote(depositAmount: number): Promise<MixerNote> {
  const secret = await randomHex(32);
  const nullifier = await randomHex(32);
  const commitment = await generateCommitment(secret, nullifier);
  
  return {
    secret,
    nullifier,
    commitment,
    depositAmount,
  };
}

/**
 * Verify that a secret and nullifier produce the expected commitment
 */
export async function verifyCommitment(
  secret: string,
  nullifier: string,
  expectedCommitment: string
): Promise<boolean> {
  const actualCommitment = await generateCommitment(secret, nullifier);
  return actualCommitment === expectedCommitment;
}

/**
 * Serialize mixer note to JSON string
 */
export function serializeMixerNote(note: MixerNote): string {
  return JSON.stringify(note);
}

/**
 * Parse mixer note from JSON string
 */
export function parseMixerNote(serialized: string): MixerNote {
  return JSON.parse(serialized);
}

/**
 * Convert mixer note to base64 for easy copying
 */
export function noteToBase64(note: MixerNote): string {
  const json = serializeMixerNote(note);
  return btoa(json);
}

/**
 * Parse mixer note from base64
 */
export function noteFromBase64(base64: string): MixerNote {
  const json = atob(base64);
  return parseMixerNote(json);
}

/**
 * Calculate minimum time for withdrawal
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
 * Calculate time remaining until withdrawal is allowed (in milliseconds)
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
