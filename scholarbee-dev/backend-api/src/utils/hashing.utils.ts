import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

/**
 * Hashing utility class that provides consistent methods for different types of hashing
 * - Passwords: BCrypt (salt-based, slow, secure)
 * - Tokens: SHA-256 (fast, deterministic, good for verification)
 */
export class HashingUtils {
  /**
   * Hash a password using BCrypt (secure for passwords)
   * @param password - The plain text password
   * @param saltRounds - Number of salt rounds (default: 10)
   * @returns Object containing hash and salt
   */
  static async hashPassword({
    password,
    saltRounds = 10,
  }: {
    password: string;
    saltRounds?: number;
  }): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  /**
   * Verify a password against a BCrypt hash
   * @param password - The plain text password to verify
   * @param hash - The BCrypt hash to compare against
   * @returns True if password matches, false otherwise
   */
  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Hash a token using SHA-256 (fast and deterministic)
   * @param token - The token to hash
   * @returns The SHA-256 hash of the token
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify a token against a SHA-256 hash
   * @param token - The token to verify
   * @param hash - The SHA-256 hash to compare against
   * @returns True if token matches, false otherwise
   */
  static verifyToken({
    token,
    hash,
  }: {
    token: string;
    hash: string;
  }): boolean {
    try {
      const tokenHash = this.hashToken(token);
      return tokenHash === hash;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Generate a cryptographically secure random token
   * @param bytes - Number of bytes for the token (default: 32)
   * @returns A random hex string
   */
  static generateRandomToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  // random token with expiration date
  static generateRandomTokenWithExpiration({
    bytes = 32,
    expirationMinutes = 10,
  }: {
    bytes?: number;
    expirationMinutes?: number;
  }) {
    const token = this.generateRandomToken(bytes);
    const expiration = new Date(Date.now() + expirationMinutes * 60 * 1000);
    return { token, expiration };
  }

  /**
   * Check if a hash is a BCrypt hash
   * @param hash - The hash to check
   * @returns True if it's a BCrypt hash
   */
  static isBcryptHash(hash: string): boolean {
    return (
      hash.startsWith('$2a$') ||
      hash.startsWith('$2b$') ||
      hash.startsWith('$2y$')
    );
  }

  /**
   * Check if a hash is a SHA-256 hash
   * @param hash - The hash to check
   * @returns True if it's a SHA-256 hash (64 characters hex)
   */
  static isSha256Hash(hash: string): boolean {
    return /^[a-f0-9]{64}$/i.test(hash);
  }
}
