import bcrypt from 'bcryptjs';

export class HashUtil {
  private static readonly SALT_ROUNDS = 12;

  static async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.SALT_ROUNDS);
  }

  static async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}