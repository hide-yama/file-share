import { generateRandomString } from './format';

export function generatePassword(length: number = 12): string {
  return generateRandomString(length);
}

export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  if (password.length < 8 || password.length > 128) {
    return false;
  }
  
  const validChars = /^[a-zA-Z0-9]+$/;
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