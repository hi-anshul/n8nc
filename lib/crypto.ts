import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// We expect a 32 character / 32 byte string in the environment variables
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY;

/**
 * Encrypts a string using AES-256-GCM.
 * @returns A string in the format `iv:authTag:ciphertext`
 */
export function encryptToken(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY is not defined in environment variables');
  }

  // Ensure key is exactly 32 bytes
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  
  // 16 bytes is standard for AES
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return iv:tag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string that was encrypted by `encryptToken`.
 */
export function decryptToken(encryptedData: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY is not defined in environment variables');
  }

  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = Buffer.from(parts[2], 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
