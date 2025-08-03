/**
 * Secure Token Storage
 * Provides secure storage and retrieval of authentication tokens
 */

import { encrypt, decrypt, isEncrypted } from '@/lib/utils/encryption';
import { prisma } from '@/lib/db/prisma';

/**
 * Store a token securely in the database
 * @param userId The user ID
 * @param tokenType The type of token (e.g., 'github', 'openai')
 * @param token The token to store
 */
export async function storeToken(
  userId: string,
  tokenType: string,
  token: string
): Promise<void> {
  try {
    // Encrypt the token before storing
    const encryptedToken = encrypt(token);
    
    // Store or update the token in the database
    await prisma.userToken.upsert({
      where: {
        userId_tokenType: {
          userId,
          tokenType,
        },
      },
      update: {
        token: encryptedToken,
        updatedAt: new Date(),
      },
      create: {
        userId,
        tokenType,
        token: encryptedToken,
      },
    });
  } catch (error) {
    console.error(`Error storing ${tokenType} token:`, error);
    throw new Error(`Failed to store ${tokenType} token`);
  }
}

/**
 * Retrieve a token from secure storage
 * @param userId The user ID
 * @param tokenType The type of token (e.g., 'github', 'openai')
 * @returns The decrypted token or null if not found
 */
export async function getToken(
  userId: string,
  tokenType: string
): Promise<string | null> {
  try {
    // Get the encrypted token from the database
    const tokenRecord = await prisma.userToken.findUnique({
      where: {
        userId_tokenType: {
          userId,
          tokenType,
        },
      },
    });
    
    if (!tokenRecord) {
      return null;
    }
    
    // Decrypt the token before returning
    return decrypt(tokenRecord.token);
  } catch (error) {
    console.error(`Error retrieving ${tokenType} token:`, error);
    return null;
  }
}

/**
 * Delete a token from secure storage
 * @param userId The user ID
 * @param tokenType The type of token (e.g., 'github', 'openai')
 */
export async function deleteToken(
  userId: string,
  tokenType: string
): Promise<void> {
  try {
    await prisma.userToken.delete({
      where: {
        userId_tokenType: {
          userId,
          tokenType,
        },
      },
    });
  } catch (error) {
    console.error(`Error deleting ${tokenType} token:`, error);
    // Don't throw an error if the token doesn't exist
  }
}

/**
 * Check if a token exists and is valid
 * @param userId The user ID
 * @param tokenType The type of token (e.g., 'github', 'openai')
 * @returns True if the token exists
 */
export async function hasValidToken(
  userId: string,
  tokenType: string
): Promise<boolean> {
  try {
    const token = await getToken(userId, tokenType);
    return !!token;
  } catch (error) {
    return false;
  }
}

/**
 * Rotate a token (generate a new one and replace the old one)
 * @param userId The user ID
 * @param tokenType The type of token (e.g., 'github', 'openai')
 * @param newToken The new token to store
 */
export async function rotateToken(
  userId: string,
  tokenType: string,
  newToken: string
): Promise<void> {
  try {
    // Store the new token
    await storeToken(userId, tokenType, newToken);
    
    // Log the token rotation for audit purposes
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TOKEN_ROTATION',
        entityType: 'USER_TOKEN',
        entityId: userId,
        description: `Rotated ${tokenType} token`,
      },
    });
  } catch (error) {
    console.error(`Error rotating ${tokenType} token:`, error);
    throw new Error(`Failed to rotate ${tokenType} token`);
  }
}