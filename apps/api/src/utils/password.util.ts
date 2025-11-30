import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Password utility for hashing, comparing, and generating passwords
 */
class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;
  private static readonly DEFAULT_PASSWORD_LENGTH = 12;

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

  /**
   * Generate a secure random password
   * @param length - Password length (default: 12)
   * @returns Generated password
   */
  public static generatePassword(length: number = this.DEFAULT_PASSWORD_LENGTH): string {
    // Use crypto.randomBytes for secure random generation
    const bytes = crypto.randomBytes(length);
    // Convert to base64 and remove special characters, then take first 'length' characters
    const password = bytes.toString('base64')
      .replace(/[+/=]/g, '') // Remove base64 special characters
      .substring(0, length);
    
    // Ensure password has at least one uppercase, lowercase, and number
    // If not, regenerate (very unlikely but safe)
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      // Add required characters
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      
      const chars = password.split('');
      chars[0] = uppercase[Math.floor(Math.random() * uppercase.length)];
      chars[1] = lowercase[Math.floor(Math.random() * lowercase.length)];
      chars[2] = numbers[Math.floor(Math.random() * numbers.length)];
      
      // Shuffle the array
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      
      return chars.join('').substring(0, length);
    }
    
    return password;
  }
}

export default PasswordUtil;

