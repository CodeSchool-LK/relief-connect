import bcrypt from 'bcrypt';

/**
 * Password utility for hashing and comparing passwords
 */
class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a password
   * @param password - Plain text password
   * @returns Hashed password
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare plain text password with hashed password
   * @param plainPassword - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns True if passwords match, false otherwise
   */
  public static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default PasswordUtil;

