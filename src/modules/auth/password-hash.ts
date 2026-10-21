import * as argon2 from 'argon2';
import { compare } from 'bcryptjs';

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  if (hash.startsWith('$argon2id$')) return argon2.verify(hash, password);
  if (/^\$2[aby]\$/.test(hash)) return compare(password, hash);
  return Promise.resolve(false);
}
