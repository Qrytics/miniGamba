/**
 * Encryption utilities using Node.js built-in crypto module.
 *
 * encrypt/decrypt use AES-256-GCM with a per-message random IV so that the
 * same plaintext produces different ciphertext every time.
 * The output format is:  <iv_hex>:<authTag_hex>:<ciphertext_hex>
 *
 * The encryption key is derived from a constant application secret.  In a
 * production deployment you would source this from an environment variable or
 * the OS keychain; hardcoding a constant key still provides meaningful
 * protection against simple database snooping because the key is not stored
 * alongside the data.
 */

import * as nodeCrypto from 'crypto';

// 32-byte (256-bit) key used for AES-256-GCM.
// In production, replace with a secret sourced from process.env or a keychain.
const ENCRYPTION_KEY = nodeCrypto
  .createHash('sha256')
  .update('miniGamba-app-secret-key-v1')
  .digest(); // 32 bytes

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt a string with AES-256-GCM.
 * Returns a colon-delimited string: <iv>:<authTag>:<ciphertext> (all hex).
 */
export function encrypt(data: string): string {
  const iv = nodeCrypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = nodeCrypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a string previously encrypted with {@link encrypt}.
 * Throws if the ciphertext has been tampered with (GCM authentication failure).
 */
export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  const [ivHex, authTagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(dataHex, 'hex');

  const decipher = nodeCrypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Generate a cryptographically-secure UUID v4.
 */
export function generateUUID(): string {
  return nodeCrypto.randomUUID();
}

/**
 * Generate a cryptographically-secure friend code.
 * Format: GAMBA-XXXX-XXXX (alphanumeric, visually unambiguous characters).
 */
export function generateFriendCode(): string {
  // Omit look-alike characters (0/O, 1/I/l) for readability
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GAMBA-';

  for (let i = 0; i < 4; i++) {
    code += chars.charAt(nodeCrypto.randomInt(chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(nodeCrypto.randomInt(chars.length));
  }

  return code;
}

/**
 * Compute a SHA-256 hex digest of the given string.
 */
export function hash(data: string): string {
  return nodeCrypto.createHash('sha256').update(data, 'utf8').digest('hex');
}
