/**
 * Crypto utilities for password hashing and verification
 * Uses Web Crypto API for secure password hashing
 */

/**
 * Hash a password using SHA-256
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hex-encoded hash string
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a stored hash
 * @param password - The plain text password to verify
 * @param hash - The stored hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
