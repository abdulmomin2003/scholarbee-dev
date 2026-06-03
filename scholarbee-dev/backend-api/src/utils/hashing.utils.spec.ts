// RUN THIS FILE WITH: `npm run test:watch src/utils/hashing.utils.spec.ts` OR `npm test -- --testPathPattern=hashing.utils.spec.ts`
import { HashingUtils } from './hashing.utils';

describe('HashingUtils', () => {
  describe('Password Hashing', () => {
    it('should hash and verify passwords correctly', async () => {
      const password = 'testPassword123';

      // Hash the password
      const { hash, salt } = await HashingUtils.hashPassword({ password });

      // Verify the hash is a BCrypt hash
      expect(HashingUtils.isBcryptHash(hash)).toBe(true);
      expect(salt).toBeDefined();

      // Verify the password
      const isValid = await HashingUtils.verifyPassword(password, hash);
      expect(isValid).toBe(true);

      // Verify wrong password fails
      const isInvalid = await HashingUtils.verifyPassword(
        'wrongPassword',
        hash,
      );
      expect(isInvalid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';

      const { hash: hash1 } = await HashingUtils.hashPassword({ password });
      const { hash: hash2 } = await HashingUtils.hashPassword({ password });

      // BCrypt should generate different hashes due to different salts
      expect(hash1).not.toBe(hash2);

      // But both should verify correctly
      expect(await HashingUtils.verifyPassword(password, hash1)).toBe(true);
      expect(await HashingUtils.verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('Token Hashing', () => {
    it('should hash and verify tokens correctly', () => {
      const token = 'testToken123';

      // Hash the token
      const hash = HashingUtils.hashToken(token);

      // Verify the hash is a SHA-256 hash
      expect(HashingUtils.isSha256Hash(hash)).toBe(true);

      // Verify the token
      const isValid = HashingUtils.verifyToken({ token, hash });
      expect(isValid).toBe(true);

      // Verify wrong token fails
      const isInvalid = HashingUtils.verifyToken({ token: 'wrongToken', hash });
      expect(isInvalid).toBe(false);
    });

    it('should generate same hash for same token', () => {
      const token = 'testToken123';

      const hash1 = HashingUtils.hashToken(token);
      const hash2 = HashingUtils.hashToken(token);

      // SHA-256 should generate same hash for same input
      expect(hash1).toBe(hash2);
    });
  });

  describe('Token Generation', () => {
    it('should generate random tokens', () => {
      const token1 = HashingUtils.generateRandomToken();
      const token2 = HashingUtils.generateRandomToken();

      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes = 64 hex characters
      expect(token2.length).toBe(64);
    });

    it('should generate tokens with custom length', () => {
      const token = HashingUtils.generateRandomToken(16);
      expect(token.length).toBe(32); // 16 bytes = 32 hex characters
    });
  });

  describe('Hash Type Detection', () => {
    it('should detect BCrypt hashes', () => {
      const bcryptHash = '$2b$10$abcdefghijklmnopqrstuvwxyz123456';
      expect(HashingUtils.isBcryptHash(bcryptHash)).toBe(true);
      expect(HashingUtils.isBcryptHash('not-a-bcrypt-hash')).toBe(false);
    });

    it('should detect SHA-256 hashes', () => {
      const sha256Hash = 'a'.repeat(64); // 64 hex characters
      expect(HashingUtils.isSha256Hash(sha256Hash)).toBe(true);
      expect(HashingUtils.isSha256Hash('not-a-sha256-hash')).toBe(false);
    });
  });
});
