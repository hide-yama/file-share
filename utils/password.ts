import { generateRandomString } from './format';

export function generatePassword(length: number = 4): string {
  // 4文字の小文字アルファベットのみのパスワードを生成
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // 4文字の小文字アルファベットのみを許可
  if (password.length !== 4) {
    return false;
  }
  
  const validChars = /^[a-z]+$/;
  return validChars.test(password);
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('Password hashing should only be done on the server side');
  }
  
  try {
    const bcrypt = await import('bcryptjs');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Failed to hash password:', error);
    throw new Error('Password hashing failed');
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('Password verification should only be done on the server side');
  }
  
  try {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Failed to verify password:', error);
    return false;
  }
}